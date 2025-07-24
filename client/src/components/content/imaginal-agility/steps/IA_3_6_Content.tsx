import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface IA36ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_3_6_Content: React.FC<IA36ContentProps> = ({ onNext }) => {
  const [selectedMystery, setSelectedMystery] = useState('');
  const [visionText, setVisionText] = useState('');
  const [reflectionText, setReflectionText] = useState('');

  const mysteries = {
    universal: [
      'Death - Afterlife - Reincarnation',
      'Health & Aging',
      'Meaning of Life',
      'Why do good people suffer while bad people flourish?'
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
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {/* Einstein Quote */}
      <Card className="mb-8 border-purple-200">
        <CardContent className="pt-6">
          <blockquote className="text-lg italic text-center text-gray-700 mb-4">
            "Imagination is more important than knowledge, for knowledge is limited."
          </blockquote>
          <p className="text-center text-gray-600">— Albert Einstein</p>
          <blockquote className="text-lg italic text-center text-gray-700 mb-4 mt-6">
            "The highest use of imagination is to imagine the unimaginable."
          </blockquote>
          <p className="text-center text-gray-600">— Cynthia Ozick</p>
        </CardContent>
      </Card>
      
      {/* Purpose */}
      <Card className="mb-8 border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-purple-800">PURPOSE</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-700">
            Even today, humanity still faces profound mysteries we cannot explain. When we hit the boundary of what we know, 
            imagination allows us to ask: "What if?"
          </p>
          <p className="text-gray-700 mt-4">
            This Exercise is not about answers—it's about daring to imagine beyond logic, science, or common sense. 
            It is your opportunity to stretch your inner limits and discover what lies beyond.
          </p>
        </CardContent>
      </Card>

      {/* Universal Mysteries Matrix */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-gray-800">Universal Mysteries Matrix</CardTitle>
          <p className="text-sm text-gray-600">
            A map of the mysteries humans grapple with, ranging from common to highly specialized
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Universal Level */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">UNIVERSAL (Everyone - Existentially)</h3>
            <RadioGroup value={selectedMystery} onValueChange={setSelectedMystery}>
              {mysteries.universal.map((mystery) => (
                <div key={mystery} className="flex items-center space-x-2">
                  <RadioGroupItem value={mystery} id={mystery} />
                  <Label htmlFor={mystery} className="text-sm">{mystery}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Popular Culture Level */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">POPULAR CULTURE (Global Audiences)</h3>
            <RadioGroup value={selectedMystery} onValueChange={setSelectedMystery}>
              {mysteries.popular.map((mystery) => (
                <div key={mystery} className="flex items-center space-x-2">
                  <RadioGroupItem value={mystery} id={mystery} />
                  <Label htmlFor={mystery} className="text-sm">{mystery}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Academic Level */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-3">ACADEMIC (Specialists)</h3>
            <RadioGroup value={selectedMystery} onValueChange={setSelectedMystery}>
              {mysteries.academic.map((mystery) => (
                <div key={mystery} className="flex items-center space-x-2">
                  <RadioGroupItem value={mystery} id={mystery} />
                  <Label htmlFor={mystery} className="text-sm">{mystery}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedMystery && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Your Selected Mystery:</h4>
              <p className="text-yellow-700">"{selectedMystery}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* The Leap Exercise */}
      {selectedMystery && (
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
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post-Leap Reflection */}
      {visionText.trim() && (
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
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      )}

      {/* I4C Connection */}
      {reflectionText.trim() && (
        <Card className="mb-8 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-purple-800">Reconnecting to Your I4C</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">
              This leap wasn't just a creative act—it was an expression of your I4C:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Imagination</strong> shaped a world no one had seen.</li>
              <li><strong>Curiosity</strong> led you to choose your mystery.</li>
              <li><strong>Caring</strong> connected you to its importance.</li>
              <li><strong>Courage</strong> helped you explore what others might avoid.</li>
            </ul>
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
          {visionText.trim() && reflectionText.trim() && (
            <>
              <Button variant="outline" className="border-green-300 text-green-700">
                Save My Vision
              </Button>
              <Button variant="outline" className="border-purple-300 text-purple-700">
                Choose Another Mystery
              </Button>
            </>
          )}
        </div>
        <Button 
          onClick={() => onNext && onNext('ia-4-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={!visionText.trim() || !reflectionText.trim()}
        >
          Complete the Ladder
        </Button>
      </div>
    </div>
  );
};

export default IA_3_6_Content;