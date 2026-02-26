// Canonical IA continuity types for client-side usage

// 5C Capability types for Activation Snapshot system
export type CapabilityType = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

export const CAPABILITY_LABELS: Record<CapabilityType, string> = {
  imagination: 'Imagination',
  curiosity: 'Curiosity',
  caring: 'Caring',
  creativity: 'Creativity',
  courage: 'Courage',
};

export const CAPABILITY_COLORS: Record<CapabilityType, string> = {
  imagination: 'purple',
  curiosity: 'green',      // matches green magnifying glass icon
  caring: 'blue',           // matches blue two-faces icon
  creativity: 'orange',
  courage: 'red',
};

// Maps CapabilityType keys to the category strings used in assessment data.
// 'caring' maps to 'empathy' for backward compatibility with existing saved data.
export const CAPABILITY_CATEGORY_MAP: Record<CapabilityType, string> = {
  imagination: 'imagination',
  curiosity: 'curiosity',
  caring: 'empathy',
  creativity: 'creativity',
  courage: 'courage',
};

export type IAState = {
  ia_4_2: {
    original_thought: string;
    ai_reframe: string;
    user_shift: string;           // canonical
    tag: string;                  // canonical (for timeline tagging)
    new_perspective: string;      // canonical downstream field
    // legacy alias kept for compatibility
    shift?: string;
    capability_stretched?: CapabilityType; // legacy — replaced by capabilities_applied
    capabilities_applied?: CapabilityType[];
    capabilities_imagine?: string;
    tested_capability?: string;
    capability_insight?: string;
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
    capability_stretched?: CapabilityType;
  };
  // IA-4-4: Global Purpose Bridge
  ia_4_4: {
    positive_outcome: string;
    ai_outcome: string[]; // chat messages
    user_possibility: string;
    tag: string;
    expanded_vision: string;
    // new global purpose bridge fields
    higher_purpose?: string;
    global_challenge?: string;
    content_completed?: boolean;
    ai_perspectives?: string;
    chosen_perspective?: string;
    modest_contribution?: string;
    bridge_name?: string;
    world_game_stretch?: string;
    completed?: boolean;
    last_updated?: string;
    // legacy array structure (kept for backward compatibility)
    global_bridges?: Array<{
      id: string;
      higherPurposeId: string;
      globalChallenge: string;
      aiPerspectives: string[];
      chosenPerspective?: string;
      modestContribution: string;
      bridgeName: string;
      worldGameStretch?: string;
      createdAt: string;
      userId: string;
      stepId: string;
    }>;
    // legacy fields kept (backward compatibility)
    expanded_visions?: Array<{
      id: string;
      initialOutcomeId: string;
      vividDescription: string;
      aspects: string[];
      createdAt: string;
      userId: string;
      stepId: string;
    }>;
    interlude_cluster?: string;
    pattern_notes?: string;
    muse_chat?: string[];
    muse_name?: string;
    capability_stretched?: CapabilityType;
  };
  // IA-4-5: Action Planning
  ia_4_5: {
    next_step: string;
    ai_action: string[]; // chat messages
    user_clarity: string;
    tag: string;
    commitment: string;
    // new action planning fields
    action_steps?: Array<{
      id: string;
      interludeId: string;
      description: string;
      timeframe?: string;
      createdAt: string;
      completed?: boolean;
    }>;
    completed?: boolean;
    last_updated?: string;
    // legacy fields kept (from old Bridge)
    purpose_one_line?: string;
    global_challenge?: string;
    global_challenge_other?: string;
    ai_perspectives?: string[];
    what_it_needs?: string;
    contribution?: string;
    bridge_name?: string;
    scale_global?: string;
    capability_stretched?: CapabilityType;
  };
  updatedAt?: string;
};
