import React from 'react';
import { Button } from '@/components/ui/button';
import ImaginalAgilityRadarChart from './ImaginalAgilityRadarChart';
import imaginalAgilityLogo from '@assets/imaginal_agility_logo_nobkgrd.png';

interface ImaginalAgilityContentProps {
  stepId: string;
  onNext?: () => void;
  onOpenAssessment?: () => void;
  assessmentResults?: any;
  user?: any;
}

const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({
  stepId,
  onNext,
  onOpenAssessment,
  assessmentResults,
  user
}) => {

  const renderStepContent = () => {
    switch (stepId) {
      case 'ia-1-1':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; Introduction to Imaginal Agility
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/k3mDEAbUwZ4" 
                title="Introduction to Imaginal Agility" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <p>Welcome.</p>
              
              <p>Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.</p>
              
              <p>As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.</p>
              
              <p>This Micro Course is your starting point.</p>
              
              <p>You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.</p>
              
              <p>It's the first step in building Imaginal Agility — a skillset for navigating change, solving problems, and creating value.</p>
              
              <p>Next, you'll meet with your team to turn fresh insight into shared breakthroughs.</p>
              
              <p>You're not just learning about imagination. You're harnessing it — together.</p>
            </div>
          </div>
        );

      case 'ia-2-1':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; The Triple Challenge
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/EsExXeKFiKg" 
                title="The Triple Challenge" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700">
              <p>As artificial intelligence accelerates, it's causing a serious decline in human cognition seen in three cascading challenges. The first step in addressing a challenge is acknowledging it exists. It's now on the radar screen and may no longer be ignored.</p>
            </div>
          </div>
        );

      case 'ia-3-1':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; Imaginal Agility Solution
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/l3XVwPGE6UY" 
                title="Imaginal Agility Solution" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <p>Imagination is a primal human power — not content with what we know, but impelled to ask: 'What if?' Let's explore what this means, and how to harness it — individually and as a team.</p>
              
              <p>Upon viewing the video, please click on the button below to complete your Core Capabilities Self-Assessment.</p>
            </div>
          </div>
        );

      case 'ia-4-1':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; Self-Assessment
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/Xdn8lkSzTZU" 
                title="Self-Assessment" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <p>As organizations face what Deloitte identifies as an "imagination deficit" in the AI era, robust imagination self-assessment becomes essential for maintaining human creative agency and fostering transformative innovation capacity.</p>
              
              <p>This Self-Assessment helps participants to reflect on their five core capabilities essential for personal growth, team synergy, and collaborative intelligence:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Imagination</li>
                <li>Curiosity</li>
                <li>Empathy</li>
                <li>Creativity</li>
                <li>Courage</li>
              </ul>
              
              <p>Your responses will generate a visual radar map for reflection and use in the Teamwork Practice Session. The process should take about 10–15 minutes.</p>
              
              <div className="mt-8">
                <Button 
                  onClick={onOpenAssessment}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  Start Assessment
                </Button>
              </div>
            </div>
          </div>
        );

      case 'ia-4-2':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; Review Results
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/If2FH40IgTM" 
                title="Review Results" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <h2 className="text-2xl font-semibold text-purple-700">Review Your Imagination Radar</h2>
              
              <p>You've just completed your self-assessment. Now it's time to explore your results.</p>
              
              <p>Your Radar Map reveals how five essential human capabilities show up in your life and work.</p>
              
              <h3 className="text-xl font-semibold text-purple-700">What This Is</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>A snapshot, not a scorecard</li>
                <li>A reflection tool, not a judgment</li>
                <li>A way to see patterns and possibilities</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-purple-700">What Comes Next</h3>
              <p>You'll bring this Radar into the next phase: the Team Practice Session, where it becomes a foundation for shared insight, creative alignment, and collaboration with AI.</p>
              
              {assessmentResults && (
                <div className="mt-8">
                  <ImaginalAgilityRadarChart data={assessmentResults} />
                </div>
              )}
            </div>
          </div>
        );

      case 'ia-5-1':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; Teamwork Preparation
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/hOV2zaWVxeU" 
                title="Teamwork Preparation" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <p>Welcome to the next stage of the Imaginal Agility Workshop.</p>
              
              <p>Now that you've completed your self-assessment and explored your radar profile, it's time to bring your imagination into action — with your team.</p>
              
              <p>Together, you'll enter a shared digital whiteboard space designed for real-time collaboration. This is where individual insights become team breakthroughs.</p>
              
              <h3 className="text-xl font-semibold text-purple-700">What to Expect</h3>
              
              <h4 className="text-lg font-semibold text-purple-700">A Structured Whiteboard Practice</h4>
              <p>• Guided exercises will help your team apply imaginal agility in a creative, visual, and action-oriented way.</p>
              
              <h4 className="text-lg font-semibold text-purple-700">Real-Time Co-Creation</h4>
              <p>• You'll brainstorm, align, and design solutions together — rapidly and with purpose.</p>
              
              <h4 className="text-lg font-semibold text-purple-700">Human + AI Synergy</h4>
              <p>• You'll raise your HaiQ — the ability to stay imaginative, collaborative, and human while working with AI.</p>
              
              <h3 className="text-xl font-semibold text-purple-700">What You Leave With</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>A shared model for alignment and trust</li>
                <li>Tools and language to apply imagination at scale</li>
                <li>Personal and team AI insights and prompt packs</li>
                <li>Clearer team identity and action direction</li>
              </ul>
            </div>
          </div>
        );

      case 'ia-6-1':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; Discernment Guide
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/U7pQjMYKk_s" 
                title="Discernment Guide" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <h2 className="text-2xl font-semibold text-purple-700">REALITY DISCERNMENT</h2>
              <p className="text-xl font-semibold">Train Your Mind to Know What's Real.</p>
              
              <p>In an age of AI-generated content, deepfakes, and digital manipulation, discernment is no longer optional — it's essential.</p>
              
              <p>This short learning experience introduces you to the neuroscience behind reality monitoring — the brain's ability to tell what's real from what's imagined — and offers practical tools.</p>
              
              <h3 className="text-xl font-semibold text-purple-700">THE AI MIRROR TEST</h3>
              <p className="font-semibold">A 3-Phase Self-Awareness Tool for Conscious AI Collaboration</p>
              
              <p>The AI Mirror Test is a professional-grade reflection tool to help you assess the quality of your engagement with AI. It supports development of HaiQ (Human-AI Intelligence Quotient) by guiding you through a 3-phase cycle:</p>
              
              <h4 className="text-lg font-semibold text-purple-700">Phase 1: Pre-Reflection — Name the Frame</h4>
              <p>Before you begin interacting with AI, take a moment to answer:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>What is your primary intention in this AI interaction? (solve, explore, validate?)</li>
                <li>What do you expect the AI to do well — or poorly?</li>
                <li>Are you entering this as a co-creator, consumer, or critic?</li>
              </ol>
              
              <h4 className="text-lg font-semibold text-purple-700">Phase 2: Active Observation — Catch Yourself in the Act</h4>
              <p>During your interaction with AI, gently observe:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Did you revise your prompt at all, or accept the first response?</li>
                <li>Did you question anything the AI produced?</li>
                <li>What did you *not* say or ask that shaped the result?</li>
              </ol>
              
              <h4 className="text-lg font-semibold text-purple-700">Phase 3: Post-Reflection — What Did I Miss?</h4>
              <p>After your AI interaction, take 1–2 minutes to reflect:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>What surprised you about your own behavior?</li>
                <li>Did AI help you think more clearly — or just faster?</li>
                <li>What will you do differently next time?</li>
              </ol>
              
              <h4 className="text-lg font-semibold text-purple-700">Self-Assessment Practice</h4>
              <p>Rate your interaction on these 5 dimensions (0 = not at all, 10 = fully):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Agency</strong> — How much did you direct the interaction?</li>
                <li><strong>Reflection</strong> — Did you notice your own patterns and revise?</li>
                <li><strong>Imaginative Initiative</strong> — Did you use the AI to expand your thinking?</li>
                <li><strong>Clarity</strong> — Did the interaction help clarify your ideas?</li>
                <li><strong>Discernment</strong> — Did you evaluate AI outputs with critical thinking?</li>
              </ul>
              
              <p>This is a learning tool you can practice with any AI interaction to develop stronger discernment skills and more conscious collaboration with AI systems.</p>
            </div>
          </div>
        );

      case 'ia-7-1':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; The Neuroscience
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/JbU8YyUJhH0" 
                title="The Neuroscience" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <h2 className="text-2xl font-semibold text-purple-700">The Neuroscience of Imagination</h2>
              
              <p>Modern neuroscience reveals that imagination isn't just creativity — it's a sophisticated cognitive process that involves multiple brain networks working together.</p>
              
              <p>Understanding how your brain generates, evaluates, and implements imaginative thinking gives you practical tools for enhancing this essential human capability.</p>
              
              <h3 className="text-xl font-semibold text-purple-700">Key Brain Networks</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Default Mode Network</strong> — Generates spontaneous ideas and possibilities</li>
                <li><strong>Executive Control Network</strong> — Evaluates and refines imaginative content</li>
                <li><strong>Salience Network</strong> — Switches between different modes of thinking</li>
              </ul>
              
              <p>By understanding these networks, you can learn to work with your brain's natural imagination processes more effectively.</p>
            </div>
          </div>
        );

      case 'ia-8-1':
        return (
          <div className="prose max-w-none">
            <div className="flex items-center mb-6">
              <img 
                src={imaginalAgilityLogo} 
                alt="Imaginal Agility" 
                className="h-12 w-auto mr-4"
              />
              <h1 className="text-3xl font-bold text-purple-700 mb-0">
                Imaginal Agility Workshop Course &gt; Next Steps
              </h1>
            </div>
            
            <div className="mb-8">
              <iframe 
                width="400" 
                height="300" 
                src="https://www.youtube.com/embed/3qAu5tC5DwU" 
                title="Next Steps" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <h2 className="text-2xl font-semibold text-purple-700">Your Imaginal Agility Journey Continues</h2>
              
              <p>Congratulations on completing the Imaginal Agility Workshop core modules. You've developed foundational skills in:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Self-assessment of core imagination capabilities</li>
                <li>Understanding the neuroscience of imaginative thinking</li>
                <li>Practical tools for reality discernment</li>
                <li>Framework for conscious AI collaboration</li>
                <li>Team preparation for collaborative imagination</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-purple-700">What's Next?</h3>
              
              <p>Your journey in developing Imaginal Agility doesn't end here. Consider these next steps:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>Practice the AI Mirror Test regularly in your daily AI interactions</li>
                <li>Share your radar results with your team and explore collaborative applications</li>
                <li>Apply the discernment tools in your professional and personal decision-making</li>
                <li>Continue developing your core capabilities through reflection and practice</li>
              </ul>
              
              <p>Remember: Imaginal Agility is not a destination but a practice — a way of engaging with uncertainty, complexity, and possibility that grows stronger with intentional use.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Step Not Found</h1>
            <p>The requested step content is not available.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderStepContent()}
    </div>
  );
};

export default ImaginalAgilityContent;