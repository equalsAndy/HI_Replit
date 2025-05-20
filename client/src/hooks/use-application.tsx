
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import AllStarTeamsLogo from '../assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '../assets/imaginal_agility_logo_nobkgrd.png';

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
    logo: AllStarTeamsLogo,
    primaryColor: 'indigo',
  },
  'imaginal-agility': {
    name: 'Imaginal Agility',
    logo: ImaginalAgilityLogo,
    primaryColor: 'purple',
  }
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [currentApp, setCurrentApp] = useState<ApplicationType>('allstarteams');
  
  // Function to extract app from URL and update state
  const updateAppFromUrl = () => {
    // First check if we're on the auth page with an app parameter
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    
    // Debug log
    console.log('updateAppFromUrl - App param:', appParam, 'Location:', location);
    
    // If app param is present in URL, use it and save to localStorage
    if (appParam === 'imaginal-agility') {
      console.log('Setting app to imaginal-agility');
      setCurrentApp('imaginal-agility');
      localStorage.setItem('selectedApp', 'imaginal-agility');
      return true;
    } else if (appParam === 'allstarteams' || appParam === 'ast') {
      // Handle both 'allstarteams' and the 'ast' shorthand
      console.log('Setting app to allstarteams');
      setCurrentApp('allstarteams');
      localStorage.setItem('selectedApp', 'allstarteams');
      return true;
    }
    return false;
  };
  
  // Effect to set the app based on URL params or localStorage when the component mounts
  // or when the location changes
  useEffect(() => {
    // Try to get app from URL
    const appUpdated = updateAppFromUrl();
    
    // If no app in URL, check localStorage
    if (!appUpdated) {
      const savedApp = localStorage.getItem('selectedApp');
      console.log('No app param, checking localStorage:', savedApp);
      if (savedApp === 'imaginal-agility' || savedApp === 'allstarteams') {
        setCurrentApp(savedApp as ApplicationType);
      }
      // If nothing valid in localStorage, keep default 'allstarteams'
    }
  }, [location]);
  
  // Also run this on initial mount to ensure we capture any direct URL navigation
  useEffect(() => {
    updateAppFromUrl();
  }, []);
  
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
