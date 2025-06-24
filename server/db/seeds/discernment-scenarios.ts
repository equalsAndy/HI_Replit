export const discernmentSeedData = [
  // Reality Check Scenarios (3)
  {
    exerciseType: 'reality_check',
    title: 'Mandatory AI Training Announcement',
    content: `<h3>Major Tech Company Announces Mandatory AI Training for All Employees</h3><p>"TechCorp will require all 45,000 employees to complete 40 hours of AI certification by December 31st or face termination. The leaked internal memo reveals concerns about human relevance in the workplace."</p>`,
    questions: [
      {
        question: "What was your immediate emotional response?",
        options: ["Anxiety about job security", "Skepticism about the source", "Curiosity about verification", "Urge to share with colleagues"],
        correct: 1,
        explanation: "Healthy skepticism is the best first response to workplace rumors."
      }
    ],
    metadata: { timer_seconds: 3, difficulty: 2 }
  },
  {
    exerciseType: 'reality_check',
    title: 'Remote Work Productivity Study',
    content: `<h3>New Research: Remote Workers 40% Less Productive, Study Shows</h3><p>"The Institute for Workplace Excellence found remote workers complete 40% fewer tasks than office colleagues."</p>`,
    questions: [
      {
        question: "What would you verify first?",
        options: ["Whether the institute exists", "The study methodology", "Who funded the research", "All of these"],
        correct: 3,
        explanation: "Professional claims require systematic verification."
      }
    ],
    metadata: { timer_seconds: 3, difficulty: 3 }
  },
  {
    exerciseType: 'reality_check',
    title: 'AWS Global Outage Report',
    content: `<h3>Breaking: AWS Experiences Global Outage</h3><p>"Amazon Web Services reported widespread disruptions at 2:47 PM EST. Status page confirms incident with 4-6 hour restoration estimate."</p>`,
    questions: [
      {
        question: "How does this differ from manipulative content?",
        options: ["Specific timestamps", "Official source confirmation", "No emotional manipulation", "All of the above"],
        correct: 3,
        explanation: "Legitimate news includes verifiable details and factual reporting."
      }
    ],
    metadata: { timer_seconds: 3, difficulty: 1 }
  },

  // Visual Detection Scenarios (3)
  {
    exerciseType: 'visual_detection',
    title: 'Tech CEO Conference',
    content: 'Tech CEO announces revolutionary AI breakthrough at industry conference',
    questions: [
      {
        question: "Is this image real or AI-generated?",
        options: ["Real", "Fake"],
        correct: 1,
        explanation: "Check lighting consistency, facial proportions, and background details for manipulation signs."
      }
    ],
    metadata: { 
      image_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
      clues: ["Check lighting consistency", "Look for unnatural proportions", "Examine background details"],
      difficulty: 2
    }
  },
  {
    exerciseType: 'visual_detection',
    title: 'Executive Video Call',
    content: 'Executive team video call discussing Q4 strategy',
    questions: [
      {
        question: "Is this image real or AI-generated?",
        options: ["Real", "Fake"],
        correct: 1,
        explanation: "AI-generated meeting photos often show impossible perfection and unnatural symmetry."
      }
    ],
    metadata: { 
      image_url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80',
      clues: ["Perfect eye contact", "Unnaturally consistent lighting", "Too-perfect symmetry"],
      difficulty: 3
    }
  },
  {
    exerciseType: 'visual_detection',
    title: 'Company Retreat',
    content: 'Annual company retreat team building session - Photo by Alex Johnson/CorpEvents',
    questions: [
      {
        question: "Is this image real or AI-generated?",
        options: ["Real", "Fake"],
        correct: 0,
        explanation: "Professional attribution, natural lighting, and authentic expressions indicate real photography."
      }
    ],
    metadata: { 
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      clues: ["Clear photographer attribution", "Natural lighting", "Authentic expressions"],
      difficulty: 1
    }
  },

  // Toolkit Practice Scenarios (3)
  {
    exerciseType: 'toolkit_practice',
    title: '4-Day Work Week Study',
    content: `"Dr. Elena Rodriguez, Harvard Business School professor, confirms companies implementing 4-day work weeks see 35% productivity increases and 50% lower turnover rates. Her study of 25,000 employees across 75 Fortune 500 companies reveals hidden costs of traditional schedules."`,
    questions: [
      {
        question: "Source Test: What can you verify about Dr. Elena Rodriguez?",
        type: "textarea",
        hint: "Check Harvard faculty directories and recent publications"
      },
      {
        question: "Emotion Test: How does this content make you feel?",
        type: "checkbox",
        options: ["Excited about change", "Skeptical of claims", "Pressure to share", "FOMO about competition"]
      }
    ],
    metadata: { 
      tests: ["source", "emotion", "intention", "coherence", "perspective"],
      difficulty: 2
    }
  },
  {
    exerciseType: 'toolkit_practice',
    title: 'Microsoft AI Manager Replacement',
    content: `"Microsoft insider confirms secret project to replace all middle managers with AI by 2026. 'Project Hierarchy' will eliminate 40,000 positions globally with 60% efficiency improvement."`,
    questions: [
      {
        question: "Source Test: What can you verify about this Microsoft insider?",
        type: "textarea",
        hint: "Look for official statements or credible tech journalism"
      },
      {
        question: "Coherence Test: What seems questionable?",
        type: "checkbox",
        options: ["40,000 is very specific", "No company announces layoffs this way", "60% improvement suspicious", "Timeline unrealistic"]
      }
    ],
    metadata: { 
      tests: ["source", "emotion", "intention", "coherence", "perspective"],
      difficulty: 3
    }
  },
  {
    exerciseType: 'toolkit_practice',
    title: 'AI Productivity Breakthrough',
    content: `"New Stanford research proves AI tools increase knowledge worker productivity by 87%. The landmark study tracked 10,000 professionals using GPT-4 vs traditional methods."`,
    questions: [
      {
        question: "Source Test: Can you verify this Stanford research?",
        type: "textarea",
        hint: "Check Stanford's research database and publication records"
      },
      {
        question: "Intention Test: What is this trying to get you to do?",
        type: "checkbox",
        options: ["Adopt AI tools immediately", "Share with colleagues", "Feel behind if not using AI", "Trust the research authority"]
      }
    ],
    metadata: { 
      tests: ["source", "emotion", "intention", "coherence", "perspective"],
      difficulty: 1
    }
  }
];