import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  icon: string;
  title: string;
  time: string;
  description: string;
  status: 'available' | 'prerequisite' | 'coming-soon';
  prerequisiteMessage?: string;
  completed?: boolean;
}

interface PersonalProfileHubProps {
  navigate?: (path: string) => void;
  setCurrentContent?: (content: string) => void;
  markStepCompleted?: (stepId: string) => Promise<void>;
}

const PersonalProfileHub: React.FC<PersonalProfileHubProps> = ({
  navigate,
  setCurrentContent,
  markStepCompleted
}) => {
  const [activityStates, setActivityStates] = useState<Record<string, boolean>>({});

  // Load activity completion states
  useEffect(() => {
    loadActivityStates();
  }, []);

  const loadActivityStates = async () => {
    try {
      const response = await fetch('/api/workshop-data/profile-activities', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setActivityStates(data.completedActivities || {});
      }
    } catch (error) {
      console.error('Error loading activity states:', error);
    }
  };

  const activities: Activity[] = [
    {
      id: 'quick-start',
      icon: '⚡',
      title: 'Quick Start Profile',
      time: '~3-5 minutes',
      description: 'A few quick questions about how you work, what interests you, and how you like to communicate. This helps us customize everything that follows.',
      status: 'available',
      completed: activityStates['quick-start']
    },
    {
      id: 'add-assessments',
      icon: '🎨',
      title: 'Add Your Assessments',
      time: '~5-7 minutes',
      description: 'Share results from personality assessments you\'ve done—MBTI, Enneagram, CliftonStrengths, DISC. Help us understand what frameworks resonate with you.',
      status: 'available',
      completed: activityStates['add-assessments']
    },
    {
      id: 'woo-assessment',
      icon: '🎯',
      title: 'How WOO Are You?',
      time: '~5 minutes',
      description: 'A fun questionnaire exploring your relationship-building style. How do you connect with new people? What energizes or drains you socially?',
      status: 'available',
      completed: activityStates['woo-assessment']
    },
    {
      id: 'personal-email',
      icon: '🔐',
      title: 'Personal Email Setup',
      time: '~2 minutes',
      description: 'Add a personal email for account recovery and private content access. Completely optional and separate from your work email.',
      status: 'available',
      completed: activityStates['personal-email']
    },
    {
      id: 'readme-generator',
      icon: '📝',
      title: 'Your ReadMe Generator',
      time: '~10 minutes',
      description: 'Create a personalized "How to Work With Me" guide for your team. We\'ll help you articulate your preferences, quirks, and what helps you thrive.',
      status: activityStates['quick-start'] ? 'available' : 'prerequisite',
      prerequisiteMessage: 'Quick Start required first',
      completed: activityStates['readme-generator']
    },
    {
      id: 'deep-dive',
      icon: '🔍',
      title: 'Deep Dive Assessments',
      time: 'Coming Soon',
      description: 'Take new personality assessments and explore frameworks in depth. Guided experiences with detailed interpretations and insights.',
      status: 'coming-soon'
    },
    {
      id: 'ai-coach',
      icon: '🤖',
      title: 'AI Coach Setup',
      time: 'Coming Soon',
      description: 'Configure your private AI coach that understands your strengths, goals, and challenges. Get personalized guidance that actually fits your style.',
      status: 'coming-soon'
    }
  ];

  const handleActivityClick = (activity: Activity) => {
    if (activity.status === 'coming-soon') return;
    if (activity.status === 'prerequisite') return;

    // Navigate to the activity
    switch (activity.id) {
      case 'quick-start':
        if (setCurrentContent) {
          setCurrentContent('quick-start-activity');
        }
        break;
      case 'add-assessments':
        if (setCurrentContent) {
          setCurrentContent('add-assessments-activity');
        }
        break;
      case 'woo-assessment':
        if (setCurrentContent) {
          setCurrentContent('woo-assessment-activity');
        }
        break;
      default:
        alert(`Activity "${activity.title}" implementation coming soon!`);
    }
  };

  const getActivityStatus = (activity: Activity) => {
    if (activity.completed) return 'Completed ✓';
    if (activity.status === 'prerequisite') return activity.prerequisiteMessage || 'Prerequisites required';
    if (activity.status === 'coming-soon') return 'In development';
    return 'Not started';
  };

  const getButtonText = (activity: Activity) => {
    if (activity.completed) return 'Review';
    if (activity.status === 'coming-soon') return 'Coming Soon';
    return 'Start';
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '20px'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-t-2xl p-10 text-center shadow-lg"
        >
          <div className="text-blue-600 text-sm font-semibold tracking-wider uppercase mb-2">
            AST Module 5-2
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Go Deeper (If You Want To)
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Optional activities to help us personalize your experience and help your team understand how you work best
          </p>
        </motion.div>

        {/* Introduction Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-t border-gray-200 p-10"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              What's this all about?
            </h2>

            <p className="text-gray-700 leading-relaxed mb-5">
              You've completed your AST workshop and discovered your strengths. This is separate—completely optional activities that let you go deeper where you're curious and skip what doesn't interest you.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg my-8">
              <h3 className="text-blue-900 font-semibold text-lg mb-3">
                Here's what these activities help us do:
              </h3>
              <ul className="space-y-2">
                <li className="text-gray-800 pl-6 relative">
                  <span className="absolute left-0 text-blue-600 font-bold">→</span>
                  <strong>Create your "ReadMe"</strong> - A guide for teammates on how you like to work and collaborate
                </li>
                <li className="text-gray-800 pl-6 relative">
                  <span className="absolute left-0 text-blue-600 font-bold">→</span>
                  <strong>Customize your content</strong> - Show you relevant examples, topics, and insights based on your interests
                </li>
                <li className="text-gray-800 pl-6 relative">
                  <span className="absolute left-0 text-blue-600 font-bold">→</span>
                  <strong>Respect your privacy</strong> - You control what's shared with your org, your team, or kept completely private
                </li>
                <li className="text-gray-800 pl-6 relative">
                  <span className="absolute left-0 text-blue-600 font-bold">→</span>
                  <strong>Future AI coaching</strong> - (Coming soon) A private coach that knows your profile and can help you grow
                </li>
              </ul>
            </div>

            <p className="text-gray-700 leading-relaxed mb-5">
              Pick and choose what interests you. Everything here is optional, and you can share things directly, anonymously, or not at all.
            </p>

            <span className="inline-block bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
              🧪 Experimental Feature
            </span>
          </div>
        </motion.div>

        {/* Activities Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white border-t border-gray-200 p-10 rounded-b-2xl"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Choose Your Activities
            </h2>
            <p className="text-lg text-gray-600">
              Start with what sounds interesting. Come back anytime to do more.
            </p>
          </div>

          <div className="grid gap-4 max-w-3xl mx-auto">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`
                  bg-gray-50 border-2 rounded-xl p-5 transition-all duration-300
                  ${activity.status === 'coming-soon'
                    ? 'opacity-60 border-gray-200'
                    : activity.status === 'prerequisite'
                    ? 'opacity-75 border-gray-300'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                  }
                `}
                onClick={() => handleActivityClick(activity)}
                style={{ minHeight: '160px' }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">{activity.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                      {activity.title}
                    </h3>
                    <span className="text-sm text-gray-600">{activity.time}</span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                  {activity.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {getActivityStatus(activity)}
                  </span>
                  <button
                    className={`
                      px-5 py-2 rounded-lg font-semibold text-sm transition-all
                      ${activity.status === 'coming-soon' || activity.status === 'prerequisite'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-lg hover:-translate-y-1'
                      }
                    `}
                    disabled={activity.status === 'coming-soon' || activity.status === 'prerequisite'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivityClick(activity);
                    }}
                  >
                    {getButtonText(activity)}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalProfileHub;
