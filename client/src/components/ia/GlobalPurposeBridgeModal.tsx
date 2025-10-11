import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Globe, ArrowRight, Lightbulb, Target } from 'lucide-react';
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
  const [aiPerspectives, setAiPerspectives] = React.useState('');
  const [initialPrompt, setInitialPrompt] = React.useState('');
  const [chatKey, setChatKey] = React.useState(0);

  // Auto-trigger AI introduction when modal opens
  React.useEffect(() => {
    if (open && higherPurpose && globalChallenge) {
      // Set up initial prompt
      const prompt = `Offer three unconventional or overlooked perspectives on this challenge—and what it might need most from someone like me.`;
      setInitialPrompt(prompt);
      
      // Force InlineChat to remount with new prompt
      setChatKey(prev => prev + 1);
      
      // Auto-show AI introduction message
      const aiIntroMessage = `Let's work on your purpose. I've put a prompt below to start, feel free to edit or send it.`;
      
      setChatHistory([{
        id: `msg-${Date.now()}`,
        sessionId: 'ia-4-4-bridge',
        role: 'assistant',
        content: aiIntroMessage,
        timestamp: new Date(),
        userId: 'current-user',
        stepId: 'ia-4-4',
        bridgeId: 'current-bridge'
      }]);
    }
  }, [open, higherPurpose, globalChallenge]);

  // Handle user message
  const handleUserSend = (userMessage: string) => {
    const newMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sessionId: 'ia-4-4-bridge',
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      userId: 'current-user',
      stepId: 'ia-4-4',
      bridgeId: 'current-bridge'
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  // Handle AI chat response
  const handleChatResponse = (response: string) => {
    const newMessage: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
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
      setAiPerspectives('');
      setInitialPrompt('');
      setChatKey(0);
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
          <img src="/assets/adv_rung3_split.png" alt="Rung 3" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Autoflow Mindful Prompts — Global Purpose Bridge
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>

        {/* Left Column: AI Chat */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          <label className="font-medium text-gray-700 mb-1 text-sm">
            Working on your purpose with {globalChallenge.toLowerCase()}
          </label>
          <div className="rounded-md bg-blue-50/60 border border-blue-100 px-3 py-2 text-xs text-gray-700 shadow-sm mb-4">
            <div>
              <strong>Purpose:</strong> {higherPurpose.length > 150 ? `${higherPurpose.slice(0, 150)}...` : higherPurpose}
            </div>
          </div>

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
              
              {chatHistory.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">AI is preparing fresh perspectives on your purpose and challenge...</p>
                  </div>
                </div>
              )}
            </div>

            {/* InlineChat for input */}
            <InlineChat
              key={chatKey}
              trainingId="ia-4-4"
              systemPrompt={`${PROMPTS.IA_4_4}\n\nCONTEXT:\nUser's Higher Purpose: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}`}
              seed={initialPrompt}
              onReply={handleChatResponse}
              onUserSend={handleUserSend}
              hideHistory={true}
              className="border-0 p-0 bg-transparent"
              placeholder="Edit the prompt above or ask about any perspective..."
            />
          </div>
        </div>

        {/* Right Column: Bridge Capture */}
        <div className="flex flex-col bg-white p-4 pt-16 min-h-0">
          <label className="font-medium text-gray-700 mb-1 text-sm">
            Bridge Design
          </label>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Step 3: Chosen Perspective */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm">Step 3: Chosen Perspective</h4>
              <p className="text-xs text-gray-600">
                Which AI perspective resonated most? Copy and paste it here:
              </p>
              <Textarea
                value={chosenPerspective}
                onChange={(e) => setChosenPerspective(e.target.value)}
                placeholder="Paste the perspective that sparked your imagination..."
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            {/* Step 4: Modest Contribution */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm">Step 4: Modest Contribution</h4>
              <p className="text-xs text-gray-600">
                What small move, experiment, or system shift might reflect both your purpose and response to this global need?
              </p>
              <Textarea
                value={modestContribution}
                onChange={(e) => setModestContribution(e.target.value)}
                placeholder="Describe a modest, real-world contribution you could make..."
                rows={4}
                className="text-xs resize-none"
              />
            </div>

            {/* Step 5: Name Your Bridge */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm">Step 5: Name Your Bridge</h4>
              <p className="text-xs text-gray-600">
                Give your contribution a creative name that evokes connection:
              </p>
              <input
                type="text"
                value={bridgeName}
                onChange={(e) => setBridgeName(e.target.value)}
                placeholder="A name that captures your purpose-challenge connection"
                className="w-full p-2 border border-gray-300 rounded-md text-xs"
              />
            </div>
          </div>
          
          {/* Complete Button */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <Button
              onClick={handleComplete}
              disabled={!modestContribution.trim() || !bridgeName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
            >
              <Target className="w-4 h-4 mr-2" />
              Complete Bridge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}