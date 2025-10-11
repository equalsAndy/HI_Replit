import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import './CoachingModal.css';

interface CoachingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep?: number;
  currentStrength?: string;
  reflectionQuestion?: string;
  initialReflection?: string;
  onSaveReflection?: (reflection: string) => void;
  examples?: string[];
}

export default function CoachingModal({ 
  isOpen, 
  onClose, 
  currentStep, 
  currentStrength, 
  reflectionQuestion,
  initialReflection = '',
  onSaveReflection,
  examples = []
}: CoachingModalProps) {
  const [coachingInput, setCoachingInput] = useState('');
  const [coachingResponse, setCoachingResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reflectionText, setReflectionText] = useState(initialReflection);
  const [activeTab, setActiveTab] = useState<'chat' | 'write'>('chat');

  // Initialize chat with examples when modal opens
  useEffect(() => {
    if (isOpen && examples.length > 0 && !coachingResponse) {
      const exampleText = examples.map(example => `"${example}"`).join('\n\n');
      setCoachingResponse(`Here are some example responses:\n\n${exampleText}\n\nDo you want to talk it through?`);
    }
  }, [isOpen, examples, coachingResponse]);

  const handleCoachingRequest = async () => {
    if (!coachingInput.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create or get conversation
      const conversationResponse = await fetch('/api/coaching/chat/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          persona: 'workshop_assistant',
          workshopStep: `reflect_${currentStep}`,
        })
      });
      
      if (!conversationResponse.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const conversationData = await conversationResponse.json();
      
      // Send message
      const messageResponse = await fetch('/api/coaching/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationId: conversationData.conversationId,
          message: coachingInput,
          persona: 'workshop_assistant',
          context: {
            currentStrength,
            stepNumber: currentStep,
            workshopStep: `reflect_${currentStep}`,
            reflectionQuestion
          }
        })
      });
      
      // Debug: Log what context we're sending
      console.log('🔍 DEBUG: Context being sent to API:', {
        currentStrength,
        stepNumber: currentStep,
        workshopStep: `reflect_${currentStep}`,
        reflectionQuestion
      });
      
      if (!messageResponse.ok) {
        throw new Error('Failed to send message');
      }
      
      const messageData = await messageResponse.json();
      
      if (messageData.error) {
        throw new Error(messageData.error);
      }
      
      setCoachingResponse(messageData.response);
      
    } catch (error) {
      console.error('Coaching error:', error);
      setCoachingResponse('Sorry, I encountered an error. Please try again: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndClose = () => {
    if (onSaveReflection && reflectionText.trim()) {
      onSaveReflection(reflectionText);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] min-h-[600px] flex flex-col overflow-hidden resize-none">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              💬 Workshop Assistant
            </h3>
            <p className="text-blue-100 text-sm">
              {reflectionQuestion 
                ? `Help with: "${reflectionQuestion}"`
                : currentStrength 
                  ? `How can I help you reflect on your ${currentStrength} strength?`
                  : 'How can I help you with this reflection step?'
              }
            </p>
          </div>
          <button
            className="text-white hover:text-gray-200 text-xl leading-none"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            💬 Chat with Coach
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'write'
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ✍️ Write Your Reflection
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {activeTab === 'chat' ? (
            <div className="p-6 space-y-4">
              {/* AI Response */}
              {coachingResponse && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Coach:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{coachingResponse}</p>
                </div>
              )}

              {/* User Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your message:
                </label>
                {reflectionQuestion && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Current reflection question:</strong> {reflectionQuestion}
                    </p>
                  </div>
                )}
                <textarea
                  value={coachingInput}
                  onChange={(e) => setCoachingInput(e.target.value)}
                  placeholder={
                    reflectionQuestion 
                      ? `Ask me anything about: ${reflectionQuestion}`
                      : "Ask me anything about this reflection question..."
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-vertical"
                  rows={4}
                />
              </div>

              {/* Chat Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCoachingRequest}
                  disabled={!coachingInput.trim() || isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Thinking...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
                <button
                  onClick={() => {
                    setCoachingInput('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reflection:
                </label>
                {reflectionQuestion && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Question:</strong> {reflectionQuestion}
                    </p>
                  </div>
                )}
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Write your reflection here..."
                  className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[400px] resize-vertical"
                  rows={15}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          {activeTab === 'write' && (
            <button
              onClick={handleSaveAndClose}
              disabled={!reflectionText.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Save & Close
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            {activeTab === 'write' ? 'Close without saving' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
