/**
 * Reflection Area Management Utilities
 * ===================================
 * Utilities for checking reflection area status and handling fallbacks
 */

interface ReflectionAreaStatus {
  id: string;
  enabled: boolean;
  fallbackText?: string;
}

/**
 * Check if a reflection area is enabled
 * @param areaId - The reflection area ID (e.g., 'strength_1_reflection')
 * @returns Promise with area status and fallback text
 */
export async function checkReflectionAreaStatus(areaId: string): Promise<ReflectionAreaStatus | null> {
  try {
    const response = await fetch(`/api/admin/ai/reflection-areas/${areaId}/status`, {
      credentials: 'include'
    });

    if (!response.ok) {
      console.warn(`Failed to check reflection area status for ${areaId}`);
      return null;
    }

    const data = await response.json();
    return data.success ? data.area : null;
  } catch (error) {
    console.error('Error checking reflection area status:', error);
    return null;
  }
}

/**
 * Get fallback content when reflection area is disabled
 * @param areaId - The reflection area ID
 * @param defaultFallback - Default fallback text if none configured
 * @returns Fallback content to display
 */
export async function getReflectionAreaFallback(
  areaId: string, 
  defaultFallback: string = 'Please take time to reflect on this area.'
): Promise<string> {
  const status = await checkReflectionAreaStatus(areaId);
  
  if (!status || status.enabled) {
    return ''; // Area is enabled or status unknown, no fallback needed
  }

  return status.fallbackText || defaultFallback;
}

/**
 * Determine if Reflection Talia should be shown for a specific area
 * @param areaId - The reflection area ID
 * @returns Promise<boolean> - true if Talia should be shown
 */
export async function shouldShowReflectionTalia(areaId: string): Promise<boolean> {
  const status = await checkReflectionAreaStatus(areaId);
  return status?.enabled ?? false; // Default to false if status can't be determined
}

/**
 * Reflection area mappings for workshop steps
 */
export const REFLECTION_AREA_MAPPINGS = {
  // AST Workshop Steps
  '2-2': 'step_2_2',
  '2-3': 'step_2_3', 
  '2-4': 'step_2_4',
  '3-1': 'step_3_1',
  '3-2': 'step_3_2',
  '3-3': 'step_3_3',
} as const;

/**
 * Get reflection area ID from workshop step
 * @param stepId - Workshop step ID (e.g., '2-2')
 * @returns Reflection area ID or null
 */
export function getReflectionAreaFromStep(stepId: string): string | null {
  return REFLECTION_AREA_MAPPINGS[stepId as keyof typeof REFLECTION_AREA_MAPPINGS] || null;
}

/**
 * Default fallback messages for different areas
 */
export const DEFAULT_FALLBACKS = {
  strength_1_reflection: 'Take time to reflect on how your primary strength manifests in your daily work and personal interactions.',
  strength_2_reflection: 'Consider how your secondary strength complements your primary strength in achieving your goals.',
  strength_3_reflection: 'Reflect on specific examples where your third strength has helped you overcome challenges.',
  strength_4_reflection: 'Think about how all four of your strengths work together to create your unique contribution.',
  team_strength_application: 'Consider how you can leverage your strengths to contribute more effectively in team settings.',
  leadership_strengths: 'Reflect on how your strengths can inform your leadership approach and influence others positively.',
  development_planning: 'Create specific action steps for continuing to develop and apply your strengths in new ways.',
} as const;