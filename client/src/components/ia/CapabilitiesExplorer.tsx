import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';

// ── Chip Definitions ────────────────────────────────────────────────────────

const CAPABILITY_HEX: Record<string, string> = {
  imagination: '#8b5cf6',
  curiosity: '#10b981',
  caring: '#3b82f6',
  creativity: '#f59e0b',
  courage: '#ef4444',
};

const SINGLE_CHIPS = [
  { key: 'imagination', label: 'Imagination', icon: '\u{1F4A1}' },
  { key: 'curiosity',   label: 'Curiosity',   icon: '\u{1F50D}' },
  { key: 'caring',      label: 'Caring',      icon: '\u2764\uFE0F' },
  { key: 'creativity',  label: 'Creativity',  icon: '\u2728' },
  { key: 'courage',     label: 'Courage',     icon: '\u{1F6E1}\uFE0F' },
];

const COMBO_CHIPS = [
  { key: 'curiosity+caring',     label: 'Curiosity + Caring',     caps: ['curiosity', 'caring'] },
  { key: 'imagination+courage',  label: 'Imagination + Courage',  caps: ['imagination', 'courage'] },
  { key: 'creativity+curiosity', label: 'Creativity + Curiosity', caps: ['creativity', 'curiosity'] },
];

// Tailwind-compatible inactive/active chip styles per capability
const CHIP_STYLES: Record<string, { inactive: string; active: string }> = {
  imagination: { inactive: 'bg-purple-50 text-purple-700 hover:bg-purple-100', active: 'bg-[#8b5cf6] text-white shadow-md' },
  curiosity:   { inactive: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', active: 'bg-[#10b981] text-white shadow-md' },
  caring:      { inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100', active: 'bg-[#3b82f6] text-white shadow-md' },
  creativity:  { inactive: 'bg-amber-50 text-amber-700 hover:bg-amber-100', active: 'bg-[#f59e0b] text-white shadow-md' },
  courage:     { inactive: 'bg-red-50 text-red-700 hover:bg-red-100', active: 'bg-[#ef4444] text-white shadow-md' },
};

const MAX_SAVES = 5;

// ── Component ───────────────────────────────────────────────────────────────

interface CapabilitiesExplorerProps {
  reframeText: string;
  shiftText: string;
  challenge: string;
}

export default function CapabilitiesExplorer({ reframeText, shiftText, challenge }: CapabilitiesExplorerProps) {
  const { state, setState, saveNow } = useContinuity();
  const explorer = state?.ia_4_2?.explorer ?? { taps: [], cached: {}, saved: [], favorite: null };

  const [activeChip, setActiveChip] = React.useState<string | null>(null);
  const [loadingChip, setLoadingChip] = React.useState<string | null>(null);

  // ── Helpers ──

  function updateExplorer(patch: Partial<typeof explorer>) {
    setState((prev: any) => ({
      ...prev,
      ia_4_2: {
        ...(prev.ia_4_2 || {}),
        explorer: { ...((prev.ia_4_2 || {}).explorer || { taps: [], cached: {}, saved: [], favorite: null }), ...patch },
      },
    }));
    setTimeout(() => saveNow(), 0);
  }

  function chipLabel(key: string): string {
    const single = SINGLE_CHIPS.find(c => c.key === key);
    if (single) return single.label;
    const combo = COMBO_CHIPS.find(c => c.key === key);
    return combo?.label ?? key;
  }

  function chipColors(key: string): string[] {
    if (key.includes('+')) {
      return key.split('+').map(k => CAPABILITY_HEX[k] ?? '#8b5cf6');
    }
    return [CAPABILITY_HEX[key] ?? '#8b5cf6'];
  }

  // ── API Call ──

  async function fetchCapabilityResponse(key: string) {
    if (explorer.cached[key]) {
      setActiveChip(key);
      return;
    }

    setActiveChip(key);
    setLoadingChip(key);

    const isCombo = key.includes('+');
    const label = chipLabel(key);

    const userMessage = isCombo
      ? `The participant accepted this reframe of their challenge:\n\n"${reframeText}"\n\nShow what this reframe reveals when viewed through the combined lens of ${label.replace(' + ', ' and ')}. How do these two capabilities together reveal something that neither would alone? 2-3 sentences, concrete, anchored to their specific situation.`
      : `The participant accepted this reframe of their challenge:\n\n"${reframeText}"\n\nShow what this reframe reveals when viewed through the lens of ${label}. Don't suggest actions or give advice. Show what becomes visible about their situation when they look at this reframe through ${label}. 2-3 sentences, concrete, anchored to their specific situation.`;

    const systemPrompt = `You are helping a participant explore their reframe through different capability lenses. Their original challenge was: "${challenge}". Their shift statement: "${shiftText}". Your job is to show what the REFRAME reveals when viewed through a specific capability — NOT to apply the capability to their original challenge, and NOT to suggest actions. Stay inside the reframe. Show what becomes visible that wasn't visible before. Use their specific nouns and context. No abstract language. No action planning. 2-3 sentences.`;

    try {
      const resp = await fetch('/api/ai/chat/plain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          training_id: 'ia-4-2',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      const data = await resp.json();
      if (data?.success && data.reply) {
        const text = data.reply.trim();
        const newCached = { ...explorer.cached, [key]: text };
        const newTaps = explorer.taps.includes(key) ? explorer.taps : [...explorer.taps, key];
        updateExplorer({ cached: newCached, taps: newTaps });
      }
    } catch (err) {
      console.error('Explorer API error:', err);
    } finally {
      setLoadingChip(null);
    }
  }

  // ── Save / Unsave / Favorite ──

  function saveItem(key: string) {
    if (explorer.saved.length >= MAX_SAVES || explorer.saved.includes(key)) return;
    const newSaved = [...explorer.saved, key];
    const newFavorite = newSaved.length === 1 ? key : explorer.favorite;
    updateExplorer({ saved: newSaved, favorite: newFavorite });
  }

  function removeItem(key: string) {
    const newSaved = explorer.saved.filter((k: string) => k !== key);
    let newFavorite = explorer.favorite;
    if (newFavorite === key) {
      newFavorite = newSaved.length > 0 ? newSaved[0] : null;
    }
    updateExplorer({ saved: newSaved, favorite: newFavorite });
  }

  function toggleFavorite(key: string) {
    updateExplorer({ favorite: key });
  }

  // ── Chip tap handler ──

  function handleChipTap(key: string) {
    if (loadingChip) return;
    if (activeChip === key && explorer.cached[key]) {
      setActiveChip(null);
      return;
    }
    fetchCapabilityResponse(key);
  }

  // ── Render helpers ──

  const isSaved = (key: string) => explorer.saved.includes(key);
  const currentResponse = activeChip ? explorer.cached[activeChip] : null;
  const isLoading = loadingChip !== null;

  // Sort saved: favorite first
  const sortedSaved = [...explorer.saved].sort((a: string, b: string) => {
    if (a === explorer.favorite) return -1;
    if (b === explorer.favorite) return 1;
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Capabilities Explorer</h3>
      <p className="text-sm text-gray-500 mb-5">
        Tap a capability to see what your reframe reveals through that lens. Save up to 5 — star your favorite.
      </p>

      {/* Individual chips */}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Individual</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {SINGLE_CHIPS.map(({ key, label, icon }) => {
          const isActive = activeChip === key;
          const styles = CHIP_STYLES[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleChipTap(key)}
              disabled={isLoading && loadingChip !== key}
              className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all duration-200 select-none ${
                isActive ? styles.active : styles.inactive
              } ${isLoading && loadingChip !== key ? 'opacity-50 cursor-wait' : 'hover:-translate-y-px'}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {/* Green dot for saved */}
              {isSaved(key) && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Combo chips */}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Combinations</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {COMBO_CHIPS.map(({ key, label, caps }) => {
          const isActive = activeChip === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleChipTap(key)}
              disabled={isLoading && loadingChip !== key}
              className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all duration-200 select-none ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } ${isLoading && loadingChip !== key ? 'opacity-50 cursor-wait' : 'hover:-translate-y-px'}`}
            >
              <span className="flex gap-1">
                {caps.map(c => (
                  <span key={c} className="w-2 h-2 rounded-full inline-block" style={{ background: CAPABILITY_HEX[c] }} />
                ))}
              </span>
              <span>{label}</span>
              {isSaved(key) && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Result area */}
      <div className="min-h-[120px]">
        {!activeChip && !isLoading && (
          <div className="flex items-center justify-center min-h-[120px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm text-center p-6">
            Tap any capability above to explore
          </div>
        )}

        {isLoading && activeChip && (
          <div className="min-h-[120px] rounded-xl bg-gradient-to-r from-purple-50 via-gray-50 to-purple-50 bg-[length:200%_100%] animate-pulse" />
        )}

        {!isLoading && activeChip && currentResponse && (
          <div className="bg-purple-50/40 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Label */}
            <div className="flex items-center gap-2 mb-3">
              {chipColors(activeChip).map((color, i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
              ))}
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: chipColors(activeChip)[0] }}>
                Through {chipLabel(activeChip)}
              </span>
            </div>

            {/* Response text */}
            <p className="text-[15px] leading-relaxed text-gray-700 mb-4">{currentResponse}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-purple-100/60">
              {isSaved(activeChip) ? (
                <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-emerald-500 text-white">
                  Saved
                </button>
              ) : explorer.saved.length >= MAX_SAVES ? (
                <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-gray-300 text-white cursor-not-allowed">
                  5 of 5 saved
                </button>
              ) : (
                <button
                  onClick={() => saveItem(activeChip)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-all hover:-translate-y-px"
                >
                  Save this one
                </button>
              )}
              <span className="text-xs text-gray-400">{explorer.saved.length} of {MAX_SAVES} saved</span>
            </div>
          </div>
        )}
      </div>

      {/* Saved collection */}
      {explorer.saved.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-900">Your Saved Perspectives</h4>
            <span className="text-xs text-gray-400">Star = your favorite</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {sortedSaved.map((key: string) => {
              const isFav = key === explorer.favorite;
              const text = explorer.cached[key] ?? '';
              const colors = chipColors(key);
              return (
                <div
                  key={key}
                  className={`rounded-xl p-4 border-2 transition-all duration-250 ${
                    isFav
                      ? 'border-amber-400 bg-gradient-to-br from-amber-50/50 to-amber-50/20'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Top row: tags + actions */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      {key.includes('+') ? (
                        key.split('+').map(k => (
                          <span key={k} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ background: CAPABILITY_HEX[k] }}>
                            {SINGLE_CHIPS.find(c => c.key === k)?.label ?? k}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ background: colors[0] }}>
                          {chipLabel(key)}
                        </span>
                      )}
                      {isFav && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 ml-2">
                          YOUR FAVORITE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(key)}
                        title={isFav ? 'This is your favorite' : 'Make this your favorite'}
                        className={`text-lg leading-none transition-all duration-200 hover:scale-110 ${
                          isFav ? '' : 'grayscale opacity-35 hover:grayscale-0 hover:opacity-100'
                        }`}
                      >
                        {isFav ? '\u2B50' : '\u2606'}
                      </button>
                      <button
                        onClick={() => removeItem(key)}
                        title="Remove"
                        className="text-sm text-gray-300 hover:text-red-500 transition-colors leading-none"
                      >
                        \u2715
                      </button>
                    </div>
                  </div>
                  {/* Text */}
                  <p className="text-sm leading-relaxed text-gray-600">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
