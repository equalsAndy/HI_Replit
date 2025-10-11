import React, { useState, useEffect } from 'react';
import { X, Save, MessageCircle, FileText, Bug, Lightbulb, HelpCircle, Zap } from 'lucide-react';
import { detectCurrentPage } from '../../utils/pageContext';
import { useStepContextSafe } from '../../contexts/StepContext';
import { useNavigationProgress } from '../../hooks/use-navigation-progress';

interface PageContext {
  title: string;
  workshop: 'ast' | 'ia';
  workshopName: string;
  module?: string;
  url: string;
  stepId?: string;
  questionContext?: string;
}

interface SystemInfo {
  browser: string;
  os: string;
  screen: string;
  viewport: string;
  userAgent: string;
  timestamp: string;
  timezone: string;
}

interface BetaTesterNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTE_TYPES = [
  { value: 'general', label: 'General Note', icon: MessageCircle, color: 'blue', desc: 'General feedback or observation' },
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'red', desc: 'Something isn\'t working correctly' },
  { value: 'improvement', label: 'Improvement', icon: Zap, color: 'green', desc: 'Suggestion for enhancement' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'purple', desc: 'Need clarification or help' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'yellow', desc: 'New feature or content idea' }
];

export const BetaTesterNotesModal: React.FC<BetaTesterNotesModalProps> = ({ isOpen, onClose }) => {
  const { currentStepId: stepContextId } = useStepContextSafe();
  const { progress: navProgress } = useNavigationProgress('ast');
  
  // Get current step ID from multiple sources with URL fallback
  const getStepIdFromUrl = (): string | undefined => {
    const url = window.location.pathname;
    const match = url.match(/\/(\d+-\d+|ia-\d+-\d+)/);
    return match ? match[1] : undefined;
  };
  
  const currentStepId = navProgress?.currentStepId || stepContextId || getStepIdFromUrl();
  
  // Debug modal state and step detection
  useEffect(() => {
    console.log('🔍 BetaTesterNotesModal render - isOpen:', isOpen);
    console.log('🔍 Step detection:', {
      stepContextId,
      navProgressCurrentStep: navProgress?.currentStepId,
      finalCurrentStepId: currentStepId,
      currentUrl: window.location.pathname,
      urlStepId: getStepIdFromUrl()
    });
  }, [isOpen, stepContextId, navProgress?.currentStepId, currentStepId]);
  
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<string>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // Track current URL for dependency
  const [currentUrl, setCurrentUrl] = useState(window.location.pathname);
  
  // Capture context when modal opens OR when step changes
  useEffect(() => {
    if (isOpen) {
      const updateContext = () => {
        const urlStepId = getStepIdFromUrl();
        const effectiveStepId = currentStepId || urlStepId;
        // Reduced logging to prevent console spam
        // console.log('🔄 Updating context for step:', effectiveStepId, 'URL:', window.location.pathname, 'URL changed:', currentUrl !== window.location.pathname);
        
        // Get current page context using effective step ID
        const context = detectCurrentPage(effectiveStepId || undefined);
        
        // Enhanced context with additional details
        const enhancedContext: PageContext = {
          ...context,
          stepId: effectiveStepId || undefined,
          url: window.location.pathname + window.location.search,
          questionContext: captureQuestionContext()
        };
        
        // Only update context if it actually changed to prevent form resets
        const contextChanged = !pageContext || 
          pageContext.stepId !== enhancedContext.stepId || 
          pageContext.url !== enhancedContext.url;
        
        if (contextChanged) {
          // console.log('📝 Context actually changed, updating...');
          setPageContext(enhancedContext);
          setSystemInfo(getSystemInfo());
          
          // Update URL tracking
          setCurrentUrl(window.location.pathname);
          
          // Only reset form when first opening, not when step changes
          if (!pageContext) {
            setNoteContent('');
            setNoteType('general');
            setShowSuccess(false);
          }
        } else {
          // console.log('🚫 Context unchanged, skipping update to preserve form data');
        }
      };

      // Update context immediately
      updateContext();

      // Listen for URL changes to force context updates
      const handleUrlChange = () => {
        // console.log('🔄 URL changed, forcing context update');
        setTimeout(updateContext, 100); // Small delay to let step detection update
      };

      // Removed interval-based checking as it was causing form reset loops

      // Listen for both popstate and navigation
      window.addEventListener('popstate', handleUrlChange);
      
      // Also listen for programmatic navigation changes
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        handleUrlChange();
      };
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        handleUrlChange();
      };

      // Cleanup listeners
      return () => {
        window.removeEventListener('popstate', handleUrlChange);
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
      };
    }
  }, [isOpen, currentStepId]); // This should re-run when currentStepId changes

  // Reset form when modal opens (ready for new note)
  useEffect(() => {
    if (isOpen) {
      // Always reset form when opening modal
      setNoteContent('');
      setNoteType('general');
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Capture question context from current page with strict filtering
  const captureQuestionContext = (): string | undefined => {
    try {
      // Count form inputs and textareas to detect multi-question pages
      const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea, select');
      const textAreas = document.querySelectorAll('textarea');
      
      console.log('🔍 Form detection:', {
        formInputs: formInputs.length,
        textAreas: textAreas.length,
        hasMultipleInputs: formInputs.length > 1
      });
      
      // If there are multiple form inputs, don't show question context
      if (formInputs.length > 1 || textAreas.length > 1) {
        // console.log('🚫 Multiple inputs detected - skipping question context');
        return undefined;
      }
      
      const contextTexts: string[] = [];
      
      // Look for clear question prompts only - be very selective
      const questionSelectors = [
        'h1:not([class*="nav"]):not([class*="header"])',
        'h2:not([class*="nav"]):not([class*="header"])',
        'h3:not([class*="nav"]):not([class*="header"])',
        '.question-prompt',
        '.instruction-text',
        'label[for]:not([for*="type"]):not([for*="agree"])'
      ];
      
      questionSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (!text || text.length < 10 || text.length > 200) return;
          
          // Filter out user input by checking if text appears in any form fields
          let isUserInput = false;
          formInputs.forEach(input => {
            const inputValue = (input as HTMLInputElement | HTMLTextAreaElement).value;
            if (inputValue && inputValue.length > 5 && text.includes(inputValue)) {
              isUserInput = true;
            }
          });
          
          if (isUserInput) {
            // Commented out to reduce console spam on every keystroke
            // console.log('🚫 Filtered out user input:', text.substring(0, 50));
            return;
          }
          
          // Filter out navigation and generic text
          const badPatterns = [
            /^(next|previous|back|continue|submit|save|cancel|home|workshop|menu)$/i,
            /discover your star|identify your flow|visualize your potential/i,
            /allstarteams|heliotrope|workshop/i,
            /click|button|here|there/i,
            /^\d+\.\s*\d+/,  // Version numbers
            /^\d+\s*(of|\/)\s*\d+/,  // Page numbers
          ];
          
          const isBadText = badPatterns.some(pattern => pattern.test(text));
          if (isBadText) return;
          
          // Only include if it's clearly a question or instruction
          const isGoodQuestion = text.includes('?') ||
                               text.toLowerCase().startsWith('how ') ||
                               text.toLowerCase().startsWith('what ') ||
                               text.toLowerCase().startsWith('why ') ||
                               text.toLowerCase().startsWith('when ') ||
                               text.toLowerCase().startsWith('describe ') ||
                               text.toLowerCase().startsWith('tell ') ||
                               text.toLowerCase().startsWith('think about') ||
                               text.toLowerCase().includes('reflect on');
          
          if (isGoodQuestion && !contextTexts.includes(text)) {
            contextTexts.push(text);
          }
        });
      });
      
      // Only return if we found exactly one clear question
      if (contextTexts.length === 1) {
        // Reduced logging to prevent console spam
        // console.log('✅ Found single question context:', contextTexts[0]);
        return contextTexts[0];
      } else if (contextTexts.length > 1) {
        // console.log('🚫 Multiple questions detected - skipping context');
        return undefined;
      } else {
        // console.log('ℹ️ No clear question context found');
        return undefined;
      }
    } catch (error) {
      console.warn('Could not capture question context:', error);
      return undefined;
    }
  };

  // Get system information
  const getSystemInfo = (): SystemInfo => {
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

    return {
      browser,
      os,
      screen: `${window.screen.width}×${window.screen.height}`,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      userAgent,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  };

  const handleSave = async () => {
    if (!noteContent.trim() || !pageContext) return;

    setIsSaving(true);
    
    try {
      const response = await fetch('/api/beta-tester/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          workshopType: pageContext.workshop,
          pageTitle: pageContext.title,
          stepId: pageContext.stepId,
          moduleName: pageContext.module,
          questionContext: null, // Context hidden from user interface
          urlPath: pageContext.url,
          noteContent: noteContent.trim(),
          noteType,
          browserInfo: systemInfo,
          systemInfo
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        // Clear the form after successful save
        setNoteContent('');
        setNoteType('general');
        setTimeout(() => {
          setShowSuccess(false); // Reset success state
          onClose();
        }, 1500);
      } else {
        const error = await response.json();
        console.error('Failed to save note:', error);
        alert('Failed to save note. Please try again.');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
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
  }, [isOpen, isSaving]);

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
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-lg">
              📝
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Beta Tester Notes{' '}
                <span className="bg-white bg-opacity-20 text-white px-2 py-0.5 rounded text-xs font-semibold ml-2">
                  {pageContext?.workshop.toUpperCase()}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Note Saved!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your feedback note has been saved. You can review and edit all your notes when you complete the workshop.
            </p>
          </div>
        ) : (
          <>
            {/* Current Step Display */}
            {pageContext && (
              <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-purple-600 font-semibold text-sm shadow-sm">
                    {pageContext.stepId || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {pageContext.title}
                    </div>
                    {pageContext.module && (
                      <div className="text-xs text-gray-600 mt-0.5">
                        {pageContext.module}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">


              {/* Note Type */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Note Type</h3>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white text-gray-900"
                >
                  {NOTE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note Content */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Note</h3>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Describe what you're thinking, what you noticed, or what could be improved..."
                  className="w-full min-h-[180px] p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-vertical bg-white text-gray-900 placeholder-gray-500"
                  rows={8}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-5 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Notes are saved for workshop completion review
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !noteContent.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};