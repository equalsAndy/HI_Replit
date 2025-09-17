import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Search, Upload, Save, Image, X, Plus, Lock, Check } from 'lucide-react';
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
  // Image selection state
  const [imageData, setImageData] = useState<ImageData>({
    selectedImages: [],
    imageMeaning: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  
  // NEW: Workflow state management
  const [imagesConfirmed, setImagesConfirmed] = useState(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  
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
        setImageData(loadedImageData);
        
        // Check if images were already confirmed and reflection submitted
        if (loadedImageData.selectedImages.length > 0) {
          setImagesConfirmed(true);
        }
        if (loadedImageData.imageMeaning && loadedImageData.imageMeaning.trim().length >= 5) {
          setReflectionSubmitted(true);
        }
      } catch (error) {
        console.error('Error loading Future Self data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save function for image data (without auto-saving on every keystroke)
  const saveImageData = async () => {
    if (isStepLocked) {
      return false;
    }

    try {
      // We need to get the text reflections from FutureSelfReflections component
      // For now, we'll save just the image data with properly formatted empty reflections
      const emptyReflections = {
        'future-self-1': '',
        'future-self-2': '',
        'future-self-3': ''
      };
      const result = await saveFutureSelfComplete(emptyReflections, imageData);

      if (result.success) {
        return true;
      } else {
        toast({
          title: "Save failed",
          description: "Failed to save your image selections. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

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
        description: "To add another image, please delete one first.",
        variant: "default"
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
        description: "To add another image, please delete one first.",
        variant: "default"
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

  // NEW: Handle "These are my images" confirmation
  const handleConfirmImages = async () => {
    if (imageData.selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image before proceeding.",
        variant: "destructive"
      });
      return;
    }

    const saved = await saveImageData();
    if (saved) {
      setImagesConfirmed(true);
      toast({
        title: "Images confirmed!",
        description: "Now describe what these images represent.",
        duration: 3000
      });
    }
  };

  // NEW: Handle reflection submission
  const handleSubmitReflection = async () => {
    if (imageData.imageMeaning.trim().length < 5) {
      toast({
        title: "Reflection too short",
        description: "Please provide a more detailed description of what these images represent.",
        variant: "destructive"
      });
      return;
    }

    const saved = await saveImageData();
    if (saved) {
      setReflectionSubmitted(true);
      toast({
        title: "Reflection saved!",
        description: "Now you can continue with your future self reflections.",
        duration: 3000
      });
    }
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
          
          {/* STEP 1: Image Selection */}
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
                {imagesConfirmed && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Confirmed</span>
                  </div>
                )}
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

            {/* Search interface - always show for adding/changing images */}
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
                        disabled={isStepLocked}
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
                            onClick={() => !isStepLocked && addImage(image)}
                          >
                            <img 
                              src={image.urls.regular} 
                              alt={`Search result for ${searchQuery}`}
                              className="w-full h-32 object-cover"
                            />
                            {!isStepLocked && (
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                                <div className="bg-white rounded-full p-1 transform scale-0 group-hover:scale-100 transition-transform">
                                  <Plus className="h-5 w-5 text-indigo-600" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images confirmation section - moved to bottom */}
            {!workshopCompleted && imageData.selectedImages.length > 0 && (
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-indigo-800">Ready to proceed with these images?</h3>
                  {imagesConfirmed && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Confirmed</span>
                    </div>
                  )}
                </div>
                
                {!imagesConfirmed ? (
                  <div className="space-y-3">
                    <p className="text-sm text-indigo-600">
                      You have selected {imageData.selectedImages.length} image{imageData.selectedImages.length > 1 ? 's' : ''}. 
                      You can still add more images or remove existing ones above.
                    </p>
                    <Button
                      onClick={handleConfirmImages}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      These are my images
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-indigo-600">
                      Images confirmed! You can still change your selection by removing images above and selecting new ones.
                    </p>
                    <Button
                      onClick={() => {
                        setImagesConfirmed(false);
                        setReflectionSubmitted(false);
                        setImageData(prev => ({ ...prev, imageMeaning: '' }));
                      }}
                      variant="outline"
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      Change my image selection
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Image meaning reflection - only show after images confirmed */}
            {imagesConfirmed && !reflectionSubmitted && (
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
                <h3 className="text-lg font-medium text-purple-800 mb-3">What do these images represent?</h3>
                <p className="text-sm text-purple-600 mb-4">
                  Explain what these images symbolize about your future self and aspirations.
                </p>
                <Textarea
                  value={imageData.imageMeaning}
                  onChange={(e) => setImageData(prev => ({ ...prev, imageMeaning: e.target.value }))}
                  placeholder={isStepLocked ? "This step is locked - view only" : "These images represent my future self because..."}
                  className={`w-full p-2 min-h-[120px] border border-gray-300 rounded-md mb-4 ${
                    isStepLocked ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''
                  }`}
                  disabled={isStepLocked}
                  readOnly={isStepLocked}
                />
                <Button
                  onClick={handleSubmitReflection}
                  disabled={isStepLocked || imageData.imageMeaning.trim().length < 5}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                >
                  Submit Reflection
                </Button>
              </div>
            )}

            {/* Show completed reflection if already submitted */}
            {reflectionSubmitted && (
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
                <h3 className="text-lg font-medium text-purple-800 mb-3">What these images represent:</h3>
                <div className="bg-white p-4 rounded border">
                  <p className="text-gray-700">{imageData.imageMeaning}</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 mt-3">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Reflection submitted</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: Reflections section - only show after reflection submitted */}
        {reflectionSubmitted && !workshopCompleted && (
          <>
            <div className="section-headers-tabs-60 mb-4">
              <div className="section-headers-pill-60 section-headers-pill-60--reflection">
                <div className="section-headers-pill-60__strip" aria-hidden="true" />
                <div className="section-headers-pill-60__box">🤔 Reflections</div>
              </div>
            </div>

            <FutureSelfReflections
              onComplete={() => {
                // Navigate to final reflection step
                markStepCompleted('3-2');
                setCurrentContent('final-reflection');
              }}
              setCurrentContent={setCurrentContent}
              markStepCompleted={markStepCompleted}
            />
          </>
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