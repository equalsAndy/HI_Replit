import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import MainContainer from '@/components/layout/MainContainer';
import FlowAssessment from '@/components/flow/FlowAssessment';
import StarCard from '@/components/starcard/StarCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDemoMode } from '@/hooks/use-demo-mode';
import type { User, StarCard as StarCardType, FlowAttributes } from "@shared/schema";
import { apiRequest, queryClient } from '@/lib/queryClient';
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define the user type based on the app's data structure
interface UserType {
  id: number;
  name: string;
  title: string;
  organization: string;
  progress: number;
  avatarUrl?: string;
}

// All flow attributes in a single list
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

interface RankedAttribute {
  text: string;
  rank: number | null;
}

// Sortable attribute component for drag and drop
interface SortableAttributeProps {
  id: string;
  text: string;
  rank: number;
  rankBadgeColor: string;
  onRemove: () => void;
}

function SortableAttribute({ id, text, rank, rankBadgeColor, onRemove }: SortableAttributeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };
  
  // Use a styled div instead of Badge component to avoid TypeScript errors with ref
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 cursor-move px-2 py-1 rounded-md inline-flex items-center text-sm font-medium"
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      <div className="flex items-center">
        <span className="mr-1">
          {text}
        </span>
        <span className={`ml-1 inline-flex items-center justify-center rounded-full h-5 w-5 text-xs ${rankBadgeColor}`}>
          {rank}
        </span>
      </div>
    </div>
  );
}

export default function FindYourFlow() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("intro");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const { toast } = useToast();
  const [selectedAttributes, setSelectedAttributes] = useState<RankedAttribute[]>([]);
  const { isDemoMode } = useDemoMode();
  
  // We'll get these values from the later declarations to avoid duplication
  
  // Helper functions for attribute selection
  const handleAttributeSelect = (text: string) => {
    // Don't allow selection if card is already complete
    if (isCardComplete) {
      toast({
        title: "Card already complete",
        description: "Your Star Card is already complete with flow attributes. Reset your data to make changes.",
        variant: "default"
      });
      return;
    }
    
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
      // Check if we already have 4 ranked attributes
      const rankedCount = selectedAttributes.filter(attr => attr.rank !== null).length;
      if (rankedCount >= 4) {
        toast({
          title: "Maximum attributes selected",
          description: "Please deselect an attribute before selecting another one.",
          variant: "destructive"
        });
        return;
      }
      
      // Add the attribute to the list with the next available rank
      const nextRank = rankedCount + 1;
      setSelectedAttributes([
        ...selectedAttributes,
        { text, rank: nextRank }
      ]);
    }
  };
  
  const handleRemoveAttribute = (text: string) => {
    const removedAttr = selectedAttributes.find(attr => attr.text === text);
    if (!removedAttr || removedAttr.rank === null) return;
    
    const removedRank = removedAttr.rank;
    
    // Remove the attribute and recalculate ranks
    const filteredAttrs = selectedAttributes.filter(attr => attr.text !== text);
    const updatedAttrs = filteredAttrs.map(attr => {
      if (attr.rank !== null && attr.rank > removedRank) {
        return { ...attr, rank: attr.rank - 1 };
      }
      return attr;
    });
    
    setSelectedAttributes(updatedAttrs);
  };
  
  // Define all flow attributes
  const allFlowAttributes = [
    'Abstract', 'Analytic', 'Astute', 'Big Picture', 'Curious', 'Focussed', 
    'Insightful', 'Logical', 'Investigative', 'Rational', 'Reflective', 
    'Sensible', 'Strategic', 'Thoughtful',
    'Adaptable', 'Adventurous', 'Assertive', 'Brave', 'Capable', 'Challenging',
    'Confident', 'Courageous', 'Decisive', 'Dynamic', 'Energetic', 'Fearless',
    'Physical', 'Resolute', 'Resourceful', 'Strong',
    'Accepting', 'Authentic', 'Calm', 'Caring', 'Compassionate', 'Connected',
    'Considerate', 'Diplomatic', 'Emotional', 'Empathetic', 'Friendly', 'Generous',
    'Gentle', 'Grateful', 'Harmonious', 'Helpful', 'Kind', 'Open', 'Sociable', 'Vulnerable',
    'Careful', 'Consistent', 'Controlled', 'Dependable', 'Detailed', 'Diligent',
    'Methodical', 'Meticulous', 'Orderly', 'Organized', 'Precise', 'Punctual',
    'Reliable', 'Responsible', 'Thorough', 'Trustworthy'
  ];
  
  // Get all flow attributes
  const getFilteredAttributes = (): string[] => {
    // Return the predefined list of flow attributes
    return allFlowAttributes;
  };
  
  // Map to determine attribute category and color
  const getAttributeCategory = (attribute: string): 'green' | 'blue' | 'yellow' | 'red' | 'default' => {
    const greenAttributes = [
      'Abstract', 'Analytic', 'Analytical', 'Astute', 'Big Picture', 'Clever', 'Curious', 'Focussed', 'Focused',
      'Innovative', 'Insightful', 'Logical', 'Investigative', 'Rational', 'Reflective', 
      'Sensible', 'Strategic', 'Thoughtful'
    ].map(a => a.toLowerCase());
    
    const blueAttributes = [
      'Accepting', 'Authentic', 'Calm', 'Caring', 'Collaborative', 'Compassionate', 'Connected',
      'Considerate', 'Creative', 'Diplomatic', 'Emotional', 'Empathetic', 'Empathic', 'Encouraging',
      'Expressive', 'Friendly', 'Generous', 'Gentle', 'Grateful', 'Harmonious', 'Helpful', 
      'Inspiring', 'Intuitive', 'Kind', 'Objective', 'Open', 'Passionate', 'Positive',
      'Receptive', 'Sociable', 'Supportive', 'Vulnerable'
    ].map(a => a.toLowerCase());
    
    const yellowAttributes = [
      'Careful', 'Consistent', 'Controlled', 'Dependable', 'Detail-Oriented', 'Detailed', 'Diligent',
      'Immersed', 'Industrious', 'Methodical', 'Meticulous', 'Orderly', 'Organized', 'Precise', 'Punctual',
      'Reliable', 'Responsible', 'Straightforward', 'Systematic', 'Thorough', 'Tidy', 'Trustworthy'
    ].map(a => a.toLowerCase());
    
    const redAttributes = [
      'Adaptable', 'Adventuresome', 'Adventurous', 'Assertive', 'Bold', 'Brave', 'Capable', 'Challenging',
      'Competitive', 'Confident', 'Courageous', 'Decisive', 'Dynamic', 'Effortless', 'Energetic', 'Engaged',
      'Fearless', 'Funny', 'Open-Minded', 'Optimistic', 'Persistent', 'Persuasive', 'Physical', 'Practical', 
      'Proactive', 'Resilient', 'Resolute', 'Resourceful', 'Spontaneous', 'Strong', 'Vigorous'
    ].map(a => a.toLowerCase());
    
    // Check if attribute is defined before calling toLowerCase()
    const lowerAttribute = attribute ? attribute.toLowerCase() : '';
    
    if (greenAttributes.includes(lowerAttribute)) return 'green';
    if (blueAttributes.includes(lowerAttribute)) return 'blue';
    if (yellowAttributes.includes(lowerAttribute)) return 'yellow';
    if (redAttributes.includes(lowerAttribute)) return 'red';
    
    // Look for partial matches if no exact match found
    if (lowerAttribute) {
      for (const attr of greenAttributes) {
        if (attr.includes(lowerAttribute) || lowerAttribute.includes(attr)) return 'green';
      }
      for (const attr of blueAttributes) {
        if (attr.includes(lowerAttribute) || lowerAttribute.includes(attr)) return 'blue';
      }
      for (const attr of yellowAttributes) {
        if (attr.includes(lowerAttribute) || lowerAttribute.includes(attr)) return 'yellow';
      }
      for (const attr of redAttributes) {
        if (attr.includes(lowerAttribute) || lowerAttribute.includes(attr)) return 'red';
      }
    }
    
    return 'default';
  };
  
  // Get color for attribute based on attribute name
  const getAttributeColor = (attribute: string): string => {
    // Default to primary colors by category
    const attrColorMap: { [key: string]: string } = {
      // Thinking quadrant attributes (green)
      'Analytical': 'rgb(1, 162, 82)',
      'Strategic': 'rgb(1, 162, 82)',
      'Thoughtful': 'rgb(1, 162, 82)',
      'Clever': 'rgb(1, 162, 82)',
      'Innovative': 'rgb(1, 162, 82)',
      'Investigative': 'rgb(1, 162, 82)',
      'Abstract': 'rgb(1, 162, 82)',
      'Analytic': 'rgb(1, 162, 82)',
      'Astute': 'rgb(1, 162, 82)',
      'Big Picture': 'rgb(1, 162, 82)',
      'Curious': 'rgb(1, 162, 82)',
      'Focussed': 'rgb(1, 162, 82)',
      'Insightful': 'rgb(1, 162, 82)',
      'Logical': 'rgb(1, 162, 82)',
      'Rational': 'rgb(1, 162, 82)',
      'Reflective': 'rgb(1, 162, 82)',
      'Sensible': 'rgb(1, 162, 82)',
      
      // Acting quadrant attributes (red)
      'Energetic': 'rgb(241, 64, 64)',
      'Bold': 'rgb(241, 64, 64)',
      'Decisive': 'rgb(241, 64, 64)',
      'Proactive': 'rgb(241, 64, 64)',
      'Persistent': 'rgb(241, 64, 64)',
      'Physical': 'rgb(241, 64, 64)',
      'Confident': 'rgb(241, 64, 64)',
      'Adaptable': 'rgb(241, 64, 64)',
      'Adventurous': 'rgb(241, 64, 64)',
      'Assertive': 'rgb(241, 64, 64)',
      'Brave': 'rgb(241, 64, 64)',
      'Capable': 'rgb(241, 64, 64)',
      'Challenging': 'rgb(241, 64, 64)',
      'Courageous': 'rgb(241, 64, 64)',
      'Dynamic': 'rgb(241, 64, 64)',
      'Fearless': 'rgb(241, 64, 64)',
      'Resolute': 'rgb(241, 64, 64)',
      'Resourceful': 'rgb(241, 64, 64)',
      'Strong': 'rgb(241, 64, 64)',
      
      // Feeling quadrant attributes (blue)
      'Empathetic': 'rgb(22, 126, 253)',
      'Friendly': 'rgb(22, 126, 253)',
      'Supportive': 'rgb(22, 126, 253)',
      'Compassionate': 'rgb(22, 126, 253)',
      'Intuitive': 'rgb(22, 126, 253)',
      'Empathic': 'rgb(22, 126, 253)',
      'Accepting': 'rgb(22, 126, 253)',
      'Authentic': 'rgb(22, 126, 253)',
      'Calm': 'rgb(22, 126, 253)',
      'Caring': 'rgb(22, 126, 253)',
      'Connected': 'rgb(22, 126, 253)',
      'Considerate': 'rgb(22, 126, 253)',
      'Diplomatic': 'rgb(22, 126, 253)',
      'Emotional': 'rgb(22, 126, 253)',
      'Generous': 'rgb(22, 126, 253)',
      'Gentle': 'rgb(22, 126, 253)',
      'Grateful': 'rgb(22, 126, 253)',
      'Harmonious': 'rgb(22, 126, 253)',
      'Helpful': 'rgb(22, 126, 253)',
      'Kind': 'rgb(22, 126, 253)',
      'Open': 'rgb(22, 126, 253)',
      'Sociable': 'rgb(22, 126, 253)',
      'Vulnerable': 'rgb(22, 126, 253)',
      
      // Planning quadrant attributes (yellow)
      'Organized': 'rgb(255, 203, 47)',
      'Meticulous': 'rgb(255, 203, 47)',
      'Reliable': 'rgb(255, 203, 47)',
      'Consistent': 'rgb(255, 203, 47)',
      'Practical': 'rgb(255, 203, 47)',
      'Careful': 'rgb(255, 203, 47)',
      'Controlled': 'rgb(255, 203, 47)',
      'Dependable': 'rgb(255, 203, 47)',
      'Detailed': 'rgb(255, 203, 47)',
      'Diligent': 'rgb(255, 203, 47)',
      'Methodical': 'rgb(255, 203, 47)',
      'Orderly': 'rgb(255, 203, 47)',
      'Precise': 'rgb(255, 203, 47)',
      'Punctual': 'rgb(255, 203, 47)', 
      'Responsible': 'rgb(255, 203, 47)',
      'Thorough': 'rgb(255, 203, 47)',
      'Trustworthy': 'rgb(255, 203, 47)',
    };
    
    // Try exact match first
    if (attrColorMap[attribute]) {
      return attrColorMap[attribute];
    }
    
    // If no direct match, fallback to category mapping
    const category = getAttributeCategory(attribute);
    switch (category) {
      case 'green': return 'rgb(1, 162, 82)';      // Green - Thinking
      case 'blue': return 'rgb(22, 126, 253)';     // Blue - Feeling
      case 'yellow': return 'rgb(255, 203, 47)';   // Yellow - Planning
      case 'red': return 'rgb(241, 64, 64)';       // Red - Acting
      default: return 'rgb(156, 163, 175)';        // Gray default
    }
  };
  
  // Get rank badge color (for selection UI)
  const getRankBadgeColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'bg-purple-600 text-white';   // Purple
      case 2: return 'bg-teal-600 text-white';     // Teal
      case 3: return 'bg-pink-600 text-white';     // Pink
      case 4: return 'bg-amber-700 text-white';    // Dark amber/brown
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  
  // Setup drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSelectedAttributes((items) => {
        const oldIndex = items.findIndex(item => item.text === active.id);
        const newIndex = items.findIndex(item => item.text === over.id);
        
        // Create a new array with items in new order
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Update ranks based on new order (only for items with ranks)
        return reordered.map((item, index) => {
          const rankedItems = reordered.filter(i => i.rank !== null);
          const rankedIndex = rankedItems.findIndex(i => i.text === item.text);
          
          if (item.rank !== null && rankedIndex !== -1) {
            return { ...item, rank: rankedIndex + 1 };
          }
          return item;
        });
      });
    }
  };

  // Get user profile data
  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });

  // Get star card data
  const { data: starCard, isLoading: starCardLoading } = useQuery<StarCardType>({
    queryKey: ['/api/starcard'],
    staleTime: 30000,
  });

  // Get flow attributes data
  const { data: flowAttributesData, isLoading: flowAttributesLoading } = useQuery<FlowAttributes>({
    queryKey: ['/api/flow-attributes'],
    staleTime: 30000,
  });
  
  // Flow attributes save mutation
  const flowAttributesMutation = useMutation({
    mutationFn: async (attributes: { flowScore: number; attributes: Array<{ name: string; score: number }> }) => {
      const response = await apiRequest('POST', '/api/flow-attributes', attributes);
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate flow attributes query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
      // Update star card to complete state
      fetch('/api/starcard/reviewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      // Invalidate star card data
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      
      toast({
        title: "Flow attributes saved!",
        description: "Your flow attributes have been saved and your Star Card is now complete.",
        duration: 5000
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save flow attributes",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Determine if flow assessment is already completed
  const hasCompletedFlowAssessment = flowAttributesData && 
    Array.isArray(flowAttributesData.attributes) && 
    flowAttributesData.attributes.length > 0 &&
    (flowAttributesData.flowScore ?? 0) > 0;
  
  // Check if the card is complete based on data from server
  const isCardComplete = useMemo(() => {
    return !!(flowAttributesData?.attributes && 
      Array.isArray(flowAttributesData.attributes) && 
      flowAttributesData.attributes.length >= 3 &&
      starCard?.state === 'complete');
  }, [flowAttributesData, starCard]);
  
  // State for flow attributes added to StarCard
  const [starCardFlowAttributes, setStarCardFlowAttributes] = useState<Array<{text: string; color: string}>>([]);
  
  // Check if a tab should be disabled
  const isTabDisabled = (tabId: string): boolean => {
    // The first tab is always accessible
    if (tabId === "intro") return false;
    
    // The second tab (assessment) is always accessible
    if (tabId === "assessment") return false;
    
    // For sequential progression
    const tabSequence = ["intro", "assessment", "roundingout", "starcard"];
    const currentIndex = tabSequence.indexOf(activeTab);
    const targetIndex = tabSequence.indexOf(tabId);
    
    // If flow assessment is completed, allow access to all tabs
    if (hasCompletedFlowAssessment) {
      return false;
    }
    
    // Otherwise, can only access tabs that are:
    // 1. The current tab
    // 2. Already completed tabs
    // 3. The next tab in sequence
    return !completedTabs.includes(tabId) && tabId !== activeTab && targetIndex > currentIndex + 1;
  };
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (!isTabDisabled(tabId)) {
      setActiveTab(tabId);
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs(prev => [...prev, activeTab]);
      }
    }
  };
  
  // Auto-complete function for demo mode
  const autoCompleteFlowAttributes = () => {
    // Clear any existing selections
    setSelectedAttributes([]);
    
    // Get random attributes from each category (one from each category)
    const categories = ['green', 'blue', 'yellow', 'red'];
    const selectedAttrs: RankedAttribute[] = [];
    
    categories.forEach((category, index) => {
      // Find attributes for this category
      const matchingAttrs = flowAttributes.filter(attr => 
        getAttributeCategory(attr) === category
      );
      
      // Select a random attribute from this category
      if (matchingAttrs.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingAttrs.length);
        const randomAttr = matchingAttrs[randomIndex];
        selectedAttrs.push({
          text: randomAttr, 
          rank: index + 1
        });
      }
    });
    
    // Set the selected attributes
    setSelectedAttributes(selectedAttrs);
    
    // Update the flow attributes in the StarCard
    const coloredAttributes = selectedAttrs.map(attr => ({
      text: attr.text,
      color: getAttributeColor(attr.text)
    }));
    
    setStarCardFlowAttributes(coloredAttributes);
    
    // Convert to server format and save to server
    const serverAttributes = selectedAttrs.map((attr, index) => ({
      name: attr.text,
      score: 100 - (index * 5) // Score from 100 to 85 in decrements of 5
    }));
    
    // Random flow score between 70 and 95
    const randomFlowScore = Math.floor(Math.random() * 26) + 70;
    
    // Save flow attributes to server
    flowAttributesMutation.mutate({
      flowScore: randomFlowScore,
      attributes: serverAttributes
    });
  };

  // Show loading state
  if (userLoading) {
    return (
      <MainContainer showStepNavigation={false} className="bg-white">
        <div className="text-center">
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </MainContainer>
    );
  }
  
  return (
    <MainContainer showStepNavigation={false} className="bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-700">Finding Your Flow State</h1>
        <p className="text-gray-600">Learn about the flow and discover how to optimize your work experience</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="intro" data-value="intro">Flow Intro</TabsTrigger>
            <TabsTrigger value="assessment" data-value="assessment" disabled={isTabDisabled("assessment")}>
              {isTabDisabled("assessment") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Flow Assessment
                </span>
              ) : "Flow Assessment"}
            </TabsTrigger>
            <TabsTrigger value="roundingout" data-value="roundingout" disabled={isTabDisabled("roundingout")}>
              {isTabDisabled("roundingout") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Rounding Out
                </span>
              ) : "Rounding Out"}
            </TabsTrigger>
            <TabsTrigger value="starcard" data-value="starcard" disabled={isTabDisabled("starcard")}>
              {isTabDisabled("starcard") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Add Flow to StarCard
                </span>
              ) : "Add Flow to StarCard"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="intro" className="space-y-6">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe 
                src="https://www.youtube.com/embed/JxdhWd8agmE" 
                title="Introduction to Flow State" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-80 rounded border border-gray-200"
              ></iframe>
            </div>
            
            <div className="prose max-w-none">
              <h2>Understanding Flow State</h2>
              <p>
                Flow is a state of complete immersion in an activity, characterized by energized focus, full involvement, 
                and enjoyment in the process. It's often described as being "in the zone" - when time seems to disappear 
                and you're completely absorbed in what you're doing.
              </p>
              
              <div className="grid grid-cols-2 gap-6 my-8">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-indigo-700 font-medium mb-2">Clear Goals</h3>
                  <p className="text-sm">You know exactly what you need to accomplish and can measure your progress.</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="text-purple-700 font-medium mb-2">Balance of Challenge & Skill</h3>
                  <p className="text-sm">The task is challenging enough to engage you but not so difficult that it causes anxiety.</p>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                  <h3 className="text-teal-700 font-medium mb-2">Immediate Feedback</h3>
                  <p className="text-sm">You can quickly tell how well you're doing, allowing for adjustment in real-time.</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h3 className="text-amber-700 font-medium mb-2">Deep Concentration</h3>
                  <p className="text-sm">Your attention is completely focused on the task at hand, with no distractions.</p>
                </div>
              </div>
              
              <h3>Benefits of Flow State</h3>
              <p>
                Regularly experiencing flow is associated with:
              </p>
              <ul>
                <li>Higher productivity and performance</li>
                <li>Increased creativity and innovation</li>
                <li>Greater work satisfaction and well-being</li>
                <li>Reduced stress and burnout</li>
                <li>More meaningful and engaging experiences</li>
              </ul>
              
              <p>
                In the upcoming assessment, you'll answer questions to determine your flow profile - how often you experience flow, 
                what triggers it for you, and how to create more flow experiences in your work.
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleTabChange("assessment")}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Flow Assessment
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="assessment" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Your Flow State Self-Assessment</h2>
              <p className="text-gray-700">
                <span className="font-medium">Purpose:</span> This exercise is designed to help you easily understand what "flow" is and recognize when you are in it, personally and professionally.
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-medium">Instructions:</span> Rate your agreement with each of the following statements on a scale from 1 (Never) to 5 (Always). Answer with a specific activity or task in mind where you most often seek or experience flow.
              </p>
            </div>
            
            <FlowAssessment 
              isCompleted={hasCompletedFlowAssessment}
              onTabChange={handleTabChange}
            />
            
            {/* Next: Rounding Out button removed as requested */}
          </TabsContent>
          
          <TabsContent value="roundingout" className="space-y-6">
            <div className="prose max-w-none">
              <h2>Rounding Out Your Flow Understanding</h2>
              <p>
                Now that you've completed the flow assessment, take some time to round out your understanding of flow
                and how you can create more opportunities for flow in your work and life.
              </p>
              
              <h3 className="mt-6">Flow Reflection Questions</h3>
              <p>Reflect on your personal experiences with flow to better understand how to create optimal conditions in your work and life.</p>
            </div>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">What activities or tasks consistently put you in a flow state?</label>
                <Textarea 
                  placeholder="Your answer" 
                  className="min-h-[80px] border border-gray-300 w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">What are the biggest barriers to experiencing flow in your work?</label>
                <Textarea 
                  placeholder="Your answer" 
                  className="min-h-[80px] border border-gray-300 w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">What conditions help you get into flow more easily?</label>
                <Textarea 
                  placeholder="Your answer" 
                  className="min-h-[80px] border border-gray-300 w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">What one change could you make to experience more flow in your work?</label>
                <Textarea 
                  placeholder="Your answer" 
                  className="min-h-[80px] border border-gray-300 w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="uppercase font-bold text-lg mb-2 text-blue-700">Flow State Resources</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Download our guide to creating more flow experiences in your daily work:
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                  Flow State Guide PDF
                </a>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => handleTabChange("assessment")}
                variant="outline"
              >
                Go Back
              </Button>
              <Button 
                onClick={() => handleTabChange("starcard")}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Add Flow to StarCard
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="starcard" className="space-y-6">
            <div className="prose max-w-none mb-6">
              <h2>Add Flow to Your StarCard</h2>
              <p>
                Now that you've completed the flow assessment and reflection, select four flow attributes 
                that best describe your optimal flow state. These will be added to your StarCard to create 
                a comprehensive visualization of your strengths and flow profile.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Your StarCard</h3>
                {user && starCard && (
                  <div className="pb-10 flex justify-center">
                    <div className="flex flex-col items-center">
                      <StarCard 
                        profile={{
                          name: user.name || '',
                          title: user.title || '',
                          organization: user.organization || ''
                        }}
                        quadrantData={{
                          thinking: starCard.thinking || 0,
                          acting: starCard.acting || 0,
                          feeling: starCard.feeling || 0,
                          planning: starCard.planning || 0,
                          state: starCard.state || 'empty'
                        }}
                        flowAttributes={
                          // First check if there are local attributes (being edited)
                          starCardFlowAttributes.length > 0 ? starCardFlowAttributes :
                          // Otherwise, check if there are server attributes
                          (flowAttributesData?.attributes && Array.isArray(flowAttributesData.attributes) && flowAttributesData.attributes.length > 0) ? 
                            // Map server data to expected format
                            flowAttributesData.attributes.map((attr: { name: string }) => {
                              // Make sure attr and attr.name exist
                              if (!attr || !attr.name) {
                                return { text: "", color: "rgb(156, 163, 175)" }; // Default gray
                              }
                              return {
                                text: attr.name,
                                color: getAttributeColor(attr.name)
                              };
                            }) : 
                            // Default to empty array
                            []
                        }
                        downloadable={false}
                        preview={true}
                      />
                      
                      {/* Removed Clear Flow Attributes button as requested */}
                    </div>
                  </div>
                )}
                {(userLoading || starCardLoading) && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
                    <p>Loading your StarCard data...</p>
                  </div>
                )}
                {user && !starCard && !(userLoading || starCardLoading) && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
                    <p className="text-amber-700 font-medium">StarCard not available</p>
                    <p className="text-sm text-gray-600 mt-2">
                      You need to complete the strengths assessment first.
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Your Flow Attributes</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-600">
                        Choose 4 words that best describe your flow state. Drag badges to reorder.
                      </p>
                      
                      {/* Auto-complete button (visible only in demo mode) */}
                      {isDemoMode && (
                        <Button 
                          onClick={autoCompleteFlowAttributes}
                          variant="outline"
                          size="sm"
                          className="text-xs border-indigo-300 text-indigo-600 hover:text-indigo-700"
                        >
                          Auto-Complete
                        </Button>
                      )}
                    </div>
                    
                    {/* Selected attributes with drag and drop */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">I find myself in flow when I am being:</h4>
                        {selectedAttributes.filter(attr => attr.rank !== null).length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 text-xs text-gray-500 hover:text-red-600"
                            onClick={() => setSelectedAttributes([])}
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      {selectedAttributes.filter(attr => attr.rank !== null).length > 0 ? (
                        <DndContext 
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={selectedAttributes.filter(attr => attr.rank !== null).map(attr => attr.text)}
                            strategy={horizontalListSortingStrategy}
                          >
                            <div className="flex flex-wrap gap-2">
                              {selectedAttributes
                                .filter(attr => attr.rank !== null)
                                .sort((a, b) => (a.rank || 0) - (b.rank || 0))
                                .map(attr => (
                                  <SortableAttribute
                                    key={attr.text}
                                    id={attr.text}
                                    text={attr.text}
                                    rank={attr.rank || 0}
                                    onRemove={() => handleRemoveAttribute(attr.text)}
                                    rankBadgeColor={getRankBadgeColor(attr.rank || 0)}
                                  />
                                ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Select a word below to add it to your flow attributes</p>
                      )}
                    </div>
                    
                    {/* Available attributes */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">Flow Attributes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {getFilteredAttributes().map((attr: string) => {
                          const isSelected = selectedAttributes.some(selected => selected.text === attr);
                          const rank = selectedAttributes.find(selected => selected.text === attr)?.rank;
                          
                          return (
                            <Badge 
                              key={attr}
                              variant="outline"
                              className={`${isSelected ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'} cursor-pointer transition-colors`}
                              onClick={() => handleAttributeSelect(attr)}
                            >
                              {attr}
                              {rank !== null && rank !== undefined && (
                                <span className={`ml-1 inline-flex items-center justify-center rounded-full h-5 w-5 text-xs ${getRankBadgeColor(rank)}`}>
                                  {rank}
                                </span>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    className="w-full bg-indigo-700 hover:bg-indigo-800"
                    disabled={selectedAttributes.filter(attr => attr.rank !== null).length < 4 || isCardComplete}
                    onClick={() => {
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
                        
                        // Update the StarCard flow attributes
                        setStarCardFlowAttributes(coloredAttributes);
                        
                        // Convert to server format and save to server
                        const serverAttributes = rankedAttributes.map((attr, index) => ({
                          name: attr.text,
                          score: 100 - (index * 5) // Score from 100 to 85 in decrements of 5
                        }));
                        
                        // Random flow score between 70 and 95
                        const randomFlowScore = Math.floor(Math.random() * 26) + 70;
                        
                        // Save flow attributes to server
                        flowAttributesMutation.mutate({
                          flowScore: randomFlowScore,
                          attributes: serverAttributes
                        });
                      }
                    }}
                  >
                    Add Flow Attributes to StarCard
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => handleTabChange("roundingout")}
                variant="outline"
              >
                Go Back
              </Button>
              <Link href="/user-home">
                <Button className="bg-indigo-700 hover:bg-indigo-800">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainContainer>
  );
}