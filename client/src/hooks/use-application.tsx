
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useLocation } from 'wouter';

type ApplicationType = 'allstarteams' | 'imaginal-agility';

type ApplicationContextType = {
  currentApp: ApplicationType;
  appName: string;
  appPrimaryColor: string;
  setCurrentApp: (app: ApplicationType) => void;
};

// Application-specific configuration
const appConfig = {
  'allstarteams': {
    name: 'AllStarTeams',
    primaryColor: 'indigo',
  },
  'imaginal-agility': {
    name: 'Imaginal Agility',
    primaryColor: 'purple',
  }
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [currentApp, setCurrentApp] = useState<ApplicationType>('allstarteams');
  
  // Effect to set the app based on URL params or localStorage when the component mounts
  // or when the location changes
  useEffect(() => {
    // First check if we're on the auth page with an app parameter
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    
    // Debug log
    console.log('updateAppFromUrl - App param:', appParam, 'Location:', location);
    
    let appUpdated = false;
    
    // If app param is present in URL, use it and save to sessionStorage
    if (appParam === 'imaginal-agility') {
      console.log('Setting app to imaginal-agility');
      setCurrentApp('imaginal-agility');
      sessionStorage.setItem('selectedApp', 'imaginal-agility');
      appUpdated = true;
    } else if (appParam === 'allstarteams' || appParam === 'ast') {
      // Handle both 'allstarteams' and the 'ast' shorthand
      console.log('Setting app to allstarteams');
      setCurrentApp('allstarteams');
      sessionStorage.setItem('selectedApp', 'ast');
      appUpdated = true;
    }
    
    // If no app in URL, check sessionStorage
    if (!appUpdated) {
      const savedApp = sessionStorage.getItem('selectedApp');
      console.log('No app param, checking sessionStorage:', savedApp);
      if (savedApp === 'imaginal-agility' || savedApp === 'allstarteams' || savedApp === 'ast') {
        // Handle 'ast' shorthand for allstarteams
        const appType = savedApp === 'ast' ? 'allstarteams' : savedApp as ApplicationType;
        setCurrentApp(appType);
      }
      // If nothing valid in sessionStorage, keep default 'allstarteams'
    }
  }, [location]);
  
  const value = useMemo(() => ({
    currentApp,
    appName: appConfig[currentApp].name,
    appPrimaryColor: appConfig[currentApp].primaryColor,
    setCurrentApp,
  }), [currentApp]);
  
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
