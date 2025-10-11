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

const BetaFeedbackSurveyContent: React.FC = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [submitted, setSubmitted] = useState(false);
  const notesSectionRef = React.useRef<HTMLDivElement | null>(null);

  const SCHEDULING_URL = import.meta.env.VITE_SCHEDULING_URL || '#';
  const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'support@heliotrope.ai';

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
    const savedFormData = localStorage.getItem('betaFeedbackSurvey');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
        console.log('✅ Restored form data from localStorage');
      } catch (error) {
        console.error('Error parsing saved form data:', error);
        // Clear corrupted data
        localStorage.removeItem('betaFeedbackSurvey');
      }
    }
  }, []);

  // Debounced autosave function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: FeedbackFormData) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            localStorage.setItem('betaFeedbackSurvey', JSON.stringify(data));
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
    // Only autosave if there's actual content (avoid saving empty initial state)
    const hasContent = Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value === true
    );
    
    if (hasContent) {
      debouncedSave(formData);
    }
  }, [formData, debouncedSave]);

  // Fetch beta tester notes
  const { data: notes = [], isLoading: notesLoading } = useQuery<BetaNote[]>({
    queryKey: ['/api/beta-tester/notes'],
    queryFn: async () => {
      const response = await fetch('/api/beta-tester/notes?includeSubmitted=true', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      
      // Map the server response to the expected BetaNote format
      const mappedNotes = (data.notes || []).map((note: any) => ({
        id: note.id,
        content: note.noteContent,
        pageContext: note.pageTitle,
        timestamp: note.createdAt
      }));
      
      return mappedNotes;
    },
    enabled: !!user?.isBetaTester,
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/beta-tester/${noteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/beta-tester/notes'] });
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: number; content: string }) => {
      const response = await fetch(`/api/beta-tester/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Failed to update note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/beta-tester/notes'] });
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

      const response = await fetch('/api/beta-tester/feedback', {
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
      localStorage.removeItem('betaFeedbackSurvey');
      console.log('🗑️ Cleared autosaved form data after successful submission');
      // Show in-page thank you state instead of browser alert/redirect
      setSubmitted(true);
    }
  });

  // Redirect non-beta users
  useEffect(() => {
    if (user && !user.isBetaTester) {
      setLocation('/allstarteams');
    }
  }, [user, setLocation]);

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

  const scrollToNotes = () => {
    notesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl">✓</div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Thank you for your feedback!</h1>
          <p className="text-gray-600 mb-6">
            We appreciate your insights. You're welcome to keep exploring or schedule time to chat with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
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
        </div>
      </div>
    );
  }

  if (!user?.isBetaTester) {
    return null; // Will redirect in useEffect
  }

  return (
    <div 
      className="min-h-screen p-5"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <div 
        className="max-w-4xl mx-auto bg-white overflow-hidden"
        style={{
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div 
          className="text-white p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div 
            className="w-15 h-15 mx-auto mb-5 flex items-center justify-center p-3"
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '15px'
            }}
          >
            <img 
              src={AllStarTeamsLogo} 
              alt="AllStarTeams" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2">AllStarTeams Beta Feedback Survey</h1>
          <p className="text-base opacity-90">Thank you for testing the AllStarTeams workshop experience!</p>
        </div>

        <div className="p-10">
          {/* Notes Review Section */}
          <div 
            className="mb-10 p-6 rounded-xl"
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
            ) : notes.length === 0 ? (
              <p className="text-gray-500 italic mt-2">No notes found. You can still complete the feedback survey below.</p>
            ) : (
              <div className="space-y-4 mt-4">
                {notes.map((note) => (
                  <div key={note.id} className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {note.pageContext}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(note.timestamp).toLocaleDateString()} at {new Date(note.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {editingNote === note.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full min-h-20 p-4 border-2 border-gray-200 rounded-lg font-inherit text-sm resize-vertical transition-all duration-300 focus:outline-none focus:border-blue-500"
                              style={{ boxShadow: 'none' }}
                              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                              onBlur={(e) => e.target.style.boxShadow = 'none'}
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={handleSaveNote}
                                disabled={updateNoteMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                              >
                                <Save className="h-4 w-4" />
                                Save
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingNote(null);
                                  setEditContent('');
                                }}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                        )}
                      </div>
                      {editingNote !== note.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditNote(note.id, note.content)}
                            className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deleteNoteMutation.isPending}
                            className="p-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Survey Form */}
          <form onSubmit={handleSubmit}>
            {/* Quick Rating Section */}
            <div className="mb-10">
              <h2 
                className="text-xl font-semibold text-gray-800 mb-5 pb-2"
                style={{ borderBottom: '2px solid #e9ecef' }}
              >
                Quick Rating
              </h2>
              
              {/* Overall Experience */}
              <div className="mb-6">
                <div className="text-base font-semibold mb-3 text-gray-800">1. Overall experience quality</div>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { value: '1', label: 'Poor' },
                    { value: '2', label: 'Fair' },
                    { value: '3', label: 'Good' },
                    { value: '4', label: 'Very Good' },
                    { value: '5', label: 'Excellent' }
                  ].map(option => (
                    <label 
                      key={option.value} 
                      className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer transition-all duration-300 text-sm ${
                        formData.overallExperience === option.value
                          ? 'border-blue-500 text-white'
                          : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                      }`}
                      style={formData.overallExperience === option.value ? {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      } : {}}
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
              <div className="mb-6">
                <div className="text-base font-semibold mb-3 text-gray-800">2. How authentic did your Star Card and report feel?</div>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { value: '1', label: 'Not at all' },
                    { value: '2', label: 'Slightly' },
                    { value: '3', label: 'Somewhat' },
                    { value: '4', label: 'Very' },
                    { value: '5', label: 'Completely' }
                  ].map(option => (
                    <label 
                      key={option.value} 
                      className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer transition-all duration-300 text-sm ${
                        formData.authenticityRating === option.value
                          ? 'border-blue-500 text-white'
                          : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                      }`}
                      style={formData.authenticityRating === option.value ? {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      } : {}}
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
              <div className="mb-6">
                <div className="text-base font-semibold mb-3 text-gray-800">3. How likely are you to recommend this to a colleague?</div>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { value: '1', label: 'Not likely' },
                    { value: '2', label: 'Unlikely' },
                    { value: '3', label: 'Neutral' },
                    { value: '4', label: 'Likely' },
                    { value: '5', label: 'Very likely' }
                  ].map(option => (
                    <label 
                      key={option.value} 
                      className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer transition-all duration-300 text-sm ${
                        formData.recommendationLikelihood === option.value
                          ? 'border-blue-500 text-white'
                          : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                      }`}
                      style={formData.recommendationLikelihood === option.value ? {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      } : {}}
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
            <div className="mb-10">
              <h2 
                className="text-xl font-semibold text-gray-800 mb-5 pb-2"
                style={{ borderBottom: '2px solid #e9ecef' }}
              >
                Rose, Bud, Thorn
              </h2>
              
              <div className="grid gap-5">
                <div 
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-500"
                  style={{ borderLeft: '4px solid #e74c3c', boxShadow: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div className="text-base font-semibold mb-2 flex items-center gap-2">
                    <span className="text-xl">🌹</span> Rose - What worked really well?
                  </div>
                  <textarea
                    value={formData.rose}
                    onChange={(e) => setFormData(prev => ({ ...prev, rose: e.target.value }))}
                    className="w-full min-h-25 p-4 border-2 border-gray-200 rounded-lg font-inherit text-sm resize-vertical transition-all duration-300 focus:outline-none focus:border-blue-500"
                    placeholder="Share what you found most valuable or effective..."
                    style={{ boxShadow: 'none' }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                <div 
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-500"
                  style={{ borderLeft: '4px solid #f39c12', boxShadow: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div className="text-base font-semibold mb-2 flex items-center gap-2">
                    <span className="text-xl">🌱</span> Bud - What has potential but needs development?
                  </div>
                  <textarea
                    value={formData.bud}
                    onChange={(e) => setFormData(prev => ({ ...prev, bud: e.target.value }))}
                    className="w-full min-h-25 p-4 border-2 border-gray-200 rounded-lg font-inherit text-sm resize-vertical transition-all duration-300 focus:outline-none focus:border-blue-500"
                    placeholder="What showed promise but could be improved or expanded..."
                    style={{ boxShadow: 'none' }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                <div 
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-blue-500"
                  style={{ borderLeft: '4px solid #27ae60', boxShadow: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div className="text-base font-semibold mb-2 flex items-center gap-2">
                    <span className="text-xl">🌵</span> Thorn - What was problematic or frustrating?
                  </div>
                  <textarea
                    value={formData.thorn}
                    onChange={(e) => setFormData(prev => ({ ...prev, thorn: e.target.value }))}
                    className="w-full min-h-25 p-4 border-2 border-gray-200 rounded-lg font-inherit text-sm resize-vertical transition-all duration-300 focus:outline-none focus:border-blue-500"
                    placeholder="Share any issues, confusion, or frustrations you encountered..."
                    style={{ boxShadow: 'none' }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>
            </div>

            {/* Professional Application Section */}
            <div className="mb-10">
              <h2 
                className="text-xl font-semibold text-gray-800 mb-5 pb-2"
                style={{ borderBottom: '2px solid #e9ecef' }}
              >
                Professional Application
              </h2>
              
              <div className="mb-6">
                <div className="text-base font-semibold mb-3 text-gray-800">7. How would this fit into your work? (if applicable)</div>
                <textarea
                  value={formData.workFit}
                  onChange={(e) => setFormData(prev => ({ ...prev, workFit: e.target.value }))}
                  className="w-full min-h-25 p-4 border-2 border-gray-200 rounded-lg font-inherit text-sm resize-vertical transition-all duration-300 focus:outline-none focus:border-blue-500"
                  placeholder="Describe how you might use this in your professional context..."
                  style={{ boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>

              <div className="mb-6">
                <div className="text-base font-semibold mb-3 text-gray-800">8. Are you interested in learning more about:</div>
                <div className="flex flex-col gap-4">
                  <label 
                    className={`flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all duration-300 ${
                      formData.interestedInTeamWorkshop ? 'border-blue-500 bg-gray-50' : 'hover:border-blue-500 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={formData.interestedInTeamWorkshop}
                      onChange={(e) => handleInterestChange('interestedInTeamWorkshop', e.target.checked)}
                      className="mt-1 scale-125"
                    />
                    <div>
                      <h4 className="text-base font-semibold text-gray-800 mb-1">Team Workshop</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Human-facilitated collaborative sessions on whiteboards where teams map their collective strengths and create shared visions for peak performance.
                      </p>
                    </div>
                  </label>
                  
                  <label 
                    className={`flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all duration-300 ${
                      formData.interestedInIA ? 'border-blue-500 bg-gray-50' : 'hover:border-blue-500 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={formData.interestedInIA}
                      onChange={(e) => handleInterestChange('interestedInIA', e.target.checked)}
                      className="mt-1 scale-125"
                    />
                    <div>
                      <h4 className="text-base font-semibold text-gray-800 mb-1">Imaginal Agility Workshop</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Advanced creativity and innovation training that develops imaginative thinking skills and adaptive capacity for complex challenges.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-base font-semibold mb-3 text-gray-800">9. Final comments - what didn't we ask that you'd like to share?</div>
                <textarea
                  value={formData.finalComments}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalComments: e.target.value }))}
                  className="w-full min-h-30 p-4 border-2 border-gray-200 rounded-lg font-inherit text-sm resize-vertical transition-all duration-300 focus:outline-none focus:border-blue-500"
                  placeholder="Any additional thoughts, suggestions, or feedback..."
                  style={{ boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
            </div>

            {/* Follow-up Section */}
            <div 
              className="mb-8 p-6 rounded-xl text-center"
              style={{
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
              }}
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Optional Follow-up</h3>
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
          </form>
        </div>

        {/* Submit Container */}
        <div className="text-center p-8 bg-gray-50 border-t border-gray-200">
          <button 
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="px-10 py-4 border-none rounded-xl text-base font-semibold text-white cursor-pointer transition-all duration-300 disabled:opacity-50"
            style={{
              background: !canSubmit || submitting ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            onMouseEnter={(e) => {
              if (!submitting && canSubmit) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetaFeedbackSurveyContent;