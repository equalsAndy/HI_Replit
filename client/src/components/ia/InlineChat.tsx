import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrainingId } from '@/lib/trainingTypes';

type Role = 'system' | 'user' | 'assistant';

type Msg = {
  role: Role;
  content: string;
  ts?: number;
};

type InlineChatProps = {
  trainingId: TrainingId;
  systemPrompt: string;
  seed?: string;
  styleOptions?: string[];
  useRetrieval?: boolean;
  modelOverride?: string;
  onReply?: (text: string) => void;
  onUserSend?: (text: string) => void;
  hideHistory?: boolean;
  hideSystemMessages?: boolean;
  className?: string;
};

export const InlineChat: React.FC<InlineChatProps> = ({
  trainingId,
  systemPrompt,
  seed,
  styleOptions,
  useRetrieval,
  modelOverride,
  onReply,
  onUserSend,
  hideHistory = false,
  hideSystemMessages = true,
  className,
}) => {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [style, setStyle] = React.useState<string | undefined>(undefined);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // initialize with system + optional seed
  React.useEffect(() => {
    const sys: Msg = { role: 'system', content: systemPrompt, ts: Date.now() };
    setMessages([sys]);
    if (seed && seed.trim()) setInput(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemPrompt, trainingId]);

  // Only show user/assistant messages; hide system prompts from the UI
  const lastThree = React.useMemo(() => {
    const visible = messages.filter(m => m.role !== 'system');
    return visible.slice(-3);
  }, [messages]);

  const send = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    // Attach style tag if selected
    const text = style ? `[Style: ${style}]\n${input.trim()}` : input.trim();
    const user: Msg = { role: 'user', content: text, ts: Date.now() };
    const outMessages = [...messages, user];
    setMessages(outMessages);
    setInput('');
    
    // Call onUserSend if provided
    if (onUserSend) onUserSend(text);

    try {
      const route = useRetrieval ? '/api/ai/chat/rag' : '/api/ai/chat/plain';
      const body: any = {
        training_id: trainingId,
        messages: outMessages.map(({ role, content }) => ({ role, content })),
      };
      if (modelOverride && modelOverride.trim()) body.model = modelOverride.trim();

      const resp = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || `Request failed: ${resp.status}`);
      }

      const reply: string = data.reply || '';
      const assistant: Msg = { role: 'assistant', content: reply, ts: Date.now() };
      setMessages(prev => [...prev, assistant]);
      if (onReply) onReply(reply);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
      // focus back to input for faster iteration
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCmdEnter = (e.metaKey || e.ctrlKey) && e.key === 'Enter';
    if (isCmdEnter) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className={`rounded-md border p-3 space-y-3 ${className || ''}`}>
      {!hideHistory && (
        <div className="space-y-2" aria-live="polite">
          {lastThree.map((m, idx) => (
            <div key={m.ts ?? idx} className="text-sm">
              <span className="font-medium mr-1">{m.role === 'user' ? 'You' : 'Assistant'}:</span>
              <span>{m.content}</span>
            </div>
          ))}
        </div>
      )}

      {styleOptions && styleOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <Label className="text-xs">Style</Label>
          <Select value={style} onValueChange={setStyle as any}>
            <SelectTrigger className="h-8 w-[220px]">
              <SelectValue placeholder="Select style (optional)" />
            </SelectTrigger>
            <SelectContent>
              {styleOptions.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={useRetrieval ? 'Type message via RAG stub' : 'Type message'}
          rows={3}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={send} disabled={isLoading || !input.trim()}>
              {isLoading ? 'Sending…' : 'Send'}
            </Button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
          <span className="text-xs text-gray-500">
            Cmd/Ctrl + Enter to send
          </span>
        </div>
      </div>
    </div>
  );
};

export default InlineChat;
