
import { useCallback } from 'react';

export function useScreenshot() {
  const takeScreenshot = useCallback(async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        // Dynamically import html2canvas functionality
        const { downloadElementAsImage } = await import('@/lib/html2canvas');
        await downloadElementAsImage(element, filename);
        return true;
      } catch (error) {
        console.error('Error taking screenshot:', error);
        return false;
      }
    }
    return false;
  }, []);

  return { takeScreenshot };
}
