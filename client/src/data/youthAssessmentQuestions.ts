export interface AssessmentOption {
  id: string;
  text: string;
  category: 'thinking' | 'acting' | 'feeling' | 'planning';
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  options: AssessmentOption[];
}

// Youth-focused assessment questions adapted for school and life situations
export const youthAssessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    text: 'When solving a problem in a group project, I typically...',
    options: [
      { id: '1a', text: 'Research the facts and think through different solutions', category: 'thinking' },
      { id: '1b', text: 'Talk with my group members to hear their ideas and concerns', category: 'feeling' },
      { id: '1c', text: 'Jump in quickly to find a practical solution', category: 'acting' },
      { id: '1d', text: 'Create a step-by-step plan to tackle the problem', category: 'planning' }
    ]
  },
  {
    id: 2,
    text: 'When starting a new school project, I prefer to...',
    options: [
      { id: '2a', text: 'Get to know my teammates and build good working relationships', category: 'feeling' },
      { id: '2b', text: 'Start working right away and adjust as I go', category: 'acting' },
      { id: '2c', text: 'Break down the project into clear steps with deadlines', category: 'planning' },
      { id: '2d', text: 'Consider different approaches before deciding how to proceed', category: 'thinking' }
    ]
  },
  {
    id: 3,
    text: 'When I get feedback on my schoolwork, I usually...',
    options: [
      { id: '3a', text: 'Make changes right away based on what I heard', category: 'acting' },
      { id: '3b', text: 'Think about how the feedback makes me feel', category: 'feeling' },
      { id: '3c', text: 'Create a plan with specific steps for improvement', category: 'planning' },
      { id: '3d', text: 'Consider how the feedback affects my relationship with the teacher', category: 'feeling' }
    ]
  },
  {
    id: 4,
    text: 'My best contribution to my group is...',
    options: [
      { id: '4a', text: 'Keeping our work on track and meeting deadlines', category: 'planning' },
      { id: '4b', text: 'Taking action and moving our projects forward', category: 'acting' },
      { id: '4c', text: 'Spotting issues and offering thoughtful insights', category: 'thinking' },
      { id: '4d', text: 'Creating a positive atmosphere and supporting others', category: 'feeling' }
    ]
  },
  {
    id: 5,
    text: 'When faced with a surprise test or assignment deadline, I...',
    options: [
      { id: '5a', text: 'Start studying or working immediately to make progress', category: 'acting' },
      { id: '5b', text: 'Check with classmates to see how I can help everyone', category: 'feeling' },
      { id: '5c', text: 'Organize my priorities and create a study plan', category: 'planning' },
      { id: '5d', text: 'Think through the best approach given the time I have', category: 'thinking' }
    ]
  },
  {
    id: 6,
    text: 'In class discussions, I contribute by...',
    options: [
      { id: '6a', text: 'Keeping the conversation focused on our learning goals', category: 'planning' },
      { id: '6b', text: 'Making sure everyone feels heard and valued', category: 'feeling' },
      { id: '6c', text: 'Asking good questions and offering clear insights', category: 'thinking' },
      { id: '6d', text: 'Moving the conversation toward specific conclusions and next steps', category: 'acting' }
    ]
  },
  {
    id: 7,
    text: 'When learning something new, I prefer to...',
    options: [
      { id: '7a', text: 'Follow a clear learning path with defined steps', category: 'planning' },
      { id: '7b', text: 'Learn by actively trying and practicing', category: 'acting' },
      { id: '7c', text: 'Learn alongside friends and share the experience', category: 'feeling' },
      { id: '7d', text: 'Understand the core concepts before moving forward', category: 'thinking' }
    ]
  },
  {
    id: 8,
    text: 'When working with students from other classes or grades, I focus on...',
    options: [
      { id: '8a', text: 'Getting to clear results that benefit everyone', category: 'acting' },
      { id: '8b', text: 'Creating comfortable working relationships', category: 'feeling' },
      { id: '8c', text: 'Setting up a clear process for how we\'ll work together', category: 'planning' },
      { id: '8d', text: 'Understanding their goals and finding connections to mine', category: 'thinking' }
    ]
  },
  {
    id: 9,
    text: 'When preparing for a presentation or report, I spend most time on...',
    options: [
      { id: '9a', text: 'Organizing my content in a clear, logical flow', category: 'planning' },
      { id: '9b', text: 'Finding ways to connect with my audience emotionally', category: 'feeling' },
      { id: '9c', text: 'Gathering compelling information and creating visuals', category: 'thinking' },
      { id: '9d', text: 'Practicing my delivery and preparing for questions', category: 'acting' }
    ]
  },
  {
    id: 10,
    text: 'When handling multiple assignments or activities, I typically...',
    options: [
      { id: '10a', text: 'Think about how my choices affect my friends and family', category: 'feeling' },
      { id: '10b', text: 'Create a schedule that allocates time for each task', category: 'planning' },
      { id: '10c', text: 'Figure out what\'s most important for my goals', category: 'thinking' },
      { id: '10d', text: 'Just start working and build momentum quickly', category: 'acting' }
    ]
  },
  {
    id: 11,
    text: 'When dealing with disagreements with friends or classmates, I...',
    options: [
      { id: '11a', text: 'Follow steps I\'ve learned for resolving conflicts', category: 'planning' },
      { id: '11b', text: 'Take quick, direct action to find a resolution', category: 'acting' },
      { id: '11c', text: 'Focus on keeping good relationships with everyone involved', category: 'feeling' },
      { id: '11d', text: 'Look at all sides of the situation objectively', category: 'thinking' }
    ]
  },
  {
    id: 12,
    text: 'When using a new app, technology, or learning system, I...',
    options: [
      { id: '12a', text: 'Adapt quickly and find ways to make it work well for me', category: 'acting' },
      { id: '12b', text: 'Follow the recommended steps carefully', category: 'planning' },
      { id: '12c', text: 'Evaluate thoroughly how it improves my learning', category: 'thinking' },
      { id: '12d', text: 'Think about how it affects my friends\' and my experience', category: 'feeling' }
    ]
  },
  {
    id: 13,
    text: 'I learn best in an environment that...',
    options: [
      { id: '13a', text: 'Has clear guidelines and expectations', category: 'planning' },
      { id: '13b', text: 'Supports teamwork and positive relationships', category: 'feeling' },
      { id: '13c', text: 'Gives me freedom to take initiative', category: 'acting' },
      { id: '13d', text: 'Encourages deep thinking and new ideas', category: 'thinking' }
    ]
  },
  {
    id: 14,
    text: 'In brainstorming sessions or group planning, I tend to...',
    options: [
      { id: '14a', text: 'Push for new ideas we can put into action quickly', category: 'acting' },
      { id: '14b', text: 'Help organize ideas and develop next steps', category: 'planning' },
      { id: '14c', text: 'Build on others\' ideas and look for connections', category: 'thinking' },
      { id: '14d', text: 'Create a positive space where everyone shares freely', category: 'feeling' }
    ]
  },
  {
    id: 15,
    text: 'When facing changes in school or my routine, I...',
    options: [
      { id: '15a', text: 'Try to adapt quickly and embrace the change', category: 'acting' },
      { id: '15b', text: 'Try to understand the reasons behind the change', category: 'thinking' },
      { id: '15c', text: 'Create a plan to adapt while staying on track', category: 'planning' },
      { id: '15d', text: 'Quickly adjust and look for new opportunities', category: 'acting' }
    ]
  },
  {
    id: 16,
    text: 'When setting goals for my future, I focus on...',
    options: [
      { id: '16a', text: 'Creating a clear path with specific milestones', category: 'planning' },
      { id: '16b', text: 'Building meaningful connections and relationships', category: 'feeling' },
      { id: '16c', text: 'Growing my knowledge and skills', category: 'thinking' },
      { id: '16d', text: 'Taking on new challenges and achieving results', category: 'acting' }
    ]
  },
  {
    id: 17,
    text: 'When giving feedback to friends or classmates, I focus on...',
    options: [
      { id: '17a', text: 'Being supportive and thinking about how they\'ll feel', category: 'feeling' },
      { id: '17b', text: 'Suggesting practical improvements they can start right away', category: 'acting' },
      { id: '17c', text: 'Providing a structured approach they can follow to improve', category: 'planning' },
      { id: '17d', text: 'Providing specific examples and observations', category: 'thinking' }
    ]
  },
  {
    id: 18,
    text: 'In group meetings or discussions, I usually...',
    options: [
      { id: '18a', text: 'Keep discussions on topic and on schedule', category: 'planning' },
      { id: '18b', text: 'Push for clear decisions and action items', category: 'acting' },
      { id: '18c', text: 'Make sure everyone has a chance to participate', category: 'feeling' },
      { id: '18d', text: 'Analyze information being shared', category: 'thinking' }
    ]
  },
  {
    id: 19,
    text: 'When given an unclear assignment or task, I...',
    options: [
      { id: '19a', text: 'Break it down into different steps and components', category: 'planning' },
      { id: '19b', text: 'Just jump in and start where I can', category: 'acting' },
      { id: '19c', text: 'Gather more information to understand what\'s needed', category: 'thinking' },
      { id: '19d', text: 'Talk with others to understand different expectations', category: 'feeling' }
    ]
  },
  {
    id: 20,
    text: 'For my personal growth and development, I...',
    options: [
      { id: '20a', text: 'Build relationships with mentors and learn from others', category: 'feeling' },
      { id: '20b', text: 'Follow a structured development plan with clear goals', category: 'planning' },
      { id: '20c', text: 'Take on challenging activities that stretch my abilities', category: 'acting' },
      { id: '20d', text: 'Seek to deepen my understanding of key concepts', category: 'thinking' }
    ]
  },
  {
    id: 21,
    text: 'In group projects, I naturally become...',
    options: [
      { id: '21a', text: 'The coordinator who tracks progress and deadlines', category: 'planning' },
      { id: '21b', text: 'The analyzer who evaluates options and solves problems', category: 'thinking' },
      { id: '21c', text: 'The supporter who ensures everyone works well together', category: 'feeling' },
      { id: '21d', text: 'The initiator who gets things moving', category: 'acting' }
    ]
  },
  {
    id: 22,
    text: 'I feel most engaged in activities when...',
    options: [
      { id: '22a', text: 'Following clear processes with well-defined steps', category: 'planning' },
      { id: '22b', text: 'Taking action and seeing immediate results', category: 'acting' },
      { id: '22c', text: 'Working with others in a supportive environment', category: 'feeling' },
      { id: '22d', text: 'Solving complex problems that make me think', category: 'thinking' }
    ]
  }
];

// Create a mapping of option IDs to their categories for scoring
export const optionCategoryMapping: Record<string, 'thinking' | 'feeling' | 'acting' | 'planning'> = {};

youthAssessmentQuestions.forEach(question => {
  question.options.forEach(option => {
    optionCategoryMapping[option.id] = option.category;
  });
});