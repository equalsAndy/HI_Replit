import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';

interface BetaNote {
  id: number;
  content: string;
  pageContext: string;
  timestamp: string;
}

interface FeedbackFormData {
  // Quick Rating (1-5 scale)
  overallExperience: string;
  authenticityRating: string;
  recommendationLikelihood: string;
  
  // Rose, Bud, Thorn
  rose: string;
  bud: string;
  thorn: string;
  
  // Professional Application
  workFit: string;
  improvements: string;
  
  // Interest checkboxes
  interestedInTeamWorkshop: boolean;
  interestedInIA: boolean;
  interestedInBoth: boolean;
  interestedInNeither: boolean;
  
  // Final comments
  finalComments: string;
}

interface BetaFeedbackSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaFeedbackSurveyModal: React.FC<BetaFeedbackSurveyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FeedbackFormData>({
    overallExperience: '',
    authenticityRating: '',
    recommendationLikelihood: '',
    rose: '',
    bud: '',
    thorn: '',
    workFit: '',
    improvements: '',
    interestedInTeamWorkshop: false,
    interestedInIA: false,
    interestedInBoth: false,
    interestedInNeither: false,
    finalComments: ''
  });

  // Restore form data from localStorage on component mount
  useEffect(() => {
    if (isOpen) {
      const savedFormData = localStorage.getItem('betaFeedbackSurveyModal');
      if (savedFormData) {
        try {
          const parsed = JSON.parse(savedFormData);
          setFormData(parsed);
          console.log('✅ Restored form data from localStorage');
        } catch (error) {
          console.error('Error parsing saved form data:', error);
          localStorage.removeItem('betaFeedbackSurveyModal');
        }
      }
    }
  }, [isOpen]);

  // Debounced autosave function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: FeedbackFormData) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            localStorage.setItem('betaFeedbackSurveyModal', JSON.stringify(data));
            console.log('💾 Form data autosaved to localStorage');
          } catch (error) {
            console.error('Error saving form data:', error);
          }
        }, 1000); // 1 second debounce
      };
    })(),
    []
  );

  // Autosave effect - triggered whenever form data changes
  useEffect(() => {
    if (isOpen) {
      const hasContent = Object.values(formData).some(value => 
        typeof value === 'string' ? value.trim() !== '' : value === true
      );
      
      if (hasContent) {
        debouncedSave(formData);
      }
    }
  }, [formData, debouncedSave, isOpen]);

  // Fetch beta tester notes
  const { data: notes = [], isLoading: notesLoading, error: notesError } = useQuery<BetaNote[]>({
    queryKey: ['/api/beta-tester-notes/my-notes'],
    queryFn: async () => {
      console.log('🔍 Fetching beta tester notes for user:', user?.username, 'isBetaTester:', user?.isBetaTester);
      
      // Use the /notes endpoint with includeSubmitted=true to get all notes
      const response = await fetch('/api/beta-tester-notes/notes?includeSubmitted=true', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error('❌ Failed to fetch notes, status:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      console.log('📝 Raw fetched data:', data);
      
      // Map the server response to the expected BetaNote format
      const mappedNotes = (data.notes || []).map((note: any) => ({
        id: note.id,
        content: note.noteContent,
        pageContext: note.pageTitle,
        timestamp: note.createdAt
      }));
      
      console.log('📝 Mapped notes:', mappedNotes.length, 'notes');
      return mappedNotes;
    },
    enabled: !!user?.isBetaTester && isOpen,
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/beta-tester-notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/beta-tester-notes/my-notes'] });
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: number; content: string }) => {
      const response = await fetch(`/api/beta-tester-notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Failed to update note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/beta-tester-notes/my-notes'] });
      setEditingNote(null);
      setEditContent('');
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: FeedbackFormData) => {
      // Map frontend field names to backend field names
      const mappedFeedback = {
        overallQuality: feedback.overallExperience,
        authenticity: feedback.authenticityRating,
        recommendation: feedback.recommendationLikelihood,
        rose: feedback.rose,
        bud: feedback.bud,
        thorn: feedback.thorn,
        professionalApplication: feedback.workFit,
        improvements: feedback.improvements,
        interests: [
          feedback.interestedInTeamWorkshop ? 'Team Workshop' : null,
          feedback.interestedInIA ? 'Imaginal Agility' : null,
          feedback.interestedInBoth ? 'Both Workshops' : null,
          feedback.interestedInNeither ? 'Neither' : null
        ].filter(Boolean).join(', '),
        finalComments: feedback.finalComments
      };

      const response = await fetch('/api/beta-tester-notes/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(mappedFeedback)
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      // Clear saved form data from localStorage
      localStorage.removeItem('betaFeedbackSurveyModal');
      console.log('🗑️ Cleared autosaved form data after successful submission');
      
      // Show success message and close modal
      alert('Thank you for your feedback! Your input is invaluable for improving AllStarTeams.');
      onClose();
    }
  });

  const handleEditNote = (noteId: number, currentContent: string) => {
    setEditingNote(noteId);
    setEditContent(currentContent);
  };

  const handleSaveNote = () => {
    if (editingNote && editContent.trim()) {
      updateNoteMutation.mutate({ noteId: editingNote, content: editContent.trim() });
    }
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const handleInterestChange = (field: keyof Pick<FeedbackFormData, 'interestedInTeamWorkshop' | 'interestedInIA' | 'interestedInBoth' | 'interestedInNeither'>, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await submitFeedbackMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = formData.overallExperience && formData.authenticityRating && formData.recommendationLikelihood;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="text-white p-6 text-center flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 flex items-center justify-center p-2"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px'
                }}
              >
                <img 
                  src={AllStarTeamsLogo} 
                  alt="AllStarTeams" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold">AllStarTeams Beta Feedback Survey</h2>
                <p className="text-sm opacity-90">Thank you for testing the AllStarTeams workshop experience!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* Notes Review Section */}
              <div 
                className="mb-8 p-5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderLeft: '4px solid #667eea'
                }}
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Review Your Notes</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Here are the notes you took during the workshop. You can edit or delete any of them.
                </p>
                
                {notesLoading ? (
                  <p className="text-gray-500 italic">Loading your notes...</p>
                ) : notesError ? (
                  <p className="text-red-500 italic mt-2">Error loading notes: {notesError.message}</p>
                ) : notes.length === 0 ? (
                  <div>
                    <p className="text-gray-500 italic mt-2">No notes found. You can still complete the feedback survey below.</p>
                    <p className="text-xs text-gray-400 mt-1">Debug: User {user?.username}, isBetaTester: {user?.isBetaTester ? 'Yes' : 'No'}, isOpen: {isOpen ? 'Yes' : 'No'}</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border-2 border-gray-200 rounded-lg p-3 bg-white text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {note.pageContext}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(note.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            {editingNote === note.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full min-h-16 p-2 border border-gray-200 rounded text-xs resize-vertical"
                                />
                                <div className="flex gap-1">
                                  <button 
                                    onClick={handleSaveNote}
                                    disabled={updateNoteMutation.isPending}
                                    className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                  >
                                    <Save className="h-3 w-3" />
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingNote(null);
                                      setEditContent('');
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50"
                                  >
                                    <X className="h-3 w-3" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-700 whitespace-pre-wrap text-xs">{note.content}</p>
                            )}
                          </div>
                          {editingNote !== note.id && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditNote(note.id, note.content)}
                                className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={deleteNoteMutation.isPending}
                                className="p-1 border border-red-300 text-red-600 rounded hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Survey Form - using the same design as the page */}
              <form onSubmit={handleSubmit}>
                {/* Quick Rating Section */}
                <div className="mb-8">
                  <h3 
                    className="text-lg font-semibold text-gray-800 mb-4 pb-2"
                    style={{ borderBottom: '2px solid #e9ecef' }}
                  >
                    Quick Rating
                  </h3>
                  
                  {/* Overall Experience */}
                  <div className="mb-5">
                    <div className="text-sm font-semibold mb-2 text-gray-800">1. Overall experience quality</div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: '1', label: 'Poor' },
                        { value: '2', label: 'Fair' },
                        { value: '3', label: 'Good' },
                        { value: '4', label: 'Very Good' },
                        { value: '5', label: 'Excellent' }
                      ].map(option => (
                        <label 
                          key={option.value} 
                          className={`flex items-center gap-1 px-2 py-1 border rounded cursor-pointer transition-all duration-200 text-xs ${
                            formData.overallExperience === option.value
                              ? 'border-blue-500 text-white bg-blue-500'
                              : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="overall" 
                            value={option.value}
                            checked={formData.overallExperience === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, overallExperience: e.target.value }))}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Authenticity */}
                  <div className="mb-5">
                    <div className="text-sm font-semibold mb-2 text-gray-800">2. How authentic did your Star Card and report feel?</div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: '1', label: 'Not at all' },
                        { value: '2', label: 'Slightly' },
                        { value: '3', label: 'Somewhat' },
                        { value: '4', label: 'Very' },
                        { value: '5', label: 'Completely' }
                      ].map(option => (
                        <label 
                          key={option.value} 
                          className={`flex items-center gap-1 px-2 py-1 border rounded cursor-pointer transition-all duration-200 text-xs ${
                            formData.authenticityRating === option.value
                              ? 'border-blue-500 text-white bg-blue-500'
                              : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="authentic" 
                            value={option.value}
                            checked={formData.authenticityRating === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, authenticityRating: e.target.value }))}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="mb-5">
                    <div className="text-sm font-semibold mb-2 text-gray-800">3. How likely are you to recommend this to a colleague?</div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: '1', label: 'Not likely' },
                        { value: '2', label: 'Unlikely' },
                        { value: '3', label: 'Neutral' },
                        { value: '4', label: 'Likely' },
                        { value: '5', label: 'Very likely' }
                      ].map(option => (
                        <label 
                          key={option.value} 
                          className={`flex items-center gap-1 px-2 py-1 border rounded cursor-pointer transition-all duration-200 text-xs ${
                            formData.recommendationLikelihood === option.value
                              ? 'border-blue-500 text-white bg-blue-500'
                              : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="recommend" 
                            value={option.value}
                            checked={formData.recommendationLikelihood === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, recommendationLikelihood: e.target.value }))}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rose, Bud, Thorn Section */}
                <div className="mb-8">
                  <h3 
                    className="text-lg font-semibold text-gray-800 mb-4 pb-2"
                    style={{ borderBottom: '2px solid #e9ecef' }}
                  >
                    Rose, Bud, Thorn
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="bg-white border-l-4 border-red-400 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <span className="text-lg">🌹</span> Rose - What worked really well?
                      </div>
                      <textarea
                        value={formData.rose}
                        onChange={(e) => setFormData(prev => ({ ...prev, rose: e.target.value }))}
                        className="w-full min-h-20 p-2 border border-gray-200 rounded text-sm resize-vertical"
                        placeholder="Share what you found most valuable or effective..."
                      />
                    </div>

                    <div className="bg-white border-l-4 border-orange-400 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <span className="text-lg">🌱</span> Bud - What has potential but needs development?
                      </div>
                      <textarea
                        value={formData.bud}
                        onChange={(e) => setFormData(prev => ({ ...prev, bud: e.target.value }))}
                        className="w-full min-h-20 p-2 border border-gray-200 rounded text-sm resize-vertical"
                        placeholder="What showed promise but could be improved or expanded..."
                      />
                    </div>

                    <div className="bg-white border-l-4 border-green-400 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <span className="text-lg">🌵</span> Thorn - What was problematic or frustrating?
                      </div>
                      <textarea
                        value={formData.thorn}
                        onChange={(e) => setFormData(prev => ({ ...prev, thorn: e.target.value }))}
                        className="w-full min-h-20 p-2 border border-gray-200 rounded text-sm resize-vertical"
                        placeholder="Share any issues, confusion, or frustrations you encountered..."
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Application Section */}
                <div className="mb-8">
                  <h3 
                    className="text-lg font-semibold text-gray-800 mb-4 pb-2"
                    style={{ borderBottom: '2px solid #e9ecef' }}
                  >
                    Professional Application
                  </h3>
                  
                  <div className="mb-5">
                    <div className="text-sm font-semibold mb-2 text-gray-800">7. How would this fit into your work? (if applicable)</div>
                    <textarea
                      value={formData.workFit}
                      onChange={(e) => setFormData(prev => ({ ...prev, workFit: e.target.value }))}
                      className="w-full min-h-20 p-2 border border-gray-200 rounded text-sm resize-vertical"
                      placeholder="Describe how you might use this in your professional context..."
                    />
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-semibold mb-2 text-gray-800">8. Are you interested in learning more about:</div>
                    <div className="flex flex-col gap-3">
                      <label 
                        className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                          formData.interestedInTeamWorkshop ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={formData.interestedInTeamWorkshop}
                          onChange={(e) => handleInterestChange('interestedInTeamWorkshop', e.target.checked)}
                          className="mt-0.5"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-0.5">Team Workshop</h4>
                          <p className="text-xs text-gray-600">
                            Human-facilitated collaborative sessions on whiteboards where teams map their collective strengths and create shared visions for peak performance.
                          </p>
                        </div>
                      </label>
                      
                      <label 
                        className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                          formData.interestedInIA ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={formData.interestedInIA}
                          onChange={(e) => handleInterestChange('interestedInIA', e.target.checked)}
                          className="mt-0.5"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-0.5">Imaginal Agility Workshop</h4>
                          <p className="text-xs text-gray-600">
                            Advanced creativity and innovation training that develops imaginative thinking skills and adaptive capacity for complex challenges.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-semibold mb-2 text-gray-800">9. Final comments - what didn't we ask that you'd like to share?</div>
                    <textarea
                      value={formData.finalComments}
                      onChange={(e) => setFormData(prev => ({ ...prev, finalComments: e.target.value }))}
                      className="w-full min-h-24 p-2 border border-gray-200 rounded text-sm resize-vertical"
                      placeholder="Any additional thoughts, suggestions, or feedback..."
                    />
                  </div>
                </div>

                {/* Follow-up Section */}
                <div 
                  className="mb-6 p-4 rounded-lg text-center text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                  }}
                >
                  <h4 className="font-semibold text-blue-800 mb-1">Optional Follow-up</h4>
                  <p className="text-gray-700">
                    Schedule 30 minutes to chat: {' '}
                    <a 
                      href="https://calendly.com/workq/ast-feedback" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-700 font-semibold hover:underline"
                    >
                      https://calendly.com/workq/ast-feedback
                    </a>
                  </p>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button 
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="px-8 py-3 border-none rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: !canSubmit || submitting ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};