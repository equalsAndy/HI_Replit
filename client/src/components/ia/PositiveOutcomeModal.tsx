import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Lightbulb, Target, Sparkles } from 'lucide-react';
import InlineChat from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

// TypeScript interfaces for IA-4-4 data structures
export interface InitialOutcome {
  id: string;
  description: string;
  createdAt: Date;
  userId: string;
  stepId: string;
}

export interface ExpandedVision {
  id: string;
  initialOutcomeId: string;
  vividDescription: string;
  aspects: string[]; // e.g., ["emotional", "visual", "impact"]
  createdAt: Date;
  userId: string;
  stepId: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId: string;
  stepId: string;
}

export interface PositiveOutcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialOutcome?: string;
  onCreateVision: (vision: Omit<ExpandedVision, 'id' | 'createdAt' | 'userId'>) => void;
  onComplete: (expandedVisions: ExpandedVision[]) => void;
}

export function PositiveOutcomeModal({
  open,
  onOpenChange,
  initialOutcome = '',
  onCreateVision,
  onComplete,
}: PositiveOutcomeModalProps) {
  const [phase, setPhase] = React.useState<'setup' | 'expansion' | 'crystallization'>('setup');
  const [outcomeDescription, setOutcomeDescription] = React.useState(initialOutcome);
  const [currentVision, setCurrentVision] = React.useState('');
  const [expandedVisions, setExpandedVisions] = React.useState<ExpandedVision[]>([]);
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [selectedAspects, setSelectedAspects] = React.useState<string[]>([]);

  // Example prompts for outcome input
  const examplePrompts = [
    "Describe a positive outcome you're hoping for...",
    "What would success look like in this situation?",
    "Paint a picture of your ideal result...",
    "How would you know things went well?",
  ];

  // Aspect categories for vision enhancement
  const visionAspects = [
    { key: 'emotional', label: 'How it feels', color: 'border-yellow-300 bg-yellow-50 text-yellow-800' },
    { key: 'visual', label: 'What you see', color: 'border-blue-300 bg-blue-50 text-blue-800' },
    { key: 'impact', label: 'The impact', color: 'border-green-300 bg-green-50 text-green-800' },
    { key: 'sensory', label: 'What you experience', color: 'border-purple-300 bg-purple-50 text-purple-800' }
  ];

  // Initialize conversation when outcome is provided
  React.useEffect(() => {
    if (open && outcomeDescription.trim() && phase === 'setup') {
      const greeting = "What positive outcome are you hoping for? I can help make this feel more real and inspiring. What aspect would you like to explore - how it would feel, what it would look like, or the impact it would have?";
      
      setChatHistory([{
        id: `msg-${Date.now()}`,
        sessionId: 'ia-4-4-session',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        userId: 'current-user',
        stepId: 'ia-4-4'
      }]);
      setPhase('expansion');
    }
  }, [open, outcomeDescription, phase]);

  // Handle AI chat response
  const handleChatResponse = (response: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: 'ia-4-4-session',
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      userId: 'current-user',
      stepId: 'ia-4-4'
    };
    setChatHistory(prev => [...prev, newMessage]);

    // Auto-extract vision from AI response if it seems like an enhanced description
    if (response.length > 100 && (response.includes('see') || response.includes('feel') || response.includes('Picture'))) {
      setCurrentVision(response);
      setPhase('crystallization');
    }
  };

  // Handle user message
  const handleUserMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: 'ia-4-4-session',
      role: 'user',
      content: message,
      timestamp: new Date(),
      userId: 'current-user',
      stepId: 'ia-4-4'
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  // Save current vision
  const handleSaveVision = () => {
    if (!currentVision.trim()) return;

    const newVision: ExpandedVision = {
      id: `vision-${Date.now()}`,
      initialOutcomeId: 'ia-4-4-outcome',
      vividDescription: currentVision.trim(),
      aspects: selectedAspects,
      createdAt: new Date(),
      userId: 'current-user',
      stepId: 'ia-4-4'
    };

    setExpandedVisions(prev => [...prev, newVision]);
    onCreateVision({
      initialOutcomeId: 'ia-4-4-outcome',
      vividDescription: currentVision.trim(),
      aspects: selectedAspects,
      stepId: 'ia-4-4'
    });

    // Clear current vision for next iteration
    setCurrentVision('');
    setSelectedAspects([]);
  };

  // Explore another outcome
  const handleExploreAnother = () => {
    setPhase('expansion');
    setCurrentVision('');
    setSelectedAspects([]);
    
    const continueMessage = "What other aspect of this outcome would you like to explore? Or would you like to work with a completely different positive outcome?";
    
    setChatHistory(prev => [...prev, {
      id: `msg-${Date.now()}`,
      sessionId: 'ia-4-4-session',
      role: 'assistant',
      content: continueMessage,
      timestamp: new Date(),
      userId: 'current-user',
      stepId: 'ia-4-4'
    }]);
  };

  // Complete and close modal
  const handleComplete = () => {
    onComplete(expandedVisions);
    onOpenChange(false);
  };

  // Reset modal state when closed
  React.useEffect(() => {
    if (!open) {
      setPhase('setup');
      setCurrentVision('');
      setSelectedAspects([]);
      setChatHistory([]);
      setExpandedVisions([]);
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
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-purple-800">
                  Imagining Positive Outcomes
                </DialogTitle>
                <p className="text-sm text-purple-600">
                  Make your positive future feel more real and inspiring
                </p>
              </div>
            </div>
            <div className="ml-auto">
              <img 
                src="/assets/ADV_Rung3.png" 
                alt="Advanced Rung 3: Positive Visualization"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          {/* Three-Column Layout */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel: Outcome Foundation (40% width) */}
            <div className="w-2/5 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Your Initial Vision</h3>
                <p className="text-sm text-gray-600">Describe the positive outcome you're imagining</p>
              </div>
              
              <div className="flex-1 p-4 space-y-4">
                {/* Outcome Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Describe Your Positive Outcome
                  </label>
                  <Textarea
                    value={outcomeDescription}
                    onChange={(e) => setOutcomeDescription(e.target.value)}
                    placeholder="What positive outcome are you hoping for? Describe it in your own words - it doesn't need to be perfect..."
                    rows={4}
                    className="text-sm"
                  />
                </div>

                {/* Example Prompts */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Need inspiration?</h4>
                  <div className="space-y-1">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setOutcomeDescription(prompt)}
                        className="block w-full text-left p-2 text-xs text-purple-600 hover:bg-purple-50 rounded border border-purple-200 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phase Indicator */}
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {phase === 'setup' && 'Step 1: Describe your outcome'}
                      {phase === 'expansion' && 'Step 2: Exploring with AI'}
                      {phase === 'crystallization' && 'Step 3: Refining your vision'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel: AI Conversation (35% width) */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Visualization Partner</h3>
                <p className="text-sm text-gray-600">Work with Talia to make your outcome vivid</p>
              </div>
              
              <div className="flex-1 flex flex-col">
                {outcomeDescription.trim() && phase !== 'setup' ? (
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
                        trainingId="IA_4_4"
                        systemPrompt={PROMPTS.IA_4_4}
                        seed={outcomeDescription}
                        onReply={handleChatResponse}
                        placeholder="Describe what you're imagining..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center text-gray-500">
                      <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Describe your positive outcome to start the conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Expanded Vision (25% width) */}
            <div className="w-1/4 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Vivid Outcome</h3>
                <p className="text-sm text-gray-600">Capture your enhanced vision</p>
              </div>
              
              <div className="flex-1 flex flex-col p-4 space-y-4">
                {phase === 'crystallization' && currentVision && (
                  <>
                    {/* Current Vision Display */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Enhanced Vision
                      </label>
                      <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                        <p className="text-sm text-purple-800 leading-relaxed">
                          {currentVision}
                        </p>
                      </div>
                      
                      {/* Vision Aspects */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Vision Aspects
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {visionAspects.map((aspect) => (
                            <button
                              key={aspect.key}
                              onClick={() => {
                                setSelectedAspects(prev => 
                                  prev.includes(aspect.key)
                                    ? prev.filter(a => a !== aspect.key)
                                    : [...prev, aspect.key]
                                );
                              }}
                              className={`p-2 text-xs rounded border transition-colors ${
                                selectedAspects.includes(aspect.key)
                                  ? aspect.color
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {aspect.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveVision}
                          disabled={!currentVision.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Save Vision
                        </Button>
                        <Button
                          onClick={() => setCurrentVision('')}
                          variant="outline"
                          className="text-sm"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Saved Visions List */}
                {expandedVisions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4" />
                      Saved Visions ({expandedVisions.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {expandedVisions.map((vision) => (
                        <div key={vision.id} className="p-3 border border-gray-200 rounded-lg">
                          <p className="text-xs text-gray-800 line-clamp-3">
                            {vision.vividDescription}
                          </p>
                          {vision.aspects.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {vision.aspects.map((aspect) => (
                                <span
                                  key={aspect}
                                  className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded"
                                >
                                  {visionAspects.find(a => a.key === aspect)?.label || aspect}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Modal Action Buttons */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                {phase === 'crystallization' && (
                  <Button
                    onClick={handleExploreAnother}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    Explore Another Aspect
                  </Button>
                )}
                <Button
                  onClick={handleComplete}
                  disabled={expandedVisions.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
                >
                  I'm Satisfied ({expandedVisions.length} {expandedVisions.length === 1 ? 'vision' : 'visions'})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}