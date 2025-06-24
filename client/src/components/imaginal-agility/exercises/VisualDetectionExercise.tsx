import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, X } from 'lucide-react';

interface VisualDetectionExerciseProps {
  onComplete: () => void;
}

interface Scenario {
  id: number;
  title: string;
  content: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    image_url?: string;
  }>;
  metadata: {
    image_pairs: Array<{
      real_url: string;
      fake_url: string;
      real_description: string;
      fake_description: string;
    }>;
  };
}

const VisualDetectionExercise: React.FC<VisualDetectionExerciseProps> = ({ onComplete }) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImagePair, setCurrentImagePair] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadScenario();
  }, []);

  const loadScenario = async () => {
    try {
      setLoading(true);
      // Use mock data for testing
      const mockScenario = {
        id: 2,
        title: "Professional Headshot Detection",
        content: `<p>One of these professional headshots is real, one is AI-generated. Can you tell which is which?</p>
        <p>Look for subtle details: lighting consistency, skin texture, eye reflections, and background elements.</p>`,
        questions: [],
        metadata: {
          image_pairs: [
            {
              real_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0OThmMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5SZWFsIFBob3RvPC90ZXh0Pjwvc3ZnPg==",
              fake_url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BSSBHZW5lcmF0ZWQ8L3RleHQ+PC9zdmc+",
              real_description: "Natural lighting, subtle skin imperfections, authentic eye reflections",
              fake_description: "Too-perfect skin, inconsistent lighting, artificial-looking eyes"
            }
          ]
        }
      };
      
      setScenario(mockScenario);
    } catch (error) {
      console.error('Error loading scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageType: 'real' | 'fake') => {
    setSelectedImage(imageType);
    setAnswers(prev => ({
      ...prev,
      [currentImagePair]: imageType
    }));
  };

  const handleSubmit = async () => {
    setShowFeedback(true);
    
    // Track progress
    if (scenario) {
      try {
        await fetch('/api/discernment/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ scenarioId: scenario.id })
        });
      } catch (error) {
        console.error('Error tracking progress:', error);
      }
    }
  };

  const checkAllAnswered = () => {
    if (!scenario) return false;
    return scenario.metadata.image_pairs.every((_, index) => answers[index] !== undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load exercise scenario.</p>
        <button 
          onClick={loadScenario}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentPair = scenario.metadata.image_pairs[currentImagePair];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-center">
          <Eye className="w-5 h-5 text-blue-600 mr-2" />
          <h4 className="text-blue-800 font-semibold">Visual Real vs. Fake Challenge</h4>
        </div>
        <p className="text-blue-700 mt-2">
          Look carefully at these images. One is real, one is AI-generated or manipulated. Can you tell which is which?
        </p>
      </div>

      {/* Scenario Instructions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{scenario.title}</h3>
        <div className="prose max-w-none text-gray-700 mb-4">
          <div dangerouslySetInnerHTML={{ __html: scenario.content }} />
        </div>
        <p className="text-sm text-gray-600">
          Image pair {currentImagePair + 1} of {scenario.metadata.image_pairs.length}
        </p>
      </div>

      {/* Image Pair Display */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Image - Real */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="relative">
            <img 
              src={currentPair.real_url} 
              alt="Image A"
              className="w-full h-64 object-cover"
              onError={(e) => {
                // Fallback for missing images
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEE8L3RleHQ+PC9zdmc+';
              }}
            />
            <button
              onClick={() => handleImageSelect('real')}
              className={`absolute inset-0 flex items-center justify-center transition-all ${
                selectedImage === 'real' 
                  ? 'bg-green-500 bg-opacity-80' 
                  : 'bg-black bg-opacity-0 hover:bg-opacity-20'
              }`}
            >
              {selectedImage === 'real' && (
                <div className="text-white text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-semibold">Selected</p>
                </div>
              )}
            </button>
          </div>
          <div className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Image A</h4>
            <p className="text-sm text-gray-600">{currentPair.real_description}</p>
            <button
              onClick={() => handleImageSelect('real')}
              className={`mt-3 w-full py-2 px-4 rounded-lg border transition-colors ${
                selectedImage === 'real'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {selectedImage === 'real' ? 'Selected as Real' : 'Select as Real'}
            </button>
          </div>
        </div>

        {/* Right Image - Fake */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="relative">
            <img 
              src={currentPair.fake_url} 
              alt="Image B"
              className="w-full h-64 object-cover"
              onError={(e) => {
                // Fallback for missing images
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEI8L3RleHQ+PC9zdmc+';
              }}
            />
            <button
              onClick={() => handleImageSelect('fake')}
              className={`absolute inset-0 flex items-center justify-center transition-all ${
                selectedImage === 'fake' 
                  ? 'bg-green-500 bg-opacity-80' 
                  : 'bg-black bg-opacity-0 hover:bg-opacity-20'
              }`}
            >
              {selectedImage === 'fake' && (
                <div className="text-white text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-semibold">Selected</p>
                </div>
              )}
            </button>
          </div>
          <div className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Image B</h4>
            <p className="text-sm text-gray-600">{currentPair.fake_description}</p>
            <button
              onClick={() => handleImageSelect('fake')}
              className={`mt-3 w-full py-2 px-4 rounded-lg border transition-colors ${
                selectedImage === 'fake'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {selectedImage === 'fake' ? 'Selected as Real' : 'Select as Real'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation between image pairs */}
      {scenario.metadata.image_pairs.length > 1 && !showFeedback && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setCurrentImagePair(Math.max(0, currentImagePair - 1));
              setSelectedImage(answers[currentImagePair - 1] || null);
            }}
            disabled={currentImagePair === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            ← Previous Pair
          </button>
          
          <span className="text-sm text-gray-600">
            {currentImagePair + 1} of {scenario.metadata.image_pairs.length}
          </span>
          
          <button
            onClick={() => {
              setCurrentImagePair(Math.min(scenario.metadata.image_pairs.length - 1, currentImagePair + 1));
              setSelectedImage(answers[currentImagePair + 1] || null);
            }}
            disabled={currentImagePair === scenario.metadata.image_pairs.length - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next Pair →
          </button>
        </div>
      )}

      {/* Submit Button */}
      {selectedImage && !showFeedback && (
        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Complete Visual Detection Challenge
        </button>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-green-800">Visual detection complete!</h4>
          </div>
          
          <div className="space-y-4">
            {scenario.metadata.image_pairs.map((pair, index) => (
              <div key={index} className="bg-white p-4 rounded border-l-4 border-green-400">
                <p className="font-medium text-gray-800 mb-2">
                  Image pair {index + 1}: You selected {answers[index] === 'real' ? 'Image A' : 'Image B'} as real
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Correct answer:</strong> Image A was the real image
                  {answers[index] === 'real' ? 
                    <span className="text-green-600 ml-2">✓ Correct</span> : 
                    <span className="text-orange-600 ml-2">Good attempt</span>
                  }
                </p>
                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded space-y-1">
                  <p><strong>Real image clues:</strong> {pair.real_description}</p>
                  <p><strong>AI/Fake image clues:</strong> {pair.fake_description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded">
            <h5 className="font-semibold text-blue-800 mb-2">Key Visual Detection Tips:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Look for unnatural lighting or shadows</li>
              <li>• Check for overly perfect or symmetrical features</li>
              <li>• Notice inconsistent image quality or artifacts</li>
              <li>• Pay attention to background elements that don't match</li>
              <li>• Trust your instinct when something feels "too good to be true"</li>
            </ul>
          </div>

          <button
            onClick={onComplete}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue to 5-Test Toolkit Practice
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualDetectionExercise;