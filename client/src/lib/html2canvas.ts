import html2canvas from 'html2canvas';

/**
 * Converts an HTML element to an image and triggers a download
 * @param element The HTML element to capture
 * @param filename The filename to save the image as
 */
export async function downloadElementAsImage(
  element: HTMLElement,
  filename: string = 'download.png'
): Promise<void> {
  try {
    // Create canvas from the element
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: false,
      letterRendering: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(element.id);
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.backfaceVisibility = 'hidden';
        }
      }
    });

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error creating image:', error);
    throw error;
  }
}