import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ArrowDown, ArrowUp } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

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
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({
  title,
  question,
  value,
  onChange,
  isActive,
  index
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: index * 0.2 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`
        bg-white p-6 rounded-lg border-2 shadow-sm transition-all duration-200
        ${isActive ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}
      `}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 mb-4 leading-relaxed">{question}</p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your reflection..."
        className="min-h-[120px] w-full resize-none border-gray-300 focus:border-amber-400 focus:ring-amber-400"
      />
    </motion.div>
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
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isLoading, setIsLoading] = useState(true);

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

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (dataToSave: FutureSelfData) => {
      try {
        setSaveStatus('saving');
        const response = await fetch('/api/workshop-data/future-self', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dataToSave)
        });
        
        const result = await response.json();
        if (result.success) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
      }
    }, 1000),
    []
  );

  // Trigger save whenever form data changes
  useEffect(() => {
    if (!isLoading && (formData.twentyYearVision || formData.tenYearMilestone || formData.fiveYearFoundation || formData.flowOptimizedLife)) {
      debouncedSave(formData);
    }
  }, [formData, debouncedSave, isLoading]);

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
    if (!hasMinimumContent) return;
    
    try {
      markStepCompleted('4-4');
      setCurrentContent('final-reflection');
    } catch (error) {
      console.error('Error completing future self reflection:', error);
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
      {/* Full-width container */}
      <div className="w-full px-6 py-8">
        
        {/* Demo button */}
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

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Future Self Journey</h1>
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
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
        </div>

        {/* Video Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="4-4"
            autoplay={true}
          />
        </div>

        {/* Direction Choice */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Step 1: Choose Your Direction</h2>
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <p className="text-gray-700 mb-6 leading-relaxed">
              Everyone imagines differently. Some start with a bold vision and trace it back. 
              Others build step by step from the present.
            </p>
            <p className="text-gray-900 font-medium mb-6">There's no right way—only your way.</p>
            
            <div className="flex gap-4">
              <Button
                variant={formData.direction === 'backward' ? 'default' : 'outline'}
                onClick={() => handleDirectionChange('backward')}
                className={`flex-1 p-4 h-auto ${
                  formData.direction === 'backward' 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Start with 20 Years</div>
                  <div className="text-sm opacity-90">(Bold vision approach)</div>
                </div>
              </Button>
              
              <Button
                variant={formData.direction === 'forward' ? 'default' : 'outline'}
                onClick={() => handleDirectionChange('forward')}
                className={`flex-1 p-4 h-auto ${
                  formData.direction === 'forward' 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Start with 5 Years</div>
                  <div className="text-sm opacity-90">(Present momentum)</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Step 2: Your Timeline</h2>
          
          <div className="flex justify-center mb-12">
            {/* Timeline Graphic */}
            <div className="flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={formData.direction}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  {timelineOrder.map((item, index) => (
                    <TimelineCircle
                      key={item.year}
                      year={item.year}
                      isActive={true}
                      isStarting={index === 0}
                      direction={formData.direction}
                      position={index === 0 ? 'first' : index === timelineOrder.length - 1 ? 'last' : 'middle'}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Reflection Cards */}
          <motion.div 
            className="grid gap-8"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            {timelineOrder.map((item, index) => (
              <ReflectionCard
                key={`${formData.direction}-${item.year}`}
                title={`${item.year} Years`}
                question={questions[formData.direction][item.key as keyof typeof questions.backward]}
                value={formData[item.key as keyof FutureSelfData] as string}
                onChange={(value) => handleReflectionChange(item.key as keyof FutureSelfData, value)}
                isActive={true}
                index={index}
              />
            ))}
          </motion.div>
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
          />
        </div>

        {/* Save Status */}
        <div className="max-w-4xl mx-auto mb-6 text-center">
          <p className="text-sm text-gray-500">
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'All changes saved'}
            {saveStatus === 'error' && 'Error saving - please try again'}
          </p>
        </div>

        {/* Next Button */}
        <div className="max-w-4xl mx-auto flex justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!hasMinimumContent}
            className={`px-8 py-3 ${
              hasMinimumContent 
                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
            size="lg"
          >
            <span>
              {hasMinimumContent 
                ? "Next: Final Reflection" 
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