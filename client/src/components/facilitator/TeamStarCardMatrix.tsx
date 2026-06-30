import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAttributeColor } from '@/components/starcard/starCardConstants';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StrengthEntry {
  type: 'thinking' | 'feeling' | 'acting' | 'planning';
  score: number;
}

interface TeamMember {
  id: number;
  name: string;
  strengths: StrengthEntry[];
  flowAttributes: string[];
  hasData: boolean;
}

// ── Colors ────────────────────────────────────────────────────────────────────

const STRENGTH_COLORS: Record<string, string> = {
  thinking: 'rgb(1, 162, 82)',
  acting:   'rgb(241, 64, 64)',
  feeling:  'rgb(22, 126, 253)',
  planning: 'rgb(255, 203, 47)',
};

const ORDINALS = ['1st', '2nd', '3rd', '4th'];

// ── Square cells ──────────────────────────────────────────────────────────────

function StrengthSquare({ type, score }: { type: string; score: number }) {
  return (
    <div
      style={{
        width: 76,
        height: 76,
        backgroundColor: STRENGTH_COLORS[type] ?? '#9ca3af',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        flexShrink: 0,
      }}
    >
      <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {type}
      </span>
      <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
        {score % 1 === 0 ? score : score.toFixed(1)}
      </span>
    </div>
  );
}

function FlowSquare({ attribute }: { attribute: string }) {
  return (
    <div
      style={{
        width: 76,
        height: 76,
        backgroundColor: getAttributeColor(attribute),
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 6px',
        flexShrink: 0,
      }}
    >
      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
        {attribute}
      </span>
    </div>
  );
}

function EmptySquare() {
  return (
    <div
      style={{
        width: 76,
        height: 76,
        backgroundColor: '#e5e7eb',
        borderRadius: 6,
        flexShrink: 0,
      }}
    />
  );
}

function StrengthShapeCell({ strengths }: { strengths: StrengthEntry[] }) {
  const BAR_W = 14;
  const BAR_GAP = 4;
  const MAX_BAR_H = 44;

  const sorted = [...strengths].sort((a, b) => b.score - a.score);
  const maxScore = sorted[0]?.score || 1;

  if (sorted.length === 0) return <EmptySquare />;

  return (
    <div
      style={{
        width: 76,
        height: 76,
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '6px 0 14px 0',
        flexShrink: 0,
        gap: BAR_GAP,
      }}
    >
      {sorted.map((s) => {
        const h = Math.max(4, Math.round((s.score / maxScore) * MAX_BAR_H));
        return (
          <div key={s.type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div
              style={{
                width: BAR_W,
                height: h,
                backgroundColor: STRENGTH_COLORS[s.type] ?? '#9ca3af',
                borderRadius: '2px 2px 0 0',
              }}
            />
            <span style={{ fontSize: 7, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', lineHeight: 1 }}>
              {s.type.charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Matrix rendering ──────────────────────────────────────────────────────────

function MatrixTable({ members, tableRef }: { members: TeamMember[]; tableRef?: React.RefObject<HTMLDivElement> }) {
  const COL   = 88;   // column width for each square cell
  const SHAPE = 96;   // strengths shape column width
  const NAME  = 180;  // name column width
  const GAP   = 24;   // gap between Core Strengths and Flow Amplifiers groups

  const headerStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    textAlign: 'center',
  };

  const subHeaderStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: '#6b7280',
    textAlign: 'center',
    width: COL,
    flexShrink: 0,
  };

  return (
    <div ref={tableRef} style={{ display: 'inline-block', padding: '24px 28px', background: '#fff', borderRadius: 12, minWidth: 'max-content' }}>
      {/* Group headers */}
      <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 6, paddingLeft: NAME }}>
        <div style={{ width: COL * 4, ...headerStyle }}>Core Strengths</div>
        <div style={{ width: GAP, flexShrink: 0 }} />
        <div style={{ width: SHAPE, ...headerStyle, fontSize: 16, color: '#6b7280' }}>Shape</div>
        <div style={{ width: GAP, flexShrink: 0 }} />
        <div style={{ width: COL * 4, ...headerStyle }}>Flow Amplifiers</div>
      </div>

      {/* Column sub-headers */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ width: NAME, fontSize: 16, fontWeight: 700, color: '#111827' }}>Team</div>
        {ORDINALS.map(o => <div key={o} style={subHeaderStyle}>{o}</div>)}
        <div style={{ width: GAP, flexShrink: 0 }} />
        <div style={{ width: SHAPE, flexShrink: 0 }} />
        <div style={{ width: GAP, flexShrink: 0 }} />
        {ORDINALS.map(o => <div key={o} style={subHeaderStyle}>{o}</div>)}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#e5e7eb', marginBottom: 16 }} />

      {/* Data rows */}
      {members.map((member, idx) => (
        <div
          key={member.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            marginBottom: idx < members.length - 1 ? 12 : 0,
          }}
        >
          {/* Name */}
          <div style={{ width: NAME, paddingRight: 12, flexShrink: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: '#111827', lineHeight: 1.3, display: 'block' }}>
              {member.name}
            </span>
          </div>

          {/* Core Strengths */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ width: COL, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              {member.strengths[i]
                ? <StrengthSquare type={member.strengths[i].type} score={member.strengths[i].score} />
                : <EmptySquare />}
            </div>
          ))}

          {/* Gap */}
          <div style={{ width: GAP, flexShrink: 0 }} />

          {/* Strengths Shape */}
          <div style={{ width: SHAPE, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            {member.strengths.length > 0
              ? <StrengthShapeCell strengths={member.strengths} />
              : <EmptySquare />}
          </div>

          {/* Gap */}
          <div style={{ width: GAP, flexShrink: 0 }} />

          {/* Flow Amplifiers */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ width: COL, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              {member.flowAttributes[i]
                ? <FlowSquare attribute={member.flowAttributes[i]} />
                : <EmptySquare />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Team summary (aggregated bar + pie) ───────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function TeamSummaryCard({
  members,
  cohortName,
  summaryRef,
}: {
  members: TeamMember[];
  cohortName: string;
  summaryRef: React.RefObject<HTMLDivElement>;
}) {
  const totals: Record<string, number> = { thinking: 0, acting: 0, feeling: 0, planning: 0 };
  members.forEach(m => m.strengths.forEach(s => { totals[s.type] = (totals[s.type] || 0) + s.score; }));

  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const sorted = (['thinking', 'acting', 'feeling', 'planning'] as const)
    .map(type => ({
      type,
      score: totals[type] || 0,
      color: STRENGTH_COLORS[type],
      pct: Math.round(((totals[type] || 0) / total) * 100),
    }))
    .sort((a, b) => b.score - a.score);

  const maxScore = sorted[0].score;

  // SVG pie
  const PIE = 200;
  const cx = PIE / 2, cy = PIE / 2, r = PIE / 2 - 6;
  let angle = -90;
  const slices = sorted.map(d => {
    const sweep = (d.score / total) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    const s = polarToCartesian(cx, cy, r, start);
    const e = polarToCartesian(cx, cy, r, end);
    const large = sweep > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`;
    const mid = polarToCartesian(cx, cy, r * 0.62, start + sweep / 2);
    return { ...d, path, lx: mid.x, ly: mid.y };
  });

  // Legend
  const LABEL: Record<string, string> = { thinking: 'Thinking', acting: 'Acting', feeling: 'Feeling', planning: 'Planning' };

  return (
    <div
      ref={summaryRef}
      style={{
        display: 'inline-block',
        padding: '28px 36px',
        background: '#fff',
        borderRadius: 12,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        minWidth: 520,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Team Strengths Shape</div>
      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>{cohortName} — {members.length} participant{members.length !== 1 ? 's' : ''}</div>

      <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end' }}>
        {/* Bar chart */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>Relative Strength</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
            {sorted.map(d => {
              const h = Math.max(36, Math.round((d.score / maxScore) * 130));
              return (
                <div key={d.type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{d.pct}%</span>
                  <div style={{
                    width: 44,
                    height: h,
                    backgroundColor: d.color,
                    borderRadius: '3px 3px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>{Math.round(d.score)}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{LABEL[d.type]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie chart */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>Distribution</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <svg width={PIE} height={PIE}>
              {slices.map(s => (
                <g key={s.type}>
                  <path d={s.path} fill={s.color} />
                  <text x={s.lx} y={s.ly - 6} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={11} fontWeight="bold">
                    {LABEL[s.type].charAt(0)}
                  </text>
                  <text x={s.lx} y={s.ly + 8} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={10}>
                    {s.pct}%
                  </text>
                </g>
              ))}
            </svg>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ width: 12, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#9ca3af', width: 68 }} />
                <span style={{ fontSize: 11, color: '#9ca3af', width: 32, textAlign: 'right' }}>%</span>
                <span style={{ fontSize: 11, color: '#9ca3af', width: 48, textAlign: 'right' }}>Total</span>
              </div>
              {sorted.map(d => (
                <div key={d.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, backgroundColor: d.color, borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 500, width: 68 }}>{LABEL[d.type]}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af', width: 32, textAlign: 'right' }}>{d.pct}%</span>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, width: 48, textAlign: 'right' }}>{Math.round(d.score)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main modal component ──────────────────────────────────────────────────────

interface TeamStarCardMatrixProps {
  cohortId: number;
  cohortName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamStarCardMatrix({ cohortId, cohortName, isOpen, onClose }: TeamStarCardMatrixProps) {
  const matrixRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingSummary, setDownloadingSummary] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<{ success: boolean; members: TeamMember[] }>({
    queryKey: [`/api/facilitator/cohorts/${cohortId}/team-matrix`],
    enabled: isOpen,
  });

  const members = data?.members ?? [];
  const membersWithData = members.filter(m => m.hasData);

  async function captureAndDownload(ref: React.RefObject<HTMLDivElement>, filename: string, label: string, setLoading: (v: boolean) => void) {
    if (!ref.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'Downloaded', description: `${label} saved.` });
      }, 'image/png');
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: 'Download failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const slug = cohortName.toLowerCase().replace(/[^a-z0-9]/g, '-');

  function handleDownload() {
    captureAndDownload(matrixRef, `${slug}-team-matrix.png`, 'Team matrix image', setDownloading);
  }

  function handleDownloadSummary() {
    captureAndDownload(summaryRef, `${slug}-team-strengths-summary.png`, 'Team strengths summary', setDownloadingSummary);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-fit max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Team StarCard Matrix — {cohortName}</DialogTitle>
          <DialogDescription>
            Core strength rankings and flow amplifiers for each participant.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading team data…</span>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm py-4">Failed to load team data. Please try again.</p>
          )}

          {!isLoading && !error && members.length === 0 && (
            <p className="text-gray-500 text-sm py-4">No participants found in this cohort.</p>
          )}

          {!isLoading && !error && members.length > 0 && (
            <>
              {membersWithData.length < members.length && (
                <p className="text-sm text-amber-600 mb-3">
                  {members.length - membersWithData.length} participant{members.length - membersWithData.length > 1 ? 's have' : ' has'} not yet completed the assessment and will appear with empty squares.
                </p>
              )}
              <div className="overflow-x-auto">
                <MatrixTable members={members} tableRef={matrixRef} />
              </div>

              {membersWithData.length > 0 && (
                <>
                  <div className="my-6 border-t" />
                  <div className="overflow-x-auto">
                    <TeamSummaryCard members={membersWithData} cohortName={cohortName} summaryRef={summaryRef} />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isLoading && membersWithData.length > 0 && (
            <Button variant="outline" onClick={handleDownloadSummary} disabled={downloadingSummary}>
              {downloadingSummary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading…
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Team Summary
                </>
              )}
            </Button>
          )}
          {!isLoading && members.length > 0 && (
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading…
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Matrix
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
