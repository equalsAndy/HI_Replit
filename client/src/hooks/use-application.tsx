import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

type ApplicationType = 'allstarteams' | 'imaginal-agility';

type ApplicationContextType = {
  currentApp: ApplicationType;
  appName: string;
  appLogo: string;
  appPrimaryColor: string;
  setCurrentApp: (app: ApplicationType) => void;
};

// Application-specific configuration
const appConfig = {
  'allstarteams': {
    name: 'AllStarTeams',
    logo: '/src/assets/all-star-teams-logo-250px.png',
    primaryColor: 'indigo',
  },
  'imaginal-agility': {
    name: 'Imaginal Agility',
    logo: '/src/assets/imaginal_agility_logo_nobkgrd.png',
    primaryColor: 'purple',
  }
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [currentApp, setCurrentApp] = useState<ApplicationType>('allstarteams');
  
  // Effect to set the app based on URL params or localStorage when the component mounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    
    // If app param is present in URL, use it and save to localStorage
    if (appParam === 'imaginal-agility' || appParam === 'allstarteams') {
      setCurrentApp(appParam);
      localStorage.setItem('selectedApp', appParam);
    } else {
      // Otherwise check localStorage
      const savedApp = localStorage.getItem('selectedApp');
      if (savedApp === 'imaginal-agility' || savedApp === 'allstarteams') {
        setCurrentApp(savedApp);
      }
      // If nothing valid in localStorage, keep default 'allstarteams'
    }
  }, [location]);
  
  const value = {
    currentApp,
    appName: appConfig[currentApp].name,
    appLogo: appConfig[currentApp].logo,
    appPrimaryColor: appConfig[currentApp].primaryColor,
    setCurrentApp,
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