import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ArrowDown, ArrowUp, Search, Upload, Save, Image, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VideoPlayer from './VideoPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { validateAtLeastOneField } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useFloatingAI } from '@/components/ai/FloatingAIProvider';
import { useTestUser } from '@/hooks/useTestUser';
import { searchUnsplash } from '@/services/api-services';
import { useToast } from '@/hooks/use-toast';
import { safeConsoleLog, filterPhotoDataFromObject } from '@shared/photo-data-filter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define ContentViewProps interface
interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  starCard?: any;
}

// Define the new data structure for Future Self exercise
interface FutureSelfData {
  direction: 'backward' | 'forward';
  twentyYearVision: string;
  tenYearMilestone: string;
  fiveYearFoundation: string;
  flowOptimizedLife: string;
  completedAt?: Date;
}

// Define data structure for visualizing potential
interface VisualizingData {
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
  
  // Visualizing potential state
  const [visualizingData, setVisualizingData] = useState<VisualizingData>({
    selectedImages: [],
    imageMeaning: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasUnsavedImageChanges, setHasUnsavedImageChanges] = useState(false);
  const [lastSavedImageState, setLastSavedImageState] = useState<{images: any[], meaning: string} | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  
  // No save status tracking - user controls saving via Next button
  const [isLoading, setIsLoading] = useState(true);
  const { astCompleted: workshopCompleted, loading: workshopLoading } = useWorkshopStatus();
  const { updateContext, setCurrentStep: setFloatingAIStep } = useFloatingAI();
  const { shouldShowDemoButtons } = useTestUser();
  const { toast } = useToast();
  
  // Validation state
  const [validationError, setValidationError] = useState<string>('');

  // Check if current state differs from last saved state
  const checkForUnsavedImageChanges = () => {
    if (!lastSavedImageState) {
      // If we have any data but no saved state, we have unsaved changes
      const hasData = visualizingData.selectedImages.length > 0 || visualizingData.imageMeaning.trim().length > 0;
      setHasUnsavedImageChanges(hasData);
      return;
    }
    
    // Compare current state with last saved state
    const imagesDiffer = JSON.stringify(visualizingData.selectedImages) !== JSON.stringify(lastSavedImageState.images);
    const meaningDiffer = visualizingData.imageMeaning.trim() !== lastSavedImageState.meaning.trim();
    
    setHasUnsavedImageChanges(imagesDiffer || meaningDiffer);
  };

  // Track changes to visualizing data
  useEffect(() => {
    checkForUnsavedImageChanges();
  }, [visualizingData.selectedImages, visualizingData.imageMeaning, lastSavedImageState]);

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
          // Map legacy data to new structure
          const loadedData: FutureSelfData = {
            direction: futureResult.data.direction || 'backward',
            twentyYearVision: futureResult.data.twentyYearVision || futureResult.data.futureSelfDescription || '',
            tenYearMilestone: futureResult.data.tenYearMilestone || '',
            fiveYearFoundation: futureResult.data.fiveYearFoundation || '',
            flowOptimizedLife: futureResult.data.flowOptimizedLife || futureResult.data.visualizationNotes || ''
          };
          setFormData(loadedData);
        }
        
        // Load visualizing potential data
        const visualizingResponse = await fetch('/api/workshop-data/visualizing-potential', {
          credentials: 'include'
        });
        const visualizingResult = await visualizingResponse.json();
        
        if (visualizingResult.success && visualizingResult.data) {
          safeConsoleLog('FutureSelfView: Loading visualizing data:', filterPhotoDataFromObject(visualizingResult.data));
          
          if (visualizingResult.data.selectedImages) {
            // Process images to ensure database-stored images have proper URLs
            const processedImages = visualizingResult.data.selectedImages.map((image: any) => {
              if (image.source === 'upload' && image.photoId && !image.url.startsWith('http')) {
                return {
                  ...image,
                  url: `/api/photos/${image.photoId}`
                };
              }
              return image;
            });
            
            setVisualizingData({
              selectedImages: processedImages,
              imageMeaning: visualizingResult.data.imageMeaning || ''
            });
            
            // Set last saved state
            setLastSavedImageState({
              images: processedImages,
              meaning: visualizingResult.data.imageMeaning || ''
            });
          } else {
            setLastSavedImageState({ images: [], meaning: '' });
          }
        } else {
          setLastSavedImageState({ images: [], meaning: '' });
        }
      } catch (error) {
        console.log('No existing data found:', error);
        setLastSavedImageState({ images: [], meaning: '' });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExistingData();
  }, []);

  // Set up FloatingAI context for step 4-4 Future Self Journey
  useEffect(() => {
    setFloatingAIStep('4-4');
    
    updateContext({
      stepName: 'Future Self Journey',
      strengthLabel: undefined,
      questionText: undefined,
      aiEnabled: true,
      workshopContext: {
        currentStep: '4-4',
        stepName: 'Future Self Journey - Time Travel Reflection',
        previousSteps: [
          'Completed strengths assessment and discovered your Star Card',
          'Explored individual strengths in detail through reflection',
          'Learned about Flow states and completed Flow assessment',
          'Set your current and future well-being levels on the Cantril Ladder',
          'Completed Cantril Ladder reflection questions about well-being factors',
          'Selected and analyzed images that represent your future potential'
        ],
        currentTask: 'Creating a comprehensive vision of your future self through backwards or forwards thinking',
        questionContext: {
          totalReflections: 4,
          reflections: [
            {
              name: '20-Year Vision',
              description: 'The masterpiece of your life - your ultimate vision'
            },
            {
              name: '10-Year Milestone', 
              description: 'The level of mastery or influence needed to be on track'
            },
            {
              name: '5-Year Foundation',
              description: 'The capacities or conditions that need to be developing now'
            },
            {
              name: 'Flow-Optimized Life',
              description: 'How your life would look designed to support flow states'
            }
          ],
          currentDirection: formData.direction,
          exerciseContext: 'This exercise helps you imagine who you want to become and how to shape a life that supports that becoming. Use your Flow Assessment insights to guide your vision.'
        }
      }
    });
  }, [updateContext, setFloatingAIStep, formData.direction]);

  // Removed auto-save functionality - data will only save when user clicks "Next" button

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
    if (visualizingData.selectedImages.length >= 5) {
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

    setVisualizingData(prev => ({
      ...prev,
      selectedImages: [...prev.selectedImages, newImage]
    }));
  };

  const removeImage = (id: string) => {
    setVisualizingData(prev => ({
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

    // Check if we already have 5 images
    if (visualizingData.selectedImages.length >= 5) {
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
          url: uploadResult.imageUrl,
          source: 'upload',
          searchTerm: 'uploaded image',
          photoId: uploadResult.photoId,
          credit: null
        };

        setVisualizingData(prev => ({
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

  const handleSaveImages = async () => {
    if (visualizingData.selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingImages(true);
    try {
      const response = await fetch('/api/workshop-data/visualizing-potential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          selectedImages: visualizingData.selectedImages,
          imageMeaning: visualizingData.imageMeaning
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update last saved state
        setLastSavedImageState({
          images: visualizingData.selectedImages,
          meaning: visualizingData.imageMeaning
        });
        
        toast({
          title: "Images saved!",
          description: "Your image selection and meaning have been saved successfully.",
          duration: 3000
        });
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingImages(false);
    }
  };

  // Demo data function
  const fillDemoData = () => {
    const demoData: FutureSelfData = {
      direction: formData.direction,
      twentyYearVision: formData.direction === 'backward' 
        ? "I've become a respected leader who transforms organizations through human-centered innovation. My work has created lasting positive impact on thousands of people's careers and wellbeing. I'm known for building cultures where people thrive authentically."
        : "Having built on my current strengths and flow experiences, I've evolved into a visionary leader who seamlessly integrates human wisdom with technological advancement, creating environments where innovation and wellbeing flourish together.",
      tenYearMilestone: formData.direction === 'backward'
        ? "I hold a senior leadership position where I guide strategic transformation initiatives. I've developed a reputation for creating psychologically safe, high-performing teams. My expertise in human development and organizational design is widely recognized."
        : "I've reached a senior strategic role where my deep understanding of flow states and human potential drives organizational innovation. I lead teams that consistently deliver breakthrough results while maintaining exceptional wellbeing and engagement.",
      fiveYearFoundation: formData.direction === 'backward'
        ? "I'm actively developing my leadership presence and expertise in organizational psychology. I'm building networks with other forward-thinking leaders and regularly speaking about human-centered leadership approaches."
        : "I've strengthened my core capabilities in facilitation, systems thinking, and team dynamics. I'm recognized as a go-to person for complex challenges that require both analytical rigor and deep human insight.",
      flowOptimizedLife: "My life is designed around sustained periods of deep work, meaningful collaboration, and continuous learning. I have clear boundaries that protect my energy for what matters most. My work feels like an extension of my natural strengths and passions, creating a sense of effortless excellence."
    };
    
    setFormData(demoData);
    
    // Add demo visualizing data
    const demoVisualizingData = {
      selectedImages: [
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
      ],
      imageMeaning: "These images represent my vision of becoming a confident leader who creates positive change in my organization. The collaboration image reflects my strength in bringing people together and fostering teamwork. The growth images symbolize my commitment to continuous learning and helping others develop their potential. The success images represent achieving meaningful goals while maintaining balance and well-being. Together, they show my future self as someone who uses their analytical and planning strengths to create structured approaches to complex challenges while staying connected to the human side of leadership."
    };
    
    setVisualizingData(demoVisualizingData);
  };

  // Check if minimum requirements are met
  const hasMinimumContent = 
    formData.twentyYearVision.trim().length >= 10 ||
    formData.tenYearMilestone.trim().length >= 10 ||
    formData.fiveYearFoundation.trim().length >= 10 ||
    formData.flowOptimizedLife.trim().length >= 10;

  const handleSubmit = async () => {
    if (workshopCompleted) {
      // If workshop is completed, just navigate
      markStepCompleted('4-4');
      setCurrentContent('final-reflection');
      return;
    }
    
    // Validate that at least one field has content
    const fields = {
      twentyYearVision: formData.twentyYearVision,
      tenYearMilestone: formData.tenYearMilestone,
      fiveYearFoundation: formData.fiveYearFoundation,
      flowOptimizedLife: formData.flowOptimizedLife
    };
    
    const validation = validateAtLeastOneField(fields, 10);
    if (!validation.isValid) {
      setValidationError(validation.errors[0].message);
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
      markStepCompleted('4-4');
      setCurrentContent('final-reflection');
    } catch (error) {
      console.error('FutureSelfView: Error saving or completing:', error);
      // Still proceed to next step even if save fails
      markStepCompleted('4-4');
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
        
        {/* Demo button - Only for test users */}
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

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Future Self Journey</h1>
          
          {/* Visualizing Your Potential Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Visualizing Your Potential</h2>
            
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
                <h3 className="text-lg font-medium">Your Selected Images ({visualizingData.selectedImages.length}/5)</h3>
                <div className="flex items-center gap-3">
                  {hasUnsavedImageChanges && !workshopCompleted && (
                    <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
                  )}
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleSaveImages}
                    disabled={visualizingData.selectedImages.length === 0 || isSavingImages || workshopCompleted}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> 
                    {isSavingImages ? "Saving..." : "Save Images"}
                  </Button>
                </div>
              </div>

              {visualizingData.selectedImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {visualizingData.selectedImages.map(image => (
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
                        placeholder="e.g. achievement, success, growth"
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
              <h3 className="text-lg font-medium text-purple-800 mb-3">What Do These Images Mean to You?</h3>
              <p className="text-sm text-purple-600 mb-4">
                Explain what these images represent about your future vision. How do they connect to your strengths and flow state?
              </p>
              <Textarea
                value={visualizingData.imageMeaning}
                onChange={(e) => setVisualizingData(prev => ({ ...prev, imageMeaning: e.target.value }))}
                placeholder={workshopCompleted ? "This workshop is completed and locked for editing" : "These images represent my vision because..."}
                className={`w-full p-2 min-h-[120px] border border-gray-300 rounded-md ${
                  workshopCompleted ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''
                }`}
                disabled={workshopCompleted}
                readOnly={workshopCompleted}
              />
            </div>
          </div>
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-amber-900 mb-3">Purpose:</h2>
                <p className="text-amber-800 leading-relaxed mb-4">
                  This exercise helps you imagine who you want to become—and how to shape a life that supports that becoming.
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Use your Flow Assessment insights to guide your vision. You can start by looking 20 years ahead and work backward, 
                  or begin with who you are today and look forward.
                </p>
                <p className="text-amber-900 font-medium mt-4">
                  There's no right way—only your way.
                </p>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src="/future_self_image.png" 
                  alt="Future Self Timeline" 
                  className="w-48 h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="4-4"
            autoplay={true}
          />
        </div>



        {/* Step 1: Choose Your Direction */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Step 1: Choose Your Direction</h2>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <p className="text-blue-800 leading-relaxed">
              Everyone imagines differently. Some start with a bold vision and trace it back. Others build step by step from the present.
            </p>
          </div>

          {/* Direction Toggle and Demo Button */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="bg-white rounded-full p-1 border-2 border-gray-200 shadow-lg">
              <div className="flex">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDirectionChange('backward')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    formData.direction === 'backward'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Work backwards<br />
                  <span className="text-xs">20→10→5 Years</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDirectionChange('forward')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ml-1 ${
                    formData.direction === 'forward'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Work forwards<br />
                  <span className="text-xs">5→10→20 Years</span>
                </motion.button>
              </div>
            </div>
            
            {/* Demo Button - Only for test users */}
            {!workshopCompleted && shouldShowDemoButtons && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fillDemoData}
                className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
              >
                Fill with Sample Reflections
              </motion.button>
            )}
          </div>

        </div>

        {/* Step 2: Timeline Reflection Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Step 2: Explore Your Timeline</h2>
          
          {/* Reflection Cards - Vertical Layout */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={formData.direction}
              className="space-y-8"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {timelineOrder.map((item, index) => {
                const cardColors = {
                  20: 'border-purple-200 bg-purple-50',
                  10: 'border-blue-200 bg-blue-50', 
                  5: 'border-emerald-200 bg-emerald-50'
                };
                
                return (
                  <motion.div
                    key={`${formData.direction}-${item.year}`}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.9 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { 
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }
                      }
                    }}
                  >
                    <div className={`p-8 rounded-xl border-2 ${cardColors[item.year as keyof typeof cardColors]} shadow-sm hover:shadow-md transition-all duration-300`}>
                      <ReflectionCard
                        title={`${item.year} Years`}
                        question={questions[formData.direction][item.key as keyof typeof questions.backward]}
                        value={formData[item.key as keyof FutureSelfData] as string}
                        onChange={(value) => handleReflectionChange(item.key as keyof FutureSelfData, value)}
                        isActive={true}
                        index={index}
                        disabled={workshopCompleted}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flow Bridge Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Step 3: Bridge to Flow</h2>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
            <p className="text-blue-800 leading-relaxed mb-4">
              You've identified the conditions where you experience deep focus, energy, and ease.
            </p>
            <p className="text-blue-800 leading-relaxed mb-4">
              What would your life look like if it were designed to support those states more often?
            </p>
            <p className="text-blue-900 font-medium">
              Use this as a launch point for your Future Self. Let flow guide your imagination.
            </p>
          </div>
          
          <ReflectionCard
            title="Flow-Optimized Life"
            question="What would your life look like if it were designed to support flow states more often?"
            value={formData.flowOptimizedLife}
            onChange={(value) => handleReflectionChange('flowOptimizedLife', value)}
            isActive={true}
            index={0}
            disabled={workshopCompleted}
          />
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
                ? "Continue to Final Reflection"
                : hasMinimumContent 
                  ? "Save & Continue to Final Reflection"
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