import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

interface IAChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepId: string;
  contextData: Record<string, any>;
  prompt?: string;
  onResponseReceived?: (response: string) => void;
  assistantVariant?: 'hq' | 'fast';
}

export const IAChatModal: React.FC<IAChatModalProps> = ({
  isOpen,
  onClose,
  stepId,
  contextData,
  prompt,
  onResponseReceived,
  assistantVariant
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [serverStarter, setServerStarter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize conversation when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeConversation();
    } else {
      // Clear messages when modal closes
      setMessages([]);
      setConversationId(null);
      setError(null);
    }
  }, [isOpen, stepId]);

  // Prefill prompt (do not auto-send) when conversation starts
  useEffect(() => {
    if (conversationId && messages.length === 1) {
      const seed = serverStarter || deriveSeedPrompt(stepId, contextData, prompt);
      if (seed) setInputValue(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Try to build a helpful seed prompt from step/context
  const deriveSeedPrompt = (
    stepId: string,
    ctx: Record<string, any>,
    provided?: string
  ): string | undefined => {
    if (provided && provided.trim()) return provided;
    if (stepId === 'ia-4-2') {
      const sentence = (ctx?.mindfulPromptSentence || ctx?.challenge || '').trim();
      if (sentence) {
        return `Here is a mindful prompt based on my current challenge: "${sentence}"\nWhat's one way to reframe this thought or response?`;
      }
      return `What's one way to reframe this thought or response?`;
    }
    // IA-4-3 guidance: Use prior visualization sentence
    if (stepId === 'ia-4-3') {
      const candidates: (string | undefined)[] = [
        ctx?.visualizationSentence,
        ctx?.frameSentence,
        ctx?.summary,
        ctx?.step1Summary,
        ctx?.previousText,
      ];
      const sentence = candidates.find(v => typeof v === 'string' && v.trim().length > 0)?.trim();
      if (sentence) {
        return `This is a visualization I created earlier: "${sentence}"\nWhat's one possibility I haven't considered that would expand this pattern or move it to the next level?`;
      }
      // Fallback generic
      return `What's one possibility I haven't considered that would expand this pattern or move it to the next level?`;
    }
    return provided;
  };

  const initializeConversation = async () => {
    try {
      const response = await fetch('/api/ia/chat/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepId,
          contextData,
          workshopType: 'ia'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setConversationId(data.conversation.id);
        if (data.starterPrompt && typeof data.starterPrompt === 'string') {
          setServerStarter(data.starterPrompt);
          setInputValue(data.starterPrompt);
        }
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: 'welcome',
          content: `Welcome. You're working on ${getStepName(stepId)}. I can use your prior work as context and help you explore next steps. What would you like to dive into?`,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages([welcomeMessage]);
        setError(null);
      } else {
        setError('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error initializing IA chat:', error);
      setError('Connection error');
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || !conversationId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ia/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: text,
          stepId,
          contextData,
          workshopType: 'ia',
          assistantVariant: assistantVariant || (localStorage.getItem('ia_chat_assistant') as 'hq' | 'fast' | null) || 'hq'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: Date.now().toString() + '_ai',
          content: data.response.content,
          sender: 'assistant',
          timestamp: new Date(),
          metadata: data.response.metadata,
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // If this was the initial prompt, call the callback
        if (onResponseReceived && messageText === prompt) {
          onResponseReceived(data.response.content);
        }
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStepName = (stepId: string): string => {
    const stepNames: Record<string, string> = {
      'ia-4-2': 'Autoflow Mindful Prompts',
      'ia-4-3': 'Visualization Stretch',
      'ia-4-4': 'Higher Purpose Uplift',
      'ia-4-5': 'Inspiration Support'
    };
    return stepNames[stepId] || stepId;
  };

  const handleCopyLastResponse = () => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.sender === 'assistant');
    if (lastAssistantMessage && onResponseReceived) {
      onResponseReceived(lastAssistantMessage.content);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[760px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">IA Assistant</h3>
              <p className="text-sm text-gray-500">{getStepName(stepId)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
              <span>⚠️ {error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={initializeConversation}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                Retry
              </Button>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.metadata?.fallback && (
                  <p className="text-xs mt-2 opacity-75">
                    ⚠️ AI temporarily unavailable - fallback response
                  </p>
                )}
                <p className="text-xs mt-2 opacity-75">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
              </div>
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                <p>Thinking...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Action Buttons removed per spec (no Use Last Response) */}

        {/* Input */}
        <div className="p-5 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">
            Use the prompt below or edit it to make it better, then press Enter to send.
          </div>
          <div className="flex gap-3 items-start">
            <textarea
              ref={inputRef as any}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                // Send on Enter (unless Shift held)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type or edit the prompt, then press Enter (Shift+Enter for newline)"
              disabled={isLoading || !conversationId}
              rows={4}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[96px]"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading || !conversationId}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 h-[44px] mt-1"
              title="Send (Enter)"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
