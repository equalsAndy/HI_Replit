export async function downloadElementAsImage(element: HTMLElement, filename: string = 'download.png'): Promise<void> {
  try {
    // Dynamic import of html2canvas to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default;

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // High resolution
      useCORS: true,
      allowTaint: true,
      imageTimeout: 15000,
      removeContainer: true
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

  } catch (error) {
    console.error('Error capturing element as image:', error);
    throw error;
  }
}

export async function captureElementAsBase64(element: HTMLElement): Promise<string> {
  try {
    // Dynamic import of html2canvas to avoid SSR issues
    const html2canvas = (await import('html2canvas')).default;

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // High resolution
      useCORS: true,
      allowTaint: true,
      imageTimeout: 15000,
      removeContainer: true
    });

    // Convert canvas to base64 data URL
    return canvas.toDataURL('image/png');

  } catch (error) {
    console.error('Error capturing element as base64:', error);
    throw error;
  }
}

