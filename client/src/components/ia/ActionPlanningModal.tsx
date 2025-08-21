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

  // Handle AI chat response
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-purple-800">
                  From Inspiration to Action
                </DialogTitle>
                <p className="text-sm text-purple-600">
                  Transform your moments of inspiration into concrete next steps
                </p>
              </div>
            </div>
            <div className="ml-auto">
              <img 
                src="/assets/ADV_Rung4.png" 
                alt="Advanced Rung 4: Action Planning"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          {/* Three-Column Layout */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel: Interludes Review (40% width) */}
            <div className="w-2/5 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Your Inspiration Moments</h3>
                <p className="text-sm text-gray-600">Select which interlude to work with</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {categorizedInterludes.map((interlude) => (
                  <Card 
                    key={interlude.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedInterlude?.id === interlude.id 
                        ? `ring-2 ring-purple-500 ${getTypeColor(interlude.type)}` 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleInterludeSelect(interlude)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(interlude.type)}`}>
                              {interlude.type}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1">{interlude.title}</h4>
                          {interlude.response && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {interlude.response.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                        {selectedInterlude?.id === interlude.id && (
                          <CheckCircle2 className="w-5 h-5 text-purple-600 ml-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Center Panel: AI Conversation (35% width) */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">AI Action Partner</h3>
                <p className="text-sm text-gray-600">Work with Talia to develop action steps</p>
              </div>
              
              <div className="flex-1 flex flex-col">
                {selectedInterlude ? (
                  <div className="flex-1 flex flex-col">
                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatHistory.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* AI Chat Component */}
                    <div className="p-4 border-t border-gray-200">
                      <InlineChat
                        trainingId="IA_4_5"
                        systemPrompt={PROMPTS.IA_4_5}
                        seed={selectedInterlude.response || selectedInterlude.title}
                        onReply={handleChatResponse}
                        placeholder="Describe your inspiration moment..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center text-gray-500">
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select an interlude to start the conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Action Capture (25% width) */}
            <div className="w-1/4 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Next Steps</h3>
                <p className="text-sm text-gray-600">Capture and refine your actions</p>
              </div>
              
              <div className="flex-1 flex flex-col p-4 space-y-4">
                {selectedInterlude && (
                  <>
                    {/* Current Action Step */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Action Step
                      </label>
                      <Textarea
                        value={currentAction}
                        onChange={(e) => setCurrentAction(e.target.value)}
                        placeholder="Describe a concrete next step..."
                        rows={3}
                        className="text-sm"
                      />
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Timeframe
                        </label>
                        <select 
                          value={timeframe}
                          onChange={(e) => setTimeframe(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select timeframe...</option>
                          <option value="this week">This week</option>
                          <option value="next week">Next week</option>
                          <option value="this month">This month</option>
                          <option value="next month">Next month</option>
                          <option value="within 3 months">Within 3 months</option>
                        </select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveStep}
                          disabled={!currentAction.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          Save Step
                        </Button>
                        <Button
                          onClick={() => {
                            setCurrentAction('');
                            setTimeframe('');
                          }}
                          variant="outline"
                          className="text-sm"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Saved Actions List */}
                {actionSteps.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Saved Actions</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {actionSteps.map((step) => (
                        <div key={step.id} className="p-3 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-800">{step.description}</p>
                          {step.timeframe && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">{step.timeframe}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                {selectedInterlude && (
                  <Button
                    onClick={handleWorkWithAnother}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    Work with Another Interlude
                  </Button>
                )}
                <Button
                  onClick={handleComplete}
                  disabled={actionSteps.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
                >
                  I'm Done ({actionSteps.length} {actionSteps.length === 1 ? 'action' : 'actions'})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}