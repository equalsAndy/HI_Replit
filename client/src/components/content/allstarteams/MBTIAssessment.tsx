import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink } from 'lucide-react';
import { mbtiTypes } from '@/data/assessmentTypeDescriptions';

interface MBTIAssessmentProps {
  savedData?: {
    type: string;
    variant: string | null;
    resonance: number;
    notes: string;
    completedAt: string;
  };
  onSave: (data: {
    type: string;
    variant: string | null;
    resonance: number;
    notes: string;
    completedAt: string;
  }) => void;
}

const MBTIAssessment: React.FC<MBTIAssessmentProps> = ({ savedData, onSave }) => {
  const [letter1, setLetter1] = useState('');
  const [letter2, setLetter2] = useState('');
  const [letter3, setLetter3] = useState('');
  const [letter4, setLetter4] = useState('');
  const [variant, setVariant] = useState<string | null>(null);
  const [resonance, setResonance] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  // Load saved data
  useEffect(() => {
    if (savedData) {
      const typeCode = savedData.type.replace(/-[AT]$/, ''); // Remove variant
      if (typeCode.length === 4) {
        setLetter1(typeCode[0]);
        setLetter2(typeCode[1]);
        setLetter3(typeCode[2]);
        setLetter4(typeCode[3]);
      }
      setVariant(savedData.variant);
      setResonance(savedData.resonance);
      setNotes(savedData.notes);
    }
  }, [savedData]);

  const validLetters = {
    1: ['E', 'I'],
    2: ['S', 'N'],
    3: ['T', 'F'],
    4: ['J', 'P']
  };

  const handleLetterInput = (position: 1 | 2 | 3 | 4, value: string) => {
    const upperValue = value.toUpperCase();
    if (!upperValue || validLetters[position].includes(upperValue)) {
      switch (position) {
        case 1: setLetter1(upperValue); break;
        case 2: setLetter2(upperValue); break;
        case 3: setLetter3(upperValue); break;
        case 4: setLetter4(upperValue); break;
      }
    }
  };

  const getCurrentType = (): string | null => {
    if (letter1 && letter2 && letter3 && letter4) {
      return `${letter1}${letter2}${letter3}${letter4}`;
    }
    return null;
  };

  const currentType = getCurrentType();
  const typeDescription = currentType && mbtiTypes[currentType] ? mbtiTypes[currentType] : null;

  const getFullTypeCode = () => {
    if (!currentType) return '????';
    return variant ? `${currentType}-${variant}` : currentType;
  };

  const handleSave = () => {
    if (!currentType || resonance === null) return;

    onSave({
      type: getFullTypeCode(),
      variant,
      resonance,
      notes,
      completedAt: new Date().toISOString()
    });
  };

  // Auto-save when complete
  useEffect(() => {
    if (currentType && resonance !== null) {
      const timer = setTimeout(() => {
        handleSave();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentType, variant, resonance, notes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Myers-Briggs Type Indicator
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Share your existing MBTI results! Based on Carl Jung's psychological types, your four-letter code reveals
          your natural preferences for how you energize, gather information, make decisions, and structure your world.
          This helps us understand how your personality shows up in team settings.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-blue-600 text-center mb-4">
              🎯 Input Your Known Type
            </h3>
            <p className="text-center text-gray-600 text-sm mb-6">
              Already know your MBTI type? Share it here! Enter your four-letter code.
            </p>

            {/* Letter Inputs */}
            <div className="flex justify-center gap-4 mb-6">
              {[
                { pos: 1 as const, value: letter1, setter: setLetter1, placeholder: 'E/I' },
                { pos: 2 as const, value: letter2, setter: setLetter2, placeholder: 'S/N' },
                { pos: 3 as const, value: letter3, setter: setLetter3, placeholder: 'T/F' },
                { pos: 4 as const, value: letter4, setter: setLetter4, placeholder: 'J/P' }
              ].map(({ pos, value, placeholder }) => (
                <Input
                  key={pos}
                  value={value}
                  onChange={(e) => handleLetterInput(pos, e.target.value)}
                  maxLength={1}
                  placeholder={placeholder}
                  className="w-16 h-16 text-2xl font-bold text-center text-blue-600 border-2 focus:border-blue-600"
                />
              ))}
            </div>

            {/* Variant Selection */}
            <div className="text-center mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Variant:</label>
              <div className="flex justify-center gap-2">
                {[
                  { label: "Don't know", value: null },
                  { label: '-A (Assertive)', value: 'A' },
                  { label: '-T (Turbulent)', value: 'T' }
                ].map((option) => (
                  <Button
                    key={option.label}
                    variant={variant === option.value ? 'default' : 'outline'}
                    onClick={() => setVariant(option.value)}
                    size="sm"
                    className={variant === option.value ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Type Result Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                {getFullTypeCode()}
              </div>
              <p className="text-sm text-gray-500 mt-2">Your four-letter personality code</p>
            </div>
          </CardContent>
        </Card>

        {/* Type Description & Rating */}
        {typeDescription && (
          <Card className="border-2 border-gray-200">
            <CardContent className="pt-6 space-y-6">
              {/* Description */}
              <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-600">
                <h3 className="text-xl font-semibold text-blue-600 mb-3">
                  {typeDescription.code} - {typeDescription.name}
                </h3>
                <p className="text-gray-700 leading-relaxed">{typeDescription.description}</p>
              </div>

              {/* Resonance Rating */}
              <div>
                <h4 className="text-lg font-semibold text-blue-600 mb-3">How much does this resonate with you?</h4>
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
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {resonance !== null && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="font-semibold">Your rating: {resonance}/10</p>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Additional thoughts (optional):</h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything else you'd like to share about your type or how it shows up for you..."
                  className="min-h-[100px] resize-y border-2 focus:border-blue-600"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resources */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold text-blue-700 text-center mb-4">
            🌟 Learn More About Your Type
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: '16Personalities Test', desc: 'Free, comprehensive assessment with detailed type descriptions', url: 'https://www.16personalities.com' },
              { name: 'Official MBTI', desc: 'The original Myers-Briggs Type Indicator assessment', url: 'https://www.myersbriggs.org' },
              { name: 'Type Descriptions', desc: 'In-depth profiles of all 16 personality types', url: 'https://www.truity.com/blog/page/16-personality-types-myers-briggs' },
              { name: 'Career Insights', desc: 'How your type influences career choices and work style', url: 'https://www.personalitypage.com' }
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

export default MBTIAssessment;
