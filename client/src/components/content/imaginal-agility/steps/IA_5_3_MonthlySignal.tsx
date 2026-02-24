import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA53ContentProps {
  onNext?: (stepId: string) => void;
}

interface IA53StepData {
  signal_ratings: Record<string, number>;
  commitment_check: string;
  signal_reflection: string;
}

const INITIAL_DATA: IA53StepData = {
  signal_ratings: {},
  commitment_check: '',
  signal_reflection: '',
};

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

const CAPABILITIES: { key: CapabilityKey; label: string; color: string }[] = [
  { key: 'imagination', label: 'Imagination', color: '#8b5cf6' },
  { key: 'curiosity',   label: 'Curiosity',   color: '#3b82f6' },
  { key: 'caring',      label: 'Caring',      color: '#10b981' },
  { key: 'creativity',  label: 'Creativity',  color: '#f59e0b' },
  { key: 'courage',     label: 'Courage',     color: '#ef4444' },
];

const CAPABILITY_SIGNALS: Record<CapabilityKey, string> = {
  imagination: 'Generating possibilities, seeing beyond what exists, asking "what if"',
  curiosity: 'Asking questions, exploring unfamiliar territory, seeking to understand',
  caring: "Noticing others' needs, building trust, considering impact on people",
  creativity: "Combining ideas in new ways, prototyping, making something that didn't exist",
  courage: 'Speaking up, taking risks, acting despite uncertainty',
};

const MONTH_LABELS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];

const IA_5_3_MonthlySignal: React.FC<IA53ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-5-3');

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-5-3 Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-5-3 No video data found for step ia-5-3');
    }
  }, [videoData, isLoading]);

  const { data, updateData } = useWorkshopStepData<IA53StepData>(
    'ia',
    'ia-5-3',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true }
  );

  // Read ia-5-2 commitment data
  const { data: commitmentResponse } = useQuery({
    queryKey: ['/api/workshop-data/step/ia/ia-5-2'],
    queryFn: async () => {
      const res = await fetch('/api/workshop-data/step/ia/ia-5-2', { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });
  const commitmentData = (commitmentResponse as any)?.data || {};

  const focusCapability = commitmentData.selected_capability
    ? (commitmentData.selected_capability as string).charAt(0).toUpperCase() +
      (commitmentData.selected_capability as string).slice(1)
    : 'Not yet selected';

  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const setRating = (cap: string, rating: number) => {
    updateData({
      signal_ratings: { ...data.signal_ratings, [cap]: rating },
    });
  };

  const COMMITMENT_OPTIONS = [
    { value: 'practicing', label: 'Practicing consistently' },
    { value: 'adjusting',  label: 'Adjusting my approach' },
    { value: 'exploring',  label: 'Exploring something different' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      <h1 className="text-3xl font-bold text-purple-700 mb-2">Your Monthly Signal</h1>
      <p className="text-lg text-muted-foreground mb-8">Tracking your developmental direction.</p>

      {/* Video */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'NUnJc82ptd4'}
        title={videoData?.title || "Monthly Capability Signal"}
        transcriptMd={null}
        glossary={null}
      />

      {/* Intro */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
        <p className="text-lg text-gray-700 leading-relaxed">
          The Monthly Capability Signal is how insight becomes sustained growth. Each month, you reflect briefly
          on how your capabilities are showing up in practice.
        </p>
      </div>

      {/* Month 1 Signal Card */}
      <div className="bg-white rounded-xl shadow-lg border-l-4 border-purple-500 border border-gray-200 mb-6 overflow-hidden">
        {/* Card Header */}
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
          <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Month 1 Signal</p>
          <p className="text-gray-600 text-sm mt-1">
            {todayLabel} &nbsp;·&nbsp; Focus: <span className="font-medium text-purple-700">{focusCapability}</span>
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Capability Ratings */}
          <div>
            <p className="text-base font-semibold text-gray-700 mb-4">How present was each capability this month?</p>
            <div className="space-y-1">
              {CAPABILITIES.map(({ key, label, color }) => {
                const isFocus = commitmentData.selected_capability === key;
                const currentRating = data.signal_ratings[key] || 0;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg ${isFocus ? 'bg-purple-50' : ''}`}
                  >
                    <div className="w-52 flex-shrink-0">
                      <span className="text-base font-semibold" style={{ color }}>
                        {label}
                        {isFocus && <span className="ml-1 text-sm text-purple-500">★</span>}
                      </span>
                      <p className="text-sm text-gray-500 leading-snug mt-0.5">
                        {CAPABILITY_SIGNALS[key]}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(key, n)}
                          className="w-10 h-10 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1"
                          style={{
                            backgroundColor: n <= currentRating ? color : 'transparent',
                            borderColor: n <= currentRating ? color : '#d1d5db',
                          }}
                          aria-label={`Rate ${label} ${n}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-500 ml-1 w-4">{currentRating > 0 ? currentRating : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Commitment Check */}
          {commitmentData.commitment_text && (
            <div>
              <blockquote className="border-l-4 border-purple-300 pl-4 text-gray-700 italic text-sm mb-4">
                "{commitmentData.commitment_text}"
              </blockquote>
              <p className="text-sm font-semibold text-gray-700 mb-3">How's it going?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {COMMITMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateData({ commitment_check: opt.value })}
                    className={`px-4 py-2 rounded-lg text-sm border-2 transition-all text-left ${
                      data.commitment_check === opt.value
                        ? 'border-purple-500 bg-purple-50 text-purple-800 font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reflection */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">What have you noticed?</p>
            <Textarea
              rows={2}
              placeholder="What I've noticed this month..."
              value={data.signal_reflection}
              onChange={(e) => updateData({ signal_reflection: e.target.value })}
              className="border-gray-200 focus:border-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Signal Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
        <div className="flex items-end justify-center gap-4 mb-4">
          {MONTH_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  i === 0
                    ? 'bg-purple-600 border-purple-600'
                    : 'bg-transparent border-gray-300 border-dashed'
                }`}
              />
              <span className={`text-xs font-medium ${i === 0 ? 'text-purple-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">
          Your signals build a visible arc over time. This is how development becomes visible.
        </p>
      </div>

      {/* What This Builds */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
        <p className="text-gray-700 text-sm leading-relaxed">
          Reveals how consistently your commitment shows up &nbsp;·&nbsp;
          Clarifies shifts in how you think and operate &nbsp;·&nbsp;
          Strengthens your developmental direction &nbsp;·&nbsp;
          Builds a visible arc of continuity
        </p>
      </div>

      {/* Continue — not gated */}
      <div className="flex justify-end">
        <Button
          onClick={() => onNext?.('ia-5-4')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to HaiQ →
        </Button>
      </div>
    </div>
  );
};

export default IA_5_3_MonthlySignal;
