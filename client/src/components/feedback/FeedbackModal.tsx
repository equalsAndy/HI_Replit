import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTestUser } from '../../hooks/useTestUser';

interface SystemInfo {
  browser: string;
  os: string;
  screen: string;
  viewport: string;
  userAgent: string;
  timestamp: string;
  timezone: string;
}

interface PageData {
  title: string;
  workshop: 'ast' | 'ia';
  workshopName: string;
  module?: string;
  url: string;
}

interface FeedbackData {
  pageContext: 'current' | 'other' | 'general';
  targetPage: string;
  feedbackType: 'bug' | 'feature' | 'content' | 'general';
  message: string;
  experienceRating: number;
  priority: 'low' | 'medium' | 'high' | 'blocker';
  pageData: PageData;
  systemInfo: SystemInfo;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PageData;
}

// Workshop page options based on the prompt requirements
const WORKSHOP_PAGES = {
  ast: {
    'Module 1: Self-Awareness': [
      { value: 'strengths-discovery', label: 'Strengths Discovery' },
      { value: 'flow-assessment', label: 'Flow Assessment' },
      { value: 'future-self', label: 'Future Self Vision' },
      { value: 'vision-board', label: 'Vision Board' },
    ],
    'Module 2: Team Practice': [
      { value: 'team-fusion', label: 'Team Fusion' },
      { value: 'team-vision', label: 'Team Vision' },
      { value: 'challenge-reframing', label: 'Challenge Reframing' },
    ],
    'Post-Workshop': [
      { value: 'growth-plan', label: 'Growth Plan' },
      { value: 'progress-tracking', label: 'Progress Tracking' },
    ],
  },
  ia: {
    'Module 1: Introduction': [
      { value: 'ia-intro', label: 'Introduction to IA' },
      { value: 'ia-vision', label: 'Vision Setting' },
    ],
    'Module 2: Practice': [
      { value: 'ia-current-state', label: 'Current State Assessment' },
      { value: 'ia-reflection', label: 'Reflection Exercises' },
    ],
    'Post-Workshop': [
      { value: 'ia-outcomes', label: 'Outcomes & Benefits' },
    ],
  },
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, currentPage }) => {
  const { isTestUser, user } = useTestUser();
  const SCHEDULING_URL = import.meta.env.VITE_SCHEDULING_URL || '#';
  const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@heliotrope.ai';
  const [formData, setFormData] = useState<Partial<FeedbackData>>({
    pageContext: 'current',
    feedbackType: 'bug',
    message: '',
    experienceRating: 3,
    priority: 'low',
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if user is admin (admins are also considered test users for priority level)
  const isAdminOrTestUser = isTestUser || user?.role === 'admin';

  // Auto-detect system information
  useEffect(() => {
    if (isOpen) {
      setSystemInfo(getSystemInfo());
    }
  }, [isOpen]);

  function getSystemInfo(): SystemInfo {
    const userAgent = navigator.userAgent;
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      const version = userAgent.match(/Chrome\/(\d+)/);
      browser = `Chrome ${version ? version[1] : ''}`;
    } else if (userAgent.includes('Firefox')) {
      const version = userAgent.match(/Firefox\/(\d+)/);
      browser = `Firefox ${version ? version[1] : ''}`;
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const version = userAgent.match(/Version\/(\d+)/);
      browser = `Safari ${version ? version[1] : ''}`;
    } else if (userAgent.includes('Edg')) {
      const version = userAgent.match(/Edg\/(\d+)/);
      browser = `Edge ${version ? version[1] : ''}`;
    }

    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (userAgent.includes('Windows NT')) os = 'Windows';
    else if (userAgent.includes('Mac OS X')) {
      const version = userAgent.match(/Mac OS X (\d+_\d+)/);
      if (version) {
        const versionNum = version[1].replace('_', '.');
        os = `macOS ${versionNum}`;
      } else {
        os = 'macOS';
      }
    }
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('iPhone')) os = 'iOS';
    else if (userAgent.includes('Android')) os = 'Android';

    // Screen size
    const screen = `${window.screen.width}×${window.screen.height}`;
    
    // Viewport size
    const viewport = `${window.innerWidth}×${window.innerHeight}`;

    return {
      browser,
      os,
      screen,
      viewport,
      userAgent,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  const handleSubmit = async () => {
    if (!formData.message?.trim() || !systemInfo) return;

    setIsSubmitting(true);
    
    const submissionData: FeedbackData = {
      pageContext: formData.pageContext!,
      targetPage: formData.pageContext === 'current' 
        ? currentPage.title 
        : formData.pageContext === 'other' 
          ? formData.targetPage || '' 
          : 'general',
      feedbackType: formData.feedbackType!,
      message: formData.message,
      experienceRating: formData.experienceRating!,
      priority: formData.priority!,
      pageData: currentPage,
      systemInfo,
    };

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setShowSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          onClose();
          setShowSuccess(false);
          setFormData({
            pageContext: 'current',
            feedbackType: 'bug',
            message: '',
            experienceRating: 3,
            priority: 'low',
          });
        }, 2000);
      } else {
        console.error('Failed to submit feedback');
        // Handle error (could show error message)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Handle error (could show error message)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setShowSuccess(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-lg">
              💬
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Share Your Feedback{' '}
                <span className="bg-white bg-opacity-20 text-white px-2 py-0.5 rounded text-xs font-semibold ml-2">
                  {currentPage.workshop.toUpperCase()}
                </span>
              </h2>
              <p className="text-sm opacity-90">
                Help us improve your {currentPage.workshopName} workshop experience
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {showSuccess ? (
          /* Success State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl mb-5">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for your feedback!</h3>
            <p className="text-sm text-gray-600 mb-4 max-w-md">
              We appreciate your help improving {currentPage.workshopName}. If you’d like, you can schedule time with us to share more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a
                href={SCHEDULING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Schedule Time
              </a>
              <a
                href="/allstarteams"
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-800 bg-white hover:bg-gray-50 px-5 py-2 rounded-lg font-medium transition-colors"
              >
                More about AllStarTeams
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Want to restart the workshop? Email us at <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <div className="mt-6">
              <button
                onClick={handleClose}
                className="text-sm text-gray-700 hover:text-gray-900 underline"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Hidden system info - still collected for submission but not displayed */}
              {systemInfo && (
                <div className="hidden">
                  Technical Information: Browser: {systemInfo.browser}, OS: {systemInfo.os}, Screen: {systemInfo.screen}, Workshop: {currentPage.workshopName} ({currentPage.workshop.toUpperCase()})
                </div>
              )}

              {/* Feedback Type */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">What type of feedback?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'bug', emoji: '🐛', label: 'Bug Report', desc: "Something isn't working" },
                    { value: 'feature', emoji: '💡', label: 'Feature Request', desc: 'Suggest an improvement' },
                    { value: 'content', emoji: '📝', label: 'Content Issue', desc: 'Unclear or incorrect content' },
                    { value: 'general', emoji: '💬', label: 'General Feedback', desc: 'Other thoughts or suggestions' },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.feedbackType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedbackType"
                        value={type.value}
                        checked={formData.feedbackType === type.value}
                        onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value as any })}
                        className="w-4 h-4 text-blue-500 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {type.emoji} {type.label}
                        </div>
                        <div className="text-xs text-gray-500">{type.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tell us more</h3>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your feedback in detail..."
                  className="w-full min-h-[120px] p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-vertical bg-white text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Experience Rating */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  How would you rate your experience so far?
                </h3>
                <div className="flex justify-center gap-2">
                  {[
                    { value: 1, emoji: '😞', label: 'Poor' },
                    { value: 2, emoji: '😕', label: 'Fair' },
                    { value: 3, emoji: '😐', label: 'Good' },
                    { value: 4, emoji: '😊', label: 'Great' },
                    { value: 5, emoji: '🤩', label: 'Excellent' },
                  ].map((rating) => (
                    <button
                      key={rating.value}
                      onClick={() => setFormData({ ...formData, experienceRating: rating.value })}
                      className={`flex flex-col items-center p-2 rounded-full transition-all ${
                        formData.experienceRating === rating.value
                          ? 'scale-110 ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:scale-105'
                      }`}
                    >
                      <div className="text-2xl mb-1">{rating.emoji}</div>
                      <div className={`text-xs font-medium ${
                        formData.experienceRating === rating.value ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {rating.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Level - Only visible to test users and admins */}
              {isAdminOrTestUser && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority Level</h3>
                  <div className="flex gap-2">
                    {[
                      { value: 'low', label: 'Low', color: 'green' },
                      { value: 'medium', label: 'Medium', color: 'orange' },
                      { value: 'high', label: 'High', color: 'red' },
                      { value: 'blocker', label: 'Blocker', color: 'gray' },
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() => setFormData({ ...formData, priority: priority.value as any })}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                          formData.priority === priority.value
                            ? priority.color === 'green'
                              ? 'bg-green-100 text-green-800 border-2 border-green-500'
                              : priority.color === 'orange'
                              ? 'bg-orange-100 text-orange-800 border-2 border-orange-500'
                              : priority.color === 'red'
                              ? 'bg-red-100 text-red-800 border-2 border-red-500'
                              : 'bg-gray-100 text-gray-800 border-2 border-gray-500'
                            : priority.color === 'green'
                            ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:border-green-300'
                            : priority.color === 'orange'
                            ? 'bg-orange-50 text-orange-700 border-2 border-orange-200 hover:border-orange-300'
                            : priority.color === 'red'
                            ? 'bg-red-50 text-red-700 border-2 border-red-200 hover:border-red-300'
                            : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-5 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Your feedback helps improve the workshop
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.message?.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
