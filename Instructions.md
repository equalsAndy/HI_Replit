# Implementing "Imaginal Agility" alongside "AllStarTeams"

## Overview
This document outlines a plan to create a second learning application called "Imaginal Agility" that shares the same codebase and infrastructure as the existing "AllStarTeams" application. The goal is to have both experiences accessible from a common root page, allowing users to choose which learning path they want to follow.

## Current Application Structure Analysis

### Main Components and Flow
1. **Landing Page**: Entry point for users (`client/src/pages/landing.tsx`)
2. **Authentication**: User login/registration (`client/src/pages/auth-page.tsx`)
3. **User Home**: Dashboard after login (`client/src/pages/user-home.tsx`)
4. **Learning Modules**: Series of interconnected pages that guide users through the learning process:
   - Foundations
   - Core Strengths
   - Flow Assessment
   - Rounding Out
   - Visualization
   - Report (Star Card)

### Navigation and Routing
- Navigation managed through `wouter` library in `App.tsx`
- Main container component (`MainContainer.tsx`) provides layout and step navigation
- Learning path steps defined in `MainContainer.tsx`
- NavBar component displays "AllStarTeams" branding

### Data and Authentication
- User data stored with persistent user ID in cookies
- Database schema in `shared/schema.ts` defines:
  - User profiles
  - Assessments
  - Questions/answers
  - Star Card data
  - Flow attributes
  - Visualizations
- Storage interface in `server/storage.ts` manages all data operations

## Implementation Plan

### 1. Database Schema Updates

First, we need to modify the database schema to associate content with specific applications:

```typescript
// Add to shared/schema.ts
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),  // "AllStarTeams" or "Imaginal Agility"
  slug: text("slug").notNull(),  // "allstarteams" or "imaginal-agility"
  description: text("description"),
  logoUrl: text("logo_url")
});

// Add applicationId to users table
export const users = pgTable("users", {
  // Existing fields
  ...
  applicationId: integer("application_id").references(() => applications.id, { onDelete: "set null" }),
});
```

### 2. Landing Page Redesign

Create a new landing page that presents both applications:

```tsx
// Update client/src/pages/landing.tsx
export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo flex items-center">
            <img 
              src="/src/assets/common-logo.png" 
              alt="Learning Platform" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/auth">
              <Button variant="outline" size="sm" className="rounded-md">Login</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Choose Your Learning Experience
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Select one of our transformative learning experiences to begin your journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* AllStarTeams Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="p-6">
                <img 
                  src="/src/assets/all-star-teams-logo-250px.png" 
                  alt="AllStarTeams" 
                  className="h-16 w-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">AllStarTeams</h2>
                <p className="text-gray-600 mb-6">
                  Discover your star potential and understand your unique strengths 
                  to leverage them for personal growth and team success.
                </p>
                <Link href="/auth?app=allstarteams">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md w-full">
                    Start AllStarTeams
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Imaginal Agility Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="p-6">
                <img 
                  src="/src/assets/imaginal-agility-logo.png" 
                  alt="Imaginal Agility" 
                  className="h-16 w-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Imaginal Agility</h2>
                <p className="text-gray-600 mb-6">
                  Cultivate your imaginal agility and learn how to adapt to change with 
                  creativity, resilience, and a growth mindset.
                </p>
                <Link href="/auth?app=imaginal-agility">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md w-full">
                    Start Imaginal Agility
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 3. Application Context Provider

Create a context to manage the current application throughout the user's journey:

```tsx
// Create new file: client/src/hooks/use-application-context.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

type ApplicationContextType = {
  currentApp: 'allstarteams' | 'imaginal-agility';
  appName: string;
  appLogo: string;
  appPrimaryColor: string;
  setCurrentApp: (app: 'allstarteams' | 'imaginal-agility') => void;
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [currentApp, setCurrentApp] = useState<'allstarteams' | 'imaginal-agility'>('allstarteams');
  
  // Effect to set the app based on URL params when the component mounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    
    if (appParam === 'imaginal-agility') {
      setCurrentApp('imaginal-agility');
    } else {
      setCurrentApp('allstarteams');
    }
  }, [location]);
  
  // App-specific configuration
  const appConfig = {
    'allstarteams': {
      name: 'AllStarTeams',
      logo: '/src/assets/all-star-teams-logo-250px.png',
      primaryColor: 'indigo'
    },
    'imaginal-agility': {
      name: 'Imaginal Agility',
      logo: '/src/assets/imaginal-agility-logo.png',
      primaryColor: 'teal'
    }
  };
  
  const value = {
    currentApp,
    appName: appConfig[currentApp].name,
    appLogo: appConfig[currentApp].logo,
    appPrimaryColor: appConfig[currentApp].primaryColor,
    setCurrentApp
  };
  
  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
}
```

### 4. Update Authentication Flow

Modify the authentication flow to maintain the application context:

```tsx
// Update client/src/pages/auth-page.tsx
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { currentApp, appName, appLogo } = useApplication();

  // Get the app param from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    
    if (appParam) {
      // Store the selected app in localStorage for persistence
      localStorage.setItem('selectedApp', appParam);
    }
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const res = await apiRequest('POST', '/api/auth/login', { 
        ...values,
        applicationId: currentApp === 'allstarteams' ? 1 : 2
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      navigate('/user-home');
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Rest of the component remains the same
}
```

### 5. Update NavBar and UI Components

Update the NavBar to reflect the current application:

```tsx
// Update client/src/components/layout/NavBar.tsx
export function NavBar() {
  const { data: user, isLoading } = useQuery({ queryKey: ['/api/user/profile'] });
  const [, navigate] = useLocation();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { currentApp, appName, appLogo } = useApplication();
  
  // Rest of component logic
  
  return (
    <div className={`bg-${currentApp === 'allstarteams' ? 'indigo' : 'teal'}-800 text-white p-2 sticky top-0 z-50 flex justify-between items-center`}>
      <div className="flex-1">
        <div className="flex items-center">
          <img src={appLogo} alt={appName} className="h-8 w-auto mr-2" />
          <h1 className="text-xl font-semibold">{appName}</h1>
        </div>
      </div>

      {/* Rest of NavBar remains the same */}
    </div>
  );
}
```

### 6. Create Application-Specific Learning Paths

Update the MainContainer to provide different learning paths based on the application:

```tsx
// Update client/src/components/layout/MainContainer.tsx
export default function MainContainer({ 
  children, 
  stepId, 
  showStepNavigation = true,
  showHeader = true,
  className = ""
}: MainContainerProps) {
  const { currentApp } = useApplication();
  
  // Define different learning paths for each application
  const allStarTeamsSteps = [
    { id: "A", label: "Reflect On Your Strengths", path: "/core-strengths" },
    { id: "B", label: "Identify Your Flow", path: "/flow-assessment" },
    { id: "C", label: "Rounding Out", path: "/rounding-out" },
    { id: "D", label: "Complete Your Star Card", path: "/report" }
  ];
  
  const imaginalAgilitySteps = [
    { id: "A", label: "Imagination Assessment", path: "/imagination-assessment" },
    { id: "B", label: "Agility Spectrum", path: "/agility-spectrum" },
    { id: "C", label: "Creative Integration", path: "/creative-integration" },
    { id: "D", label: "Your Agility Profile", path: "/agility-profile" }
  ];
  
  // Select the appropriate steps based on current app
  const steps = currentApp === 'allstarteams' ? allStarTeamsSteps : imaginalAgilitySteps;
  
  // Rest of component remains the same
}
```

### 7. Create New Pages for Imaginal Agility

Create new pages for the Imaginal Agility learning path:

```tsx
// Create new pages:
// - client/src/pages/imagination-assessment.tsx
// - client/src/pages/agility-spectrum.tsx
// - client/src/pages/creative-integration.tsx
// - client/src/pages/agility-profile.tsx

// Example for imagination-assessment.tsx
export default function ImaginationAssessment() {
  const { currentApp, appName } = useApplication();
  
  return (
    <MainContainer stepId="A" showStepNavigation={true}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Imagination Assessment</h1>
        <p className="text-lg mb-6">
          The Imagination Assessment helps you understand your default imagination
          patterns and how they influence your thinking and decision-making.
        </p>
        
        {/* Assessment questions and content specific to Imaginal Agility */}
      </div>
    </MainContainer>
  );
}
```

### 8. Update Routing in App.tsx

Add routes for the new pages:

```tsx
// Update client/src/App.tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DemoModeProvider>
          <ApplicationProvider>
            <Router />
            <Toaster />
          </ApplicationProvider>
        </DemoModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function Router() {
  // Existing router logic
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1">
        <Switch>
          {/* Common routes */}
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/user-home" component={UserHome} />
          <Route path="/logout" component={LogoutPage} />
          
          {/* AllStarTeams specific routes */}
          <Route path="/foundations" component={Foundations} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/report" component={Report} />
          <Route path="/core-strengths" component={CoreStrengths} />
          <Route path="/flow-assessment" component={FlowAssessment} />
          <Route path="/find-your-flow" component={FindYourFlow} />
          <Route path="/rounding-out" component={RoundingOut} />
          <Route path="/visualize-yourself" component={VisualizeYourself} />
          
          {/* Imaginal Agility specific routes */}
          <Route path="/imagination-assessment" component={ImaginationAssessment} />
          <Route path="/agility-spectrum" component={AgilitySpectrum} />
          <Route path="/creative-integration" component={CreativeIntegration} />
          <Route path="/agility-profile" component={AgilityProfile} />
          
          {/* 404 route */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}
```

### 9. Update APIs and Backend Services

Modify server routes to handle application-specific data:

```typescript
// Update server/routes.ts for app-specific authentication
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { username, password, applicationId } = req.body;
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Update user's applicationId if provided
    if (applicationId && user.applicationId !== applicationId) {
      await storage.updateUser(user.id, { applicationId });
    }
    
    // Set session cookie
    res.cookie("userId", user.id.toString(), COOKIE_OPTIONS);
    
    console.log(`Login successful for user ${user.id} (${username}), setting cookie userId=${user.id}`);
    
    res.status(200).json({ 
      id: user.id, 
      username: user.username, 
      name: user.name,
      title: user.title,
      organization: user.organization,
      avatarUrl: user.avatarUrl,
      progress: user.progress,
      applicationId: user.applicationId
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
```

### 10. Create Application-Specific Content

Create content that's tailored to each application but follows the same structure:

- Questions and assessments for each application
- Different visualization styles
- Different reporting formats (Star Card vs Agility Profile)

### 11. Update Storage Interface

Add application-specific methods to the storage interface:

```typescript
// Update server/storage.ts
export interface IStorage {
  // Existing methods
  
  // Application operations
  getApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  
  // Application-specific user operations
  getUsersByApplication(applicationId: number): Promise<User[]>;
  
  // Application-specific assessment operations
  getAssessmentsByApplication(applicationId: number): Promise<Assessment[]>;
  
  // Additional application-specific methods as needed
}
```

## Potential Challenges

1. **Data Segregation**: Ensuring that data from one application doesn't bleed into the other
2. **UI Consistency**: Maintaining a consistent UI feel while differentiating the two applications
3. **Navigation**: Ensuring users stay within their chosen application's flow
4. **Content Management**: Creating and managing different content sets for each application
5. **Testing Complexity**: Testing both applications independently and ensuring they don't interfere with each other

## Implementation Steps

1. First, create the ApplicationProvider context
2. Update the database schema to include application information
3. Modify the landing page to present both options
4. Update the authentication flow to maintain application context
5. Create the new UI components and pages for Imaginal Agility
6. Update the backend to handle application-specific data
7. Create test content for Imaginal Agility
8. Test the complete flow for both applications

## Conclusion

Creating a second application within the same codebase is feasible with the current architecture. By adding an application context and updating the routing and UI components, we can provide two distinct learning experiences while sharing the same infrastructure and codebase. This approach allows for efficient development and maintenance while providing users with different learning paths based on their needs.
# Flow Assessment Interface Requirements

## Auto-Advance Feature
- Auto-advance should be ON by default
- Include toggle to disable/enable auto-advance
- Maintain 700ms delay before auto-advancing
- When going back to previous questions, auto-advance should:
  - Automatically disable
  - Show notification that auto-advance was disabled
  - Allow user to re-enable it

## Answer Interface
- Initial state: No default selection/answer shown
- All questions start with slider/numbers unselected
- Answer options 1-5 available
- Clicking any number:
  - Records the answer
  - Advances to next question (if auto-advance enabled)

## Navigation & Answer Modification
- Users can go back to previous questions
- Previous answers can be modified
- When modifying previous answers:
  - Auto-advance is disabled
  - User is notified of auto-advance being disabled
  - User can re-enable auto-advance

## Data Storage & Results
- Flow assessment answers stored in user file
- Not connected to StarCard completion state
- Maintain existing scoring system:
  - 50-60: Flow Fluent
  - 39-49: Flow Aware
  - 26-38: Flow Blocked
  - 12-25: Flow Distant

## User Experience Notes
- Clear visual feedback for selected answers
- Easy navigation between questions
- Clear indication of auto-advance state
- Smooth transitions between questions

## Post-Assessment Completion
- Display overall flow state level (Flow Fluent, Flow Aware, etc.)
- Show personalized insights based on score
- Provide clear next steps:
  1. Individual reflection on flow patterns
  2. Preparation for team workshop integration
  3. Download/save results for future reference
- Show recommended flow-enhancing activities based on score
- Store results in user profile for:
  - Future reference
  - Team workshop preparation
  - Progress tracking
