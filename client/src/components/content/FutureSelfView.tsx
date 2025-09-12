import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Search, Upload, Save, Image, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VideoPlayer from './VideoPlayer';
import { validateAtLeastOneField } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { searchUnsplash } from '@/services/api-services';
import { useToast } from '@/hooks/use-toast';
import { ContentViewProps } from '../../shared/types';

// Define the new data structure for Future Self exercise
interface FutureSelfData {
  direction: 'backward' | 'forward';
  twentyYearVision: string;
  tenYearMilestone: string;
  fiveYearFoundation: string;
  flowOptimizedLife: string;
}

// Define data structure for image selection
interface ImageData {
  selectedImages: any[];
  imageMeaning: string;
}



interface ReflectionCardProps {
  title: string;
  question: string;
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  index: number;
  disabled?: boolean;
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({
  title,
  question,
  value,
  onChange,
  isActive,
  index,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{question}</p>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={disabled ? "This workshop is completed and locked for editing" : "Your reflection..."}
        className={`min-h-[140px] w-full resize-none border-gray-200 focus:border-amber-400 focus:ring-amber-400 rounded-lg ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'bg-white/80'
        }`}
        disabled={disabled}
        readOnly={disabled}
      />
    </div>
  );
};

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const [formData, setFormData] = useState<FutureSelfData>({
    direction: 'backward',
    twentyYearVision: '',
    tenYearMilestone: '',
    fiveYearFoundation: '',
    flowOptimizedLife: ''
  });
  
  // Image selection state
  const [imageData, setImageData] = useState<ImageData>({
    selectedImages: [],
    imageMeaning: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const { astCompleted: workshopCompleted, loading: workshopLoading } = useWorkshopStatus();
  const [validationError, setValidationError] = useState<string>('');
  const { toast } = useToast();


  // Load existing data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        
        // Load future self data
        const futureResponse = await fetch('/api/workshop-data/future-self', {
          credentials: 'include'
        });
        const futureResult = await futureResponse.json();
        
        if (futureResult.success && futureResult.data) {
          const loadedData: FutureSelfData = {
            direction: futureResult.data.direction || 'backward',
            twentyYearVision: futureResult.data.twentyYearVision || '',
            tenYearMilestone: futureResult.data.tenYearMilestone || '',
            fiveYearFoundation: futureResult.data.fiveYearFoundation || '',
            flowOptimizedLife: futureResult.data.flowOptimizedLife || ''
          };
          setFormData(loadedData);
        }
      } catch (error) {
        console.log('No existing data found:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExistingData();
  }, []);


  // Handle direction change
  const handleDirectionChange = (newDirection: 'backward' | 'forward') => {
    setFormData(prev => ({ ...prev, direction: newDirection }));
  };

  // Handle reflection changes
  const handleReflectionChange = (field: keyof FutureSelfData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Demo data function - SIMPLIFIED
  const fillDemoData = () => {
    const demoData: FutureSelfData = {
      direction: formData.direction,
      twentyYearVision: "I've become a respected leader who transforms organizations through human-centered innovation.",
      tenYearMilestone: "I hold a senior leadership position where I guide strategic transformation initiatives.", 
      fiveYearFoundation: "I'm actively developing my leadership presence and expertise in organizational psychology.",
      flowOptimizedLife: "My life is designed around sustained periods of deep work, meaningful collaboration, and continuous learning."
    };
    
    setFormData(demoData);
  };

  // Check if minimum requirements are met
  const hasMinimumContent = 
    formData.twentyYearVision.trim().length >= 10 || 
    formData.tenYearMilestone.trim().length >= 3;

  const handleSubmit = async () => {
    if (workshopCompleted) {
      // If workshop is completed, just navigate
      markStepCompleted('3-2');
      setCurrentContent('final-reflection');
      return;
    }
    
    // Validate that at least one field has content
    if (formData.twentyYearVision.trim().length < 10 && formData.tenYearMilestone.trim().length < 3) {
      setValidationError('Please complete either the future self reflection or capture an intention to continue.');
      return;
    }
    
    // Clear validation error
    setValidationError('');
    
    try {
      // Save the data before proceeding to next step
      const response = await fetch('/api/workshop-data/future-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('FutureSelfView: Data saved successfully before navigation');
      } else {
        console.warn('FutureSelfView: Save failed but proceeding anyway');
      }
      
      // Mark step completed and navigate regardless of save status
      markStepCompleted('3-2');
      setCurrentContent('final-reflection');
    } catch (error) {
      console.error('FutureSelfView: Error saving or completing:', error);
      // Still proceed to next step even if save fails
      markStepCompleted('3-2');
      setCurrentContent('final-reflection');
    }
  };

  // Define the timeline order based on direction
  const timelineOrder = formData.direction === 'backward' 
    ? [{ year: 20, key: 'twentyYearVision' }, { year: 10, key: 'tenYearMilestone' }, { year: 5, key: 'fiveYearFoundation' }]
    : [{ year: 5, key: 'fiveYearFoundation' }, { year: 10, key: 'tenYearMilestone' }, { year: 20, key: 'twentyYearVision' }];

  // Define questions based on direction
  const questions = {
    backward: {
      twentyYearVision: "What is the masterpiece of your life?",
      tenYearMilestone: "What level of mastery or influence must you have reached by now to be on track?",
      fiveYearFoundation: "What capacities or conditions need to be actively developing now?"
    },
    forward: {
      fiveYearFoundation: "What capacities or conditions need to be actively developing now?",
      tenYearMilestone: "What level of mastery or influence must you have reached by now to be on track?",
      twentyYearVision: "What is the masterpiece of your life?"
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
            stepId="2-3"
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
                    <h4 className="text-sm font-medium mb-2">Search for images:</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. sunrise, office, mountain, success"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isSearching && searchQuery.trim()) {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        variant="default" 
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
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
                onChange={(e) => setImageData(prev => ({ ...prev, imageMeaning: e.target.value }))}
                placeholder={workshopCompleted ? "This workshop is completed and locked for editing" : "These images represent my future self because..."}
                className={`w-full p-2 min-h-[120px] border border-gray-300 rounded-md ${
                  workshopCompleted ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''
                }`}
                disabled={workshopCompleted}
                readOnly={workshopCompleted}
              />
            </div>
          </div>
        </div>



        {/* Main reflection section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Describe Your Future Self</h2>
          
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-8">
            <p className="text-amber-800 leading-relaxed mb-4">
              Use the images you selected to guide your reflection. Write 3–4 sentences responding to these prompts:
            </p>
            <ol className="list-decimal list-inside text-amber-800 space-y-2">
              <li><strong>In 5 years, what capacities or qualities are you growing into?</strong></li>
              <li><strong>What does your life look like when aligned with flow and well-being?</strong></li>
              <li><strong>How are you contributing to others — team, family, or community?</strong></li>
            </ol>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Future Self Reflection</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Write a thoughtful response that addresses the three prompts above
                </p>
              </div>
              <Textarea
                value={formData.twentyYearVision}
                onChange={(e) => handleReflectionChange('twentyYearVision', e.target.value)}
                placeholder={workshopCompleted ? "This workshop is completed and locked for editing" : "In 5 years, I see myself growing into... My life aligned with flow looks like... I contribute to others by..."}
                className={`min-h-[200px] w-full resize-none border-gray-200 focus:border-amber-400 focus:ring-amber-400 rounded-lg ${
                  workshopCompleted ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'bg-white/80'
                }`}
                disabled={workshopCompleted}
                readOnly={workshopCompleted}
              />
            </div>
          </div>
        </div>

        {/* Intention section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Capture an Intention</h2>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <p className="text-blue-800 leading-relaxed text-center">
              Complete this sentence with one clear, actionable intention:
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="space-y-4">
                <label className="block text-lg font-medium text-gray-900 text-center">
                  The most important intention I want to carry forward is…
                </label>
                <Input
                  value={formData.tenYearMilestone}
                  onChange={(e) => handleReflectionChange('tenYearMilestone', e.target.value)}
                  placeholder={workshopCompleted ? "This workshop is completed and locked for editing" : "I intend to..."}
                  className={`w-full text-center text-lg p-4 border-gray-300 focus:border-blue-400 focus:ring-blue-400 rounded-lg ${
                    workshopCompleted ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'bg-white'
                  }`}
                  disabled={workshopCompleted}
                  readOnly={workshopCompleted}
                />
              </div>
            </div>
          </div>
        </div>

        {/* No save status display - user controls saving via Next button */}

        {/* Validation error display */}
        {validationError && (
          <div className="max-w-4xl mx-auto mb-4">
            <ValidationMessage 
              message={validationError} 
              type="error" 
              show={!!validationError}
            />
          </div>
        )}

        {/* Next Button */}
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!hasMinimumContent && !workshopCompleted}
            className={`px-8 py-3 ${
              (hasMinimumContent || workshopCompleted) 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
            size="lg"
          >
            <span>
              {workshopCompleted 
                ? "Continue to Module 2 Recap"
                : hasMinimumContent 
                  ? "Save & Continue to Module 2 Recap"
                  : "Add reflection to continue"
              }
            </span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FutureSelfView;