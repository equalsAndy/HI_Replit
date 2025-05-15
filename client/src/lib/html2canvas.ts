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
    // Apply temporary styles for better rendering
    const originalStyle = element.getAttribute('style') || '';
    
    // Clear any temporary scaling that might affect rendering
    element.style.transform = 'none';
    element.style.transition = 'none';
    
    // Force better font rendering for the snapshot
    document.body.style.webkitFontSmoothing = 'antialiased';
    document.body.style.mozOsxFontSmoothing = 'grayscale';
    
    // Wait for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create canvas from the element with higher resolution
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 3, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      logging: false, // Disable logging in production
      imageTimeout: 15000, // Longer timeout for images
      width: element.offsetWidth,
      height: element.offsetHeight,
      removeContainer: true, // Clean up the cloned DOM elements
      foreignObjectRendering: false, // More compatible rendering
      ignoreElements: (node) => {
        // Ignore elements that might cause issues
        return node.nodeName === 'BUTTON';
      },
      onclone: (documentClone, _) => {
        // Enhance text rendering in the clone
        const style = documentClone.createElement('style');
        style.innerHTML = `
          * {
            text-rendering: optimizeLegibility !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }
        `;
        documentClone.head.appendChild(style);
      }
    });

    // Convert canvas to data URL with high quality
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Restore original styles
    element.setAttribute('style', originalStyle);
    document.body.style.webkitFontSmoothing = '';
    document.body.style.mozOsxFontSmoothing = '';
    
  } catch (error) {
    console.error('Error creating image:', error);
    throw error;
  }
}