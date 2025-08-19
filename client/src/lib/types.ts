// Canonical IA continuity types for client-side usage

export type IAState = {
  ia_4_2: {
    original_thought: string;
    ai_reframe: string;
    user_shift: string;           // canonical
    tag: string;                  // canonical (for timeline tagging)
    new_perspective: string;      // canonical downstream field
    // legacy alias kept for compatibility
    shift?: string;
  };
  // IA-4-3: Exploring Underlying Assumptions
  ia_4_3: {
    assumptions: string;
    ai_assumptions: string[]; // chat messages
    user_insight: string;
    tag: string;
    updated_perspective: string;
    // legacy fields kept (from old Stretch flow)
    frame_sentence?: string;
    ai_stretch?: string;
    stretch_vision?: string;
    resistance?: string;
  };
  // IA-4-4: Imagining Positive Outcomes
  ia_4_4: {
    positive_outcome: string;
    ai_outcome: string[]; // chat messages
    user_possibility: string;
    tag: string;
    expanded_vision: string;
    // legacy fields kept (from old Muse)
    interlude_cluster?: string;
    pattern_notes?: string;
    muse_chat?: string[];
    muse_name?: string;
  };
  // IA-4-5: Action Planning
  ia_4_5: {
    next_step: string;
    ai_action: string[]; // chat messages
    user_clarity: string;
    tag: string;
    commitment: string;
    // legacy fields kept (from old Bridge)
    purpose_one_line?: string;
    global_challenge?: string;
    global_challenge_other?: string;
    ai_perspectives?: string[];
    what_it_needs?: string;
    contribution?: string;
    bridge_name?: string;
    scale_global?: string;
  };
  updatedAt?: string;
};
