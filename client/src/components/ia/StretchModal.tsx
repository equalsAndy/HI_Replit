import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import InlineChat from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

const TAG_OPTIONS = [
  { value: 'Expansion', label: 'Expansion', helper: "I see bigger possibilities now." },
  { value: 'Surprise', label: 'Surprise', helper: "Something I didn't expect clicked." },
  { value: 'Clarity', label: 'Clarity', helper: 'It feels clearer and more focused.' },
  { value: 'Curiosity', label: 'Curiosity', helper: 'I want to explore, not conclude.' },
  { value: 'Excitement', label: 'Excitement', helper: "There's energy and possibility here." },
  { value: 'Breakthrough', label: 'Breakthrough', helper: 'A new level just opened up.' },
  { value: 'Insight', label: 'Insight', helper: 'A fresh understanding landed.' },
  { value: 'Other', label: 'Other', helper: 'Something else—name it later.' },
];

type ChatMessage = { 
  role: 'user' | 'assistant'; 
  content: string; 
  skipExtraction?: boolean;
  isStretchOffer?: boolean;
  isExpansionSuggestion?: boolean;
};

export interface StretchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFrame: string;
  onApply: (result: { transcript: string[]; stretch: string; tag: string; resistance_type: string; resistance_custom?: string }) => void;
  onStartOver: () => void;
  onKeepContext?: () => void;
}

export function StretchModal({
  open,
  onOpenChange,
  currentFrame,
  onApply,
  onStartOver,
  onKeepContext,
}: StretchModalProps) {
  const [phase, setPhase] = React.useState<'stretch' | 'visualize' | 'resistance'>('stretch');
  const [transcript, setTranscript] = React.useState<ChatMessage[]>([]);
  const [stretchVisualization, setStretchVisualization] = React.useState('');
  const [currentStretch, setCurrentStretch] = React.useState('');
  
  // State for Step 4 (resistance identification)
  const [resistanceType, setResistanceType] = React.useState('');
  const [resistanceCustom, setResistanceCustom] = React.useState('');

  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);

  function toFirstPerson(text: string) {
    let t = text;
    t = t.replace(/[""]/g, '"');
    t = t.replace(/\bthe way you\b/gi, 'the way I');
    t = t.replace(/\byou show yourself\b/gi, 'I show myself');
    t = t.replace(/\bshow yourself\b/gi, 'show myself');
    t = t.replace(/\bappreciate you\b/gi, 'appreciate me');
    t = t.replace(/\bknow you\b/gi, 'know me');
    t = t.replace(/\bvalue you\b/gi, 'value me');
    t = t.replace(/\bget to know you\b/gi, 'get to know me');
    t = t.replace(/\byourself\b/gi, 'myself');
    t = t.replace(/\byours\b/gi, 'mine');
    t = t.replace(/\byour\b/gi, 'my');
    t = t.replace(/\byou're\b/gi, "I'm");
    t = t.replace(/\byou are\b/gi, 'I am');
    t = t.replace(/\byou were\b/gi, 'I was');
    t = t.replace(/\byou have\b/gi, 'I have');
    t = t.replace(/\b(to|for|about|with|of|from|at|on|by|like) you\b/gi, (_m, p1) => `${p1} me`);
    t = t.replace(/(^|[.!?]\s+)you\b/gi, (_m, p1) => `${p1}I`);
    t = t.replace(/\byou\b/gi, 'me');
    t = t.replace(/\bI as I am\b/g, 'me as I am');
    t = t.replace(/\bme am\b/g, 'I am');
    t = t.replace(/\bme (?:have|was)\b/g, (m) => m.replace('me ', 'I '));
    return t.replace(/\s+/g, ' ').trim();
  }

  function extractStretch(raw: string) {
    // First, try to find quoted stretches (most common pattern)
    const quotedStretchPattern = /['"`]([^'"`.]*?)['"`]/g;
    const quotedMatches = Array.from(raw.matchAll(quotedStretchPattern));
    
    for (const match of quotedMatches) {
      const quote = match[1].trim();
      // Skip short quotes, questions, or generic responses
      if (quote.length > 15 && 
          !quote.includes('?') && 
          !quote.toLowerCase().includes('next level') &&
          !quote.toLowerCase().includes('expand') &&
          !quote.toLowerCase().includes('possibility') &&
          (quote.includes('I') || quote.includes('you') || quote.includes('could') ||
           quote.includes('become') || quote.includes('might') || quote.includes('would'))) {
        return toFirstPerson(quote).slice(0, 300);
      }
    }

    // Look for specific stretch introduction patterns
    const stretchIntroPatterns = [
      /(?:what if|imagine if)\\s+you\\s+([^.!?]+)[.!?]/i,
      /(?:you could|you might)\\s+([^.!?]+)[.!?]/i,
      /(?:consider|picture|envision)\\s+([^.!?]+)[.!?]/i,
      /(?:expand|stretch|take it to)\\s+([^.!?]+)[.!?]/i,
    ];

    for (const pattern of stretchIntroPatterns) {
      const match = raw.match(pattern);
      if (match && match[1]) {
        const stretch = match[1].trim();
        if (stretch.length > 10) {
          return toFirstPerson(stretch).slice(0, 300);
        }
      }
    }

    const sentences = raw.split(/[.!?]+/).filter(s => s.trim().length > 10);
    for (const sentence of sentences) {
      if (sentence.includes('?') || sentence.trim().length < 20) continue;
      
      const stretchIndicators = [
        'expand', 'stretch', 'next level', 'possibility', 'potential', 'could become',
        'imagine', 'envision', 'what if', 'consider', 'elevate', 'amplify'
      ];
      
      if (stretchIndicators.some(indicator => sentence.toLowerCase().includes(indicator))) {
        const cleaned = sentence.replace(/^(?:this\\s+)?(?:stretch|this)\\s*[:\\-]?\\s*/i, '').replace(/^["'""''`]|["'""''`]$/g, '');
        return toFirstPerson(cleaned.trim()).slice(0, 300);
      }
    }

    return '';
  }

  function extractExpansionSuggestion(raw: string) {
    const expansionPatterns = [
      /I expanded from ([^.!?]*) to ([^.!?]*[.!?]?)/i,
      /from ([^.!?]*) to ([^.!?]*[.!?]?)/i,
      /you expanded from ([^.!?]*) to ([^.!?]*[.!?]?)/i,
    ];

    for (const pattern of expansionPatterns) {
      const match = raw.match(pattern);
      if (match) {
        const from = match[1].trim();
        const to = match[2].trim().replace(/[.!?]*$/, '');
        return `I expanded from ${from} to ${to}`;
      }
    }

    return '';
  }

  React.useEffect(() => {
    if (!open) {
      setPhase('stretch');
      setTranscript([]);
      setStretchVisualization('');
      setCurrentStretch('');
      setResistanceType('');
      setResistanceCustom('');
    } else {
      // Always start with stretch mode
      setPhase('stretch');
      setTranscript([
        { 
          role: 'assistant', 
          content: 'Hi! I see you have a visualization to stretch. I put a starter prompt in the box below—feel free to edit and hit Send.', 
          skipExtraction: true 
        },
      ]);
      
      setStretchVisualization('');
      setCurrentStretch('');
      setResistanceType('');
      setResistanceCustom('');
    }
  }, [open]);

  React.useEffect(() => {
    const el = chatStreamRef.current;
    if (!el) return;
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 100);
  }, [transcript]);

  const onChatReply = React.useCallback((msg: string) => {
    // Only process stretches during stretch phase
    if (phase === 'stretch') {
      const potentialStretch = extractStretch(msg);
      const isStretchOffer = potentialStretch.length > 0;
      
      if (isStretchOffer) {
        setCurrentStretch(potentialStretch);
      }
      
      setTranscript((prev) => [...prev, { 
        role: 'assistant', 
        content: msg.replace(/\\s*Expansion\\s*[:\\-][\\s\\S]*$/i, '').trim(), 
        isStretchOffer
      }]);
    } else if (phase === 'expansion') {
      // During expansion phase, look for expansion suggestions
      const potentialExpansion = extractExpansionSuggestion(msg);
      const isExpansionSuggestion = potentialExpansion.length > 0;
      
      if (isExpansionSuggestion) {
        setExpansionBox(potentialExpansion);
      }
      
      setTranscript((prev) => [...prev, { 
        role: 'assistant', 
        content: msg.replace(/\\s*Expansion\\s*[:\\-][\\s\\S]*$/i, '').trim(), 
        isExpansionSuggestion
      }]);
    } else {
      // Default for other phases
      setTranscript((prev) => [...prev, { 
        role: 'assistant', 
        content: msg.replace(/\\s*Expansion\\s*[:\\-][\\s\\S]*$/i, '').trim()
      }]);
    }
  }, [phase]);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);
  }, []);

  const onNext = () => {
    if (phase === 'stretch' && currentStretch.trim().length > 0) {
      setPhase('visualize');
    } else if (phase === 'visualize' && stretchVisualization.trim().length > 0) {
      setPhase('resistance');
    }
  };

  const onBack = () => {
    if (phase === 'resistance') setPhase('visualize');
    else if (phase === 'visualize') setPhase('stretch');
  };

  const onApplyClick = () => {
    if (!stretchVisualization.trim() || !resistanceType.trim()) return;
    const transcriptLines = transcript
      .filter(m => m.content.trim().length > 0)
      .map(m => m.content);
    onApply({ 
      transcript: transcriptLines, 
      stretch: currentStretch.trim(), 
      tag: '', // No tagging
      stretch_visualization: stretchVisualization.trim(),
      resistance_type: resistanceType,
      resistance_custom: resistanceType === 'Other' ? resistanceCustom : undefined
    });
    onOpenChange(false);
  };

  const handleStartOverClick = () => {
    if (confirm('Are you sure you want to start over? This will clear everything and start fresh.')) {
      setPhase('stretch');
      setTranscript([
        { 
          role: 'assistant', 
          content: 'What visualization do you want to stretch today? I\'ll help you expand it to the next level.', 
          skipExtraction: true 
        },
      ]);
      setStretchVisualization('');
      setCurrentStretch('');
      setResistanceType('');
      setResistanceCustom('');
      // Don't close modal, just reset it
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-4 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-3 z-10">
          <img src="/assets/adv_rung2_split.png" alt="Rung 2" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Visualization Stretch — AI Partner
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleStartOverClick}>Start Over</Button>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>

        {/* Left Column: Frame + Chat */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          <label className="font-medium text-gray-700 mb-1 text-sm">
            Your Visualization Frame
          </label>
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-sm text-gray-900 shadow-sm mb-4">
            "{currentFrame}"
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Bubbles */}
            <div ref={chatStreamRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3" style={{maxHeight: '400px'}}>
              {transcript.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'max-w-[75%] ml-auto rounded-xl border bg-blue-50 px-3 py-2 text-sm'
                      : 'max-w-[75%] mr-auto rounded-xl border bg-white px-3 py-2 text-sm'
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>

            {/* InlineChat for input only */}
            <InlineChat
              trainingId="ia-4-3"
              systemPrompt={PROMPTS.IA_4_3}
              seed={`What's one possibility I haven't considered that would expand this visualization or move it to the next level: "${currentFrame}"`}
              onUserSend={onChatUserSend}
              onReply={onChatReply}
              hideHistory={true}
              className="border-0 p-0 bg-transparent"
            />
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto">
          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase mb-2">YOUR VISUALIZATION STRETCHED</h2>
            <div className="min-h-[100px] p-3 border rounded bg-gray-50 text-sm mb-3">
              {currentStretch.trim() ? currentStretch : 'Work with AI to stretch your visualization and it will appear here.'}
            </div>
            {phase === 'stretch' && (
              <Button onClick={onNext} disabled={!currentStretch.trim()} className="w-full">
                This looks good
              </Button>
            )}
          </section>

          {/* Step 3: Visualize the Stretch */}
          {phase !== 'stretch' && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold uppercase mb-2">Visualize the Stretch</h2>
              <p className="text-xs text-gray-600 mb-3">
                Take a moment to picture yourself stepping into that new version. What changes in your energy, approach, or impact?
              </p>
              <textarea
                className="w-full min-h-[100px] p-3 border rounded bg-gray-50 text-sm mb-3 resize-none"
                value={stretchVisualization}
                onChange={(e) => setStretchVisualization(e.target.value)}
                placeholder="Work with AI to articulate your vision or type it here."
              />
              {phase === 'visualize' && (
                <>
                  <p className="text-xs italic text-gray-500 mb-3">You can work through this with AI or complete it yourself.</p>
                  <div className="flex gap-2 mb-4">
                    <Button variant="secondary" onClick={onBack} size="sm" className="flex-1">Back to stretch</Button>
                    <Button onClick={onNext} disabled={!stretchVisualization.trim()} size="sm" className="flex-1">Continue to Resistance</Button>
                  </div>
                </>
              )}
            </section>
          )}


          {/* Step 4: Identify the Resistance */}
          {phase === 'resistance' && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold uppercase mb-2">Identify the Resistance</h2>
              <p className="text-xs text-gray-600 mb-3">What's holding you back from stretching into this expanded role?</p>
              <div className="space-y-2 mb-3">
                {['Fear of judgment', 'Habit', 'Lack of time', 'Identity attachment', 'Other'].map((option) => (
                  <label key={option} className="flex items-center text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="resistance"
                      value={option}
                      checked={resistanceType === option}
                      onChange={(e) => setResistanceType(e.target.value)}
                      className="mr-2"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {resistanceType === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify other resistance..."
                  value={resistanceCustom}
                  onChange={(e) => setResistanceCustom(e.target.value)}
                  className="w-full p-2 border rounded text-sm mb-3"
                />
              )}
              <div className="flex gap-2 mb-4">
                <Button variant="secondary" onClick={onBack} size="sm" className="flex-1">Back</Button>
                <Button onClick={onApplyClick} disabled={!resistanceType || (resistanceType === 'Other' && !resistanceCustom.trim())} size="sm" className="flex-1">
                  Complete Exercise
                </Button>
              </div>
            </section>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StretchModal;