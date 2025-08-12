import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { FileText, RefreshCw, Loader2 } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { searchUnsplash } from '@/services/api-services';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';

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

// Helper function to get step title from navigation data
const getStepTitle = (stepId: string): string => {
  for (const section of imaginalAgilityNavigationSections) {
    const step = section.steps.find(s => s.id === stepId);
    if (step) {
      return step.title;
    }
  }
  return stepId; // Fallback to step ID if title not found
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // State for tab management
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');

  // Cleanup effect to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Search images using Unsplash API
  const searchImages = async (query: string) => {
    if (!query.trim()) return;
    
    console.log('🔍 Starting Unsplash search for:', query);
    setSearchLoading(true);
    setSearchError(null);

    try {
      // Use the real Unsplash API
      const results = await searchUnsplash(query, 12); // Get 12 results
      console.log('🔍 Unsplash search results:', results);
      setSearchResults(results || []);

    } catch (error) {
      console.error('Error searching Unsplash:', error);
      setSearchError(`Failed to search images: ${error.message || 'Please try again.'}`);
      
      // Fallback to curated images if Unsplash fails
      console.log('🔍 Falling back to curated images...');
      const fallbackResults = [
        {
          id: 'fallback-1',
          urls: { 
            regular: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
            small: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'
          },
          alt_description: 'Small plant growing through concrete crack',
          user: { name: 'Curated' },
          description: 'Seedling breaking through concrete'
        },
        {
          id: 'fallback-2',
          urls: { 
            regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            small: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
          },
          alt_description: 'Mountain peak reaching toward the sky',
          user: { name: 'Curated' },
          description: 'Mountain peak in clouds'
        },
        {
          id: 'fallback-3',
          urls: { 
            regular: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
            small: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80'
          },
          alt_description: 'Light rays breaking through storm clouds',
          user: { name: 'Curated' },
          description: 'Light breaking through darkness'
        }
      ];
      setSearchResults(fallbackResults);
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

  // Handle continue with auto-save
  const handleContinue = async () => {
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
    
    // Fill with demo data using nature breaking through concrete image
    safeUpdateData({
      selectedImage: '/assets/artem-shuba-yd5ZyiRRpa8-unsplash.jpg',
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
      <div className="bg-white rounded-xl shadow-lg border border-purple-200 mb-8">
        <div className="p-8 pb-0">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">📋 Upload or Choose an Image</h2>
          <p className="text-gray-700 mb-6">
            Select or upload an image that reflects something within you — a quality, energy, or capacity 
            that feels present but underused.
          </p>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔒 Upload Your Own
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔍 Search Image Bank
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-8 pb-8">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-3">(e.g., symbolic photo, drawing, graphic)</p>
                <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="w-full h-14 text-sm text-gray-600 cursor-pointer
                              file:mr-4 file:h-14 file:py-0 file:px-6 file:border-0 file:border-r file:border-gray-200
                              file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 
                              hover:file:bg-purple-100 file:cursor-pointer file:flex file:items-center
                              border-0 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Example Section - moved to Upload tab */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">EXAMPLE:</h3>
                <div className="flex items-start space-x-4">
                  <img 
                    src="/assets/artem-shuba-yd5ZyiRRpa8-unsplash.jpg"
                    alt="Nature breaking through concrete"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Image:</strong> Nature breaking through concrete
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Word:</strong> Breakthrough
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Reflection:</strong> This represents my resilience and ability to find creative solutions even in rigid 
                      environments. The part of me that wants expression is my innovative problem-solving nature.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
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
              <p className="text-xs text-gray-500">
                Tag suggestions: potential, flame, depth, seed, spark, mirror, growth (Press Enter or click Search)
              </p>

              {/* Search Error */}
              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{searchError}</p>
                </div>
              )}

              {/* Search Loading */}
              {searchLoading && (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Searching images...</span>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
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
                        title={img.alt_description || img.description}
                      >
                        <img 
                          src={img.urls.small} 
                          alt={img.alt_description || img.description || 'Image'} 
                          className="w-full h-24 object-cover rounded"
                        />
                      </button>
                      <p className="text-xs text-gray-500 text-center px-1">
                        {img.description || img.alt_description || 'Inspiration image'}
                      </p>
                      <p className="text-xs text-gray-400 text-center">
                        by {img.user?.name || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Your Image Section */}
      {previewImage && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">Your Image</h2>
          <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <img
              src={previewImage}
              alt="Your selected image"
              className="w-64 h-64 object-cover rounded-lg border-2 border-purple-300 shadow-lg flex-shrink-0"
            />
            <div className="flex-1 space-y-4">
              <div>
                <Label className="block mb-3 text-gray-700 font-medium">
                  Choose one word to title your image (e.g., Emergence, Spark, Flow):
                </Label>
                <Input
                  value={imageTitle}
                  onChange={(e) => safeUpdateData({ imageTitle: e.target.value })}
                  placeholder="Enter one word..."
                  className="w-full max-w-md"
                />
              </div>
              <Button
                onClick={chooseDifferentImage}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                ● Choose Different Image
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Describe Your Inner Potential Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">Describe Your Inner Potential</h2>
        <Label className="block mb-3 text-gray-700 font-medium">
          What does this image reveal about a part of you that wants expression or strength?
        </Label>
        <Textarea
          className="w-full min-h-[120px]"
          value={reflection}
          onChange={(e) => safeUpdateData({ reflection: e.target.value })}
          placeholder="This image represents..."
        />
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
          onClick={handleContinue}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
          disabled={saving || !previewImage || !reflection || !imageTitle}
        >
          {saving ? 'Saving...' : `Continue to ${getStepTitle('ia-3-4')}`}
        </Button>
      </div>
    </div>
  );
};

export default IA_3_3_Content;
