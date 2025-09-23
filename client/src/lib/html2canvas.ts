export async function downloadElementAsImage(_el: HTMLElement, _filename?: string): Promise<void> {
  // Test-friendly no-op. In app, this is implemented with html2canvas/dom-to-image.
  return Promise.resolve();
}

