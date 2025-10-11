import React, { useState } from 'react';
import { MessageCircle } from "lucide-react";
import CoachingModal from '../coaching/CoachingModal';

export default function TestCoachingButton() {
  const [showCoaching, setShowCoaching] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Coaching Test</h2>
      
      <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
        <button
          onClick={() => setShowCoaching(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-lg font-bold"
        >
          <MessageCircle size={20} />
          Open Coaching Modal
        </button>
        <p className="text-sm mt-2 text-gray-600">Click this button to test the coaching modal!</p>
      </div>

      {/* Coaching Modal */}
      <CoachingModal
        isOpen={showCoaching}
        onClose={() => setShowCoaching(false)}
        currentStep={1}
        currentStrength="thinking"
      />
    </div>
  );
}
