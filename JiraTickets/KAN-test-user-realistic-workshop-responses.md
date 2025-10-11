# KAN - Test User Realistic Workshop Responses System

**Issue Type:** Story  
**Project:** KAN  
**Priority:** Medium  
**Reporter:** Claude Code  
**Date Created:** 2025-07-29  

## Summary
Replace test user demo data reflection answers with realistic responses from actual workshop participants, allowing test users to select which participant's responses to use for their demo data.

## Description
The current test user system uses generic canned reflection answers when users click "Add Demo Data." This enhancement will replace those generic answers with realistic, high-quality responses from actual workshop participants stored in the training documents database. This will provide more authentic testing experiences and better demonstrate the workshop's depth and quality.

**Current State:**
- Test users click "Add Demo Data" and get generic, canned reflection responses
- These responses are the same for all test users and don't reflect real participant quality
- Assessment data (star card, flow, etc.) is properly randomized

**Desired State:**
- Test users can select which participant's responses to use from a dropdown
- Default selection is Samantha Lee's responses
- Responses are realistic and demonstrate workshop quality
- Assessment data remains randomized as current
- User can change selection mid-workshop and future demo data uses new selection

## User Story
**As a** test user exploring the AllStarTeams workshop  
**I want** to use realistic, high-quality reflection responses from actual participants  
**So that** I can experience authentic examples of workshop depth and see quality responses that demonstrate the program's value

## Acceptance Criteria

### Core Functionality
1. **Response Selection Interface**
   - [ ] Add dropdown selector to AllStarTeams workshop card on test user dashboard
   - [ ] Dropdown contains 5 participant options:
     - Samantha Lee (default)
     - Daniel Chen  
     - Emily Rodriguez
     - Jacob Kim
     - Olivia Wang
   - [ ] Selection is prominently displayed and easy to change
   - [ ] Current selection is clearly indicated

2. **Demo Data Integration**  
   - [ ] When user clicks "Add Demo Data" on reflection steps, use selected participant's responses
   - [ ] Replace current canned reflection answers with realistic responses from training documents
   - [ ] Apply to all reflection types:
     - Step-by-step reflections (strength1, strength2, strength3, strength4)
     - Team values reflection
     - Unique contribution reflection
     - Rounding out reflection
     - Cantril ladder reflection  
     - Future self reflection
   - [ ] User can still manually type their own responses (normal behavior preserved)

3. **Data Persistence & Management**
   - [ ] Selected responses are saved as if user typed them personally
   - [ ] Responses persist through browser sessions
   - [ ] When user changes participant selection mid-workshop:
     - All future "Add Demo Data" clicks use new selection
     - Previously filled responses remain unchanged
     - User can go back and re-click "Add Demo Data" to replace with new selection
   - [ ] Data reset button clears all responses and resets selection to Samantha Lee

4. **Assessment Data Preservation**
   - [ ] Assessment randomization remains unchanged (star card, flow assessment, etc.)
   - [ ] Only reflection text responses are affected by this feature
   - [ ] Quantitative data continues to generate randomly for authentic testing

## Technical Implementation

### Data Source Integration
```typescript
// Extract responses from training documents
interface ParticipantResponses {
  participantName: string;
  documentId: string;
  responses: {
    stepByStepReflection?: {
      strength1?: string;
      strength2?: string;
      strength3?: string;
      strength4?: string;
      teamValues?: string;
      uniqueContribution?: string;
    };
    roundingOutReflection?: {
      strengths?: string;
      values?: string;
      passions?: string;
      growthAreas?: string;
    };
    cantrilLadderReflection?: {
      currentFactors?: string;
      futureImprovements?: string;
      specificChanges?: string;
      quarterlyProgress?: string;
      quarterlyActions?: string;
    };
    futureSelfReflection?: {
      twentyYearVision?: string;
      tenYearMilestone?: string;
      fiveYearFoundation?: string;
      flowOptimizedLife?: string;
    };
  };
}
```

### Database Documents to Parse
- `samantha_lee_ast_workshop_responses.md` (default)
- `daniel_chen_ast_workshop_responses.md`
- `emily_rodriguez_ast_workshop_responses.md`
- `jacob_kim_ast_workshop_responses.md`
- `olivia_wang_ast_workshop_responses.md`

### API Endpoints
```typescript
// Get available participant response sets
GET /api/test-users/participant-responses

// Get specific participant's responses
GET /api/test-users/participant-responses/:participantId

// Update test user's selected participant
POST /api/test-users/:userId/selected-participant
```

### UI Components  
```typescript
// New component for participant selection
<ParticipantResponseSelector 
  currentSelection={selectedParticipant}
  onChange={handleParticipantChange}
  options={availableParticipants}
/>

// Update existing demo data buttons to use selected responses
<DemoDataButton 
  onClick={() => addDemoData(selectedParticipant)}
  disabled={!selectedParticipant}
>
  Add Demo Data (from {selectedParticipant})
</DemoDataButton>
```

### Test User Dashboard Integration
- Add participant selector to AllStarTeams workshop card
- Display current selection prominently  
- Update card styling to accommodate new element
- Ensure responsive design across devices

## Business Value

### For Test Users
- **Authentic Experience**: See realistic, high-quality responses that demonstrate workshop value
- **Quality Examples**: Learn from actual participant insights and reflection depth
- **Flexible Testing**: Choose different response styles to test various scenarios

### For Facilitators & Admins
- **Better Demos**: Showcase authentic workshop quality during demonstrations  
- **Training Tool**: Use different participants' responses to show response variety
- **Quality Assurance**: Test system with realistic data that mirrors actual usage

### For Development & Sales
- **Realistic Testing**: QA and development can test with authentic data
- **Demo Quality**: Sales demonstrations show actual participant quality
- **Stakeholder Confidence**: Realistic examples build trust in workshop effectiveness

## Success Metrics
- [ ] Test users can successfully select and use all 5 participant response sets
- [ ] Demo data quality significantly improved (subjective assessment)
- [ ] No regression in existing assessment randomization functionality
- [ ] Test user workflow remains intuitive and efficient
- [ ] Response data persists correctly through sessions and resets appropriately

## Technical Considerations

### Performance
- Cache participant response data to avoid repeated database queries
- Lazy load response content only when needed
- Optimize document parsing for quick selection switching

### Data Quality
- Validate that all 5 participants have complete response sets
- Handle missing responses gracefully with fallbacks
- Ensure response format compatibility with existing UI components

### User Experience
- Clear visual indication of current selection
- Smooth transitions when changing participants
- Intuitive placement in existing test user dashboard
- Consistent behavior with existing demo data functionality

## Dependencies
- All 5 participant workshop response documents must be complete and properly formatted
- Existing test user infrastructure (demo data buttons, data reset functionality)
- Training documents database with participant response documents

## Testing Requirements

### Unit Tests
- [ ] Participant response parsing and validation
- [ ] Demo data integration with selected responses  
- [ ] Selection persistence and reset functionality

### Integration Tests
- [ ] End-to-end test user workflow with different participants
- [ ] Data reset clears selections appropriately
- [ ] Mid-workshop participant switching works correctly

### User Acceptance Testing
- [ ] Test users can easily understand and use participant selection
- [ ] Demo data quality meets expectations
- [ ] No disruption to normal test user workflows

## Future Enhancements (Out of Scope)
- Custom response mixing (combine responses from multiple participants)
- Response quality rating system
- Additional participant response sets beyond current 5
- Response preview before applying demo data

## Definition of Done
- [ ] Participant selection dropdown implemented in test user dashboard
- [ ] All 5 participant response sets integrated and functional
- [ ] Demo data buttons use selected participant responses
- [ ] Response persistence and reset functionality working
- [ ] Assessment randomization preserved
- [ ] All tests passing
- [ ] Code reviewed and documented
- [ ] User acceptance testing completed
- [ ] No regression in existing test user functionality