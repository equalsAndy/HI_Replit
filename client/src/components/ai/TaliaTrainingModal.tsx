import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Brain,
  FileText,
  Save,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TaliaTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: 'reflection_talia' | 'report_talia';
  reflectionContext?: {
    currentStep: number;
    strengthName: string;
    reflectionQuestion: string;
    userReflection?: string;
  };
}

export default function TaliaTrainingModal({ 
  isOpen, 
  onClose, 
  persona,
  reflectionContext 
}: TaliaTrainingModalProps) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trainingTitle, setTrainingTitle] = useState('');
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [inputHeight, setInputHeight] = useState(80); // Default height for input textarea
  const [isResizingInput, setIsResizingInput] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeTrainingSession();
    }
  }, [isOpen, reflectionContext]);

  const initializeTrainingSession = () => {
    let initialMessage = '';
    let title = '';

    if (reflectionContext) {
      // Context-specific training
      title = `Training: ${reflectionContext.strengthName} Reflection`;
      initialMessage = `I want to train you on how to help users with ${reflectionContext.strengthName} strength reflections.

**Current Context:**
- Step: ${reflectionContext.currentStep}
- Strength: ${reflectionContext.strengthName}
- Question: "${reflectionContext.reflectionQuestion}"
${reflectionContext.userReflection ? `- User's current reflection: "${reflectionContext.userReflection}"` : ''}

Let's discuss how you should respond when users are working on this type of reflection. What behaviors should you exhibit?`;
    } else {
      // General training
      title = `General Training: ${persona === 'reflection_talia' ? 'Reflection' : 'Report'} Talia`;
      initialMessage = `Let's discuss general behaviors and coaching approaches for ${persona === 'reflection_talia' ? 'helping users with reflections' : 'generating personalized reports'}.

What specific behaviors or improvements would you like me to learn?`;
    }

    setTrainingTitle(title);
    
    const systemMessage: Message = {
      id: 'initial',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date()
    };

    setMessages([systemMessage]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build training context
      let systemPrompt = `You are participating in a training session for ${persona}. `;
      
      if (reflectionContext) {
        systemPrompt += `The context is helping users with ${reflectionContext.strengthName} strength reflections. `;
      }
      
      systemPrompt += `Respond as if you are Talia learning from this training session. Ask clarifying questions about specific behaviors, coaching approaches, or scenarios you should handle differently.`;

      const response = await fetch('/api/admin/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: inputValue,
          model: 'gpt-4o-mini',
          projectType: persona === 'reflection_talia' ? 'content-generation' : 'report-generation',
          persona: persona,
          systemPrompt: systemPrompt,
          includeContext: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Training chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
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

  // Handle input textarea resize
  const handleInputResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingInput(true);
    
    const startY = e.clientY;
    const startHeight = inputHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(40, Math.min(300, startHeight + deltaY)); // Min 40px, max 300px
      setInputHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizingInput(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [inputHeight]);

  const finishTrainingSession = () => {
    if (messages.length < 2) {
      toast({
        title: 'Training Session Too Short',
        description: 'Have a more substantial conversation before saving.',
        variant: 'destructive'
      });
      return;
    }

    const trainingContent = generateTrainingDocument();
    setDocumentContent(trainingContent);
    setShowDocumentEditor(true);
  };

  const generateTrainingDocument = (): string => {
    let content = `# ${trainingTitle}\n`;
    content += `**Date**: ${new Date().toLocaleDateString()}\n`;
    content += `**Persona**: ${persona}\n`;
    content += `**Type**: ${reflectionContext ? 'Context-Specific' : 'General'} Training\n`;
    content += `**Messages**: ${messages.length}\n\n`;
    
    if (reflectionContext) {
      content += `## Training Context\n`;
      content += `- **Strength**: ${reflectionContext.strengthName}\n`;
      content += `- **Step**: ${reflectionContext.currentStep}\n`;
      content += `- **Question**: ${reflectionContext.reflectionQuestion}\n`;
      if (reflectionContext.userReflection) {
        content += `- **User Reflection**: ${reflectionContext.userReflection}\n`;
      }
      content += `\n`;
    }
    
    content += `## Training Conversation\n\n`;
    
    messages.forEach((msg, index) => {
      content += `### ${msg.role === 'user' ? 'Trainer' : 'Talia'} (${msg.timestamp.toLocaleTimeString()})\n`;
      content += `${msg.content}\n\n`;
    });
    
    content += `## Key Behaviors to Learn\n`;
    content += `*[Based on this conversation, add specific behavioral guidelines for Talia]*\n\n`;
    
    content += `## Implementation Notes\n`;
    content += `*[Specific coaching techniques or response patterns Talia should adopt]*\n\n`;
    
    return content;
  };

  const uploadTrainingDocument = async () => {
    if (!documentContent.trim()) return;

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/ai/upload-training-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          personaId: persona,
          title: trainingTitle,
          content: documentContent,
          category: reflectionContext ? 'context_specific_training' : 'general_training',
          context: reflectionContext
        })
      });

      if (response.ok) {
        toast({
          title: 'Training Document Uploaded',
          description: `Training uploaded to OpenAI for ${persona}`
        });
        onClose();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload training document:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload training document',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">{trainingTitle}</h2>
            <Badge variant="outline">
              {persona === 'reflection_talia' ? 'Reflection Talia' : 'Report Talia'}
            </Badge>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!showDocumentEditor ? (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-green-600 text-white'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Discuss behaviors and coaching approaches with Talia..."
                    className={`w-full p-3 border rounded-md resize-none ${isResizingInput ? 'select-none' : ''}`}
                    style={{ height: `${inputHeight}px` }}
                    disabled={isLoading}
                  />
                  {/* Resize Handle */}
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
                    onMouseDown={handleInputResize}
                    title="Drag to resize input area"
                  >
                    <div className="absolute bottom-1 right-1 w-0 h-0 border-l-8 border-b-8 border-l-transparent border-b-gray-400"></div>
                    <div className="absolute bottom-2 right-2 w-0 h-0 border-l-4 border-b-4 border-l-transparent border-b-gray-400"></div>
                  </div>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between">
                <Button onClick={onClose} variant="outline" size="sm">
                  Cancel Training
                </Button>
                <Button 
                  onClick={finishTrainingSession} 
                  disabled={messages.length < 2}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Finish & Save Training
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Document Editor */
          <div className="flex-1 flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Training Document Editor
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={uploadTrainingDocument}
                  disabled={isLoading}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload to OpenAI
                </Button>
                <Button
                  onClick={() => setShowDocumentEditor(false)}
                  variant="outline"
                  size="sm"
                >
                  Back to Chat
                </Button>
              </div>
            </div>
            <textarea
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              className="flex-1 p-3 border rounded-md font-mono text-sm"
              placeholder="Edit the training document before uploading..."
            />
            <p className="text-xs text-gray-600 mt-2">
              This document will be uploaded to OpenAI and used to train {persona}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}