import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA37ContentProps {
  onNext?: (stepId: string) => void;
}

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

const CAPABILITIES: {
  key: CapabilityKey;
  label: string;
  color: string;
  colorFaint: string;
  colorBg: string;
  icon: string;
  question: string;
}[] = [
  {
    key: 'imagination',
    label: 'Imagination',
    color: '#8b5cf6',
    colorFaint: 'rgba(139,92,246,0.08)',
    colorBg: 'rgba(139,92,246,0.1)',
    icon: '/assets/Imagination_sq.png',
    question: "Did you see possibilities in the situation that weren't immediately obvious to others?",
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    color: '#10b981',
    colorFaint: 'rgba(16,185,129,0.08)',
    colorBg: 'rgba(16,185,129,0.1)',
    icon: '/assets/Curiosity_sq.png',
    question: 'Did you find yourself asking questions — of yourself or others — to understand what was really going on?',
  },
  {
    key: 'caring',
    label: 'Caring',
    color: '#3b82f6',
    colorFaint: 'rgba(59,130,246,0.08)',
    colorBg: 'rgba(59,130,246,0.1)',
    icon: '/assets/Caring_sq.png',
    question: 'Did concern for someone or something beyond the immediate task influence how you acted?',
  },
  {
    key: 'creativity',
    label: 'Creativity',
    color: '#f59e0b',
    colorFaint: 'rgba(245,158,11,0.08)',
    colorBg: 'rgba(245,158,11,0.1)',
    icon: '/assets/Creativity_sq.png',
    question: 'Did you try something different from your usual approach, or combine ideas in a new way?',
  },
  {
    key: 'courage',
    label: 'Courage',
    color: '#ef4444',
    colorFaint: 'rgba(239,68,68,0.08)',
    colorBg: 'rgba(239,68,68,0.1)',
    icon: '/assets/courage_sq.png',
    question: 'Did you do something that felt risky or uncomfortable because it seemed like the right thing to do?',
  },
];

const RATING_ANCHORS: Record<number, string> = {
  1: 'Not really',
  2: 'A little',
  3: 'Somewhat',
  4: 'Yes',
  5: 'Absolutely',
};

interface IA37StepData {
  scenario_notes: string;
  capability_ratings: Record<string, number | 'unsure'>;
  capability_notes: Record<string, string>;
}

const INITIAL_DATA: IA37StepData = {
  scenario_notes: '',
  capability_ratings: {},
  capability_notes: {},
};

// ── Component ─────────────────────────────────────────────────────────────────

const IA_3_7_ModuleReflection: React.FC<IA37ContentProps> = ({ onNext }) => {
  const { data, updateData, saving, loaded } = useWorkshopStepData<IA37StepData>(
    'ia',
    'ia-3-7',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true }
  );

  const [scenarioSubmitted, setScenarioSubmitted] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [scenarioText, setScenarioText] = useState('');
  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize local scenario text from loaded data
  useEffect(() => {
    if (loaded && data.scenario_notes) {
      setScenarioText(data.scenario_notes);
    }
  }, [loaded, data.scenario_notes]);

  // Initialize scenarioSubmitted state from saved data
  useEffect(() => {
    if (loaded && data.scenario_notes.trim()) {
      const hasRatings = Object.keys(data.capability_ratings).length > 0;
      if (hasRatings) {
        setScenarioSubmitted(true);
      }
    }
  }, [loaded]);

  // Auto-expand notes that already have content
  useEffect(() => {
    if (loaded && data.capability_notes) {
      const hasContent: Record<string, boolean> = {};
      for (const cap of CAPABILITIES) {
        if (data.capability_notes[cap.key]?.trim()) {
          hasContent[cap.key] = true;
        }
      }
      if (Object.keys(hasContent).length > 0) {
        setExpandedNotes(prev => ({ ...prev, ...hasContent }));
      }
    }
  }, [loaded]);

  // Count rated capabilities
  const ratedCount = CAPABILITIES.filter(
    c => data.capability_ratings[c.key] !== undefined
  ).length;
  const allRated = ratedCount === 5;

  const handleSubmitScenario = useCallback(() => {
    if (!scenarioText.trim()) return;
    updateData({ scenario_notes: scenarioText.trim() });
    setScenarioSubmitted(true);
    setTimeout(() => {
      capabilitiesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [scenarioText, updateData]);

  const handleEditScenario = useCallback(() => {
    setScenarioSubmitted(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const handleRate = useCallback((capability: CapabilityKey, value: number) => {
    updateData({
      capability_ratings: { ...data.capability_ratings, [capability]: value },
    });
  }, [data.capability_ratings, updateData]);

  const handleUnsure = useCallback((capability: CapabilityKey) => {
    const current = data.capability_ratings[capability];
    if (current === 'unsure') {
      const newRatings = { ...data.capability_ratings };
      delete newRatings[capability];
      updateData({ capability_ratings: newRatings });
    } else {
      updateData({
        capability_ratings: { ...data.capability_ratings, [capability]: 'unsure' },
      });
    }
  }, [data.capability_ratings, updateData]);

  const handleNote = useCallback((capability: CapabilityKey, value: string) => {
    updateData({
      capability_notes: { ...data.capability_notes, [capability]: value },
    });
  }, [data.capability_notes, updateData]);

  const toggleNote = useCallback((capability: CapabilityKey) => {
    setExpandedNotes(prev => ({ ...prev, [capability]: !prev[capability] }));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      <style>{`
        @keyframes ia37FadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Section 1: Module Recap Card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #7e22ce 0%, #581c87 100%)',
        borderRadius: 20, padding: '36px 32px', color: 'white',
        position: 'relative', overflow: 'hidden', marginBottom: 32,
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-40%', right: '-20%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '-10%',
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
          textTransform: 'uppercase', color: '#d8b4fe',
          marginBottom: 12, position: 'relative', zIndex: 1,
        }}>
          Module 3 · Wrap-up
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 28, lineHeight: 1.25, marginBottom: 16,
          position: 'relative', zIndex: 1,
        }}>
          Grounding What You've Practiced
        </h2>
        <p style={{
          fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)',
          position: 'relative', zIndex: 1,
        }}>
          You've been building your Ladder of Imagination — noticing autoflow patterns,
          visualizing your potential, turning insight into intention, and drawing on inspiration.
          These are capabilities you use all the time, whether you notice them or not.
        </p>
        <div style={{
          fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)',
          marginTop: 12, position: 'relative', zIndex: 1,
        }}>
          <strong style={{ color: 'white' }}>
            Before we close this module, let's ground what you've been practicing in something real.
          </strong>
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20,
          position: 'relative', zIndex: 1,
        }}>
          {['Autoflow', 'Visualization', 'Insight → Intention', 'Inspiration'].map(pill => (
            <span key={pill} style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 100, padding: '6px 14px',
              fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.9)',
            }}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* ── Section 2: Scenario Input (editable state) ── */}
      {!scenarioSubmitted && (
        <div style={{
          background: '#ffffff', borderRadius: 16,
          border: '1px solid #e5e7eb', overflow: 'hidden',
          marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ padding: '28px 28px 0' }}>
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 22, color: '#1e1b2e', marginBottom: 10,
            }}>
              A Moment That Mattered
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: '#6b7280', marginBottom: 24 }}>
              Think of a recent situation that stands out — it could be a challenge you navigated,
              something you built or created, a problem you explored, or a moment where you had to step up.
            </p>
          </div>
          <div style={{ padding: '0 28px 28px' }}>
            <textarea
              ref={textareaRef}
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              placeholder="A few words to place yourself back in the moment..."
              style={{
                width: '100%', minHeight: 120, padding: '16px 18px',
                border: '2px solid #e9d5ff', borderRadius: 12,
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.6,
                color: '#1e1b2e', background: '#fdfbff',
                resize: 'vertical', outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#c084fc';
                e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9d5ff';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ padding: '0 28px 24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSubmitScenario}
              disabled={!scenarioText.trim()}
              style={{
                background: '#9333ea', color: 'white', border: 'none',
                borderRadius: 10, padding: '12px 28px',
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                cursor: scenarioText.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                opacity: scenarioText.trim() ? 1 : 0.4,
                pointerEvents: scenarioText.trim() ? 'auto' : 'none',
              }}
              onMouseEnter={(e) => {
                if (scenarioText.trim()) {
                  e.currentTarget.style.background = '#7e22ce';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(147,51,234,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#9333ea';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Section 2b: Locked Scenario ── */}
      {scenarioSubmitted && (
        <div style={{
          background: '#ffffff', borderRadius: 16,
          border: '1px solid #e5e7eb', overflow: 'hidden',
          marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ padding: 28 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 6, height: 6, background: '#c084fc', borderRadius: '50%',
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '1px',
                  textTransform: 'uppercase', color: '#9333ea',
                }}>
                  Your Scenario
                </span>
              </div>
              <button
                onClick={handleEditScenario}
                style={{
                  background: 'none', border: '1px solid #e5e7eb',
                  borderRadius: 8, padding: '6px 14px',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                  fontWeight: 500, color: '#6b7280', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d8b4fe';
                  e.currentTarget.style.color = '#9333ea';
                  e.currentTarget.style.background = '#faf5ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.background = 'none';
                }}
              >
                Edit
              </button>
            </div>
            <div style={{
              fontSize: 15, lineHeight: 1.7, color: '#1e1b2e',
              background: '#fdfbff', padding: '16px 18px',
              borderRadius: 12, border: '1px solid #f3f0ff',
              whiteSpace: 'pre-wrap',
            }}>
              {data.scenario_notes}
            </div>
          </div>
        </div>
      )}

      {/* ── Section 3: Capability Cards ── */}
      {scenarioSubmitted && (
        <div
          ref={capabilitiesRef}
          style={{ animation: 'ia37FadeSlideIn 0.5s ease-out' }}
        >
          {/* Intro */}
          <div style={{ textAlign: 'center', marginBottom: 28, padding: '0 8px' }}>
            <h3 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 22, marginBottom: 8, color: '#1e1b2e',
            }}>
              What showed up in that moment?
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#6b7280' }}>
              Rate each capability based on this specific scenario — not who you are in general,
              just what was present here. Low numbers are completely valid; not every situation
              calls for every capability.
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 32, padding: '0 4px' }}>
            {CAPABILITIES.map(cap => {
              const rating = data.capability_ratings[cap.key];
              let bgColor = '#e5e7eb';
              if (rating !== undefined) {
                bgColor = rating === 'unsure'
                  ? `${cap.color}60`
                  : cap.color;
              }
              return (
                <div key={cap.key} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: bgColor, transition: 'background 0.3s ease',
                }} />
              );
            })}
          </div>

          {/* Capability Cards */}
          {CAPABILITIES.map(cap => {
            const rating = data.capability_ratings[cap.key];
            const isRated = rating !== undefined;
            const isUnsure = rating === 'unsure';
            const numericRating = typeof rating === 'number' ? rating : 0;
            const noteExpanded = expandedNotes[cap.key] || false;
            const noteValue = data.capability_notes?.[cap.key] || '';

            return (
              <div
                key={cap.key}
                style={{
                  background: '#ffffff', borderRadius: 14,
                  border: `1px solid ${isRated ? cap.color : '#e5e7eb'}`,
                  marginBottom: 16, overflow: 'hidden',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isRated ? `0 0 0 1px ${cap.colorFaint}` : undefined,
                }}
              >
                <div style={{ padding: '22px 24px' }}>
                  {/* Capability top: icon + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, padding: 6, background: cap.colorBg,
                    }}>
                      <img
                        src={cap.icon}
                        alt={cap.label}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 600, letterSpacing: '0.5px',
                      textTransform: 'uppercase', color: cap.color,
                    }}>
                      {cap.label}
                    </div>
                  </div>

                  {/* Question */}
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: '#1e1b2e', marginBottom: 18 }}>
                    {cap.question}
                  </div>

                  {/* Rating Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 6, flex: 1, justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map(n => {
                        const isSelected = numericRating === n && !isUnsure;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => handleRate(cap.key, n)}
                            style={{
                              width: 44, height: 36, borderRadius: 8,
                              border: `2px solid ${isSelected ? cap.color : '#e5e7eb'}`,
                              background: isSelected ? cap.color : '#ffffff',
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 13, fontWeight: isSelected ? 600 : 500,
                              color: isSelected ? 'white' : '#6b7280',
                              cursor: 'pointer', transition: 'all 0.15s ease',
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = cap.color;
                                e.currentTarget.style.background = cap.colorFaint;
                                e.currentTarget.style.color = cap.color;
                              }
                              const tooltip = e.currentTarget.querySelector('[data-tooltip]') as HTMLElement;
                              if (tooltip) {
                                tooltip.style.opacity = '1';
                                tooltip.style.transform = 'translateX(-50%) translateY(0)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.color = '#6b7280';
                              }
                              if (!isSelected) {
                                const tooltip = e.currentTarget.querySelector('[data-tooltip]') as HTMLElement;
                                if (tooltip) {
                                  tooltip.style.opacity = '0';
                                  tooltip.style.transform = 'translateX(-50%) translateY(4px)';
                                }
                              }
                            }}
                          >
                            {n}
                            <span
                              data-tooltip=""
                              style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 6px)',
                                left: '50%',
                                transform: isSelected
                                  ? 'translateX(-50%) translateY(0)'
                                  : 'translateX(-50%) translateY(4px)',
                                background: isSelected ? cap.color : '#1e1b2e',
                                color: 'white',
                                padding: '4px 10px', borderRadius: 6,
                                fontSize: 11, fontWeight: 500,
                                whiteSpace: 'nowrap',
                                opacity: isSelected ? 1 : 0,
                                pointerEvents: 'none',
                                transition: 'all 0.15s ease',
                                zIndex: 10,
                              }}
                            >
                              {RATING_ANCHORS[n]}
                              <span style={{
                                position: 'absolute', top: '100%', left: '50%',
                                transform: 'translateX(-50%)',
                                borderWidth: 4, borderStyle: 'solid', borderColor: 'transparent',
                                borderTopColor: isSelected ? cap.color : '#1e1b2e',
                              }} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Not sure button */}
                    <button
                      type="button"
                      onClick={() => handleUnsure(cap.key)}
                      style={{
                        background: isUnsure ? cap.colorFaint : 'none',
                        border: `1px ${isUnsure ? 'solid' : 'dashed'} ${isUnsure ? cap.color : '#e5e7eb'}`,
                        borderRadius: 8, padding: '6px 12px',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11, fontWeight: isUnsure ? 600 : 500,
                        color: isUnsure ? cap.color : '#9ca3af',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap', marginLeft: 6,
                      }}
                      onMouseEnter={(e) => {
                        if (!isUnsure) {
                          e.currentTarget.style.borderColor = cap.color;
                          e.currentTarget.style.color = cap.color;
                          e.currentTarget.style.background = cap.colorFaint;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isUnsure) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.color = '#9ca3af';
                          e.currentTarget.style.background = 'none';
                        }
                      }}
                    >
                      Not sure
                    </button>
                  </div>
                </div>

                {/* Note toggle */}
                <div style={{ padding: '0 24px 6px' }}>
                  <button
                    type="button"
                    onClick={() => toggleNote(cap.key)}
                    style={{
                      background: 'none', border: 'none',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12, color: '#9ca3af',
                      cursor: 'pointer', padding: '4px 0',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#a855f7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
                  >
                    {noteExpanded ? '− Hide note' : 'Why this rating?'}
                  </button>
                </div>

                {/* Note area */}
                {noteExpanded && (
                  <div style={{
                    padding: '0 24px 18px',
                    animation: 'ia37FadeSlideIn 0.25s ease-out',
                  }}>
                    <p style={{
                      fontSize: 12, color: '#9ca3af', marginBottom: 8, lineHeight: 1.5,
                    }}>
                      This is optional, but even a few words now makes it easier to revisit later.
                    </p>
                    <textarea
                      value={noteValue}
                      onChange={(e) => handleNote(cap.key, e.target.value)}
                      placeholder="Optional — a few words on why"
                      style={{
                        width: '100%', padding: '10px 14px',
                        border: '1px solid #e5e7eb', borderRadius: 8,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13, lineHeight: 1.5,
                        color: '#1e1b2e', background: '#fafafa',
                        resize: 'none', height: 52, outline: 'none',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#d8b4fe'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Section 4: Closing ── */}
          {allRated && (
            <div style={{
              textAlign: 'center', padding: '32px 20px',
              animation: 'ia37FadeSlideIn 0.5s ease-out',
            }}>
              <div style={{
                width: 56, height: 56,
                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, margin: '0 auto 16px',
              }}>
                🌱
              </div>
              <h3 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 20, marginBottom: 8,
              }}>
                Reflection Complete
              </h3>
              <p style={{
                fontSize: 14, lineHeight: 1.65, color: '#6b7280',
                maxWidth: 480, margin: '0 auto 24px',
              }}>
                You've grounded the capabilities from this module in a real moment. In Module 4,
                you'll do this again with an AI thinking partner — and see what a different kind
                of reflection surfaces.
              </p>
              <button
                onClick={() => onNext?.('ia-4-1')}
                disabled={saving}
                style={{
                  background: '#9333ea', color: 'white', border: 'none',
                  borderRadius: 10, padding: '12px 28px',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#7e22ce';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(147,51,234,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#9333ea';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {saving ? 'Saving...' : 'Continue to Module 4 →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IA_3_7_ModuleReflection;
