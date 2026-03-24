import React from 'react';

interface Props {
  onNext?: (nextStepId: string) => void;
}

export default function PM_5_3_IndividualVsTeamSetup({ onNext }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-teal-50 border-l-4 border-teal-600 p-4 mb-6 rounded-r-lg">
        <p className="text-teal-800 text-sm font-medium">Module 5 · Your Toolkit</p>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Individual vs Team Setup</h1>
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
        <p className="text-lg mb-2">Content coming soon</p>
        <p className="text-sm">Step pm-5-3</p>
      </div>
      {onNext && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onNext('pm-5-4')}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
