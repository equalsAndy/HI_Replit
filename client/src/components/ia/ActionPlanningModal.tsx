import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Clock, CheckCircle2 } from 'lucide-react';
import InlineChat from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

// TypeScript interfaces for IA-4-5 data structures
export interface Interlude {
  id: string;
  type: 'awe' | 'art' | 'movement' | 'stillness';
  title: string;
  description: string;
  prompt: string;
  response?: string;
  tag?: string;
  createdAt: Date;
}

export interface ActionStep {
  id: string;
  interludeId: string; // References source interlude
  description: string;
  timeframe?: string; // "this week", "next month", etc.
  createdAt: Date;
  completed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ActionPlanningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interludes: Interlude[];
  onCreateActionStep: (step: Omit<ActionStep, 'id' | 'createdAt'>) => void;
  onComplete: (actionSteps: ActionStep[]) => void;
}

export function ActionPlanningModal({
  open,
  onOpenChange,
  interludes,
  onCreateActionStep,
  onComplete,
}: ActionPlanningModalProps) {
  const [selectedInterlude, setSelectedInterlude] = React.useState<Interlude | null>(null);
  const [phase, setPhase] = React.useState<'selection' | 'exploration' | 'crystallization'>('selection');
  const [currentAction, setCurrentAction] = React.useState('');
  const [actionSteps, setActionSteps] = React.useState<ActionStep[]>([]);
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [timeframe, setTimeframe] = React.useState('');

  // Map IA-3-5 interludes to our format with type categorization
  const categorizedInterludes = React.useMemo(() => {
    return interludes.map(interlude => ({
      ...interlude,
      type: categorizeInterlude(interlude.id) as 'awe' | 'art' | 'movement' | 'stillness',
      createdAt: new Date()
    }));
  }, [interludes]);

  // Categorize interludes based on their ID/title from IA-3-5
  function categorizeInterlude(id: string): string {
    const categoryMap: Record<string, string> = {
      'nature': 'awe',
      'beauty': 'awe', 
      'art': 'art',
      'create': 'art',
      'vision': 'art',
      'journal': 'stillness',
      'play': 'movement',
      'learn': 'movement',
      'heroes': 'stillness'
    };
    return categoryMap[id] || 'awe';
  }

  // Extract action suggestions from AI response
  function extractActionSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const lines = text.split('\n').map(line => line.trim());
    
    for (const line of lines) {
      // Look for action-oriented sentences
      if (line.length > 20 && 
          (line.includes('could') || line.includes('might') || line.includes('try') || 
           line.includes('consider') || line.includes('start') || line.includes('begin'))) {
        suggestions.push(line.replace(/^[-•*]\s*/, '').trim());
      }
    }
    
    return suggestions.slice(0, 3); // Return up to 3 suggestions
  }

  // Color scheme for different interlude types
  const getTypeColor = (type: string) => {
    const colors = {
      awe: 'border-blue-300 bg-blue-50 text-blue-800',
      art: 'border-orange-300 bg-orange-50 text-orange-800', 
      movement: 'border-green-300 bg-green-50 text-green-800',
      stillness: 'border-purple-300 bg-purple-50 text-purple-800'
    };
    return colors[type as keyof typeof colors] || colors.awe;
  };

  // Handle interlude selection
  const handleInterludeSelect = (interlude: Interlude) => {
    setSelectedInterlude(interlude);
    setPhase('exploration');
    
    // Initialize AI conversation
    const greeting = `I see you've captured ${interludes.length} moments of inspiration. You selected "${interlude.title}" - that feels alive for you right now. Tell me more about this ${interlude.type} moment. What made it special? What stirred in you?`;
    
    setChatHistory([{
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: greeting,
      timestamp: new Date()
    }]);
  };

  // Handle user message
  const handleUserSend = (userMessage: string) => {
    const newMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  // Handle AI response
  const handleAIResponse = (response: string) => {
    const newMessage: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      role: 'assistant', 
      content: response,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, newMessage]);
    
    // Try to extract suggested action from AI response
    const actionSuggestions = extractActionSuggestions(response);
    if (actionSuggestions.length > 0 && !currentAction.trim()) {
      setCurrentAction(actionSuggestions[0]);
    }
  };

  // Handle AI chat response (legacy)
  const handleChatResponse = (response: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant', 
      content: response,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  // Save current action step
  const handleSaveStep = () => {
    if (!selectedInterlude || !currentAction.trim()) return;

    const newStep: ActionStep = {
      id: `step-${Date.now()}`,
      interludeId: selectedInterlude.id,
      description: currentAction.trim(),
      timeframe: timeframe || undefined,
      createdAt: new Date(),
      completed: false
    };

    setActionSteps(prev => [...prev, newStep]);
    onCreateActionStep({
      interludeId: selectedInterlude.id,
      description: currentAction.trim(),
      timeframe: timeframe || undefined,
      completed: false
    });

    // Clear current action for next iteration
    setCurrentAction('');
    setTimeframe('');
  };

  // Work with another interlude
  const handleWorkWithAnother = () => {
    setSelectedInterlude(null);
    setPhase('selection');
    setCurrentAction('');
    setTimeframe('');
    setChatHistory([]);
  };

  // Complete and close modal
  const handleComplete = () => {
    onComplete(actionSteps);
    onOpenChange(false);
  };

  // Reset modal state when closed
  React.useEffect(() => {
    if (!open) {
      setSelectedInterlude(null);
      setPhase('selection');
      setCurrentAction('');
      setTimeframe('');
      setChatHistory([]);
      setActionSteps([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-4 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-3 z-10">
          <img src="/assets/adv_rung4_split.png" alt="Rung 4" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Autoflow Mindful Prompts — Action Planning
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>

        {/* Left Column: AI Chat */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          <label className="font-medium text-gray-700 mb-1 text-sm">
            {selectedInterlude ? `Working with: ${selectedInterlude.title}` : 'Select an inspiration moment to begin'}
          </label>
          
          {selectedInterlude && (
            <div className="rounded-md bg-blue-50/60 border border-blue-100 px-3 py-2 text-xs text-gray-700 shadow-sm mb-4">
              <div>
                <strong>Inspiration:</strong> {selectedInterlude.response.length > 100 ? `${selectedInterlude.response.slice(0, 100)}...` : selectedInterlude.response}
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Bubbles */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3" style={{maxHeight: '400px'}}>
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === 'user'
                      ? 'max-w-[75%] ml-auto rounded-xl border bg-blue-50 px-3 py-2 text-sm'
                      : 'max-w-[75%] mr-auto rounded-xl border bg-white px-3 py-2 text-sm'
                  }
                >
                  <div className="whitespace-pre-line">{message.content}</div>
                </div>
              ))}
              
              {!selectedInterlude && (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select an inspiration moment to start working with AI...</p>
                  </div>
                </div>
              )}
            </div>

            {/* InlineChat for input */}
            {selectedInterlude && (
              <InlineChat
                trainingId="ia-4-5"
                systemPrompt={`${PROMPTS.IA_4_5}\n\nCONTEXT:\nInterlude: ${selectedInterlude.title}\nUser's Response: ${selectedInterlude.response}`}
                onReply={handleAIResponse}
                onUserSend={handleUserSend}
                hideHistory={true}
                className="border-0 p-0 bg-transparent"
                placeholder="Ask AI about turning this inspiration into action..."
              />
            )}
          </div>
        </div>

        {/* Right Column: Action Planning */}
        <div className="flex flex-col bg-white p-4 pt-16 min-h-0">
          <label className="font-medium text-gray-700 mb-1 text-sm">
            Action Planning
          </label>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Step 1: Select Inspiration */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm">Step 1: Select Inspiration</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {categorizedInterludes.map((interlude) => (
                  <button
                    key={interlude.id}
                    onClick={() => handleInterludeSelect(interlude)}
                    className={`w-full text-left p-2 rounded border text-xs transition-all ${
                      selectedInterlude?.id === interlude.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-800' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <div className="font-medium">{interlude.title}</div>
                    <div className="text-gray-600 truncate">
                      {interlude.response.substring(0, 60)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: AI-Generated Action */}
            {selectedInterlude && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 text-sm">Step 2: AI-Generated Action</h4>
                <p className="text-xs text-gray-600">
                  Work with AI to refine a concrete action step from your inspiration:
                </p>
                <Textarea
                  value={currentAction}
                  onChange={(e) => setCurrentAction(e.target.value)}
                  placeholder="AI will help you create an action step here..."
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>
            )}

            {/* Step 3: Timeframe */}
            {currentAction.trim() && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 text-sm">Step 3: Timeframe</h4>
                <input
                  type="text"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  placeholder="When will you do this? (e.g., 'this week', 'next month')"
                  className="w-full p-2 border border-gray-300 rounded-md text-xs"
                />
              </div>
            )}
          </div>
          
          {/* Complete Button */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <Button
              onClick={handleSaveStep}
              disabled={!currentAction.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Add Action Step
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}