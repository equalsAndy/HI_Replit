import React from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useVideoByStepId } from '@/hooks/use-videos';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import { CapabilityType } from '@/lib/types';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { mysteryQuestions } from '@/constants/ia-mysteries';

interface IA36ContentProps {
  onNext?: (stepId: string) => void;
}

// Data structure for this step
interface IA36StepData {
  selectedMystery: string;
  selectedQuestion: string;
  visionText: string;
  reflectionText: string;
  capability_activation?: CapabilityType;
}

const IA_3_6_Content: React.FC<IA36ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();

  // Get video data to check autoplay setting
  const { data: videoData } = useVideoByStepId('ia', 'ia-3-6');

  // Helper function to extract YouTube ID from video URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Debug logging for autoplay setting
  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-3-6 Video data:', {
        title: videoData.title,
        autoplay: videoData.autoplay,
        stepId: videoData.stepId,
        url: videoData.url ? 'present' : 'missing'
      });
    } else {
      console.log('🎬 IA-3-6 No video data found for step ia-3-6');
    }
  }, [videoData]);

  // Local state for "write your own" question
  const [isCustom, setIsCustom] = React.useState(false);
  const [customText, setCustomText] = React.useState('');

  // Initialize with empty data structure
  const initialData: IA36StepData = {
    selectedMystery: '',
    selectedQuestion: '',
    visionText: '',
    reflectionText: '',
    capability_activation: undefined
  };

  // Use the new persistence hook
  const { data, updateData, saving } = useWorkshopStepData(
    'ia',
    'ia-3-6',
    initialData
  );

  // Demo data function for test users
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }

    updateData({
      selectedMystery: 'Fundamental Physics',
      selectedQuestion: "What if the laws of physics are not fixed but are evolving over time?",
      visionText: 'Imagine if time isn\'t linear but exists as infinite parallel streams, like rivers flowing in all directions. What if consciousness could navigate between these streams, not by machines but through focused intention and emotional resonance? Perhaps the "past" and "future" are simply different frequencies we can tune into, like radio stations. What if every decision creates a new time stream, and what we call déjà vu is actually our consciousness briefly accessing memories from parallel versions of ourselves?',
      reflectionText: 'This exercise pushed me beyond logical constraints into pure imaginative territory. I surprised myself by how vivid the imagery became once I stopped trying to make it scientifically plausible. My sense of what\'s possible has expanded - not just about time travel, but about the power of imagination itself to create entirely new frameworks for understanding reality.'
    });

    console.log('IA 3-6 Content filled with demo data');
  };

  const mysteries = {
    universal: [
      'Death - Afterlife - Reincarnation',
      'Health & Aging',
      'Meaning of Life',
      'Why do good people suffer?'
    ],
    popular: [
      'Alien Life',
      'Hidden Powers (Telekinesis, etc.)',
      'Human Origins',
      'Lost Civilizations',
      'Space Travel',
      'Time Travel',
      'Future Of Humanity (Utopia/Dystopia)'
    ],
    academic: [
      'Dark Matter',
      'Fundamental Physics',
      'Information Theory',
      'Mathematical Foundations',
      'Mathematical Reality',
      'Nature Of Reality',
      'Origin Of Life',
      'Quantum Mechanics'
    ]
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
        The Mystery Exercise - Imagining the Unimaginable
      </h1>

      {/* Video Section using VideoTranscriptGlossary component like AST */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'F1qGAW4OofQ'} // Fallback to known ID from migration
        title={videoData?.title || "The Unimaginable"}
        transcriptMd={null} // No transcript data available yet
        glossary={null} // No glossary data available yet
      />

      {/* Rung 5 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Rung 5 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img
              src="/assets/Rung5.png"
              alt="Rung 5: The Unimaginable"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('✅ Rung 5 graphic loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load Rung 5 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Einstein Quotes and Purpose Combined */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <blockquote className="text-lg italic text-center text-gray-700 mb-3">
            "Imagination is more important than knowledge, for knowledge is limited."
          </blockquote>
          <p className="text-center text-gray-600 mb-4">— Albert Einstein</p>

          <blockquote className="text-lg italic text-center text-gray-700 mb-3">
            "The highest use of imagination is to imagine the unimaginable."
          </blockquote>
          <p className="text-center text-gray-600 mb-6">— Cynthia Ozick</p>

          <div className="border-t border-purple-200 pt-4">
            <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
            <p className="text-gray-700 mb-3">
              In the last exercise, you found where inspiration lives in you — the experiences and feelings that make you most alive. Now let's put that openness to work on something with no known answer.
            </p>
            <p className="text-gray-700">
              This exercise is not about getting it right. It's about using your imagination on a question that has no established solution — and discovering what happens when you think beyond what's known.
            </p>
          </div>
        </div>
      </div>

      {/* Universal Mysteries Matrix */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-gray-800">Universal Mysteries Matrix</CardTitle>
          <p className="text-sm text-gray-600">
            A map of the mysteries humans grapple with, ranging from common to highly specialized
          </p>
        </CardHeader>
        <CardContent className="space-y-6">

          <RadioGroup
            value={data.selectedMystery}
            onValueChange={(value) => {
              updateData({ selectedMystery: value, selectedQuestion: '' });
              setIsCustom(false);
              setCustomText('');
            }}
            className="space-y-6"
          >
            <p className="text-sm font-medium text-gray-700 text-center">
              Choose one mystery from any category below:
            </p>

            {/* Universal Level - 2x2 Grid */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 text-center">UNIVERSAL (Everyone - Existentially)</h3>
              <div className="grid grid-cols-2 gap-4">
                {mysteries.universal.map((mystery) => (
                  <div key={mystery} className="flex items-start space-x-2">
                    <RadioGroupItem value={mystery} id={mystery} className="mt-0.5 shrink-0" />
                    <Label htmlFor={mystery} className="text-sm leading-tight">{mystery}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Culture and Academic - Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Popular Culture Level */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 text-center">POPULAR CULTURE (Global Audiences)</h3>
                {mysteries.popular.map((mystery) => (
                  <div key={mystery} className="flex items-start space-x-2">
                    <RadioGroupItem value={mystery} id={mystery} className="mt-0.5 shrink-0" />
                    <Label htmlFor={mystery} className="text-sm leading-tight">{mystery}</Label>
                  </div>
                ))}
              </div>

              {/* Academic Level */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-3 text-center">ACADEMIC (Specialists)</h3>
                {mysteries.academic.map((mystery) => (
                  <div key={mystery} className="flex items-start space-x-2">
                    <RadioGroupItem value={mystery} id={mystery} className="mt-0.5 shrink-0" />
                    <Label htmlFor={mystery} className="text-sm leading-tight">{mystery}</Label>
                  </div>
                ))}
              </div>
            </div>
          </RadioGroup>

          {data.selectedMystery && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Your Selected Mystery:</h4>
              <p className="text-yellow-700">"{data.selectedMystery}"</p>
              {data.selectedQuestion && (
                <>
                  <h4 className="font-medium text-yellow-800 mt-3 mb-1">Your Question:</h4>
                  <p className="text-yellow-700 italic">"{data.selectedQuestion}"</p>
                </>
              )}
            </div>
          )}

          {/* Choose Your Question */}
          {data.selectedMystery && mysteryQuestions[data.selectedMystery] && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-2">
              <h3 className="font-semibold text-purple-800 mb-1">Choose Your Question</h3>
              <p className="text-sm text-gray-600 mb-4">
                Now pick a specific question to explore — or write your own.
              </p>
              <RadioGroup
                value={isCustom ? '__custom__' : data.selectedQuestion}
                onValueChange={(val) => {
                  if (val === '__custom__') {
                    setIsCustom(true);
                    updateData({ selectedQuestion: customText });
                  } else {
                    setIsCustom(false);
                    updateData({ selectedQuestion: val });
                  }
                }}
                className="space-y-3"
              >
                {mysteryQuestions[data.selectedMystery].map((q) => (
                  <div key={q} className="flex items-start space-x-2">
                    <RadioGroupItem value={q} id={q} className="mt-0.5 shrink-0" />
                    <Label htmlFor={q} className="text-sm leading-snug cursor-pointer">{q}</Label>
                  </div>
                ))}
                {/* Write your own */}
                <div className="flex items-start space-x-2 pt-1">
                  <RadioGroupItem value="__custom__" id="custom-question" className="mt-2 shrink-0" />
                  <div className="flex-1">
                    <Label htmlFor="custom-question" className="text-sm text-gray-600 mb-1 block cursor-pointer">
                      Or write your own:
                    </Label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="Write your own question..."
                      value={customText}
                      onChange={(e) => {
                        setCustomText(e.target.value);
                        if (isCustom) updateData({ selectedQuestion: e.target.value });
                      }}
                      onFocus={() => {
                        setIsCustom(true);
                        updateData({ selectedQuestion: customText });
                      }}
                    />
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
      </Card>

      {/* The Leap Exercise */}
      {data.selectedMystery && data.selectedQuestion && (
        <Card className="mb-8">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800">The Leap: Imagine the Unimaginable</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-gray-700">
              Take your chosen Mystery and now imagine the most extraordinary, reality-shifting,
              paradigm-breaking answer possible.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>What if the truth was stranger than anything you've ever heard?</li>
              <li>What if it contradicted science, history, and even common sense?</li>
              <li>What if you could describe a vision no one has ever dared to say aloud?</li>
            </ul>
            <p className="text-gray-700 font-medium">
              Let your imagination leap without constraint. Push beyond "reasonable speculation" into true imaginative freedom.
            </p>
            <p className="text-sm text-purple-600 italic mt-2">
              This is about your own inner vision — no AI, no research, just you and the question.
            </p>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Your Leap</h4>
              <Textarea
                placeholder="Write freely — images, metaphors, a story, a scenario. Don't worry about coherence — follow the thread of wonder."
                value={data.visionText}
                onChange={(e) => updateData({ visionText: e.target.value })}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post-Leap Reflection */}
      {data.visionText.trim() && (
        <Card className="mb-8">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800">Post-Leap Reflection</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-gray-700">Take a step back and notice what happened during that leap:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Where did your imagination want to stop — and what happened when you kept going?</li>
              <li>Was there a moment where your idea shifted from "reasonable" to genuinely wild?</li>
              <li>What's one image or phrase from your leap that you didn't expect?</li>
            </ul>
            <Textarea
              placeholder="Share your reflections here..."
              value={data.reflectionText}
              onChange={(e) => updateData({ reflectionText: e.target.value })}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      )}

      {/* I4C Connection */}
      {data.reflectionText.trim() && (
        <Card className="mb-8 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-purple-800 text-xl">Reconnecting to Your Capabilities</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Summary of what they did */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
              <p className="text-purple-800 font-semibold text-base mb-2">Your Mystery & Leap:</p>
              <p className="text-purple-700 text-base">
                <span className="font-semibold">Mystery:</span> {data.selectedMystery}
              </p>
              {data.selectedQuestion && (
                <p className="text-purple-700 text-base mt-1 italic">
                  <span className="font-semibold not-italic">Question:</span> "{data.selectedQuestion}"
                </p>
              )}
            </div>

            <p className="text-gray-700 mb-4 text-base">
              You just took an imaginative leap into territory with no known answer. That exercise drew on more than one capability — but only you know which ones showed up.
            </p>
            <p className="text-gray-700 mb-6 text-base">
              Think back through what you just did: choosing a mystery, forming a question, writing your leap, sitting with what emerged. Which capability felt most present?
            </p>

            <blockquote className="text-center text-lg italic text-purple-600 mt-2 mb-2">
              "When we imagine the unimaginable, we begin to glimpse who we really are."
            </blockquote>
          </CardContent>
        </Card>
      )}

      {/* Capability Selector */}
      {data.selectedMystery && data.reflectionText && (
        <CapabilitySelector
          mode="single"
          selected={data.capability_activation || null}
          onSelect={(val) => updateData({ capability_activation: val as CapabilityType })}
          prompt="Which capability felt most alive as you sat with this mystery?"
          className="mb-8"
        />
      )}

      <div className="flex justify-between mt-8">
        <div className="flex gap-4">
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
          {data.visionText.trim() && data.reflectionText.trim() && (
            <>
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700"
                onClick={() => {
                  if (!window.confirm('This will erase your current leap and reflection. Are you sure you want to start over with a new mystery?')) return;
                  updateData({ selectedMystery: '', selectedQuestion: '', visionText: '', reflectionText: '' });
                  setIsCustom(false);
                  setCustomText('');
                }}
              >
                Choose Another Mystery
              </Button>
            </>
          )}
        </div>
        <Button
          onClick={() => onNext && onNext('ia-3-7')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={saving || !data.visionText.trim() || !data.reflectionText.trim()}
        >
          {saving ? 'Saving...' : 'Continue →'}
        </Button>
      </div>
    </div>
  );
};

export default IA_3_6_Content;
