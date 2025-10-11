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

// Function to force comprehensive workshop cache dump - clears ALL workshop step data
export const forceWorkshopCacheDump = (queryClient: any) => {
  console.log('🧹 Forcing complete workshop cache dump...');
  
  // Remove all workshop step data queries using pattern matching
  queryClient.removeQueries({ 
    predicate: (query: any) => {
      if (!query.queryKey || !Array.isArray(query.queryKey)) return false;
      
      return query.queryKey.some((key: string) => 
        typeof key === 'string' && (
          key.includes('/api/workshop-data/step/') ||
          key.includes('/api/workshop-data/') ||
          key.includes('/api/navigation-progress/') ||
          key.includes('workshop') ||
          key.includes('starcard') ||
          key.includes('assessment') ||
          key.includes('flow-attributes') ||
          key.includes('ia-') ||
          key.match(/^\d+-\d+$/) // AST step patterns like "4-5", "3-2"
        )
      );
    }
  });
  
  // Also remove specific known workshop data endpoints
  const workshopEndpoints = [
    '/api/workshop-data/starcard',
    '/api/workshop-data/flow-attributes',
    '/api/workshop-data/ia-assessment',
    '/api/workshop-data/final-reflection',
    '/api/navigation-progress/ast',
    '/api/navigation-progress/ia',
    '/api/assessment/data',
    '/api/starcard',
    '/api/flow-attributes',
    '/api/user/assessments'
  ];
  
  workshopEndpoints.forEach(endpoint => {
    queryClient.removeQueries({ queryKey: [endpoint] });
  });
  
  // Clear local storage related to all workshop data
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('workshop') || 
        key.includes('assessment') || 
        key.includes('starcard') || 
        key.includes('flow') ||
        key.includes('navigation') ||
        key.includes('ia-') ||
        key.includes('ast-') ||
        key.match(/\d+-\d+/) // Step patterns
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log('🗑️ Removing localStorage key:', key);
      localStorage.removeItem(key);
    });
    
    // Also clear sessionStorage
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.includes('workshop') || 
        key.includes('assessment') || 
        key.includes('starcard') || 
        key.includes('flow') ||
        key.includes('navigation') ||
        key.includes('ia-') ||
        key.includes('ast-')
      )) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => {
      console.log('🗑️ Removing sessionStorage key:', key);
      sessionStorage.removeItem(key);
    });
  }
  
  // Force invalidation of auth data since user data might have changed
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  
  console.log('✅ Workshop cache dump completed');
};

// Function to force assessment data cache dump (now calls comprehensive workshop dump)
export const forceAssessmentCacheDump = (queryClient: any) => {
  console.log('🧹 Forcing assessment cache dump (using comprehensive workshop cache dump)...');
  forceWorkshopCacheDump(queryClient);
};
