# [KAN] - Sample User Demo Data System
**Issue Type:** Story
**Project:** KAN
**Priority:** Medium
**Reporter:** Claude Code
**Date Created:** 2025-07-28

## Summary
Implement a sample user selection system for test users to populate demo data with realistic, pre-defined responses from coaching data profiles.

## Description
Currently, test users can use "demo data" buttons to quickly populate workshop responses, but these use generic/placeholder data. We have comprehensive sample user profiles in our coaching data (Daniel Chen, Emily Rodriguez, Jacob Kim, Olivia Wang, Samantha Lee) with realistic workshop responses, professional profiles, and personal reports.

Test users should be able to select from these sample personas when adding demo data, providing them with realistic, coherent responses that demonstrate the full workshop experience.

## Business Value
- **Enhanced Testing**: Provides realistic test scenarios with consistent user journeys
- **Demo Quality**: Improves demonstration quality with authentic-looking data
- **User Experience**: Test users get better understanding of the workshop flow
- **Development Efficiency**: Reduces time spent creating test data manually

## Acceptance Criteria

### Core Functionality
1. **Sample User Selection Interface**
   - [ ] Add a "Sample Users" dropdown/modal to demo data functionality
   - [ ] Display available sample users: Daniel Chen, Emily Rodriguez, Jacob Kim, Olivia Wang, Samantha Lee
   - [ ] Show brief preview of each user's profile (role, strengths percentages)

2. **Data Population Integration**
   - [ ] Replace generic demo data with selected sample user's responses
   - [ ] Populate all workshop sections with user's corresponding data:
     - Core strengths percentages
     - Strength reflections (1st, 2nd, 3rd, 4th)
     - Professional context and background
     - Workshop progression responses

3. **User Interface Updates**
   - [ ] Update existing demo data buttons to trigger sample user selection
   - [ ] Add clear indication when sample user data is being used
   - [ ] Provide option to "Reset to Generic Demo Data" if needed

### Data Mapping Requirements
4. **Sample User Profiles Integration**
   - [ ] Parse existing coaching data files for each sample user:
     - `daniel_chen_ast_workshop_responses.md`
     - `emily_rodriguez_ast_workshop_responses.md`
     - `jacob_kim_ast_workshop_responses.md` 
     - `olivia_wang_ast_workshop_responses.md`
     - `samantha_lee_ast_workshop_responses.md`
   - [ ] Map responses to corresponding workshop steps and form fields
   - [ ] Ensure data consistency across all workshop modules

5. **Professional Context Integration**
   - [ ] Include professional profiles from corresponding files:
     - Job titles, company context, industry background
     - Team dynamics and work environment details
     - Career progression and experience levels

## Technical Notes

### Implementation Approach
- **Data Source**: `/coaching-data/AST_Talia/` folder contains all sample user files
- **Existing Demo System**: Build upon current demo data button functionality
- **Data Structure**: Each sample user has:
  - Workshop responses (detailed strength reflections)
  - Professional profile (job context, background)
  - Personal report data (comprehensive assessment results)

### File Structure Reference
```
coaching-data/AST_Talia/
├── daniel_chen_ast_workshop_responses.md
├── daniel_chen_professional_profile.md
├── daniel_chen_personal_report.md
├── emily_rodriguez_ast_workshop_responses.md
├── emily_rodriguez_professional_profile.md
├── emily_rodriguez_personal_report.md
└── [similar files for jacob_kim, olivia_wang, samantha_lee]
```

### Sample User Preview (Daniel Chen)
- **Role**: Technical Program Manager
- **Strengths**: Acting (38.7%), Planning (35.4%), Thinking (17.8%), Feeling (8.1%)
- **Context**: Agile project coordination, cross-functional team leadership
- **Industry**: Technology sector, enterprise software

## Dependencies
- Current demo data button functionality
- Workshop data persistence system
- Test user authentication and permissions
- Coaching data file parsing utilities

## Definition of Done
- [ ] Test users can select from 5 sample user personas
- [ ] Selected persona data populates all relevant workshop fields
- [ ] Data is realistic and coherent across all workshop modules
- [ ] Professional context enhances the workshop experience authenticity
- [ ] System maintains existing demo data functionality as fallback
- [ ] Code review and testing completed
- [ ] Documentation updated for test user workflows

## Priority Justification
**Medium Priority** - Enhances testing and demo capabilities significantly while building on existing infrastructure. Improves quality of user testing experience and demonstrates workshop value more effectively.

## Estimated Effort
- **Backend**: Parse and structure sample user data (~4 hours)
- **Frontend**: Sample user selection interface (~6 hours)  
- **Integration**: Connect sample data to demo buttons (~4 hours)
- **Testing**: Verify data consistency and user experience (~3 hours)
- **Total**: ~17 hours (2-3 sprint points)

---

**Labels:** enhancement, test-users, demo-data, sample-personas, workshop-experience
**Components:** Test User System, Demo Data, Workshop Forms, Admin Interface