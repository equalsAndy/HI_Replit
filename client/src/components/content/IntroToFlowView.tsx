import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import StarCardWithFetch from '@/components/starcard/StarCardWithFetch';
import { Gauge, ChevronRight, X, GripVertical, Zap, Check } from 'lucide-react';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { trpc } from "@/utils/trpc";
import FlowAssessmentModal from '@/components/flow/FlowAssessmentModal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getAttributeColor, CARD_WIDTH, CARD_HEIGHT, QUADRANT_COLORS } from '@/components/starcard/starCardConstants';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useStarCardAutoCapture } from '@/hooks/useStarCardAutoCapture';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '@/styles/section-headers.css';

// Interface for flow attributes
interface FlowAttribute {
  text: string;
  color: string;
}

interface RankedAttribute {
  text: string;
  rank: number | null;
}

// All flow attributes in a single list - grouped by quadrant for better organization
const flowAttributes = [
  // Thinking attributes
  "Abstract", "Analytic", "Astute", "Big Picture", "Curious", 
  "Focused", "Insightful", "Logical", "Investigative", "Rational", 
  "Reflective", "Sensible", "Strategic", "Thoughtful",

  // Feeling attributes
  "Collaborative", "Creative", "Encouraging", "Expressive",
  "Empathic", "Intuitive", "Inspiring", "Objective", "Passionate",
  "Positive", "Receptive", "Supportive",

  // Planning attributes
  "Detail-Oriented", "Diligent", "Immersed", "Industrious", "Methodical",
  "Organized", "Precise", "Punctual", "Reliable", "Responsible",
  "Straightforward", "Tidy", "Systematic", "Thorough",

  // Acting attributes
  "Adventuresome", "Competitive", "Dynamic", "Effortless", "Energetic",
  "Engaged", "Funny", "Persuasive", "Open-Minded", "Optimistic",
  "Practical", "Resilient", "Spontaneous", "Vigorous"
];

// Sortable flow badge component for drag-and-drop reordering
const SortableFlowBadge = ({ 
  text, 
  rank, 
  rankBadgeColor, 
  onRemove 
}: { 
  text: string; 
  rank: number; 
  rankBadgeColor: string;
  onRemove: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: text });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center"
    >
      <Badge 
        variant="outline"
        className="bg-gray-200 text-gray-900 cursor-move transition-colors flex items-center"
      >
        <span {...listeners} {...attributes} className="cursor-grab mr-1">
          <GripVertical className="h-3 w-3 text-gray-500" />
        </span>
        {text}
        <span className={`ml-1 inline-flex items-center justify-center rounded-full h-5 w-5 text-xs text-white ${rankBadgeColor}`}>
          {rank + 1}
        </span>
        <button 
          className="ml-1 text-gray-600 hover:text-gray-800"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    </div>
  );
};

// Regular flow badge component for selections
const FlowBadge = ({ text, rank = 0, selected = false, rankBadgeColor = "", disabled = false, onSelect, onRemove }: { 
  text: string; 
  rank?: number | null; // Allow null or undefined with a default value applied
  selected?: boolean;
  rankBadgeColor?: string;
  disabled?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
}) => {
  return (
    <Badge 
      variant="outline"
      className={`${selected ? 'bg-gray-200 text-gray-900' : disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'} transition-colors flex items-center`}
      onClick={disabled ? undefined : onSelect}
    >
      {text}
      {rank !== null && rank !== undefined && (
        <span className={`ml-1 inline-flex items-center justify-center rounded-full h-5 w-5 text-xs text-white ${rankBadgeColor}`}>
          {rank + 1}
        </span>
      )}
      {selected && onRemove && !disabled && (
        <button 
          className="ml-1 text-gray-600 hover:text-gray-800"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
};

// Get color for rank badge - grey scale for picker interface
const getRankBadgeColor = (rank: number): string => {
  switch(rank) {
    case 0: return 'bg-black';
    case 1: return 'bg-gray-700';
    case 2: return 'bg-gray-500';
    case 3: return 'bg-gray-400';
    default: return 'bg-gray-600';
  }
};

// Flow assessment questions for results display
const flowQuestions = [
  { id: 1, text: "I often feel deeply focused and energized by my work." },
  { id: 2, text: "The challenges I face are well matched to my skills." },
  { id: 3, text: "I lose track of time when I'm fully engaged." },
  { id: 4, text: "I feel in control of what I'm doing, even under pressure." },
  { id: 5, text: "I receive clear feedback that helps me stay on track." },
  { id: 6, text: "I know exactly what needs to be done in my work." },
  { id: 7, text: "I feel more spontaneous when I'm in flow." },
  { id: 8, text: "I can do things almost effortlessly." },
  { id: 9, text: "I enjoy the process itself, not just the results." },
  { id: 10, text: "I have rituals or environments that help me quickly get into deep focus." },
  { id: 11, text: "I forget to take breaks because I'm so immersed." },
  { id: 12, text: "I want to recapture this experience again—it's deeply rewarding." },
];

// Helper functions for assessment results
const valueToLabel = (value: number) => {
  switch (value) {
    case 1: return "Never";
    case 2: return "Rarely";
    case 3: return "Sometimes";
    case 4: return "Often";
    case 5: return "Always";
    default: return "";
  }
};

const getInterpretation = (score: number) => {
  if (score >= 50) {
    return {
      level: "Flow Fluent",
      description: "You reliably access flow and have developed strong internal and external conditions to sustain it."
    };
  } else if (score >= 39) {
    return {
      level: "Flow Aware",
      description: "You are familiar with the experience but have room to reinforce routines or reduce blockers."
    };
  } else if (score >= 26) {
    return {
      level: "Flow Blocked",
      description: "You occasionally experience flow but face challenges in entry, recovery, or sustaining focus."
    };
  } else {
    return {
      level: "Flow Distant",
      description: "You rarely feel in flow; foundational improvements to clarity, challenge, and environment are needed."
    };
  }
};

const IntroToFlowView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch video from database using tRPC
  const { data: videoData, isLoading: videoLoading, error } = trpc.lesson.byStep.useQuery({
    workshop: 'allstarteams',
    stepId: '2-2',
  });
  const [selectedAttributes, setSelectedAttributes] = useState<RankedAttribute[]>([]);
  const [starCardFlowAttributes, setStarCardFlowAttributes] = useState<FlowAttribute[]>([]);
  const [showSelectionInterface, setShowSelectionInterface] = useState<boolean>(true); // Modified: Keep interface visible initially
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // Flow assessment state
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  
  // Workshop status for locking functionality
  const { completed: workshopCompleted, isWorkshopLocked } = useWorkshopStatus();
  
  // StarCard auto-capture functionality
  const { captureStarCardFromPage } = useStarCardAutoCapture();

  // Navigation progress hook
  const { updateVideoProgress, progress, canProceedToNext } = useNavigationProgress();
  const stepId = "2-2"; // This is the correct Flow Patterns step

  // Set up the sensors for drag and drop - defined at component level to avoid conditional hooks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 0, // Always fetch fresh data from database
    gcTime: 0, // Don't cache the data
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
    enabled: true,
  });

  // Fetch flow attributes data
  const { data: flowAttributesData, isLoading: flowAttributesLoading } = useQuery<{
    success: boolean;
    attributes: Array<{ name: string; score: number }>;
    flowScore: number;
  }>({
    queryKey: ['/api/workshop-data/flow-attributes'],
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    enabled: true,
  });

  const user = (userData as any)?.user;

  // Determine if card is already complete (attributes saved to database)
  const isCardComplete = flowAttributesData?.attributes && 
                        Array.isArray(flowAttributesData.attributes) && 
                        flowAttributesData.attributes.length > 0;

  // Check if attributes exist in database (should disable picker)
  const hasExistingAttributes = flowAttributesData?.success && 
                               flowAttributesData?.attributes && 
                               Array.isArray(flowAttributesData.attributes) && 
                               flowAttributesData.attributes.length > 0;

  // Check if user has selected exactly 4 attributes for UI state
  const hasSelected4Attributes = selectedAttributes.filter(attr => attr.rank !== null).length === 4;

  useEffect(() => {
    console.log("IntroToFlowView useEffect - flowAttributesData:", flowAttributesData);
    console.log("IntroToFlowView useEffect - hasExistingAttributes:", hasExistingAttributes);
    
    // Wait for data to load
    if (flowAttributesLoading) {
      console.log("Still loading flow attributes data...");
      return;
    }
    
    if (hasExistingAttributes && flowAttributesData?.attributes) {
      console.log("Found existing flow attributes:", flowAttributesData.attributes);

      // Map existing attributes to the local state - handle both possible data structures
      const mappedAttributes = flowAttributesData.attributes.map((attr: any, index: number) => {
        // Some attributes might have 'text' property, others might have 'name'
        const attrText = attr.text || attr.name || (typeof attr === 'string' ? attr : '');
        return {
          text: attrText,
          rank: index
        };
      });

      console.log("Mapped existing attributes:", mappedAttributes);
      setSelectedAttributes(mappedAttributes);

      // Also set the starcard attributes
      const coloredAttributes = mappedAttributes.map(attr => ({
        text: attr.text,
        color: getAttributeColor(attr.text)
      }));

      console.log("Setting flow attributes for display:", coloredAttributes);
      setStarCardFlowAttributes(coloredAttributes);
      // Hide the selection interface since attributes exist
      setShowSelectionInterface(false);
      console.log("Hiding selection interface - attributes already exist");
    } else {
      console.log("No existing attributes found, showing selection interface");
      setShowSelectionInterface(true);
    }
  }, [flowAttributesData, hasExistingAttributes, flowAttributesLoading]);

  // Check for existing flow assessment completion
  useEffect(() => {
    const checkExistingAssessment = async () => {
      try {
        const response = await fetch('/api/workshop-data/flow-assessment', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.completed) {
            setHasCompletedAssessment(true);
            // Load the full assessment results for inline display
            setAssessmentResults({
              answers: data.data.answers,
              flowScore: data.data.flowScore,
              completed: true
            });
          }
        }
      } catch (error) {
        console.error('Error checking for existing assessment:', error);
      }
    };

    checkExistingAssessment();
  }, []);

  // Flow assessment completion handler
  const handleAssessmentComplete = (results: any) => {
    console.log('Flow assessment completed with results:', results);
    setHasCompletedAssessment(true);
    setAssessmentResults(results);
    setIsAssessmentModalOpen(false);

    // Mark this step as completed since the assessment is now done
    if (markStepCompleted) {
      markStepCompleted('3-1');
    }
  };

  // Handle video progress updates (for tracking only, not for unlocking)
  const handleVideoProgress = (percentage: number) => {
    console.log(`🎬 IntroToFlowView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
    console.log(`🎬 SIMPLIFIED MODE: Video progress tracked but Next button already active`);
  };

  // Flow attributes save mutation
  const flowAttributesMutation = useMutation({
    mutationFn: async (data: { flowScore: number; attributes: Array<{ name: string; score: number }> }) => {
      const response = await fetch('/api/workshop-data/flow-attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ attributes: data.attributes })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save flow attributes');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate flow attributes query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/flow-attributes'] });
      // Update star card to complete state
      fetch('/api/starcard/reviewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      // Invalidate star card data
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });

      // Hide the selection interface after successful save
      setShowSelectionInterface(false);
      setIsUpdating(false);

      toast({
        title: "Flow attributes saved!",
        duration: 5000
      });

      // DO NOT auto-mark completed - let user do it manually from the interface
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save flow attributes",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Helper functions for attribute selection
  const handleAttributeSelect = (text: string) => {
    // Don't allow selection if card is complete and we're not in edit mode
    if (isCardComplete && !showSelectionInterface) {
      return; // No action, selection is disabled
    }

    // Enable updating mode when making any changes
    setIsUpdating(true);

    // Check if attribute is already in the list (selected)
    const existingAttr = selectedAttributes.find(attr => attr.text === text);

    if (existingAttr) {
      // If it's already selected, remove it and adjust other ranks
      const removedRank = existingAttr.rank;

      // Remove the attribute and recalculate ranks if it had a rank
      const filteredAttrs = selectedAttributes.filter(attr => attr.text !== text);
      const updatedAttrs = filteredAttrs.map(attr => {
        if (attr.rank !== null && removedRank !== null && attr.rank > removedRank) {
          return { ...attr, rank: attr.rank - 1 };
        }
        return attr;
      });

      setSelectedAttributes(updatedAttrs);
    } else {
      // If it's not selected, add it to the list only if we have less than 4 ranked attributes
      const rankedAttrs = selectedAttributes.filter(attr => attr.rank !== null);
      if (rankedAttrs.length < 4) {
        setSelectedAttributes([
          ...selectedAttributes,
          { text, rank: rankedAttrs.length }
        ]);
      } else {
        // If we already have 4 attributes, show a notification
        toast({
          title: "Maximum attributes selected",
          description: "You can only select 4 flow attributes. Remove one before adding another.",
          variant: "default"
        });
      }
    }
  };

  const handleRemoveAttribute = (text: string) => {
    // Find the attribute to remove
    const attrToRemove = selectedAttributes.find(attr => attr.text === text);
    if (!attrToRemove) return;

    // Enable updating mode when removing attributes
    setIsUpdating(true);

    // Remove it and adjust ranks
    const removedRank = attrToRemove.rank;
    const filteredAttrs = selectedAttributes.filter(attr => attr.text !== text);

    if (removedRank !== null) {
      // Adjust ranks for attributes with higher ranks
      const updatedAttrs = filteredAttrs.map(attr => {
        if (attr.rank !== null && attr.rank > removedRank) {
          return { ...attr, rank: attr.rank - 1 };
        }
        return attr;
      });
      setSelectedAttributes(updatedAttrs);
    } else {
      setSelectedAttributes(filteredAttrs);
    }
  };

  // Handle drag end for reordering attributes
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedAttributes((items) => {
        // Find the items we're reordering
        const activeItem = items.find(item => item.text === active.id);
        const overItem = items.find(item => item.text === over.id);

        if (!activeItem || !overItem || activeItem.rank === null || overItem.rank === null) {
          return items;
        }

        // Get the ordered array of items with ranks
        const rankedItems = items
          .filter(item => item.rank !== null)
          .sort((a, b) => (a.rank || 0) - (b.rank || 0));

        // Find the indices for swapping
        const activeIndex = rankedItems.findIndex(item => item.text === active.id);
        const overIndex = rankedItems.findIndex(item => item.text === over.id);

        // Reorder the array
        const newRankedItems = arrayMove(rankedItems, activeIndex, overIndex);

        // Update all ranks based on new positions
        const updatedRankedItems = newRankedItems.map((item, index) => ({
          ...item,
          rank: index
        }));

        // Merge ranked items with unranked items
        const unrankedItems = items.filter(item => item.rank === null);
        return [...updatedRankedItems, ...unrankedItems];
      });
    }
  };

  const saveFlowAttributes = () => {
    // Create a new version of the StarCard component with the flow attributes
    const rankedAttributes = selectedAttributes
      .filter(attr => attr.rank !== null)
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));

    if (rankedAttributes.length === 4) {
      // Get properly colored attributes
      const coloredAttributes = rankedAttributes.map(attr => ({
        text: attr.text,
        color: getAttributeColor(attr.text)
      }));

      // Update the StarCard flow attributes (local state)
      setStarCardFlowAttributes(coloredAttributes);

      // Convert to server format and save to server with scores
      const serverAttributes = rankedAttributes.map((attr, index) => ({
        name: attr.text,
        score: 100 - (index * 5) // Score from 100 to 85 in decrements of 5
      }));

      // Random flow score between 45 and 60 (max possible score)
      const randomFlowScore = Math.floor(Math.random() * 16) + 45;

      // Save flow attributes to server with proper data structure
      flowAttributesMutation.mutate({
        flowScore: randomFlowScore,
        attributes: serverAttributes
      });
    }
  };

  const handleContinueToRoundingOut = () => {
    if (markStepCompleted) {
      markStepCompleted('3-1');
    }
    if (setCurrentContent) {
      setCurrentContent('flow-rounding-out');
    }
  };

  return (
    <>
      {/* Intro to Flow Content */}
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Flow Patterns</h1>

        {/* Flow Patterns Video with Transcript and Glossary */}
        <div className="mb-8">
          {videoLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading video...</span>
            </div>
          ) : error ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
              Error loading video. Using fallback.
            </div>
          ) : videoData ? (
            <VideoTranscriptGlossary
              youtubeId={videoData.youtubeId}
              title={videoData.title}
              transcriptMd={videoData.transcriptMd}
              glossary={videoData.glossary ?? []}
            />
          ) : (
            <VideoTranscriptGlossary
              youtubeId="KGv31SFLKC0"
              title="Flow Patterns"
            />
          )}
        </div>

        {/* Some Things to Know Header */}
        <div className="section-headers-tabs-60 mt-16 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--content">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">📚 Some Things to Know</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Understanding Flow State</h2>

          <p className="text-gray-700 mb-4">
            Flow is a state of complete immersion in an activity, characterized by energized focus, full involvement, and enjoyment in
            the process. It's often described as being "in the zone" - when time seems to disappear and you're completely absorbed
            in what you're doing.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-3">Clear Goals</h3>
              <p className="text-gray-700">
                You know exactly what you need to accomplish and can measure your progress.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-700 mb-3">Balance of Challenge & Skill</h3>
              <p className="text-gray-700">
                The task is challenging enough to engage you but not so difficult that it causes anxiety.
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-3">Immediate Feedback</h3>
              <p className="text-gray-700">
                You can quickly tell how well you're doing, allowing for adjustment in real-time.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-700 mb-3">Deep Concentration</h3>
              <p className="text-gray-700">
                Your attention is completely focused on the task at hand, with no distractions.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-blue-700 mb-4">Benefits of Flow State</h2>

          <p className="text-gray-700 mb-4">
            Regularly experiencing flow is associated with:
          </p>

          <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
            <li>Higher productivity and performance</li>
            <li>Increased creativity and innovation</li>
            <li>Greater enjoyment and satisfaction</li>
            <li>Reduced stress and anxiety</li>
            <li>Enhanced learning and skill development</li>
          </ul>

          <p className="text-gray-700 mb-4">
            Your strongest strengths naturally create opportunities for flow experiences.
            When you understand your flow patterns, you can design your work and life to
            create more of these deeply satisfying moments.
          </p>
        </div>

        {/* Flow Assessment Section - New Modal Launch Area */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Your Flow Self-Assessment</h3>
            <p className="text-blue-800 mb-6 max-w-2xl mx-auto">
              Discover your personal flow patterns and identify what conditions help you achieve peak performance. 
              This assessment will help you understand when and how you experience flow most naturally.
            </p>

            {hasCompletedAssessment ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-medium">
                    ✅ You've completed the flow assessment! Your results are displayed below.
                  </p>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAssessmentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Take the Flow Assessment
              </Button>
            )}
          </div>
        </div>

        {/* Inline Flow Assessment Results */}
        {hasCompletedAssessment && assessmentResults && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Your Flow Assessment Results</h3>

            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                  <Check className="h-8 w-8 text-blue-600" />
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-blue-700 mb-2">
                    {assessmentResults.flowScore} / {flowQuestions.length * 5}
                  </p>
                  <p className="text-xl font-semibold text-gray-800">
                    {getInterpretation(assessmentResults.flowScore).level}
                  </p>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg text-left max-w-2xl mx-auto">
                  <p className="text-gray-700">{getInterpretation(assessmentResults.flowScore).description}</p>
                </div>
              </div>

              {/* Questions Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Responses Summary</h4>
                <div className="max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {flowQuestions.map((q) => (
                      <div key={q.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 pr-4">
                          <span className="text-sm font-medium text-gray-900">Q{q.id}:</span>
                          <span className="text-sm text-gray-700 ml-2">{q.text}</span>
                        </div>
                        <div className={`
                          px-3 py-1 rounded-full text-xs font-medium text-white
                          ${assessmentResults.answers[q.id] === 1 ? 'bg-red-500' :
                            assessmentResults.answers[q.id] === 2 ? 'bg-orange-500' :
                            assessmentResults.answers[q.id] === 3 ? 'bg-yellow-600' :
                            assessmentResults.answers[q.id] === 4 ? 'bg-green-500' :
                            assessmentResults.answers[q.id] === 5 ? 'bg-blue-600' : 'bg-gray-400'}
                        `}>
                          {assessmentResults.answers[q.id] ? valueToLabel(assessmentResults.answers[q.id]) : 'Not answered'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">What's Next?</h3>
          <p className="text-gray-700">
            After completing your flow assessment, you'll explore your results in more detail and learn how to create more 
            opportunities for flow in your work and life. This understanding will be added to your Star Card to create 
            a complete picture of your strengths and optimal performance conditions.
          </p>
        </div>
      </div>

      {/* Add Flow to Star Card Content */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add Flow to Your Star Card</h1>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <h4 className="font-medium text-blue-800 mb-2">Understanding Flow Attributes</h4>
        <p className="text-blue-700 mb-0">
          Flow attributes represent how you work at your best. They complement your Star strengths profile which shows what you're naturally good at.
          Together, they create a more complete picture of your professional identity and help others understand how to collaborate with you effectively.
        </p>
      </div>

      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Now that you've completed the flow assessment and reflection, select four flow attributes 
          that best describe your optimal flow state. These will be added to your StarCard to create 
          a comprehensive visualization of your strengths and flow profile.
        </p>
      </div>

      {hasExistingAttributes && !showSelectionInterface && !workshopCompleted && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-green-800 mb-2">✓ Flow Attributes Already Set</h4>
              <p className="text-green-700 text-sm">
                Your flow attributes have been saved and appear on your Star Card.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-200 text-green-700 hover:text-green-800 hover:bg-green-100"
              onClick={() => setShowSelectionInterface(true)}
            >
              Edit Attributes
            </Button>
          </div>
        </div>
      )}

      {/* Workshop completion message */}
      {workshopCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <ChevronRight className="text-green-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">
                Workshop complete. Your responses are locked, but you can watch videos and read your answers.
              </h3>
            </div>
            <div className="text-green-600">
              🔒
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {hasExistingAttributes && !showSelectionInterface ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Your Flow Attributes</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    These attributes reflect how you work at your best when in flow state.
                  </p>

                  {/* Show selected attributes in a read-only display */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">I find myself in flow when I am being:</h4>
                    <div className="p-3 border border-gray-200 rounded-lg min-h-[60px]">
                      <div className="flex flex-wrap gap-2">
                        {selectedAttributes
                          .filter(attr => attr.rank !== null)
                          .sort((a, b) => (a.rank || 0) - (b.rank || 0))
                          .map(attr => (
                            <Badge 
                              key={attr.text} 
                              variant="outline"
                              className="bg-indigo-100 text-indigo-800"
                            >
                              {attr.text}
                              <span className={`ml-1 inline-flex items-center justify-center rounded-full h-5 w-5 text-xs text-white ${getRankBadgeColor(attr.rank || 0)}`}>
                                {(attr.rank || 0) + 1}
                              </span>
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-4">Select Your Flow Attributes</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      Choose 4 words that best describe your flow state. Click badges to select/deselect. Once selected, use the grip handle to drag and reorder your selections.
                    </p>
                  </div>

                  {/* Selected attributes */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">I find myself in flow when I am being:</h4>
                    </div>

                    <div className="p-3 border border-gray-200 rounded-lg min-h-[60px]">
                      {selectedAttributes.filter(attr => attr.rank !== null).length > 0 ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={selectedAttributes
                              .filter(attr => attr.rank !== null)
                              .sort((a, b) => (a.rank || 0) - (b.rank || 0))
                              .map(attr => attr.text)
                            }
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="flex flex-wrap gap-2">
                              {selectedAttributes
                                .filter(attr => attr.rank !== null)
                                .sort((a, b) => (a.rank || 0) - (b.rank || 0))
                                .map(attr => (
                                  <SortableFlowBadge 
                                    key={attr.text} 
                                    text={attr.text} 
                                    rank={attr.rank || 0} 
                                    rankBadgeColor={getRankBadgeColor(attr.rank || 0)}
                                    onRemove={() => handleRemoveAttribute(attr.text)}
                                  />
                                ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <p className="text-sm text-gray-500 italic flex items-center justify-center">
                          Select a word below to add it to your flow attributes
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Available attributes */}
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Flow Attributes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {flowAttributes.map((attr: string) => {
                        const isSelected = selectedAttributes.some(selected => selected.text === attr);
                        const rank = selectedAttributes.find(selected => selected.text === attr)?.rank;
                        const isDisabled = hasExistingAttributes && !isUpdating;

                        return (
                          <FlowBadge 
                            key={attr}
                            text={attr}
                            rank={rank || 0}
                            selected={isSelected}
                            disabled={isDisabled}
                            rankBadgeColor={rank !== null && rank !== undefined ? getRankBadgeColor(rank) : ''}
                            onSelect={() => handleAttributeSelect(attr)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 mt-6">
                <h4 className="font-medium text-gray-700 mb-2">Selection Tip</h4>
                <p className="text-sm text-gray-600">
                  Choose attributes that reflect how you feel and perform when you're deeply engaged in meaningful work. 
                  These will appear in the four corners of your Star Card.
                </p>
              </div>

              {isCardComplete && (
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-gray-200 text-gray-600"
                    onClick={() => {
                      setShowSelectionInterface(false);
                      setIsUpdating(false);
                    }}
                  >
                    Cancel and keep my current attributes
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Your Star Card</h3>
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm mb-4">
            <div className="p-4 flex justify-center">
              <div style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH }}>
                <StarCardWithFetch 
                  fallbackData={{
                    thinking: starCard?.thinking || 0,
                    acting: starCard?.acting || 0,
                    feeling: starCard?.feeling || 0,
                    planning: starCard?.planning || 0,
                    imageUrl: starCard?.imageUrl || null
                  }}
                  flowAttributes={starCardFlowAttributes}
                  downloadable={false}
                />
              </div>
            </div>
          </div>

          {hasSelected4Attributes && showSelectionInterface ? (
            <div className="mt-2">
              <Button
                className="w-full bg-indigo-700 hover:bg-indigo-800"
                disabled={!hasSelected4Attributes || flowAttributesMutation.isPending}
                onClick={saveFlowAttributes}
              >
                {flowAttributesMutation.isPending ? "Saving..." : 
                 isUpdating ? "Update Flow Attributes" : "Add Flow Attributes to Star Card"}
              </Button>
            </div>
          ) : null}

          {/* Only show Next button after flow attributes are added */}
          {isCardComplete && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={async () => {
                  // Auto-capture StarCard before proceeding
                  if (user?.id) {
                    console.log('🎯 Auto-capturing StarCard for user:', user.id);
                    try {
                      await captureStarCardFromPage(user.id);
                    } catch (error) {
                      console.warn('StarCard auto-capture failed, but continuing:', error);
                      // Don't block user flow if capture fails
                    }
                  }
                  
                  markStepCompleted('2-2');
                  setCurrentContent("rounding-out");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Next: Rounding Out <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Flow Assessment Modal */}
      <FlowAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onComplete={handleAssessmentComplete}
      />
    </>
  );
};

export default IntroToFlowView;