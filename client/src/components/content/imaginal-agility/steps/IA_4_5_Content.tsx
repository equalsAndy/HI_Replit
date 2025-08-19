import React, { useEffect } from 'react';
import ActivityPanel from '@/components/workshop/ActivityPanel';
import { useContinuity } from '@/hooks/useContinuity';
import PurposeChallengeExercise from '@/components/ia/PurposeChallengeExercise';

export default function IA_4_5_Content() {
  const { state, set } = useContinuity();

  // One-time migration
  useEffect(() => {
    const legacy = ''; // replace with real getter if you had one
    if (!state.ia_4_5.interlude_cluster && legacy) {
      set('ia_4_5', { interlude_cluster: legacy });
    }
  }, []);

  return (
    <ActivityPanel title="IA-4-5 Purpose & Challenge Exercise">
      <PurposeChallengeExercise />
      <div className="mt-8 flex justify-end">
        <button className="btn-primary">Continue</button>
      </div>
    </ActivityPanel>
  );
}
