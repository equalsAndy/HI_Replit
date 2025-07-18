// Utility to force refresh authentication state
export const forceAuthRefresh = () => {
  // Clear all React Query caches
  if (typeof window !== 'undefined') {
    localStorage.removeItem('react-query-cache');
    sessionStorage.removeItem('react-query-cache');
    
    // Force a complete page refresh
    window.location.reload();
  }
};

// Function to clear specific auth cache
export const clearAuthCache = () => {
  if (typeof window !== 'undefined') {
    // Clear any auth-related local storage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('user') || key.includes('react-query'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

// Function to force assessment data cache dump
export const forceAssessmentCacheDump = (queryClient: any) => {
  console.log('🧹 Forcing complete assessment cache dump...');
  
  // Remove all assessment and workshop data queries from cache
  const assessmentQueryKeys = [
    '/api/user/assessments',
    '/api/workshop-data/starcard',
    '/api/workshop-data/flow-attributes',
    '/api/starcard',
    '/api/flow-attributes',
    '/api/user/star-card-data',
    '/api/assessments/imaginal_agility'
  ];
  
  assessmentQueryKeys.forEach(queryKey => {
    queryClient.removeQueries({ queryKey: [queryKey] });
  });
  
  // Clear navigation progress cache using predicate
  queryClient.removeQueries({ 
    predicate: (query: any) => {
      const queryKey = query.queryKey[0] as string;
      return queryKey?.includes('navigation') || queryKey?.includes('progress');
    }
  });
  
  // Invalidate auth data to refresh user state
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  
  // Clear local storage items related to assessments and navigation
  if (typeof window !== 'undefined') {
    const localStorageKeysToRemove = [
      'allstarteams-navigation-progress',
      'imaginal-agility-navigation-progress', 
      'allstar_navigation_progress',
      'ast-navigation-progress',
      'ia-navigation-progress'
    ];
    
    localStorageKeysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }
  
  console.log('✅ Assessment cache dump completed');
};
