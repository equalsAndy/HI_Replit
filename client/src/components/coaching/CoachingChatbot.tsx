/**
 * AST Coaching Chatbot Component
 * =============================
 * React component for AI-powered coaching conversations
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import './CoachingChatbot.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

interface Persona {
  id: string;
  name: string;
  description: string;
}

interface CoachingChatbotProps {
  userId: number;
  workshopStep?: string;
  defaultPersona?: string;
  className?: string;
}

export const CoachingChatbot: React.FC<CoachingChatbotProps> = ({
  userId,
  workshopStep,
  defaultPersona = 'talia_coach',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentPersona, setCurrentPersona] = useState(defaultPersona);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load personas on mount
  useEffect(() => {
    loadPersonas();
  }, []);

  // Initialize conversation when persona changes
  useEffect(() => {
    if (currentPersona && userId) {
      initializeConversation();
    }
  }, [currentPersona, userId, workshopStep]);

  const loadPersonas = async () => {
    try {
      const response = await fetch('/api/coaching/chat/personas');
      const data = await response.json();
      if (data.success) {
        setPersonas(data.personas);
      }
    } catch (error) {
      console.error('Error loading personas:', error);
    }
  };

  const initializeConversation = async () => {
    try {
      const response = await fetch('/api/coaching/chat/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          personaType: currentPersona,
          workshopStep
        }),
      });

      const data = await response.json();
      if (data.success) {
        setConversationId(data.conversation.id);
        
        // Add welcome message
        const persona = personas.find(p => p.id === currentPersona);
        const welcomeMessage: Message = {
          id: 'welcome',
          content: `Hi! I'm ${persona?.name || 'your coach'}. ${persona?.description || 'I\'m here to help you on your AST journey.'}${workshopStep ? ` I see you're on ${workshopStep}.` : ''} How can I assist you today?`,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages([welcomeMessage]);
        setError(null);
      } else {
        setError('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      setError('Connection error');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !conversationId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coaching/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: userMessage.content,
          personaType: currentPersona,
          workshopStep,
          userProfile: { workshop_progress: workshopStep }
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

  const currentPersonaData = personas.find(p => p.id === currentPersona);

  return (
    <div className={`coaching-chatbot ${className}`}>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        aria-label="Open coaching chat"
      >
        <MessageCircle size={24} />
        {!isOpen && <Sparkles size={16} className="sparkle" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="persona-info">
              <Bot size={20} />
              <div>
                <h3>{currentPersonaData?.name || 'Coach'}</h3>
                <p>{currentPersonaData?.description}</p>
              </div>
            </div>
            
            {personas.length > 1 && (
              <select
                value={currentPersona}
                onChange={(e) => setCurrentPersona(e.target.value)}
                className="persona-selector"
              >
                {personas.map(persona => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Messages */}
          <div className="messages-container">
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
                <button onClick={initializeConversation}>Retry</button>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender}`}
              >
                <div className="message-icon">
                  {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="message-content">
                  <p>{message.content}</p>
                  {message.metadata?.fallback && (
                    <small className="fallback-notice">
                      ⚠️ AI temporarily unavailable - fallback response
                    </small>
                  )}
                  <time className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant loading">
                <div className="message-icon">
                  <Loader2 size={16} className="spin" />
                </div>
                <div className="message-content">
                  <p>Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${currentPersonaData?.name || 'your coach'} anything...`}
              disabled={isLoading || !conversationId}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !conversationId}
              className="send-button"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
