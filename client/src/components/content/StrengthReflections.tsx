import React, { useEffect, useState, useCallback } from 'react';
import ReusableReflection from '@/components/reflection/ReusableReflection';

interface StrengthData {
  label: string;
  score: number;
  position: number;
}

interface StrengthReflectionsProps {
  strengths: StrengthData[];
  onComplete?: () => void;
  workshopLocked?: boolean;
  setCurrentContent?: (content: string) => void;
  markStepCompleted?: (stepId: string) => void;
}

const getStrengthColors = (label: string) => {
  switch (label.toUpperCase()) {
    case 'THINKING': return { bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-800', name: 'THINKING' };
    case 'ACTING':   return { bg: 'bg-red-500',   border: 'border-red-200',   text: 'text-red-800',   name: 'ACTING' };
    case 'FEELING':  return { bg: 'bg-blue-500',  border: 'border-blue-200',  text: 'text-blue-800',  name: 'FEELING' };
    case 'PLANNING': return { bg: 'bg-yellow-500',border: 'border-yellow-200',text: 'text-yellow-800',name: 'PLANNING' };
    default:         return { bg: 'bg-gray-500', border: 'border-gray-200', text: 'text-gray-800', name: label.toUpperCase() };
  }
};

const getStrengthExample = (label: string, score: number): string => {
  const examples: Record<string,string> = {
    THINKING: `I use my analytical abilities when faced with complex data patterns. For example, I analyzed feedback trends and identified key themes that improved our product strategy by 20%.`,
    ACTING:   `I leverage my action-oriented nature to create momentum. Recently I prototyped solutions over a weekend, which helped us validate ideas and move forward quickly.`,
    FEELING:  `I apply my relationship-building skills when integrating new team members, organizing informal chats to make them feel welcome and valued.`,
    PLANNING: `I use my organizational strength for complex projects by creating clear timelines and check-ins, ensuring tasks stay on track and on time.`,
  };
  return examples[label.toUpperCase()] || '';
};

// Helper function to get strength reflection prompt with bullets and examples (from StepByStepReflection)
const getStrengthPrompt = (strengthLabel: string): { question: string; bullets: string[]; examples: string[] } => {
  switch (strengthLabel) {
    case 'PLANNING':
      return {
        question: "How and when do you use your Planning strength?",
        bullets: [
          "Situations where your organizational skills created clarity",
          "How you've implemented systems that improved efficiency",
          "Times when your structured approach prevented problems",
          "How your methodical nature helps maintain consistency"
        ],
        examples: [
          "I use my planning strength when our team takes on complex projects. Recently, I created a project timeline with clear milestones that helped everyone understand deadlines and dependencies, resulting in an on-time delivery.",
          "My methodical approach helps during busy periods. When our team faced multiple competing deadlines, I developed a prioritization framework that allowed us to focus on the most critical tasks first while keeping stakeholders informed."
        ]
      };
    case 'ACTING':
      return {
        question: "How and when do you use your Acting strength?",
        bullets: [
          "Situations where you took initiative when others hesitated",
          "How you've turned ideas into tangible results",
          "Times when your decisiveness moved a project forward",
          "How your pragmatic approach solved practical problems"
        ],
        examples: [
          "I use my action-oriented approach when projects stall. Recently, our team was stuck in analysis paralysis, and I stepped in to create momentum by identifying the three most important next steps and delegating tasks.",
          "My decisive nature helps in crisis situations. During a recent system outage, I quickly prioritized recovery actions while others were still discussing options, which minimized downtime for our customers."
        ]
      };
    case 'FEELING':
      return {
        question: "How and when do you use your Feeling strength?",
        bullets: [
          "Situations where you built trust or resolved conflicts",
          "How you've created inclusive environments",
          "Times when your empathy improved team dynamics",
          "How your people-focused approach enhanced collaboration"
        ],
        examples: [
          "I use my relationship-building strengths when integrating new team members. Recently, I noticed a new colleague struggling to find their place, so I organized informal coffee chats and made sure to highlight their unique skills in meetings.",
          "My empathetic approach helps during difficult conversations. When we needed to deliver constructive feedback to a teammate, I focused on creating a safe space and framing the feedback as an opportunity for growth rather than criticism."
        ]
      };
    case 'THINKING':
      return {
        question: "How and when do you use your Thinking strength?",
        bullets: [
          "Situations where your analytical skills uncovered insights",
          "How you've developed innovative solutions",
          "Times when your logical approach clarified complex issues",
          "How your strategic thinking opened new possibilities"
        ],
        examples: [
          "I use my analytical abilities when faced with ambiguous data. Recently, our team was trying to understand unusual customer behavior patterns, and I was able to identify the key variables and create a model that explained the trend.",
          "My innovative thinking helps when conventional approaches fall short. During a product development challenge, I suggested an entirely different framework that allowed us to reimagine the solution from first principles."
        ]
      };
    default:
      return { question: "", bullets: [], examples: [] };
  }
};

export default function StrengthReflections({ 
  strengths, 
  onComplete, 
  workshopLocked = false, 
  setCurrentContent,
  markStepCompleted 
}: StrengthReflectionsProps) {
  // Build reflection configs once when strengths change
  const configs = React.useMemo(() => {
    const strengthConfigs = strengths.map((s, i) => {
      const promptData = getStrengthPrompt(s.label.toUpperCase());
      return {
        id: `strength-${i+1}`,
        question: `Your ${s.position}${
          s.position === 1 ? 'st' : s.position === 2 ? 'nd' : s.position === 3 ? 'rd' : 'th'
        } strength is ${s.label}`,
        instruction: promptData.question,
        bullets: promptData.bullets,
        examples: promptData.examples,
        example: getStrengthExample(s.label, s.score),
        strengthColor: getStrengthColors(s.label),
        minLength: 25,
      };
    });
    const teamValuesConfig = {
      id: 'team-values',
      question: 'What You Value Most in Team Environments',
      instruction: 'Based on your strengths profile, certain team environments will help you perform at your best. Consider what team qualities or behaviors would complement your unique strengths distribution.',
      bullets: [
        'Team communication styles that work best for you',
        'The type of structure or flexibility you prefer',
        'How you like feedback to be given and received',
        'What makes you feel most supported and effective'
      ],
      examples: [
        'I thrive in team environments that balance structure with flexibility. I appreciate when teams establish clear expectations and deadlines, but also create space for adaptability when circumstances change.',
        'I value team environments where open communication is prioritized and every member\'s contributions are recognized. I work best when there\'s a culture of constructive feedback.'
      ],
      strengthColor: { bg: 'bg-gray-500', border: 'border-gray-200', text: 'text-gray-800', name: 'TEAM VALUES' },
      minLength: 25,
    };
    const uniqueContributionConfig = {
      id: 'unique-contribution',
      question: 'Your Unique Contribution',
      instruction: 'Your particular strengths profile creates a unique combination that you bring to your team. Think about how your top strengths work together to create value.',
      bullets: [
        'How your combination of strengths creates unique value',
        'What you bring that others might not',
        'How your perspective or approach differs from teammates',
        'The specific ways you help teams succeed'
      ],
      examples: [
        'I bring value through my combination of planning and empathy. I create structured processes while ensuring everyone feels heard and supported throughout implementation.',
        'My unique contribution comes from balancing analytical thinking with relationship building. This helps me develop solutions that are both technically sound and people-focused.'
      ],
      strengthColor: { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-800', name: 'UNIQUE CONTRIBUTION' },
      minLength: 25,
    };
    return [...strengthConfigs, teamValuesConfig, uniqueContributionConfig];
  }, [strengths]);

  // Custom completion handler that navigates to flow patterns
  const handleReflectionComplete = React.useCallback(() => {
    console.log('StrengthReflections: All reflections complete, navigating to flow patterns');
    markStepCompleted?.('2-1');
    setCurrentContent?.('intro-to-flow');
    onComplete?.();
  }, [markStepCompleted, setCurrentContent, onComplete]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Reflect on Your Strengths</h2>
        <p className="text-lg text-gray-600 mb-4">
          Take time to reflect deeply on how your strengths show up in your life and work. Understanding how your unique strengths work together helps you maximize your potential.
        </p>
        <p className="text-sm text-gray-500">
          Your reflections will appear one at a time. Complete all 6 reflections to continue to Flow Patterns.
        </p>
      </div>

      <ReusableReflection
        reflectionSetId="strength-reflections"
        reflections={configs}
        progressiveReveal={true}
        onComplete={handleReflectionComplete}
        workshopLocked={workshopLocked}
        completionButtonText="Continue to Flow Patterns"
      />
    </div>
  );
}
