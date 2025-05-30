import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight, Search, Upload, Save, Image, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { searchUnsplash, searchImages } from '@/services/api-services';

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
  const [isSaving, setIsSaving] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Use the actual Unsplash API
      const results = await searchUnsplash(searchQuery, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
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

  return (
    <>
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
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => {}}
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
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-100 transition">
              <Upload className="h-4 w-4" />
              <span>Choose file</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={() => {}}
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
                    className="relative group cursor-pointer rounded-md overflow-hidden border border-gray-200"
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
      
      {/* Image meaning */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
        <h3 className="text-lg font-medium text-purple-800 mb-3">What Do These Images Mean to You?</h3>
        <p className="text-sm text-purple-600 mb-4">
          Explain what these images represent about your future vision. How do they connect to your strengths and flow state?
        </p>
        <textarea
          value={imageMeaning}
          onChange={(e) => setImageMeaning(e.target.value)}
          placeholder="These images represent my vision because..."
          className="w-full p-2 min-h-[120px] border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            markStepCompleted('4-3');
            setCurrentContent("future-self");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Next: Your Future Self <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default VisualizingYouView;