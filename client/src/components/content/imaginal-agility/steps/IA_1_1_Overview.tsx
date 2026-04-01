import React from 'react';
import { Button } from '@/components/ui/button';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA11OverviewProps {
  onNext?: (stepId: string) => void;
}

const IA_1_1_Overview: React.FC<IA11OverviewProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Welcome
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed font-semibold">
            Welcome to Imaginal Agility.
          </p>

          {/* Hero image */}
          <div className="flex justify-center my-6">
            <img
              src="/assets/prism_capabilities.png"
              alt="Imagination refracting into five capabilities"
              className="w-full max-w-lg rounded-xl shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <p className="text-lg leading-relaxed">
            This is a short, self-paced course about something you already have: your imagination.
          </p>

          <p className="text-lg leading-relaxed">
            Not the kind of imagination people mean when they say "be creative" or "think outside the box." Something much more basic. Imagination is how your brain makes sense of experience, pictures what might happen next, and connects who you are now to who you could become.
          </p>

          <p className="text-lg leading-relaxed">
            It works all the time — when you replay a conversation, worry about a deadline, or picture your morning before you get out of bed. Most of it happens without you noticing.
          </p>

          <p className="text-lg leading-relaxed">
            This course helps you notice it, understand it, and start using it on purpose — especially when working with AI.
          </p>

          <h2 className="text-2xl font-semibold text-purple-700 mt-8 mb-4">
            Your journey through the course
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            {/* Module 2 */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col items-center text-center">
              <div className="w-full mb-3 flex items-center justify-center">
                <img
                  src="/assets/journey_prism.png"
                  alt="Your I4C Prism"
                  className="w-[150px] h-[75px] object-cover rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <h3 className="font-semibold text-purple-700 text-sm mb-2">Module 2: Your Prism</h3>
              <p className="text-sm text-gray-600 leading-snug">Discover your I4C Prism — a personal snapshot of how imagination, curiosity, caring, creativity, and courage show up in your life right now.</p>
            </div>

            {/* Module 3 */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col items-center text-center">
              <div className="w-full mb-3 flex items-center justify-center">
                <img
                  src="/assets/journey_solo_ladder.png"
                  alt="Ladder of Imagination"
                  className="w-[150px] h-[75px] object-cover rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <h3 className="font-semibold text-purple-700 text-sm mb-2">Module 3: Solo Ladder</h3>
              <p className="text-sm text-gray-600 leading-snug">Five quick exercises: notice your inner autopilot, visualize your potential, find your purpose, renew inspiration, stretch beyond the familiar.</p>
            </div>

            {/* Module 4 */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col items-center text-center">
              <div className="w-full mb-3 flex items-center justify-center">
                <img
                  src="/assets/journey_ai_ladder.png"
                  alt="Advanced Ladder with AI"
                  className="w-[150px] h-[75px] object-cover rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <h3 className="font-semibold text-purple-700 text-sm mb-2">Module 4: Human-AI Collaboration</h3>
              <p className="text-sm text-gray-600 leading-snug">Five advanced exercises where AI collaborates with you in real time. Practice leading your own thinking while AI amplifies it.</p>
            </div>

            {/* Module 5 */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col items-center text-center">
              <div className="w-full mb-3 flex items-center justify-center">
                <img
                  src="/assets/journey_plan.png"
                  alt="Your Development Plan"
                  className="w-[150px] h-[75px] object-cover rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <h3 className="font-semibold text-purple-700 text-sm mb-2">Module 5: Bringing It Together</h3>
              <p className="text-sm text-gray-600 leading-snug">See your patterns, understand how you collaborate with AI, choose one capability to develop, and build an ongoing practice.</p>
            </div>
          </div>

          <p className="text-lg leading-relaxed mt-6">
            It's designed for busy people. Each step is short, and the course is built around practice — not just information.
          </p>


        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-1-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue: Your Imagination: Always On
        </Button>
      </div>
    </div>
  );
};

export default IA_1_1_Overview;
