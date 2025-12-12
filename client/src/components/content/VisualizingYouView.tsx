import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight, Search, Upload, Save, Image, X, Plus, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { searchUnsplash, searchImages } from '@/services/api-services';
import { useToast } from '@/hooks/use-toast';
import { useTestUser } from '@/hooks/useTestUser';
import { validateTextInput } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { safeConsoleLog, filterPhotoDataFromObject } from '@shared/photo-data-filter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LockedInputWrapper } from '@/components/ui/LockedInputWrapper';

const VisualizingYouView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [imageMeaning, setImageMeaning] = useState('');
  const [localImageMeaning, setLocalImageMeaning] = useState(''); // Local state to prevent console spam
  const [isSaving, setIsSaving] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<{images: any[], meaning: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const { toast } = useToast();
  const { shouldShowDemoButtons } = useTestUser();
  const { astCompleted: workshopCompleted, loading: workshopLoading } = useWorkshopStatus();
  
  // Validation state
  const [validationError, setValidationError] = useState<string>('');

  // Check if current state differs from last saved state
  const checkForUnsavedChanges = useCallback(() => {
    if (!lastSavedState) {
      // If we haven't loaded yet, don't mark as having unsaved changes
      setHasUnsavedChanges(false);
      return;
    }
    
    // Compare current state with last saved state
    const imagesDiffer = JSON.stringify(selectedImages) !== JSON.stringify(lastSavedState.images);
    const meaningDiffer = localImageMeaning.trim() !== lastSavedState.meaning.trim(); // FIXED: Use local state
    
    const hasChanges = imagesDiffer || meaningDiffer;
    setHasUnsavedChanges(hasChanges);

    // Only log when there's an actual change, not on every keystroke
    if (hasChanges !== hasUnsavedChanges) {
      console.log('📊 VisualizingYouView: Unsaved changes check', {
        hasLastSavedState: !!lastSavedState,
        imagesDiffer,
        meaningDiffer,
        hasChanges,
        currentImagesCount: selectedImages.length,
        savedImagesCount: lastSavedState.images.length
      });
    }
  }, [selectedImages, localImageMeaning, lastSavedState]); // FIXED: Use local state in dependencies

  // Handle navigation with unsaved changes check
  const handleNavigationAttempt = (navigationFn: () => void) => {
    if (hasUnsavedChanges && !workshopCompleted) {
      setPendingNavigation(() => navigationFn);
      setShowUnsavedWarning(true);
    } else {
      navigationFn();
    }
  };

  // Handle saving before navigation
  const handleSaveAndContinue = async () => {
    if (!hasUnsavedChanges || !pendingNavigation) {
      if (pendingNavigation) pendingNavigation();
      return;
    }

    try {
      setIsSaving(true);
      await handleSaveImages();
      if (pendingNavigation) pendingNavigation();
      setShowUnsavedWarning(false);
      setPendingNavigation(null);
    } catch (error) {
      // Error is already handled in handleSaveImages
    } finally {
      setIsSaving(false);
    }
  };

  // Handle continuing without saving
  const handleContinueWithoutSaving = () => {
    if (pendingNavigation) pendingNavigation();
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  };

  // Load existing image data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      setIsLoading(true);
      try {
        safeConsoleLog('VisualizingYouView: Loading existing image data...');
        const response = await fetch('/api/workshop-data/visualizing-potential', {
          credentials: 'include'
        });
        const result = await response.json();
        safeConsoleLog('VisualizingYouView: API response:', filterPhotoDataFromObject(result));
        
        if (result.success && result.data) {
          safeConsoleLog('VisualizingYouView: Setting existing data:', filterPhotoDataFromObject(result.data));
          
          // Process images to ensure database-stored images have proper URLs
          let processedImages = [];
          if (result.data.selectedImages && Array.isArray(result.data.selectedImages)) {
            processedImages = result.data.selectedImages.map((image: any) => {
              if (image.source === 'upload' && image.photoId && !image.url.startsWith('http')) {
                // Ensure database-stored images use the correct URL format
                return {
                  ...image,
                  url: `/api/photos/${image.photoId}`
                };
              }
              return image;
            });
          }
          
          const imageMeaningText = result.data.imageMeaning || '';
          
          // Set state with loaded data
          setSelectedImages(processedImages);
          setImageMeaning(imageMeaningText);
          setLocalImageMeaning(imageMeaningText); // Sync local state
          
          // CRITICAL FIX: Set last saved state AFTER setting the actual state
          // This prevents the component from thinking there are unsaved changes
          setLastSavedState({
            images: processedImages,
            meaning: imageMeaningText
          });
          
          console.log('✅ VisualizingYouView: Data loaded successfully', {
            imagesCount: processedImages.length,
            meaningLength: imageMeaningText.length,
            hasLastSavedState: true
          });
        } else {
          console.log('VisualizingYouView: No existing data found');
          // Set empty saved state so component knows we've checked
          setLastSavedState({ images: [], meaning: '' });
        }
      } catch (error) {
        console.error('VisualizingYouView: Error loading data:', error);
        // Even on error, set empty saved state to prevent loading loops
        setLastSavedState({ images: [], meaning: '' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExistingData();
  }, []);

  // Track changes to selectedImages and localImageMeaning
  useEffect(() => {
    // Only check for changes after we've loaded initial data
    if (lastSavedState !== null) {
      checkForUnsavedChanges();
    }
  }, [selectedImages, localImageMeaning, checkForUnsavedChanges]); // FIXED: Use local state

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      console.log('🔍 Starting image search for:', searchQuery);
      // Use the actual Unsplash API
      const results = await searchUnsplash(searchQuery, 20);
      console.log('📸 Search completed successfully, found:', results.length, 'images');
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No images found",
          description: `No results found for "${searchQuery}". Try different search terms.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      toast({
        title: "Search failed",
        description: error.message || "Unable to search for images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addImage = (image: any) => {
    if (selectedImages.length >= 5) {
      return; // Max 5 images
    }

    const newImage = {
      id: image.id,
      url: image.urls.regular,
      source: 'unsplash',
      searchTerm: searchQuery,
      credit: {
        photographer: image.user.name,
        photographerUrl: image.user.links.html,
        sourceUrl: image.links.html
      }
    };

    setSelectedImages(prev => [...prev, newImage]);
  };

  const removeImage = (id: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Check if we already have 5 images
    if (selectedImages.length >= 5) {
      toast({
        title: "Maximum images reached",
        description: "You can select up to 5 images maximum.",
        variant: "destructive"
      });
      return;
    }

    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      
      try {
        // Store the image in the database via API
        const uploadResponse = await fetch('/api/workshop-data/upload-visualization-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            imageData: imageUrl,
            filename: file.name
          })
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to server');
        }

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        const newImage = {
          id: uploadResult.photoId.toString(),
          url: uploadResult.imageUrl, // This will be the database-stored image URL
          source: 'upload',
          searchTerm: 'uploaded image',
          photoId: uploadResult.photoId, // Store the database photo ID
          credit: null // No credit needed for user uploads
        };

        setSelectedImages(prev => [...prev, newImage]);
        
        toast({
          title: "Image uploaded!",
          description: "Your image has been added. Click 'Save Images' or continue to save.",
          duration: 3000
        });
      } catch (error) {
        console.error('Image upload error:', error);
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload image to server.",
          variant: "destructive"
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was an error reading your file. Please try again.",
        variant: "destructive"
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSaveImages = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image before saving.",
        variant: "destructive"
      });
      return;
    }

    // No need to sync here - we'll use localImageMeaning directly

    setIsSaving(true);
    try {
      console.log('💾 VisualizingYouView: Saving images and meaning...', {
        selectedImagesCount: selectedImages.length,
        imageMeaningLength: localImageMeaning.length
      });

      const response = await fetch('/api/workshop-data/visualizing-potential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          selectedImages,
          imageMeaning: localImageMeaning // FIXED: Use local state to prevent console spam
        })
      });

      const result = await response.json();
      console.log('💾 VisualizingYouView: Save response:', result);

      if (result.success) {
        // CRITICAL FIX: Update last saved state immediately after successful save
        setLastSavedState({
          images: [...selectedImages], // Create new array to avoid reference issues
          meaning: localImageMeaning // FIXED: Use local state value
        });

        // Sync main state with local state after successful save
        setImageMeaning(localImageMeaning);

        // Clear unsaved changes flag
        setHasUnsavedChanges(false);
        
        toast({
          title: "Images saved!",
          description: "Your image selection and meaning have been saved successfully.",
          duration: 3000
        });
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('❌ VisualizingYouView: Save error:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to add fallback demo images when API isn't working
  const addFallbackDemoImages = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    // Static demo images with proper Unsplash attribution
    const fallbackImages = [
      {
        id: 'demo-leadership',
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80',
        source: 'unsplash',
        searchTerm: 'leadership team',
        credit: {
          photographer: 'Annie Spratt',
          photographerUrl: 'https://unsplash.com/@anniespratt',
          sourceUrl: 'https://unsplash.com/photos/QckxruozjRg'
        }
      },
      {
        id: 'demo-growth',
        url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&q=80',
        source: 'unsplash',
        searchTerm: 'professional growth',
        credit: {
          photographer: 'Markus Winkler',
          photographerUrl: 'https://unsplash.com/@markuswinkler',
          sourceUrl: 'https://unsplash.com/photos/f57lx37DCM4'
        }
      },
      {
        id: 'demo-success',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
        source: 'unsplash',
        searchTerm: 'business success',
        credit: {
          photographer: 'Ben White',
          photographerUrl: 'https://unsplash.com/@benwhitephotography',
          sourceUrl: 'https://unsplash.com/photos/4K2lIP0zc_k'
        }
      }
    ];
    
    setSelectedImages(fallbackImages);
    
    const demoMeaning = "These images represent my vision of becoming a confident leader who creates positive change in my organization. The collaboration image reflects my strength in bringing people together and fostering teamwork. The growth images symbolize my commitment to continuous learning and helping others develop their potential. The success images represent achieving meaningful goals while maintaining balance and well-being. Together, they show my future self as someone who uses their analytical and planning strengths to create structured approaches to complex challenges while staying connected to the human side of leadership.";
    
    setImageMeaning(demoMeaning);
    
    toast({
      title: "Demo images added!",
      description: "Fallback demo images have been added to help you complete this step.",
      duration: 3000
    });
  };

  // Function to populate with meaningful demo data including images (API version)
  const fillWithDemoData = async () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    const demoMeaning = "These images represent my vision of becoming a confident leader who creates positive change in my organization. The collaboration image reflects my strength in bringing people together and fostering teamwork. The growth images symbolize my commitment to continuous learning and helping others develop their potential. The success images represent achieving meaningful goals while maintaining balance and well-being. Together, they show my future self as someone who uses their analytical and planning strengths to create structured approaches to complex challenges while staying connected to the human side of leadership.";
    
    setImageMeaning(demoMeaning);
    
    // Try to add demo images from Unsplash API first
    try {
      const searchTerms = ['leadership team', 'professional growth', 'business success'];
      const demoImages = [];
      
      for (const term of searchTerms) {
        try {
          const results = await searchUnsplash(term, 2);
          if (results && results.length > 0) {
            const image = results[0]; // Take first result
            const newImage = {
              id: `demo-${image.id}`,
              url: image.urls.regular,
              source: 'unsplash',
              searchTerm: term,
              credit: {
                photographer: image.user.name,
                photographerUrl: image.user.links.html,
                sourceUrl: image.links.html
              }
            };
            demoImages.push(newImage);
          }
        } catch (error) {
          console.log(`Could not fetch demo image for term: ${term}`);
        }
      }
      
      if (demoImages.length > 0) {
        setSelectedImages(demoImages);
      } else {
        // Fallback to static images if API fails
        addFallbackDemoImages();
      }
    } catch (error) {
      console.log('Demo images could not be loaded via API, using fallback images');
      addFallbackDemoImages();
    }
  };

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Visualizing Your Potential</h1>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Loading your images...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>      
      {/* Workshop Completion Banner */}
      {workshopCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Image className="text-green-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">
                Workshop complete. Your responses are locked, but you can watch videos and read your answers.
              </h3>
            </div>
            <div className="text-green-600">
              🔒
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Visualizing Your Potential</h1>

      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
        <div className="flex justify-between items-start">
          {showInstructions && (
            <div className="prose max-w-none text-sm pr-4">
              <p className="mb-1">
                This exercise helps you turn your one-year vision into something visible. Select 1-5 images that represent your ideal future self.
              </p>
              <ul className="list-disc pl-5 mb-1 text-xs space-y-0">
                <li>Choose images that evoke positive emotions</li>
                <li>Look for images that align with your ladder reflection</li>
                <li>Select a variety of images that represent different aspects of your future vision</li>
                <li>You can upload your own images or search for images from Unsplash</li>
              </ul>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? "Hide Instructions" : "Show Instructions"}
          </Button>
        </div>
      </div>

      {/* Display selected images */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Your Selected Images ({selectedImages.length}/5)</h3>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && !workshopCompleted && (
              <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
            )}
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSaveImages}
              disabled={selectedImages.length === 0 || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> 
              {isSaving ? "Saving..." : "Save Images"}
            </Button>
          </div>
        </div>

        {selectedImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {selectedImages.map(image => (
              <div key={image.id} className="relative group mb-2">
                {/* Show search term above the image */}
                {image.searchTerm && (
                  <div className="bg-gray-100 border border-gray-200 text-gray-700 text-xs p-1 mb-1 rounded">
                    <span className="font-semibold">Search:</span> <span title={image.searchTerm}>
                      {image.searchTerm.length > 25 
                        ? image.searchTerm.substring(0, 25) + '...' 
                        : image.searchTerm}
                    </span>
                  </div>
                )}

                <img 
                  src={image.url} 
                  alt="Selected visualization" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  onLoad={() => console.log('✅ Image loaded successfully:', image.url)}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', image.url);
                    // For database images, try alternative URL format
                    if (image.source === 'upload' && image.photoId) {
                      const altUrl = `/api/photos/${image.photoId}`;
                      if (e.currentTarget.src !== altUrl) {
                        console.log('🔄 Retrying with alternative URL:', altUrl);
                        e.currentTarget.src = altUrl;
                      }
                    }
                  }}
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-70 hover:opacity-100 transition"
                  title="Remove image"
                  disabled={workshopCompleted}
                  style={{ display: workshopCompleted ? 'none' : 'block' }}
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>

                {image.credit && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                    Photo by{" "}
                    <a 
                      href={image.credit.photographerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {image.credit.photographer}
                    </a>
                    {" "}on{" "}
                    <a 
                      href={image.credit.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Unsplash
                    </a>
                  </div>
                )}
                {image.source === 'upload' && !image.credit && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                    Your uploaded image
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Only show empty state if we're not loading and have confirmed no images
          !isLoading && lastSavedState && (
            <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No images selected yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload your own images or search for images below</p>
            </div>
          )
        )}
      </div>

      {/* Search interface */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
        <h3 className="text-lg font-medium mb-4">Find Images</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Search for images:</h4>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. achievement, success, growth"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSearching && searchQuery.trim() && !workshopCompleted) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="flex-1"
                disabled={workshopCompleted}
              />
              <Button 
                variant="default" 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim() || workshopCompleted}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" /> 
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* File upload option */}
          <div>
            <h4 className="text-sm font-medium mb-2">Upload your own image:</h4>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
              workshopCompleted 
                ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-gray-50 text-gray-700 border-gray-300 cursor-pointer hover:bg-gray-100'
            }`}>
              <Upload className="h-4 w-4" />
              <span>Choose file</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleFileUpload}
                disabled={workshopCompleted}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
          </div>

          {/* Display search results */}
          {searchResults.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Search results for "{searchQuery}":</h4>
              <LockedInputWrapper stepId="3-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {searchResults.map(image => (
                    <div
                      key={image.id}
                      className="relative group rounded-md overflow-hidden border border-gray-200 cursor-pointer"
                      onClick={() => addImage(image)}
                    >
                    <img 
                      src={image.urls.regular} 
                      alt={`Search result for ${searchQuery}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', image.urls.regular);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                      <div className="bg-white rounded-full p-1 transform scale-0 group-hover:scale-100 transition-transform">
                        <Plus className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </LockedInputWrapper>
            </div>
          )}

          {/* API status message */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Image Search:</strong> Powered by Unsplash API. If search isn't working, try the "Add Demo Images" button or describe your vision in the text area below.
            </p>
            <div className="mt-2 flex items-center gap-2">
              {shouldShowDemoButtons && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addFallbackDemoImages}
                  disabled={workshopCompleted}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  Add Demo Images
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image meaning */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
        <h3 className="text-lg font-medium text-purple-800 mb-3">What Do These Images Mean to You?</h3>
        <p className="text-sm text-purple-600 mb-4">
          Explain what these images represent about your future vision. How do they connect to your strengths and flow state?
        </p>
        <textarea
          value={localImageMeaning}
          onChange={(e) => setLocalImageMeaning(e.target.value)}
          placeholder={workshopCompleted ? "This workshop is completed and locked for editing" : "These images represent my vision because..."}
          className={`w-full p-2 min-h-[120px] border border-gray-300 rounded-md ${
            workshopCompleted ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''
          }`}
          disabled={workshopCompleted}
          readOnly={workshopCompleted}
        />
      </div>

      {/* Validation error display */}
      {validationError && (
        <div className="mb-4">
          <ValidationMessage 
            message={validationError} 
            type="error" 
            show={!!validationError}
          />
        </div>
      )}

      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          {shouldShowDemoButtons && !workshopCompleted && (
            <Button 
              variant="outline"
              size="sm"
              onClick={fillWithDemoData}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Use Demo Data
            </Button>
          )}
          <Button 
            onClick={() => {
              const navigationFn = async () => {
                if (workshopCompleted) {
                  // If workshop is completed, just navigate
                  markStepCompleted('4-3');
                  setCurrentContent("future-self");
                  return;
                }
                
                // Validate that user has selected at least one image OR provided image meaning
                if (selectedImages.length === 0 && localImageMeaning.trim().length < 10) {
                  setValidationError('Please select at least one image or provide a description of what your future vision means to you');
                  return;
                }
                
                // Clear validation error
                setValidationError('');
                
                // Save data before proceeding if there are unsaved changes
                if (hasUnsavedChanges) {
                  console.log('VisualizingYouView: Saving data before proceeding to next step...');
                  try {
                    await handleSaveImages();
                  } catch (error) {
                    console.error('VisualizingYouView: Save error but proceeding anyway:', error);
                  }
                }
                
                markStepCompleted('4-3');
                setCurrentContent("future-self");
              };
              
              handleNavigationAttempt(navigationFn);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {workshopCompleted ? 'Continue to Future Self' : 'Next: Your Future Self'} <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning Dialog */}
      <Dialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes to your images or description. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleContinueWithoutSaving}
              disabled={isSaving}
            >
              Continue Without Saving
            </Button>
            <Button
              onClick={handleSaveAndContinue}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save and Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VisualizingYouView;