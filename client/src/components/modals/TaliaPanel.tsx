// client/src/components/modals/TaliaPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import TaliaAvatar from './TaliaAvatar';
import { TaliaMessage, StrengthData } from '@/types/coaching';
import { useTaliaAPI } from '@/hooks/useTaliaAPI';
import { Send } from 'lucide-react';

interface TaliaPanelProps {
  chatHistory: TaliaMessage[];
  addMessageToHistory: (message: Omit<TaliaMessage, 'id' | 'timestamp'>) => void;
  strength: StrengthData;
}

const TaliaPanel: React.FC<TaliaPanelProps> = ({ 
  chatHistory, 
  addMessageToHistory, 
  strength 
}) => {
  const [input, setInput] = useState('');
  const { sendMessage, isLoading } = useTaliaAPI();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    // Add user message
    addMessageToHistory({
      text: input,
      sender: 'user',
    });
    
    const userMessage = input;
    setInput('');

    // Get Talia's response
    const response = await sendMessage(userMessage, strength, chatHistory);
    
    // Add Talia's response
    addMessageToHistory({
      text: response,
      sender: 'talia',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get strength percentage for display (mock calculation)
  const getStrengthPercentage = (strengthName: string) => {
    const percentages: Record<string, number> = {
      'Feeling': 21,
      'Imagination': 18,
      'Thinking': 24,
      'Planning': 19,
      'Acting': 22,
    };
    return percentages[strengthName] || 20;
  };

  const strengthPercentage = getStrengthPercentage(strength.name);

  return (
    <div className="coach-panel flex flex-col h-full">
      {/* Coach Header */}
      <div className="coach-header p-4 border-b border-gray-200">
        <div className="coach-avatar-section flex items-center mb-3">
          <div className="coach-avatar mr-4">
            <TaliaAvatar />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Talia</h3>
            <p className="text-sm text-gray-600">Your AI Coach</p>
          </div>
        </div>
        <div className="strength-context">
          <div className="strength-badge inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-1">
            💙 {strength.name} • {strengthPercentage}%
          </div>
          <p className="text-xs text-gray-600">Exploring your {strength.name.toLowerCase()} approach</p>
        </div>
      </div>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className="chat-container flex-1 overflow-y-auto p-4 space-y-4"
      >
        {chatHistory.map((message) => (
          <div 
            key={message.id} 
            className={`coach-message ${message.sender === 'user' ? 'user-message' : ''}`}
          >
            {message.sender === 'talia' ? (
              <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                <div className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br>') }} />
              </div>
            ) : (
              <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[85%] ml-auto">
                <div className="text-sm">{message.text}</div>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isLoading && (
          <div className="typing-indicator flex items-center space-x-2 text-gray-500">
            <span className="text-sm">Talia is thinking</span>
            <div className="typing-dots flex space-x-1">
              <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Coach Input */}
      <div className="coach-input p-4 border-t border-gray-200">
        <div className="relative">
          <textarea 
            className="coach-input-field w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Ask Talia about your ${strength.name} strength...`}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            className="ask-button absolute right-2 bottom-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaliaPanel;
