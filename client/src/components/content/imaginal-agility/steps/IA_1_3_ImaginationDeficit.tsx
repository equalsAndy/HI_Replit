import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

const IA_1_3_TRANSCRIPT_HTML = `
<div style="font-family: inherit; line-height: 1.8; color: #1f2937;">

  <h2 style="color: #7c3aed; font-size: 1.25rem; font-weight: 600; margin-top: 0; margin-bottom: 1rem;">The Imagination Deficit</h2>

  <p>A perfect storm of converging forces — traditional causes, hardwired instincts, and AI impacts — has put imagination under pressure. It's not just creativity that's at stake. It's how we understand ourselves, make decisions, and navigate change.</p>

  <p>Children begin with extraordinary imaginative capacity, but much of it fades by adolescence. During the teen years, curiosity, confidence, and creative risk-taking drop sharply. Anxiety and comparison narrow what feels safe. Hope becomes hard to imagine.</p>

  <p>However, imagination operates around the clock below the surface — whether we know it or not. Modern systems reward speed, efficiency, and output, not reflection or lateral thinking. Automation reduces cognitive effort and increases passivity.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />

  <h2 style="color: #7c3aed; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Ancient Patterns, Modern Pressures</h2>

  <p>Most interpersonal challenges we face daily were identified thousands of years ago — not because our ancestors were wiser, but because human nature hasn't fundamentally changed. Ancient contemplative traditions watched the mind's restlessness, named it, and understood it shaped everything.</p>

  <p>Modern education reinforces conformity over curiosity. Evaluation and comparison weaken divergent thinking and reduce confidence in natural capabilities over time. From early childhood, subtle signals teach us that safety lies in being realistic, not imaginative. Fear of looking foolish becomes a lifelong constraint.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />

  <h2 style="color: #7c3aed; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">AI Amplifies the Gap</h2>

  <p>Our minds wander half of the day and most of that inner activity is negative. Imagination magnifies worries, regrets, and criticism unless trained. We're vulnerable to two errors: when a simulation looks real, and when the mind fills gaps with fear or distortion. AI amplifies both.</p>

  <p>AI didn't create the self-awareness gap or imagination deficit, but it exploits human cognitive and emotional vulnerabilities with endless stimuli. The quality of an AI response mirrors the user's level of self-awareness — creating a feedback loop.</p>

  <p>Discernment is a cognitive function. Stress, fatigue, and distraction weaken our ability to distinguish real signals from emotional noise or AI fabrications. Speed rises and reflection drops. Ease increases and awareness fades.</p>

  <p><strong>The cumulative effect is a systemic contraction of imagination — not because we lack ability, but because our environments discourage its use.</strong> Despite its importance, imagination remains undervalued in most organizations. Human capabilities sit in the background instead of driving strategy.</p>

</div>
`;

interface IA13ImaginationDeficitProps {
  onNext?: (stepId: string) => void;
}

const IA_1_3_ImaginationDeficit: React.FC<IA13ImaginationDeficitProps> = ({ onNext }) => {
  const [showGraph, setShowGraph] = useState(true);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Why This Matters Now
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="max-w-none text-gray-800 space-y-6">

          <VideoTranscriptGlossary
            youtubeId="2a27_A9rcNA"
            title="The Imagination Deficit"
            videoEnabled={false}
            transcriptHtml={IA_1_3_TRANSCRIPT_HTML}
          />

          <p className="text-lg leading-relaxed font-semibold">
            Your imagination didn't break. It got neglected.
          </p>

          <p className="text-lg leading-relaxed">
            When you were five, you could spend an hour in a world you invented. By the time you finished school and started working, that capacity was still there — but everything around you had changed.
          </p>

          <p className="text-lg leading-relaxed">
            School rewarded getting the right answer. Work rewards speed and output. Neither asks you to sit with a question, picture someone else's experience, or imagine a future that doesn't exist yet.
          </p>

          <p className="text-lg leading-relaxed">
            Over time, the part of your mind that does those things gets quieter. Not because it's damaged — because it stopped getting used.
          </p>

          <div className="flex justify-center my-8">
            <img
              src="/assets/neglect_not_decline.png"
              alt="A dimmed lightbulb — not broken, just neglected"
              className="w-full max-w-sm rounded-xl shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <h2 className="text-2xl font-semibold text-purple-700 mt-8 mb-4">
            AI makes this worse before it gets better.
          </h2>

          <p className="text-lg leading-relaxed">
            AI tools are extraordinary at generating content, finding patterns, and producing polished answers fast. That's genuinely useful. But there's a side effect: the more you let AI do your thinking, the less you exercise the part of your mind that generates new possibilities, makes judgment calls, and imagines consequences.
          </p>

          <p className="text-lg leading-relaxed">
            The risk isn't that AI replaces you. It's that you slowly stop doing the imaginative work — forming your own view, questioning your assumptions, picturing what might go wrong for someone else — because the machine already gave you something that sounds good enough.
          </p>

          {/* Author vs Editor comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-semibold text-green-800 mb-2">Starting with your own view</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                You form a picture first. Then you ask AI to challenge it, expand it, or find what you missed. You revise your thinking.
              </p>
              <p className="text-sm font-semibold text-green-700">You're the author.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-800 mb-2">Starting with AI's view</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                AI generates a draft. You edit it, tweak the wording, adjust the tone. It ships, but it was never really yours.
              </p>
              <p className="text-sm font-semibold text-amber-700">You're the editor.</p>
            </div>
          </div>

          <div className="flex justify-center my-4">
            <img
              src="/assets/author_vs_editor.png"
              alt="Author vs Editor — who leads the thinking?"
              className="w-full max-w-lg rounded-xl shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Graph image — fail silently if missing */}
          {showGraph && (
            <div className="flex justify-center my-8">
              <img
                src="/assets/ia-1-3-graph.png"
                alt="Imagination Deficit Over Time"
                className="w-full max-w-xl rounded-lg shadow-md"
                onError={() => setShowGraph(false)}
              />
            </div>
          )}

          <p className="text-lg leading-relaxed">
            This matters whether you're a teacher, a product manager, a nurse, a PhD student, or a team lead. In any role where you need to think beyond what's already known, your imagination is the capability that AI cannot replace.
          </p>

          <h2 className="text-2xl font-semibold text-purple-700 mt-8 mb-4">
            The practical part
          </h2>

          <p className="text-lg leading-relaxed">
            Here's what the research shows: imagination responds to practice like a muscle responds to exercise. Regular, simple practices — done in minutes, not hours — can measurably strengthen it. You don't need to go on a retreat or read a stack of neuroscience papers.
          </p>

          <p className="text-lg leading-relaxed">
            You need to start noticing your own mind, and then start directing it.
          </p>

          <p className="text-lg leading-relaxed">
            That's what the rest of this course does.
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 mt-8">
            <div className="flex justify-center mb-5">
              <img
                src="/assets/black_box_opening.png"
                alt="The black box opening — your imagination becoming visible"
                className="w-full max-w-sm rounded-xl shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <p className="text-lg leading-relaxed text-gray-800 font-medium text-center">
              This course gives you the tools to open the black box, see what's inside, and start steering.
            </p>
            <p className="text-base leading-relaxed text-gray-600 text-center mt-3">
              It starts with a simple question: how does your imagination show up right now?
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-2-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Module 2
        </Button>
      </div>
    </div>
  );
};

export default IA_1_3_ImaginationDeficit;
