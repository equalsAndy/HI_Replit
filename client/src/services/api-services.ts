// API service for image search providers
import { createApi } from 'unsplash-js';

// Unsplash API client
export const unsplashApi = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '',
});

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