import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { BookOpen, Lightbulb, PenLine } from 'lucide-react';
import { createApi } from 'unsplash-js';

// Define interface for selected image
interface SelectedImage {
  id: string;
  url: string;
  source: 'upload' | 'unsplash' | 'pexels'; // Image source
  file?: File; // Only for uploaded images
  credit?: {
    photographer?: string;
    photographerUrl?: string;
    sourceUrl?: string;
  };
}

// Initialize Unsplash client - you'd need to get an API key for production
const unsplashApi = createApi({
  // In production, you would use an environment variable for the API key
  accessKey: 'your-unsplash-access-key-here',
});

export default function VisualizeYourself() {
  const [activeTab, setActiveTab] = useState("ladder");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const [wellbeingLevel, setWellbeingLevel] = useState<number>(5);
  const { toast } = useToast();
  
  // Image selection state
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageSource, setImageSource] = useState<'upload' | 'unsplash' | 'pexels'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });

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
  
  // Search for images
  const searchImages = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      if (imageSource === 'unsplash') {
        const result = await unsplashApi.search.getPhotos({
          query: searchQuery,
          perPage: 20,
        });
        
        if (result.errors) {
          console.error('Unsplash API errors:', result.errors);
          toast({
            title: "Error searching images",
            description: "There was a problem connecting to Unsplash. Please try again later.",
            variant: "destructive"
          });
        } else {
          setSearchResults(result.response?.results || []);
        }
      } else if (imageSource === 'pexels') {
        // For now, showing a message that Pexels API key is needed
        // In a real application, you would implement the Pexels API call here
        toast({
          title: "Pexels API",
          description: "To use Pexels, you'll need to add a Pexels API key.",
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
    
    const imageExists = selectedImages.some(img => 
      (imageSource === 'unsplash' && img.id === image.id) ||
      (imageSource === 'pexels' && img.id === image.id)
    );
    
    if (imageExists) {
      toast({
        title: "Image already selected",
        description: "This image is already in your selection.",
        variant: "default"
      });
      return;
    }
    
    let newImage: SelectedImage;
    
    if (imageSource === 'unsplash') {
      newImage = {
        id: image.id,
        url: image.urls.regular,
        source: 'unsplash',
        credit: {
          photographer: image.user.name,
          photographerUrl: image.user.links.html,
          sourceUrl: image.links.html
        }
      };
    } else if (imageSource === 'pexels') {
      // Placeholder for Pexels integration
      newImage = {
        id: image.id,
        url: image.src.medium,
        source: 'pexels',
        credit: {
          photographer: image.photographer,
          photographerUrl: image.photographer_url,
          sourceUrl: image.url
        }
      };
    } else {
      return; // Unknown source
    }
    
    setSelectedImages(prev => [...prev, newImage]);
  };

  // Show loading state
  if (userLoading) {
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
            <div className="prose max-w-none">
              <h2>Visualizing Your Potential</h2>
              <p>
                This exercise helps you turn your one-year vision into something visible. By choosing or creating images that represent your future self,
                you engage your imagination — and activate your growth. Your imagery ought to be positive and aspirational.
              </p>

              <h3 className="mt-6">Instructions:</h3>
              <ul>
                <li>Select 1-5 images that represent your future self.</li>
                <li>You can upload your own images or search for images from Unsplash or Pexels.</li>
                <li>Choose imagery that feels meaningful and aspirational to you.</li>
                <li>Supported image types for upload: JPG, PNG, or GIF. Max 10MB per file.</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Choose Your Potential Images</h3>
              
              {/* Image Source Selector */}
              <div className="flex space-x-2 mb-6">
                <Button 
                  variant={imageSource === 'upload' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setImageSource('upload')}
                >
                  Upload Images
                </Button>
                <Button 
                  variant={imageSource === 'unsplash' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setImageSource('unsplash')}
                >
                  Unsplash
                </Button>
                <Button 
                  variant={imageSource === 'pexels' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setImageSource('pexels')}
                >
                  Pexels
                </Button>
              </div>
              
              {/* Upload Interface */}
              {imageSource === 'upload' && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload images that represent the version of you you're growing into. These can be photos, symbols, art, or anything meaningful to you.
                  </p>
                  <Label htmlFor="image-upload" className="block">
                    <Button variant="outline" className="mr-4">Choose Files</Button>
                    <span className="text-sm text-gray-500">
                      {selectedImages.filter(img => img.source === 'upload').length === 0 
                        ? "No files chosen" 
                        : `${selectedImages.filter(img => img.source === 'upload').length} file(s) selected`
                      }
                    </span>
                  </Label>
                  <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/png, image/jpeg, image/gif"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
              
              {/* Search Interface for Unsplash and Pexels */}
              {(imageSource === 'unsplash' || imageSource === 'pexels') && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Search for images that resonate with how you envision your future self.
                  </p>
                  <div className="flex space-x-2">
                    <Input 
                      type="text" 
                      placeholder={`Search ${imageSource === 'unsplash' ? 'Unsplash' : 'Pexels'}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={searchImages} 
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Search Results:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {searchResults.map((image: any) => (
                          <div 
                            key={image.id} 
                            className="relative cursor-pointer group"
                            onClick={() => selectImage(image)}
                          >
                            <img 
                              src={imageSource === 'unsplash' ? image.urls.small : image.src.medium} 
                              alt={imageSource === 'unsplash' ? image.alt_description : image.photographer}
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
                      {imageSource === 'unsplash' && (
                        <p className="text-xs text-gray-500 mt-2">Images from Unsplash</p>
                      )}
                      {imageSource === 'pexels' && (
                        <p className="text-xs text-gray-500 mt-2">Images from Pexels</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Selected Images Display (shared between all sources) */}
              {selectedImages.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-base font-medium mb-3">Your Selected Images ({selectedImages.length}/5):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img 
                          src={image.url} 
                          alt="Selected Potential" 
                          className="w-full h-40 object-cover rounded border border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {image.credit && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {image.credit.photographer && `Photo by ${image.credit.photographer}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <Label htmlFor="image-meaning" className="text-base font-medium">
                  What do these images represent about your future self?
                </Label>
                <Textarea
                  id="image-meaning"
                  placeholder="Describe what these images mean to you and why they represent your future potential..."
                  className="min-h-[150px] mt-2"
                />
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => handleTabChange("ladder")}
                variant="outline"
              >
                Go Back
              </Button>
              <Button 
                onClick={() => handleTabChange("future")}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Your Future Self
              </Button>
            </div>
          </TabsContent>

          {/* Your Future Self Tab */}
          <TabsContent value="future" className="space-y-6">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe 
                src="https://www.youtube.com/embed/_VsH5NO9jyg" 
                title="Your Future Self" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-80 rounded border border-gray-200"
              ></iframe>
            </div>

            <div className="prose max-w-none">
              <h2>Your Future Self: Longer Term</h2>
              <p>
                This exercise honors every participant's infinite capacity for growth. Whether someone is 22 or 82, the focus remains on 
                continuing evolution, discovering wisdom, and creating legacy.
              </p>

              <blockquote className="border-l-4 border-gray-300 pl-4 italic">
                "Remember Hokusai's wisdom - every decade brings new insight, broader vision, and deeper connection to one's life's work. 
                The stories of your future self have no boundaries."
              </blockquote>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 not-prose">
                <h3 className="text-yellow-800 font-medium">Katsushika Hokusai: Artist Until 90</h3>
                <p className="text-sm">
                  A renowned Japanese ukiyo-e artist who lived during the 18th-19th centuries, Hokusai continually reinvented himself throughout his long life. At age 75, he wrote:
                </p>
                <p className="text-sm mt-2 italic">
                  "From the age of 6 I had a mania for drawing the shapes of things. When I was 50 I had published a universe of designs. 
                  But all I have done before the age of 70 is not worth bothering with. At 73 I began to understand the true construction 
                  of animals, plants, trees, birds, fishes, and insects. At 80 I shall have made still more progress. At 90 I shall penetrate 
                  the mystery of things. At 100 I shall have reached a marvelous stage, and when I am 110, everything I create; a dot, a line, 
                  will jump to life as never before."
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1920px-Tsunami_by_hokusai_19th_century.jpg" 
                      alt="The Great Wave off Kanagawa by Hokusai" 
                      className="w-full h-auto object-cover rounded-md mb-4"
                    />
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Hokusai-self-portrait.jpg" 
                      alt="Self-portrait of Hokusai in old age" 
                      className="w-full h-auto object-cover rounded-md"
                    />
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Hokusai's "The Great Wave" (top) and self-portrait (bottom)
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="future-vision" className="text-base font-medium">
                    Where do you see yourself in 5, 15, and 20 years?
                  </Label>
                  <Textarea
                    id="future-vision"
                    placeholder="Your answer"
                    className="min-h-[100px] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="future-look" className="text-base font-medium">
                    What does your life look like when optimized for flow?
                  </Label>
                  <Textarea
                    id="future-look"
                    placeholder="Your answer"
                    className="min-h-[100px] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="happy-life" className="text-base font-medium">
                    When pursuing a happy, filled stage of life, what will you have achieved and still want to achieve?
                  </Label>
                  <Textarea
                    id="happy-life"
                    placeholder="Your answer"
                    className="min-h-[100px] mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Your Future Self Statement</h3>
              <p className="text-sm text-gray-600 mb-4">
                Look back at your answers. Now write a short paragraph (3-5 sentences) that brings these together. Your vision statement should describe your future self in a way that inspires you — who you are, what you value, and how you want to be embodied.
              </p>

              <p className="text-sm text-gray-500 mb-2">You can start with:</p>
              <ul className="text-sm text-gray-500 mb-4 list-disc pl-5">
                <li>"In the future, I see myself..."</li>
                <li>"My purpose is to..."</li>
                <li>"I am becoming someone who..."</li>
              </ul>

              <Textarea
                id="future-statement"
                placeholder="Your future self statement..."
                className="min-h-[150px]"
              />
            </div>

            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => handleTabChange("potential")}
                variant="outline"
              >
                Go Back
              </Button>
              <Link href="/user-home">
                <Button className="bg-indigo-700 hover:bg-indigo-800">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainContainer>
  );
}