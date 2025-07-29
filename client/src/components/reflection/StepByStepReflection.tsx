import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, FileText, MessageCircle } from "lucide-react";
import { useCoachingModal } from '@/hooks/useCoachingModal';
import { useTestUser } from '@/hooks/useTestUser';
import { StrengthData } from '@/types/coaching';
import ReflectionCoachingButton from '@/components/coaching/ReflectionCoachingButton';
import { useFloatingAI } from '@/components/ai/FloatingAIProvider';

// Simple debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Define quadrant colors
const QUADRANT_COLORS = {
  thinking: 'rgb(1, 162, 82)',    // Green
  acting: 'rgb(241, 64, 64)',     // Red
  feeling: 'rgb(22, 126, 253)',   // Blue
  planning: 'rgb(255, 203, 47)'   // Yellow
} as const;

interface StarCardType {
  id?: number;
  userId: number;
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  state?: string;
  createdAt?: string;
  imageUrl?: string | null;
}

interface StepByStepReflectionProps {
  starCard: StarCardType | undefined;
  setCurrentContent?: (content: string) => void;
  markStepCompleted?: (stepId: string) => void;
  workshopLocked?: boolean;
}

export default function StepByStepReflection({ 
  starCard: initialStarCard, 
  setCurrentContent,
  markStepCompleted
}: StepByStepReflectionProps) {
  
  // State for managing reflection steps
  const [currentStep, setCurrentStep] = useState(1);
  const [showExamples, setShowExamples] = useState(false);
  const totalSteps = 6; // Total number of steps in the reflection journey
  const { shouldShowDemoButtons, isTestUser, user } = useTestUser();
  const { updateContext, setCurrentStep: setFloatingAIStep } = useFloatingAI();
  
  // Talia coaching modal
  const { openModal } = useCoachingModal();
  
  // Helper function to open Talia coaching for current step strength
  const openTaliaCoaching = () => {
    if (currentStep <= 4) {
      const currentStrengthData = sortedQuadrants[currentStep - 1];
      const strengthData: StrengthData = {
        name: currentStrengthData.label.charAt(0) + currentStrengthData.label.slice(1).toLowerCase(),
        description: `Your ${currentStrengthData.label.toLowerCase()} strength represents ${currentStrengthData.score}% of your profile.`
      };
      openModal(strengthData);
    }
  };
  
  // Workshop status for testing
  // const { completed, loading, isWorkshopLocked } = useWorkshopStatus();
  const workshopLocked = false; // isWorkshopLocked('ast');

  // State for star card data with proper initialization
  const [starCard, setStarCard] = useState<StarCardType | undefined>(initialStarCard);

  // State for reflections data - initialize with empty strings to prevent undefined
  const [reflections, setReflections] = useState({
    strength1: '',
    strength2: '',
    strength3: '',
    strength4: '',
    teamValues: '',
    uniqueContribution: ''
  });

  // Fetch star card data on component mount
  useEffect(() => {
    const fetchStarCardData = async () => {
      try {
        console.log("Reflection: Fetching latest star card data...");
        const response = await fetch('/api/workshop-data/starcard', {
          credentials: 'include',
          cache: 'no-cache'
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Reflection: Fetched star card data:", data);

          // Handle the actual starcard response format
          if (data.success && data.thinking !== undefined) {
            setStarCard({
              userId: data.userId || 0,
              thinking: Number(data.thinking) || 0,
              acting: Number(data.acting) || 0,
              feeling: Number(data.feeling) || 0,
              planning: Number(data.planning) || 0
            });
          } else if (data.thinking !== undefined) {
            // Direct JSON format fallback
            setStarCard({
              userId: 0,
              thinking: Number(data.thinking) || 0,
              acting: Number(data.acting) || 0,
              feeling: Number(data.feeling) || 0,
              planning: Number(data.planning) || 0
            });
          }
        }
      } catch (error) {
        console.error("Error fetching star card data for reflection:", error);
      }
    };

    // Fetch updated data regardless of initial data
    fetchStarCardData();
  }, []);

  // Load existing reflection data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log('🔄 Loading existing reflection data...');
        const response = await fetch('/api/workshop-data/step-by-step-reflection', {
          credentials: 'include'
        });
        const result = await response.json();
        
        console.log('📥 Reflection data response:', result);
        
        if (result.success && result.data) {
          console.log('✅ Setting reflection data from database:', result.data);
          
          // Handle both old format (direct fields) and new format (nested under reflections)
          const reflectionData = result.data.reflections || result.data;
          
          // Ensure all fields are properly set with empty strings as fallback
          setReflections({
            strength1: reflectionData.strength1 || '',
            strength2: reflectionData.strength2 || '',
            strength3: reflectionData.strength3 || '',
            strength4: reflectionData.strength4 || '',
            teamValues: reflectionData.teamValues || '',
            uniqueContribution: reflectionData.uniqueContribution || ''
          });
        } else {
          console.log('⚠️ No reflection data found or failed to load, initializing empty state');
          // Initialize with empty strings to prevent undefined values
          setReflections({
            strength1: '',
            strength2: '',
            strength3: '',
            strength4: '',
            teamValues: '',
            uniqueContribution: ''
          });
        }
      } catch (error) {
        console.error('❌ Error loading reflection data:', error);
        // Initialize with empty strings on error
        setReflections({
          strength1: '',
          strength2: '',
          strength3: '',
          strength4: '',
          teamValues: '',
          uniqueContribution: ''
        });
      }
    };
    
    loadExistingData();
  }, []);

  // Debounced save function for reflections
  const debouncedSave = useCallback(
    debounce(async (dataToSave) => {
      try {
        const response = await fetch('/api/workshop-data/step-by-step-reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dataToSave)
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('Step-by-step reflections auto-saved successfully');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000),
    []
  );

  // Trigger save whenever reflections change (only if not locked)
  useEffect(() => {
    // Don't auto-save if workshop is locked
    if (workshopLocked) {
      console.log('🔒 Workshop locked - skipping auto-save');
      return;
    }
    
    const hasContent = Object.values(reflections).some(value => value && typeof value === 'string' && value.trim().length > 0);
    console.log('Reflection save check:', { reflections, hasContent, workshopLocked });
    
    if (hasContent) {
      console.log('Triggering auto-save for reflections:', reflections);
      debouncedSave(reflections);
    }
  }, [reflections, debouncedSave, workshopLocked]);

  // Function to populate reflections with meaningful AST demo data
  const fillWithDemoData = async () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    // Get strength-specific demo content based on sorted quadrants
    const getStrengthDemo = (strengthLabel: string) => {
      switch(strengthLabel) {
        case 'PLANNING':
          return "I use my planning strength when leading complex projects by creating detailed roadmaps and milestone tracking systems. Recently, I developed a project management framework that helped our team deliver a major initiative on time despite multiple dependencies and changing requirements.";
        case 'ACTING':
          return "I leverage my action-oriented approach when projects need momentum. Last quarter, when our team was stuck in analysis paralysis on a key decision, I facilitated rapid prototyping sessions that helped us test three solutions quickly and move forward with confidence.";
        case 'FEELING':
          return "I apply my feeling strength when building team cohesion and managing change. During a recent organizational restructure, I created informal check-in sessions and ensured everyone felt heard, which helped maintain team morale and productivity during uncertainty.";
        case 'THINKING':
          return "I use my analytical thinking to solve complex problems and identify optimization opportunities. Recently, I conducted a data analysis that revealed workflow bottlenecks, leading to process improvements that increased our team's efficiency by 35%.";
        default:
          return "I use this strength effectively by applying it strategically in situations where it can create the most value for my team and organization.";
      }
    };

    // Create demo data object
    const demoData = {
      strength1: getStrengthDemo(sortedQuadrants[0].label),
      strength2: getStrengthDemo(sortedQuadrants[1].label),
      strength3: getStrengthDemo(sortedQuadrants[2].label),
      strength4: getStrengthDemo(sortedQuadrants[3].label),
      teamValues: "I thrive in team environments that balance clear structure with flexibility for creative problem-solving. I value open communication where team members feel safe to share ideas and concerns, along with regular feedback loops that help us continuously improve our collaboration and outcomes.",
      uniqueContribution: `My unique contribution comes from combining my top strengths of ${sortedQuadrants[0].label.toLowerCase()} and ${sortedQuadrants[1].label.toLowerCase()}. This allows me to create structured approaches while maintaining focus on people and relationships, helping teams achieve goals efficiently while keeping everyone engaged and motivated.`
    };

    // Fill all reflection fields with meaningful, strength-specific content
    setReflections(demoData);

    // Immediately save demo data to database - don't wait for debounced save
    try {
      console.log('💾 Immediately saving demo data to database...');
      const response = await fetch('/api/workshop-data/step-by-step-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(demoData)
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ Demo data saved successfully to database');
      } else {
        console.error('❌ Failed to save demo data:', result);
      }
    } catch (error) {
      console.error('❌ Error saving demo data to database:', error);
    }

    // Jump to the final question immediately
    setCurrentStep(totalSteps);
  };

  // Helper function to determine current progress percentage
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  // Sort quadrants by score to determine strength order (highest first)
  const sortedQuadrants = [
    { key: 'planning', label: 'PLANNING', color: QUADRANT_COLORS.planning, score: starCard?.planning || 0, value: starCard?.planning || 0 },
    { key: 'acting', label: 'ACTING', color: QUADRANT_COLORS.acting, score: starCard?.acting || 0, value: starCard?.acting || 0 },
    { key: 'feeling', label: 'FEELING', color: QUADRANT_COLORS.feeling, score: starCard?.feeling || 0, value: starCard?.feeling || 0 },
    { key: 'thinking', label: 'THINKING', color: QUADRANT_COLORS.thinking, score: starCard?.thinking || 0, value: starCard?.thinking || 0 }
  ].sort((a, b) => b.score - a.score);

  // Update floating AI context when step or strength changes
  useEffect(() => {
    if (sortedQuadrants && sortedQuadrants.length > 0 && currentStep <= 4) {
      const currentStrength = sortedQuadrants[currentStep - 1];
      setFloatingAIStep(`2-4`); // Always step 2-4 for strength reflection
      updateContext({
        stepName: `Strength Reflection`,
        strengthLabel: currentStrength?.label,
        questionText: getStrengthPrompt(currentStrength?.label)?.question,
        aiEnabled: true
      });
    } else if (currentStep === 5) {
      updateContext({
        stepName: `Team Values`,
        strengthLabel: undefined,
        questionText: "What do you value most in team environments?",
        aiEnabled: true
      });
    } else if (currentStep === 6) {
      updateContext({
        stepName: `Unique Contribution`,
        strengthLabel: undefined,
        questionText: "What is your unique contribution to teams?",
        aiEnabled: true
      });
    }
  }, [currentStep, sortedQuadrants, updateContext, setFloatingAIStep]);

  // Get current top strength
  const topStrength = sortedQuadrants[0];
  const secondStrength = sortedQuadrants[1];
  const thirdStrength = sortedQuadrants[2];
  const fourthStrength = sortedQuadrants[3];

  // Update reflection handler
  const handleReflectionChange = (step: number, value: string) => {
    const newReflections = { ...reflections };

    switch(step) {
      case 1: newReflections.strength1 = value; break;
      case 2: newReflections.strength2 = value; break;
      case 3: newReflections.strength3 = value; break;
      case 4: newReflections.strength4 = value; break;
      case 5: newReflections.teamValues = value; break;
      case 6: newReflections.uniqueContribution = value; break;
    }

    setReflections(newReflections);
  };

  // Colors based on quadrant
  const strengthColors: Record<string, {
    bg: string,
    circle: string,
    lightBg: string,
    border: string,
    text: string
  }> = {
    'PLANNING': {
      bg: 'bg-yellow-100',
      circle: 'bg-yellow-500',
      lightBg: 'bg-yellow-50',
      border: 'border-yellow-100',
      text: 'text-yellow-800'
    },
    'ACTING': {
      bg: 'bg-red-100',
      circle: 'bg-red-500',
      lightBg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-800'
    },
    'FEELING': {
      bg: 'bg-blue-100',
      circle: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-800'
    },
    'THINKING': {
      bg: 'bg-green-100',
      circle: 'bg-green-500',
      lightBg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-800'
    }
  };

  // Helper to get strength description
  const getStrengthDescription = (strengthLabel: string) => {
    switch(strengthLabel) {
      case 'PLANNING':
        return "Your Planning strength shows your methodical, organized, and structured approach. This represents your ability to create systems, establish processes, and maintain order.";
      case 'ACTING':
        return "Your Acting strength shows your decisive, results-focused, and action-oriented nature. This represents your ability to make decisions, take initiative, and drive projects to completion.";
      case 'FEELING':
        return "Your Feeling strength shows your empathetic, collaborative, and relationship-oriented nature. This represents your ability to connect with others, build trust, and create harmonious environments.";
      case 'THINKING':
        return "Your Thinking strength shows your analytical, logical, and innovation-oriented mindset. This represents your ability to analyze data, solve complex problems, and generate innovative ideas.";
      default:
        return "";
    }
  };

  // Helper to get strength reflection prompt
  const getStrengthPrompt = (strengthLabel: string) => {
    switch(strengthLabel) {
      case 'PLANNING':
        return {
          question: "How and when do you use your Planning strength?",
          bullets: [
            "Situations where your organizational skills created clarity",
            "How you've implemented systems that improved efficiency",
            "Times when your structured approach prevented problems",
            "How your methodical nature helps maintain consistency"
          ],
          examples: [
            "I use my planning strength when our team takes on complex projects. Recently, I created a project timeline with clear milestones that helped everyone understand deadlines and dependencies, resulting in an on-time delivery.",
            "My methodical approach helps during busy periods. When our team faced multiple competing deadlines, I developed a prioritization framework that allowed us to focus on the most critical tasks first while keeping stakeholders informed."
          ]
        };
      case 'ACTING':
        return {
          question: "How and when do you use your Acting strength?",
          bullets: [
            "Situations where you took initiative when others hesitated",
            "How you've turned ideas into tangible results",
            "Times when your decisiveness moved a project forward",
            "How your pragmatic approach solved practical problems"
          ],
          examples: [
            "I use my action-oriented approach when projects stall. Recently, our team was stuck in analysis paralysis, and I stepped in to create momentum by identifying the three most important next steps and delegating tasks.",
            "My decisive nature helps in crisis situations. During a recent system outage, I quickly prioritized recovery actions while others were still discussing options, which minimized downtime for our customers."
          ]
        };
      case 'FEELING':
        return {
          question: "How and when do you use your Feeling strength?",
          bullets: [
            "Situations where you built trust or resolved conflicts",
            "How you've created inclusive environments",
            "Times when your empathy improved team dynamics",
            "How your people-focused approach enhanced collaboration"
          ],
          examples: [
            "I use my relationship-building strengths when integrating new team members. Recently, I noticed a new colleague struggling to find their place, so I organized informal coffee chats and made sure to highlight their unique skills in meetings.",
            "My empathetic approach helps during difficult conversations. When we needed to deliver constructive feedback to a teammate, I focused on creating a safe space and framing the feedback as an opportunity for growth rather than criticism."
          ]
        };
      case 'THINKING':
        return {
          question: "How and when do you use your Thinking strength?",
          bullets: [
            "Situations where your analytical skills uncovered insights",
            "How you've developed innovative solutions",
            "Times when your logical approach clarified complex issues",
            "How your strategic thinking opened new possibilities"
          ],
          examples: [
            "I use my analytical abilities when faced with ambiguous data. Recently, our team was trying to understand unusual customer behavior patterns, and I was able to identify the key variables and create a model that explained the trend.",
            "My innovative thinking helps when conventional approaches fall short. During a product development challenge, I suggested an entirely different framework that allowed us to reimagine the solution from first principles."
          ]
        };
      default:
        return {
          question: "",
          bullets: [],
          examples: []
        };
    }
  };

  // Get the current reflection question for the coaching modal
  const getCurrentReflectionQuestion = () => {
    if (currentStep <= 4 && sortedQuadrants[currentStep - 1]) {
      return getStrengthPrompt(sortedQuadrants[currentStep - 1].label).question;
    } else if (currentStep === 5) {
      return "What do you value most in team environments?";
    } else if (currentStep === 6) {
      return "What is your unique contribution to teams?";
    }
    return undefined;
  };

  // Get examples for the current step
  const getCurrentExamples = () => {
    if (currentStep <= 4 && sortedQuadrants[currentStep - 1]) {
      return getStrengthPrompt(sortedQuadrants[currentStep - 1].label).examples;
    } else if (currentStep === 5) {
      return [
        "I thrive in team environments that balance structure with flexibility. I appreciate when teams establish clear expectations and deadlines, but also create space for adaptability when circumstances change.",
        "I value team environments where open communication is prioritized and every member's contributions are recognized. I work best when there's a culture of constructive feedback."
      ];
    } else if (currentStep === 6) {
      return [
        "I bring value through my combination of planning and empathy. I create structured processes while ensuring everyone feels heard and supported throughout implementation.",
        "My unique contribution comes from balancing analytical thinking with relationship building. This helps me develop solutions that are both technically sound and people-focused."
      ];
    }
    return [];
  };

  // Handle saving reflection from modal
  const handleSaveReflection = (reflectionText: string) => {
    handleReflectionChange(currentStep, reflectionText);
  };

  // Save reflections to database
  const saveReflections = async () => {
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          assessmentType: 'stepByStepReflection',
          results: {
            reflections,
            starCardData: starCard,
            completedAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save reflections: ${response.status}`);
      }

      console.log('Step-by-step reflections saved successfully');
    } catch (error) {
      console.error('Error saving reflections:', error);
    }
  };

  // Helper function to get current reflection text
  const getCurrentReflectionText = (): string => {
    switch(currentStep) {
      case 1: return reflections.strength1 || '';
      case 2: return reflections.strength2 || '';
      case 3: return reflections.strength3 || '';
      case 4: return reflections.strength4 || '';
      case 5: return reflections.teamValues || '';
      case 6: return reflections.uniqueContribution || '';
      default: return '';
    }
  };

  // Check if current reflection meets minimum requirements (or workshop is locked for viewing)
  const isCurrentReflectionValid = (): boolean => {
    // If workshop is locked, allow navigation for viewing regardless of content length
    if (workshopLocked || workshopLocked) {
      return true;
    }
    
    // For unlocked workshops, require minimum content
    const currentText = getCurrentReflectionText();
    return !!(currentText && typeof currentText === 'string' && currentText.trim().length >= 10);
  };

  // Next/previous step handlers
  const handleNext = async () => {
    // Check if current reflection is valid before proceeding
    if (!isCurrentReflectionValid()) {
      const currentText = getCurrentReflectionText();
      const textLength = currentText && typeof currentText === 'string' ? currentText.trim().length : 0;
      console.log(`Reflection ${currentStep} needs at least 10 characters. Current: ${textLength}`);
      return; // Prevent advancing
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setShowExamples(false);
    } else if (currentStep === totalSteps) {
      // Only save reflections if workshop is not locked
      if (!workshopLocked && !workshopLocked) {
        await saveReflections();
      } else {
        console.log('🔒 Workshop locked - skipping save on completion');
      }

      // We're on the last step, mark reflection as completed and advance to next section
      if (markStepCompleted) {
        markStepCompleted('2-4'); // Mark reflection step as completed
        console.log("StepByStepReflection: Marked 2-4 as completed, advancing to 3-1");
        
        // Use setCurrentContent to navigate to the next section (Intro to Flow)
        if (setCurrentContent) {
          setTimeout(() => {
            setCurrentContent('intro-to-flow');
            console.log("StepByStepReflection: Navigated to intro-to-flow content");
          }, 500);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowExamples(false);
    }
  };

  // Render strength reflection step (steps 1-4)
  const renderStrengthReflection = (step: number) => {
    let strength;
    let ordinal;

    switch(step) {
      case 1: 
        strength = sortedQuadrants[0];
        ordinal = "1st";
        break;
      case 2: 
        strength = sortedQuadrants[1];
        ordinal = "2nd";
        break;
      case 3: 
        strength = sortedQuadrants[2];
        ordinal = "3rd";
        break;
      case 4: 
        strength = sortedQuadrants[3];
        ordinal = "4th";
        break;
      default:
        strength = sortedQuadrants[0];
        ordinal = "1st";
    }

    const colors = strengthColors[strength.label];
    const prompt = getStrengthPrompt(strength.label);

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className={`${colors.bg} p-2 rounded-full mr-3`}>
            <div className={`w-8 h-8 ${colors.circle} rounded-full flex items-center justify-center text-white font-bold`}>
              {step}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Your {ordinal} Strength: {strength.label.charAt(0) + strength.label.slice(1).toLowerCase()} ({strength.score}%)
          </h3>
        </div>

        <div className="ml-16 mb-6">
          <p className="text-gray-700 mb-3">
            {getStrengthDescription(strength.label)}
          </p>

          <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4 mb-4`}>
            <h4 className={`font-medium ${colors.text} mb-3`}>{prompt.question}</h4>
            <p className="text-gray-700 text-sm mb-3">
              Consider moments when your {strength.label.toLowerCase()} nature made a difference. Reflect on:
            </p>
            <ul className="list-disc ml-5 text-sm text-gray-700 mb-3 space-y-1">
              {prompt.bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>

            {!shouldShowDemoButtons && (
              <div className="text-xs text-gray-500 italic">
                Coaching only available for test users
              </div>
            )}

            {/* Example suggestions */}
            <div className="mb-2 text-xs text-gray-600">
              <p className="font-medium mb-1">Example:</p>
              <p className="italic">{prompt.examples[0]}</p>
            </div>
          </div>

          <div className={`mt-4 p-4 ${
            step <= 4 
              ? sortedQuadrants[step-1].label === 'THINKING' 
                ? 'bg-green-50 border-2 border-green-200'
                : sortedQuadrants[step-1].label === 'ACTING'
                ? 'bg-red-50 border-2 border-red-200'
                : sortedQuadrants[step-1].label === 'FEELING'
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-yellow-50 border-2 border-yellow-200'
              : 'bg-gray-50 border-2 border-gray-200'
          } rounded-lg shadow-sm`}>
            <label htmlFor={`strength-${step}-reflection`} className={`block text-lg font-semibold ${
              step <= 4
                ? sortedQuadrants[step-1].label === 'THINKING'
                  ? 'text-green-800'
                  : sortedQuadrants[step-1].label === 'ACTING'
                  ? 'text-red-800'
                  : sortedQuadrants[step-1].label === 'FEELING'
                  ? 'text-blue-800'
                  : 'text-yellow-800'
                : 'text-gray-800'
            } mb-2`}>
              Your Reflection Space
            </label>
            <p className="text-gray-700 mb-3 text-sm italic">
                {step <= 4 
                  ? `Write 2-3 sentences about when you've used your ${sortedQuadrants[step-1].label.toLowerCase()} strength effectively`
                  : step === 5 
                  ? "Write 2-3 sentences about your ideal team environment"
                  : "Write 2-3 sentences about your unique contribution"}
              </p>
              <textarea 
                id={`strength-${step}-reflection`}
                value={step === 1 ? reflections.strength1 : 
                     step === 2 ? reflections.strength2 : 
                     step === 3 ? reflections.strength3 : 
                     step === 4 ? reflections.strength4 :
                     step === 5 ? reflections.teamValues :
                     reflections.uniqueContribution}
                onChange={(e) => handleReflectionChange(step, e.target.value)}
                placeholder={step <= 4 
                  ? `Describe specific moments when you've used your ${sortedQuadrants[step-1].label.toLowerCase()} strength effectively...`
                  : step === 5 
                  ? "Describe the team environment where you perform at your best..."
                  : "Describe your unique contribution to the team..."}
                className={`min-h-[140px] w-full p-3 border rounded-md focus:ring-2 focus:border-transparent resize-vertical ${
                  step <= 4
                    ? sortedQuadrants[step-1].label === 'THINKING'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : sortedQuadrants[step-1].label === 'ACTING'
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : sortedQuadrants[step-1].label === 'FEELING'
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500'
                      : 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                    : 'border-gray-300 focus:border-gray-500 focus:ring-gray-500'
                } rounded-md bg-white`}
              />
          </div>
        </div>
      </div>
    );
  };

  // Render team values reflection (step 5)
  const renderTeamValuesReflection = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              5
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">What You Value Most in Team Environments</h3>
        </div>

        <div className="ml-16 mb-6">
          <p className="text-gray-700 mb-3">
            Based on your strengths profile, certain team environments will help you perform at your best. 
            Consider what team qualities or behaviors would complement your unique strengths distribution.
          </p>

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-indigo-800 mb-2">Consider what you value in team environments:</h4>
            <ul className="list-disc ml-5 text-sm text-gray-700 mb-3 space-y-1">
              <li>What type of communication style works best for you?</li>
              <li>How much structure vs. flexibility do you need?</li>
              <li>What kinds of roles or responsibilities energize you?</li>
              <li>How do you prefer to receive feedback?</li>
            </ul>

            {/* Example suggestions for team values */}
            <div className="mb-2 text-xs text-gray-600">
              <p className="font-medium mb-1">Example:</p>
              <p className="italic">I thrive in environments with clear structure but room for flexibility. I value teams where everyone's input is heard and we maintain open, honest communication about both successes and challenges.</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg shadow-sm">
            <label htmlFor="team-values-reflection" className="block text-lg font-semibold text-indigo-800 mb-2">
              Your Reflection Space
            </label>
            <p className="text-gray-700 mb-3 text-sm italic">
              Write 2-3 sentences about the team environment where you perform best
            </p>
            <textarea 
              id="team-values-reflection"
              value={reflections.teamValues}
              onChange={(e) => handleReflectionChange(5, e.target.value)}
              placeholder="Describe the team environment where you perform at your best..."
              className="min-h-[140px] w-full p-3 border border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 rounded-md bg-white resize-vertical"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render unique contribution reflection (step 6)
  const renderUniqueContributionReflection = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              6
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Your Unique Contribution</h3>
        </div>

        <div className="ml-16 mb-6">
          <p className="text-gray-700 mb-3">
            Your particular strengths profile creates a unique combination that you bring to your team. 
            Think about how your top strengths work together to create value.
          </p>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-green-800 mb-2">Consider your unique combination of strengths:</h4>
            <p className="text-gray-700 text-sm mb-3">
              Your top two strengths are {topStrength.label.toLowerCase()} ({topStrength.score}%) and {secondStrength.label.toLowerCase()} ({secondStrength.score}%). 
              How do these work together to create a unique perspective or approach?
            </p>

            {/* Example suggestions for unique contribution */}
            <div className="mb-2 text-xs text-gray-600">
              <p className="font-medium mb-1">Example:</p>
              <p className="italic">My unique contribution comes from combining strong analytical thinking with a people-focused approach. This allows me to solve complex problems while ensuring solutions work well for everyone involved.</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm">
            <label htmlFor="unique-contribution-reflection" className="block text-lg font-semibold text-green-800 mb-2">
              Your Reflection Space
            </label>
            <p className="text-gray-700 mb-3 text-sm italic">
              Write 2-3 sentences about your unique contribution to the team
            </p>
            <textarea 
              id="unique-contribution-reflection"
              value={reflections.uniqueContribution}
              onChange={(e) => handleReflectionChange(6, e.target.value)}
              placeholder="Describe your unique contribution to the team..."
              className="min-h-[140px] w-full p-3 border border-green-300 focus:border-green-500 focus:ring-green-500 focus:ring-2 rounded-md bg-white resize-vertical"
            />
          </div>
        </div>
      </div>
    );
  };

  // Check if we have starCard data
  if (!initialStarCard) {
    return (
      <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded text-red-700">
        <p>Unable to load strength data. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <>
      {/* Progress indicator */}
      <div className="flex justify-end mb-4">
        <div className="bg-white rounded-md shadow-sm border border-gray-200 px-3 py-1.5 flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500">Your progress:</span>
          <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <span className="text-xs font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-md border border-indigo-100">
        {/* Responsive grid layout with purple area and strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left side - Purple gradient area */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div>
              <h2 className="text-xl font-bold mb-2">Reflect on your Strengths</h2>
              <p className="text-white/80">
                Understanding how your unique strengths work together helps you maximize your potential.
                Let's explore one strength at a time.
              </p>
            </div>

            {/* Strengths Distribution */}
            <div className="mt-4 bg-white/30 rounded-lg p-4">
              <div className="flex flex-col items-center">
                <h3 className="text-white font-bold text-center mb-3">Your Strengths Distribution</h3>

                <div className="flex flex-col gap-2 mb-2 w-full max-w-md">
                  {sortedQuadrants.map((quadrant, index) => {
                    let bgColor = '';
                    let textColor = 'text-gray-900';
                    let borderColor = '';
                    let isHighlighted = currentStep <= 4 && index === currentStep - 1;

                    switch(quadrant.label) {
                      case 'PLANNING':
                        bgColor = 'bg-yellow-400';
                        borderColor = isHighlighted ? 'border-2 border-yellow-700' : '';
                        break;
                      case 'ACTING':
                        bgColor = 'bg-red-400';
                        borderColor = isHighlighted ? 'border-2 border-red-700' : '';
                        break;
                      case 'FEELING':
                        bgColor = 'bg-blue-400';
                        borderColor = isHighlighted ? 'border-2 border-blue-700' : '';
                        break;
                      case 'THINKING':
                        bgColor = 'bg-green-400';
                        borderColor = isHighlighted ? 'border-2 border-green-700' : '';
                        break;
                    }

                    return (
                      <div 
                        key={quadrant.label}
                        className={`relative rounded-md ${bgColor} ${borderColor} ${textColor} p-2 transition-all duration-200 ${isHighlighted ? 'shadow-md transform scale-105' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3 font-bold text-gray-700">
                              {index + 1}
                            </div>
                            <span className="font-medium">{quadrant.label}</span>
                          </div>
                          <span className="font-bold">{quadrant.score}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Current strength content */}
          <div className="bg-gray-50 p-6">
            {/* Dynamically show the current strength based on currentStep */}
            {currentStep <= 4 && (
              <>
                <div className="flex items-center mb-4">
                  <div className={`${strengthColors[sortedQuadrants[currentStep-1].label].bg} p-2 rounded-full mr-3`}>
                    <div className={`w-8 h-8 ${strengthColors[sortedQuadrants[currentStep-1].label].circle} rounded-full flex items-center justify-center text-white fontbold`}>
                      {currentStep}
                    </div>
                  </div>
                                    <h3 className="text-xl font-bold text-gray-800">
                    Your {currentStep === 1 ? '1st' : currentStep === 2 ? '2nd' : currentStep === 3 ? '3rd' : '4th'} Strength: {sortedQuadrants[currentStep-1].label.charAt(0) + sortedQuadrants[currentStep-1].label.slice(1).toLowerCase()} ({sortedQuadrants[currentStep-1].score}%)
                  </h3>
                </div>

                <p className="text-gray-700 mb-4">
                  {getStrengthDescription(sortedQuadrants[currentStep-1].label)}
                </p>

                <div className={`${strengthColors[sortedQuadrants[currentStep-1].label].lightBg} border ${strengthColors[sortedQuadrants[currentStep-1].label].border} rounded-lg p-4 mb-4`}>
                  <h4 className={`font-medium ${strengthColors[sortedQuadrants[currentStep-1].label].text} mb-3`}>
                    {getStrengthPrompt(sortedQuadrants[currentStep-1].label).question}
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Consider moments when your {sortedQuadrants[currentStep-1].label.toLowerCase()} nature made a difference. Reflect on:
                  </p>
                  <ul className="list-disc ml-5 text-sm text-gray-700 mb-3 space-y-1">
                    {getStrengthPrompt(sortedQuadrants[currentStep-1].label).bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Show other content for steps 5-6 */}
            {currentStep === 5 && (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">What You Value Most in Team Environments</h3>
                <p className="text-gray-700 mb-4">
                  Based on your strengths profile, certain team environments will help you perform at your best. 
                  Consider what team qualities or behaviors would complement your unique strengths distribution.
                </p>
              </>
            )}

            {currentStep === 6 && (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Unique Contribution</h3>
                <p className="text-gray-700 mb-4">
                  Your particular strengths profile creates a unique combination that you bring to your team. 
                  Think about how your top strengths work together to create value.
                </p>
              </>
            )}
          </div>        </div>

        {/* Reflection Space - Full Width Section */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className={`mt-4 p-4 ${
              currentStep <= 4
                ? sortedQuadrants[currentStep-1].label === 'THINKING'
                  ? 'bg-green-50 border-2 border-green-200'
                  : sortedQuadrants[currentStep-1].label === 'ACTING'
                  ? 'bg-red-50 border-2 border-red-200'
                  : sortedQuadrants[currentStep-1].label === 'FEELING'
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-yellow-50 border-2 border-yellow-200'
                : 'bg-gray-50 border-2 border-gray-200'
            } rounded-lg shadow-sm`}>
              <label htmlFor="strength-1-reflection" className={`block text-lg font-semibold ${
                currentStep <= 4
                  ? sortedQuadrants[currentStep-1].label === 'THINKING'
                    ? 'text-green-800'
                    : sortedQuadrants[currentStep-1].label === 'ACTING'
                    ? 'text-red-800'
                    : sortedQuadrants[currentStep-1].label === 'FEELING'
                    ? 'text-blue-800'
                    : 'text-yellow-800'
                  : 'text-gray-800'
              } mb-2`}>
                Your Reflection Space
              </label>
              <p className="text-gray-700 mb-3 text-sm italic">
                {currentStep <= 4 
                  ? `Write 2-3 sentences about when you've used your ${sortedQuadrants[currentStep-1].label.toLowerCase()} strength effectively`
                  : currentStep === 5 
                  ? "Write 2-3 sentences about your ideal team environment"
                  : "Write 2-3 sentences about your unique contribution"}
              </p>
              
              {/* Coaching Button - Bottom Section */}
              {currentStep <= 4 && (shouldShowDemoButtons || true) && (
                <ReflectionCoachingButton 
                  reflectionContext={{
                    question: getStrengthPrompt(sortedQuadrants[currentStep-1].label).question,
                    type: 'strength',
                    currentStep: currentStep,
                    strengthLabel: sortedQuadrants[currentStep-1]?.label,
                    strengthScore: sortedQuadrants[currentStep-1]?.value,
                    strengthColor: sortedQuadrants[currentStep-1]?.color,
                    allStrengths: sortedQuadrants.map(q => ({
                      label: q.label,
                      score: q.value,
                      color: q.color
                    }))
                  }}
                  onSaveReflection={(reflectionText) => {
                    handleReflectionChange(currentStep, reflectionText);
                  }}
                />
              )}
              
              <textarea 
                id={`strength-${currentStep}-reflection`}
                value={getCurrentReflectionText()}
                onChange={(e) => handleReflectionChange(currentStep, e.target.value)}
                disabled={workshopLocked || workshopLocked}
                readOnly={workshopLocked || workshopLocked}
                placeholder={currentStep <= 4 
                  ? `Describe specific moments when you've used your ${sortedQuadrants[currentStep-1].label.toLowerCase()} strength effectively...`
                  : currentStep === 5 
                  ? "Describe the team environment where you perform at your best..."
                  : "Describe your unique contribution to the team..."}
                className={`min-h-[140px] w-full p-3 border rounded-md focus:ring-2 focus:border-transparent resize-vertical ${
                  workshopLocked || workshopLocked
                    ? 'opacity-60 cursor-not-allowed bg-gray-100'
                    : currentStep <= 4
                    ? sortedQuadrants[currentStep-1].label === 'THINKING'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : sortedQuadrants[currentStep-1].label === 'ACTING'
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : sortedQuadrants[currentStep-1].label === 'FEELING'
                      ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500'
                      : 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
                    : 'border-gray-300 focus:border-gray-500 focus:ring-gray-500'
                } rounded-md bg-white`}
              />

              {/* Show example based on current step */}
              <div className="mt-3 text-xs text-gray-600">
                <p className="font-medium mb-1">Example:</p>
                <p className="italic">
                  {currentStep <= 4 ? getCurrentExamples()[0] :
                   currentStep === 5 ? "I thrive in environments with clear structure but room for flexibility. I value teams where everyone's input is heard and we maintain open, honest communication." :
                   "My unique contribution comes from combining my analytical thinking with relationship-building skills to create solutions that are both effective and people-focused."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between mt-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-3">
              {shouldShowDemoButtons && (
                <button
                  onClick={fillWithDemoData}
                  disabled={workshopLocked || workshopLocked}
                  className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-blue-600 hover:text-blue-800 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Add Demo Data
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!isCurrentReflectionValid()}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isCurrentReflectionValid()
                    ? "bg-indigo-600 hover:bg-indigo-700" 
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {currentStep === totalSteps ? "Next: Intro to Flow" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}