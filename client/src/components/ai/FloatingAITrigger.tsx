import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, HelpCircle, Send } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { isFeatureEnabled } from '@/utils/featureFlags';

interface FloatingAITriggerProps {
  currentStep?: string;
  workshopType?: 'ast' | 'ia';
  aiEnabled?: boolean;
  context?: {
    stepName?: string;
    strengthLabel?: string;
    questionText?: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FloatingAITrigger: React.FC<FloatingAITriggerProps> = ({
  currentStep,
  workshopType = 'ast',
  aiEnabled = true,
  context
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiCoachingEnabled, setAICoachingEnabled] = useState(true);
  const [checkingAIStatus, setCheckingAIStatus] = useState(true);
  const { shouldShowDemoButtons, isTestUser } = useTestUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check AI coaching status from admin console
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch('/api/coaching/status');
        const data = await response.json();
        setAICoachingEnabled(data.aiCoachingEnabled);
        console.log('🤖 AI Coaching Status:', data);
      } catch (error) {
        console.error('Failed to check AI coaching status:', error);
        setAICoachingEnabled(false); // Default to disabled on error
      } finally {
        setCheckingAIStatus(false);
      }
    };

    checkAIStatus();
    // Check every 30 seconds to stay in sync with admin changes
    const interval = setInterval(checkAIStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check if reflection modal is enabled
  const reflectionModalEnabled = isFeatureEnabled('reflectionModal');

  // Determine if user has access to AI features (test users only)
  const hasAIAccess = shouldShowDemoButtons && reflectionModalEnabled;
  
  // Determine if AI is available for this specific context
  // Only enable on step 2-4 strength reflections for test users, and if admin has enabled AI coaching
  const isAIAvailable = hasAIAccess && aiEnabled && aiCoachingEnabled;

  // Initialize with welcome message when AI is available
  useEffect(() => {
    if (isAIAvailable && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isAIAvailable, context?.stepName, context?.strengthLabel]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Only show to test users (but may be disabled based on context)
  if (!shouldShowDemoButtons) {
    // Only log once per user session to avoid spam
    if (!sessionStorage.getItem('ai-trigger-not-test-user-logged')) {
      console.log('🤖 FloatingAITrigger: Not rendering - not a test user');
      sessionStorage.setItem('ai-trigger-not-test-user-logged', 'true');
    }
    return null;
  }

  // Temporary: Removed debug logging to fix React error #310

  const handleTriggerClick = () => {
    if (isAIAvailable) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMouseEnter = () => {
    if (!isAIAvailable) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Send message to AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isAIAvailable) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🤖 Sending chat message:', {
        message: userMessage.content,
        context: {
          stepName: context?.stepName,
          strengthLabel: context?.strengthLabel,
          questionText: context?.questionText,
          currentStep,
          workshopType
        },
        persona: 'talia_coach'
      });

      const response = await fetch('/api/coaching/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            stepName: context?.stepName,
            strengthLabel: context?.strengthLabel,
            questionText: context?.questionText,
            currentStep,
            workshopType
          },
          persona: 'talia_coach'
        }),
      });

      console.log('📡 Chat response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Chat API error:', response.status, errorText);
        throw new Error(`Failed to get AI response: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Chat response received:', data);
      
      const aiMessage: ChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: data.response || "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get context-aware header text
  const getHeaderText = () => {
    if (context?.strengthLabel) {
      return `Talia • ${context.strengthLabel} Reflection`;
    }
    if (context?.stepName) {
      return `Talia • ${context.stepName}`;
    }
    if (currentStep) {
      return `Talia • Step ${currentStep}`;
    }
    return 'Talia • AI Coach';
  };

  // Get specific context description for current question/area
  const getContextDescription = () => {
    if (context?.strengthLabel && context?.questionText) {
      return `Reflecting on your ${context.strengthLabel} strength`;
    }
    if (context?.questionText) {
      return context.questionText.length > 50 
        ? context.questionText.substring(0, 50) + '...'
        : context.questionText;
    }
    if (context?.strengthLabel) {
      return `Working on ${context.strengthLabel} strength`;
    }
    if (context?.stepName) {
      return context.stepName;
    }
    return 'Your AI coaching assistant';
  };

  // Get context-aware welcome message
  const getWelcomeMessage = () => {
    if (context?.strengthLabel && context?.questionText) {
      return `Hi! I'm here to help you reflect on your ${context.strengthLabel} strength. 

Current reflection: "${context.questionText}"

What thoughts or insights are coming up for you?`;
    }
    if (context?.strengthLabel) {
      return `Hi! I'm here to help you reflect on your ${context.strengthLabel} strength. What insights are you discovering?`;
    }
    if (context?.questionText) {
      return `I can help you think through this reflection: "${context.questionText}"

What would you like to explore?`;
    }
    return `Hi! I'm Talia, your AI coach. I'm here to help you with your workshop reflections. How can I assist you today?`;
  };

  // Get disabled message based on context (only show if user has access but feature is disabled for this context)
  const getDisabledMessage = () => {
    if (!aiCoachingEnabled) {
      return "Talia is disabled by admin";
    }
    if (!aiEnabled) {
      return "Talia isn't available for this area";
    }
    if (!reflectionModalEnabled) {
      return "AI coaching is disabled";
    }
    return "Talia isn't available right now";
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Tooltip for disabled state */}
          {showTooltip && !isAIAvailable && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
              {getDisabledMessage()}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}

          {/* Trigger Button with Talia Image */}
          <button
            onClick={handleTriggerClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
              w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105
              flex items-center justify-center relative border-2
              ${isAIAvailable 
                ? 'border-purple-400 cursor-pointer hover:border-purple-500 opacity-100' 
                : 'border-gray-300 cursor-not-allowed grayscale opacity-40'
              }
              ${isExpanded ? 'ring-2 ring-purple-400' : ''}
              overflow-hidden bg-white
            `}
          >
            {isExpanded ? (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <X className="w-6 h-6 text-white z-10" />
              </div>
            ) : null}
            
            {/* Talia Headshot */}
            <img 
              src="/assets/Talia_headshot.png" 
              alt="Talia AI Coach"
              className={`w-full h-full object-cover ${!isAIAvailable ? 'opacity-50' : ''}`}
              onLoad={() => console.log('✅ Talia trigger image loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load Talia trigger image');
                console.log('Image src:', e.currentTarget.src);
                console.log('Current URL:', window.location.href);
                // Hide image and show fallback
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.fallback-avatar')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-avatar w-full h-full bg-purple-500 text-white flex items-center justify-center text-lg font-bold';
                  fallback.textContent = 'T';
                  parent.appendChild(fallback);
                }
              }}
            />
            
            {/* Pulse animation for available state */}
            {isAIAvailable && !isExpanded && (
              <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-pulse"></div>
            )}

            {/* Chat indicator */}
            {isAIAvailable && !isExpanded && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <MessageCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Chat Popup */}
      {isExpanded && isAIAvailable && (
        <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 h-[32rem] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src="/assets/Talia_headshot.png" 
                    alt="Talia AI Coach"
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Talia header image loaded successfully')}
                    onError={(e) => {
                      console.error('Failed to load Talia header image:', e);
                      console.log('Image src:', e.currentTarget.src);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{getHeaderText()}</h3>
                  <p className="text-xs opacity-90">{getContextDescription()}</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-6 h-6 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                        <img 
                          src="/assets/Talia_headshot.png" 
                          alt="Talia"
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('Talia chat image loaded successfully')}
                          onError={(e) => {
                            console.error('Failed to load Talia chat image:', e);
                            console.log('Image src:', e.currentTarget.src);
                          }}
                        />
                      </div>
                    )}
                    <div className={`rounded-lg p-3 shadow-sm border max-w-64 ${
                      message.role === 'user'
                        ? 'bg-purple-500 text-white rounded-tr-none ml-auto'
                        : 'bg-white text-gray-800 rounded-tl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className={`text-xs mt-1 block ${
                        message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        You
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                      <img 
                        src="/assets/Talia_headshot.png" 
                        alt="Talia"
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('Talia loading image loaded successfully')}
                        onError={(e) => {
                          console.error('Failed to load Talia loading image:', e);
                          console.log('Image src:', e.currentTarget.src);
                        }}
                      />
                    </div>
                    <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm border max-w-64">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {!isLoading && 'Send'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {context?.stepName ? `Discussing: ${context.stepName}` : 'Chat with Talia, your AI coach'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAITrigger;