import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText, X, Info } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

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

  // Get video data for ia-3-2 using the existing video hook
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId(
    'ia',
    'ia-3-2'
  );

  // Helper function to extract YouTube ID from video URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };
  
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
    'Thought',
    'Image',
    'Memory',
    'Emotion',
    'Worry',
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

  const deleteMoment = (indexToDelete: number) => {
    const newMoments = savedMoments.filter((_, index) => index !== indexToDelete);
    updateData({ savedMoments: newMoments });
    console.log(`Deleted moment at index ${indexToDelete}`);
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
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Autoflow Practice
      </h1>
      
      {/* Video Section using VideoTranscriptGlossary component like AST */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'Kjy3lBW06Gs'} // Fallback to known ID from migration
        title={videoData?.title || "Autoflow Practice"}
        transcriptMd={null} // No transcript data available yet
        glossary={null} // No glossary data available yet
      />

      {/* Rung 1 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Rung 1 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img 
              src="/assets/Rung1.png" 
              alt="Rung 1: Autoflow"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('✅ Rung 1 graphic loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load Rung 1 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Purpose Card */}
        <Card className="border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-purple-800">Put simply, you need to be mindful when climbing a ladder.</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-gray-700">
              Autoflow is the automatic stream of thoughts, images, and inner commentary your mind produces on its own.
              Everyone has it — it runs in the background all day. This first exercise simply helps you notice it.
              Awareness of Autoflow is the foundation of all later imaginative work.
            </p>
            <p className="text-gray-700 font-semibold">
              You're not trying to control your mind.<br />
              You're just watching it work.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-gray-800">Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Step 1: Settle */}
          <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50">
            <h3 className="font-semibold text-purple-700 mb-3">1. Settle (5–10 seconds)</h3>
            <ul className="space-y-1 text-gray-700">
              <li>Sit comfortably.</li>
              <li>Take one slow breath in…and out.</li>
            </ul>
          </div>

          {/* Step 2: Notice */}
          <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50">
            <h3 className="font-semibold text-purple-700 mb-3">2. Notice (20–30 seconds)</h3>
            <p className="text-gray-700 mb-2">Let your mind do whatever it naturally does.</p>
            <p className="text-gray-700 mb-2">Don't direct it.</p>
            <p className="text-gray-700 mb-2">Just observe one thing that appears on its own:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
              <li>a thought</li>
              <li>an image</li>
              <li>a memory</li>
              <li>a feeling</li>
              <li>a quick inner phrase</li>
              <li>a worry</li>
              <li>a random picture</li>
            </ul>
            <p className="text-gray-700 mt-2 italic">Anything is fine.</p>
          </div>

          {/* Step 3: Capture */}
          <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50">
            <h3 className="font-semibold text-purple-700 mb-3">3. Capture (write 1–5 words)</h3>
            <p className="text-gray-700 mb-4">
              Write just one of the things that arose. Keep it simple.
            </p>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter 1-5 words describing what you noticed..."
                value={momentText}
                onChange={(e) => setMomentText(e.target.value)}
                className="min-h-[80px]"
                maxLength={100}
              />
              {momentText.trim() && (
                <Button
                  onClick={() => setCurrentStep(4)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue to Tag
                </Button>
              )}
            </div>
          </div>

          {/* Step 4: Tag - Only show when active */}
          {currentStep >= 4 && (
            <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-purple-700">4. Tag (choose one)</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-purple-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Tagging helps you notice patterns in your automatic thoughts.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-4">
                <RadioGroup value={selectedTag} onValueChange={setSelectedTag}>
                  <div className="flex flex-wrap gap-3">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <RadioGroupItem value={tag} id={tag} />
                        <Label htmlFor={tag} className="text-sm cursor-pointer">{tag}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                {selectedTag && (
                  <Button
                    onClick={() => setCurrentStep(5)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Continue to Save
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Save - Only show when active */}
          {currentStep >= 5 && (
            <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-purple-700">5. Save</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-purple-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Your first Autoflow moment is now stored. You'll revisit this later.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-gray-700 mb-4">
                Tap "Save" to add this moment to your Autoflow Timeline. You can do another if you like.
              </p>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border border-gray-200">
                  <p className="text-gray-700 mb-2">"{momentText}"</p>
                  <p className="text-sm text-purple-600">• {selectedTag}</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={saveMoment}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={tryAnotherMoment}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Moments Timeline */}
      {savedMoments.length > 0 && (
        <>
          <Card className="mb-8 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">Your Autoflow Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {savedMoments.map((moment, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-gray-200 group hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-3">
                        <p className="text-gray-700">"{moment.text}"</p>
                        <p className="text-xs text-purple-600 mt-1">• {moment.tag}</p>
                      </div>
                      <button
                        onClick={() => deleteMoment(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                        title="Delete this moment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Why This Matters */}
          <Card className="mb-8 border-purple-200">
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700">
                Autoflow matters because it shapes how you feel, decide, imagine, and respond — usually without you realizing it.
                By noticing even one moment, you've taken the first step from automatic thinking to conscious imagination.
              </p>
              <p className="text-gray-700">
                Over time, your timeline will help you see patterns in your Autoflow.
              </p>
              <p className="text-gray-700 font-semibold">
                The clearer your awareness becomes, the stronger your imagination becomes.
              </p>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">What's Next</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Now that you've learned to notice your mind, you'll learn how to guide it — starting with Visualization,
                the next rung on the Ladder.
              </p>
            </CardContent>
          </Card>
        </>
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
            disabled={savedMoments.length === 0}
            className={`px-8 py-3 text-lg ${
              savedMoments.length === 0 
                ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            Continue to Visualizing Your Potential
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IA_3_2_Content;