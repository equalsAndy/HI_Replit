// client/src/types/coaching.ts
export interface TaliaMessage {
  id: string;
  text: string;
  sender: 'user' | 'talia';
  timestamp: Date;
}

export interface StrengthData {
  name: string;
  description: string;
}

export interface Reflection {
  id: string;
  question: string;
  response: string;
  wordCount: number;
}

export interface CoachingModalState {
  isOpen: boolean;
  context: {
    strength: StrengthData;
    reflection?: Reflection;
  } | null;
  chatHistory: TaliaMessage[];
  reflectionDraft: Partial<Reflection>;
}