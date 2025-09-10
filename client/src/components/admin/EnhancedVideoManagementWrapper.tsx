import React, { lazy, Suspense } from 'react';
import { ENABLE_ENHANCED_VIDEO } from '@/lib/flags';

const LazyEnhancedVideoManagement = lazy(() => import('./EnhancedVideoManagement'));

export function EnhancedVideoManagementWrapper() {
  if (!ENABLE_ENHANCED_VIDEO) return null;

  return (
    <Suspense fallback={null}>
      <LazyEnhancedVideoManagement />
    </Suspense>
  );
}

