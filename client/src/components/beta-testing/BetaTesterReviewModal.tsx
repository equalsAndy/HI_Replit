import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Send, CheckCircle, Clock, MessageCircle, Bug, Lightbulb, HelpCircle, Zap, FileText, Download, UserPlus, Calendar, ArrowRight } from 'lucide-react';

interface BetaTesterNote {
  id: number;
  workshopType: 'ast' | 'ia';
  pageTitle: string;
  stepId?: string;
  moduleName?: string;
  questionContext?: string;
  noteContent: string;
  noteType?: 'general' | 'bug' | 'improvement' | 'question' | 'suggestion';
  createdAt: string;
}

interface BetaTesterReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopType?: 'ast' | 'ia';
  onComplete?: () => void;
}

const NOTE_TYPE_CONFIG = {
  general: { label: 'General', icon: MessageCircle, color: 'blue' },
  bug: { label: 'Bug', icon: Bug, color: 'red' },
  improvement: { label: 'Improvement', icon: Zap, color: 'green' },
  question: { label: 'Question', icon: HelpCircle, color: 'purple' },
  suggestion: { label: 'Suggestion', icon: Lightbulb, color: 'yellow' }
};

const NEXT_STEPS = [
  {
    title: 'Download Your Star Card',
    description: 'Get your personalized visual strengths profile',
    icon: Download,
    action: 'download-starcard',
    color: 'blue'
  },
  {
    title: 'Generate Holistic Report',
    description: 'Create your comprehensive development report',
    icon: FileText,
    action: 'generate-report',
    color: 'green'
  },
  {
    title: 'Growth Plan',
    description: 'Explore your personal development roadmap',
    icon: Calendar,
    action: 'growth-plan',
    color: 'purple'
  },
  {
    title: 'Team Workshop Prep',
    description: 'Access resources for team workshop preparation',
    icon: UserPlus,
    action: 'team-prep',
    color: 'orange'
  }
];

export const BetaTesterReviewModal: React.FC<BetaTesterReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  workshopType,
  onComplete 
}) => {
  const [notes, setNotes] = useState<BetaTesterNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<'review' | 'submitted' | 'next-steps'>('review');

  // Load user's notes when modal opens
  useEffect(() => {
    if (isOpen && !isSubmitted) {
      loadUserNotes();
    }
  }, [isOpen, workshopType]);

  const loadUserNotes = async () => {
    setIsLoading(true);
    try {
      const url = workshopType 
        ? `/api/beta-tester/notes?workshopType=${workshopType}`
        : '/api/beta-tester/notes';
        
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        console.error('Failed to load notes');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditNote = (noteId: number, currentContent: string) => {
    setEditingNote(noteId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = async (noteId: number) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/beta-tester/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          noteContent: editContent.trim()
        })
      });

      if (response.ok) {
        setNotes(notes.map(note => 
          note.id === noteId 
            ? { ...note, noteContent: editContent.trim() }
            : note
        ));
        setEditingNote(null);
        setEditContent('');
      } else {
        alert('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/beta-tester/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
      } else {
        alert('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const handleSubmitAllNotes = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/beta-tester/notes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          workshopType
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setCurrentStep('submitted');
        setTimeout(() => {
          setCurrentStep('next-steps');
        }, 2000);
      } else {
        const error = await response.json();
        console.error('Failed to submit notes:', error);
        alert('Failed to submit notes. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting notes:', error);
      alert('Failed to submit notes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStepAction = (action: string) => {
    // Navigate to different sections based on AllStarTeams content structure
    switch (action) {
      case 'download-starcard':
        // Navigate to AllStarTeams with star card content
        window.location.href = '/allstarteams#download-star-card';
        break;
      case 'generate-report':
        // Navigate to AllStarTeams with holistic report content
        window.location.href = '/allstarteams#holistic-report';
        break;
      case 'growth-plan':
        // Navigate to AllStarTeams with growth plan content
        window.location.href = '/allstarteams#growth-plan';
        break;
      case 'team-prep':
        // Navigate to AllStarTeams with team workshop prep content
        window.location.href = '/allstarteams#team-workshop-prep';
        break;
    }
    onClose();
  };

  const toggleNoteExpansion = (noteId: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const handleClose = () => {
    if (isSubmitted && onComplete) {
      onComplete();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">
              {currentStep === 'review' && '📝'}
              {currentStep === 'submitted' && '✅'}
              {currentStep === 'next-steps' && '🚀'}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {currentStep === 'review' && 'Workshop Feedback Review'}
                {currentStep === 'submitted' && 'Feedback Submitted!'}
                {currentStep === 'next-steps' && 'What\'s Next?'}
              </h2>
              <p className="text-sm opacity-90">
                {currentStep === 'review' && `Review your ${notes.length} feedback notes before submission`}
                {currentStep === 'submitted' && 'Thank you for your valuable feedback!'}
                {currentStep === 'next-steps' && 'Continue your development journey'}
              </p>
            </div>
            {workshopType && (
              <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-xs font-semibold ml-4">
                {workshopType.toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="p-6">
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your feedback notes...</p>
                  </div>
                </div>
              )}

              {/* No Notes */}
              {!isLoading && notes.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Notes</h3>
                  <p className="text-gray-600">
                    You haven't created any feedback notes during this workshop.
                  </p>
                </div>
              )}

              {/* Notes List */}
              {!isLoading && notes.length > 0 && (
                <div className="space-y-4">
                  
                  {/* Summary Header */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-purple-900">Feedback Summary</h3>
                        <p className="text-sm text-purple-700">
                          {notes.length} notes collected • Review and edit before submission
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {Object.entries(
                          notes.reduce((acc, note) => {
                            const type = note.noteType || 'general';
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([type, count]) => {
                          const config = NOTE_TYPE_CONFIG[type as keyof typeof NOTE_TYPE_CONFIG];
                          const Icon = config.icon;
                          return (
                            <div key={type} className={`flex items-center gap-1 px-2 py-1 bg-${config.color}-100 text-${config.color}-700 rounded-lg text-xs`}>
                              <Icon size={12} />
                              {count}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {notes.map((note) => {
                    const config = NOTE_TYPE_CONFIG[note.noteType || 'general'];
                    const Icon = config.icon;
                    const isExpanded = expandedNotes.has(note.id);
                    const isEditing = editingNote === note.id;
                    const isLongNote = note.noteContent.length > 150;

                    return (
                      <div key={note.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        
                        {/* Note Header */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 bg-${config.color}-100 rounded-lg flex items-center justify-center`}>
                                <Icon size={14} className={`text-${config.color}-600`} />
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 bg-${config.color}-50 text-${config.color}-700 rounded`}>
                                {config.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditNote(note.id, note.noteContent)}
                                className="w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                                title="Edit note"
                              >
                                <Edit3 size={14} className="text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="w-8 h-8 bg-gray-50 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors group"
                                title="Delete note"
                              >
                                <Trash2 size={14} className="text-gray-600 group-hover:text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Note Content */}
                        <div className="p-4">
                          {isEditing ? (
                            <div className="space-y-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-vertical"
                                placeholder="Edit your note..."
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(note.id)}
                                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNote(null);
                                    setEditContent('');
                                  }}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                                {isLongNote && !isExpanded 
                                  ? `${note.noteContent.substring(0, 150)}...`
                                  : note.noteContent
                                }
                              </p>
                              {isLongNote && (
                                <button
                                  onClick={() => toggleNoteExpansion(note.id)}
                                  className="text-purple-600 hover:text-purple-700 text-xs font-medium mt-2"
                                >
                                  {isExpanded ? 'Show Less' : 'Show More'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submitted Step */}
          {currentStep === 'submitted' && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6">
                  <CheckCircle size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Feedback Submitted Successfully!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Thank you for your valuable insights. Your feedback helps us improve the workshop experience for everyone.
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Clock size={16} />
                  <span className="text-sm">Preparing next steps...</span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {currentStep === 'next-steps' && (
            <div className="p-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Complete the Feedback Review</h3>
                <p className="text-gray-600">
                  After submitting your feedback notes, explore these additional features and resources:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {NEXT_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.action}
                      onClick={() => handleNextStepAction(step.action)}
                      className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-${step.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon size={20} className={`text-${step.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-900 transition-colors">
                            {step.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium group-hover:gap-3 transition-all">
                            Get Started <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  The purple feedback button remains available for additional feedback in any of these areas.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show during review step */}
        {currentStep === 'review' && !isLoading && notes.length > 0 && (
          <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Review your notes and submit when ready
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAllNotes}
                disabled={isSubmitting || notes.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Feedback ({notes.length} notes)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};