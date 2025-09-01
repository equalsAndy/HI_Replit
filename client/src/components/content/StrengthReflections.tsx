import React, { useEffect, useState } from 'react';
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

export default function StrengthReflections({ strengths, onComplete, workshopLocked = false }: StrengthReflectionsProps) {
  const [configs, setConfigs] = useState<any[]>([]);

  useEffect(() => {
    setConfigs(strengths.map((s, i) => ({
      id: `strength-${i+1}`,
      question: `Your ${s.position}${s.position === 1 ? 'st' : s.position === 2 ? 'nd' : s.position === 3 ? 'rd' : 'th'} strength is ${s.label} (${s.score}%)`,
      instruction: `How and when do you use your ${s.label.toLowerCase()} strength most effectively?`,
      example: getStrengthExample(s.label, s.score),
      strengthColor: getStrengthColors(s.label),
      minLength: 25,
    })));
  }, [strengths]);

  if (!configs.length) return <div>Loading reflections...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Reflect on Your Strengths</h2>
        <p className="text-lg text-gray-600">
          Think about how each of your top strengths shows up in your work. Your reflections will appear one at a time.
        </p>
      </div>

      <ReusableReflection
        reflectionSetId="strength-reflections"
        reflections={configs}
        progressiveReveal={true}
        onComplete={onComplete}
        workshopLocked={workshopLocked}
      />
    </div>
  );
}
