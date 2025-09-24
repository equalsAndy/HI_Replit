#!/usr/bin/env python3
"""
Python example for calling OpenAI API with transformed AST report data.
This demonstrates how to use the transformation logic in a Python environment.
"""

import json
import os
import sys
from typing import Dict, List, Optional, Any, Union
from openai import OpenAI

# Master prompt for the AST report assistant
MASTER_PROMPT = """You are an AI assistant specialized in generating personalized AST (AllStarTeams) reports. You will receive a JSON object containing participant data including strengths, flow assessment, reflections, and future self visualization.

Your task is to create a comprehensive, engaging report that:
1. Analyzes the participant's unique strengths profile
2. Integrates their flow assessment and optimization opportunities
3. Weaves in their personal reflections and future self vision
4. Provides actionable insights for personal and team development

The report should be warm, professional, and highly personalized. Avoid mentioning specific numbers or percentages from the raw data - instead, focus on narrative insights and meaningful patterns.

If you encounter a participant with mostly invalid reflections (indicated by reflections_invalid: true), acknowledge this gracefully and focus more heavily on the strengths and flow data while providing generic but helpful guidance.

Generate the report in markdown format with clear sections and engaging content."""

def is_likely_gibberish(text: str) -> bool:
    """
    Detects if text appears to be gibberish based on multiple criteria
    """
    if not text or len(text) < 6:
        return True

    # Check alphabetic ratio
    alpha_chars = sum(1 for c in text if c.isalpha())
    alpha_ratio = alpha_chars / len(text) if len(text) > 0 else 0
    if alpha_ratio < 0.6:
        return True

    # Check for long runs of non-letters
    import re
    non_letter_runs = re.findall(r'[^A-Za-z\s]{6,}', text)
    if non_letter_runs:
        return True

    # Check average token length
    tokens = [token for token in text.split() if len(token) > 0]
    if len(tokens) >= 10:
        avg_token_length = sum(len(token) for token in tokens) / len(tokens)
        if avg_token_length > 15:
            return True

    return False

def transform_strengths(star_card: Dict[str, Union[int, float]]) -> Dict[str, List[str]]:
    """
    Transforms star card percentages into relative strength groupings
    """
    if not star_card:
        return {"leading": [], "supporting": [], "quieter": []}

    # Sort by value descending
    entries = sorted(star_card.items(), key=lambda x: x[1], reverse=True)

    leading = []
    supporting = []
    quieter = []

    if not entries:
        return {"leading": leading, "supporting": supporting, "quieter": quieter}

    # Group by value to handle ties
    groups = []
    current_group = {"value": entries[0][1], "names": [entries[0][0]]}

    for name, value in entries[1:]:
        if value == current_group["value"]:
            current_group["names"].append(name)
        else:
            groups.append(current_group)
            current_group = {"value": value, "names": [name]}
    groups.append(current_group)

    # Distribute into buckets
    total_items = len(entries)
    assigned = 0

    for group in groups:
        remaining = total_items - assigned
        leading_needed = max(0, (total_items + 2) // 3 - len(leading))
        supporting_needed = max(0, (total_items + 2) // 3 - len(supporting))

        if leading_needed > 0 and assigned < total_items / 3:
            to_leading = min(len(group["names"]), leading_needed)
            leading.extend(group["names"][:to_leading])
            if len(group["names"]) > to_leading:
                supporting.extend(group["names"][to_leading:])
        elif supporting_needed > 0 and assigned < 2 * total_items / 3:
            supporting.extend(group["names"])
        else:
            quieter.extend(group["names"])

        assigned += len(group["names"])

    return {"leading": leading, "supporting": supporting, "quieter": quieter}

def build_flow_enablers_blockers(rounding_out: Dict[str, str]) -> Dict[str, List[str]]:
    """
    Builds flow enablers and blockers from rounding out reflection
    """
    enablers = []
    blockers = []

    if rounding_out.get("passions"):
        enablers.append(rounding_out["passions"])

    if rounding_out.get("strengths"):
        enablers.append(rounding_out["strengths"])

    # The "values" key often contains blockers despite the name
    if rounding_out.get("values"):
        blockers.append(rounding_out["values"])

    return {"enablers": enablers, "blockers": blockers}

def transform_export_to_assistant_input(
    export_data: Dict[str, Any],
    options: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Main transformation function from export format to assistant input format
    """
    if options is None:
        options = {}

    print("Starting transformation of export data to assistant input")

    # Set defaults
    report_type = options.get("report_type", "personal")
    imagination_mode = options.get("imagination_mode", "default")

    # Extract participant name
    user_info = export_data.get("userInfo", {})
    participant_name = (
        user_info.get("userName") or
        f"{user_info.get('firstName', '')} {user_info.get('lastName', '')}".strip() or
        "Participant"
    )

    assessments = export_data.get("assessments", {})

    # Transform strengths
    strengths = transform_strengths(assessments.get("starCard", {}))

    # Get flow score from correct source
    flow_assessment = assessments.get("flowAssessment", {})
    flow_attributes = assessments.get("flowAttributes", {})
    flow_score = flow_assessment.get("flowScore", 0) or flow_attributes.get("flowScore", 0)

    if (flow_attributes.get("flowScore") is not None and
        flow_assessment.get("flowScore") is not None and
        flow_attributes["flowScore"] != flow_assessment["flowScore"]):
        print("Using flowAssessment.flowScore over legacy flowAttributes.flowScore")

    # Transform flow attributes
    flow_attrs = flow_attributes.get("attributes", [])
    flow_attributes_list = [attr["name"] for attr in sorted(flow_attrs, key=lambda x: x.get("order", 0))]

    # Build flow enablers and blockers
    rounding_out = assessments.get("roundingOutReflection", {})
    flow_data = build_flow_enablers_blockers(rounding_out)

    # Transform reflections with key mapping
    step_reflections = assessments.get("stepByStepReflection", {})
    reflections = {
        "strength1": step_reflections.get("strength1", ""),
        "strength2": step_reflections.get("strength2", ""),
        "strength3": step_reflections.get("strength3", ""),
        "strength4": step_reflections.get("strength4", ""),
        "teamValues": step_reflections.get("teamValues", ""),
        "uniqueContribution": step_reflections.get("uniqueContribution", ""),
        "flowNatural": rounding_out.get("strengths", ""),
        "flowBlockers": rounding_out.get("values", ""),  # Misleading name, actually contains blockers
        "flowConditions": rounding_out.get("passions", ""),
        "flowOpportunities": rounding_out.get("growthAreas", "")
    }

    # Gibberish detection
    reflection_fields = [v for v in reflections.values() if len(v) > 0]
    invalid_fields = [field for field in reflection_fields if is_likely_gibberish(field)]
    reflections_invalid = (
        len(reflection_fields) > 0 and
        (len(invalid_fields) / len(reflection_fields)) >= 0.6
    )

    if reflections_invalid:
        print(f"Detected mostly gibberish reflections: {len(invalid_fields)}/{len(reflection_fields)} fields invalid")

    # Transform cantril ladder
    cantril_ladder = assessments.get("cantrilLadder", {})

    # Transform future self
    future_self_refl = assessments.get("futureSelfReflection", {})
    image_data = future_self_refl.get("imageData", {})

    selected_images = []
    for img in image_data.get("selectedImages", []):
        credit_parts = []
        if img.get("credit", {}).get("photographer"):
            credit_parts.append(img["credit"]["photographer"])
        if img.get("credit", {}).get("source"):
            credit_parts.append(img["credit"]["source"])

        selected_images.append({
            "url": img.get("url", ""),
            "credit": ", ".join(credit_parts)
        })

    future_self = {
        "flowOptimizedLife": future_self_refl.get("flowOptimizedLife", ""),
        "futureSelfDescription": future_self_refl.get("futureSelfDescription", ""),
        "visualizationNotes": future_self_refl.get("visualizationNotes", ""),
        "additionalNotes": future_self_refl.get("additionalNotes", ""),
        "selectedImages": selected_images,
        "imageMeaning": image_data.get("imageMeaning", "")
    }

    # Transform final reflection
    final_reflection = {
        "keyInsight": assessments.get("finalReflection", {}).get("futureLetterText", "")
    }

    # Build result
    result = {
        "report_type": report_type,
        "imagination_mode": imagination_mode,
        "participant_name": participant_name,
        "strengths": strengths,
        "flow": {
            "flowScore": flow_score,
            "flowAttributes": flow_attributes_list,
            "flowEnablers": flow_data["enablers"],
            "flowBlockers": flow_data["blockers"]
        },
        "reflections": reflections,
        "cantrilLadder": {
            "wellBeingLevel": cantril_ladder.get("wellBeingLevel", 0),
            "futureWellBeingLevel": cantril_ladder.get("futureWellBeingLevel", 0),
            "currentFactors": cantril_ladder.get("currentFactors", ""),
            "futureImprovements": cantril_ladder.get("futureImprovements", ""),
            "specificChanges": cantril_ladder.get("specificChanges", ""),
            "quarterlyProgress": cantril_ladder.get("quarterlyProgress", ""),
            "quarterlyActions": cantril_ladder.get("quarterlyActions", "")
        },
        "futureSelf": future_self,
        "finalReflection": final_reflection
    }

    if reflections_invalid:
        result["reflections_invalid"] = True

    print("Successfully transformed export data to assistant input")
    return result

def generate_ast_report(
    export_data: Dict[str, Any],
    transform_options: Optional[Dict[str, str]] = None,
    api_key: Optional[str] = None,
    model: str = "gpt-4o-mini",
    temperature: float = 0.7,
    max_tokens: int = 4000
) -> str:
    """
    Makes an OpenAI API call to generate an AST report with timing information
    """
    import time

    start_time = time.time()
    print("Starting AST report generation process")

    # Transform the export data
    transform_start_time = time.time()
    assistant_input = transform_export_to_assistant_input(export_data, transform_options)
    transform_duration = (time.time() - transform_start_time) * 1000  # Convert to ms
    print(f"Successfully transformed export data to assistant input ({transform_duration:.0f}ms)")

    # Initialize OpenAI client
    api_key = api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass api_key parameter.")

    client = OpenAI(api_key=api_key)

    try:
        # Make the API call
        api_start_time = time.time()
        response = client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {
                    "role": "system",
                    "content": MASTER_PROMPT
                },
                {
                    "role": "user",
                    "content": json.dumps(assistant_input, indent=2)
                }
            ]
        )
        api_duration = (time.time() - api_start_time) * 1000  # Convert to ms

        report = response.choices[0].message.content

        if not report:
            raise ValueError("No content returned from OpenAI API")

        total_duration = (time.time() - start_time) * 1000  # Convert to ms

        # Add timing information to the bottom of the report
        report_with_timing = f"""{report}

---

*Report generated in {format_duration(total_duration)} (Transform: {format_duration(transform_duration)}, AI Generation: {format_duration(api_duration)}) using {model}*"""

        print(f"Successfully generated AST report in {format_duration(total_duration)}")
        return report_with_timing

    except Exception as error:
        print(f"Error generating AST report: {error}")
        raise Exception(f"Failed to generate AST report: {error}")

def format_duration(ms: float) -> str:
    """
    Formats duration in milliseconds to a human-readable string
    """
    if ms < 1000:
        return f"{ms:.0f}ms"
    elif ms < 60000:
        return f"{ms / 1000:.1f}s"
    else:
        minutes = int(ms // 60000)
        seconds = (ms % 60000) / 1000
        return f"{minutes}m {seconds:.1f}s"

def example_usage():
    """
    Example usage with sample data
    """
    # Sample export data
    sample_export_data = {
        "userInfo": {
            "userName": "Testy Two",
            "firstName": "Testy",
            "lastName": "Two"
        },
        "assessments": {
            "starCard": {
                "thinking": 18,
                "feeling": 21,
                "acting": 34,
                "planning": 27
            },
            "flowAssessment": {
                "flowScore": 46
            },
            "flowAttributes": {
                "flowScore": 0,
                "attributes": [
                    {"name": "focus", "order": 1},
                    {"name": "challenge", "order": 2},
                    {"name": "skills", "order": 3}
                ]
            },
            "stepByStepReflection": {
                "strength1": "I excel at breaking down complex problems into manageable components",
                "strength2": "I thrive when working with passionate, dedicated team members",
                "strength3": "I bring strategic thinking and long-term planning to projects",
                "strength4": "I maintain high standards and attention to detail",
                "teamValues": "Trust, transparency, and mutual respect",
                "uniqueContribution": "Strategic analysis and systems thinking approach"
            },
            "roundingOutReflection": {
                "strengths": "I perform best in quiet, focused environments with minimal interruptions",
                "values": "Constant interruptions, unclear requirements, and rushed deadlines",
                "passions": "Working on meaningful projects that create lasting impact",
                "growthAreas": "Public speaking confidence and presentation skills"
            },
            "cantrilLadder": {
                "wellBeingLevel": 7,
                "futureWellBeingLevel": 9,
                "currentFactors": "Strong work-life balance and supportive team environment",
                "futureImprovements": "Enhanced leadership opportunities and skill development",
                "specificChanges": "Taking on team lead role and completing advanced training",
                "quarterlyProgress": "Complete leadership certification program",
                "quarterlyActions": "Enroll in presentation skills workshop and mentor junior team member"
            },
            "futureSelfReflection": {
                "flowOptimizedLife": "Leading a high-performing, innovative team that delivers exceptional results",
                "futureSelfDescription": "A confident, inspiring leader who empowers others while driving strategic initiatives",
                "visualizationNotes": "Standing confidently before my team, presenting our quarterly achievements",
                "additionalNotes": "Feeling energized by meaningful work and strong team connections",
                "imageData": {
                    "selectedImages": [
                        {
                            "url": "https://example.com/leadership-image.jpg",
                            "credit": {
                                "photographer": "Professional Photos",
                                "source": "Corporate Gallery"
                            }
                        }
                    ],
                    "imageMeaning": "This image represents the confident leadership presence I aspire to develop"
                }
            },
            "finalReflection": {
                "futureLetterText": "Dear Future Me, you have grown into the strategic leader you always knew you could become."
            }
        }
    }

    try:
        report = generate_ast_report(
            sample_export_data,
            {"report_type": "personal", "imagination_mode": "default"}
        )

        print("Generated Report:")
        print("================")
        print(report)
        return report

    except Exception as error:
        print(f"Example failed: {error}")
        raise

def show_assistant_input(export_data: Dict[str, Any], options: Optional[Dict[str, str]] = None):
    """
    Shows the exact assistant input that would be sent to the API
    """
    assistant_input = transform_export_to_assistant_input(export_data, options)
    print("Assistant Input JSON:")
    print("====================")
    print(json.dumps(assistant_input, indent=2))
    return assistant_input

if __name__ == "__main__":
    print("AST Report Generator Example (Python)")
    print("=====================================\n")

    # Show the assistant input format
    sample_data = {
        "userInfo": {"userName": "Test User"},
        "assessments": {
            "starCard": {"thinking": 25, "feeling": 25, "acting": 25, "planning": 25},
            "flowAssessment": {"flowScore": 50},
            "flowAttributes": {"flowScore": 0, "attributes": []},
            "stepByStepReflection": {},
            "roundingOutReflection": {},
            "cantrilLadder": {},
            "futureSelfReflection": {"imageData": {"selectedImages": []}},
            "finalReflection": {}
        }
    }

    show_assistant_input(sample_data)

    print("\nTo actually generate a report, set OPENAI_API_KEY and run:")
    print("python example_api_call.py")
    print("or call example_usage() in your code")