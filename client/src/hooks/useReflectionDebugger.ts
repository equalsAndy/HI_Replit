/**
 * Comprehensive debugging tool for reflection cache issues
 * Add this to any component to debug cache persistence
 */

import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';

export const useReflectionDebugger = () => {
  const queryClient = useQueryClient();
  const trpcUtils = trpc.useUtils();

  const debugReflectionCache = () => {
    console.log("🔍 === COMPREHENSIVE REFLECTION DEBUG ===");
    
    // 1. Check localStorage
    console.log("\n1. 📦 LOCALSTORAGE:");
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('reflection') || 
          key.toLowerCase().includes('strength') || 
          key.toLowerCase().includes('trpc')) {
        console.log(`  ${key}:`, localStorage.getItem(key)?.substring(0, 200));
      }
    });

    // 2. Check sessionStorage  
    console.log("\n2. 🗂️ SESSIONSTORAGE:");
    Object.keys(sessionStorage).forEach(key => {
      if (key.toLowerCase().includes('reflection') || 
          key.toLowerCase().includes('strength') || 
          key.toLowerCase().includes('trpc')) {
        console.log(`  ${key}:`, sessionStorage.getItem(key)?.substring(0, 200));
      }
    });

    // 3. Check React Query Cache
    console.log("\n3. ⚡ REACT QUERY CACHE:");
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    queries.forEach(query => {
      const key = query.queryKey;
      if (key && (
        JSON.stringify(key).toLowerCase().includes('reflection') ||
        JSON.stringify(key).toLowerCase().includes('strength') ||
        JSON.stringify(key).toLowerCase().includes('trpc')
      )) {
        console.log(`  Query Key:`, key);
        console.log(`  Query Data:`, query.state.data);
        console.log(`  Query Status:`, query.state.status);
        console.log(`  ---`);
      }
    });

    // 4. Check tRPC specific cache
    console.log("\n4. 🔧 TRPC CACHE INFO:");
    console.log("tRPC utils available:", !!trpcUtils);
    
    // 5. Network requests check
    console.log("\n5. 🌐 NETWORK DEBUGGING:");
    console.log("Check Network tab for:");
    console.log("- /api/trpc/reflections.getReflectionSet calls");
    console.log("- Any cached responses (304 status)");
    console.log("- Response data content");
    
    return {
      localStorage: Object.keys(localStorage).filter(k => 
        k.toLowerCase().includes('reflection') || k.toLowerCase().includes('strength')
      ),
      sessionStorage: Object.keys(sessionStorage).filter(k => 
        k.toLowerCase().includes('reflection') || k.toLowerCase().includes('strength')
      ),
      reactQueryCacheSize: queries.length,
      reflectionQueries: queries.filter(q => 
        JSON.stringify(q.queryKey).toLowerCase().includes('reflection')
      ).length
    };
  };

  const nukeAllReflectionData = async () => {
    console.log("💥 === NUCLEAR OPTION: CLEARING EVERYTHING ===");
    
    // 1. Clear all localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.toLowerCase().includes('reflection') || 
          key.toLowerCase().includes('strength') ||
          key.toLowerCase().includes('trpc')) {
        console.log(`Removing localStorage: ${key}`);
        localStorage.removeItem(key);
      }
    });

    // 2. Clear all sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.toLowerCase().includes('reflection') || 
          key.toLowerCase().includes('strength') ||
          key.toLowerCase().includes('trpc')) {
        console.log(`Removing sessionStorage: ${key}`);
        sessionStorage.removeItem(key);
      }
    });

    // 3. Nuclear React Query cache clear
    console.log("Clearing ALL React Query cache...");
    queryClient.clear();

    // 4. Invalidate all tRPC queries
    console.log("Invalidating ALL tRPC queries...");
    await trpcUtils.invalidate();

    // 5. Force browser cache clear for API requests
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        console.log(`Clearing browser cache: ${cacheName}`);
        await caches.delete(cacheName);
      }
    }

    // 6. Dispatch all possible clearing events
    console.log("Dispatching clearing events...");
    ['userDataCleared', 'assessmentDataCleared', 'workshopDataReset', 'reflectionDataCleared'].forEach(event => {
      window.dispatchEvent(new CustomEvent(event));
    });

    console.log("✅ Nuclear clear completed - try refreshing the page");
  };

  return {
    debugReflectionCache,
    nukeAllReflectionData
  };
};

// Make globally accessible for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugReflectionCache = () => {
    console.log("Please use the hook version in a component context");
  };
}
