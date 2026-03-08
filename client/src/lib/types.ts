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

export interface PulseData {
  choices: Array<{ pair: [string, string]; winner: string; loser: string }>;
  ranking: Array<{ key: string; score: number }>;
  inconsistencies: number;
  completedAt: string;
}

export type IAState = {
  ia_2_1_pulse?: PulseData;
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
  // IA-4-3: Visualization Stretch (v4 — DALL-E image generation)
  ia_4_3: {
    original_image: string | null;      // ia-3-3 image URL (Unsplash)
    original_title: string;             // ia-3-3 one-word title
    original_reflection: string;        // ia-3-3 reflection text
    new_image_photo_id?: number;        // photo_storage ID for DALL-E stretch image
    new_image_url?: string;             // /api/photos/{id} or base64 fallback
    new_title: string;                  // Title for stretch image
    story: string;                      // "What do these two images reveal about your potential?"
    tag: string;                        // Tag selection (set on content area)
    transcript: string[];               // Chat transcript for data/report
    completed: boolean;
    // Image override (for replacing starting image)
    starting_override_image?: string;
    starting_override_title?: string;
    // Capability stretches (post-modal DALL-E features, up to 2)
    capability_stretches?: {
      [capability: string]: {
        text: string;
        photo_id?: number;              // photo_storage ID
        photo_url: string;              // /api/photos/{id} or base64 fallback
        title: string;
        response: string;              // participant's written response
      };
    };
    // Legacy fields kept for backward compatibility
    new_image?: string | null;          // v3 Unsplash URL (legacy)
    capability?: CapabilityType | null; // v3 single capability (legacy)
    current_frame?: string;
    ai_stretch?: string[];
    user_stretch?: string;
    expansion?: string;
    original_frame?: string;
    stretch_name?: string;
    capabilities_selected?: CapabilityType[];
    capabilities_imagine?: string;
    assumptions?: string;
    ai_assumptions?: string[];
    user_insight?: string;
    updated_perspective?: string;
    frame_sentence?: string;
    stretch_vision?: string;
    resistance?: string;
    resistance_type?: string;
    resistance_custom?: string;
    stretch_visualization?: string;
    capability_stretched?: CapabilityType;
  };
  // IA-4-4: Global Purpose Bridge
  ia_4_4: {
    positive_outcome: string;
    ai_outcome: string[]; // chat messages
    user_possibility: string;
    tag: string;
    expanded_vision: string;
    // global purpose bridge fields (v2 — flight simulator redesign)
    higher_purpose?: string;
    global_challenge?: string;
    reframed_view?: string;
    question1?: string;
    question2?: string;
    ai_answer1?: string;
    ai_answer2?: string;
    ai_reflection?: string;
    capabilities_applied?: CapabilityType[];
    capabilities_imagine?: string;
    transcript?: string[];
    completed?: boolean;
    last_updated?: string;
    // legacy v1 bridge fields (backward compatibility)
    content_completed?: boolean;
    ai_perspectives?: string;
    chosen_perspective?: string;
    modest_contribution?: string;
    bridge_name?: string;
    world_game_stretch?: string;
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
