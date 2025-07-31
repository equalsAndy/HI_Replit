import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, HelpCircle, Send, Maximize2, Minimize2 } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { isFeatureEnabled } from '@/utils/featureFlags';
import { useReportTaliaContextSafe } from '../../contexts/ReportTaliaContext';

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
  const [isMaximized, setIsMaximized] = useState(false);
  const [modalSize, setModalSize] = useState({ width: 450, height: 550 });
  const [isResizing, setIsResizing] = useState(false);
  const { shouldShowDemoButtons, isTestUser } = useTestUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  
  // Get Report Talia context (null if not in admin area)
  const reportTaliaContext = useReportTaliaContextSafe();

  // Check AI coaching status from admin console and step-specific reflection area status
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

  // Check if the current step should have AI enabled based on reflection area configuration
  const [stepReflectionEnabled, setStepReflectionEnabled] = useState<boolean>(false);
  const [checkingStepStatus, setCheckingStepStatus] = useState(true);

  useEffect(() => {
    const checkStepReflectionStatus = async () => {
      if (!currentStep || !workshopType) {
        setStepReflectionEnabled(false);
        setCheckingStepStatus(false);
        return;
      }

      try {
        // Map current step to reflection area ID format
        const stepId = `step_${currentStep.replace('-', '_')}`;
        const response = await fetch(`/api/admin/ai/reflection-areas/${stepId}/status`);
        
        if (response.ok) {
          const data = await response.json();
          setStepReflectionEnabled(data.area?.enabled || false);
          console.log(`🔍 Step ${currentStep} reflection area status:`, data.area?.enabled);
        } else {
          // If area not found, default to disabled for safety
          setStepReflectionEnabled(false);
          console.log(`⚠️ No reflection area config found for step ${currentStep}, defaulting to disabled`);
        }
      } catch (error) {
        console.error('Failed to check step reflection status:', error);
        setStepReflectionEnabled(false);
      } finally {
        setCheckingStepStatus(false);
      }
    };

    checkStepReflectionStatus();
  }, [currentStep, workshopType]);

  // Check if reflection modal is enabled
  const reflectionModalEnabled = isFeatureEnabled('reflectionModal');

  // Determine if user has access to AI features (test users only)
  const hasAIAccess = shouldShowDemoButtons && reflectionModalEnabled;
  
  // Show button to test users or admin users in Report Talia context
  const shouldShowButton = hasAIAccess || (reportTaliaContext?.isAdminContext);
  
  // Determine if AI is available for this specific context
  // For admin mode: just need a selected user (admin access is implicit)
  // For workshop mode: need user access, AI coaching enabled by admin, step reflection area enabled, and context aiEnabled
  const isAdminMode = reportTaliaContext?.isAdminContext && reportTaliaContext?.selectedUserId;
  const isAIAvailable = isAdminMode 
    ? !!reportTaliaContext?.selectedUserId  // Admin mode: just need selected user
    : hasAIAccess && aiEnabled && aiCoachingEnabled && stepReflectionEnabled && !checkingStepStatus;  // Workshop mode requirements

  // Track previous context to detect step changes
  const [previousContext, setPreviousContext] = useState<string>('');

  // Initialize with welcome message when AI is available or context changes
  useEffect(() => {
    if (isAIAvailable) {
      const currentContextKey = `${context?.stepName || ''}-${context?.strengthLabel || ''}-${context?.questionText || ''}`;
      
      // Check if user moved to a completely different reflection step
      const hasStepChanged = previousContext && previousContext !== currentContextKey && 
        (context?.stepName !== previousContext.split('-')[0] || 
         context?.strengthLabel !== previousContext.split('-')[1]);

      if (hasStepChanged) {
        console.log('🔄 Step change detected, clearing conversation UI but preserving user learning');
        
        // Trigger conversation analysis for user learning before clearing
        if (messages.length > 1) { // Only if there was actual conversation
          try {
            fetch('/api/coaching/conversation-end', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                messages: messages,
                context: {
                  stepName: previousContext.split('-')[0],
                  strengthLabel: previousContext.split('-')[1],
                  questionText: previousContext.split('-')[2]
                }
              })
            }).catch(error => console.warn('⚠️ Failed to analyze conversation for learning:', error));
          } catch (error) {
            console.warn('⚠️ Error triggering conversation analysis:', error);
          }
        }
        
        // Clear the conversation UI for new reflection
        setMessages([]);
      }

      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      };
      
      // Always update the first message to be the current welcome message
      if (messages.length === 0) {
        setMessages([welcomeMessage]);
      } else if (!hasStepChanged) {
        // Only replace welcome message if we didn't just clear the conversation
        if (messages[0]?.content?.startsWith("Hi! I'm Talia")) {
          setMessages([welcomeMessage, ...messages.slice(1)]);
        }
      } else {
        // New step, start fresh with welcome message
        setMessages([welcomeMessage]);
      }

      setPreviousContext(currentContextKey);
    }
  }, [isAIAvailable, context?.stepName, context?.strengthLabel, context?.questionText, previousContext]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = modalSize.width;
    const startHeight = modalSize.height;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(300, Math.min(1000, startWidth - (e.clientX - startX)));
      const newHeight = Math.max(300, Math.min(window.innerHeight - 100, startHeight - (e.clientY - startY)));
      
      setModalSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [modalSize]);

  // Handle maximize/minimize
  const handleMaximize = () => {
    if (isMaximized) {
      setModalSize({ width: 450, height: 550 });
      setIsMaximized(false);
    } else {
      setModalSize({ 
        width: Math.min(800, window.innerWidth - 100), 
        height: Math.min(window.innerHeight - 150, 800) 
      });
      setIsMaximized(true);
    }
  };

  // Debug all conditions for AI Talia visibility (enable only when debugging)
  // console.log('🤖 AI Talia Debug:', {
  //   shouldShowDemoButtons,
  //   isTestUser,
  //   reflectionModalEnabled,
  //   aiEnabled,
  //   aiCoachingEnabled,
  //   checkingAIStatus,
  //   hasAIAccess,
  //   shouldShowButton,
  //   isAIAvailable,
  //   currentStep,
  //   context,
  //   reportTaliaContext: reportTaliaContext ? {
  //     isAdminContext: reportTaliaContext.isAdminContext,
  //     selectedUserId: reportTaliaContext.selectedUserId
  //   } : null
  // });

  // Only show to test users (but may be disabled based on context)
  if (!shouldShowButton) {
    console.log('🤖 FloatingAITrigger: Not rendering - not a test user');
    return null;
  }

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
      // Determine persona and context based on admin mode
      const isAdminMode = reportTaliaContext?.isAdminContext && reportTaliaContext?.selectedUserId;
      const persona = isAdminMode ? 'star_report' : 'talia_coach';
      
      // Build context for the request
      const requestContext = isAdminMode ? {
        // Admin context - Report Talia mode
        reportContext: 'admin_chat',
        selectedUserId: reportTaliaContext?.selectedUserId,
        selectedUserName: reportTaliaContext?.selectedUser?.name,
        adminMode: true
      } : {
        // Regular context - Workshop Talia mode
        stepName: context?.stepName,
        strengthLabel: context?.strengthLabel,
        questionText: context?.questionText,
        currentStep,
        workshopType
      };

      console.log('🤖 Sending chat message:', {
        message: userMessage.content,
        context: requestContext,
        persona: persona,
        isAdminMode
      });

      const response = await fetch('/api/coaching/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          message: userMessage.content,
          context: requestContext,
          persona: persona
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
    // Check if we're in admin mode with Report Talia
    const isAdminMode = reportTaliaContext?.isAdminContext && reportTaliaContext?.selectedUserId;
    if (isAdminMode) {
      const userName = reportTaliaContext?.selectedUser?.name || 'Selected User';
      return `Report Talia • ${userName}`;
    }
    
    // Regular workshop mode
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
    // Check if we're in admin mode with Report Talia
    const isAdminMode = reportTaliaContext?.isAdminContext && reportTaliaContext?.selectedUserId;
    if (isAdminMode) {
      return 'Report generation and analysis chat';
    }
    
    // Regular workshop mode
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
    // Check if we're in admin mode with Report Talia
    const isAdminMode = reportTaliaContext?.isAdminContext && reportTaliaContext?.selectedUserId;
    if (isAdminMode) {
      const userName = reportTaliaContext?.selectedUser?.name || 'the selected user';
      return `Hi! I'm Report Talia, your expert AI coach for comprehensive development reports.

I have access to ${userName}'s complete AST workshop data and can help you with:
• Analysis of their strengths and assessment results
• Insights into their growth patterns and development areas
• Professional development recommendations
• Report writing and coaching guidance

You can also type "TRAIN" to help me improve my coaching abilities. How can I assist you with ${userName}'s development analysis?`;
    }
    
    // Regular workshop mode
    if (context?.questionText) {
      return `Hi! I'm Talia, here to help with your current reflection: "${context.questionText}"

Your task is to write 2-3 sentences about this. What specific situation comes to mind when you think about this question?`;
    }
    if (context?.strengthLabel) {
      return `Hi! I'm Talia, here to help with your ${context.strengthLabel} strength reflection. Your task is to write 2-3 sentences. Can you think of a specific example where you used this strength?`;
    }
    if (context?.stepName) {
      return `Hi! I'm Talia, here to help with your ${context.stepName} reflection. Your task is to write 2-3 sentences. How can I help you think through this reflection?`;
    }
    return `Hi! I'm Talia, here to help with your reflection. Your task is to write 2-3 sentences. How can I help you think through this?`;
  };

  // Get disabled message based on context (only show if user has access but feature is disabled for this context)
  const getDisabledMessage = () => {
    if (!aiCoachingEnabled) {
      return "Talia is disabled by admin";
    }
    if (!aiEnabled) {
      return "Talia isn't available in this area";
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
                : 'border-gray-300 cursor-not-allowed grayscale opacity-20 hover:opacity-30'
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
        <div 
          className={`fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300 ${isResizing ? 'select-none' : ''}`}
          style={{
            width: `${modalSize.width}px`,
            height: `${modalSize.height}px`,
            cursor: isResizing ? 'nw-resize' : 'default'
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full h-full flex flex-col overflow-hidden relative group">
            {/* Resize Handle */}
            <div
              ref={resizeRef}
              className="absolute -left-1 -top-1 w-5 h-5 cursor-nw-resize opacity-30 group-hover:opacity-100 transition-opacity duration-200 bg-blue-500 rounded-tl-lg flex items-center justify-center hover:bg-blue-600"
              onMouseDown={handleMouseDown}
              title="Drag to resize chat window"
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            
            {/* Bottom-right resize indicator */}
            <div className="absolute bottom-1 right-1 w-3 h-3 opacity-20 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none">
              <div className="w-full h-full border-r-2 border-b-2 border-gray-400"></div>
              <div className="absolute -top-1 -left-1 w-full h-full border-r-2 border-b-2 border-gray-400"></div>
            </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMaximize}
                  className="w-6 h-6 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
                  title={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-6 h-6 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                    <div className={`rounded-lg p-3 shadow-sm border ${
                      message.role === 'user'
                        ? 'bg-purple-500 text-white rounded-tr-none ml-auto max-w-[75%]'
                        : 'bg-white text-gray-800 rounded-tl-none max-w-[80%]'
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
                    <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm border max-w-[80%]">
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