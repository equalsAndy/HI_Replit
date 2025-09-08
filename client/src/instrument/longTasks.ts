/**
 * Install a PerformanceObserver for long tasks (>50ms) to aid in debugging.
 * Logs entries to console with a warning.
 */
export function observeLongTasks(appName: string = 'APP') {
  if (typeof PerformanceObserver !== 'function') return;
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 50) {
        console.warn(
          `[${appName}] Long task: ${entry.name} took ${entry.duration.toFixed(2)}ms`
        );
      }
    });
  });
  observer.observe({ entryTypes: ['longtask'] });
}
