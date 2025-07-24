// client/src/hooks/useCoachingModal.ts
import { useReducer, useCallback, useEffect } from 'react';
import { CoachingModalState, StrengthData, TaliaMessage, Reflection } from '@/types/coaching';

type Action =
  | { type: 'OPEN_MODAL'; payload: { strength: StrengthData; reflection?: Reflection } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'ADD_MESSAGE'; payload: Omit<TaliaMessage, 'id' | 'timestamp'> }
  | { type: 'UPDATE_REFLECTION_DRAFT'; payload: Partial<Reflection> };

const initialState: CoachingModalState = {
  isOpen: false,
  context: null,
  chatHistory: [],
  reflectionDraft: {},
};

const coachingModalReducer = (state: CoachingModalState, action: Action): CoachingModalState => {
  switch (action.type) {
    case 'OPEN_MODAL':
      const { strength, reflection } = action.payload;
      const welcomeMessage: TaliaMessage = {
        id: 'welcome',
        sender: 'talia',
        text: `Hi! I'm Talia, your AI coach. I see you're focusing on your '${strength.name}' strength. That's a great choice! How can I help you think about applying this strength?`,
        timestamp: new Date(),
      };
      return {
        ...state,
        isOpen: true,
        context: { strength, reflection },
        chatHistory: [welcomeMessage],
        reflectionDraft: reflection || { response: '', wordCount: 0 },
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        isOpen: false,
        context: null,
        chatHistory: [],
        reflectionDraft: {},
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        chatHistory: [
          ...state.chatHistory,
          { ...action.payload, id: Date.now().toString(), timestamp: new Date() },
        ],
      };
    case 'UPDATE_REFLECTION_DRAFT':
      return {
        ...state,
        reflectionDraft: { ...state.reflectionDraft, ...action.payload },
      };
    default:
      return state;
  }
};

// A singleton store approach to keep state consistent across components
let state = initialState;
const listeners = new Set<() => void>();

const dispatch = (action: Action) => {
  state = coachingModalReducer(state, action);
  listeners.forEach((listener) => listener());
};

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const useCoachingModal = () => {
  const [, forceUpdate] = useReducer((c) => c + 1, 0);

  useEffect(() => {
    const unsubscribe = subscribe(forceUpdate);
    return unsubscribe;
  }, []);

  const openModal = useCallback((strength: StrengthData, reflection?: Reflection) => {
    dispatch({ type: 'OPEN_MODAL', payload: { strength, reflection } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const addMessage = useCallback((message: Omit<TaliaMessage, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const updateReflectionDraft = useCallback((draft: Partial<Reflection>) => {
    dispatch({ type: 'UPDATE_REFLECTION_DRAFT', payload: draft });
  }, []);

  return {
    ...state,
    openModal,
    closeModal,
    addMessage,
    updateReflectionDraft,
  };
};

export default useCoachingModal;
