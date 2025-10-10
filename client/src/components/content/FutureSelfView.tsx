import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Search, Upload, Image, X, Plus, Lock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VideoPlayer from './VideoPlayer';
import FutureSelfReflections from './FutureSelfReflections';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { searchUnsplash } from '@/services/api-services';
import { useToast } from '@/hooks/use-toast';
import { ContentViewProps } from '../../shared/types';
import { saveFutureSelfComplete, loadFutureSelfComplete, FutureSelfImageData } from '@/utils/saveFutureSelfReflections';

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const { toast } = useToast();
  const { astCompleted: workshopCompleted } = useWorkshopStatus();

  // Local state for search (no auto-save)
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Note: Local reflection state removed - now handled by FutureSelfReflections component

  // Image data and workflow state
  const [imageData, setImageData] = useState<FutureSelfImageData>({
    selectedImages: [],
    imageMeaning: ''
  });
  const [imagesConfirmed, setImagesConfirmed] = useState(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [uploadDescription, setUploadDescription] = useState('');
  const [showDescriptionPrompt, setShowDescriptionPrompt] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState<any>(null);



  // Load existing data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { reflections, imageData: loadedImageData } = await loadFutureSelfComplete();
        setImageData(loadedImageData);
        // Set workflow state based on existing data
        if (loadedImageData.selectedImages.length > 0) {
          setImagesConfirmed(true);
        }

        if (reflections['future-self-1']) {
          setReflectionSubmitted(true);
        }
      } catch (error) {
        console.error('Error loading Future Self data:', error);
      }
    };

    loadData();
  }, []);



  // FIXED: Handle search query changes without triggering auto-save or search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
    setSearchQuery(e.target.value); // Update search query for button search
    // NO auto-search here
  };

  // Search for images (only on button click)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchUnsplash(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search for images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Save image data
  const saveImageData = async (updatedImageData: FutureSelfImageData) => {
    try {
      const reflections = {}; // No reflection text to save here
      await saveFutureSelfComplete(reflections, updatedImageData);
    } catch (error) {
      console.error('Error saving image data:', error);
    }
  };

  // FIXED: Clear search after adding image
  const addImage = (image: any) => {
    if (imageData.selectedImages.length >= 4) {
      toast({
        title: "Maximum reached",
        description: "You can select up to 4 images.",
        variant: "destructive"
      });
      return;
    }

    const newImage = {
      id: image.id,
      url: image.urls.regular,
      source: 'unsplash',
      searchTerm: searchQuery,
      description: image.description || image.alt_description || searchQuery || 'Selected image',
      credit: {
        photographer: image.user.name,
        photographerUrl: image.user.links.html,
        sourceUrl: image.links.html
      }
    };

    const updatedImageData = {
      ...imageData,
      selectedImages: [...imageData.selectedImages, newImage]
    };

    setImageData(updatedImageData);

    // Auto-save the new image selection
    saveImageData(updatedImageData);

    // FIXED: Clear search after adding image
    setSearchResults([]);
    setLocalSearchQuery('');
    setSearchQuery('');

    toast({
      title: "Image added",
      description: "Image added to your selection.",
    });
  };

  // FIXED: Clear search results and reset search when images removed
  const removeImage = (id: string) => {
    const updatedImageData = {
      ...imageData,
      selectedImages: imageData.selectedImages.filter(img => img.id !== id)
    };

    setImageData(updatedImageData);

    // Auto-save the updated image selection
    saveImageData(updatedImageData);

    // FIXED: Clear search results and reset search when images removed
    setSearchResults([]);
    setLocalSearchQuery('');
    setSearchQuery('');

    // If no images left, reset workflow state
    if (updatedImageData.selectedImages.length === 0) {
      setImagesConfirmed(false);
      setReflectionSubmitted(false);
    }

    toast({
      title: "Image removed",
      description: "Image removed from your selection.",
    });
  };

  // Confirm image selection
  const handleConfirmImages = async () => {
    if (imageData.selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image before confirming.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingImages(true);
    try {
      await saveImageData(imageData);
      setImagesConfirmed(true);
      toast({
        title: "Images confirmed",
        description: "Your image selection has been saved.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save your images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingImages(false);
    }
  };

  // Save uploaded image with description
  const saveUploadedImage = async () => {
    if (!pendingUploadData) return;

    const newImage = {
      id: pendingUploadData.photoId.toString(),
      url: pendingUploadData.imageUrl,
      source: 'upload',
      searchTerm: 'uploaded image',
      description: uploadDescription.trim() || pendingUploadData.filename || 'Uploaded image',
      photoId: pendingUploadData.photoId,
      credit: null
    };

    const updatedImageData = {
      ...imageData,
      selectedImages: [...imageData.selectedImages, newImage]
    };

    setImageData(updatedImageData);
    await saveImageData(updatedImageData);

    // Reset state
    setShowDescriptionPrompt(false);
    setPendingUploadData(null);
    setUploadDescription('');

    toast({
      title: "Image uploaded",
      description: "Your image has been uploaded successfully.",
    });
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageData.selectedImages.length >= 2) {
      toast({
        title: "Maximum reached",
        description: "You can select up to 2 images.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;

        // Upload to server
        const uploadResponse = await fetch('/api/workshop-data/upload-visualization-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            imageData: base64,
            filename: file.name
          })
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        // Store upload data temporarily and show description prompt
        setPendingUploadData({
          photoId: uploadResult.photoId,
          imageUrl: uploadResult.imageUrl,
          filename: file.name
        });
        setShowDescriptionPrompt(true);
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload your image. Please try again.",
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

    // Reset the input
    e.target.value = '';
  };



  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Visualizing Your Future Self</h1>

      {/* Video Player */}
      <div className="mb-8">
        <VideoPlayer
          workshopType="allstarteams"
          stepId="3-2"
          title="Visualizing Your Future Self"
          aspectRatio="16:9"
        />
      </div>

      {/* Workshop completion banner */}
      {workshopCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Lock className="text-green-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Workshop Completed</h3>
              <p className="text-sm text-green-600">Your responses are locked for review only.</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 Instructions */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-blue-900 mb-4 flex items-center gap-3">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">1</span>
          Choose Your Image(s)
        </h2>
        <div className="prose prose-blue max-w-none">
          <p className="text-blue-800 text-lg leading-relaxed mb-4">
            Images can evoke possibilities that words alone cannot. Choose one or two that symbolize the future self you're moving toward.
          </p>
          <ul className="text-blue-700 space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Select 1–2 images that capture who you imagine becoming.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>They can be <strong>literal</strong> (a role, place, activity) or <strong>symbolic</strong> (a sunrise, a bridge).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Trust your instinct — choose what feels right for your vision.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Selected Images Display */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Your Selected Images</h3>
        {imageData.selectedImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {imageData.selectedImages.map((image) => (
              <div key={image.id} className="relative">
                <img
                  src={image.url}
                  alt="Future self visualization"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
                {!workshopCompleted && (
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-70 hover:opacity-100 transition"
                    title="Remove image"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No images selected yet</p>
            <p className="text-sm text-gray-400 mt-1">Search for images below to get started</p>
          </div>
        )}
      </div>

      {/* "I'm done choosing images" button - show after first image selected */}
      {!workshopCompleted && imageData.selectedImages.length > 0 && !imagesConfirmed && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium text-indigo-800">
                {imageData.selectedImages.length} image{imageData.selectedImages.length > 1 ? 's' : ''} selected
              </h3>
              <p className="text-sm text-indigo-600 mt-1">
                You can select up to 4 images total.
              </p>
            </div>
            <Button
              onClick={handleConfirmImages}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
              disabled={isSavingImages}
            >
              <Check className="w-4 h-4 mr-2" />
              {isSavingImages ? 'Saving...' : "I'm done choosing images"}
            </Button>
          </div>
        </div>
      )}

      {/* Search interface - hide when 4 images selected or after confirmation */}
      {!workshopCompleted && !imagesConfirmed && imageData.selectedImages.length < 4 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
          <h3 className="text-lg font-medium mb-4">Find Images</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={localSearchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSearching && localSearchQuery.trim()) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search for images that represent your future self..."
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !localSearchQuery.trim()}
                className="px-6"
              >
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  className="px-6"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Search results for "{searchQuery}":</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Show option to change selection after confirmation */}
      {!workshopCompleted && imagesConfirmed && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Images confirmed</span>
            </div>
            <Button
              onClick={() => {
                setImagesConfirmed(false);
                setReflectionSubmitted(false);
                // FIXED: Clear search when changing selection
                setSearchResults([]);
                setLocalSearchQuery('');
                setSearchQuery('');
              }}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm px-4 py-2"
            >
              Change my image selection
            </Button>
          </div>
        </div>
      )}

      {/* Future Self Reflection Component - Direct access after image confirmation */}
      {imagesConfirmed && (
        <FutureSelfReflections
          imageCount={imageData.selectedImages.length}
          onComplete={() => {
            setReflectionSubmitted(true);
          }}
          setCurrentContent={setCurrentContent}
          markStepCompleted={markStepCompleted}
        />
      )}

      {/* Upload Description Prompt Modal */}
      {showDescriptionPrompt && pendingUploadData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Image Description (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Help us understand what this image represents to you. This description will be used to personalize your report.
            </p>
            <Input
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="e.g., A peaceful lake representing inner calm..."
              className="mb-4"
              maxLength={200}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveUploadedImage();
                }
              }}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  // Skip description and save with default
                  saveUploadedImage();
                }}
              >
                Skip
              </Button>
              <Button
                onClick={saveUploadedImage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FutureSelfView;