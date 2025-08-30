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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      <div className="vtg-tab-container">
        {['watch', 'read', 'glossary'].map(k => {
          const label = k.charAt(0).toUpperCase() + k.slice(1);
          const isActive = tab === k;
          return (
            <div key={k} className="vtg-tab-wrapper">
              <div className="vtg-tab-bg" />
              <button
                onClick={() => setTab(k as any)}
                className={`vtg-tab${isActive ? ' active' : ''}`}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>

      {tab==='watch' && (
        <>
          {inlineSrc ? (
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
                  <div className="hi-video-shell w-[90vw] max-w-4xl">
                    <iframe
                      ref={modalRef}
                      src={modalSrc!}
                      title={normTitle + ' (larger)'}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                    <button onClick={handleClose} className="absolute top-2 right-2 text-white">
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
              No video available. Please add a YouTube ID in the admin console.
            </div>
          )}
        </>
      )}

      {tab==='read' && (
        <div>
          {transcriptMd ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: transcriptMd }} />
          ) : (
            <div>Transcript not available.</div>
          )}
        </div>
      )}

      {tab==='glossary' && (
        <div>
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
      )}
    </div>
  );
}
