import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ArrowDown, ArrowUp } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { validateAtLeastOneField } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';

// Define ContentViewProps interface
interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  starCard?: any;
}

// Define the new data structure for Future Self exercise
interface FutureSelfData {
  direction: 'backward' | 'forward';
  twentyYearVision: string;
  tenYearMilestone: string;
  fiveYearFoundation: string;
  flowOptimizedLife: string;
  completedAt?: Date;
}



interface ReflectionCardProps {
  title: string;
  question: string;
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  index: number;
  disabled?: boolean;
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({
  title,
  question,
  value,
  onChange,
  isActive,
  index,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{question}</p>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={disabled ? "This workshop is completed and locked for editing" : "Your reflection..."}
        className={`min-h-[140px] w-full resize-none border-gray-200 focus:border-amber-400 focus:ring-amber-400 rounded-lg ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'bg-white/80'
        }`}
        disabled={disabled}
        readOnly={disabled}
      />
    </div>
  );
};

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const [formData, setFormData] = useState<FutureSelfData>({
    direction: 'backward',
    twentyYearVision: '',
    tenYearMilestone: '',
    fiveYearFoundation: '',
    flowOptimizedLife: ''
  });
  
  // No save status tracking - user controls saving via Next button
  const [isLoading, setIsLoading] = useState(true);
  const { completed, loading, isWorkshopLocked, testCompleteWorkshop } = useWorkshopStatus();
  
  // Validation state
  const [validationError, setValidationError] = useState<string>('');

  // Load existing data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/workshop-data/future-self', {
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
          // Map legacy data to new structure
          const loadedData: FutureSelfData = {
            direction: result.data.direction || 'backward',
            twentyYearVision: result.data.twentyYearVision || result.data.futureSelfDescription || '',
            tenYearMilestone: result.data.tenYearMilestone || '',
            fiveYearFoundation: result.data.fiveYearFoundation || '',
            flowOptimizedLife: result.data.flowOptimizedLife || result.data.visualizationNotes || ''
          };
          setFormData(loadedData);
        }
      } catch (error) {
        console.log('No existing data found:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExistingData();
  }, []);

  // Removed auto-save functionality - data will only save when user clicks "Next" button

  // Handle direction change
  const handleDirectionChange = (newDirection: 'backward' | 'forward') => {
    setFormData(prev => ({ ...prev, direction: newDirection }));
  };

  // Handle reflection changes
  const handleReflectionChange = (field: keyof FutureSelfData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Demo data function
  const fillDemoData = () => {
    const demoData: FutureSelfData = {
      direction: formData.direction,
      twentyYearVision: formData.direction === 'backward' 
        ? "I've become a respected leader who transforms organizations through human-centered innovation. My work has created lasting positive impact on thousands of people's careers and wellbeing. I'm known for building cultures where people thrive authentically."
        : "Having built on my current strengths and flow experiences, I've evolved into a visionary leader who seamlessly integrates human wisdom with technological advancement, creating environments where innovation and wellbeing flourish together.",
      tenYearMilestone: formData.direction === 'backward'
        ? "I hold a senior leadership position where I guide strategic transformation initiatives. I've developed a reputation for creating psychologically safe, high-performing teams. My expertise in human development and organizational design is widely recognized."
        : "I've reached a senior strategic role where my deep understanding of flow states and human potential drives organizational innovation. I lead teams that consistently deliver breakthrough results while maintaining exceptional wellbeing and engagement.",
      fiveYearFoundation: formData.direction === 'backward'
        ? "I'm actively developing my leadership presence and expertise in organizational psychology. I'm building networks with other forward-thinking leaders and regularly speaking about human-centered leadership approaches."
        : "I've strengthened my core capabilities in facilitation, systems thinking, and team dynamics. I'm recognized as a go-to person for complex challenges that require both analytical rigor and deep human insight.",
      flowOptimizedLife: "My life is designed around sustained periods of deep work, meaningful collaboration, and continuous learning. I have clear boundaries that protect my energy for what matters most. My work feels like an extension of my natural strengths and passions, creating a sense of effortless excellence."
    };
    
    setFormData(demoData);
  };

  // Check if minimum requirements are met
  const hasMinimumContent = 
    formData.twentyYearVision.trim().length >= 10 ||
    formData.tenYearMilestone.trim().length >= 10 ||
    formData.fiveYearFoundation.trim().length >= 10 ||
    formData.flowOptimizedLife.trim().length >= 10;

  const handleSubmit = async () => {
    if (completed) {
      // If workshop is completed, just navigate
      markStepCompleted('4-4');
      setCurrentContent('final-reflection');
      return;
    }
    
    // Validate that at least one field has content
    const fields = {
      twentyYearVision: formData.twentyYearVision,
      tenYearMilestone: formData.tenYearMilestone,
      fiveYearFoundation: formData.fiveYearFoundation,
      flowOptimizedLife: formData.flowOptimizedLife
    };
    
    const validation = validateAtLeastOneField(fields, 10);
    if (!validation.isValid) {
      setValidationError(validation.errors[0].message);
      return;
    }
    
    // Clear validation error
    setValidationError('');
    
    try {
      // Save the data before proceeding to next step
      const response = await fetch('/api/workshop-data/future-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('FutureSelfView: Data saved successfully before navigation');
      } else {
        console.warn('FutureSelfView: Save failed but proceeding anyway');
      }
      
      // Mark step completed and navigate regardless of save status
      markStepCompleted('4-4');
      setCurrentContent('final-reflection');
    } catch (error) {
      console.error('FutureSelfView: Error saving or completing:', error);
      // Still proceed to next step even if save fails
      markStepCompleted('4-4');
      setCurrentContent('final-reflection');
    }
  };

  // Define the timeline order based on direction
  const timelineOrder = formData.direction === 'backward' 
    ? [{ year: 20, key: 'twentyYearVision' }, { year: 10, key: 'tenYearMilestone' }, { year: 5, key: 'fiveYearFoundation' }]
    : [{ year: 5, key: 'fiveYearFoundation' }, { year: 10, key: 'tenYearMilestone' }, { year: 20, key: 'twentyYearVision' }];

  // Define questions based on direction
  const questions = {
    backward: {
      twentyYearVision: "What is the masterpiece of your life?",
      tenYearMilestone: "What level of mastery or influence must you have reached by now to be on track?",
      fiveYearFoundation: "What capacities or conditions need to be actively developing now?"
    },
    forward: {
      fiveYearFoundation: "What capacities or conditions need to be actively developing now?",
      tenYearMilestone: "What level of mastery or influence must you have reached by now to be on track?",
      twentyYearVision: "What is the masterpiece of your life?"
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading your future self journey...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TEMPORARY TEST BUTTON - Remove after testing */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999, background: 'red', color: 'white', padding: '10px', cursor: 'pointer', borderRadius: '5px' }}>
        <div>Workshop Status: {completed ? '🔒 LOCKED' : '🔓 UNLOCKED'}</div>
        <button onClick={testCompleteWorkshop} style={{ marginTop: '5px', padding: '5px', backgroundColor: 'darkred', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          Test Lock Workshop
        </button>
      </div>

      {/* Workshop Completion Banner */}
      {completed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto mt-4">
          <div className="flex items-center gap-3">
            <ChevronRight className="text-green-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">
                Step 4-4: Your Future Self Completed
              </h3>
              <p className="text-sm text-green-600">
                Your responses are locked, but you can still view content and navigate.
              </p>
            </div>
            <div className="text-green-600">
              🔒
            </div>
          </div>
        </div>
      )}

      {/* Full-width container */}
      <div className="w-full px-6 py-8">
        
        {/* Demo button */}
        {!completed && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={fillDemoData}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              Demo
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Future Self Journey</h1>
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-amber-900 mb-3">Purpose:</h2>
                <p className="text-amber-800 leading-relaxed mb-4">
                  This exercise helps you imagine who you want to become—and how to shape a life that supports that becoming.
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Use your Flow Assessment insights to guide your vision. You can start by looking 20 years ahead and work backward, 
                  or begin with who you are today and look forward.
                </p>
                <p className="text-amber-900 font-medium mt-4">
                  There's no right way—only your way.
                </p>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src="/future_self_image.png" 
                  alt="Future Self Timeline" 
                  className="w-48 h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="4-4"
            autoplay={true}
          />
        </div>



        {/* Step 1: Choose Your Direction */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Step 1: Choose Your Direction</h2>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <p className="text-blue-800 leading-relaxed">
              Everyone imagines differently. Some start with a bold vision and trace it back. Others build step by step from the present.
            </p>
          </div>

          {/* Direction Toggle and Demo Button */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="bg-white rounded-full p-1 border-2 border-gray-200 shadow-lg">
              <div className="flex">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDirectionChange('backward')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    formData.direction === 'backward'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Work backwards<br />
                  <span className="text-xs">20→10→5 Years</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDirectionChange('forward')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ml-1 ${
                    formData.direction === 'forward'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Work forwards<br />
                  <span className="text-xs">5→10→20 Years</span>
                </motion.button>
              </div>
            </div>
            
            {/* Demo Button */}
            {!completed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fillDemoData}
                className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
              >
                Fill with Sample Reflections
              </motion.button>
            )}
          </div>

        </div>

        {/* Step 2: Timeline Reflection Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Step 2: Explore Your Timeline</h2>
          
          {/* Reflection Cards - Vertical Layout */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={formData.direction}
              className="space-y-8"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {timelineOrder.map((item, index) => {
                const cardColors = {
                  20: 'border-purple-200 bg-purple-50',
                  10: 'border-blue-200 bg-blue-50', 
                  5: 'border-emerald-200 bg-emerald-50'
                };
                
                return (
                  <motion.div
                    key={`${formData.direction}-${item.year}`}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.9 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { 
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }
                      }
                    }}
                  >
                    <div className={`p-8 rounded-xl border-2 ${cardColors[item.year as keyof typeof cardColors]} shadow-sm hover:shadow-md transition-all duration-300`}>
                      <ReflectionCard
                        title={`${item.year} Years`}
                        question={questions[formData.direction][item.key as keyof typeof questions.backward]}
                        value={formData[item.key as keyof FutureSelfData] as string}
                        onChange={(value) => handleReflectionChange(item.key as keyof FutureSelfData, value)}
                        isActive={true}
                        index={index}
                        disabled={completed}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flow Bridge Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Step 3: Bridge to Flow</h2>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
            <p className="text-blue-800 leading-relaxed mb-4">
              You've identified the conditions where you experience deep focus, energy, and ease.
            </p>
            <p className="text-blue-800 leading-relaxed mb-4">
              What would your life look like if it were designed to support those states more often?
            </p>
            <p className="text-blue-900 font-medium">
              Use this as a launch point for your Future Self. Let flow guide your imagination.
            </p>
          </div>
          
          <ReflectionCard
            title="Flow-Optimized Life"
            question="What would your life look like if it were designed to support flow states more often?"
            value={formData.flowOptimizedLife}
            onChange={(value) => handleReflectionChange('flowOptimizedLife', value)}
            isActive={true}
            index={0}
            disabled={completed}
          />
        </div>

        {/* No save status display - user controls saving via Next button */}

        {/* Validation error display */}
        {validationError && (
          <div className="max-w-4xl mx-auto mb-4">
            <ValidationMessage 
              message={validationError} 
              type="error" 
              show={!!validationError}
            />
          </div>
        )}

        {/* Next Button */}
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!hasMinimumContent && !completed}
            className={`px-8 py-3 ${
              (hasMinimumContent || completed) 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
            size="lg"
          >
            <span>
              {completed 
                ? "Continue to Final Reflection"
                : hasMinimumContent 
                  ? "Save & Continue to Final Reflection"
                  : "Add reflection to continue"
              }
            </span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FutureSelfView;