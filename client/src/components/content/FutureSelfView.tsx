import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Search, Upload, Save, Image, X, Plus, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VideoPlayer from './VideoPlayer';
import FutureSelfReflections from './FutureSelfReflections';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { searchUnsplash } from '@/services/api-services';
import { useToast } from '@/hooks/use-toast';
import { ContentViewProps } from '../../shared/types';
import {
  saveFutureSelfComplete,
  loadFutureSelfComplete,
  FutureSelfImageData
} from '@/utils/saveFutureSelfReflections';

// Use the imported interface for type consistency
type ImageData = FutureSelfImageData;

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  // Image selection state - keeping this functionality
  const [imageData, setImageData] = useState<ImageData>({
    selectedImages: [],
    imageMeaning: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const { astCompleted: workshopCompleted, loading: workshopLoading, isWorkshopLocked } = useWorkshopStatus();

  // Module-specific locking for step 3-2 (Module 3 - locked after completion)
  const stepId = "3-2";
  const isStepLocked = isWorkshopLocked('ast', stepId);
  const { toast } = useToast();


  // Load existing image data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const { imageData: loadedImageData } = await loadFutureSelfComplete();
        console.log('📖 Loaded image data:', loadedImageData);
        setImageData(loadedImageData);
      } catch (error) {
        console.error('❌ Error loading Future Self data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save function for image data
  const saveImageData = async () => {
    if (isStepLocked) {
      console.log('🔒 Step is locked, skipping save');
      return;
    }

    try {
      console.log('💾 Saving image data...', imageData);
      // We need to get the text reflections from FutureSelfReflections component
      // For now, we'll save just the image data with properly formatted empty reflections
      const emptyReflections = {
        'future-self-1': '',
        'future-self-2': '',
        'future-self-3': ''
      };
      const result = await saveFutureSelfComplete(emptyReflections, imageData);

      if (result.success) {
        console.log('✅ Image data saved successfully');
      } else {
        console.error('❌ Failed to save image data:', result.error);
        toast({
          title: "Save failed",
          description: "Failed to save your image selections. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error saving image data:', error);
      toast({
        title: "Save failed",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Auto-save when image data changes
  useEffect(() => {
    console.log('🔄 Auto-save check:', {
      isLoading,
      selectedImages: imageData.selectedImages.length,
      imageMeaning: imageData.imageMeaning.trim().length
    });

    // Auto-save when we have images selected OR meaningful text (matching server validation)
    const hasSelectedImages = imageData.selectedImages.length > 0;
    const hasMeaningfulText = imageData.imageMeaning.trim().length >= 5; // Match server validation
    const shouldSave = hasSelectedImages || hasMeaningfulText;

    if (!isLoading && shouldSave) {
      console.log('⏰ Auto-save scheduled in 1 second...');
      // Debounce the save to avoid too many calls
      const timeoutId = setTimeout(() => {
        console.log('💾 Auto-save triggered with validation criteria met');
        saveImageData();
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
      console.log('❌ Auto-save skipped - validation criteria not met:', {
        hasSelectedImages,
        hasMeaningfulText,
        shouldSave
      });
    }
  }, [imageData, isLoading]);

  // Image handling functions
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchUnsplash(searchQuery, 20);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No images found",
          description: `No results found for "${searchQuery}". Try different search terms.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
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
    if (imageData.selectedImages.length >= 2) {
      toast({
        title: "Maximum images reached",
        description: "You can select up to 2 images maximum.",
        variant: "destructive"
      });
      return;
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

    setImageData(prev => ({
      ...prev,
      selectedImages: [...prev.selectedImages, newImage]
    }));
  };

  const removeImage = (id: string) => {
    setImageData(prev => ({
      ...prev,
      selectedImages: prev.selectedImages.filter(img => img.id !== id)
    }));
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

    // Check if we already have 2 images
    if (imageData.selectedImages.length >= 2) {
      toast({
        title: "Maximum images reached",
        description: "You can select up to 2 images maximum.",
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
          url: uploadResult.imageUrl,
          source: 'upload',
          searchTerm: 'uploaded image',
          photoId: uploadResult.photoId,
          credit: null
        };

        setImageData(prev => ({
          ...prev,
          selectedImages: [...prev.selectedImages, newImage]
        }));
        
        toast({
          title: "Image uploaded!",
          description: "Your image has been added.",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading your future self journey...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Workshop Completion Banner */}
      {workshopCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto mt-4">
          <div className="flex items-center gap-3">
            <ChevronRight className="text-green-600" size={20} />
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

      {/* Full-width container */}
      <div className="w-full px-6 py-8">
        
        {/* Demo button - Only for test users - TEMPORARILY COMMENTED OUT */}
        {/*
        {!workshopCompleted && shouldShowDemoButtons && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={fillDemoData}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              Demo
            </Button>
          </div>
        )}
        */}

        {/* Video Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="3-2"
            youtubeId="Lb-h2icusB4"
            autoplay={true}
          />
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Future Self Journey</h1>
          
          {/* Image Selection Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Visualize Your Future Self</h2>
            
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
              <p className="text-indigo-800 text-sm leading-relaxed">
                Select 1–2 images that symbolize your future self. They can be literal (e.g., a workplace) or symbolic (e.g., a sunrise).
              </p>
            </div>

            {/* Display selected images */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Your Selected Images ({imageData.selectedImages.length}/2)</h3>
              </div>

              {imageData.selectedImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imageData.selectedImages.map(image => (
                    <div key={image.id} className="relative group">
                      <img 
                        src={image.url} 
                        alt="Future self visualization" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      {!workshopCompleted && (
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-70 hover:opacity-100 transition"
                          title="Remove image"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      )}

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
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No images selected yet</p>
                  <p className="text-sm text-gray-400 mt-1">Upload your own images or search for images below</p>
                </div>
              )}
            </div>

            {/* Search interface */}
            {!workshopCompleted && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-medium mb-4">Find Images</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium">Search for images:</h4>
                      {isStepLocked && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={isStepLocked ? "Step is locked - view only" : "e.g. sunrise, office, mountain, success"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isSearching && searchQuery.trim() && !isStepLocked) {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        className={`flex-1 ${isStepLocked ? 'opacity-60' : ''}`}
                        disabled={isStepLocked}
                      />
                      <Button
                        variant="default"
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim() || isStepLocked}
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
                    <label className="flex items-center gap-2 px-4 py-2 rounded-md border bg-gray-50 text-gray-700 border-gray-300 cursor-pointer hover:bg-gray-100 transition">
                      <Upload className="h-4 w-4" />
                      <span>Choose file</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                  </div>

                  {/* Display search results */}
                  {searchResults.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Search results for "{searchQuery}":</h4>
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
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                              <div className="bg-white rounded-full p-1 transform scale-0 group-hover:scale-100 transition-transform">
                                <Plus className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Image meaning */}
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
              <h3 className="text-lg font-medium text-purple-800 mb-3">What do these images represent?</h3>
              <p className="text-sm text-purple-600 mb-4">
                Explain what these images symbolize about your future self and aspirations.
              </p>
              <Textarea
                value={imageData.imageMeaning}
                onChange={(e) => {
                  console.log('📝 Image meaning text changed:', e.target.value);
                  setImageData(prev => ({ ...prev, imageMeaning: e.target.value }));
                }}
                placeholder={isStepLocked ? "This step is locked - view only" : "These images represent my future self because..."}
                className={`w-full p-2 min-h-[120px] border border-gray-300 rounded-md ${
                  isStepLocked ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''
                }`}
                disabled={isStepLocked}
                readOnly={isStepLocked}
              />
              {/* Manual save button for testing */}
              {!isStepLocked && (
                <div className="mt-3">
                  <Button
                    onClick={saveImageData}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save Image Data
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Reflections Header */}
        {!workshopCompleted && (
          <div className="section-headers-tabs-60 mb-4">
            <div className="section-headers-pill-60 section-headers-pill-60--reflection">
              <div className="section-headers-pill-60__strip" aria-hidden="true" />
              <div className="section-headers-pill-60__box">🤔 Reflections</div>
            </div>
          </div>
        )}

        {/* Progressive Future Self Reflections */}
        {!workshopCompleted && (
          <FutureSelfReflections
            onComplete={() => {
              // Navigate to final reflection step
              markStepCompleted('3-2');
              setCurrentContent('final-reflection');
            }}
            setCurrentContent={setCurrentContent}
            markStepCompleted={markStepCompleted}
          />
        )}

        {/* Show completed message if workshop is done */}
        {workshopCompleted && (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <ChevronRight className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Future Self Reflections Complete
              </h3>
              <p className="text-green-700">
                Your future self reflections have been completed and saved. 
                You can review your responses in your holistic report.
              </p>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setCurrentContent('final-reflection')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Continue to Final Reflection <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FutureSelfView;