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
  
  // Remove all cached queries related to workshop data and StarCards
  queryClient.removeQueries({ queryKey: ['/api/workshop-data/starcard'] });
  queryClient.removeQueries({ queryKey: ['/api/workshop-data/flow-attributes'] });
  queryClient.removeQueries({ queryKey: ['/api/assessment/data'] });
  queryClient.removeQueries({ queryKey: ['/api/workshop-data'] });
  queryClient.removeQueries({ predicate: (query: any) => 
    query.queryKey && Array.isArray(query.queryKey) && 
    query.queryKey.some((key: string) => 
      typeof key === 'string' && (
        key.includes('starcard') || 
        key.includes('workshop-data') || 
        key.includes('assessment') ||
        key.includes('flow-attributes')
      )
    )
  });
  
  // Clear local storage related to assessments
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('assessment') || key.includes('starcard') || key.includes('workshop'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log('🗑️ Removing localStorage key:', key);
      localStorage.removeItem(key);
    });
  }
  
  // Force invalidation of auth data since user data might have changed
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  
  console.log('✅ Assessment cache dump completed');
};
