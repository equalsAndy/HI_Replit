
import { useCallback } from 'react';
import { downloadElementAsImage } from '@/lib/html2canvas';

export function useScreenshot() {
  const takeScreenshot = useCallback(async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      try {
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
