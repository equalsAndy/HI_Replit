# AST Report Payload v2.3 Implementation

**Status**: ✅ Complete
**Date**: January 2025
**Environment**: Development

## Overview

Successfully implemented the AST Report Payload Specification v2.3, transitioning from text-based prompts to structured JSON payloads for section-by-section report generation.

## Implementation Summary

### 1. Created Payload Builder Service

**File**: `server/services/ast-payload-builder-service.ts` (NEW)

**Purpose**: Builds stateless, section-specific JSON payloads containing all data needed for AI report generation.

**Key Features**:
- Implements complete v2.3 specification
- Stateless payload design (no cross-section dependencies)
- Comprehensive data gathering from multiple tables
- Shape calculation with ±2% equivalence margin
- Field ID to database column mapping

**Key Methods**:
```typescript
async buildSectionPayload(
  userId: string,
  reportType: 'ast_personal' | 'ast_professional',
  sectionId: number
): Promise<SectionPayload>

// Data builders for each section type
private async buildStrengthsData(userData: any): Promise<any>
private async buildStrengthReflections(userId: string): Promise<any>
private async buildFlowData(userId: string): Promise<any>
private async buildWellbeingData(userId: string): Promise<any>
private async buildFutureSelfData(userId: string): Promise<any>
private async buildFinalReflection(userId: string): Promise<any>
```

### 2. Updated Section Generation Service

**File**: `server/services/ast-sectional-report-service.ts` (MODIFIED)

**Changes**:
1. Added import for `astPayloadBuilderService`
2. Created new method: `generateSectionContentWithPayload()`
3. Modified `generateSingleSection()` to:
   - Call payload builder service
   - Pass structured JSON to OpenAI assistant
   - Store complete payload in `ai_request_payload` column

**Integration Points**:
```typescript
// In generateSingleSection() method (lines 347-403)
const payload = await astPayloadBuilderService.buildSectionPayload(
  userId,
  reportType,
  sectionId
);

const { content: rawContent, aiRequestPayload } =
  await this.generateSectionContentWithPayload(
    payload,
    sectionDef,
    reportType
  );
```

### 3. Payload Structure (v2.3)

Complete JSON payload sent to OpenAI assistant:

```json
{
  "report_type": "ast_personal",
  "section": {
    "id": 2,
    "name": "flow_experiences",
    "title": "Flow State Analysis & Optimization",
    "workshop_steps": ["2-2", "2-3"]
  },
  "participant": {
    "id": 76,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "strengths": {
    "thinking": 27,
    "acting": 25,
    "feeling": 31,
    "planning": 17,
    "ranked": ["feeling", "thinking", "acting", "planning"],
    "shape": {
      "label": "One High",
      "percent_equivalence_margin": 2,
      "roles": {
        "dominant": ["feeling"],
        "supporting": ["thinking", "acting"],
        "quieter": ["planning"]
      }
    }
  },
  "flow": {
    "assessment": {
      "total_score": 48,
      "interpretation": "Flow Aware",
      "responses": []
    },
    "attributes": [
      { "name": "Dynamic", "order": 1 },
      { "name": "Punctual", "order": 2 },
      { "name": "Receptive", "order": 3 },
      { "name": "Encouraging", "order": 4 }
    ],
    "reflections": {
      "flow-1": {
        "field_id": "flow-1",
        "db_field_name": "strengths",
        "alias": "flow_naturally",
        "question": "When does flow happen most naturally for you?",
        "answer": "..."
      }
    }
  },
  "policies": {
    "tone_integrity": true,
    "use_speculative_language": true,
    "no_predictions": true,
    "no_advice_or_checklists": true,
    "avoid_clinical_phrasing": true,
    "imagination_as_integrator": true,
    "forbid_attribute_fallbacks": true,
    "forbid_shape_inference": true
  }
}
```

## Data Sources & Mapping

### Database Tables Used

| Table | Purpose | Fields Retrieved |
|-------|---------|------------------|
| `users` | Participant info | id, name, email |
| `user_assessments` | Strengths percentages | results (JSON) where assessment_type = 'starCard' |
| `workshop_step_data` | Reflections | data (JSONB) for steps 2-1, 2-3, 3-1, 3-2, 3-3 |
| `flow_attributes` | Flow word selections | attributes (JSONB array) |

### Field ID Mappings

**Strength Reflections (Step 2-1)**:
```
strength-1 → strength1
strength-2 → strength2
strength-3 → strength3
strength-4 → strength4
imagination → imaginationReflection
team-values → teamValues
unique-contribution → uniqueContribution
```

**Flow Reflections (Step 2-3)**:
```
flow-1 → strengths (When does flow happen?)
flow-2 → values (What blocks flow?)
flow-3 → passions (What helps flow?)
flow-4 → growthAreas (How to create more flow?)
```

**Well-Being Reflections (Step 3-1)**:
```
wellbeing-1 → currentFactors
wellbeing-2 → futureImprovements
wellbeing-3 → specificChanges
wellbeing-4 → quarterlyProgress
wellbeing-5 → quarterlyActions
```

**Future Self Reflections (Step 3-2)**:
```
image-meaning → imageMeaning
future-self-1 → reflections['future-self-1']
```

**Final Reflection (Step 3-3)**:
```
futureLetterText → futureLetterText
```

## Section-Specific Data Inclusion

| Section ID | Name | Data Included |
|------------|------|---------------|
| 1 | strengths_imagination | strengths, strength_reflections |
| 2 | flow_experiences | strengths, flow |
| 3 | strengths_flow_integration | strengths, flow |
| 4 | wellbeing_future_self | strengths, wellbeing, future_self |
| 5 | collaboration_closing | final_reflection |

## Shape Calculation Logic

**Algorithm**:
1. Apply ±2% equivalence margin to all strength values
2. Group strengths into roles:
   - **Dominant**: Values within 2% of highest
   - **Quieter**: Values within 2% of lowest
   - **Supporting**: All others
3. Determine label:
   - **Balanced**: Highest - lowest ≤ 4%
   - **One High**: Exactly 1 dominant, exactly 1 quieter
   - **Two Dominant**: Exactly 2 in dominant group
   - **One Quiet**: Exactly 1 in quieter group

## Testing & Validation

### Module Loading
- ✅ `ast-payload-builder-service.ts` loads successfully
- ✅ `ast-sectional-report-service.ts` loads successfully (with payload integration)

### Next Steps for Testing
1. Generate test report with real user data
2. Verify payload structure sent to OpenAI
3. Verify `ai_request_payload` column stores complete payload
4. Test section generation with v2.3 payloads
5. Validate OpenAI assistant response quality

## API Key Configuration

The implementation uses the same robust API key resolution as existing services:

```typescript
// Priority order
1. OPENAI_API_KEY
2. REPORT_OPENAI_API_KEY
3. OPENAI_KEY_TALIA_V1
4. OPENAI_KEY_TALIA_V2
```

## Storage

### AI Request Payload Storage

Complete payload stored in `report_sections.ai_request_payload` (JSONB):
```json
{
  "threadId": "thread_...",
  "runId": "run_...",
  "assistantId": "asst_rIvBIJ3iCAlHizeuUK77gIiN",
  "payloadVersion": "2.3",
  "structuredPayload": { /* complete v2.3 payload */ },
  "sectionDef": {
    "id": 2,
    "name": "flow_experiences",
    "title": "Flow State Analysis & Optimization",
    "description": "..."
  },
  "reportType": "ast_personal",
  "timestamp": "2025-01-XX...",
  "apiKeySource": "OPENAI_API_KEY"
}
```

## Error Handling

Maintains existing error handling patterns:
- OpenAI 500 errors → friendly message
- Timeout detection (10 minutes max)
- Automatic thread cleanup
- Detailed error logging

## Backward Compatibility

- Original `generateSectionContentDirectly()` method preserved
- Can switch between v2.3 payloads and legacy prompts if needed
- Database schema unchanged (using existing columns)

## Documentation References

- **Specification**: `AST_Report_Payload_Spec_v2_3.md`
- **Questions Reference**: `AST_Workshop_Questions_with_Field_IDs.md`
- **Original Service**: `server/services/ast-sectional-report-service.ts`

## Performance Considerations

- Single database query per data type (strengths, flow, wellbeing, etc.)
- Payload built once per section generation
- No cross-section dependencies (true stateless design)
- JSON serialization minimal overhead

## Known Limitations

1. OpenAI assistant must be updated to accept v2.3 JSON payloads
2. No validation that assistant instructions match v2.3 expectations
3. Flow assessment responses not yet captured (total_score and interpretation only)

## Future Enhancements

1. Add payload schema validation
2. Implement flow assessment response capture
3. Add payload versioning for backward compatibility
4. Create payload preview endpoint for debugging
5. Add automated tests for payload generation

---

**Implementation Status**: ✅ Ready for Testing
**Deployment Target**: Development → Staging → Production
**Next Action**: Test report generation with v2.3 payloads
