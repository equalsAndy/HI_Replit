import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Edit, Save, Trash2, MessageCircle, FileText, Bug, Lightbulb, HelpCircle, Zap, Star } from 'lucide-react';

interface BetaTesterNote {
  id: number;
  noteContent: string;
  noteType: string;
  pageTitle: string;
  stepId?: string;
  questionContext?: string;
  createdAt: string;
  isEditing?: boolean;
}

interface BetaTesterFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedbackData: any) => void;
}

const NOTE_TYPE_ICONS = {
  general: MessageCircle,
  bug: Bug,
  improvement: Zap,
  question: HelpCircle,
  suggestion: Lightbulb
};

const NOTE_TYPE_COLORS = {
  general: 'blue',
  bug: 'red',
  improvement: 'green',
  question: 'purple',
  suggestion: 'yellow'
};

export const BetaTesterFeedbackModal: React.FC<BetaTesterFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmitFeedback,
}) => {
  // Notes management
  const [notes, setNotes] = useState<BetaTesterNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  // Feedback form state
  const [overallQuality, setOverallQuality] = useState<number>(0);
  const [authenticity, setAuthenticity] = useState<number>(0);
  const [recommendation, setRecommendation] = useState<number>(0);
  const [rose, setRose] = useState('');
  const [bud, setBud] = useState('');
  const [thorn, setThorn] = useState('');
  const [professionalApplication, setProfessionalApplication] = useState('');
  const [improvements, setImprovements] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [finalComments, setFinalComments] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<'notes' | 'feedback'>('notes');

  // Load beta tester notes when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBetaTesterNotes();
    }
  }, [isOpen]);

  const loadBetaTesterNotes = async () => {
    setLoadingNotes(true);
    try {
      const response = await fetch('/api/beta-tester/notes', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleEditNote = (noteId: number) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, isEditing: true }
        : { ...note, isEditing: false }
    ));
  };

  const handleSaveNote = async (noteId: number, newContent: string) => {
    try {
      const response = await fetch(`/api/beta-tester/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ noteContent: newContent })
      });

      if (response.ok) {
        setNotes(notes.map(note => 
          note.id === noteId 
            ? { ...note, noteContent: newContent, isEditing: false }
            : note
        ));
      }
    } catch (error) {
      console.error('Error updating note:', error);
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
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests([...interests, interest]);
    } else {
      setInterests(interests.filter(i => i !== interest));
    }
  };

  const handleSubmitFeedback = async () => {
    if (overallQuality === 0 || authenticity === 0 || recommendation === 0) {
      alert('Please complete all rating questions (1-3) before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    const feedbackData = {
      overallQuality,
      authenticity,
      recommendation,
      rose,
      bud,
      thorn,
      professionalApplication,
      improvements,
      interests,
      finalComments
    };

    try {
      await onSubmitFeedback(feedbackData);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating: React.FC<{ value: number; onChange: (value: number) => void; label: string }> = ({ 
    value, 
    onChange, 
    label 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`p-1 rounded transition-colors ${
              rating <= value 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star 
              size={24} 
              fill={rating <= value ? 'currentColor' : 'none'} 
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value === 0 ? 'Not rated' : `${value}/5`}
        </span>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                🎉 Workshop Complete - Beta Feedback
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Review your notes and share your experience with the AllStarTeams beta
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setCurrentView('notes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'notes'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📝 Your Notes ({notes.length})
            </button>
            <button
              onClick={() => setCurrentView('feedback')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'feedback'
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⭐ Final Feedback
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {currentView === 'notes' ? (
            /* Notes Review Section */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Your Beta Testing Notes</h3>
                {loadingNotes && <span className="text-sm text-gray-500">Loading...</span>}
              </div>
              
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notes saved during this session.</p>
                  <p className="text-sm mt-1">Notes you create with the purple button are saved here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => {
                    const IconComponent = NOTE_TYPE_ICONS[note.noteType] || MessageCircle;
                    const color = NOTE_TYPE_COLORS[note.noteType] || 'blue';
                    
                    return (
                      <div key={note.id} className={`border-l-4 border-${color}-500 bg-${color}-50 rounded-r-lg p-4`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className={`h-4 w-4 text-${color}-600`} />
                            <span className={`text-sm font-medium text-${color}-800 capitalize`}>
                              {note.noteType}
                            </span>
                            {note.stepId && (
                              <span className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                                Step {note.stepId}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditNote(note.id)}
                              className="p-1 hover:bg-white rounded transition-colors"
                              title="Edit note"
                            >
                              <Edit className="h-3 w-3 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 hover:bg-white rounded transition-colors"
                              title="Delete note"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        {note.questionContext && (
                          <div className="text-xs text-gray-600 mb-2 font-medium">
                            "{note.questionContext}"
                          </div>
                        )}
                        
                        {note.isEditing ? (
                          <div className="space-y-2">
                            <Textarea
                              defaultValue={note.noteContent}
                              className="min-h-[80px]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  handleSaveNote(note.id, e.currentTarget.value);
                                }
                              }}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  const textarea = e.currentTarget.parentElement?.parentElement?.querySelector('textarea');
                                  if (textarea) {
                                    handleSaveNote(note.id, textarea.value);
                                  }
                                }}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setNotes(notes.map(n => 
                                  n.id === note.id ? { ...n, isEditing: false } : n
                                ))}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className={`text-${color}-700 whitespace-pre-wrap`}>
                            {note.noteContent}
                          </p>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(note.createdAt).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Feedback Form Section */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AllStarTeams Beta Feedback Survey
                </h3>
                
                {/* Quick Ratings */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Quick Rating (1-5 scale)</h4>
                  
                  <StarRating
                    value={overallQuality}
                    onChange={setOverallQuality}
                    label="1. Overall experience quality"
                  />
                  
                  <StarRating
                    value={authenticity}
                    onChange={setAuthenticity}
                    label="2. How authentic did your Star Card and report feel?"
                  />
                  
                  <StarRating
                    value={recommendation}
                    onChange={setRecommendation}
                    label="3. How likely are you to recommend this to a colleague?"
                  />
                </div>

                {/* Rose, Bud, Thorn */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Rose, Bud, Thorn</h4>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      4. 🌹 Rose - What worked really well?
                    </label>
                    <Textarea
                      value={rose}
                      onChange={(e) => setRose(e.target.value)}
                      placeholder="Share what you loved about the experience..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      5. 🌱 Bud - What has potential but needs development?
                    </label>
                    <Textarea
                      value={bud}
                      onChange={(e) => setBud(e.target.value)}
                      placeholder="What could bloom with more work..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      6. 🌵 Thorn - What was problematic or frustrating?
                    </label>
                    <Textarea
                      value={thorn}
                      onChange={(e) => setThorn(e.target.value)}
                      placeholder="Share challenges or pain points..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Professional Application */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Professional Application</h4>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      7. How would this fit into your work? (if applicable)
                    </label>
                    <Textarea
                      value={professionalApplication}
                      onChange={(e) => setProfessionalApplication(e.target.value)}
                      placeholder="How could you use this professionally..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      8. What would you change or improve?
                    </label>
                    <Textarea
                      value={improvements}
                      onChange={(e) => setImprovements(e.target.value)}
                      placeholder="Specific suggestions for improvement..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-900 block mb-3">
                    9. Are you interested in learning more about:
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'team_workshop', label: 'Team workshop (human facilitated on whiteboard)' },
                      { id: 'ia_workshop', label: 'IA (Imaginal Agility) workshop' },
                      { id: 'both', label: 'Both' },
                      { id: 'neither', label: 'Neither' }
                    ].map((option) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Checkbox
                          id={option.id}
                          checked={interests.includes(option.id)}
                          onCheckedChange={(checked) => handleInterestChange(option.id, !!checked)}
                        />
                        <label htmlFor={option.id} className="text-sm text-gray-700 cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Comments */}
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">
                    10. Final comments - what didn't we ask that you'd like to share?
                  </label>
                  <Textarea
                    value={finalComments}
                    onChange={(e) => setFinalComments(e.target.value)}
                    placeholder="Anything else you'd like us to know..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {currentView === 'notes' 
                ? 'Review and edit your notes, then move to feedback'
                : 'Complete the survey to finish your beta testing session'
              }
            </div>
            <div className="flex gap-3">
              {currentView === 'notes' ? (
                <Button 
                  onClick={() => setCurrentView('feedback')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Continue to Feedback →
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentView('notes')}
                  >
                    ← Back to Notes
                  </Button>
                  <Button 
                    onClick={handleSubmitFeedback}
                    disabled={isSubmitting || overallQuality === 0 || authenticity === 0 || recommendation === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetaTesterFeedbackModal;