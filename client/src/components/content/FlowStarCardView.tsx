import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import StarCardWithFetch from '@/components/starcard/StarCardWithFetch';
import { Gauge, ChevronRight, X, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getAttributeColor, CARD_WIDTH, CARD_HEIGHT, QUADRANT_COLORS } from '@/components/starcard/starCardConstants';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define the flow attribute type
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

const FlowStarCardView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAttributes, setSelectedAttributes] = useState<RankedAttribute[]>([]);
  const [starCardFlowAttributes, setStarCardFlowAttributes] = useState<FlowAttribute[]>([]);
  const [showSelectionInterface, setShowSelectionInterface] = useState<boolean>(true); // Modified: Keep interface visible initially
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // Workshop status for locking functionality
  const { completed: workshopCompleted, isWorkshopLocked } = useWorkshopStatus();

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent auth loop
    refetchOnWindowFocus: false,
    enabled: true,
  });

  // Fetch flow attributes data
  const { data: flowAttributesData, isLoading: flowAttributesLoading } = useQuery<{
    success: boolean;
    attributes: Array<{ name: string; score: number }>;
    flowScore: number;
  }>({
    queryKey: ['/api/workshop-data/flow-attributes'],
    enabled: true,
  });

  const user = (userData as any)?.user;

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

  // Determine if card is already complete
  const isCardComplete = (flowAttributesData?.attributes && 
                        Array.isArray(flowAttributesData.attributes) && 
                        flowAttributesData.attributes.length > 0) ||
                        (selectedAttributes.length === 4 && selectedAttributes.every(attr => attr.rank !== null));

  // Check if attributes exist in database (should disable picker)
  const hasExistingAttributes = flowAttributesData?.success && 
                               flowAttributesData?.attributes && 
                               Array.isArray(flowAttributesData.attributes) && 
                               flowAttributesData.attributes.length > 0;

  useEffect(() => {
    console.log("FlowStarCardView useEffect - flowAttributesData:", flowAttributesData);
    console.log("FlowStarCardView useEffect - hasExistingAttributes:", hasExistingAttributes);
    
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
        description: "Your flow attributes have been saved and your Star Card is now complete.",
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

  return (
    <>
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

          {selectedAttributes.filter(attr => attr.rank !== null).length === 4 && showSelectionInterface ? (
            <div className="mt-2">
              <Button
                className="w-full bg-indigo-700 hover:bg-indigo-800"
                disabled={selectedAttributes.filter(attr => attr.rank !== null).length !== 4 || flowAttributesMutation.isPending}
                onClick={saveFlowAttributes}
              >
                {flowAttributesMutation.isPending ? "Saving..." : 
                 isUpdating ? "Update Flow Attributes" : "Add Flow Attributes to Star Card"}
              </Button>
            </div>
          ) : null}

          <div className="flex justify-center mt-8">
            <Button 
              onClick={() => {
                if (isCardComplete) {
                  markStepCompleted('3-4');
                  setCurrentContent("wellbeing");
                } else {
                  toast({
                    title: "Step Not Complete",
                    description: "Please select and save 4 flow attributes to your Star Card before proceeding.",
                    variant: "destructive"
                  });
                }
              }}
              disabled={!isCardComplete}
              className={`${isCardComplete 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isCardComplete 
                ? "Next: Ladder of Well-being" 
                : "Complete flow attributes to continue"
              } <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlowStarCardView;