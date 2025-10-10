import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Sparkles } from 'lucide-react';

interface QuickStartProfileProps {
  onBack: () => void;
  onComplete?: () => void;
}

interface ProfileData {
  // Work style
  workStyle: string; // 'early_bird' | 'night_owl' | 'flexible'
  workEnvironment: string; // 'quiet' | 'collaborative' | 'mixed'

  // Communication
  communicationStyle: string; // 'direct' | 'thoughtful' | 'collaborative'
  meetingPreference: string; // 'love_meetings' | 'focused_work' | 'balance'

  // Interests
  primaryInterests: string[]; // Array of selected interests
  learningStyle: string; // 'visual' | 'hands_on' | 'reading' | 'discussion'

  // Personal
  personalEmail: string; // Optional personal email
  timezone: string; // User's timezone
}

const QuickStartProfile: React.FC<QuickStartProfileProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    workStyle: '',
    workEnvironment: '',
    communicationStyle: '',
    meetingPreference: '',
    primaryInterests: [],
    learningStyle: '',
    personalEmail: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const interestOptions = [
    { id: 'leadership', label: 'Leadership & Management', icon: '👔' },
    { id: 'creativity', label: 'Creative Work', icon: '🎨' },
    { id: 'technology', label: 'Technology & Innovation', icon: '💻' },
    { id: 'people', label: 'People & Relationships', icon: '🤝' },
    { id: 'strategy', label: 'Strategy & Planning', icon: '🎯' },
    { id: 'execution', label: 'Execution & Results', icon: '⚡' },
    { id: 'learning', label: 'Learning & Development', icon: '📚' },
    { id: 'wellness', label: 'Wellness & Balance', icon: '🧘' },
  ];

  const toggleInterest = (interestId: string) => {
    setProfileData(prev => ({
      ...prev,
      primaryInterests: prev.primaryInterests.includes(interestId)
        ? prev.primaryInterests.filter(id => id !== interestId)
        : [...prev.primaryInterests, interestId]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/workshop-data/quick-start-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setSaveMessage('✓ Profile saved successfully!');
        setTimeout(() => {
          if (onComplete) onComplete();
          onBack();
        }, 1000);
      } else {
        setSaveMessage('Error saving. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const canProgress = () => {
    // All questions are now optional with skip button
    return true;
  };

  const handleSkipQuestion = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, save what we have
      handleSave();
    }
  };

  const steps = [
    {
      question: "When do you do your best work?",
      field: 'workStyle',
      options: [
        { value: 'early_bird', label: 'Early Bird', description: 'I\'m most productive in the morning', icon: '🌅' },
        { value: 'night_owl', label: 'Night Owl', description: 'I hit my stride in the evening', icon: '🌙' },
        { value: 'flexible', label: 'Flexible', description: 'I adapt to what\'s needed', icon: '🔄' },
      ]
    },
    {
      question: "What work environment helps you thrive?",
      field: 'workEnvironment',
      options: [
        { value: 'quiet', label: 'Quiet & Focused', description: 'I need minimal distractions', icon: '🤫' },
        { value: 'collaborative', label: 'Collaborative', description: 'I energize around others', icon: '👥' },
        { value: 'mixed', label: 'Mix of Both', description: 'Depends on the task', icon: '⚖️' },
      ]
    },
    {
      question: "How do you prefer to communicate?",
      field: 'communicationStyle',
      options: [
        { value: 'direct', label: 'Direct & Concise', description: 'Get to the point quickly', icon: '🎯' },
        { value: 'thoughtful', label: 'Thoughtful & Detailed', description: 'Time to process and reflect', icon: '💭' },
        { value: 'collaborative', label: 'Collaborative', description: 'Talk it through together', icon: '💬' },
      ]
    },
    {
      question: "What's your relationship with meetings?",
      field: 'meetingPreference',
      options: [
        { value: 'love_meetings', label: 'Love Meetings', description: 'Great for alignment and energy', icon: '📅' },
        { value: 'focused_work', label: 'Prefer Focused Work', description: 'Meetings can be draining', icon: '🔇' },
        { value: 'balance', label: 'Balance', description: 'Right meetings at right times', icon: '⚖️' },
      ]
    },
    {
      question: "What interests you most? (Select all that apply)",
      field: 'primaryInterests',
      type: 'multi-select'
    },
    {
      question: "How do you learn best?",
      field: 'learningStyle',
      options: [
        { value: 'visual', label: 'Visual', description: 'Diagrams, videos, demonstrations', icon: '👀' },
        { value: 'hands_on', label: 'Hands-On', description: 'Practice and experimentation', icon: '🛠️' },
        { value: 'reading', label: 'Reading', description: 'Articles, books, documentation', icon: '📖' },
        { value: 'discussion', label: 'Discussion', description: 'Talking it through with others', icon: '💬' },
      ]
    },
    {
      question: "Add a personal email? (Optional)",
      field: 'personalEmail',
      type: 'email'
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-6 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Hub
          </button>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quick Start Profile
            </h1>
            <span className="text-sm text-gray-500 font-medium">
              {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {currentStepData.question}
          </h2>

          {/* Multi-select for interests */}
          {currentStepData.type === 'multi-select' && (
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((interest) => (
                <motion.button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    profileData.primaryInterests.includes(interest.id)
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{interest.icon}</span>
                    <span className="font-semibold text-gray-800">{interest.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Email input */}
          {currentStepData.type === 'email' && (
            <div>
              <p className="text-gray-600 mb-4">
                This is for account recovery and accessing private content. It's separate from your work email and completely optional.
              </p>
              <input
                type="email"
                value={profileData.personalEmail}
                onChange={(e) => setProfileData(prev => ({ ...prev, personalEmail: e.target.value }))}
                placeholder="your.personal@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
              />
              <p className="text-xs text-gray-500 mt-2">
                🔒 Your personal email is never shared with your organization
              </p>
            </div>
          )}

          {/* Regular options */}
          {!currentStepData.type && currentStepData.options && (
            <div className="space-y-3">
              {currentStepData.options.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setProfileData(prev => ({ ...prev, [currentStepData.field]: option.value }))}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                    profileData[currentStepData.field as keyof ProfileData] === option.value
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <div className="font-bold text-lg text-gray-900 mb-1">
                        {option.label}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProgress()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving || !canProgress()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Complete Profile
                  </>
                )}
              </button>
            )}
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkipQuestion}
            disabled={isSaving}
            className="w-full px-6 py-2 text-gray-500 hover:text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep < steps.length - 1 ? 'Skip this question' : 'Skip and finish'}
          </button>
        </div>

        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg text-center font-medium ${
              saveMessage.includes('Error')
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {saveMessage}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QuickStartProfile;
