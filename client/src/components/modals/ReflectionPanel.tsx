// client/src/components/modals/ReflectionPanel.tsx
import React from 'react';
import { Reflection } from '@/types/coaching';

interface ReflectionPanelProps {
  reflectionDraft: Partial<Reflection>;
  updateReflectionDraft: (draft: Partial<Reflection>) => void;
  question: string;
}

const ReflectionPanel: React.FC<ReflectionPanelProps> = ({ 
  reflectionDraft, 
  updateReflectionDraft, 
  question 
}) => {
  const text = reflectionDraft.response || '';
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newWords = newText.trim().split(/\s+/).filter(word => word.length > 0);
    const newWordCount = newWords.length;
    updateReflectionDraft({ 
      response: newText, 
      wordCount: newWordCount 
    });
  };

  const handleClear = () => {
    updateReflectionDraft({ response: '', wordCount: 0 });
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving reflection:', reflectionDraft);
  };

  return (
    <div className="reflection-panel flex flex-col h-full">
      {/* Reflection Header */}
      <div className="reflection-header p-4 border-b border-gray-200">
        <div className="reflection-title flex items-center mb-2">
          <span className="text-xl mr-2">✍️</span>
          <h3 className="text-lg font-semibold">Your Reflection</h3>
        </div>
        <div className="reflection-subtitle text-gray-600 text-sm">
          {question}
        </div>
      </div>

      {/* Reflection Content */}
      <div className="reflection-content flex-1 p-4 space-y-4">
        <textarea 
          className="reflection-textarea w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write 2-4 sentences about how you use your strength..."
          value={text}
          onChange={handleTextChange}
        />

        <div className="reflection-guidance bg-blue-50 rounded-lg p-4">
          <h4 className="flex items-center text-sm font-semibold text-blue-800 mb-2">
            💡 Reflection Tips
          </h4>
          <p className="text-sm text-blue-700">
            Think about specific moments when your empathy or relationship-building made a difference. 
            Focus on <strong>what you noticed</strong> and <strong>how you responded</strong>.
          </p>
        </div>

        <div className="examples-grid grid grid-cols-1 gap-3">
          <div className="example-card bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
            <p className="text-sm text-gray-700 italic">
              "I notice when team energy shifts during meetings and often pause to check in with quieter members..."
            </p>
          </div>
          <div className="example-card bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
            <p className="text-sm text-gray-700 italic">
              "When conflicts arise, I help create space for everyone to be heard before moving to solutions..."
            </p>
          </div>
        </div>
      </div>

      {/* Reflection Footer */}
      <div className="reflection-footer p-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="word-count text-sm text-gray-600">
            {wordCount} words • Aim for 50-100 words
          </div>
          <div className="action-buttons flex space-x-3">
            <button 
              className="btn btn-secondary px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={handleClear}
            >
              Clear
            </button>
            <button 
              className="btn btn-primary px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={wordCount === 0}
            >
              Save Reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionPanel;
