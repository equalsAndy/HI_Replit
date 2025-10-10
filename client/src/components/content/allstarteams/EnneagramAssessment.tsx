import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink } from 'lucide-react';
import { enneagramTypes } from '@/data/assessmentTypeDescriptions';

interface EnneagramAssessmentProps {
  savedData?: {
    type: number;
    wing: number | null;
    resonance: number;
    notes: string;
    completedAt: string;
  };
  onSave: (data: {
    type: number;
    wing: number | null;
    resonance: number;
    notes: string;
    completedAt: string;
  }) => void;
}

const EnneagramAssessment: React.FC<EnneagramAssessmentProps> = ({ savedData, onSave }) => {
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedWing, setSelectedWing] = useState<number | null>(null);
  const [resonance, setResonance] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  // Load saved data
  useEffect(() => {
    if (savedData) {
      setSelectedType(savedData.type);
      setSelectedWing(savedData.wing);
      setResonance(savedData.resonance);
      setNotes(savedData.notes);
    }
  }, [savedData]);

  const handleTypeSelect = (type: number) => {
    setSelectedType(type);
    setSelectedWing(null); // Reset wing when type changes
  };

  const getWingOptions = (type: number): number[] => {
    const left = type === 1 ? 9 : type - 1;
    const right = type === 9 ? 1 : type + 1;
    return [left, right];
  };

  const getTypeDisplay = () => {
    if (!selectedType) return 'Type ?';
    return selectedWing ? `Type ${selectedType}w${selectedWing}` : `Type ${selectedType}`;
  };

  const typeDescription = selectedType ? enneagramTypes[selectedType] : null;

  const handleSave = () => {
    if (!selectedType || resonance === null) return;

    onSave({
      type: selectedType,
      wing: selectedWing,
      resonance,
      notes,
      completedAt: new Date().toISOString()
    });
  };

  // Auto-save when complete
  useEffect(() => {
    if (selectedType && resonance !== null) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedType, selectedWing, resonance, notes]);

  // Calculate positions for the 9-point circle
  const getNumberPosition = (num: number): React.CSSProperties => {
    const positions: Record<number, React.CSSProperties> = {
      9: { top: '-15px', left: '50%', transform: 'translateX(-50%)' },
      1: { top: '10px', right: '25px' },
      2: { top: '50%', right: '-15px', transform: 'translateY(-50%)' },
      3: { bottom: '25px', right: '25px' },
      4: { bottom: '-15px', right: '70px' },
      5: { bottom: '-15px', left: '70px' },
      6: { bottom: '25px', left: '25px' },
      7: { top: '50%', left: '-15px', transform: 'translateY(-50%)' },
      8: { top: '10px', left: '25px' }
    };
    return positions[num];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-orange-50 to-purple-50 p-8 rounded-2xl">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-4">
          The Enneagram
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Share your Enneagram type and wing! The Enneagram reveals your core motivations, fears, and the unconscious
          patterns that drive your behavior. Understanding your type helps us see how you contribute to team dynamics
          and what energizes you most.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Type Selection */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-purple-600 text-center mb-4">
              🎯 Input Your Known Type
            </h3>
            <p className="text-center text-gray-600 text-sm mb-6">
              Already know your Enneagram type? Share it here! Your type and wing create a unique motivational pattern.
            </p>

            {/* Circle Container */}
            <div className="flex justify-center mb-6">
              <div className="relative w-[200px] h-[200px]">
                <div className="absolute inset-0 border-3 border-purple-600 rounded-full"></div>
                {[9, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleTypeSelect(num)}
                    style={getNumberPosition(num)}
                    className={`absolute w-8 h-8 rounded-full border-2 font-semibold transition-all ${
                      selectedType === num
                        ? 'bg-purple-600 text-white border-purple-600 scale-110'
                        : 'bg-gray-200 text-gray-700 border-gray-400 hover:bg-purple-600 hover:text-white hover:border-purple-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Wing Selection */}
            {selectedType && (
              <div className="text-center mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Wing (optional):</label>
                <div className="flex justify-center gap-2">
                  {getWingOptions(selectedType).map((wing, idx) => (
                    <Button
                      key={wing}
                      variant={selectedWing === wing ? 'default' : 'outline'}
                      onClick={() => setSelectedWing(wing)}
                      size="sm"
                      className={selectedWing === wing ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      w{wing} ({idx === 0 ? 'Left' : 'Right'})
                    </Button>
                  ))}
                  <Button
                    variant={selectedWing === null ? 'default' : 'outline'}
                    onClick={() => setSelectedWing(null)}
                    size="sm"
                    className={selectedWing === null ? 'bg-purple-600 hover:bg-purple-700' : ''}
                  >
                    None
                  </Button>
                </div>
              </div>
            )}

            {/* Type Result Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                {getTypeDisplay()}
              </div>
              <p className="text-sm text-gray-500 mt-2">Your core type and wing</p>
            </div>
          </CardContent>
        </Card>

        {/* Type Description & Rating */}
        <Card className="border-2 border-gray-200">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-purple-600 text-center mb-4">
              🌟 Type Overview
            </h3>

            {!typeDescription ? (
              <div className="text-center text-gray-600 py-12">
                <p className="mb-4">👆 Select a number on the circle to learn about that type!</p>
                <p className="text-sm">
                  Each type has unique motivations, fears, and growth patterns. The Enneagram isn't about putting you
                  in a box—it's about understanding the box you're already in so you can step outside it.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-purple-600">
                  <h4 className="text-xl font-semibold text-purple-600 mb-3">
                    Type {typeDescription.number}: {typeDescription.name}
                  </h4>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Core Fear:</strong> {typeDescription.coreFear}</p>
                    <p><strong>Core Desire:</strong> {typeDescription.coreDesire}</p>
                    <p><strong>Key Traits:</strong> {typeDescription.keyTraits}</p>
                  </div>
                </div>

                {/* Resonance Rating */}
                <div>
                  <h4 className="text-lg font-semibold text-purple-600 mb-3">How much does this feel like you?</h4>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Not at all</span>
                    <span>Perfectly</span>
                  </div>
                  <div className="flex gap-2 justify-center mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setResonance(num)}
                        className={`w-10 h-10 rounded-full border-2 font-semibold transition-all ${
                          resonance === num
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-purple-400 hover:text-purple-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  {resonance !== null && (
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="font-semibold">Your rating: {resonance}/10</p>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <h4 className="text-lg font-semibold text-purple-600 mb-2">Additional thoughts (optional):</h4>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How does this type show up in your life? Any insights about your motivations or team interactions..."
                    className="min-h-[100px] resize-y border-2 focus:border-purple-600"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold text-blue-700 text-center mb-4">
            🌟 Dive Deeper into the Enneagram
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Enneagram Institute', desc: 'The authoritative source for Enneagram knowledge and tests', url: 'https://www.enneagraminstitute.com' },
              { name: 'Free Enneagram Test', desc: 'Comprehensive assessment to discover your type', url: 'https://www.truity.com/test/enneagram-personality-test' },
              { name: 'Enneagram Coach', desc: 'Personal growth insights and type development', url: 'https://www.yourenneagramcoach.com' },
              { name: 'Wings & Integration', desc: 'Advanced concepts like wings, arrows, and subtypes', url: 'https://www.integrative9.com' }
            ].map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold text-blue-700 mb-1 flex items-center gap-2">
                  {resource.name}
                  <ExternalLink className="h-4 w-4" />
                </h4>
                <p className="text-sm text-gray-600">{resource.desc}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnneagramAssessment;
