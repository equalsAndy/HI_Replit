// Admin utility for clearing all assessment data while preserving profile information

interface ClearDataResult {
  success: boolean;
  message: string;
  details?: string[];
}

export async function clearAllAssessmentData(userId?: string): Promise<ClearDataResult> {
  try {
    console.log('🗑️ Admin: Clearing all assessment data...');
    
    const clearOperations: string[] = [];
    const failures: string[] = [];

    // 1. Clear step-by-step reflection data
    try {
      const response = await fetch('/api/workshop-data/step-by-step-reflection', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        ...(userId && { body: JSON.stringify({ userId }) })
      });

      if (response.ok) {
        clearOperations.push('✅ Step-by-step reflections cleared');
      } else {
        failures.push(`❌ Failed to clear reflections: ${response.status}`);
      }
    } catch (error) {
      failures.push(`❌ Reflection clearing error: ${error}`);
    }

    // 2. Clear star card data
    try {
      const response = await fetch('/api/workshop-data/starcard', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        ...(userId && { body: JSON.stringify({ userId }) })
      });

      if (response.ok) {
        clearOperations.push('✅ Star card data cleared');
      } else {
        failures.push(`❌ Failed to clear star card: ${response.status}`);
      }
    } catch (error) {
      failures.push(`❌ Star card clearing error: ${error}`);
    }

    // 3. Clear flow attributes
    try {
      const response = await fetch('/api/workshop-data/flow-attributes', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        ...(userId && { body: JSON.stringify({ userId }) })
      });

      if (response.ok) {
        clearOperations.push('✅ Flow attributes cleared');
      } else {
        failures.push(`❌ Failed to clear flow attributes: ${response.status}`);
      }
    } catch (error) {
      failures.push(`❌ Flow attributes clearing error: ${error}`);
    }

    // 4. Clear navigation progress
    try {
      const response = await fetch('/api/user/navigation-progress', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        ...(userId && { body: JSON.stringify({ userId }) })
      });

      if (response.ok) {
        clearOperations.push('✅ Navigation progress cleared');
      } else {
        failures.push(`❌ Failed to clear navigation progress: ${response.status}`);
      }
    } catch (error) {
      failures.push(`❌ Navigation progress clearing error: ${error}`);
    }

    // 5. Clear local storage (client-side only)
    if (typeof window !== 'undefined') {
      const localStorageKeys = [
        'ast-star-card-visible',
        'allstarteams-navigation-progress',
        'allstar_navigation_progress',
        'allstarteams_progress',
        'allstarteams_completedActivities',
        'allstarteams_starCard',
        'allstarteams_flowAttributes'
      ];

      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      clearOperations.push('✅ Local storage cleared');
    }

    // 6. Clear session storage (client-side only)
    if (typeof window !== 'undefined') {
      const sessionKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('ast') || 
        key.includes('allstar') || 
        key.includes('workshop') ||
        key.includes('reflection') ||
        key.includes('progress-cleared')
      );

      sessionKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

      clearOperations.push('✅ Session storage cleared');
    }

    const success = failures.length === 0;
    const message = success 
      ? `Successfully cleared all assessment data (${clearOperations.length} operations)`
      : `Partially cleared data: ${clearOperations.length} succeeded, ${failures.length} failed`;

    console.log(success ? '✅' : '⚠️', message);
    clearOperations.forEach(op => console.log(op));
    failures.forEach(failure => console.error(failure));

    return {
      success,
      message,
      details: [...clearOperations, ...failures]
    };

  } catch (error) {
    const errorMessage = `Failed to clear assessment data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('❌', errorMessage);
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

// Make function globally available for admin console access
if (typeof window !== 'undefined') {
  (window as any).clearAllAssessmentData = clearAllAssessmentData;
  console.log('🔧 Admin function loaded: window.clearAllAssessmentData()');
}
