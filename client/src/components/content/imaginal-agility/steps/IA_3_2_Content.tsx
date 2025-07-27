import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';

interface IA32ContentProps {
  onNext?: (stepId: string) => void;
}

// Data structure for this step
interface IA32StepData {
  savedMoments: Array<{text: string, tag: string}>;
  currentMomentText: string;
  currentSelectedTag: string;
}

const IA_3_2_Content: React.FC<IA32ContentProps> = ({ onNext }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { shouldShowDemoButtons } = useTestUser();
  
  // Initialize with empty data structure
  const initialData: IA32StepData = {
    savedMoments: [],
    currentMomentText: '',
    currentSelectedTag: ''
  };
  
  // Use workshop step data persistence hook
  const { data, updateData, saving, loaded, error } = useWorkshopStepData('ia', 'ia-3-2', initialData);
  
  // Local state for current input (not persisted until saved)
  const [momentText, setMomentText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const savedMoments = data.savedMoments;

  const tags = [
    'Surprise',
    'Memory', 
    'Anxiety',
    'Curiosity',
    'Beauty',
    'Longing',
    'Humor',
    'Other'
  ];

  const saveMoment = () => {
    if (momentText.trim() && selectedTag) {
      const newMoments = [...savedMoments, { text: momentText.trim(), tag: selectedTag }];
      updateData({ savedMoments: newMoments });
      setMomentText('');
      setSelectedTag('');
      setCurrentStep(1); // Reset to beginning for another moment
    }
  };

  const tryAnotherMoment = () => {
    setMomentText('');
    setSelectedTag('');
    setCurrentStep(1);
  };

  // Demo data function for test users
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    const demoMoments = [
      { text: "A golden light shimmering through autumn leaves, creating dancing shadows on the forest floor", tag: "Beauty" },
      { text: "The smell of my grandmother's kitchen and the sound of her humming while baking", tag: "Memory" },
      { text: "A butterfly emerging from its chrysalis, wings still wet and trembling", tag: "Surprise" },
      { text: "The vast expanse of the ocean horizon, making me wonder what lies beyond", tag: "Curiosity" }
    ];
    
    updateData({ savedMoments: demoMoments });
    setCurrentStep(5); // Go to final step to show completed state
    console.log('IA 3-2 Content filled with demo Autoflow moments');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Autoflow Practice
      </h1>
      
      {/* Video Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="imaginal-agility"
          stepId="ia-3-2"
          title="Autoflow Practice"
          forceUrl="https://youtu.be/nY7XqMOkz_k"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>
      
      {/* Purpose Card */}
      <Card className="mb-8 border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-purple-800">PURPOSE</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-700">
            This exercise develops awareness of Autoflow. This is the first rung on the Ladder of Imagination — 
            a foundation for developing Imaginal Agility.
          </p>
        </CardContent>
      </Card>

      {/* Activity Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-gray-800">ACTIVITY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step 1: Center */}
          <div className={`p-4 rounded-lg border-2 ${currentStep >= 1 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className="font-semibold text-purple-700 mb-3">Step 1: Center</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Sit comfortably, feet on the floor, and close your eyes.</li>
              <li>Take three deep breaths, slowly inhale and exhale.</li>
            </ul>
            {currentStep === 1 && (
              <Button 
                onClick={() => setCurrentStep(2)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Continue to Step 2
              </Button>
            )}
          </div>

          {/* Step 2: Observe */}
          <div className={`p-4 rounded-lg border-2 ${currentStep >= 2 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className="font-semibold text-purple-700 mb-3">Step 2: Observe</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Allow yourself to feel present in your body.</li>
              <li>Simply observe your passing thoughts and images.</li>
            </ul>
            {currentStep === 2 && (
              <Button 
                onClick={() => setCurrentStep(3)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Continue to Step 3
              </Button>
            )}
          </div>

          {/* Step 3: Record */}
          <div className={`p-4 rounded-lg border-2 ${currentStep >= 3 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className="font-semibold text-purple-700 mb-3">Step 3: Record</h3>
            <p className="text-gray-700 mb-4">
              Now note one word and/or image that comes to mind. Share on Moment Capture Template:
            </p>
            {currentStep >= 3 && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe the word or image that came to mind..."
                  value={momentText}
                  onChange={(e) => setMomentText(e.target.value)}
                  className="min-h-[100px]"
                />
                {momentText.trim() && (
                  <Button 
                    onClick={() => setCurrentStep(4)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Continue to Step 4
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Step 4: Tag It */}
          <div className={`p-4 rounded-lg border-2 ${currentStep >= 4 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className="font-semibold text-purple-700 mb-3">Step 4: Tag It</h3>
            <p className="text-gray-700 mb-4">
              What feeling or theme fits best? Select one:
            </p>
            {currentStep >= 4 && (
              <div className="space-y-4">
                <RadioGroup value={selectedTag} onValueChange={setSelectedTag}>
                  <div className="grid grid-cols-2 gap-2">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <RadioGroupItem value={tag} id={tag} />
                        <Label htmlFor={tag} className="text-sm">{tag}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-500 italic">
                  💡 Tagging helps track your imagination.
                </p>
                {selectedTag && (
                  <Button 
                    onClick={() => setCurrentStep(5)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Continue to Step 5
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Step 5: Save to Timeline */}
          <div className={`p-4 rounded-lg border-2 ${currentStep >= 5 ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className="font-semibold text-purple-700 mb-3">Step 5: Save to Timeline</h3>
            <p className="text-gray-700 mb-4">
              This is your first data point. You'll revisit your timeline later.
            </p>
            {currentStep >= 5 && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Your Moment:</h4>
                  <p className="text-gray-700 mb-2">"{momentText}"</p>
                  <p className="text-sm text-purple-600">Tagged as: {selectedTag}</p>
                </div>
                <div className="flex gap-4">
                  <Button 
                    onClick={saveMoment}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save Moment
                  </Button>
                  <Button 
                    onClick={tryAnotherMoment}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Try Another Moment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Saved Moments Timeline */}
      {savedMoments.length > 0 && (
        <Card className="mb-8 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800">Your Autoflow Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {savedMoments.map((moment, index) => (
                <div key={index} className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-gray-700">"{moment.text}"</p>
                  <p className="text-xs text-purple-600 mt-1">#{moment.tag}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between items-center mt-8">
        <div>
          {savedMoments.length > 0 && (
            <p className="text-sm text-green-600 flex items-center">
              ✓ {savedMoments.length} moment{savedMoments.length > 1 ? 's' : ''} captured
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {shouldShowDemoButtons && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={fillWithDemoData}
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Demo Data
            </Button>
          )}
          <Button 
            onClick={() => onNext && onNext('ia-3-3')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          >
            Continue to Visualizing Your Potential
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IA_3_2_Content;