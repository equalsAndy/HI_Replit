import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, Settings, Lightbulb, Star, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

interface TaliaCoachProps {
  userId: number;
  workshopCompleted: boolean;
  currentStep?: string;
  conversationType: 'workshop_assistant' | 'post_workshop_coach' | 'team_prep';
  demoMode?: boolean;
  teamAccess?: boolean;
}

export default function TaliaCoach({ 
  userId, 
  workshopCompleted, 
  currentStep,
  conversationType,
  demoMode = false,
  teamAccess = true 
}: TaliaCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Different coaching personas and contexts
  const getCoachingContext = () => {
    if (conversationType === 'workshop_assistant') {
      return {
        persona: 'Workshop Assistant',
        description: 'Helpful guidance during your AST workshop',
        color: 'bg-blue-500',
        icon: <Lightbulb className="w-4 h-4" />,
        constraints: demoMode ? [] : ['Cannot write answers for you', 'Can provide guidance and clarification']
      };
    } else if (conversationType === 'post_workshop_coach') {
      return {
        persona: 'Talia - Your Growth Coach',
        description: 'Continued mentoring after your workshop',
        color: 'bg-purple-500',
        icon: <Star className="w-4 h-4" />,
        constraints: ['Personalized coaching', 'Growth planning', 'Strength development']
      };
    } else {
      return {
        persona: 'Team Workshop Advisor',
        description: teamAccess ? 'Preparing for your team workshop' : 'Learn about team workshop benefits',
        color: 'bg-green-500',
        icon: <Users className="w-4 h-4" />,
        constraints: teamAccess ? ['Team preparation', 'Collaboration guidance'] : ['Information only', 'Manager discussion tips']
      };
    }
  };

  const context = getCoachingContext();

  // Initialize conversation
  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeConversation = async () => {
    try {
      const response = await fetch('/api/coaching/conversation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          conversationType,
          context: currentStep,
          demoMode,
          teamAccess
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.conversationId);
        
        // Add welcome message
        const welcomeMessage = getWelcomeMessage();
        setMessages([{
          id: 'welcome',
          type: 'assistant',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  };

  const getWelcomeMessage = () => {
    if (conversationType === 'workshop_assistant') {
      return demoMode 
        ? "Hi! I'm your workshop assistant. I can help guide you through the AST workshop and in demo mode, I can even fill in example answers for you. What would you like help with?"
        : "Hi! I'm here to help guide you through your AST workshop. I can clarify concepts, explain exercises, and provide encouragement - but you'll write your own authentic responses. What can I help you with?";
    } else if (conversationType === 'post_workshop_coach') {
      return "Hello! I'm Talia, your personal growth coach. Congratulations on completing your AST workshop! I'm here to help you continue building on your strengths, developing your potential, and preparing for what's next. How are you feeling about your workshop experience?";
    } else {
      return teamAccess 
        ? "Hi! I'm here to help you prepare for your upcoming team workshop. Having completed your individual AST assessment, you're ready to explore how your strengths will contribute to team dynamics. What aspects of team collaboration are you most curious about?"
        : "Hi! I see you've completed your individual AST workshop - that's fantastic! While you don't currently have access to a team workshop, I can tell you about the powerful benefits of team collaboration using the AST methodology. Would you like to learn how this could benefit your team?";
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coaching/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationId,
          message: userMessage.content,
          context: {
            currentStep,
            conversationType,
            demoMode,
            teamAccess,
            workshopCompleted
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: data.messageId,
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          context: data.contextUsed
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const quickPrompts = getQuickPrompts();

  function getQuickPrompts() {
    if (conversationType === 'workshop_assistant') {
      return [
        "How do I interpret my Star Card results?",
        "What does my flow score mean?",
        "Can you explain the Five Strengths?",
        demoMode ? "Fill in an example reflection" : "I'm stuck on this reflection"
      ];
    } else if (conversationType === 'post_workshop_coach') {
      return [
        "Help me create a growth plan",
        "How can I use my strengths at work?",
        "What should I focus on developing?",
        "How do I maintain momentum?"
      ];
    } else {
      return teamAccess ? [
        "How do I prepare for the team workshop?",
        "What should I expect in team collaboration?",
        "How will my strengths help the team?",
        "What questions should I prepare?"
      ] : [
        "What are the benefits of a team workshop?",
        "How can I propose this to my manager?",
        "What would team AST sessions include?",
        "How much does a team workshop cost?"
      ];
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full w-14 h-14 shadow-lg ${context.color} hover:scale-105 transition-transform`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-40 flex flex-col">
          {/* Header */}
          <div className={`${context.color} text-white p-4 rounded-t-lg flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {context.icon}
              <div>
                <h3 className="font-semibold text-sm">{context.persona}</h3>
                <p className="text-xs opacity-90">{context.description}</p>
              </div>
            </div>
            {demoMode && (
              <Badge variant="secondary" className="text-xs bg-white/20">
                Demo Mode
              </Badge>
            )}
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {/* Quick Prompts */}
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center">Quick options:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 justify-start"
                        onClick={() => setInputValue(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !inputValue.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}