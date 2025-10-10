import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, Share2 } from 'lucide-react';

interface WooScaleResultsProps {
  score: number;
  answers: number[];
  onRetake?: () => void;
  onContinue?: () => void;
}

interface WooLevel {
  name: string;
  range: string;
  description: string;
  color: string;
  gradient: string;
  emoji: string;
  celebration: string;
}

const getWooLevel = (score: number): WooLevel => {
  // Score range is now 12-60 (12 questions × 1-5 scale)
  if (score >= 55) {
    return {
      name: "Cosmic Wanderer",
      range: "55-60",
      description: "You embrace mystery, intuition, and the unseen with open arms. The mystical feels like home to you, and you trust in forces beyond logic.",
      color: "purple",
      gradient: "from-purple-600 via-fuchsia-500 to-violet-600",
      emoji: "✨🌌",
      celebration: "You dance freely in the realm of mystery and magic!"
    };
  } else if (score >= 45) {
    return {
      name: "Intuitive Explorer",
      range: "45-54",
      description: "You lean into intuition and are comfortable with the mystical, while still appreciating grounded thinking. You explore the unknown with curiosity.",
      color: "pink",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      emoji: "🔮💫",
      celebration: "You beautifully balance wonder and wisdom!"
    };
  } else if (score >= 33) {
    return {
      name: "Balanced Bridger",
      range: "33-44",
      description: "You live comfortably between logic and intuition, appreciating both evidence and mystery. You can speak both languages fluently.",
      color: "blue",
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      emoji: "⚖️🌟",
      celebration: "You bridge worlds with grace and openness!"
    };
  } else if (score >= 21) {
    return {
      name: "Grounded Pragmatist",
      range: "21-32",
      description: "You prefer evidence and logic but remain open to occasional mystery. You appreciate structure while allowing room for the unexpected.",
      color: "teal",
      gradient: "from-green-600 via-teal-500 to-cyan-500",
      emoji: "🧭📊",
      celebration: "You stay grounded while keeping the door open!"
    };
  } else {
    return {
      name: "Rational Realist",
      range: "12-20",
      description: "You thrive on logic, evidence, and measurable reality. The mystical isn't your language, and that's perfectly valid. You trust what you can verify.",
      color: "gray",
      gradient: "from-amber-700 via-yellow-700 to-green-700",
      emoji: "🔬📐",
      celebration: "You bring clarity and reason to every situation!"
    };
  }
};

const WooScaleResults: React.FC<WooScaleResultsProps> = ({
  score,
  answers,
  onRetake,
  onContinue
}) => {
  const level = getWooLevel(score);
  const maxScore = 60; // 12 questions × 5 max points
  const percentage = (score / maxScore) * 100;

  const handleDownload = () => {
    const resultsText = `
The Woo Scale: Your Mystical-to-Practical Spectrum
===================================================

Your Result: ${level.name} ${level.emoji}

${level.celebration}

${level.description}

---
Remember: This is a playful reflection, not a judgment.
There's no "right" place to be on the spectrum.
Your relationship with mystery is uniquely yours - and it may shift over time!
    `.trim();

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-woo-scale-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12"
      >
        {/* Celebration Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            className="inline-block mb-4"
          >
            <div className={`p-4 bg-gradient-to-r ${level.gradient} rounded-full`}>
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          <h1 className="text-5xl md:text-6xl mb-3">
            {level.emoji}
          </h1>

          <h2 className={`text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r ${level.gradient} bg-clip-text text-transparent`}>
            {level.name}
          </h2>

          <p className="text-xl text-gray-600 font-medium">
            {level.celebration}
          </p>
        </motion.div>

        {/* Visual Spectrum Bar (no score shown) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="text-center mb-4">
            <p className="text-lg text-gray-600">
              Your Place on the Mystical-to-Practical Spectrum
            </p>
          </div>

          {/* Visual Spectrum Bar */}
          <div className="relative w-full bg-gradient-to-r from-amber-700 via-cyan-500 to-purple-600 rounded-full h-6 overflow-hidden shadow-lg">
            <motion.div
              className="absolute top-0 left-0 h-full flex items-center"
              initial={{ left: '0%' }}
              animate={{ left: `${percentage}%` }}
              transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            >
              <div className="w-8 h-8 bg-white rounded-full shadow-xl border-4 border-gray-800 -ml-4"></div>
            </motion.div>
          </div>

          {/* Spectrum Labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>🔬 Practical</span>
            <span>⚖️ Balanced</span>
            <span>✨ Mystical</span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`bg-gradient-to-r ${level.gradient} bg-opacity-10 rounded-2xl p-6 mb-8`}
        >
          <p className="text-lg text-gray-700 leading-relaxed">
            {level.description}
          </p>
        </motion.div>

        {/* Reminder */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-8"
        >
          <p className="text-sm text-blue-900 italic">
            <strong>Remember:</strong> This is a playful reflection, not a judgment.
            There's no "right" place to be on the spectrum.
            Your relationship with mystery is uniquely yours, and it may shift over time.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
          >
            <Download className="h-5 w-5" />
            Download Results
          </button>

          {onRetake && (
            <button
              onClick={onRetake}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:border-gray-400 transition-all duration-200"
            >
              Retake Assessment
            </button>
          )}

          {onContinue && (
            <button
              onClick={onContinue}
              className={`flex-1 bg-gradient-to-r ${level.gradient} text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200`}
            >
              Continue →
            </button>
          )}
        </motion.div>

        {/* Privacy Reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          🔒 Your results are private and stored only on your device
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WooScaleResults;
