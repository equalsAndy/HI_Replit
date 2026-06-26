export type QuestionType = 'scale-1-5' | 'nps-0-10' | 'textarea';

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  leftAnchor?: string;
  rightAnchor?: string;
  placeholder?: string;
}

export interface SurveySection {
  id: 'a' | 'b' | 'c' | 'd';
  title: string;
  subtitle?: string;
  questions: Question[];
}

export interface SurveyConfig {
  workshopSlug: 'ia' | 'ast';
  theme: 'purple' | 'blue';
  heading: string;
  subheading: string;
  sections: SurveySection[];
}

// ─── IA Survey ───────────────────────────────────────────────────────────────

export const iaSurveyConfig: SurveyConfig = {
  workshopSlug: 'ia',
  theme: 'purple',
  heading: 'Before you continue…',
  subheading: 'A short survey about your experience. All questions are optional and your answers are private.',
  sections: [
    {
      id: 'a',
      title: 'Platform Experience',
      subtitle: 'Scale 1–5. All optional.',
      questions: [
        {
          id: 'a1',
          label: 'The platform was easy to access and log into.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a2',
          label: 'The interface was intuitive and easy to navigate.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a3',
          label: 'The sequence of activities felt logical and easy to follow.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a4',
          label: 'The platform loaded quickly and functioned reliably.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a5',
          label: 'The visual design was appealing and professional.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a6',
          label: 'The amount of content was appropriate for the time required.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
      ],
    },
    {
      id: 'b',
      title: 'Imaginal Agility & AI Collaboration Outcomes',
      subtitle: 'Scale 1–5. All optional.',
      questions: [
        {
          id: 'b1',
          label: 'I gained a deeper understanding of imagination as a human capability.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b2',
          label: 'The I4C Prism provided meaningful insight into my capabilities.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b3',
          label: 'The Ladder of Imagination exercises expanded my thinking.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b4',
          label: 'The AI dialogue exercises encouraged deeper reflection.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b5',
          label: 'I am more aware of the difference between thoughtful AI collaboration and simply accepting AI outputs.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b6',
          label: 'I feel more capable of generating alternative possibilities and perspectives.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
      ],
    },
    {
      id: 'c',
      title: 'Retrospective Impact',
      subtitle: 'Scale 1–5. All optional.',
      questions: [
        {
          id: 'c1',
          label: 'Before this experience, I consciously challenged AI outputs.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'c2',
          label: 'After this experience, I consciously challenge AI outputs.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'c3',
          label: 'Before this experience, I regularly explored alternative possibilities and perspectives.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'c4',
          label: 'After this experience, I regularly explore alternative possibilities and perspectives.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
      ],
    },
    {
      id: 'd',
      title: 'Reflection & Value',
      subtitle: 'All optional.',
      questions: [
        {
          id: 'd1',
          label: 'Which exercise had the greatest impact on your thinking and why?',
          type: 'textarea',
          placeholder: 'Share your thoughts…',
        },
        {
          id: 'd2',
          label: 'Did any AI interaction significantly change your thinking? Please explain.',
          type: 'textarea',
          placeholder: 'Share your thoughts…',
        },
        {
          id: 'd3',
          label: 'What action do you intend to take to strengthen your Human–AI Collaboration practices?',
          type: 'textarea',
          placeholder: 'Share your thoughts…',
        },
        {
          id: 'd4',
          label: 'How likely are you to recommend IA to a colleague or friend?',
          type: 'nps-0-10',
          leftAnchor: 'Not likely',
          rightAnchor: 'Extremely likely',
        },
        {
          id: 'd5',
          label: 'If you could change one thing about this experience, what would it be?',
          type: 'textarea',
          placeholder: 'Share your thoughts…',
        },
      ],
    },
  ],
};

// ─── AST Survey ──────────────────────────────────────────────────────────────

export const astSurveyConfig: SurveyConfig = {
  workshopSlug: 'ast',
  theme: 'blue',
  heading: 'Before you go…',
  subheading: 'A short survey about your AllStarTeams experience. All questions are optional and your answers are private.',
  sections: [
    {
      id: 'a',
      title: 'Platform Experience',
      subtitle: 'Scale 1–5. All optional.',
      questions: [
        {
          id: 'a1',
          label: 'The platform was easy to access and log into.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a2',
          label: 'The interface was intuitive and easy to navigate.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a3',
          label: 'The sequence of activities felt logical and easy to follow.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a4',
          label: 'The platform loaded quickly and functioned reliably.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a5',
          label: 'The visual design was appealing and professional.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'a6',
          label: 'The amount of content was appropriate for the time required.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
      ],
    },
    {
      id: 'b',
      title: 'Self-Awareness Outcomes',
      subtitle: 'Scale 1–5. All optional.',
      questions: [
        {
          id: 'b1',
          label: 'I gained a clearer understanding of my core strengths.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b2',
          label: 'I gained new insight into my Flow State.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b3',
          label: 'The Star Card helped me see myself in a new way.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b4',
          label: 'The Wellbeing Ladder increased my awareness of my current situation.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b5',
          label: 'The Future-Self exercise helped clarify my aspirations.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'b6',
          label: 'I can identify practical ways to apply my strengths in daily life.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
      ],
    },
    {
      id: 'c',
      title: 'Retrospective Impact',
      subtitle: 'Scale 1–5. All optional.',
      questions: [
        {
          id: 'c1',
          label: 'Before this experience, I had a clear understanding of my strengths.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'c2',
          label: 'After this experience, I have a clear understanding of my strengths.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'c3',
          label: 'Before this experience, I had a clear vision of my future direction.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
        {
          id: 'c4',
          label: 'After this experience, I have a clear vision of my future direction.',
          type: 'scale-1-5',
          leftAnchor: 'Strongly Disagree',
          rightAnchor: 'Strongly Agree',
        },
      ],
    },
    {
      id: 'd',
      title: 'Reflection & Value',
      subtitle: 'All optional.',
      questions: [
        {
          id: 'd1',
          label: 'Which activity had the greatest impact on you and why?',
          type: 'textarea',
          placeholder: 'Share your thoughts…',
        },
        {
          id: 'd2',
          label: 'What was your most important insight?',
          type: 'textarea',
          placeholder: 'Share your thoughts…',
        },
        {
          id: 'd3',
          label: 'What action do you intend to take as a result of this experience?',
          type: 'textarea',
          placeholder: 'Share your thoughts…',
        },
        {
          id: 'd4',
          label: 'How likely are you to recommend AST to a colleague or friend?',
          type: 'nps-0-10',
          leftAnchor: 'Not likely',
          rightAnchor: 'Extremely likely',
        },
        {
          id: 'd5',
          label: 'If you could change one thing about this experience, what would it be?',
          type: 'textarea',
          placeholder: 'Share your thoughts…',
        },
      ],
    },
  ],
};

export const surveyConfigBySlug: Record<string, SurveyConfig> = {
  ia: iaSurveyConfig,
  ast: astSurveyConfig,
};
