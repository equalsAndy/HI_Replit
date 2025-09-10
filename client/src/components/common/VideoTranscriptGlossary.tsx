import React, { useEffect, useMemo, useRef, useState } from "react";
import "../ast/ast-video.css";
import "./video-transcript-glossary.css";

type GlossaryItem = { term: string; definition: string };

type Props = {
  youtubeId: string | null;
  title?: string | null;
  transcriptMd?: string | null;
  glossary?: GlossaryItem[] | null;
};

// Extracts a valid 11-character YouTube ID from raw ID or URL
function getYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const t = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  try {
    const u = new URL(t);
    if (u.hostname.endsWith("youtu.be")) {
      const seg = u.pathname.split("/").filter(Boolean)[0];
      if (/^[A-Za-z0-9_-]{11}$/.test(seg)) return seg;
    }
    if (u.hostname.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const p = u.pathname.split("/").filter(Boolean);
      const i = p.findIndex(x => x === "embed" || x === "v");
      if (i >= 0 && p[i+1] && /^[A-Za-z0-9_-]{11}$/.test(p[i+1])) return p[i+1];
    }
  } catch {}
  return null;
}

export default function VideoTranscriptGlossary({
  youtubeId,
  title,
  transcriptMd,
  glossary,
}: Props) {
  // Helper functions to check if content is meaningful
  const hasRealTranscript = (transcript?: string | null): boolean => {
    if (!transcript) return false;
    const cleaned = transcript.trim().toLowerCase();
    return cleaned.length > 0 && 
           !cleaned.includes('transcript not available') &&
           !cleaned.includes('coming soon') &&
           cleaned !== 'n/a' &&
           cleaned !== 'none';
  };

  const hasRealGlossary = (glossary?: GlossaryItem[] | null): boolean => {
    return glossary && glossary.length > 0;
  };

  // Determine which tabs should be shown
  const showTranscriptTab = hasRealTranscript(transcriptMd);
  const showGlossaryTab = hasRealGlossary(glossary);
  const showTabs = showTranscriptTab || showGlossaryTab;

  const [tab, setTab] = useState<'watch'|'read'|'glossary'>('watch');
  const [modalOpen, setModalOpen] = useState(false);
  const inlineRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLIFrameElement>(null);

  const normTitle = useMemo(() => {
    const s = title || '';
    return s.replace(/\w\S*/g, w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
  }, [title]);

  useEffect(() => {
    // Helps verify which routes use this component and confirm CSS is loaded
    // eslint-disable-next-line no-console
    console.debug("[VTG] mounted", { title: normTitle, youtubeId: youtubeId, tabInitial: tab });
  }, []);

  const id = getYouTubeId(youtubeId || undefined);
  const base = id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  const inlineSrc = base ? `${base}?enablejsapi=1&modestbranding=1&playsinline=1&rel=0` : null;
  
  // Debug logging
  console.log('🎬 VideoTranscriptGlossary debug:', {
    youtubeId,
    extractedId: id,
    base,
    inlineSrc
  });
  const modalSrc  = base ? `${base}?enablejsapi=1&modestbranding=1&playsinline=1&rel=0&autoplay=1` : null;

  const handleLarger = () => {
    inlineRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*'
    );
    setModalOpen(true);
  };
  const handleClose = () => {
    modalRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*'
    );
    setModalOpen(false);
  };

  const stripFor = (k: 'watch'|'read'|'glossary') => {
    switch (k) {
      case 'watch': return '#3b82f6';   // blue
      case 'read': return '#22c55e';    // green (transcript)  
      case 'glossary': return '#8b5cf6';// purple
    }
  };

  // Convert transcript markdown to HTML with enhanced blockquote formatting
  const formatTranscript = (transcript: string) => {
    if (!transcript) return '';
    
    // Convert blockquote-style lines (starting with >) to proper blockquotes
    const formatted = transcript
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('> *"') && trimmed.endsWith('"*')) {
          // Extract the quoted text between > *" and "*
          const text = trimmed.slice(4, -2); // Remove > *" and "*
          return `<blockquote><p>${text}</p></blockquote>`;
        } else if (trimmed.startsWith('# ')) {
          // Convert headers
          return `<h1>${trimmed.slice(2)}</h1>`;
        } else if (trimmed === '') {
          return '<br>';
        } else {
          return `<p>${trimmed}</p>`;
        }
      })
      .join('\n');
    
    return formatted;
  };

  return (
    <div className="vtg-root bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      {/* Tabs - only show if there's transcript or glossary content */}
      {showTabs && (
        <div className="vtg-tabs-32" role="tablist" aria-label="Lesson content">
          {(['watch', ...(showTranscriptTab ? ['read'] : []), ...(showGlossaryTab ? ['glossary'] : [])] as const).map(k => {
            const label = k === 'read' ? 'Transcript' : k.charAt(0).toUpperCase() + k.slice(1);
            const isActive = tab === k;
            const style = ({ ['--vtg-strip' as any]: stripFor(k) } as React.CSSProperties);
            return (
              <button
                key={k}
                role="tab"
                id={`vtg-tab-${k}`}
                aria-controls={`vtg-panel-${k}`}
                aria-selected={isActive}
                onClick={() => setTab(k)}
                className={`vtg-pill-32 ${isActive ? 'is-active' : ''}`}
                type="button"
                style={style}
              >
                <div className="vtg-pill-32__strip" aria-hidden="true" />
                <div className="vtg-pill-32__box">{label}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Panels */}
      <div
        id="vtg-panel-watch"
        role="tabpanel"
        aria-labelledby="vtg-tab-watch"
        hidden={showTabs && tab !== 'watch'}
        className={showTabs ? "vtg-tabpanel" : ""}
      >
        {(() => {
          if (!inlineSrc) {
            return (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
                No video available. Please add a YouTube ID in the admin console.
              </div>
            );
          }
          return (
            <>
              <div className="vtg-video-container hi-video-shell w-full max-w-2xl mx-auto">
                <iframe
                  ref={inlineRef}
                  src={inlineSrc}
                  title={normTitle}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <button onClick={handleLarger} className="vtg-watch-larger-btn">
                <span>▶</span>
                Watch larger
              </button>
              {modalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                  <div className="hi-video-shell relative w-[90vw] max-w-4xl">
                    <iframe
                      ref={modalRef}
                      src={modalSrc!}
                      title={normTitle + ' (larger)'}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                    <button
                      onClick={handleClose}
                      className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-black/60 text-white w-8 h-8"
                      aria-label="Close video"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {showTranscriptTab && (
        <div
          id="vtg-panel-read"
          role="tabpanel"
          aria-labelledby="vtg-tab-read"
          hidden={tab !== 'read'}
          className="vtg-tabpanel"
        >
          <div className="vtg-transcript" dangerouslySetInnerHTML={{ __html: formatTranscript(transcriptMd!) }} />
        </div>
      )}

      {showGlossaryTab && (
        <div
          id="vtg-panel-glossary"
          role="tabpanel"
          aria-labelledby="vtg-tab-glossary"
          hidden={tab !== 'glossary'}
          className="vtg-tabpanel"
        >
          <div className="vtg-glossary">
            <dl>
              {glossary!.map(g => (
                <div key={g.term}>
                  <dt>{g.term}</dt>
                  <dd>{g.definition}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
