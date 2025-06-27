
# Test User Components Inventory

## AST WORKSHOP COMPONENTS

### Assessment Components
- **AssessmentModal** - Location: `client/src/components/assessment/AssessmentModal.tsx` - Test Features: **No** - Details: No test data generation, demo data handling only
- **AssessmentQuestion** - Location: `client/src/components/assessment/AssessmentQuestion.tsx` - Test Features: **No** - Details: Basic question rendering, no test shortcuts
- **AssessmentPieChart** - Location: `client/src/components/assessment/AssessmentPieChart.tsx` - Test Features: **No** - Details: Visualization only, no test data injection
- **FlowAssessment** - Location: `client/src/components/flow/FlowAssessment.tsx` - Test Features: **No** - Details: Assessment form without test data buttons
- **FlowAssessmentSimple** - Location: `client/src/components/flow/FlowAssessmentSimple.tsx` - Test Features: **No** - Details: Simplified flow assessment, no test features

### Reflection Components  
- **StepByStepReflection** - Location: `client/src/components/reflection/StepByStepReflection.tsx` - Test Features: **No** - Details: Text input forms, no auto-populate functionality
- **RoundingOutReflection** - Location: `client/src/components/flow/RoundingOutReflection.tsx` - Test Features: **No** - Details: Flow reflection form, lacks test data generation

### Content Views
- **AssessmentView** - Location: `client/src/components/content/AssessmentView.tsx` - Test Features: **No** - Details: Assessment wrapper, no test enhancements
- **ReflectionView** - Location: `client/src/components/content/ReflectionView.tsx` - Test Features: **No** - Details: Reflection wrapper, no test shortcuts
- **FinalReflectionView** - Location: `client/src/components/content/FinalReflectionView.tsx` - Test Features: **No** - Details: Final reflection form, no test data
- **CantrilLadderView** - Location: `client/src/components/content/CantrilLadderView.tsx` - Test Features: **No** - Details: Well-being assessment, no test functionality

## IA WORKSHOP COMPONENTS

### Assessment Components
- **ImaginalAgilityAssessment** - Location: `client/src/components/assessment/ImaginalAgilityAssessment.tsx` - Test Features: **No** - Details: 5Cs assessment form, no test data injection
- **ImaginalAgilityAssessmentModal** - Location: `client/src/components/assessment/ImaginalAgilityAssessmentModal.tsx` - Test Features: **No** - Details: Modal wrapper, no test enhancements
- **ImaginalAgilityResults** - Location: `client/src/components/assessment/ImaginalAgilityResults.tsx` - Test Features: **No** - Details: Results display, no test data generation

### Exercise Components
- **DiscernmentExercise** - Location: `client/src/components/discernment/DiscernmentExercise.tsx` - Test Features: **No** - Details: Interactive exercise, no test shortcuts
- **RealityCheckExercise** - Location: `client/src/components/imaginal-agility/exercises/RealityCheckExercise.tsx` - Test Features: **No** - Details: Reality check scenarios, no test completion
- **ToolkitPracticeExercise** - Location: `client/src/components/imaginal-agility/exercises/ToolkitPracticeExercise.tsx` - Test Features: **No** - Details: Practice scenarios, no test auto-completion
- **VisualDetectionExercise** - Location: `client/src/components/imaginal-agility/exercises/VisualDetectionExercise.tsx` - Test Features: **No** - Details: Visual detection training, no test shortcuts

## SHARED COMPONENTS

### Profile & User Management
- **TestUserBanner** - Location: `client/src/components/test-users/TestUserBanner.tsx` - Test Features: **Yes** - Details: Reset data button, switch app functionality, user status display
- **TestUserPicker** - Location: `client/src/components/test-users/TestUserPicker.tsx` - Test Features: **Yes** - Details: Quick login as different test users
- **UserManagement** - Location: `client/src/components/admin/UserManagement.tsx` - Test Features: **Yes** - Details: Toggle test user status, delete user data
- **ResetDataButton** - Location: `client/src/components/profile/ResetDataButton.tsx` - Test Features: **Yes** - Details: Individual user data reset
- **ProfileEditor** - Location: `client/src/components/profile/ProfileEditor.tsx` - Test Features: **No** - Details: Profile editing form, no test data injection

### Admin Components
- **UserUploader** - Location: `client/src/components/admin/UserUploader.tsx` - Test Features: **Yes** - Details: Generate test user with complete workshop data, bulk operations
- **InviteManagement** - Location: `client/src/components/admin/InviteManagement.tsx` - Test Features: **No** - Details: Invite code management, no test features
- **CohortManagement** - Location: `client/src/components/admin/CohortManagement.tsx` - Test Features: **No** - Details: Cohort management, no test user handling

### Navigation & Layout
- **Navigation** - Location: `client/src/components/navigation/Navigation.tsx` - Test Features: **No** - Details: Main navigation, no test progress shortcuts
- **StepNavigation** - Location: `client/src/components/layout/StepNavigation.tsx` - Test Features: **No** - Details: Step-by-step navigation, no test completion buttons
- **NextPrevButtons** - Location: `client/src/components/navigation/NextPrevButtons.tsx` - Test Features: **No** - Details: Navigation buttons, no test skip functionality

### StarCard Components
- **StarCard** - Location: `client/src/components/starcard/StarCard.tsx` - Test Features: **No** - Details: StarCard display, no test data injection
- **StarCardWithFetch** - Location: `client/src/components/starcard/StarCardWithFetch.tsx` - Test Features: **Partial** - Details: Has hardcoded test data as fallback, but no active test features
- **EditableStarCard** - Location: `client/src/components/starcard/EditableStarCard.tsx` - Test Features: **No** - Details: StarCard editing, no test data auto-fill

## SUMMARY

- **Total components analyzed**: 28
- **Components with test features**: 4
- **Components lacking test features**: 24
- **Components needing enhancement**: 20 (assessment and reflection components priority)

### HIGH PRIORITY FOR TEST ENHANCEMENT
1. **Assessment Components** (8 components) - Need test data generation buttons
2. **Reflection Components** (3 components) - Need auto-populate functionality  
3. **Exercise Components** (4 components) - Need test completion shortcuts
4. **Navigation Components** (3 components) - Need progress acceleration features

### MEDIUM PRIORITY FOR TEST ENHANCEMENT
1. **Content View Components** (4 components) - Need test data injection
2. **StarCard Components** (2 components) - Need test data auto-fill
3. **Profile Components** (1 component) - Need test profile generation

### LOW PRIORITY (ADMIN ONLY)
1. **Admin Components** (3 components) - Already have adequate test features
2. **Test User Components** (2 components) - Core functionality complete
