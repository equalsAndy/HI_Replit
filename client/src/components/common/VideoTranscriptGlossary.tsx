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
      case 'read': return '#22c55e';    // green
      case 'glossary': return '#8b5cf6';// purple
    }
  };

  return (
    <div className="vtg-root bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      {/* Tabs - 32px overlapping rounded boxes */}
      <div className="vtg-tabs-32" role="tablist" aria-label="Lesson content">
        {(['watch','read','glossary'] as const).map(k => {
          const label = k.charAt(0).toUpperCase() + k.slice(1);
          const isActive = tab === k;
          const style = ({ ['--vtg-strip' as any]: stripFor(k) } as React.CSSProperties);
          const muted = ({ ['--vtg-strip-muted' as any]: '#e5e7eb' } as React.CSSProperties);
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
              style={{...style, ...muted}}
            >
              <span className="vtg-pill-32__text">{label}</span>
              <span className="vtg-pill-32__strip" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div
        id="vtg-panel-watch"
        role="tabpanel"
        aria-labelledby="vtg-tab-watch"
        hidden={tab !== 'watch'}
        className="vtg-tabpanel"
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
              <div className="hi-video-shell w-full max-w-2xl mx-auto">
                <iframe
                  ref={inlineRef}
                  src={inlineSrc}
                  title={normTitle}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <p className="mt-2">
                <button onClick={handleLarger} className="text-blue-600 underline">
                  Watch larger
                </button>
              </p>
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

      <div
        id="vtg-panel-read"
        role="tabpanel"
        aria-labelledby="vtg-tab-read"
        hidden={tab !== 'read'}
        className="vtg-tabpanel"
      >
        {transcriptMd ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: transcriptMd }} />
        ) : (
          <div>Transcript not available.</div>
        )}
      </div>

      <div
        id="vtg-panel-glossary"
        role="tabpanel"
        aria-labelledby="vtg-tab-glossary"
        hidden={tab !== 'glossary'}
        className="vtg-tabpanel"
      >
        {glossary && glossary.length > 0 ? (
          <dl className="space-y-2">
            {glossary.map(g => (
              <div key={g.term}>
                <dt className="font-semibold">{g.term}</dt>
                <dd className="ml-4">{g.definition}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div>Glossary not available.</div>
        )}
      </div>
    </div>
  );
}
