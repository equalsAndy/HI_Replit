import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  MessageSquare, 
  Brain,
  FileText,
  Save,
  Upload,
  Trash2,
  Edit,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona?: string;
  model?: string;
}

interface TrainingSession {
  id: string;
  title: string;
  persona: string;
  messages: Message[];
  isGeneral: boolean;
  context?: string;
  status: 'draft' | 'saved' | 'uploaded';
  createdAt: Date;
}

interface Persona {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
}

export default function AdminChat() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>('reflection_talia');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [models, setModels] = useState<any[]>([]);
  
  // Training document editing
  const [editingDocument, setEditingDocument] = useState<string>('');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);

  // Load personas and models on mount
  useEffect(() => {
    loadPersonas();
    loadModels();
    loadTrainingSessions();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPersonas = async () => {
    try {
      const response = await fetch('/api/admin/ai/persona-sync-configs', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || []);
      }
    } catch (error) {
      console.error('Failed to load personas:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch('/api/admin/chat/models', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadTrainingSessions = async () => {
    // This would load from a training sessions API
    // For now, we'll use local state
    setTrainingSessions([]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      persona: selectedPersona,
      model: selectedModel
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: inputValue,
          model: selectedModel,
          projectType: selectedPersona === 'reflection_talia' ? 'content-generation' : 'report-generation',
          persona: selectedPersona,
          conversationId: conversationId || undefined,
          includeContext: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          persona: selectedPersona,
          model: selectedModel
        };

        setMessages(prev => [...prev, assistantMessage]);
        setConversationId(data.conversationId);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Chat error:', error);
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

  const startTrainingSession = () => {
    const newSession: TrainingSession = {
      id: Date.now().toString(),
      title: `Training Session ${new Date().toLocaleDateString()}`,
      persona: selectedPersona,
      messages: [...messages],
      isGeneral: true,
      status: 'draft',
      createdAt: new Date()
    };

    setCurrentSession(newSession);
    setTrainingSessions(prev => [...prev, newSession]);
    toast({
      title: 'Training Session Started',
      description: 'Current conversation saved as training session'
    });
  };

  const saveTrainingSession = async () => {
    if (!currentSession) return;

    try {
      // Update the session with current messages
      const updatedSession = {
        ...currentSession,
        messages: [...messages],
        status: 'saved' as const
      };

      // Generate training document content
      const trainingContent = generateTrainingDocument(updatedSession);
      
      setCurrentSession(updatedSession);
      setDocumentContent(trainingContent);
      setEditingDocument(updatedSession.id);
      setShowDocumentEditor(true);

      toast({
        title: 'Training Session Saved',
        description: 'Review and edit the training document before uploading'
      });
    } catch (error) {
      console.error('Failed to save training session:', error);
      toast({
        title: 'Error',
        description: 'Failed to save training session',
        variant: 'destructive'
      });
    }
  };

  const generateTrainingDocument = (session: TrainingSession): string => {
    const timestamp = session.createdAt.toISOString();
    const messageCount = session.messages.length;
    
    let content = `# Training Session - ${session.title}\n`;
    content += `**Date**: ${session.createdAt.toLocaleDateString()}\n`;
    content += `**Persona**: ${session.persona}\n`;
    content += `**Type**: ${session.isGeneral ? 'General' : 'Context-Specific'}\n`;
    content += `**Messages**: ${messageCount}\n\n`;
    
    if (session.context) {
      content += `## Context\n${session.context}\n\n`;
    }
    
    content += `## Conversation\n\n`;
    
    session.messages.forEach((msg, index) => {
      content += `### ${msg.role === 'user' ? 'Trainer' : 'Talia'} (${msg.timestamp.toLocaleTimeString()})\n`;
      content += `${msg.content}\n\n`;
    });
    
    content += `## Training Guidelines\n`;
    content += `*[Add specific behavioral guidelines based on this conversation]*\n\n`;
    
    content += `## Desired Behaviors\n`;
    content += `*[Specify the exact behaviors Talia should learn from this session]*\n\n`;
    
    return content;
  };

  const uploadTrainingDocument = async () => {
    if (!editingDocument || !documentContent.trim()) return;

    try {
      setIsLoading(true);
      
      // Create a file and upload to OpenAI
      const response = await fetch('/api/admin/ai/upload-training-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          personaId: selectedPersona,
          title: `Training Session ${editingDocument}`,
          content: documentContent,
          category: 'training_session',
          isGeneral: currentSession?.isGeneral || true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update session status
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            status: 'uploaded' as const
          };
          setCurrentSession(updatedSession);
        }

        setShowDocumentEditor(false);
        toast({
          title: 'Training Document Uploaded',
          description: `Document uploaded to OpenAI for ${selectedPersona}`
        });
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

  const clearConversation = () => {
    setMessages([]);
    setConversationId('');
    setCurrentSession(null);
  };

  const runABTest = async () => {
    if (messages.length === 0) {
      toast({
        title: 'No Messages',
        description: 'Start a conversation first to run A/B tests',
        variant: 'destructive'
      });
      return;
    }

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) return;

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/chat/ab-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt: lastUserMessage.content,
          modelA: 'gpt-4o-mini',
          modelB: 'gpt-4',
          projectType: selectedPersona === 'reflection_talia' ? 'content-generation' : 'report-generation'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add both responses to the conversation
        const responseA: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `**GPT-4o-mini**: ${data.test.responseA}`,
          timestamp: new Date(),
          persona: selectedPersona,
          model: 'gpt-4o-mini'
        };

        const responseB: Message = {
          id: (Date.now() + 3).toString(),
          role: 'assistant',
          content: `**GPT-4**: ${data.test.responseB}`,
          timestamp: new Date(),
          persona: selectedPersona,
          model: 'gpt-4'
        };

        setMessages(prev => [...prev, responseA, responseB]);
        
        toast({
          title: 'A/B Test Complete',
          description: 'Compare responses from both models'
        });
      }
    } catch (error) {
      console.error('A/B test failed:', error);
      toast({
        title: 'A/B Test Error',
        description: 'Failed to run A/B test',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Admin Chat Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Persona Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Persona</label>
              <select 
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {personas.map(persona => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button
                  onClick={startTrainingSession}
                  disabled={messages.length === 0}
                  size="sm"
                  variant="outline"
                >
                  <Brain className="h-4 w-4 mr-1" />
                  Train
                </Button>
                <Button
                  onClick={runABTest}
                  disabled={messages.length === 0 || isLoading}
                  size="sm"
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  A/B Test
                </Button>
              </div>
            </div>

            {/* Session Controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Session</label>
              <div className="flex gap-2">
                {currentSession && (
                  <Button
                    onClick={saveTrainingSession}
                    size="sm"
                    variant="outline"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
                <Button
                  onClick={clearConversation}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Session Status */}
          {currentSession && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Training Session Active</span>
                  <Badge variant={currentSession.status === 'uploaded' ? 'default' : 'secondary'}>
                    {currentSession.status}
                  </Badge>
                </div>
                <span className="text-xs text-gray-600">
                  {currentSession.messages.length} messages
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversation</span>
            {conversationId && (
              <Badge variant="outline" className="text-xs">
                ID: {conversationId.slice(-8)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Start a conversation to train your AI personas</p>
              </div>
            ) : (
              messages.map((message) => (
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
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.model && (
                          <Badge variant="outline" className="text-xs">
                            {message.model}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your training message..."
              className="flex-1 p-3 border rounded-md resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Document Editor */}
      {showDocumentEditor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Training Document Editor
              </span>
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
                  Cancel
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              className="w-full h-64 p-3 border rounded-md font-mono text-sm"
              placeholder="Edit the training document before uploading..."
            />
            <p className="text-xs text-gray-600 mt-2">
              This document will be uploaded to OpenAI and used to train {selectedPersona}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Training Sessions History */}
      {trainingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training Sessions History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trainingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <div className="font-medium">{session.title}</div>
                    <div className="text-sm text-gray-600">
                      {session.persona} • {session.messages.length} messages • {session.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.status === 'uploaded' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    <Button
                      onClick={() => {
                        setCurrentSession(session);
                        setMessages(session.messages);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}