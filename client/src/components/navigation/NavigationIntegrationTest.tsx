// Quick integration test for the unified navigation system
import { useUnifiedWorkshopNavigation } from '@/hooks/useUnifiedWorkshopNavigation';
import React from 'react';

export function NavigationIntegrationTest() {
  const navigation = useUnifiedWorkshopNavigation('ast');
  
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-semibold mb-2">🧪 Navigation Integration Test</h3>
      <div className="text-sm space-y-1">
        <div><strong>Current Step:</strong> {navigation.currentStep}</div>
        <div><strong>Next Step:</strong> {navigation.nextStep}</div>
        <div><strong>Completed:</strong> {navigation.completedSteps.length} steps</div>
        <div><strong>Visible:</strong> {navigation.visibleSteps.length} steps</div>
        <div><strong>Workshop Completed:</strong> {navigation.isWorkshopCompleted() ? 'Yes' : 'No'}</div>
      </div>
      
      <div className="mt-4 space-x-2">
        <button 
          onClick={() => navigation.completeStep(navigation.currentStep)}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
        >
          Complete Current
        </button>
        <button 
          onClick={() => navigation.goToNextStep()}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Complete & Next
        </button>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Steps Status:</h4>
        <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
          {navigation.visibleSteps.slice(0, 10).map(stepId => {
            const state = navigation.getStepVisualState(stepId);
            return (
              <div key={stepId} className="flex items-center space-x-2">
                <span className="w-8">{stepId}</span>
                {state.showGreenCheckmark && <span className="text-green-600">✓</span>}
                {state.showRoundedHighlight && <span className="text-purple-600">◆</span>}
                {state.showDarkDot && <span className="text-blue-600">●</span>}
                {state.showPulsatingDot && <span className="text-blue-600 animate-pulse">●</span>}
                {state.isLocked && <span className="text-gray-400">🔒</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
