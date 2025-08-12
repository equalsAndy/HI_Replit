import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { FileText, RefreshCw, Loader2 } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';

interface IA33ContentProps {
  onNext?: (stepId: string) => void;
}

// Data structure for this step
interface IA33StepData {
  selectedImage: string | null;
  uploadedImage: string | null;
  reflection: string;
  imageTitle: string;
}

// Inspirational themes for search functionality
const INSPIRATION_THEMES = [
  { query: 'breakthrough growth nature', label: 'Growth & Breakthrough' },
  { query: 'mountain peak achievement', label: 'Achievement & Aspiration' },
  { query: 'phoenix rising transformation', label: 'Transformation & Renewal' },
  { query: 'ocean waves potential', label: 'Flow & Potential' },
  { query: 'sunrise hope future', label: 'Hope & New Beginnings' },
  { query: 'forest path discovery', label: 'Discovery & Journey' },
  { query: 'creative light inspiration', label: 'Inspiration & Creativity' },
  { query: 'butterfly metamorphosis', label: 'Change & Evolution' }
];

// Move initialData outside component to prevent recreating on every render
const INITIAL_DATA: IA33StepData = {
  selectedImage: null,
  uploadedImage: null,
  reflection: '',
  imageTitle: ''
};

const IA_3_3_Content: React.FC<IA33ContentProps> = ({ onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const { shouldShowDemoButtons } = useTestUser();
  
  // Use workshop step data persistence hook
  const { data, updateData, saving, loaded, error, saveNow } = useWorkshopStepData('ia', 'ia-3-3', INITIAL_DATA);
  
  // Safe update data function that checks if component is mounted
  const safeUpdateData = useCallback((updates: Partial<IA33StepData>) => {
    if (isMountedRef.current) {
      updateData(updates);
    }
  }, [updateData]);
  
  // Destructure data for easier access with fallbacks
  const { 
    selectedImage = null, 
    uploadedImage = null, 
    reflection = '', 
    imageTitle = '' 
  } = data || INITIAL_DATA;

  // State for image search
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    urls: { regular: string; small: string };
    alt_description: string;
    user: { name: string };
    description?: string;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Cleanup effect to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Search images from database (curated fallback)
  const searchImages = async (query: string) => {
    if (!query.trim()) return;
    
    console.log('🔍 Starting search for:', query);
    setSearchLoading(true);
    setSearchError(null);

    try {
      // Use curated fallback images based on search terms
      const getSearchResults = (searchTerm: string) => {
        console.log('🔍 Processing search term:', searchTerm);
        const searchTermLower = searchTerm.toLowerCase();
        
        if (searchTermLower.includes('seed') || searchTermLower.includes('growth') || searchTermLower.includes('breakthrough')) {
          return [
            {
              id: 'seed-1',
              urls: { 
                regular: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
                small: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'
              },
              alt_description: 'Small plant growing through concrete crack',
              user: { name: 'Unsplash' },
              description: 'Seedling breaking through concrete'
            },
            {
              id: 'seed-2', 
              urls: {
                regular: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80',
                small: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&q=80'
              },
              alt_description: 'Green sprout emerging from soil',
              user: { name: 'Unsplash' },
              description: 'New growth emerging from earth'
            }
          ];
        }
        
        if (searchTermLower.includes('flame') || searchTermLower.includes('fire') || searchTermLower.includes('spark')) {
          return [
            {
              id: 'flame-1',
              urls: {
                regular: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80',
                small: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80'
              },
              alt_description: 'Phoenix rising from flames',
              user: { name: 'Unsplash' },
              description: 'Phoenix rising from fire'
            },
            {
              id: 'flame-2',
              urls: {
                regular: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80',
                small: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80'
              },
              alt_description: 'Bright flame against dark background',
              user: { name: 'Unsplash' },
              description: 'Single flame burning bright'
            }
          ];
        }

        if (searchTermLower.includes('potential') || searchTermLower.includes('depth') || searchTermLower.includes('mirror')) {
          return [
            {
              id: 'potential-1',
              urls: {
                regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                small: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
              },
              alt_description: 'Mountain peak reaching toward the sky',
              user: { name: 'Unsplash' },
              description: 'Mountain peak representing potential'
            },
            {
              id: 'potential-2',
              urls: {
                regular: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
                small: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80'
              },
              alt_description: 'Light rays breaking through storm clouds',
              user: { name: 'Unsplash' },
              description: 'Light revealing hidden depths'
            }
          ];
        }

        // Default results for any other search terms - always return something
        console.log('🔍 Using default results for search term:', searchTermLower);
        return [
          {
            id: 'default-1',
            urls: { 
              regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
              small: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
            },
            alt_description: 'Mountain peak reaching toward the sky',
            user: { name: 'Unsplash' },
            description: 'Mountain peak in clouds'
          },
          {
            id: 'default-2',
            urls: { 
              regular: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
              small: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80'
            },
            alt_description: 'Light rays breaking through storm clouds',
            user: { name: 'Unsplash' },
            description: 'Light breaking through darkness'
          },
          {
            id: 'default-3',
            urls: { 
              regular: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
              small: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'
            },
            alt_description: 'Small plant growing through concrete crack',
            user: { name: 'Unsplash' },
            description: 'Seedling breaking through concrete'
          }
        ];
      };

      const results = getSearchResults(query);
      console.log('🔍 Search results:', results);
      setSearchResults(results);

    } catch (error) {
      console.error('Error searching images:', error);
      setSearchError('Failed to search images. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('🔍 Enter pressed, searching for:', searchQuery);
      searchImages(searchQuery);
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    console.log('🔍 Search button clicked, searching for:', searchQuery);
    searchImages(searchQuery);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          safeUpdateData({
            uploadedImage: ev.target.result as string,
            selectedImage: null // Clear image bank selection if uploading
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image selection from bank
  const handleSelectImage = (url: string) => {
    try {
      safeUpdateData({
        selectedImage: url,
        uploadedImage: null // Clear uploaded image if selecting from bank
      });
    } catch (error) {
      console.error('Error updating image selection:', error);
    }
  };

  // Handle save and navigation
  const handleSave = async () => {
    try {
      // Force immediate save of current data
      await saveNow();
      // Navigate to next step
      if (onNext) onNext('ia-3-4');
    } catch (error) {
      console.error('Failed to save IA 3-3 data:', error);
    }
  };

  // Demo data function for test users
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    // Fill with demo data using seedling image
    safeUpdateData({
      selectedImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      uploadedImage: null,
      reflection: "This represents my resilience and ability to find creative solutions even in rigid environments. The part of me that wants expression is my innovative problem-solving nature.",
      imageTitle: "Breakthrough"
    });
    
    console.log('IA 3-3 Content filled with demo visualization data');
  };

  // Handle "Choose Different Image" action
  const chooseDifferentImage = () => {
    try {
      safeUpdateData({
        selectedImage: null,
        uploadedImage: null
      });
      setSearchResults([]);
      setSearchQuery('');
      setSearchError(null);
    } catch (error) {
      console.error('Error clearing image selection:', error);
    }
  };

  // Determine which image to preview
  const previewImage = uploadedImage || selectedImage;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Visualizing Your Potential
      </h1>
      
      {/* Purpose Section */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-8 border border-purple-200">
        <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
        <p className="text-gray-700 leading-relaxed">
          This exercise develops your capacity for symbolic visualization and inner potential recognition. You'll select or upload an image that represents an underused quality within you, then reflect on what it reveals about your creative potential.
        </p>
      </div>

      {/* Video Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="ia"
          stepId="ia-3-3"
          title="Visualizing Your Potential"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>
      
      {/* Upload or Choose an Image Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">📋 Upload or Choose an Image</h2>
        <p className="text-gray-700 mb-6">
          Select or upload an image that reflects something within you — a quality, energy, or capacity 
          that feels present but underused.
        </p>

        {/* Upload Section (Primary Option) */}
        <div className="mb-8">
          <div className="mb-3 text-sm text-gray-700 font-medium flex items-center">
            🔒 Upload your own image
          </div>
          <p className="text-xs text-gray-500 mb-3">(e.g., symbolic photo, drawing, graphic)</p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer"
            onChange={handleImageUpload}
          />
        </div>

        {/* Search Section */}
        <div className="mb-8 pt-6 border-t border-gray-200">
          <div className="mb-3 text-sm text-gray-700 font-medium">
            🔍 Search our image bank
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search images (try: potential, flame, depth, seed, spark, mirror, growth)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="flex-1 px-4 py-3"
            />
            <Button
              type="button"
              onClick={handleSearchClick}
              disabled={!searchQuery.trim() || searchLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tag suggestions: potential, flame, depth, seed, spark, mirror, growth (Press Enter or click Search)
          </p>

          {/* Search Error */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-700 text-sm">{searchError}</p>
            </div>
          )}

          {/* Search Loading */}
          {searchLoading && (
            <div className="flex justify-center items-center h-32 mt-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Searching images...</span>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {searchResults.map((img) => (
                  <div key={img.id} className="space-y-2">
                    <button
                      type="button"
                      className={`w-full border-2 rounded-lg p-1 focus:outline-none transition-all ${
                        selectedImage === img.urls.regular 
                          ? 'border-purple-600 ring-2 ring-purple-200' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => handleSelectImage(img.urls.regular)}
                      title={img.alt_description}
                    >
                      <img 
                        src={img.urls.small} 
                        alt={img.alt_description} 
                        className="w-full h-24 object-cover rounded"
                      />
                    </button>
                    <p className="text-xs text-gray-500 text-center px-1">
                      {img.description || img.alt_description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Box */}
        {previewImage && (
          <div className="pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700 mb-3 font-medium">Preview Box:</div>
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={previewImage}
                alt="Selected preview"
                className="w-48 h-48 object-cover rounded-lg border-2 border-purple-300 shadow-lg"
              />
              <div className="flex-1 space-y-3">
                <p className="text-xs text-gray-500 italic">
                  Optional: crop, replace, or redraw
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Describe Your Inner Potential Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">Describe Your Inner Potential</h2>
        <Label className="block mb-3 text-gray-700 font-medium">
          What does this image reveal about a part of you that wants expression or strength?
        </Label>
        <Textarea
          className="w-full mb-6 min-h-[120px]"
          value={reflection}
          onChange={(e) => safeUpdateData({ reflection: e.target.value })}
          placeholder="This image represents..."
        />
        
        <div className="border-t border-gray-200 pt-6">
          <Label className="block mb-3 text-gray-700 font-medium">
            Choose one word to title your image (e.g., Emergence, Spark, Flow):
          </Label>
          <Input
            value={imageTitle}
            onChange={(e) => safeUpdateData({ imageTitle: e.target.value })}
            placeholder="Enter one word..."
          />
        </div>
      </div>

      {/* Example Section */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">EXAMPLE:</h3>
        <div className="flex items-start space-x-4">
          <img 
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80"
            alt="Seedling breaking through concrete"
            className="w-16 h-16 object-cover rounded-lg border border-gray-300"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Image:</strong> A seedling breaking through concrete
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Reflection:</strong> This represents my resilience and ability to find creative solutions even in rigid 
              environments. The part of me that wants expression is my innovative problem-solving nature.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Word:</strong> Breakthrough
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {shouldShowDemoButtons && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={fillWithDemoData}
            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Demo Data
          </Button>
        )}
        
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
          disabled={saving || !previewImage || !reflection || !imageTitle}
        >
          {saving ? 'Saving...' : '● Save Image & Reflection'}
        </Button>
        
        <Button
          onClick={chooseDifferentImage}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-3"
          disabled={!previewImage}
        >
          ● Choose Different Image
        </Button>
        
        <Button
          onClick={() => onNext && onNext('ia-3-4')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
          disabled={!previewImage || !reflection || !imageTitle}
        >
          ● Continue to Next Step
        </Button>
      </div>
    </div>
  );
};

export default IA_3_3_Content;
