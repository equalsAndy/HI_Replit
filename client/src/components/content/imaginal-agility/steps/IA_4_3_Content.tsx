import React, { useEffect } from 'react';
import ActivityPanel from '@/components/workshop/ActivityPanel';
import { useContinuity } from '@/hooks/useContinuity';
import StretchExercise from '@/components/ia/StretchExercise';

export default function IA_4_3_Content() {
  const { state, set } = useContinuity();

  // One-time migration from any legacy storage (if needed)
  useEffect(() => {
    const legacy = ''; // replace with real getter if you had one
    if (!state.ia_4_3.frame_sentence && legacy) {
      set('ia_4_3', { frame_sentence: legacy });
    }
  }, []);

  return (
    <ActivityPanel title="IA-4-3 Stretch Exercise">
      <StretchExercise />
      <div className="mt-8 flex justify-end">
        <button className="btn-primary">Continue</button>
      </div>
    </ActivityPanel>
  );
}