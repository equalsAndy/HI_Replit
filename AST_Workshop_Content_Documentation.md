
# AllStarTeams Workshop Content Documentation
*For modeling youth-focused adaptations*

## Workshop Overview
The AllStarTeams workshop is a sequential learning progression system that helps participants discover their strengths, identify their flow state, and visualize their potential through assessments, reflections, and interactive content.

## Navigation Structure & Step IDs

### Section 1: Introduction (1/1)
- **Step 1-1**: Introduction Video
  - **Content Type**: Video + Welcome content
  - **Completion**: ≥0.5% video watch + "Next" button click
  - **Unlocks**: Step 2-1

### Section 2: Discover Your Star Strengths (4/4)
- **Step 2-1**: Intro to Star Strengths
  - **Content Type**: Video introduction
  - **Video ID**: TN5b8jx7KSI
  - **Completion**: ≥0.5% video watch + "Next" button
  - **Unlocks**: Step 2-2

- **Step 2-2**: Star Strengths Self-Assessment
  - **Content Type**: Assessment (modal)
  - **Assessment Type**: `starCard`
  - **Completion**: All questions answered + results generated
  - **Unlocks**: Step 2-3

- **Step 2-3**: Review Your Star Card
  - **Content Type**: Video + star card preview
  - **Video ID**: JJWb058M-sY
  - **Completion**: ≥0.5% video watch + "Next" button
  - **Unlocks**: Step 2-4

- **Step 2-4**: Strength Reflection
  - **Content Type**: Step-by-step reflection
  - **Assessment Type**: `stepByStepReflection`
  - **Completion**: All 6 reflection questions answered
  - **Unlocks**: Step 3-1

### Section 3: Identify Your Flow (4/4)
- **Step 3-1**: Intro to Flow
  - **Content Type**: Video introduction
  - **Video ID**: 6szJ9q_g87E
  - **Completion**: ≥0.5% video watch + "Next" button
  - **Unlocks**: Step 3-2

- **Step 3-2**: Flow Assessment
  - **Content Type**: Assessment (modal)
  - **Assessment Type**: `flowAssessment`
  - **Completion**: All 12 flow questions answered
  - **Unlocks**: Step 3-3

- **Step 3-3**: Rounding Out
  - **Content Type**: Video + reflection inputs
  - **Video ID**: BBAx5dNZw6Y
  - **Assessment Type**: `roundingOutReflection`
  - **Completion**: ≥0.5% video watch + 4 reflection inputs completed
  - **Unlocks**: Step 3-4

- **Step 3-4**: Add Flow to Star Card
  - **Content Type**: Word picker activity
  - **Assessment Type**: `flowAttributes`
  - **Completion**: Select exactly 4 flow attributes
  - **Unlocks**: Step 4-1

### Section 4: Visualize Your Potential (5/5)
- **Step 4-1**: Ladder of Well-being
  - **Content Type**: Video + Cantril Ladder activity
  - **Video ID**: SjEfwPEl65U
  - **Assessment Type**: `cantrilLadder`
  - **Completion**: ≥0.5% video watch + 2 slider values set
  - **Unlocks**: Step 4-2

- **Step 4-2**: Well-being Reflections
  - **Content Type**: Reflection questions
  - **Assessment Type**: `wellbeingReflection`
  - **Completion**: All reflection questions answered
  - **Unlocks**: Step 4-3

- **Step 4-3**: Visualizing You
  - **Content Type**: Vision board/image selection
  - **Assessment Type**: `visualizingYou`
  - **Completion**: Image selection activity completed
  - **Unlocks**: Step 4-4

- **Step 4-4**: Your Future Self
  - **Content Type**: Video + reflection
  - **Video ID**: N9uCPe3xF5A
  - **Assessment Type**: `futureSelf`
  - **Completion**: ≥0.5% video watch + reflection questions
  - **Unlocks**: Step 4-5

- **Step 4-5**: Final Reflection
  - **Content Type**: Single reflection question
  - **Assessment Type**: `yourStatement`
  - **Completion**: Final question answered
  - **Unlocks**: Section 5

### Section 5: Resources (3/3)
- **Step 5-1**: Workshop Guide
  - **Content Type**: Reference material
  - **Assessment Type**: `starCardResource`

- **Step 5-2**: Your Star Report
  - **Content Type**: AI-generated holistic report
  - **Assessment Type**: `holisticReport`

- **Step 5-3**: Your Star Card
  - **Content Type**: Final downloadable star card
  - **Assessment Type**: `yourStarCard`

## Assessment Content

### Star Strengths Self-Assessment (Step 2-2)
**Assessment Type**: `starCard`
**Format**: Percentage allocation across 4 dimensions (must total 100%)

**Four Dimensions**:
1. **Thinking** - Analytical, strategic, problem-solving
2. **Acting** - Implementation, execution, getting things done
3. **Feeling** - Emotional intelligence, empathy, relationships
4. **Planning** - Organization, structure, future-focused

**Instructions**: "Distribute 100 points across these four areas based on your natural strengths."

**Validation**: 
- All four values must be numbers
- Total must equal exactly 100
- Each dimension must have some allocation

### Flow Assessment (Step 3-2)
**Assessment Type**: `flowAssessment`
**Format**: 12 questions on 1-5 Likert scale

**Flow Questions**:
1. "I have a sense of control over what I am doing"
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

**Scale**: 
- 1 = Strongly Disagree
- 2 = Disagree
- 3 = Neutral
- 4 = Agree
- 5 = Strongly Agree

**Scoring**: Sum all responses for total flow score (max 60)

## Reflection Content

### Step-by-Step Reflection (Step 2-4)
**Assessment Type**: `stepByStepReflection`
**Format**: 6 open-ended questions (minimum 10 characters each)

**Reflection Questions**:
1. **Strength 1**: "Describe a specific situation where you used your top strength effectively."
2. **Strength 2**: "Think of a challenge you overcame. Which of your strengths helped you most?"
3. **Strength 3**: "When do you feel most energized and engaged? What strengths are you using?"
4. **Strength 4**: "Describe a time when others recognized or appreciated your strengths."
5. **Team Values**: "What values do you bring to a team environment?"
6. **Unique Contribution**: "What makes your contribution unique compared to others?"

### Rounding Out Reflection (Step 3-3)
**Assessment Type**: `roundingOutReflection`
**Format**: 4 open-ended inputs

**Reflection Prompts**:
1. **Strengths**: "What specific strengths do you bring to your work?"
2. **Values**: "What values guide your decisions and actions?"
3. **Passions**: "What activities or topics energize and motivate you?"
4. **Growth Areas**: "What areas would you like to develop or improve?"

### Flow Attributes Selection (Step 3-4)
**Assessment Type**: `flowAttributes`
**Format**: Word picker - select exactly 4 attributes

**Available Flow Attributes** (sample):
- Analytic, Thoughtful, Strategic, Encouraging
- Systematic, Diligent, Thorough, Resilient
- Creative, Innovative, Adaptive, Collaborative
- Energetic, Focused, Determined, Supportive

**Scoring**: Each selected attribute gets descending scores (100, 95, 90, 85)

### Cantril Ladder (Step 4-1)
**Assessment Type**: `cantrilLadder`
**Format**: Two slider inputs (0-10 scale)

**Questions**:
1. **Current Life**: "Where do you stand on the ladder of life today?" (0-10)
2. **Future Life**: "Where do you expect to be on the ladder five years from now?" (0-10)

### Well-being Reflections (Step 4-2)
**Assessment Type**: `wellbeingReflection`
**Format**: Open-ended reflection questions

**Questions** (based on ladder results):
1. "What factors contribute to your current position on the ladder?"
2. "What would need to change to move you higher on the ladder?"
3. "What specific steps can you take toward your five-year vision?"

### Future Self Reflection (Step 4-4)
**Assessment Type**: `futureSelf`
**Format**: Narrative reflection questions

**Questions**:
1. "Describe your ideal future self in detail."
2. "What skills and qualities will your future self have developed?"
3. "What impact will your future self have on others?"

### Final Reflection (Step 4-5)
**Assessment Type**: `yourStatement`
**Format**: Single comprehensive reflection

**Question**: "Write a personal statement that captures your strengths, values, and vision for your future."

## Data Persistence Schema

### Assessment Storage
```javascript
// userAssessments table structure
{
  userId: number,
  assessmentType: string, // starCard, flowAssessment, etc.
  results: string, // JSON string of assessment data
  completedAt: timestamp
}
```

### Navigation Progress
```javascript
// users.navigationProgress JSON field
{
  completedSteps: string[], // ["1-1", "2-1", "2-2", ...]
  currentStepId: string, // "2-3"
  appType: "ast",
  lastVisitedAt: timestamp,
  unlockedSteps: string[], // accessible step IDs
  videoProgress: {
    "stepId": { farthest: number, current: number }
  }
}
```

## Progression Logic

### Completion Criteria
- **Video Steps**: ≥0.5% watch progress + "Next" button click
- **Assessment Steps**: All required fields completed
- **Reflection Steps**: All questions answered (non-empty, ≥10 characters)
- **Activity Steps**: Specific completion requirements (e.g., 4 attributes selected)

### Auto-Save Patterns
- **Text Inputs**: 1-second debounce auto-save
- **Assessments**: Immediate save on completion
- **Video Progress**: Real-time tracking via YouTube API

### Sequential Unlocking
- Users must complete steps in order
- Each completion unlocks the next step
- Green checkmarks indicate completed steps
- Progress persists across sessions

## Adaptation Notes for Youth Audience

### Content Modifications Needed
1. **Language Simplification**: Replace professional terminology with age-appropriate language
2. **Context Updates**: Shift from workplace scenarios to school/life situations
3. **Question Adaptation**: Modify reflection prompts for youth experiences
4. **Visual Updates**: Use youth-friendly imagery and examples
5. **Gamification**: Consider adding achievement systems or progress rewards

### Assessment Adaptations
1. **Star Strengths**: Adapt to academic/personal strengths rather than professional
2. **Flow Questions**: Modify scenarios for school, hobbies, or activities
3. **Reflections**: Focus on school experiences, friendships, and personal growth
4. **Future Vision**: Adapt to career exploration and personal development goals

### Technical Considerations
- Maintain same progression logic and data structure
- Update content while preserving assessment validity
- Consider shorter attention spans in video content
- Add more interactive elements for engagement
