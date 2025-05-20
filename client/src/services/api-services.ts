// API service for image search providers
import { createApi } from 'unsplash-js';
import { createClient } from 'pexels';

// Polyfill for isomorphic-fetch to prevent "require is not defined" error
if (typeof window !== 'undefined') {
  // We're in a browser environment, ensure fetch is available
  window.fetch = window.fetch || fetch;
}

// Unsplash API client
export const unsplashApi = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '',
});

// Pexels API client with error handling for require statements
let pexelsClient;
try {
  pexelsClient = createClient(import.meta.env.VITE_PEXELS_API_KEY || '');
} catch (error) {
  console.error('Error initializing Pexels client:', error);
  // Provide a fallback client with the same interface but returns empty results
  pexelsClient = {
    photos: {
      search: async () => ({ photos: [] })
    }
  };
}

// Export function to search Unsplash
export const searchUnsplash = async (query: string, perPage: number = 20) => {
  try {
    console.log('Searching Unsplash with key:', import.meta.env.VITE_UNSPLASH_ACCESS_KEY ? 'Key exists' : 'No key found');
    
    const result = await unsplashApi.search.getPhotos({
      query,
      perPage,
    });
    
    if (result.errors) {
      console.error('Unsplash API returned errors:', result.errors);
      throw new Error(result.errors.join(', '));
    }
    
    console.log('Unsplash search results:', result.response?.results?.length || 0, 'images found');
    return result.response?.results || [];
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    throw error;
  }
};

// Export function to search Pexels
export const searchPexels = async (query: string, perPage: number = 20) => {
  try {
    console.log('Searching Pexels with key:', import.meta.env.VITE_PEXELS_API_KEY ? 'Key exists' : 'No key found');
    
    const result = await pexelsClient.photos.search({ 
      query, 
      per_page: perPage 
    });
    
    // Handle the response safely
    if ('photos' in result) {
      const photos = result.photos || [];
      console.log('Pexels search results:', photos.length, 'images found');
      
      // Log the first photo to examine its structure
      if (photos.length > 0) {
        console.log('Example Pexels photo structure:', JSON.stringify(photos[0]));
      }
      
      return photos;
    } else {
      console.error('Pexels API error:', result);
      return [];
    }
  } catch (error) {
    console.error('Error searching Pexels:', error);
    return [];
  }
};

// Define unified result type
export interface UnifiedImageSearchResult {
  unsplash: any[];
  pexels: any[];
}

// Unified search across both providers
export const searchImages = async (query: string, perPage: number = 15): Promise<UnifiedImageSearchResult> => {
  const results: UnifiedImageSearchResult = {
    unsplash: [],
    pexels: []
  };
  
  try {
    // Run both API calls in parallel
    const [unsplashResults, pexelsResults] = await Promise.allSettled([
      searchUnsplash(query, perPage),
      searchPexels(query, perPage)
    ]);
    
    // Process Unsplash results
    if (unsplashResults.status === 'fulfilled') {
      results.unsplash = unsplashResults.value || [];
    }
    
    // Process Pexels results
    if (pexelsResults.status === 'fulfilled') {
      results.pexels = pexelsResults.value || [];
    }
    
    return results;
  } catch (error) {
    console.error('Error in unified image search:', error);
    return results; // Return what we have even if there was an error
  }
};