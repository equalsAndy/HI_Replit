/**
 * Hook for automatically capturing and saving StarCards
 */

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { starCardCaptureService, StarCardCaptureResult } from '../services/starcard-capture-service';
import { useToast } from './use-toast';

export interface UseStarCardAutoCaptureOptions {
  autoCapture?: boolean;
  saveToDatabase?: boolean;
  saveToTempComms?: boolean;
}

export function useStarCardAutoCapture(options: UseStarCardAutoCaptureOptions = {}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCaptureResult, setLastCaptureResult] = useState<StarCardCaptureResult | null>(null);
  const { toast } = useToast();

  // Get current user for database saves
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const user = userData?.user;

  /**
   * Manually capture StarCard
   */
  const captureStarCard = useCallback(async (
    element: HTMLElement,
    customOptions?: {
      filename?: string;
      saveToDatabase?: boolean;
      saveToTempComms?: boolean;
    }
  ): Promise<StarCardCaptureResult> => {
    setIsCapturing(true);
    
    try {
      const captureOptions = {
        userId: user?.id,
        saveToDatabase: customOptions?.saveToDatabase ?? options.saveToDatabase ?? false,
        saveToTempComms: customOptions?.saveToTempComms ?? options.saveToTempComms ?? true,
        filename: customOptions?.filename
      };

      console.log('🎯 useStarCardAutoCapture: Starting capture with options:', captureOptions);
      
      const result = await starCardCaptureService.captureAndSave(element, captureOptions);
      
      setLastCaptureResult(result);
      
      if (result.success) {
        console.log('✅ StarCard captured successfully:', result);
      } else {
        console.error('❌ StarCard capture failed:', result);
      }
      
      return result;
    } finally {
      setIsCapturing(false);
    }
  }, [user?.id, options.saveToDatabase, options.saveToTempComms]);

  /**
   * Auto-capture for testing (saves to tempcomms)
   */
  const captureForTesting = useCallback((element: HTMLElement, testName?: string) => {
    return captureStarCard(element, {
      saveToDatabase: false,
      saveToTempComms: true,
      filename: testName ? `starcard-test-${testName}-${Date.now()}.png` : undefined
    });
  }, [captureStarCard]);

  /**
   * Auto-capture for user (saves to database)
   */
  const captureForUser = useCallback((element: HTMLElement) => {
    if (!user?.id) {
      console.warn('⚠️ Cannot capture for user: no user ID available');
      return Promise.resolve({
        success: false,
        message: 'No user ID available for database save',
        error: 'User not logged in'
      });
    }

    return captureStarCard(element, {
      saveToDatabase: true,
      saveToTempComms: false,
      filename: `user-${user.id}-starcard-${Date.now()}.png`
    });
  }, [captureStarCard, user?.id]);

  /**
   * Smart auto-capture that chooses best option
   */
  const autoCapture = useCallback((element: HTMLElement) => {
    if (user?.id) {
      console.log('🎯 Auto-capturing for logged-in user');
      return captureForUser(element);
    } else {
      console.log('🎯 Auto-capturing for testing (no user)');
      return captureForTesting(element, 'auto');
    }
  }, [user?.id, captureForUser, captureForTesting]);

  /**
   * Auto-capture StarCard by finding it via data-starcard attribute
   * This is the main method for step completion auto-capture
   */
  const captureStarCardFromPage = useCallback(async (userId?: number): Promise<StarCardCaptureResult> => {
    try {
      console.log('🎯 Starting StarCard auto-capture from page for user:', userId || user?.id);
      
      // Find the StarCard element using data-starcard attribute
      const starCardElement = document.querySelector('[data-starcard="true"]') as HTMLElement;
      
      if (!starCardElement) {
        console.warn('⚠️ StarCard element not found for auto-capture - missing data-starcard attribute');
        return { 
          success: false, 
          error: 'StarCard element not found',
          message: 'Could not find StarCard element on page'
        };
      }

      console.log('📸 Found StarCard element, initiating capture...');
      
      // Use the provided userId or fallback to current user
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        console.warn('⚠️ No user ID available for StarCard capture');
        return { 
          success: false, 
          error: 'No user ID available',
          message: 'User must be logged in to save StarCard'
        };
      }
      
      // Capture and save to database
      const result = await captureForUser(starCardElement);
      
      if (result.success) {
        console.log('✅ StarCard auto-capture successful:', result);
        toast({
          title: "StarCard Saved",
          description: "Your StarCard has been automatically saved for reports.",
          duration: 3000
        });
      } else {
        console.warn('❌ StarCard auto-capture failed:', result);
        // Don't show error toast - capture failure shouldn't block user flow
        // But log the error for debugging
      }

      return result;
    } catch (error) {
      console.error('💥 StarCard auto-capture error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An error occurred during StarCard capture'
      };
    }
  }, [user?.id, captureForUser, toast]);

  return {
    // State
    isCapturing,
    lastCaptureResult,
    canSaveToDatabase: !!user?.id,
    
    // Methods
    captureStarCard,
    captureForTesting,
    captureForUser,
    autoCapture,
    captureStarCardFromPage,
    
    // User info
    userId: user?.id,
    userName: user?.name
  };
}