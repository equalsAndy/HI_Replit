import React from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useVideoByStepId } from '@/hooks/use-videos';

interface IA36ContentProps {
  onNext?: (stepId: string) => void;
}

// Data structure for this step
interface IA36StepData {
  selectedMystery: string;
  visionText: string;
  reflectionText: string;
}

const IA_3_6_Content: React.FC<IA36ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();
  
  // Get video data to check autoplay setting
  const { data: videoData } = useVideoByStepId('ia', 'ia-3-6');
  
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
  
  // Initialize with empty data structure
  const initialData: IA36StepData = {
    selectedMystery: '',
    visionText: '',
    reflectionText: ''
  };
  
  // Use the new persistence hook
  const { data, updateData, saving, loaded, error } = useWorkshopStepData(
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
      selectedMystery: 'Time Travel',
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
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        The Mystery Exercise - Imagining the Unimaginable
      </h1>
      
      {/* Video Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="ia"
          stepId="ia-3-6"
          title="The Unimaginable"
          aspectRatio="16:9"
          autoplay={videoData?.autoplay ?? false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>

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
              Even today, humanity still faces profound mysteries we cannot explain. When we hit the boundary of what we know, 
              imagination allows us to ask: "What if?"
            </p>
            <p className="text-gray-700">
              This Exercise is not about answers—it's about daring to imagine beyond logic, science, or common sense. 
              It is your opportunity to stretch your inner limits and discover what lies beyond.
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
          
          {/* Universal Level - 2x2 Grid */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 text-center">UNIVERSAL (Everyone - Existentially)</h3>
            <RadioGroup value={data.selectedMystery} onValueChange={(value) => updateData({ selectedMystery: value })}>
              <div className="grid grid-cols-2 gap-4">
                {mysteries.universal.map((mystery) => (
                  <div key={mystery} className="flex items-start space-x-2">
                    <RadioGroupItem value={mystery} id={mystery} className="mt-0.5 shrink-0" />
                    <Label htmlFor={mystery} className="text-sm leading-tight">{mystery}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Popular Culture and Academic - Side by Side */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Popular Culture Level */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 text-center">POPULAR CULTURE (Global Audiences)</h3>
              <RadioGroup value={data.selectedMystery} onValueChange={(value) => updateData({ selectedMystery: value })}>
                {mysteries.popular.map((mystery) => (
                  <div key={mystery} className="flex items-start space-x-2">
                    <RadioGroupItem value={mystery} id={mystery} className="mt-0.5 shrink-0" />
                    <Label htmlFor={mystery} className="text-sm leading-tight">{mystery}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Academic Level */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3 text-center">ACADEMIC (Specialists)</h3>
              <RadioGroup value={data.selectedMystery} onValueChange={(value) => updateData({ selectedMystery: value })}>
                {mysteries.academic.map((mystery) => (
                  <div key={mystery} className="flex items-start space-x-2">
                    <RadioGroupItem value={mystery} id={mystery} className="mt-0.5 shrink-0" />
                    <Label htmlFor={mystery} className="text-sm leading-tight">{mystery}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {data.selectedMystery && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Your Selected Mystery:</h4>
              <p className="text-yellow-700">"{data.selectedMystery}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* The Leap Exercise */}
      {data.selectedMystery && (
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
                placeholder="Express your vision through words, sketches, or narrative form. Don't worry about coherence—follow the thread of wonder."
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
              This leap wasn't just a creative act—it was an expression of your I4C:
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
                <p className="text-sm text-gray-600">Shaped a world no one had seen</p>
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
                <p className="text-sm text-gray-600">Led you to choose your mystery</p>
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
                <p className="text-sm text-gray-600">Connected you to its importance</p>
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
                <p className="text-sm text-gray-600">Helped you explore what others might avoid</p>
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
                <p className="text-sm text-gray-600">Brought forth something entirely new</p>
              </div>
            </div>
            <p className="text-purple-700 font-medium mt-4 text-center">
              Even here, at the far edge of thought, your core capabilities are active. You just used them all—in your own way.
            </p>
            <blockquote className="text-center text-lg italic text-purple-600 mt-6">
              "When we imagine the unimaginable, we begin to glimpse who we really are."
            </blockquote>
          </CardContent>
        </Card>
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
              <Button variant="outline" className="border-purple-300 text-purple-700" onClick={() => updateData({ selectedMystery: '', visionText: '', reflectionText: '' })}>
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