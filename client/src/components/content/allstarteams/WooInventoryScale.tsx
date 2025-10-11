import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, ArrowRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Generation {
  id: string;
  emoji: string;
  name: string;
  years: string;
  summary: string;
  content: string;
}

interface WooInventoryScaleProps {
  onComplete?: (results: any) => void;
  onSave?: (data: any) => void;
  savedData?: any;
  onBack?: () => void;
}

interface Question {
  id: number;
  text: string;
  reverse: boolean;
}

const coreQuestions: Question[] = [
  { id: 1, text: "I get uncomfortable when people talk about 'energy' or unseen forces.", reverse: true },
  { id: 2, text: "I often sense meaning or pattern beneath the surface of events.", reverse: false },
  { id: 3, text: "I can appreciate symbolic or metaphorical language even if I don't take it literally.", reverse: false },
  { id: 4, text: "I prefer facts to feelings when making decisions.", reverse: true },
  { id: 5, text: "Imagination is one of the most practical tools humans have.", reverse: false },
  { id: 6, text: "I use intuition or 'gut feeling' as valid input when reasoning.", reverse: false },
  { id: 7, text: "Creativity needs structure and evidence to be useful.", reverse: true },
  { id: 8, text: "I enjoy exploring ideas that can't be proven but feel meaningful.", reverse: false },
  { id: 9, text: "I find practices like mindfulness or meditation helpful for grounding or reflection.", reverse: false },
  { id: 10, text: "I get frustrated when conversations become too abstract.", reverse: true },
  { id: 11, text: "Everything in life is connected in ways science hasn't yet explained.", reverse: false },
  { id: 12, text: "I sometimes experience coincidences or synchronicities as personally significant.", reverse: false }
];

type ViewState = 'intro' | 'assessment' | 'results';

const WooInventoryScale: React.FC<WooInventoryScaleProps> = ({
  onComplete,
  onSave,
  savedData,
  onBack
}) => {
  const [currentView, setCurrentView] = useState<ViewState>('intro');
  const [responses, setResponses] = useState<Record<number, number>>(savedData?.responses || {});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [expandedGen, setExpandedGen] = useState<string | null>(null);

  const generations: Generation[] = [
    {
      id: 'boomers',
      emoji: '🪶',
      name: 'Boomers',
      years: 'born ~1946–1964',
      summary: 'You might remember when words like energy and cosmic first floated into conversation',
      content: 'You might remember when words like energy and cosmic first floated into conversation — yoga mats, transcendental meditation, and talk of "vibes." Some of it probably felt freeing, some of it maybe too far out. Woo-woo might sound like a throwback — peace signs and patchouli — or a reminder that curiosity once changed how people saw the world.'
    },
    {
      id: 'genx',
      emoji: '🌀',
      name: 'Gen X',
      years: 'born ~1965–1980',
      summary: 'You might have grown up watching both cynicism and spirituality on the same TV screen',
      content: 'You might have grown up watching both cynicism and spirituality on the same TV screen. "Woo-woo" could sound like something your friend\'s mom believed while burning sage — or something you secretly dabble in, even if you laugh about it. You\'re fluent in the art of believing with one eyebrow raised.'
    },
    {
      id: 'millennials',
      emoji: '🌿',
      name: 'Millennials',
      years: 'born ~1981–1996',
      summary: 'You might see woo-woo through the lens of self-care, curiosity, and connection',
      content: 'You might see woo-woo through the lens of self-care, curiosity, and connection. Maybe you check your horoscope for fun, meditate through a podcast, or talk about "energy" as emotional literacy, not mysticism. You tend to remix the mystical with the practical — a candle, a calendar, and a sense of humor.'
    },
    {
      id: 'genz',
      emoji: '🔮',
      name: 'Gen Z',
      years: 'born ~1997–2012',
      summary: 'You may not use the word woo-woo much — it\'s more like vibe check or astrology meme',
      content: 'You may not use the word woo-woo much — it\'s more like vibe check, astrology meme, or universe content drop. You\'re comfortable playing with unseen forces, digital or spiritual, and turning them into language, art, or irony. Your version of woo is often aesthetic — playful, layered, and proudly nonbinary.'
    },
    {
      id: 'alpha',
      emoji: '✨',
      name: 'Gen Alpha',
      years: 'born ~2013–2028',
      summary: 'You\'re growing up in a world where AI, algorithms, and imagination all feel invisible but powerful',
      content: 'You\'re growing up in a world where AI, algorithms, and imagination all feel invisible but powerful. You might see magic and code as cousins — both ways of shaping reality. Maybe "woo" won\'t sound mystical at all; maybe it\'ll just sound like curiosity, creativity, and pattern-recognition with personality.'
    }
  ];

  const toggleGeneration = (id: string) => {
    setExpandedGen(expandedGen === id ? null : id);
  };

  const handleResponse = (questionId: number, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateWOA = () => {
    const validResponses = Object.entries(responses).filter(([_, value]) => value !== 0);

    if (validResponses.length === 0) return 0;

    const sum = validResponses.reduce((acc, [questionId, value]) => {
      const question = coreQuestions.find(q => q.id === parseInt(questionId));
      const adjustedValue = question?.reverse ? (6 - value) : value;
      return acc + adjustedValue;
    }, 0);

    return (sum / validResponses.length).toFixed(1);
  };

  const getWooLevel = (woa: number) => {
    if (woa >= 4.5) return {
      level: 5,
      label: "Cosmic Wanderer",
      color: "purple",
      emoji: "🌈✨",
      gradient: "from-purple-500 via-pink-500 via-yellow-400 to-green-400",
      description: "You embrace mystery, intuition, and the unseen with open arms. The mystical feels like home to you."
    };
    if (woa >= 3.5) return {
      level: 4,
      label: "Intuitive Explorer",
      color: "pink",
      emoji: "🔮💫",
      gradient: "from-purple-400 via-pink-400 to-orange-400",
      description: "You lean into intuition and are comfortable with the mystical, while still appreciating grounded thinking."
    };
    if (woa >= 2.5) return {
      level: 3,
      label: "Balanced Bridger",
      color: "blue",
      emoji: "⚖️🌟",
      gradient: "from-blue-400 via-purple-400 to-pink-400",
      description: "You live comfortably between logic and intuition, appreciating both evidence and mystery."
    };
    if (woa >= 1.5) return {
      level: 2,
      label: "Grounded Pragmatist",
      color: "teal",
      emoji: "🧭📊",
      gradient: "from-gray-300 via-blue-300 to-green-300",
      description: "You prefer evidence and logic but remain open to occasional mystery."
    };
    return {
      level: 1,
      label: "Rational Realist",
      color: "gray",
      emoji: "🔬📐",
      gradient: "from-gray-400 to-gray-500",
      description: "You thrive on logic, evidence, and measurable reality. The mystical isn't your language, and that's perfectly valid."
    };
  };

  const isComplete = () => Object.keys(responses).length === 12;
  const progress = (Object.keys(responses).length / 12) * 100;

  const handleComplete = async () => {
    const woa = parseFloat(calculateWOA());
    const wooLevel = getWooLevel(woa);

    const results = {
      woa,
      level: wooLevel.level,
      label: wooLevel.label,
      responses,
      completedAt: new Date().toISOString()
    };

    // Save to database
    try {
      const response = await fetch('/api/workshop-data/woo-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(results)
      });

      if (!response.ok) {
        console.error('Failed to save WOO results to database');
      }
    } catch (error) {
      console.error('Error saving WOO results:', error);
    }

    // Still call onSave callback if provided
    if (onSave) {
      await onSave(results);
    }

    localStorage.setItem('woo-inventory-results', JSON.stringify(results));
    setCurrentView('results');
  };

  const handleDownload = () => {
    const woa = parseFloat(calculateWOA());
    const wooLevel = getWooLevel(woa);

    const resultsText = `
Woo Orientation Inventory Results
==================================

Your Woo Level: ${wooLevel.label} ${wooLevel.emoji}
Woo Orientation Average (WOA): ${woa}/5.0

${wooLevel.description}

---
This assessment explores your comfort with imagination,
metaphor, and ambiguity. There are no right or wrong answers.

Your relationship with mystery is uniquely yours.
    `.trim();

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'woo-inventory-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Intro View
  if (currentView === 'intro') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <div className="p-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">Woo Orientation Inventory</h2>
          <p className="text-lg text-gray-600 mb-6">
            Privacy-First, Non-Religious Assessment
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg text-left space-y-3 mb-6">
            <p className="text-blue-900">
              <strong>🕊️ It is not about belief or religion.</strong> There are no right or wrong answers.
            </p>
            <p className="text-blue-900">
              <strong>🔒 Your responses are private</strong> — not shared with your organization or facilitator.
            </p>
            <p className="text-blue-900">
              <strong>🌈 Results are anonymous</strong> and stored only in your browser unless you choose to export them.
            </p>
          </div>

          {/* Generational Perspectives - Interactive Accordion */}
          <div className="my-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              🌈 What "Woo-Woo" Might Mean — Depending on When You Grew Up
            </h3>
            <p className="text-gray-600 text-center mb-6 italic text-sm">
              Woo-woo can sound silly, mystical, or inspiring — sometimes all at once.
              <br />
              It's one of those words that shifts meaning depending on your cultural weather, your playlist, or how much incense was in the room when you were twenty.
            </p>

            <div className="space-y-3 mb-6">
              {generations.map((gen) => (
                <div key={gen.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleGeneration(gen.id)}
                    className="w-full p-4 bg-white hover:bg-purple-50 transition-colors flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{gen.emoji}</span>
                      <div>
                        <h4 className="font-bold text-base text-gray-900">
                          {gen.name} <span className="text-xs font-normal text-gray-500">({gen.years})</span>
                        </h4>
                        {expandedGen !== gen.id && (
                          <p className="text-xs text-gray-600 mt-1">{gen.summary}</p>
                        )}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedGen === gen.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedGen === gen.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 bg-gradient-to-br from-purple-50 to-pink-50">
                          <p className="text-sm text-gray-700 leading-relaxed">{gen.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="text-center mb-6">
              <p className="text-base font-semibold text-purple-700 mb-2">
                🌈 The point isn't to pick sides — or signs.
              </p>
              <p className="text-sm text-gray-600">
                It's just to notice how we each relate to things that can't quite be measured.
                <br />
                <span className="italic">trying to make sense of what we feel, not just what we can prove.</span>
              </p>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-left mb-6">
            <h3 className="font-semibold text-purple-900 mb-2">What You'll Do:</h3>
            <p className="text-purple-800 mb-3">
              Answer 12 questions, one at a time, using a 0-5 scale.
            </p>
            <p className="text-purple-800 text-sm">
              This measures your comfort with imagination, metaphor, and ambiguity.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setCurrentView('assessment')}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:opacity-90"
              size="lg"
            >
              Begin Assessment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outline" size="lg">
                Maybe Later
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Results View
  if (currentView === 'results') {
    const woa = parseFloat(calculateWOA());
    const wooLevel = getWooLevel(woa);
    const percentage = (woa / 5) * 100;

    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            className="inline-block mb-4"
          >
            <div className={`p-4 bg-gradient-to-r ${wooLevel.gradient} rounded-full`}>
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          <h2 className="text-5xl mb-3">{wooLevel.emoji}</h2>
          <h3 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${wooLevel.gradient} bg-clip-text text-transparent`}>
            {wooLevel.label}
          </h3>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Your Woo Orientation Average (WOA)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-gray-800 mb-2">
                {woa}
                <span className="text-3xl text-gray-400 ml-2">/ 5.0</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-6">
              <motion.div
                className={`h-4 bg-gradient-to-r ${wooLevel.gradient} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className={`bg-gradient-to-r ${wooLevel.gradient} bg-opacity-10 rounded-lg p-6`}>
              <p className="text-lg text-gray-700 leading-relaxed">
                {wooLevel.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-sm text-blue-900 italic">
            <strong>Remember:</strong> This is a playful reflection, not a judgment.
            There's no "right" place to be on the spectrum.
            Your relationship with mystery is uniquely yours, and it may shift over time.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={handleDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Results
          </Button>
          <Button
            onClick={() => {
              setResponses({});
              setCurrentView('intro');
            }}
            variant="outline"
          >
            Retake Assessment
          </Button>
          {onComplete && (
            <Button
              onClick={() => onComplete({ woa, level: wooLevel.level, label: wooLevel.label, responses })}
              className={`bg-gradient-to-r ${wooLevel.gradient}`}
            >
              Continue
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          🔒 Your results are private and stored only on your device
        </p>
      </div>
    );
  }

  // Assessment View - One question at a time
  const currentQuestion = coreQuestions[currentQuestionIndex];
  const assessmentProgress = ((currentQuestionIndex + 1) / coreQuestions.length) * 100;

  const handleNext = async () => {
    if (currentQuestionIndex < coreQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question - save and go back to hub
      const woa = parseFloat(calculateWOA());
      const wooLevel = getWooLevel(woa);

      const results = {
        woa,
        level: wooLevel.level,
        label: wooLevel.label,
        responses,
        completedAt: new Date().toISOString()
      };

      // Save to database
      try {
        const response = await fetch('/api/workshop-data/woo-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(results)
        });

        if (!response.ok) {
          console.error('Failed to save WOO results to database');
        }
      } catch (error) {
        console.error('Error saving WOO results:', error);
      }

      // Call onComplete callback
      if (onComplete) {
        onComplete(results);
      }
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentView('intro');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {coreQuestions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(assessmentProgress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${assessmentProgress}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-12">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 mb-8"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold">
              {currentQuestion.id}
            </div>
            <p className="font-medium text-2xl text-gray-800 flex-1 pt-2">
              {currentQuestion.text}
            </p>
          </motion.div>

          {/* Slider with gradient */}
          <div className="space-y-4">
            {/* Visual slider with gradient */}
            <div className="relative px-4">
              {/* Gradient background bar */}
              <div className="h-3 rounded-full bg-gradient-to-r from-red-300 via-yellow-300 via-green-300 via-blue-300 to-purple-400"></div>

              {/* Interactive buttons on slider */}
              <div className="absolute inset-0 flex items-center justify-between px-0">
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleResponse(currentQuestion.id, value)}
                    className={`relative flex flex-col items-center transition-all ${
                      responses[currentQuestion.id] === value ? 'scale-125 -translate-y-2' : 'hover:scale-110'
                    }`}
                  >
                    {/* Circle button */}
                    <div
                      className={`w-12 h-12 rounded-full border-3 flex items-center justify-center font-bold text-base transition-all shadow-lg ${
                        responses[currentQuestion.id] === value
                          ? 'bg-white border-purple-600 text-purple-700 ring-4 ring-purple-200'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-purple-400'
                      }`}
                    >
                      {value}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-gray-600 font-medium px-2">
              <span className="text-left" style={{ width: '16.666%' }}>Skip</span>
              <span className="text-center" style={{ width: '16.666%' }}>Strongly<br/>Disagree</span>
              <span className="text-center" style={{ width: '16.666%' }}>Disagree</span>
              <span className="text-center" style={{ width: '16.666%' }}>Neutral</span>
              <span className="text-center" style={{ width: '16.666%' }}>Agree</span>
              <span className="text-right" style={{ width: '16.666%' }}>Strongly<br/>Agree</span>
            </div>

            {/* Selected value display */}
            {responses[currentQuestion.id] !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <span className={`inline-block px-4 py-2 rounded-full text-base font-semibold ${
                  responses[currentQuestion.id] === 0
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {responses[currentQuestion.id] === 0 && 'Skipped'}
                  {responses[currentQuestion.id] === 1 && 'Strongly Disagree'}
                  {responses[currentQuestion.id] === 2 && 'Disagree'}
                  {responses[currentQuestion.id] === 3 && 'Neutral'}
                  {responses[currentQuestion.id] === 4 && 'Agree'}
                  {responses[currentQuestion.id] === 5 && 'Strongly Agree'}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              {currentQuestionIndex === 0 ? 'Back to Intro' : 'Previous'}
            </button>

            <button
              onClick={handleNext}
              disabled={responses[currentQuestion.id] === undefined}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentQuestionIndex < coreQuestions.length - 1 ? 'Continue' : 'Finish'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-full px-6 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all"
          >
            {currentQuestionIndex < coreQuestions.length - 1 ? 'Skip this question' : 'Skip and finish'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WooInventoryScale;
