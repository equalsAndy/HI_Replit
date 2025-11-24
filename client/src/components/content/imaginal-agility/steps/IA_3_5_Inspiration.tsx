import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { Card, CardContent } from '@/components/ui/card';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA35ContentProps {
  onNext?: (stepId: string) => void;
}

interface InterludeData {
  id: string;
  title: string;
  prompt: string;
  response?: string;
}

const interludes: InterludeData[] = [
  {
    id: 'nature',
    title: 'Walk in Nature',
    prompt: 'Describe a moment in nature that moved you. Where were you? What did you see, feel, hear?'
  },
  {
    id: 'beauty',
    title: 'Capture Beauty',
    prompt: 'Think of something beautiful you once paused to capture. Was it a photo, a sound, a detail? Why did it catch your eye?'
  },
  {
    id: 'journal',
    title: 'Journal Thoughts',
    prompt: 'Recall a time when writing helped you understand something. What flowed out? What surprised you?'
  },
  {
    id: 'create',
    title: 'Create Art',
    prompt: 'Remember a time when you were lost in making something. What were you creating? What feeling came with it?'
  },
  {
    id: 'vision',
    title: 'Vision Board',
    prompt: 'Picture a time when you shaped a dream into images or words. What did you see? What pulled you forward?'
  },
  {
    id: 'play',
    title: 'Play',
    prompt: 'When did you last lose yourself in play or laughter? What were you doing? Who were you with?'
  },
  {
    id: 'learn',
    title: 'Learn New Skills',
    prompt: 'Think of a moment when learning something new made you feel alive. What were you discovering? What part lit you up?'
  },
  {
    id: 'heroes',
    title: 'Read Heroes',
    prompt: 'Recall a story or figure that stirred something in you. What was their story — and what did it awaken in yours?'
  },
  {
    id: 'art',
    title: 'Experience Art',
    prompt: 'Think of a performance, painting, or poem that struck you deep. What did it awaken? Why do you still remember it?'
  }
];

const IA_3_5_Content: React.FC<IA35ContentProps> = ({ onNext }) => {
  const [selectedInterludes, setSelectedInterludes] = useState<InterludeData[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [completed, setCompleted] = useState<string[]>([]);

  // Get video data for ia-3-5 using the existing video hook
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId(
    'ia',
    'ia-3-5'
  );

  // Helper function to extract YouTube ID from video URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };
  const [savedSnapshot, setSavedSnapshot] = useState<{ selected: string[]; responses: { [k: string]: string }; completed: string[] }>({ selected: [], responses: {}, completed: [] });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const debounceRef = useRef<any>(null);
  const draftKey = 'ia-3-5:draft';
  const [reflectionStep, setReflectionStep] = useState<number>(0);
  const [patternReflection, setPatternReflection] = useState('');
  const [momentStory, setMomentStory] = useState('');
  const [feelingClaim, setFeelingClaim] = useState('');
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  // Maintain selection in grid order (left-to-right, top-to-bottom)
  const interludeIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    interludes.forEach((i, idx) => { map[i.id] = idx; });
    return map;
  }, []);

  const sortByGridOrder = useCallback((items: InterludeData[]) => {
    return [...items].sort((a, b) => (interludeIndexMap[a.id] || 0) - (interludeIndexMap[b.id] || 0));
  }, [interludeIndexMap]);

  const handleInterludeClick = async (interlude: InterludeData) => {
    const isSelected = selectedInterludes.some(i => i.id === interlude.id);
    if (isSelected) {
      // Deselecting - remove from all state and auto-save
      const newSelectedInterludes = selectedInterludes.filter(i => i.id !== interlude.id);
      setSelectedInterludes(newSelectedInterludes);
      
      // Remove from responses
      const newResponses = { ...responses };
      delete newResponses[interlude.id];
      setResponses(newResponses);
      
      // Remove from completed
      const newCompleted = completed.filter(id => id !== interlude.id);
      setCompleted(newCompleted);
      
      // Auto-save the removal to server immediately
      await autoSaveCompletionState(newCompleted);
      
      console.log(`🗑️ Deselected interlude ${interlude.id} and auto-saved removal to server`);
    } else {
      // Selecting - just add to selection (no auto-save until completed)
      setSelectedInterludes(list => sortByGridOrder([...list, interlude]));
      console.log(`🎯 Selected interlude ${interlude.id}`);
    }
  };

  const handleResponseChange = useCallback((interludeId: string, response: string) => {
    setResponses(prev => ({ ...prev, [interludeId]: response }));
  }, []);

  // Exercise considered complete when at least one selected interlude is marked complete
  const canProceedToReflection = selectedInterludes.length > 0 && completed.length > 0;
  
  // Check if there are incomplete interludes
  const hasIncompleteInterludes = selectedInterludes.length > completed.length;
  
  // Handle continue button click with warning check
  const handleContinue = async () => {
    if (hasIncompleteInterludes) {
      setShowIncompleteWarning(true);
    } else {
      // No need to manually save - auto-save handles everything
      console.log('🧭 IA-3-5 calling onNext to ia-3-6');
      onNext && onNext('ia-3-6');
    }
  };
  
  // Handle continue after warning confirmation
  const handleContinueWithIncomplete = async () => {
    // Remove incomplete interludes from selection and responses
    const completedInterludeIds = completed;
    const newSelectedInterludes = selectedInterludes.filter(interlude => completedInterludeIds.includes(interlude.id));
    const newResponses = Object.fromEntries(
      Object.entries(responses).filter(([id]) => completedInterludeIds.includes(id))
    );
    
    setSelectedInterludes(newSelectedInterludes);
    setResponses(newResponses);
    setShowIncompleteWarning(false);
    
    // Auto-save will handle the server sync automatically
    console.log('🧭 IA-3-5 calling onNext to ia-3-6 (with incomplete warning)');
    onNext && onNext('ia-3-6');
  };

  const colorThemes = [
    { border: 'border-indigo-300', bg: 'bg-indigo-50', ring: 'ring-indigo-200', text: 'text-indigo-800', dot: 'bg-indigo-300' },
    { border: 'border-violet-300', bg: 'bg-violet-50', ring: 'ring-violet-200', text: 'text-violet-800', dot: 'bg-violet-300' },
    { border: 'border-sky-300', bg: 'bg-sky-50', ring: 'ring-sky-200', text: 'text-sky-800', dot: 'bg-sky-300' },
    { border: 'border-teal-300', bg: 'bg-teal-50', ring: 'ring-teal-200', text: 'text-teal-800', dot: 'bg-teal-300' },
    { border: 'border-amber-300', bg: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-800', dot: 'bg-amber-300' },
    { border: 'border-rose-300', bg: 'bg-rose-50', ring: 'ring-rose-200', text: 'text-rose-800', dot: 'bg-rose-300' },
    { border: 'border-emerald-300', bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-300' },
    { border: 'border-cyan-300', bg: 'bg-cyan-50', ring: 'ring-cyan-200', text: 'text-cyan-800', dot: 'bg-cyan-300' },
    { border: 'border-slate-300', bg: 'bg-slate-50', ring: 'ring-slate-200', text: 'text-slate-800', dot: 'bg-slate-300' }
  ];

  const InterludeTile = ({ interlude }: { interlude: InterludeData }) => {
    const isSelected = useMemo(() => 
      selectedInterludes.find(i => i.id === interlude.id), 
      [selectedInterludes, interlude.id]
    );
    const text = responses[interlude.id] || '';
    const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
    const isCompleted = useMemo(() => completed.includes(interlude.id), [completed, interlude.id]);
    const idx = interludeIndexMap[interlude.id] || 0;
    const theme = colorThemes[idx % colorThemes.length];

    return (
      <div className="space-y-2">
        <div
          onClick={() => handleInterludeClick(interlude)}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            isSelected 
              ? `${theme.border} ${theme.bg} shadow-md ring-2 ${theme.ring}`
              : 'border-gray-300 hover:border-purple-300 hover:bg-purple-25 hover:shadow-sm'
          }`}
        >
          <div className="text-center">
            <div className={`mx-auto mb-1 h-1.5 w-12 rounded-full ${isSelected ? theme.dot : 'bg-gray-300'}`} />
            <h3 className={`font-semibold ${isSelected ? theme.text : 'text-gray-700'}`}>
              {interlude.title}
            </h3>
            {isSelected && (
              <div className={`mt-2 text-xs ${isCompleted ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                {isCompleted ? '✓ Completed' : `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper to map ids to interlude objects (in grid order)
  const idsToInterludes = useCallback((ids: string[]) => {
    const map = new Map(interludes.map(i => [i.id, i] as const));
    return sortByGridOrder(ids.map(id => map.get(id)).filter(Boolean) as InterludeData[]);
  }, [sortByGridOrder]);

  // Load existing data from server, then overlay local draft if present
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/ia/steps/ia-3-5', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        
        // If server has no data, completely reset all state and clear localStorage
        if (!json?.data) {
          console.log('🗑️ Server has no IA-3-5 data - resetting all state');
          try {
            // Clear ALL localStorage keys that might contain IA-3-5 data
            const allKeys = Object.keys(localStorage);
            const ia35Keys = allKeys.filter(key => 
              key.includes('ia-3-5') || 
              key.includes('IA_3_5') || 
              key.includes('ia_3_5') ||
              key.includes('IA-3-5') ||
              key.includes('interlude') ||
              (key.includes('ia') && key.includes('3') && key.includes('5'))
            );
            ia35Keys.forEach(key => {
              localStorage.removeItem(key);
              console.log(`🗑️ Removed localStorage key: ${key}`);
            });
          } catch {}
          
          // Force complete state reset
          setSelectedInterludes([]);
          setResponses({});
          setCompleted([]);
          setSavedSnapshot({ selected: [], responses: {}, completed: [] });
          setPatternReflection('');
          setMomentStory('');
          setFeelingClaim('');
          setReflectionStep(0);
          console.log('🔄 Complete IA-3-5 state reset completed');
          return;
        }
        
        const data = json.data as { selectedInterludes?: string[]; responses?: Record<string, string>; completed?: string[] };
        const selIds = data.selectedInterludes || [];
        const resp = data.responses || {};
        const comp = data.completed || [];
        
        // Server has data - use it as source of truth, ignore any localStorage
        console.log('💾 Server IA-3-5 data loaded:', { selIds, responses: Object.keys(resp), completed: comp });
        
        // Clear any conflicting localStorage to prevent interface confusion
        try {
          const raw = localStorage.getItem(draftKey);
          if (raw) {
            localStorage.removeItem(draftKey);
            console.log('🗑️ Cleared localStorage draft to prevent conflicts with server data');
          }
        } catch {}
        
        // Use ONLY server data - no localStorage overlay
        const sel = idsToInterludes(selIds);
        setSelectedInterludes(sel);
        setResponses(resp);
        setCompleted(comp);
        setSavedSnapshot({ selected: selIds, responses: resp, completed: comp });
        console.log('🔄 IA-3-5 state set from server data:', { 
          selected: selIds.length, 
          responses: Object.keys(resp).length, 
          completed: comp.length 
        });
      } catch {}
    })();
    return () => { mounted = false; };
  }, [idsToInterludes]);

  // Only persist completed reflections to the database
  const buildPayload = (): { selectedInterludes: string[]; responses: Record<string, string>; completed: string[]; meta: { lastEditedAt: string } } => {
    const ids = completed;
    const pruned: Record<string, string> = {};
    ids.forEach(id => { if (responses[id]) pruned[id] = responses[id]; });
    return {
      selectedInterludes: ids,
      responses: pruned,
      completed: ids,
      meta: { lastEditedAt: new Date().toISOString() }
    };
  };

  // Auto-save when marking complete/incomplete with immediate server sync
  const autoSaveCompletionState = async (nextCompleted: string[]) => {
    try {
      setSaving(true);
      
      // For completed interludes: save their responses
      // For incomplete interludes: remove their responses from server
      const savedResponses: Record<string, string> = {};
      nextCompleted.forEach(id => {
        if (responses[id]) {
          savedResponses[id] = responses[id];
        }
      });
      
      const payload = {
        data: {
          selectedInterludes: nextCompleted, // Only save completed interludes
          responses: savedResponses, // Only save responses for completed interludes
          completed: nextCompleted,
          meta: { lastEditedAt: new Date().toISOString() }
        }
      };
      
      const res = await fetch('/api/ia/steps/ia-3-5', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Save failed');
      
      // Update local saved snapshot to match server state
      setSavedSnapshot({ 
        selected: [...nextCompleted], 
        responses: { ...savedResponses }, 
        completed: [...nextCompleted] 
      });
      
      // Clear any localStorage draft to prevent conflicts with server state
      try {
        localStorage.removeItem(draftKey);
        console.log('🗑️ Cleared localStorage draft after auto-save');
      } catch {}
      
      setSaveMsg('Auto-saved');
      setTimeout(() => setSaveMsg(null), 1500);
    } catch (e) {
      console.error('Auto-save failed:', e);
      setSaveMsg('Auto-save failed');
      setTimeout(() => setSaveMsg(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  // Legacy save method (will be removed) - now just calls auto-save
  const saveAll = async () => {
    await autoSaveCompletionState(completed);
  };

  // Remove individual save method - auto-save handles everything
  const saveOne = async (id: string) => {
    // Auto-save is handled by completion state changes
  };

  // Light local draft for selected interludes only (responses auto-save on completion)
  const hasChanges = useMemo(() => {
    const selIds = selectedInterludes.map(i => i.id);
    return JSON.stringify(savedSnapshot.selected) !== JSON.stringify(selIds);
  }, [selectedInterludes, savedSnapshot.selected]);

  // Save selection changes to localStorage for UX (but clear it frequently to avoid data conflicts)
  useEffect(() => {
    if (!hasChanges) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        // Only save selection, never responses or completion
        const draft = {
          selectedInterludes: selectedInterludes.map(i => i.id),
          responses: {}, // Never save responses locally
          completed: []  // Never save completion locally
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        
        // Clear the draft after a delay to prevent data conflicts
        setTimeout(() => {
          try {
            localStorage.removeItem(draftKey);
          } catch {}
        }, 30000); // Clear after 30 seconds
      } catch {}
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanges]);

  const clearDraft = () => {
    try { localStorage.removeItem(draftKey); } catch {}
    // Revert to last saved snapshot for selection only
    setSelectedInterludes(idsToInterludes(savedSnapshot.selected));
    // Don't revert responses or completion - those are auto-saved to server
    setSaveMsg('Selection draft cleared');
    setTimeout(() => setSaveMsg(null), 1200);
  };

  // Cleanup localStorage on unmount to prevent stale data
  useEffect(() => {
    return () => {
      try {
        localStorage.removeItem(draftKey);
        console.log('🗑️ Cleaned up IA-3-5 localStorage on unmount');
      } catch {}
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      <h1 className="text-4xl font-bold text-purple-700 mb-2">
        RUNG 4: INSPIRATION
      </h1>
      
      {/* Video Section using VideoTranscriptGlossary component like AST */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'vGIYaL7jTJo'} // Fallback to known ID from migration
        title={videoData?.title || "IA Solo Inspiration"}
        transcriptMd={null} // No transcript data available yet
        glossary={null} // No glossary data available yet
      />

      {/* Rung 4 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Rung 4 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img 
              src="/assets/Rung4.png" 
              alt="Rung 4: Inspiration"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('✅ Rung 4 graphic loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load Rung 4 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Purpose / Intro Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <blockquote className="text-xl italic text-purple-800 mb-4 text-center">
            "Inspiration exists, but it has to find you working." — Picasso
          </blockquote>
          <div className="space-y-4 text-gray-700">
            <p>
              This climb on the Ladder of Imagination is your work, and this rung is where you may rightly invite inspiration.
            </p>
            <p>
              It arrives when we make space.
            </p>
            <p>
              This rung is not about effort. It's about returning to the spark that makes you feel most alive.
            </p>
            <p className="font-medium text-purple-700">
              We call this your <em>Interlude</em> — a moment of renewal before continuing your climb.
            </p>
          </div>
        </div>
      </div>

      {reflectionStep === 0 && (
        <>
          {/* Interlude Grid */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">INTERLUDE GRID</h2>
            <div className="space-y-3 text-gray-700 mb-6">
              <p className="text-center">Choose your Interlude(s) from the grid below. Each opens a short prompt + text entry.</p>
              <p className="text-center">There's no right or wrong.</p>
              <p className="text-center">Just follow what draws you in, and take a few minutes to reflect.</p>
              <p className="text-center font-medium">Once complete, you'll map your Inner Spark.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interludes.map((interlude) => (
                <InterludeTile key={interlude.id} interlude={interlude} />
              ))}
            </div>

            {/* Stacked reflections in grid order */}
            {selectedInterludes.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {saveMsg || (saving ? 'Auto-saving...' : 'Your answers are automatically saved when marked complete')}
                  </div>
                  <div className="flex gap-2">
                    {hasChanges && (
                      <Button onClick={clearDraft} variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                        Reset Selection
                      </Button>
                    )}
                  </div>
                </div>
                {sortByGridOrder(selectedInterludes).map(sel => {
                  const idx = interludeIndexMap[sel.id] || 0;
                  const theme = colorThemes[idx % colorThemes.length];
                  return (
                    <Card key={`editor-${sel.id}`} className={`shadow-lg w-full ${theme.border} border-2`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-2.5 w-10 rounded-full ${theme.dot}`} />
                            <h3 className={`text-lg font-semibold ${theme.text}`}>{sel.title}</h3>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 border-gray-300 hover:bg-gray-50"
                              disabled={saving}
                              onClick={async () => {
                                // Remove interlude from selection
                                const newSelectedInterludes = selectedInterludes.filter(i => i.id !== sel.id);
                                setSelectedInterludes(newSelectedInterludes);
                                
                                // Remove from responses
                                const newResponses = { ...responses };
                                delete newResponses[sel.id];
                                setResponses(newResponses);
                                
                                // Remove from completed
                                const newCompleted = completed.filter(id => id !== sel.id);
                                setCompleted(newCompleted);
                                
                                // Auto-save the removal to server immediately
                                await autoSaveCompletionState(newCompleted);
                                
                                console.log(`🗑️ Removed interlude ${sel.id} and auto-saved to server`);
                              }}
                            >
                              Remove
                            </Button>
                            <Button
                              variant="outline" 
                              size="sm"
                              className={completed.includes(sel.id) ? "text-green-700 border-green-300 bg-green-50" : "text-green-700 border-green-300 hover:bg-green-50"}
                              disabled={saving}
                              onClick={async () => {
                                const isCurrentlyCompleted = completed.includes(sel.id);
                                const next = isCurrentlyCompleted
                                  ? completed.filter(id => id !== sel.id) // Mark incomplete
                                  : [...completed, sel.id]; // Mark complete
                                
                                setCompleted(next);
                                // Auto-save immediately to server
                                await autoSaveCompletionState(next);
                              }}
                            >
                              {completed.includes(sel.id) ? 'Edit Answer' : 'Mark Complete'}
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4 italic leading-relaxed">{sel.prompt}</p>
                        <textarea
                          value={responses[sel.id] || ''}
                          onChange={(e) => handleResponseChange(sel.id, e.target.value)}
                          placeholder="Take your time... reflect on this moment and let the words flow..."
                          rows={6}
                          disabled={completed.includes(sel.id)}
                          className={`w-full block p-4 border-2 rounded-lg text-gray-800 leading-relaxed resize-none box-border ${
                            completed.includes(sel.id) 
                              ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                              : 'border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                          }`}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="text-sm text-gray-600">
                Selected: {selectedInterludes.length} • Completed: {completed.length}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleContinue}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  disabled={!canProceedToReflection}
                >
                  Continue to The Unimaginable
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {reflectionStep === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 space-y-6">
          <h2 className="text-2xl font-bold text-purple-700">Step 1: Sit With the Pattern</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Ask yourself: <strong>"What do these experiences have in common for me?"</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Do they all bring you stillness or movement?</li>
              <li>Are they about solitude or connection?</li>
              <li>Do they remind you of who you are, or who you want to be?</li>
            </ul>
            <p className="text-gray-600 italic">
              You're not looking for a right answer — just noticing what they stir.
            </p>
            <textarea
              value={patternReflection}
              onChange={(e) => setPatternReflection(e.target.value)}
              placeholder="What patterns do you notice in your chosen interludes? Take your time to reflect..."
              rows={5}
              className="w-full p-4 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 leading-relaxed resize-none"
            />
            <div className="flex justify-between">
              <Button
                onClick={() => setReflectionStep(0)}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                ← Back to Interludes
              </Button>
              {patternReflection.trim() && (
                <Button
                  onClick={() => setReflectionStep(2)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Continue to Step 2
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {reflectionStep === 2 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 space-y-6">
          <h2 className="text-2xl font-bold text-purple-700">Step 2: Describe One Moment That Unites Them</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>"Tell the story of one moment — even a small one — that contains the feeling behind all your interludes."</strong>
            </p>
            <p className="text-gray-700">It could be:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Reading a line from a book while in a park and sketching what you imagined.</li>
              <li>Watching sunlight shift through trees and suddenly remembering a line a mentor once told you.</li>
              <li>Doodling, and realizing you're echoing the form of a tree you walked past.</li>
            </ul>
            <p className="text-gray-600 italic">
              Write, sketch, or say it aloud — but capture it.
            </p>
            <textarea
              value={momentStory}
              onChange={(e) => setMomentStory(e.target.value)}
              placeholder="Tell the story of one moment that unites your experiences... Paint the scene with your words..."
              rows={7}
              className="w-full p-4 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 leading-relaxed resize-none"
            />
            <div className="flex justify-between">
              <Button
                onClick={() => setReflectionStep(1)}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                ← Back to Step 1
              </Button>
              {momentStory.trim() && (
                <Button
                  onClick={() => setReflectionStep(3)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Continue to Step 3
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {reflectionStep === 3 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 space-y-6">
          <h2 className="text-2xl font-bold text-purple-700">Step 3: Claim the Feeling</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Ask: <strong>"What does this cluster tell me about how inspiration lives in me?"</strong>
            </p>
            <p className="text-gray-700">Use first-person language if you can:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>"I feel most myself when..."</li>
              <li>"Inspiration finds me when I..."</li>
              <li>"This reminds me that I am someone who..."</li>
            </ul>
            <textarea
              value={feelingClaim}
              onChange={(e) => setFeelingClaim(e.target.value)}
              placeholder="How does inspiration live in you? Claim this truth about yourself..."
              rows={5}
              className="w-full p-4 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 leading-relaxed resize-none"
            />
            <div className="flex justify-between">
              <Button
                onClick={() => setReflectionStep(2)}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                ← Back to Step 2
              </Button>
              {feelingClaim.trim() && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800 font-medium text-center">
                      Let's carry it forward.
                    </p>
                  </div>
                  <div className="text-center">
                    <Button
                      onClick={() => {
                        console.log('🧭 IA-3-5 calling onNext to ia-3-6 (from reflection step 3)');
                        onNext && onNext('ia-3-6');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                    >
                      Continue to The Unimaginable
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Incomplete Interludes Warning Dialog */}
      {showIncompleteWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Incomplete Interludes
            </h3>
            <p className="text-gray-700 mb-6">
              You have {selectedInterludes.length - completed.length} incomplete interlude{selectedInterludes.length - completed.length === 1 ? '' : 's'}. 
              If you continue, incomplete interludes will be deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowIncompleteWarning(false)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Go Back & Complete
              </Button>
              <Button
                onClick={handleContinueWithIncomplete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Continue & Delete Incomplete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IA_3_5_Content;
