import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MainContainer from '@/components/layout/MainContainer';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { WellbeingLadder } from '@/components/visualization/WellbeingLadder';
import { BookOpen, Lightbulb, PenLine, ChevronDown, ChevronUp, Search, X, Image, Upload, Save, SplitSquareVertical } from 'lucide-react';
import { searchUnsplash, searchPexels, searchImages } from '@/services/api-services';

// Define interface for selected image
interface SelectedImage {
  id: string;
  url: string;
  source: 'upload' | 'unsplash' | 'pexels'; // Image source
  searchTerm?: string; // The search term used to find this image
  file?: File; // Only for uploaded images
  credit?: {
    photographer?: string;
    photographerUrl?: string;
    sourceUrl?: string;
  };
}

// Define type for visualization data
interface Visualization {
  id?: number;
  userId?: number;
  wellbeingLevel?: number;
  wellbeingFactors?: string;
  oneYearVision?: string;
  specificChanges?: string;
  quarterlyProgress?: string;
  quarterlyActions?: string;
  potentialImageUrls?: string;
  imageMeaning?: string;
  futureVision?: string;
  optimizedFlow?: string;
  happyLifeAchievements?: string;
  futureStatement?: string;
}

export default function VisualizeYourself() {
  const [activeTab, setActiveTab] = useState("ladder");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [wellbeingLevel, setWellbeingLevel] = useState<number>(5);
  const { toast } = useToast();
  
  // Image selection state
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageSource, setImageSource] = useState<'upload' | 'unsplash' | 'pexels' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeSource, setActiveSource] = useState<'unsplash' | 'pexels'>('unsplash');
  const [isSearching, setIsSearching] = useState(false);
  
  // UI state
  const [showSearchInterface, setShowSearchInterface] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageMeaning, setImageMeaning] = useState('');
  
  // Track if component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // QueryClient for cache invalidation
  const queryClient = useQueryClient();
  
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Get visualization data
  const { data: visualization, isLoading: visualizationLoading } = useQuery<Visualization>({
    queryKey: ['/api/visualization'],
    staleTime: 60000, // 1 minute
  });
  
  // Save visualization mutation
  const saveVisualization = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/visualization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save visualization data');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      toast({
        title: "Saved successfully",
        description: "Your images have been saved to your profile",
        variant: "default"
      });
      setIsSaving(false);
    },
    onError: (error) => {
      console.error('Error saving visualization:', error);
      toast({
        title: "Save failed",
        description: "There was a problem saving your images",
        variant: "destructive"
      });
      setIsSaving(false);
    }
  });
  
  // Load saved data when visualization data is available
  useEffect(() => {
    setIsMounted(true);
    
    if (visualization) {
      // Load image meaning
      if (visualization.imageMeaning) {
        setImageMeaning(visualization.imageMeaning);
      }
      
      // Load saved images
      if (visualization.potentialImageUrls) {
        try {
          const savedImages = JSON.parse(visualization.potentialImageUrls as string) as SelectedImage[];
          if (Array.isArray(savedImages) && savedImages.length > 0) {
            setSelectedImages(savedImages);
          }
        } catch (error) {
          console.error('Error parsing saved images:', error);
        }
      }
    }
    
    return () => setIsMounted(false);
  }, [visualization]);

  // Check if a tab should be disabled
  const isTabDisabled = (tabId: string): boolean => {
    // The first tab is always accessible
    if (tabId === "ladder") return false;

    // For sequential progression
    const tabSequence = ["ladder", "potential", "future"];
    const currentIndex = tabSequence.indexOf(activeTab);
    const targetIndex = tabSequence.indexOf(tabId);

    // Can only access tabs that are:
    // 1. The current tab
    // 2. Already completed tabs
    // 3. The next tab in sequence
    return !completedTabs.includes(tabId) && tabId !== activeTab && targetIndex > currentIndex + 1;
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (!isTabDisabled(tabId)) {
      setActiveTab(tabId);
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs(prev => [...prev, activeTab]);
      }
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Check file size (max 10MB each)
      const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
      if (validFiles.length !== newFiles.length) {
        toast({
          title: "File size exceeded",
          description: "Some files were not added because they exceed the 10MB limit.",
          variant: "destructive"
        });
      }

      // Limit to 5 images total
      const filesToAdd = validFiles.slice(0, 5 - selectedImages.length);
      
      // Create object URLs and add to selected images
      const newSelectedImages = filesToAdd.map(file => ({
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        source: 'upload' as const,
        searchTerm: file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' '), // Use filename as search term
        file
      }));
      
      setSelectedImages(prev => [...prev, ...newSelectedImages]);
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    const imageToRemove = selectedImages.find(img => img.id === id);
    
    // If it's an uploaded image, revoke the object URL to prevent memory leaks
    if (imageToRemove && imageToRemove.source === 'upload') {
      URL.revokeObjectURL(imageToRemove.url);
    }

    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };
  
  // Search for images from all sources
  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Search across both APIs simultaneously
      const results = await searchImages(query, 15);
      
      // Set results based on selected source
      if (imageSource === 'unsplash') {
        console.log('Setting Unsplash results:', results.unsplash.length);
        setSearchResults(results.unsplash);
      } else if (imageSource === 'pexels') {
        console.log('Setting Pexels results:', results.pexels.length);
        setSearchResults(results.pexels);
      } else if (imageSource === 'all') {
        // Show results from the active source tab
        console.log('Setting All Sources results for', activeSource, 
          activeSource === 'unsplash' ? results.unsplash.length : results.pexels.length);
        setSearchResults(activeSource === 'unsplash' ? results.unsplash : results.pexels);
      } else if (imageSource === 'upload') {
        toast({
          title: "Upload Images",
          description: "Please use the file selector to upload your own images.",
          variant: "default"
        });
      }
      
      // If no results were found, show a message
      if ((imageSource === 'unsplash' && results.unsplash.length === 0) || 
          (imageSource === 'pexels' && results.pexels.length === 0) ||
          (imageSource === 'all' && activeSource === 'unsplash' && results.unsplash.length === 0) ||
          (imageSource === 'all' && activeSource === 'pexels' && results.pexels.length === 0)) {
        toast({
          title: "No images found",
          description: `No images found for "${searchQuery}". Try a different search term.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error searching images:', error);
      toast({
        title: "Error searching images",
        description: "There was a problem searching for images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Select an image from search results
  const selectImage = (image: any) => {
    // Don't add more than 5 images
    if (selectedImages.length >= 5) {
      toast({
        title: "Maximum images reached",
        description: "You can select up to 5 images. Remove some to add more.",
        variant: "default"
      });
      return;
    }
    
    // Check for duplicates - both Unsplash and Pexels use 'id' field
    const imageExists = selectedImages.some(img => img.id === image.id);
    
    if (imageExists) {
      toast({
        title: "Image already selected",
        description: "This image is already in your selection.",
        variant: "default"
      });
      return;
    }
    
    let newImage: SelectedImage;
    
    if (imageSource === 'unsplash' || (imageSource === 'all' && activeSource === 'unsplash')) {
      // Handle Unsplash image format
      console.log('Selecting Unsplash image:', image);
      newImage = {
        id: image.id,
        url: image.urls.regular,
        source: 'unsplash',
        searchTerm: searchQuery, // Save the search term used to find this image
        credit: {
          photographer: image.user.name,
          photographerUrl: image.user.links.html,
          sourceUrl: image.links.html
        }
      };
      
      setSelectedImages(prev => [...prev, newImage]);
      
      toast({
        title: "Image selected",
        description: "The image has been added to your collection.",
        variant: "default"
      });
    } else if (imageSource === 'pexels' || (imageSource === 'all' && activeSource === 'pexels')) {
      // Handle Pexels image format
      console.log('Selecting Pexels image:', image);
      newImage = {
        id: String(image.id), // Ensure id is a string for consistency
        url: image.src?.large || image.src?.medium || image.src?.large2x || image.src?.original,
        source: 'pexels',
        searchTerm: searchQuery, // Save the search term used to find this image
        credit: {
          photographer: image.photographer,
          photographerUrl: image.photographer_url,
          sourceUrl: image.url
        }
      };
      
      setSelectedImages(prev => [...prev, newImage]);
      
      toast({
        title: "Image selected",
        description: "The image has been added to your collection.",
        variant: "default"
      });
    }
  };
  
  // Save selected images to user profile
  const handleSaveImages = () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image before saving.",
        variant: "default"
      });
      return;
    }
    
    setIsSaving(true);
    
    // Prepare visualization data
    const visualizationData = {
      potentialImageUrls: JSON.stringify(selectedImages),
      imageMeaning: imageMeaning,
      // Preserve existing visualization data
      ...(visualization || {})
    };
    
    // Save visualization data
    saveVisualization.mutate(visualizationData);
  };

  // Show loading state
  if (userLoading || visualizationLoading) {
    return (
      <MainContainer showStepNavigation={false} className="bg-white">
        <div className="text-center">
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer showStepNavigation={false} className="bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-700">Visualize Yourself</h1>
        <p className="text-gray-600">Engage your imagination to envision your growth and potential</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="ladder" data-value="ladder">
              <BookOpen className="h-4 w-4 mr-2" />
              Ladder of Wellbeing
            </TabsTrigger>
            <TabsTrigger value="potential" data-value="potential" disabled={isTabDisabled("potential")}>
              {isTabDisabled("potential") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Visualizing Potential
                </span>
              ) : (
                <span className="flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Visualizing Potential
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="future" data-value="future" disabled={isTabDisabled("future")}>
              {isTabDisabled("future") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Your Future Self
                </span>
              ) : (
                <span className="flex items-center">
                  <PenLine className="h-4 w-4 mr-2" />
                  Your Future Self
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Ladder of Wellbeing Tab */}
          <TabsContent value="ladder" className="space-y-6">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe 
                src="https://www.youtube.com/embed/yidsMx8B678" 
                title="Ladder of Wellbeing" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-80 rounded border border-gray-200"
              ></iframe>
            </div>

            <div className="prose max-w-none">
              <h2>The Cantril Ladder of Wellbeing</h2>
              <p>
                This self-reflection helps you assess your current life satisfaction and envision realistic personal growth over the next year. Using the 
                Cantril Ladder (0 = worst possible life, 10 = best possible life), you'll identify where you stand now, where you aim to be in one year, and 
                the steps you'll take each quarter to climb toward that vision.
              </p>

              <p>
                The Cantril Ladder is simple but offers profound insights across all age groups and life stages. For younger participants, it helps establish positive growth trajectories. For mid-career individuals, it provides clarity during transitions. For experienced participants, it reveals new possibilities for contribution and legacy. Just thinking about the relationship between where we are and where we want to be helps set a foundation for self-actualization.
              </p>
            </div>

            {/* New Wellbeing Ladder Component with interactive sliders */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Your Wellbeing Ladder</h3>
              
              {/* Import the WellbeingLadder component */}
              <WellbeingLadder 
                onCurrentValueChange={(value: number) => setWellbeingLevel(value)}
                onFutureValueChange={(value: number) => {}}
              />
            </div>
            
            <div className="space-y-6">
              <div className="mt-6">
                <Label htmlFor="factors" className="text-base font-medium">
                  2. What key factors have shaped your current rating?
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  What are the main elements contributing to your current well-being?
                </p>
                <Textarea
                  id="factors"
                  placeholder="Your answer"
                  className="min-h-[100px] mt-2"
                  defaultValue={visualization?.wellbeingFactors || ''}
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="one-year-vision" className="text-base font-medium">
                  3. What specific improvements do you envision for your future position?
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  What achievements or changes would make your life better in one year?
                </p>
                <Textarea
                  id="one-year-vision"
                  placeholder="Your answer"
                  className="min-h-[100px] mt-2"
                  defaultValue={visualization?.oneYearVision || ''}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="changes" className="text-base font-medium">
                  4. What specific changes will be evident at this higher position?
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  How will your experience be noticeably different in tangible ways?
                </p>
                <Textarea
                  id="changes"
                  placeholder="Your answer"
                  className="min-h-[100px] mt-2"
                  defaultValue={visualization?.specificChanges || ''}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">QUARTERLY MILESTONES</h3>
                <div>
                  <Label htmlFor="quarterly-progress" className="text-base font-medium">
                    5. What progress would you expect to see in 3 months?
                  </Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Name one specific indicator that you're moving up the ladder.
                  </p>
                  <Textarea
                    id="quarterly-progress"
                    placeholder="Your answer"
                    className="min-h-[100px] mt-2"
                    defaultValue={visualization?.quarterlyProgress || ''}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="actions" className="text-base font-medium">
                  6. What actions will you commit to this quarter to begin climbing?
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Name 1-2 concrete steps you'll take before your first quarterly check-in.
                </p>
                <Textarea
                  id="actions"
                  placeholder="Your answer"
                  className="min-h-[100px] mt-2"
                  defaultValue={visualization?.quarterlyActions || ''}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleTabChange("potential")}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Visualizing Potential
              </Button>
            </div>
          </TabsContent>

          {/* Visualizing Potential Tab */}
          <TabsContent value="potential" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Visualizing Your Potential</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-1"
              >
                {showInstructions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showInstructions ? "Hide Instructions" : "Show Instructions"}
              </Button>
            </div>
            
            {showInstructions && (
              <div className="prose max-w-none bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <p>
                  This exercise helps you turn your one-year vision into something visible. By choosing or creating images that represent your future self,
                  you engage your imagination and activate your brain's visualization centers in powerful ways.
                </p>
                <p>
                  Select 1-5 images that represent your ideal future self one year from now. These might be symbolic, aspirational, or representative 
                  of specific achievements you're working toward.
                </p>
                <p className="font-medium">Guidelines:</p>
                <ul>
                  <li>Choose images that evoke positive emotions</li>
                  <li>Look for images that align with your ladder reflection</li>
                  <li>Select a variety of images that represent different aspects of your future vision</li>
                  <li>You can upload your own images or search for images from Unsplash</li>
                </ul>
              </div>
            )}
            
            {/* Display selected images */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Your Selected Images ({selectedImages.length}/5)</h3>
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
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-70 hover:opacity-100 transition"
                        title="Remove image"
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
            
            {/* Search interface toggle */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Find Images</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSearchInterface(!showSearchInterface)}
              >
                {showSearchInterface ? "Hide Search" : "Show Search"}
              </Button>
            </div>
            
            {showSearchInterface && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-4 mb-4">
                  {/* Search input always appears first */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Search for images:</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. achievement, success, growth"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim() && !isSearching) {
                            handleSearch();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        variant="default" 
                        size="default"
                        onClick={() => searchQuery && handleSearch()}
                        disabled={isSearching || !searchQuery.trim()}
                        className="flex items-center gap-1"
                      >
                        <Search className="h-4 w-4" /> {isSearching ? "Searching..." : "Search"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image source options appear second */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Image Source:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={imageSource === 'all' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setImageSource('all')}
                        className="flex items-center gap-1"
                      >
                        <Search className="h-4 w-4" /> Search
                      </Button>
                      <Button
                        variant={imageSource === 'upload' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setImageSource('upload')}
                        className="flex items-center gap-1"
                      >
                        <Upload className="h-4 w-4" /> Upload
                      </Button>
                    </div>
                  </div>
                  
                  {/* Upload input only appears when upload source is selected */}
                  {imageSource === 'upload' && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Upload Images:</h4>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleImageUpload}
                        disabled={selectedImages.length >= 5}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum 5 images, 10MB each
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Source tabs for All Sources option */}
                {imageSource === 'all' && searchResults.length > 0 && (
                  <div className="mt-4 border-b border-gray-200">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setActiveSource('unsplash')}
                        className={`px-4 py-2 text-sm font-medium ${
                          activeSource === 'unsplash'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-indigo-500 hover:border-indigo-300'
                        }`}
                      >
                        Unsplash
                      </button>
                      <button
                        disabled
                        className="px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                      >
                        Pexels <span className="ml-1 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">Coming Soon</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Search Results: <span className="text-gray-500">
                        {searchResults.length} images for "{searchQuery}"
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {searchResults.map((image: any) => (
                        <div 
                          key={image.id} 
                          className="relative cursor-pointer group"
                          onClick={() => selectImage(image)}
                        >
                          <img 
                            src={
                              // Handle both Unsplash and Pexels image formats
                              (imageSource === 'unsplash' || (imageSource === 'all' && activeSource === 'unsplash'))
                                ? image.urls?.small
                                : (image.src?.medium || image.src?.small || image.src?.tiny || image.src?.original || '')
                            } 
                            alt={image.alt_description || image.photographer || 'Search result image'}
                            className="w-full h-32 object-cover rounded border border-gray-200 hover:border-indigo-400 transition"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all">
                            <div className="text-white opacity-0 group-hover:opacity-100 font-medium">
                              Click to select
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Image meaning question - only shown when images are selected */}
            {selectedImages.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Label htmlFor="image-meaning" className="text-base font-medium">
                  What do these images represent to you?
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Explain how your selected images connect to your future vision
                </p>
                <Textarea
                  id="image-meaning"
                  placeholder="Write about the significance of your chosen images..."
                  className="min-h-[120px] mt-2"
                  value={imageMeaning}
                  onChange={(e) => setImageMeaning(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => handleTabChange("ladder")}
              >
                Back: Ladder of Wellbeing
              </Button>
              <Button 
                className="bg-indigo-700 hover:bg-indigo-800"
                onClick={() => handleTabChange("future")}
              >
                Next: Your Future Self
              </Button>
            </div>
          </TabsContent>

          {/* Your Future Self Tab */}
          <TabsContent value="future" className="space-y-6">
            <div className="prose max-w-none">
              <h2>Your Future Self</h2>
              <p>
                Based on the vision you've explored through the wellbeing ladder and your selected images, now it's time to articulate your future self more clearly.
                By writing about this future version of yourself, you create a cognitive bridge that helps your brain recognize opportunities and pathways to 
                realize this potential.
              </p>
              <p>
                These reflections help integrate the foundational elements of your wellbeing journey and visualization into a coherent narrative for personal growth.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="future-vision" className="text-base font-medium">
                  1. How have you optimized your experience of flow in this vision?
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Describe how your strengths and ideal operating conditions are being expressed
                </p>
                <Textarea
                  id="future-vision"
                  placeholder="Your answer"
                  className="min-h-[100px] mt-2"
                  defaultValue={visualization?.optimizedFlow || ''}
                />
              </div>

              <div>
                <Label htmlFor="happy-life" className="text-base font-medium">
                  2. What will you have achieved that contributes to your wellbeing?
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Name 2-3 specific achievements or experiences that will mark your progress
                </p>
                <Textarea
                  id="happy-life"
                  placeholder="Your answer"
                  className="min-h-[100px] mt-2"
                  defaultValue={visualization?.happyLifeAchievements || ''}
                />
              </div>

              <div>
                <Label htmlFor="future-statement" className="text-base font-medium">
                  3. Create a "My Future Self" Statement
                </Label>
                <p className="text-sm text-gray-500 mb-2">
                  Write a paragraph in present tense that captures what your life is like 12 months from now
                </p>
                <Textarea
                  id="future-statement"
                  placeholder="My Future Self statement..."
                  className="min-h-[150px] mt-2"
                  defaultValue={visualization?.futureStatement || ''}
                />
              </div>
            </div>

            <div className="mt-6 p-5 bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
              <p className="text-gray-700 mb-4">
                Consider creating reminders that keep this vision active in your daily awareness:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Save your selected images as a phone or desktop wallpaper</li>
                <li>Schedule monthly calendar reminders with your Future Self statement</li>
                <li>Create a vision board using your selected images</li>
                <li>Record yourself reading your Future Self statement</li>
              </ul>
            </div>

            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => handleTabChange("potential")}
              >
                Back: Visualizing Potential
              </Button>
              <Button 
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Complete Visualization
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainContainer>
  );
}