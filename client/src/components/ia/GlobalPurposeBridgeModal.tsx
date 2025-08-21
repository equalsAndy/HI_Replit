import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Globe, ArrowRight, Lightbulb, Target, ChevronDown, ChevronUp } from 'lucide-react';
import InlineChat from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

// TypeScript interfaces for IA-4-4 Global Purpose Bridge data structures
export interface HigherPurpose {
  id: string;
  description: string;
  userId: string;
  stepId: string;
  createdAt: Date;
}

export interface GlobalBridge {
  id: string;
  higherPurposeId: string;
  globalChallenge: string; // selected or custom challenge
  aiPerspectives: string[]; // 3 perspectives from AI
  chosenPerspective?: string;
  modestContribution: string;
  bridgeName: string;
  worldGameStretch?: string; // optional scaling vision
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
  bridgeId: string;
}

export interface GlobalPurposeBridgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  higherPurpose: string;
  globalChallenge: string;
  onComplete: (results: {
    aiPerspectives: string;
    chosenPerspective?: string;
    modestContribution: string;
    bridgeName: string;
    worldGameStretch?: string;
  }) => void;
}

export function GlobalPurposeBridgeModal({
  open,
  onOpenChange,
  higherPurpose,
  globalChallenge,
  onComplete,
}: GlobalPurposeBridgeModalProps) {
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [chosenPerspective, setChosenPerspective] = React.useState('');
  const [modestContribution, setModestContribution] = React.useState('');
  const [bridgeName, setBridgeName] = React.useState('');
  const [worldGameStretch, setWorldGameStretch] = React.useState('');
  const [showWorldGame, setShowWorldGame] = React.useState(false);
  const [aiPerspectives, setAiPerspectives] = React.useState('');

  // Auto-trigger AI perspectives when modal opens
  React.useEffect(() => {
    if (open && higherPurpose && globalChallenge) {
      // Auto-send initial AI message for 3 perspectives
      const initialPrompt = `Higher Purpose: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}\n\nPlease provide three unconventional perspectives on how my purpose might connect to this challenge.`;
      
      setChatHistory([{
        id: `msg-${Date.now()}`,
        sessionId: 'ia-4-4-bridge',
        role: 'user',
        content: initialPrompt,
        timestamp: new Date(),
        userId: 'current-user',
        stepId: 'ia-4-4',
        bridgeId: 'current-bridge'
      }]);
    }
  }, [open, higherPurpose, globalChallenge]);

  // Handle AI chat response
  const handleChatResponse = (response: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: 'ia-4-4-bridge',
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      userId: 'current-user',
      stepId: 'ia-4-4',
      bridgeId: 'current-bridge'
    };
    setChatHistory(prev => [...prev, newMessage]);

    // Store AI perspectives for completion
    if (response.includes('1.') && response.includes('2.') && response.includes('3.')) {
      setAiPerspectives(response);
    }
  };

  // Complete and save bridge
  const handleComplete = () => {
    if (!modestContribution.trim() || !bridgeName.trim()) return;

    onComplete({
      aiPerspectives: aiPerspectives || chatHistory.filter(msg => msg.role === 'assistant').map(msg => msg.content).join('\n\n'),
      chosenPerspective: chosenPerspective.trim() || undefined,
      modestContribution: modestContribution.trim(),
      bridgeName: bridgeName.trim(),
      worldGameStretch: worldGameStretch.trim() || undefined,
    });
    
    onOpenChange(false);
  };

  // Reset modal state when closed
  React.useEffect(() => {
    if (!open) {
      setChatHistory([]);
      setChosenPerspective('');
      setModestContribution('');
      setBridgeName('');
      setWorldGameStretch('');
      setShowWorldGame(false);
      setAiPerspectives('');
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
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-purple-800">
                  Global Purpose Bridge
                </DialogTitle>
                <p className="text-sm text-purple-600">
                  Connect {higherPurpose && `"${higherPurpose.substring(0, 40)}${higherPurpose.length > 40 ? '...' : ''}"`} to {globalChallenge}
                </p>
              </div>
            </div>
            <div className="ml-auto">
              <img 
                src="/assets/ADV_Rung3.png" 
                alt="Advanced Rung 3: Global Purpose Bridge"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          {/* Split-Screen Layout */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel: AI Conversation (60% width) */}
            <div className="w-3/5 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Fresh Perspectives</h3>
                <p className="text-sm text-gray-600">Discover unconventional angles with AI</p>
              </div>
              
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
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {chatHistory.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">AI is preparing fresh perspectives on your purpose and challenge...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* AI Chat Component */}
                <div className="p-4 border-t border-gray-200">
                  <InlineChat
                    trainingId="IA_4_4"
                    systemPrompt={PROMPTS.IA_4_4}
                    seed={`Higher Purpose: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}`}
                    onReply={handleChatResponse}
                    placeholder="Ask about any perspective or explore connections..."
                  />
                </div>
              </div>
            </div>

            {/* Right Panel: Bridge Capture (40% width) */}
            <div className="w-2/5 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Your Bridge</h3>
                <p className="text-sm text-gray-600">Design your contribution</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Foundation Display */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Foundation
                  </h4>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-purple-700">Your Purpose:</p>
                        <p className="text-sm text-purple-800">{higherPurpose}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-purple-700">Global Challenge:</p>
                        <p className="text-sm text-purple-800">{globalChallenge}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Chosen Perspective (Optional) */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Step 4: Chosen Perspective (Optional)</h4>
                  <p className="text-sm text-gray-600">
                    Which AI perspective resonated most? Copy and paste it here:
                  </p>
                  <Textarea
                    value={chosenPerspective}
                    onChange={(e) => setChosenPerspective(e.target.value)}
                    placeholder="Paste the perspective that sparked your imagination..."
                    rows={3}
                    className="text-sm"
                  />
                </div>

                {/* Step 5: Modest Contribution */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Step 5: Modest Contribution</h4>
                  <p className="text-sm text-gray-600">
                    What small move, experiment, or system shift might reflect both your purpose and response to this global need?
                  </p>
                  <Textarea
                    value={modestContribution}
                    onChange={(e) => setModestContribution(e.target.value)}
                    placeholder="Describe a modest, real-world contribution you could make..."
                    rows={4}
                    className="text-sm"
                  />
                </div>

                {/* Step 6: Name Your Bridge */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Step 6: Name Your Bridge</h4>
                  <p className="text-sm text-gray-600">
                    Give your contribution a creative name that evokes connection:
                  </p>
                  <input
                    type="text"
                    value={bridgeName}
                    onChange={(e) => setBridgeName(e.target.value)}
                    placeholder="A name that captures your purpose-challenge connection"
                    className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* Step 7: World Game Stretch (Optional) */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowWorldGame(!showWorldGame)}
                    className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800"
                  >
                    {showWorldGame ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Step 7: World Game Stretch (Optional)
                  </button>
                  <p className="text-sm text-gray-600">
                    How would you redesign this to work at planetary scale?
                  </p>
                  
                  {showWorldGame && (
                    <Textarea
                      value={worldGameStretch}
                      onChange={(e) => setWorldGameStretch(e.target.value)}
                      placeholder="Imagine your contribution scaling to address the global challenge systemically..."
                      rows={4}
                      className="text-sm"
                    />
                  )}
                </div>
              </div>
              
              {/* Complete Button */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  onClick={handleComplete}
                  disabled={!modestContribution.trim() || !bridgeName.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Complete Bridge
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}