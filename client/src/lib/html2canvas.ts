import html2canvas from 'html2canvas';

export async function downloadElementAsImage(
  elementId: string,
  filename: string = 'download.png'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true
    });

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}
