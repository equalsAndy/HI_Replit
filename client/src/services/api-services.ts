// API service for image search providers
import { createApi } from 'unsplash-js';

// Unsplash API client
export const unsplashApi = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '',
});

// Export function to search Unsplash
export const searchUnsplash = async (query: string, perPage: number = 20) => {
  try {
    console.log('🖼️ Searching Unsplash for:', query);
    console.log('🔑 API Key status:', import.meta.env.VITE_UNSPLASH_ACCESS_KEY ? 'Key exists' : 'No key found');
    
    if (!import.meta.env.VITE_UNSPLASH_ACCESS_KEY) {
      console.error('❌ VITE_UNSPLASH_ACCESS_KEY not found in environment variables');
      throw new Error('Unsplash API key not configured. Please add VITE_UNSPLASH_ACCESS_KEY to your environment variables.');
    }
    
    const result = await unsplashApi.search.getPhotos({
      query,
      perPage,
    });
    
    if (result.errors) {
      console.error('❌ Unsplash API returned errors:', result.errors);
      throw new Error(`Unsplash API error: ${result.errors.join(', ')}`);
    }
    
    const images = result.response?.results || [];
    console.log('✅ Unsplash search results:', images.length, 'images found for query:', query);
    return images;
  } catch (error) {
    console.error('❌ Error searching Unsplash:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('401')) {
      throw new Error('Unsplash API authentication failed. Please check your API key.');
    } else if (error.message?.includes('429')) {
      throw new Error('Unsplash API rate limit exceeded. Please try again later.');
    } else if (error.message?.includes('network')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

/**
 * Calls Vision API to describe an image. Fire-and-forget friendly.
 * Returns the description string, or empty string on failure.
 */
export async function describeImage(imageUrl: string): Promise<string> {
  try {
    const resp = await fetch('/api/ai/image/describe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ image_url: imageUrl }),
    });
    const data = await resp.json();
    return data?.description || '';
  } catch (err) {
    console.error('[describeImage] Failed:', err);
    return '';
  }
}

// Define unified result type
export interface UnifiedImageSearchResult {
  unsplash: any[];
  pexels: any[]; // Keep for interface compatibility
}

// Unified search (now just using Unsplash)
export const searchImages = async (query: string, perPage: number = 15): Promise<UnifiedImageSearchResult> => {
  const results: UnifiedImageSearchResult = {
    unsplash: [],
    pexels: [] // Empty array as Pexels is not used
  };
  
  try {
    // Just search Unsplash now
    const unsplashResults = await searchUnsplash(query, perPage);
    results.unsplash = unsplashResults || [];
    
    // Log that Pexels is not being searched
    console.log('Pexels search results:', 0, 'images found');
    
    return results;
  } catch (error) {
    console.error('Error in unified image search:', error);
    return results; // Return what we have even if there was an error
  }
};