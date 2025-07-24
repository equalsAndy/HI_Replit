# Assessment Data Generator - Complete Specification

## Purpose
This specification provides the complete framework for generating realistic AllStar Teams workshop participant data that demonstrates Talia's AI coaching capabilities.

---

## Participant Profile Template

### Required Components
1. **Personal Information**: Name, role, location, background
2. **Strengths Profile**: Exact percentages for Thinking, Feeling, Acting, Planning (must total 100%)
3. **Flow Attributes**: Four specific attributes from approved word lists
4. **Assessment Responses**: Eight different assessment types with realistic responses
5. **Professional Context**: Industry-appropriate examples and language

---

## Assessment Structure

### 1. Star Card Assessment
```json
"starCard": {
  "thinking": "number (0-100)",
  "feeling": "number (0-100)", 
  "acting": "number (0-100)",
  "planning": "number (0-100)",
  "createdAt": "2025-06-08T01:34:24.754Z"
}
```
**CRITICAL**: Use exact percentages from participant bio - do not generate new values.

### 2. Step-by-Step Reflection
**Questions to Answer (2-4 sentences each, first person, work-specific examples)**:
- How does your first strength show up in daily work?
- When do you rely on your second strength most?
- How has your third strength helped overcome challenges?
- How does your fourth strength contribute to your unique value?
- What do you value most in team environments?
- What unique contribution do you bring to teams?

### 3. Flow Assessment 
**Rate 1-5 based on personality and role satisfaction**:
1. "I am completely absorbed in what I'm doing"
2. "I have a clear sense of what I want to accomplish"
3. "I know how well I am performing"
4. "I feel I can handle the demands of the situation"
5. "I lose track of time"
6. "The experience is extremely rewarding"
7. "My attention is completely focused"
8. "I feel in control of my actions"
9. "I am not worried about how others evaluate me"
10. "The way time passes seems to be different from normal"
11. "I really enjoy the experience"
12. "My abilities are well matched to the challenge"

**Scoring Guidelines**:
- High-engagement roles (creative, leadership): 45-55 total
- Moderate engagement: 35-45 total
- Lower engagement (stressed, transitioning): 25-35 total

### 4. Flow Attributes
```json
"flowAttributes": {
  "flowScore": 0,
  "attributes": [
    {"name": "AttributeName", "score": 100},
    {"name": "AttributeName", "score": 95},
    {"name": "AttributeName", "score": 90},
    {"name": "AttributeName", "score": 85}
  ]
}
```
**CRITICAL**: Use exact attributes from participant bio.

### 5. Rounding Out Reflection
**Questions (2-4 sentences each, honest and work-relevant)**:
- When does stress or distraction tend to show up?
- Which strengths do you need to nurture and why?
- How will you harness strengths for forward momentum?
- Additional growth areas or development focuses?

### 6. Cantril Ladder Assessment
**Current Well-being (1-10)**: Base on career stage, satisfaction, work-life balance
**Future Well-being (1-10)**: 1-2 points higher than current
**Text Responses (2-4 sentences each)**:
- Current contributing factors to well-being
- Improvements that would move you up the ladder
- Specific changes you'd like to make
- Quarterly progress indicators
- Quarterly actions you'll take

### 7. Future Self Reflection
**Questions (2-4 sentences each, optimistic but realistic)**:
- Where do you see yourself in 5, 10, 20 years?
- What does life look like when optimized for flow?
- Additional thoughts and reflections?

### 8. Final Reflection
**Future Letter (2-4 sentences, encouraging tone)**:
Write a letter to your future self reflecting on workshop insights and commitments.

---

## Flow Attribute Word Lists

### GREEN (Thinking/Strategic)
Analytic, Abstract, Astute, Big Picture, Curious, Focussed, Insightful, Investigative, Logical, Rational, Reflective, Sensible, Strategic, Thoughtful

### YELLOW (Structured/Organized)  
Detail-oriented, Diligent, Industrious, Immersed, Methodical, Organized, Punctual, Precise, Reliable, Responsible, Thorough, Tidy, Straightforward, Systemic

### RED (Action/Dynamic)
Adventuresome, Competitive, Dynamic, Energetic, Engaged, Effortless, Funny, Open-Minded, Optimistic, Persuasive, Practical, Resilient, Spontaneous, Vigorous

### BLUE (Feeling/People)
Collaborative, Compassionate, Creative, Empathic, Encouraging, Expressive, Inspiring, Intuitive, Motivating, Objective, Passionate, Positive, Receptive, Supportive

---

## Participant Archetypes

### Feeling-Dominant Profiles
- **UX Designer**: Creative, user-focused, collaborative (like Maya Patel)
- **HR Business Partner**: People-focused, supportive, team-building
- **Customer Success Manager**: Relationship-driven, problem-solving
- **Training Specialist**: Nurturing, growth-oriented

### Thinking-Dominant Profiles  
- **Software Engineer**: Analytical, logical, problem-solving
- **Data Scientist**: Research-focused, pattern recognition
- **Business Analyst**: Strategic thinking, process improvement
- **R&D Manager**: Innovative, systematic

### Acting-Dominant Profiles
- **Sales Director**: Results-oriented, persuasive, energetic
- **Startup Founder**: Entrepreneurial, risk-taking, vision-driven
- **Project Manager**: Execution-focused, deadline-driven
- **Operations Manager**: Efficiency-focused, action-oriented

### Planning-Dominant Profiles
- **Financial Controller**: Detail-oriented, systematic, methodical
- **Program Manager**: Organized, structured, process-focused
- **QA Lead**: Meticulous, standards-focused
- **Administrative Director**: Coordination-focused, systematic

---

## Coherence Requirements

### Internal Consistency
1. **Use exact Star Card percentages and Flow Attributes** from bio
2. **Align all reflections** with primary strengths and personality
3. **Match industry context** with role and background
4. **Ensure realistic progression** in future goals
5. **Reflect appropriate work-life balance** for role and career stage

### Professional Authenticity
- **Industry-specific challenges** and opportunities
- **Realistic team dynamics** and collaboration styles  
- **Appropriate development goals** for experience level
- **Genuine work stress patterns** and solutions
- **Role-appropriate language** and examples

### Response Variation
- **Length variety**: Mix 2-sentence and 4-sentence responses
- **Detail levels**: Some participants more verbose than others
- **Experience range**: 2-20 years across different participants
- **Optimism levels**: Various challenge areas and growth mindsets
- **Personality traits**: Introverted vs. extroverted tendencies

---

## Quality Assurance

### Data Validation
- All strength percentages total exactly 100%
- Flow attributes match approved word lists
- Assessment responses align with personality and role
- Professional examples match industry and experience level
- Future goals realistic for current position and trajectory

### Realism Checks
- Work challenges appropriate for role and industry
- Stress patterns match typical professional experiences
- Development goals align with career progression
- Team dynamics reflect real workplace situations
- Personal growth areas show authentic self-awareness

### Diversity Requirements
- **Functional diversity**: Representation across different business functions
- **Experience diversity**: Mix of junior, mid-level, and senior professionals
- **Strength diversity**: Balanced representation across all four strength areas
- **Flow diversity**: Various flow triggers and optimal performance conditions
- **Geographic diversity**: Multiple locations and work arrangements

---

## Output Format

### Complete JSON Structure
Each participant requires complete userInfo, navigationProgress, assessments (8 types), workshopParticipation, and exportMetadata sections in the exact format used by the AllStar Teams system.

### File Organization
- Individual JSON files for each participant
- Summary spreadsheet with key metrics
- Documentation explaining coherence patterns
- Quality assurance checklist

---

## Sample Participant Examples

### Maya Patel - Lead Product Designer
**Strengths**: Feeling (41.8%), Acting (33.6%), Thinking (17.5%), Planning (7.1%)
**Flow Attributes**: Creative, Empathic, Dynamic, Intuitive
**Context**: Design leadership role, user-centered approach, creative problem-solving

### Dr. Sarah Chen - Analytics Director  
**Strengths**: Thinking (43.5%), Planning (31.8%), Feeling (15.6%), Acting (9.1%)
**Flow Attributes**: Analytical, Creative, Strategic, Investigative
**Context**: Research leadership, machine learning expertise, academic background

### Marcus Johnson - DevOps Engineer
**Strengths**: Planning (43.5%), Acting (27.8%), Thinking (20.4%), Feeling (8.3%)
**Flow Attributes**: Systemic, Logical, Thorough, Reliable
**Context**: Infrastructure focus, remote work, systematic problem-solving

### Jennifer Martinez - Customer Success Director
**Strengths**: Feeling (42.6%), Planning (29.8%), Acting (16.5%), Thinking (11.1%)
**Flow Attributes**: Empathic, Strategic, Supportive, Collaborative
**Context**: Customer relationship management, animal science background, people leadership

---

## Implementation Guidelines

### Data Generation Process
1. **Create participant profiles** with realistic backgrounds and roles
2. **Assign exact strengths percentages** and flow attributes
3. **Generate assessment responses** that align with personality and role
4. **Validate internal consistency** across all responses
5. **Review for professional authenticity** and realism
6. **Export in required JSON format** with all metadata

### Testing and Validation
- **Cross-reference consistency** between assessments
- **Verify mathematical accuracy** of percentage totals
- **Check professional authenticity** of examples and language
- **Ensure demographic diversity** across participant set
- **Validate against real workshop participant patterns**

### Use Cases
- **Talia demo development**: Showcasing AI coaching capabilities
- **System testing**: Validating assessment algorithms and recommendations
- **Training data**: Supporting machine learning model development
- **User experience research**: Understanding participant journey patterns
- **Sales demonstrations**: Providing realistic examples for prospects

*This specification ensures generation of authentic, coherent participant data that accurately represents the AllStar Teams workshop experience while protecting actual participant privacy.*
