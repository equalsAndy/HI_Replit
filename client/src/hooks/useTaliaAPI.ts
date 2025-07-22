// client/src/hooks/useTaliaAPI.ts
import { useState, useCallback } from 'react';
import { TaliaMessage, StrengthData } from '@/types/coaching';

interface TaliaAPIResponse {
  response: string;
  confidence: number;
}

export const useTaliaAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    message: string,
    strength: StrengthData,
    chatHistory: TaliaMessage[]
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/coaching/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {
            strength,
            chatHistory: chatHistory.slice(-5), // Send last 5 messages for context
          },
          persona: 'talia',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Talia');
      }

      const data: TaliaAPIResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error communicating with Talia:', error);
      return "I'm sorry, I'm having trouble responding right now. Please try again.";
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
  };
};
