import React, { useState, useEffect } from 'react';
import { X, Clock, Eye, Search, Target, RotateCcw } from 'lucide-react';
import RealityCheckExercise from './exercises/RealityCheckExercise';
import VisualDetectionExercise from './exercises/VisualDetectionExercise';
import ToolkitPracticeExercise from './exercises/ToolkitPracticeExercise';

interface DiscernmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiscernmentModal: React.FC<DiscernmentModalProps> = ({ isOpen, onClose }) => {
  const [currentExercise, setCurrentExercise] = useState(1);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const exercises = [
    {
      id: 1,
      title: "The 3-Second Reality Check",
      description: "Practice recognizing content designed to trigger immediate emotional reactions",
      icon: <Clock className="w-6 h-6" />,
      type: "reality_check"
    },
    {
      id: 2,
      title: "Visual Real vs. Fake Challenge",
      description: "Learn to spot visual manipulation and AI-generated content",
      icon: <Eye className="w-6 h-6" />,
      type: "visual_detection"
    },
    {
      id: 3,
      title: "The 5-Test Toolkit Practice",
      description: "Apply systematic discernment tests to complex scenarios",
      icon: <Search className="w-6 h-6" />,
      type: "toolkit_practice"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentExercise(1);
      setExerciseComplete(false);
      setShowSummary(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExerciseComplete = () => {
    if (currentExercise < 3) {
      setCurrentExercise(currentExercise + 1);
      setExerciseComplete(false);
    } else {
      setShowSummary(true);
    }
  };

  const handleClose = () => {
    setCurrentExercise(1);
    setExerciseComplete(false);
    setShowSummary(false);
    onClose();
  };

  const currentExerciseData = exercises[currentExercise - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {currentExerciseData.icon}
            <div>
              <h2 className="text-2xl font-semibold">Reality Discernment Practice</h2>
              <p className="text-purple-100 text-sm">{currentExerciseData.title}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-500"
            style={{ width: `${(currentExercise / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {showSummary ? (
            <SummaryScreen onClose={handleClose} />
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-purple-600 font-semibold mb-2">
                  Exercise {currentExercise} of 3
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentExerciseData.title}
                </h3>
                <p className="text-gray-600">
                  {currentExerciseData.description}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                {currentExercise === 1 && (
                  <RealityCheckExercise 
                    onComplete={handleExerciseComplete}
                  />
                )}
                {currentExercise === 2 && (
                  <VisualDetectionExercise 
                    onComplete={handleExerciseComplete}
                  />
                )}
                {currentExercise === 3 && (
                  <ToolkitPracticeExercise 
                    onComplete={handleExerciseComplete}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        {!showSummary && (
          <div className="border-t p-6 flex justify-between items-center">
            <button
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              onClick={() => currentExercise > 1 && setCurrentExercise(currentExercise - 1)}
              disabled={currentExercise === 1}
            >
              ← Previous Exercise
            </button>
            
            <div className="flex gap-2">
              {exercises.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index + 1 === currentExercise
                      ? 'bg-purple-600'
                      : index + 1 < currentExercise
                      ? 'bg-purple-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-sm text-gray-600">
              Exercise {currentExercise} of 3
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Summary Screen Component
const SummaryScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="text-center py-8">
    <div className="text-6xl mb-6">🎯</div>
    <h2 className="text-3xl font-bold text-gray-800 mb-4">
      Discernment Skills Practiced!
    </h2>
    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
      You've completed all three reality discernment exercises and learned systematic approaches to evaluating digital content in the AI era.
    </p>
    
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="bg-purple-50 p-6 rounded-lg">
        <div className="text-2xl mb-2">⏱️</div>
        <h3 className="font-semibold mb-2">3-Second Pause</h3>
        <p className="text-sm text-gray-600">
          Always pause before reacting to emotionally charged content
        </p>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg">
        <div className="text-2xl mb-2">👁️</div>
        <h3 className="font-semibold mb-2">Visual Skepticism</h3>
        <p className="text-sm text-gray-600">
          Look for inconsistencies and "too perfect" details in images
        </p>
      </div>
      <div className="bg-purple-50 p-6 rounded-lg">
        <div className="text-2xl mb-2">🔍</div>
        <h3 className="font-semibold mb-2">Systematic Analysis</h3>
        <p className="text-sm text-gray-600">
          Use the 5-test toolkit for comprehensive content evaluation
        </p>
      </div>
    </div>

    <button
      onClick={onClose}
      className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
    >
      Return to Workshop
    </button>
  </div>
);

export default DiscernmentModal;