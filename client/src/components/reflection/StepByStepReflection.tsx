import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

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
}

export default function StepByStepReflection({ starCard }: StepByStepReflectionProps) {
  // State for managing reflection steps
  const [currentStep, setCurrentStep] = useState(1);
  const [showExamples, setShowExamples] = useState(false);
  const totalSteps = 6; // Total number of steps in the reflection journey
  
  // State for saving user reflections
  const [reflections, setReflections] = useState({
    strength1: '',
    strength2: '',
    strength3: '',
    strength4: '',
    teamValues: '',
    uniqueContribution: ''
  });
  
  // Function to populate reflections with demo lorem ipsum text
  const fillWithDemoData = () => {
    const loremTexts = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni."
    ];
    
    // Get random lorem ipsum paragraph
    const getRandomLorem = () => {
      const idx1 = Math.floor(Math.random() * loremTexts.length);
      let idx2 = Math.floor(Math.random() * loremTexts.length);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * loremTexts.length);
      }
      return loremTexts[idx1] + " " + loremTexts[idx2];
    };
    
    // Fill all reflection fields
    setReflections({
      strength1: getRandomLorem(),
      strength2: getRandomLorem(),
      strength3: getRandomLorem(),
      strength4: getRandomLorem(),
      teamValues: getRandomLorem(),
      uniqueContribution: getRandomLorem()
    });
    
    // Jump to the final question immediately
    setCurrentStep(totalSteps);
  };
  
  // Helper function to determine current progress percentage
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);
  
  // Sort quadrants by score to determine strength order (highest first)
  const sortedQuadrants = [
    { key: 'planning', label: 'PLANNING', color: QUADRANT_COLORS.planning, score: starCard?.planning || 0 },
    { key: 'acting', label: 'ACTING', color: QUADRANT_COLORS.acting, score: starCard?.acting || 0 },
    { key: 'feeling', label: 'FEELING', color: QUADRANT_COLORS.feeling, score: starCard?.feeling || 0 },
    { key: 'thinking', label: 'THINKING', color: QUADRANT_COLORS.thinking, score: starCard?.thinking || 0 }
  ].sort((a, b) => b.score - a.score);
  
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
  
  // Next/previous step handlers
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setShowExamples(false);
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
            
            <div className="mb-2">
              <button 
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {showExamples ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {showExamples ? "Hide example responses" : "Show example responses"}
              </button>
              
              {showExamples && (
                <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2">
                  <p className="text-xs text-gray-500 mb-2 font-medium">EXAMPLE RESPONSES:</p>
                  <div className="text-sm text-gray-700">
                    {prompt.examples.map((example, index) => (
                      <p key={index} className={`${index < prompt.examples.length - 1 ? 'mb-2' : ''} italic`}>{`"${example}"`}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg shadow-sm">
            <label htmlFor={`strength-${step}-reflection`} className="block text-lg font-semibold text-indigo-800 mb-2">
              Your Reflection Space
            </label>
            <p className="text-gray-700 mb-3 text-sm italic">
              Write 2-3 sentences about when you've used this strength effectively
            </p>
            <Textarea 
              id={`strength-${step}-reflection`}
              value={step === 1 ? reflections.strength1 : 
                     step === 2 ? reflections.strength2 : 
                     step === 3 ? reflections.strength3 : reflections.strength4}
              onChange={(e) => handleReflectionChange(step, e.target.value)}
              placeholder={`Describe specific moments when you've used your ${strength.label.charAt(0) + strength.label.slice(1).toLowerCase()} strength effectively...`}
              className="min-h-[140px] w-full border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md bg-white"
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
            
            <div className="mb-2">
              <button 
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {showExamples ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {showExamples ? "Hide example responses" : "Show example responses"}
              </button>
              
              {showExamples && (
                <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2">
                  <p className="text-xs text-gray-500 mb-2 font-medium">EXAMPLE RESPONSES:</p>
                  <div className="text-sm text-gray-700">
                    <p className="mb-2 italic">"I thrive in team environments that balance structure with flexibility. I appreciate when teams establish clear expectations and deadlines, but also create space for adaptability when circumstances change. Teams that value both planning ahead and decisive action help me contribute my best work."</p>
                    <p className="italic">"I value team environments where open communication is prioritized and every member's contributions are recognized. I work best when there's a culture of constructive feedback paired with respect for different working styles and perspectives."</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg shadow-sm">
            <label htmlFor="team-values-reflection" className="block text-lg font-semibold text-indigo-800 mb-2">
              Your Reflection Space
            </label>
            <p className="text-gray-700 mb-3 text-sm italic">
              Write 2-3 sentences about the team environment where you perform best
            </p>
            <Textarea 
              id="team-values-reflection"
              value={reflections.teamValues}
              onChange={(e) => handleReflectionChange(5, e.target.value)}
              placeholder="Describe the team environment where you perform at your best..."
              className="min-h-[140px] w-full border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md bg-white"
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
            
            <div className="mb-2">
              <button 
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {showExamples ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {showExamples ? "Hide example responses" : "Show example responses"}
              </button>
              
              {showExamples && (
                <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2">
                  <p className="text-xs text-gray-500 mb-2 font-medium">EXAMPLE RESPONSES:</p>
                  <div className="text-sm text-gray-700">
                    <p className="italic">"I bring value through my combination of action orientation and empathy. I drive projects forward decisively while ensuring team members feel heard and supported. This helps us maintain both momentum and morale, especially during high-pressure situations."</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm">
            <label htmlFor="unique-contribution-reflection" className="block text-lg font-semibold text-green-800 mb-2">
              Your Reflection Space
            </label>
            <p className="text-gray-700 mb-3 text-sm italic">
              Write 2-3 sentences about your unique contribution to the team
            </p>
            <Textarea 
              id="unique-contribution-reflection"
              value={reflections.uniqueContribution}
              onChange={(e) => handleReflectionChange(6, e.target.value)}
              placeholder="Describe your unique contribution to the team..."
              className="min-h-[140px] w-full border-green-300 focus:border-green-500 focus:ring-green-500 rounded-md bg-white"
            />
          </div>
        </div>
      </div>
    );
  };
  
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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">Reflect on your Strengths</h2>
                <p className="text-white/80">
                  Understanding how your unique strengths work together helps you maximize your potential.
                  Let's explore one strength at a time.
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={fillWithDemoData}
                className="text-xs bg-white/90 hover:bg-white text-indigo-800 border-indigo-200"
                id="fillDemoDataButton"
              >
                <FileText className="w-3 h-3 mr-1" />
                Add Demo Data
              </Button>
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
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Your 1st Strength: Acting (31%)</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              Your Acting strength shows your decisive, results-focused, and action-oriented nature. This represents your ability to make 
              decisions, take initiative, and drive projects to completion.
            </p>
            
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-800 mb-3">How and when do you use your Acting strength?</h4>
              <p className="text-gray-700 text-sm mb-3">
                Consider moments when your acting nature made a difference. Reflect on:
              </p>
              <ul className="list-disc ml-5 text-sm text-gray-700 mb-3 space-y-1">
                <li>Situations where you took initiative when others hesitated</li>
                <li>How you've turned ideas into tangible results</li>
                <li>Times when your decisiveness moved a project forward</li>
                <li>How your pragmatic approach solved practical problems</li>
              </ul>
              
              <div className="mb-2">
                <button 
                  onClick={() => setShowExamples(!showExamples)}
                  className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {showExamples ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                  {showExamples ? "Hide example responses" : "Show example responses"}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reflection content based on current step */}
        <div className="p-6 border-t border-gray-200">
          {/* Conditional rendering based on current step */}
          {currentStep <= 4 ? (
            renderStrengthReflection(currentStep)
          ) : currentStep === 5 ? (
            renderTeamValuesReflection()
          ) : (
            renderUniqueContributionReflection()
          )}
          
          {/* Navigation controls */}
          <div className="flex justify-between mt-8">
            <Button 
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
            >
              Previous
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={currentStep === totalSteps}
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}