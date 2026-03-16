import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';

interface WooScaleIntroProps {
  onBegin: () => void;
  onSkip: () => void;
}

interface Generation {
  id: string;
  emoji: string;
  name: string;
  years: string;
  summary: string;
  content: string;
}

const WooScaleIntro: React.FC<WooScaleIntroProps> = ({ onBegin, onSkip }) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl bg-white rounded-3xl shadow-2xl p-8 md:p-12"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <div className="p-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to the Wonderful World of Woo-Woo
          </h1>

          <p className="text-xl text-gray-600 italic">
            A lighthearted reflection on imagination, intuition, and mystery
            <br />
            <span className="text-sm">(with optional hand-waving)</span>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            If you've never heard the term <strong>"woo-woo"</strong>, try saying it out loud while gently waving your hands in the air.
            <br />
            That's basically the vibe.
            <br />
            It's a tongue-in-cheek way people describe anything that feels mystical, spiritual, or just a little too "floaty" — like energy talk, horoscopes, crystals, or even meditation.
          </p>

          <p>
            But here, woo-woo isn't an insult or a belief system.
            <br />
            It's a <strong>metaphor</strong> — a playful way to explore how each of us relates to imagination, intuition, and ideas that don't come with lab results attached.
          </p>

          {/* Generational Perspectives - Interactive Accordion */}
          <div className="my-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              🌈 What "Woo-Woo" Might Mean — Depending on When You Grew Up
            </h3>
            <p className="text-gray-600 text-center mb-6 italic">
              Woo-woo can sound silly, mystical, or inspiring — sometimes all at once.
              <br />
              It's one of those words that shifts meaning depending on your cultural weather, your playlist, or how much incense was in the room when you were twenty.
            </p>

            <div className="space-y-3">
              {generations.map((gen) => (
                <div key={gen.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleGeneration(gen.id)}
                    className="w-full p-4 bg-white hover:bg-purple-50 transition-colors flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{gen.emoji}</span>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {gen.name} <span className="text-sm font-normal text-gray-500">({gen.years})</span>
                        </h4>
                        {expandedGen !== gen.id && (
                          <p className="text-sm text-gray-600 mt-1">{gen.summary}</p>
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
                          <p className="text-gray-700 leading-relaxed">{gen.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-lg font-semibold text-purple-700 mb-2">
                🌈 The point isn't to pick sides — or signs.
              </p>
              <p className="text-gray-600">
                It's just to notice how we each relate to things that can't quite be measured.
                <br />
                Whether you lean toward evidence or wonder, you're part of a long human experiment:
                <br />
                <span className="italic">trying to make sense of what we feel, not just what we can prove.</span>
              </p>
            </div>
          </div>

          {/* Callout Boxes */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="font-semibold text-blue-900 mb-2">🧠 It's not a test. It's not about religion.</p>
            <p className="text-blue-800">
              This is simply an invitation to notice what feels familiar, what feels foreign, and what that might say about how you make sense of the world.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <p className="font-semibold text-green-900 mb-2">🔒 It's private and voluntary.</p>
            <p className="text-green-800">
              Your answers are <strong>not collected</strong> or visible to your organization, team, or facilitator.
              <br />
              Everything stays on your device unless you choose to download or share it yourself.
            </p>
          </div>

          <p className="text-center text-lg italic text-gray-600 pt-4">
            So take a breath, shake out your shoulders, maybe wave your hands again,
            <br />
            and have a little fun seeing where you land on the Woo Spectrum. 🌈
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <motion.button
            onClick={onBegin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Let's Begin ✨
          </motion.button>

          <motion.button
            onClick={onSkip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200"
          >
            Maybe Later
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default WooScaleIntro;
