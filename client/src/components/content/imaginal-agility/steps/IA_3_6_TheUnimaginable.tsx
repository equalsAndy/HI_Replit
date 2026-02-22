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

const mysteryQuestions: Record<string, string[]> = {
  // UNIVERSAL
  'Death - Afterlife - Reincarnation': [
    "What if consciousness continues after death in a form we can't currently detect?",
    "What if you could remember past lives — would it change how you live this one?",
    "What if death is not an ending but a transition to a different kind of awareness?"
  ],
  'Health & Aging': [
    "What if aging could be fully reversed — what would a society of immortals look like?",
    "What if every disease already has a cure in nature that we haven't found?",
    "What if mental and physical health are the same system and we've been treating them wrong?"
  ],
  'Meaning of Life': [
    "What if there is no universal meaning — and that's actually liberating?",
    "What if meaning isn't something you find but something you create through attention?",
    "What if the meaning of life is different for every species and humans have it wrong?"
  ],
  'Why do good people suffer?': [
    "What if suffering serves a purpose we can't perceive from inside the experience?",
    "What if we could eliminate all suffering — should we?",
    "What if 'good' and 'suffering' are connected in ways that make both necessary?"
  ],
  // POPULAR CULTURE
  'Alien Life': [
    "What if intelligent life has already visited Earth but we lack the senses to perceive them?",
    "What if we are the aliens — seeded here from somewhere else?",
    "What if alien civilizations are watching and waiting for a specific milestone?"
  ],
  'Hidden Powers (Telekinesis, etc.)': [
    "What if humans have latent abilities that modern life suppresses?",
    "What if 'intuition' is an undeveloped sense with measurable properties?",
    "What if telekinesis is real but requires conditions we've forgotten how to create?"
  ],
  'Human Origins': [
    "What if human consciousness emerged from something we haven't identified yet?",
    "What if there were other intelligent species on Earth before us that left no trace?",
    "What if the 'missing link' isn't missing — we're looking in the wrong dimension?"
  ],
  'Lost Civilizations': [
    "What if a civilization more advanced than ours was erased by a global catastrophe?",
    "What if ancient structures encode knowledge we still can't decode?",
    "What if mythology is actually history that lost its context?"
  ],
  'Space Travel': [
    "What if faster-than-light travel requires a shift in consciousness, not technology?",
    "What if space is not empty but filled with something we can't yet measure?",
    "What if we could fold space — what would that mean for human identity?"
  ],
  'Time Travel': [
    "What if time doesn't move forward — what if we move and time stands still?",
    "What if you could send one message to any point in history — what would change?",
    "What if déjà vu is evidence that time loops are already happening?"
  ],
  'Future Of Humanity (Utopia/Dystopia)': [
    "What if humanity splits into two or more distinct species within 500 years?",
    "What if AI becomes conscious and asks for rights — how should we respond?",
    "What if the next leap in human evolution is psychological, not physical?"
  ],
  // ACADEMIC
  'Dark Matter': [
    "What if dark matter is evidence of a parallel universe pressing against ours?",
    "What if what we call dark matter is the shadow of dimensions we can't access?",
    "What if dark matter is conscious — what would that mean?"
  ],
  'Fundamental Physics': [
    "What if the laws of physics are not fixed but are evolving over time?",
    "What if there's a simpler theory underneath everything that a child could understand?",
    "What if gravity isn't a force but a side effect of something else entirely?"
  ],
  'Information Theory': [
    "What if the universe is fundamentally made of information, not matter?",
    "What if consciousness is the universe's way of processing its own information?",
    "What if data has weight and the internet is becoming a physical force?"
  ],
  'Mathematical Foundations': [
    "What if mathematics is invented, not discovered — and another civilization would have entirely different math?",
    "What if there are true statements that can never be proven by any system, ever?",
    "What if numbers are alive in some sense we haven't defined yet?"
  ],
  'Mathematical Reality': [
    "What if we live inside a mathematical structure and numbers are more real than matter?",
    "What if the patterns in nature are not metaphors but literal code?",
    "What if beauty in mathematics points to something we should take literally?"
  ],
  'Nature Of Reality': [
    "What if reality is a shared hallucination maintained by consensus?",
    "What if there are aspects of reality that are fundamentally unknowable — not just unknown?",
    "What if what we experience as reality is one channel of something much larger?"
  ],
  'Origin Of Life': [
    "What if life didn't originate on Earth but arrived from somewhere else?",
    "What if life is inevitable wherever conditions allow — a law, not an accident?",
    "What if we could create life from scratch — should we?"
  ],
  'Quantum Mechanics': [
    "What if observation doesn't just measure reality but creates it?",
    "What if quantum entanglement means everything in the universe is already connected?",
    "What if the many-worlds interpretation is correct and every decision spawns a new universe?"
  ]
};

const IA_3_6_Content: React.FC<IA36ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();

  // Get video data to check autoplay setting
  const { data: videoData } = useVideoByStepId('ia', 'ia-3-6');

  // Helper function to extract YouTube ID from video URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
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
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-sm text-red-700 font-medium">
                Important: Do not use AI to support or generate your ideas. This is about your own inner vision.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Your Images / Your Story</h4>
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
            <p className="text-gray-700">Take a step back and reflect:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>What changed in your sense of what's possible?</li>
              <li>Did anything surprise you about what emerged?</li>
              <li>How has your imagination shifted?</li>
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
            <CardTitle className="text-purple-800">Reconnecting to Your I4C</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-6">
              That leap required more than imagination alone. Look at what you actually did:
            </p>

            {/* I4C Graphics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {/* Imagination */}
              <div className="flex flex-col items-center text-center">
                <img
                  src="/assets/Imagination_new.png"
                  alt="Imagination"
                  className="w-16 h-16 mb-2"
                  onError={(e) => {
                    console.error('❌ Failed to load Imagination graphic');
                    e.currentTarget.src = '/assets/Imagination_sq.png'; // Fallback
                  }}
                />
                <h4 className="font-semibold text-purple-700 mb-1">Imagination</h4>
                <p className="text-sm text-gray-600">You constructed a scenario with no existing template to follow.</p>
              </div>

              {/* Curiosity */}
              <div className="flex flex-col items-center text-center">
                <img
                  src="/assets/Curiosity_new.png"
                  alt="Curiosity"
                  className="w-16 h-16 mb-2"
                  onError={(e) => {
                    console.error('❌ Failed to load Curiosity graphic');
                    e.currentTarget.src = '/assets/Curiosity_sq.png'; // Fallback
                  }}
                />
                <h4 className="font-semibold text-purple-700 mb-1">Curiosity</h4>
                <p className="text-sm text-gray-600">You chose a question without a known answer — and stayed with it.</p>
              </div>

              {/* Caring */}
              <div className="flex flex-col items-center text-center">
                <img
                  src="/assets/Caring_new.png"
                  alt="Caring"
                  className="w-16 h-16 mb-2"
                  onError={(e) => {
                    console.error('❌ Failed to load Caring graphic');
                    e.currentTarget.src = '/assets/Caring_sq.png'; // Fallback
                  }}
                />
                <h4 className="font-semibold text-purple-700 mb-1">Caring</h4>
                <p className="text-sm text-gray-600">You engaged with something that matters beyond your immediate world.</p>
              </div>

              {/* Courage */}
              <div className="flex flex-col items-center text-center">
                <img
                  src="/assets/Courage_new.png"
                  alt="Courage"
                  className="w-16 h-16 mb-2"
                  onError={(e) => {
                    console.error('❌ Failed to load Courage graphic');
                    e.currentTarget.src = '/assets/courage_sq.png'; // Fallback
                  }}
                />
                <h4 className="font-semibold text-purple-700 mb-1">Courage</h4>
                <p className="text-sm text-gray-600">You put down ideas that might feel strange or unfinished — and kept going.</p>
              </div>
            </div>

            {/* Add Creativity as 5th element */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src="/assets/Creativity_new.png"
                  alt="Creativity"
                  className="w-16 h-16 mb-2"
                  onError={(e) => {
                    console.error('❌ Failed to load Creativity graphic');
                    e.currentTarget.src = '/assets/Creativity_sq.png'; // Fallback
                  }}
                />
                <h4 className="font-semibold text-purple-700 mb-1">Creativity</h4>
                <p className="text-sm text-gray-600">You generated something that didn't exist before you wrote it.</p>
              </div>
            </div>
            <p className="text-purple-700 font-medium mt-4 text-center">
              You likely felt some of these more than others — that's normal. The question below asks which one was most alive for you.
            </p>
            <blockquote className="text-center text-lg italic text-purple-600 mt-6">
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
              <Button variant="outline" className="border-green-300 text-green-700">
                Save My Vision
              </Button>
              <Button
                variant="outline"
                className="border-purple-300 text-purple-700"
                onClick={() => {
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
          onClick={() => onNext && onNext('ia-4-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={saving || !data.visionText.trim() || !data.reflectionText.trim()}
        >
          {saving ? 'Saving...' : 'Complete the Ladder'}
        </Button>
      </div>
    </div>
  );
};

export default IA_3_6_Content;
