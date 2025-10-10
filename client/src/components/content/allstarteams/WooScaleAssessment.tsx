import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface WooQuestion {
  id: number;
  question: string;
  reverse: boolean; // If true, response polarity is reversed for scoring
}

const wooQuestions: WooQuestion[] = [
  {
    id: 1,
    question: 'When someone starts talking about "vibes" and "cosmic energy," I\'m like... "Okay, but what\'s the science behind this?"',
    reverse: true
  },
  {
    id: 2,
    question: "I'm the person who spots hidden patterns and thinks 'There's something deeper going on here!'",
    reverse: false
  },
  {
    id: 3,
    question: "I can totally vibe with metaphors and symbolism, even when I know they're not literally true",
    reverse: false
  },
  {
    id: 4,
    question: "When making big decisions, I'm Team Facts over Team Feelings every time",
    reverse: true
  },
  {
    id: 5,
    question: "Imagination isn't just fun - it's actually one of humanity's most powerful tools!",
    reverse: false
  },
  {
    id: 6,
    question: "My gut feelings are like a secret advisor I actually listen to",
    reverse: false
  },
  {
    id: 7,
    question: "Creativity is great, but it needs some rules and evidence to actually get stuff done",
    reverse: true
  },
  {
    id: 8,
    question: "I love diving into ideas that feel meaningful, even if I can't prove them in a lab",
    reverse: false
  },
  {
    id: 9,
    question: "Mindfulness and meditation are my go-to tools for staying centered and clear",
    reverse: false
  },
  {
    id: 10,
    question: "When conversations get too 'out there,' I start mentally checking my watch",
    reverse: true
  },
  {
    id: 11,
    question: "Everything in life is connected in mysterious ways that science just hasn't caught up to yet",
    reverse: false
  },
  {
    id: 12,
    question: "Sometimes coincidences feel like the universe is winking at me personally",
    reverse: false
  }
];

// Standard response options (same for all questions)
const responseOptions = [
  { value: 1, label: "Nope, not me at all" },
  { value: 2, label: "Not really my thing" },
  { value: 3, label: "Sometimes, I guess" },
  { value: 4, label: "Yeah, pretty much" },
  { value: 5, label: "That's totally me!" }
];

interface WooScaleAssessmentProps {
  onComplete: (results: { score: number; answers: number[] }) => void;
  onBack: () => void;
}

const WooScaleAssessment: React.FC<WooScaleAssessmentProps> = ({ onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = wooQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / wooQuestions.length) * 100;

  const getGradientClass = (optionValue: number, isReverse: boolean) => {
    // For normal questions: 1=earthy/practical, 5=cosmic/mystical
    // For reverse questions: flip the gradient
    const effectiveValue = isReverse ? (6 - optionValue) : optionValue;

    const gradients = [
      'bg-gradient-to-r from-amber-700 via-yellow-700 to-green-700', // 1 - earthy (practical)
      'bg-gradient-to-r from-green-600 via-teal-500 to-cyan-500', // 2
      'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500', // 3 - balanced
      'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500', // 4
      'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-violet-600' // 5 - cosmic (mystical)
    ];

    return gradients[effectiveValue - 1] || gradients[0];
  };

  const getIcon = (optionValue: number, isReverse: boolean) => {
    const effectiveValue = isReverse ? (6 - optionValue) : optionValue;
    if (effectiveValue <= 2) return '🔬'; // Practical/scientific
    if (effectiveValue >= 4) return '✨'; // Mystical/cosmic
    return '⚖️'; // Balanced
  };

  const handleAnswer = (value: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < wooQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAnimating(false);
      } else {
        // Calculate total score and complete (don't show score to user)
        const totalScore = newAnswers.reduce((sum, val) => sum + val, 0);
        onComplete({ score: totalScore, answers: newAnswers });
      }
    }, 600);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && !isAnimating) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswers(answers.slice(0, -1));
    } else if (currentQuestionIndex === 0) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {wooQuestions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3 backdrop-blur-sm overflow-hidden">
            <motion.div
              className="h-3 rounded-full transition-all duration-300"
              style={{
                background: `linear-gradient(to right, #78350f ${Math.min(progress, 33)}%, #7c3aed ${Math.max(Math.min(progress, 66), 33)}%, #a855f7 ${Math.max(progress, 66)}%)`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-10"
          >
            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {responseOptions.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  disabled={isAnimating}
                  className={`w-full p-6 rounded-2xl text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:hover:scale-100 ${getGradientClass(option.value, currentQuestion.reverse)}`}
                  whileHover={{ scale: isAnimating ? 1 : 1.02 }}
                  whileTap={{ scale: isAnimating ? 1 : 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex-shrink-0 text-2xl">
                      {getIcon(option.value, currentQuestion.reverse)}
                    </span>
                    <span className="flex-1 text-center">{option.label}</span>
                    <span className="flex-shrink-0 w-6"></span> {/* Spacer for balance */}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Back Button */}
            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={isAnimating}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>{currentQuestionIndex === 0 ? 'Back to Intro' : 'Previous'}</span>
              </button>

              <div className="text-sm text-gray-400">
                {answers.length > 0 && `${answers.length} answered`}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Fun hint text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 italic">
            Pick the response that makes you go "Yes, that's me!" There are no wrong answers - just different flavors of awesome! 🌈
          </p>
        </div>
      </div>
    </div>
  );
};

export default WooScaleAssessment;
