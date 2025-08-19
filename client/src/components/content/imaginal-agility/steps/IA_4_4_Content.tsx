import React, { useEffect } from 'react';
import ActivityPanel from '@/components/workshop/ActivityPanel';
import { useContinuity } from '@/hooks/useContinuity';
import MuseExercise from '@/components/ia/MuseExercise';

export default function IA_4_4_Content() {
  const { state, set } = useContinuity();

  // One-time migration
  useEffect(() => {
    const legacy = ''; // replace with real getter if you had one
    if (!state.ia_4_4.purpose_one_line && legacy) {
      set('ia_4_4', { purpose_one_line: legacy });
    }
  }, []);

  return (
    <ActivityPanel title="IA-4-4 Muse Exercise">
      <MuseExercise />
      <div className="mt-8 flex justify-end">
        <button className="btn-primary">Continue</button>
      </div>
    </ActivityPanel>
  );
}
