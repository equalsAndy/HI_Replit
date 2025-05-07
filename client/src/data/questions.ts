import { AssessmentQuestion } from "@shared/schema";
import { nanoid } from "nanoid";

/**
 * This is a backup set of assessment questions in case the server-side ones are unavailable.
 * In a production app, these would come from the database via the API.
 */
export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    text: "When starting a new project, I prefer to...",
    options: [
      { id: nanoid(), text: "Start working right away and adjust as I go", category: "acting" },
      { id: nanoid(), text: "Get to know my teammates and build good working relationships", category: "feeling" },
      { id: nanoid(), text: "Break down the work into clear steps with deadlines", category: "planning" },
      { id: nanoid(), text: "Consider different approaches before deciding how to proceed", category: "thinking" }
    ]
  },
  {
    id: 2,
    text: "When faced with a challenge, I typically...",
    options: [
      { id: nanoid(), text: "Tackle it head-on and find a quick solution", category: "acting" },
      { id: nanoid(), text: "Talk it through with others to understand their perspectives", category: "feeling" },
      { id: nanoid(), text: "Create a detailed plan to overcome it systematically", category: "planning" },
      { id: nanoid(), text: "Analyze the root cause and consider multiple solutions", category: "thinking" }
    ]
  },
  {
    id: 3,
    text: "In team discussions, I am most likely to...",
    options: [
      { id: nanoid(), text: "Push for decisions and action steps", category: "acting" },
      { id: nanoid(), text: "Ensure everyone's voices and feelings are considered", category: "feeling" },
      { id: nanoid(), text: "Keep the conversation focused on our goals and timeline", category: "planning" },
      { id: nanoid(), text: "Ask questions and explore implications of different ideas", category: "thinking" }
    ]
  },
  {
    id: 4,
    text: "I am most motivated by...",
    options: [
      { id: nanoid(), text: "Seeing tangible results of my work", category: "acting" },
      { id: nanoid(), text: "Creating positive experiences for others", category: "feeling" },
      { id: nanoid(), text: "Achieving milestones and completing goals", category: "planning" },
      { id: nanoid(), text: "Learning new concepts and gaining insights", category: "thinking" }
    ]
  },
  {
    id: 5,
    text: "When making decisions, I tend to...",
    options: [
      { id: nanoid(), text: "Go with my gut and decide quickly", category: "acting" },
      { id: nanoid(), text: "Consider how it will affect people involved", category: "feeling" },
      { id: nanoid(), text: "Evaluate options against our objectives", category: "planning" },
      { id: nanoid(), text: "Gather all available information before deciding", category: "thinking" }
    ]
  },
  {
    id: 6,
    text: "My ideal work environment is one where...",
    options: [
      { id: nanoid(), text: "I can take initiative and make things happen", category: "acting" },
      { id: nanoid(), text: "There's a supportive team atmosphere", category: "feeling" },
      { id: nanoid(), text: "Tasks and expectations are clearly defined", category: "planning" },
      { id: nanoid(), text: "I can explore ideas and solve complex problems", category: "thinking" }
    ]
  },
  {
    id: 7,
    text: "When giving feedback, I focus most on...",
    options: [
      { id: nanoid(), text: "What needs to be done differently next time", category: "acting" },
      { id: nanoid(), text: "Providing encouragement and building confidence", category: "feeling" },
      { id: nanoid(), text: "How well goals and timelines were met", category: "planning" },
      { id: nanoid(), text: "The quality and depth of the thinking", category: "thinking" }
    ]
  },
  {
    id: 8,
    text: "I find it most frustrating when others...",
    options: [
      { id: nanoid(), text: "Take too long to act or make decisions", category: "acting" },
      { id: nanoid(), text: "Ignore how their actions affect team morale", category: "feeling" },
      { id: nanoid(), text: "Don't follow through on commitments", category: "planning" },
      { id: nanoid(), text: "Overlook important details or implications", category: "thinking" }
    ]
  },
  {
    id: 9,
    text: "When learning something new, I prefer to...",
    options: [
      { id: nanoid(), text: "Jump in and try it out", category: "acting" },
      { id: nanoid(), text: "Learn alongside others and share experiences", category: "feeling" },
      { id: nanoid(), text: "Follow a structured approach with clear steps", category: "planning" },
      { id: nanoid(), text: "Understand the concepts and principles first", category: "thinking" }
    ]
  },
  {
    id: 10,
    text: "I feel most productive when...",
    options: [
      { id: nanoid(), text: "I can see immediate results from my efforts", category: "acting" },
      { id: nanoid(), text: "I'm making a positive difference for others", category: "feeling" },
      { id: nanoid(), text: "I'm checking things off my to-do list", category: "planning" },
      { id: nanoid(), text: "I'm developing innovative solutions to problems", category: "thinking" }
    ]
  },
  {
    id: 11,
    text: "In meetings, I typically...",
    options: [
      { id: nanoid(), text: "Get straight to the point and focus on action items", category: "acting" },
      { id: nanoid(), text: "Pay attention to how people are feeling and responding", category: "feeling" },
      { id: nanoid(), text: "Make sure we have an agenda and stick to it", category: "planning" },
      { id: nanoid(), text: "Raise important questions and challenge assumptions", category: "thinking" }
    ]
  },
  {
    id: 12,
    text: "When under pressure, I tend to...",
    options: [
      { id: nanoid(), text: "Take immediate action to address the situation", category: "acting" },
      { id: nanoid(), text: "Connect with others for support and collaboration", category: "feeling" },
      { id: nanoid(), text: "Focus on priorities and stick to my plan", category: "planning" },
      { id: nanoid(), text: "Step back to analyze the bigger picture", category: "thinking" }
    ]
  },
  {
    id: 13,
    text: "I contribute most to teams through my ability to...",
    options: [
      { id: nanoid(), text: "Get things done and drive results", category: "acting" },
      { id: nanoid(), text: "Build relationships and foster collaboration", category: "feeling" },
      { id: nanoid(), text: "Organize work and ensure accountability", category: "planning" },
      { id: nanoid(), text: "Generate ideas and solve complex problems", category: "thinking" }
    ]
  },
  {
    id: 14,
    text: "When receiving instructions, I prefer them to be...",
    options: [
      { id: nanoid(), text: "Brief and straight to the point", category: "acting" },
      { id: nanoid(), text: "Delivered with enthusiasm and personal connection", category: "feeling" },
      { id: nanoid(), text: "Clear, specific, and with defined expectations", category: "planning" },
      { id: nanoid(), text: "Providing context and the reasoning behind them", category: "thinking" }
    ]
  },
  {
    id: 15,
    text: "My approach to conflict is to...",
    options: [
      { id: nanoid(), text: "Address issues directly and move forward", category: "acting" },
      { id: nanoid(), text: "Focus on maintaining positive relationships", category: "feeling" },
      { id: nanoid(), text: "Follow established processes for resolution", category: "planning" },
      { id: nanoid(), text: "Analyze the root causes to find the best solution", category: "thinking" }
    ]
  },
  {
    id: 16,
    text: "In my free time, I often prefer to...",
    options: [
      { id: nanoid(), text: "Engage in physical activities or hands-on projects", category: "acting" },
      { id: nanoid(), text: "Spend time with friends and loved ones", category: "feeling" },
      { id: nanoid(), text: "Organize my space or plan upcoming events", category: "planning" },
      { id: nanoid(), text: "Read, learn something new, or solve puzzles", category: "thinking" }
    ]
  },
  {
    id: 17,
    text: "When communicating, I tend to focus on...",
    options: [
      { id: nanoid(), text: "Being direct and getting to the point quickly", category: "acting" },
      { id: nanoid(), text: "Building rapport and connecting emotionally", category: "feeling" },
      { id: nanoid(), text: "Being clear, organized, and systematic", category: "planning" },
      { id: nanoid(), text: "Explaining concepts thoroughly and precisely", category: "thinking" }
    ]
  },
  {
    id: 18,
    text: "I feel most confident when...",
    options: [
      { id: nanoid(), text: "I'm taking action and making an impact", category: "acting" },
      { id: nanoid(), text: "I'm connecting well with others", category: "feeling" },
      { id: nanoid(), text: "I have a clear plan that's working", category: "planning" },
      { id: nanoid(), text: "I've thought through all aspects of a situation", category: "thinking" }
    ]
  },
  {
    id: 19,
    text: "When setting goals, I focus most on...",
    options: [
      { id: nanoid(), text: "What I can achieve quickly and effectively", category: "acting" },
      { id: nanoid(), text: "How the goals will benefit people", category: "feeling" },
      { id: nanoid(), text: "Creating detailed plans with milestones", category: "planning" },
      { id: nanoid(), text: "Whether the goals address the true need", category: "thinking" }
    ]
  },
  {
    id: 20,
    text: "I believe the best teams are ones that...",
    options: [
      { id: nanoid(), text: "Take decisive action and get results", category: "acting" },
      { id: nanoid(), text: "Support each other and collaborate well", category: "feeling" },
      { id: nanoid(), text: "Are well-organized with clear roles", category: "planning" },
      { id: nanoid(), text: "Explore innovative approaches to challenges", category: "thinking" }
    ]
  },
  {
    id: 21,
    text: "When starting my day, I typically...",
    options: [
      { id: nanoid(), text: "Dive into the most important tasks right away", category: "acting" },
      { id: nanoid(), text: "Check in with colleagues or loved ones", category: "feeling" },
      { id: nanoid(), text: "Review my schedule and to-do list", category: "planning" },
      { id: nanoid(), text: "Take time to reflect on priorities and approach", category: "thinking" }
    ]
  },
  {
    id: 22,
    text: "I measure success primarily by...",
    options: [
      { id: nanoid(), text: "What was accomplished and results achieved", category: "acting" },
      { id: nanoid(), text: "The quality of relationships and team satisfaction", category: "feeling" },
      { id: nanoid(), text: "How well things went according to plan", category: "planning" },
      { id: nanoid(), text: "Whether we found the optimal solution to the problem", category: "thinking" }
    ]
  }
];
