import React from 'react';

const FloatingAITriggerMinimal: React.FC = () => {
  console.log('🤖 FloatingAITrigger Minimal: Rendering test component');
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button className="w-16 h-16 rounded-full bg-purple-500 text-white flex items-center justify-center">
        AI
      </button>
    </div>
  );
};

export default FloatingAITriggerMinimal;