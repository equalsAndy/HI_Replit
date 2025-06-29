# Student Content Implementation Guide

## Context
Student-appropriate video available: https://www.youtube.com/watch?v=oHG4OJQtZ4g
Need to implement student-specific menu structure with week-based organization.

## Required Changes

### 1. Orientation Video & Content
**Current**: Workplace-focused video and intro text for all users
**Student Implementation**: 
- Student users see: https://www.youtube.com/watch?v=oHG4OJQtZ4g
- Student-appropriate welcome text (school/academic context)
- Other user types continue seeing workplace content

### 2. Student Menu Structure (Role-Based Navigation)
**Student users should see this week-based structure:**

```
INTRO (above Week 1)

WEEK 1: 
DISCOVER YOUR STAR STRENGTHS
- Intro to Star Strengths
- Star Strengths Self-Assessment
- Review Your Star Card
- Strength Reflection

WEEK 2: 
IDENTIFY YOUR FLOW
- Intro to Flow
- Flow Assessment
- Rounding Out
- Add Flow to Star Card

WEEK 3: 
VISUALIZE YOUR POTENTIAL
Part 1
- Ladder of Well-being
- Well-being Reflections

WEEK 4: 
VISUALIZE YOUR POTENTIAL
Part 2
- Visualizing You
- Your Future Self
- Final Reflection

WEEK 5: 
NEXT STEPS
- Download your Star Card
- Your Holistic Report
- Growth Plan
- Team Workshop Prep
```

**Implementation Requirements:**
- **Conditional Menu**: Students see week-based structure, others see current session-based
- **Content Grouping**: Organize existing content into 5-week structure with INTRO section
- **Navigation Logic**: Maintain all current functionality with new structure
- **Section Headers**: Add "WEEK 1:", "WEEK 2:", etc. headers for students
- **Intro Placement**: Separate INTRO section above Week 1 as specified

### 3. Files to Modify
**Primary Target**: `client/src/components/navigation/navigationData.ts`
**Pattern**: 
```typescript
const menuStructure = user.role === 'student' ? studentWeekBasedMenu : standardSessionMenu;
```

**Navigation Components**: Any components that render section headers or menu items

### 4. Content Mapping
Ensure existing AST content maps correctly to the new 5-week structure:
- **Intro**: Overview and introduction content
- **Week 1**: Star Strengths discovery
- **Week 2**: Flow identification  
- **Week 3**: Visualization Part 1 (Well-being focus)
- **Week 4**: Visualization Part 2 (Future self focus)
- **Week 5**: Next steps and team prep
- Maintain all current content, just reorganize presentation

## Implementation Approach
1. **Preserve Existing**: All current users (admin, facilitator, participant) keep session-based navigation
2. **Student-Only Changes**: Only `user.role === 'student'` sees week-based structure
3. **Content Consistency**: Same underlying content, different organization/presentation
4. **Progressive Enhancement**: Add student structure without breaking existing workflows

## Testing Checklist
- [ ] Student users see week-based menu structure with proper headers
- [ ] All other user types see original session-based navigation
- [ ] All menu items link to correct content regardless of structure
- [ ] Navigation maintains functionality and progress tracking
- [ ] Student orientation shows appropriate video and text