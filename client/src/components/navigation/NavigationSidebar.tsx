import { Video, BookOpen, Zap, Glasses, PenLine, Download, ChevronRight, CheckCircle, Circle, Clock, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { CollapsibleSection } from './CollapsibleSection';

export function NavigationSidebar() {
  const { progress, getSectionProgressData } = useNavigationProgress();

  // Define sections that match the Navigation component structure - hardcoded original
  const navigationSections = [
    { 
      id: '1', 
      title: 'All star teams Introduction', 
      path: '/intro',
      totalSteps: 1,
      completedSteps: 0,
      icon: 'Video',
      iconColor: 'text-blue-600',
      steps: [
        { id: '1-1', label: 'Introduction', path: '/intro/video', type: 'Learning', icon: 'Video', iconColor: 'text-blue-600' },
      ]
    },
    { 
      id: '2', 
      title: 'DISCOVER YOUR STAR STRENGTHS', 
      path: '/discover-strengths',
      totalSteps: 4,
      completedSteps: 0,
      icon: 'BookOpen',
      iconColor: 'text-purple-600',
      steps: [
        { id: '2-1', label: 'Intro to Star Strengths', path: '/discover-strengths/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
        { id: '2-2', label: 'Star Strengths Self-Assessment', path: '/assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
        { id: '2-3', label: 'Review Your Star Card', path: '/discover-strengths/review', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
        { id: '2-4', label: 'Strength Reflection', path: '/star-strengths-reflection', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
      ]
    },
    { 
      id: '3', 
      title: 'IDENTIFY YOUR FLOW', 
      path: '/identify-flow',
      totalSteps: 4,
      completedSteps: 0,
      icon: 'Glasses',
      iconColor: 'text-teal-600',
      steps: [
        { id: '3-1', label: 'Intro to Flow', path: '/identify-flow/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
        { id: '3-2', label: 'Flow Assessment', path: '/find-your-flow', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
        { id: '3-3', label: 'Rounding Out', path: '/identify-flow/rounding-out', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
        { id: '3-4', label: 'Add Flow to Star Card', path: '/flow-to-star-card', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
      ]
    },
    { 
      id: '4', 
      title: 'VISUALIZE YOUR POTENTIAL', 
      path: '/visualize-potential',
      totalSteps: 5,
      completedSteps: 0,
      icon: 'Zap',
      iconColor: 'text-indigo-600',
      steps: [
        { id: '4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
        { id: '4-2', label: 'Well-being Reflections', path: '/cantril-ladder', type: 'Activity and Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
        { id: '4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
        { id: '4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
        { id: '4-5', label: 'Final Reflection', path: '/your-statement', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
      ]
    },
    {
      id: '5',
      title: 'NEXT STEPS',
      path: '/next-steps',
      totalSteps: 4,
      completedSteps: 0,
      icon: 'Download',
      iconColor: 'text-green-700',
      steps: [
        { id: '5-1', label: 'Download your Star Card', path: '/download-starcard', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
        { id: '5-2', label: 'Your Holistic Report', path: '/holistic-report', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
        { id: '5-3', label: 'Growth Plan', path: '/growth-plan', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
        { id: '5-4', label: 'Team Workshop Prep', path: '/team-workshop-prep', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
      ]
    },
    {
      id: '6',
      title: 'WORKSHOP RESOURCES',
      path: '/more-info',
      totalSteps: 1,
      completedSteps: 0,
      icon: 'BookOpen',
      iconColor: 'text-slate-600',
      steps: [
        { id: '6-1', label: 'Workshop Resources', path: '/workshop-resources', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
      ]
    }
  ];
        { 
          id: '1', 
          title: 'Intro to Star Strengths', 
          path: '/intro',
          totalSteps: 1,
          completedSteps: 0,
          icon: 'Video',
          iconColor: 'text-blue-600',
          steps: [
            { id: '1-1', label: 'Introduction', path: '/intro/video', type: 'Learning', icon: 'Video', iconColor: 'text-blue-600' },
          ]
        },
        {
          id: 'week1-header',
          title: 'WEEK 1:',
          path: '',
          totalSteps: 0,
          completedSteps: 0,
          icon: '',
          iconColor: '',
          isHeader: true,
          steps: []
        },
        { 
          id: '2', 
          title: 'DISCOVER YOUR STAR STRENGTHS', 
          path: '/discover-strengths',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-purple-600',
          steps: [
            { id: '2-1', label: 'Intro to Star Strengths', path: '/discover-strengths/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
            { id: '2-2', label: 'Star Strengths Self-Assessment', path: '/assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
            { id: '2-3', label: 'Review Your Star Card', path: '/starcard-preview', type: 'Learning', icon: 'BookOpen', iconColor: 'text-pink-600' },
            { id: '2-4', label: 'Strength Reflection', path: '/discover-strengths/reflect', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        {
          id: 'week2-header',
          title: 'WEEK 2:',
          path: '',
          totalSteps: 0,
          completedSteps: 0,
          icon: '',
          iconColor: '',
          isHeader: true,
          steps: []
        },
        { 
          id: '3', 
          title: 'IDENTIFY YOUR FLOW', 
          path: '/find-your-flow',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-green-600',
          steps: [
            { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
            { id: '3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
            { id: '3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '3-4', label: 'Add Flow to Star Card', path: '/add-flow-starcard', type: 'Activity', icon: 'Zap', iconColor: 'text-yellow-600' },
          ]
        },
        {
          id: 'week3-header',
          title: 'WEEK 3:',
          path: '',
          totalSteps: 0,
          completedSteps: 0,
          icon: '',
          iconColor: '',
          isHeader: true,
          steps: []
        },
        { 
          id: '4a', 
          title: 'VISUALIZE YOUR POTENTIAL Part 1', 
          path: '/visualize-potential',
          totalSteps: 2,
          completedSteps: 0,
          icon: 'Zap',
          iconColor: 'text-indigo-600',
          steps: [
            { id: '4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-2', label: 'Well-being Reflections', path: '/cantril-ladder', type: 'Activity and Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        {
          id: 'week4-header',
          title: 'WEEK 4:',
          path: '',
          totalSteps: 0,
          completedSteps: 0,
          icon: '',
          iconColor: '',
          isHeader: true,
          steps: []
        },
        { 
          id: '4b', 
          title: 'VISUALIZE YOUR POTENTIAL Part 2', 
          path: '/visualize-potential-2',
          totalSteps: 3,
          completedSteps: 0,
          icon: 'Zap',
          iconColor: 'text-indigo-600',
          steps: [
            { id: '4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-5', label: 'Final Reflection', path: '/your-statement', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        {
          id: 'week5-header',
          title: 'WEEK 5:',
          path: '',
          totalSteps: 0,
          completedSteps: 0,
          icon: '',
          iconColor: '',
          isHeader: true,
          steps: []
        },
        {
          id: '5',
          title: 'NEXT STEPS',
          path: '/next-steps',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'Download',
          iconColor: 'text-green-700',
          steps: [
            { id: '5-1', label: 'Download your Star Card', path: '/download-starcard', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-2', label: 'Your Holistic Report', path: '/holistic-report', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-3', label: 'Growth Plan', path: '/growth-plan', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-4', label: 'Team Workshop Prep', path: '/team-workshop-prep', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        }
      ];
    } else {
      // Original structure for other user types
      return [
        { 
          id: '1', 
          title: 'All star teams Introduction', 
          path: '/intro',
          totalSteps: 1,
          completedSteps: 0,
          icon: 'Video',
          iconColor: 'text-blue-600',
          steps: [
            { id: '1-1', label: 'Introduction', path: '/intro/video', type: 'Learning', icon: 'Video', iconColor: 'text-blue-600' },
          ]
        },
        { 
          id: '2', 
          title: 'Discover your Strengths', 
          path: '/discover-strengths',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-purple-600',
          steps: [
            { id: '2-1', label: 'Intro to Star Strengths', path: '/discover-strengths/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
            { id: '2-2', label: 'Star Strengths Self-Assessment', path: '/assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
            { id: '2-3', label: 'Review Your Star Card', path: '/starcard-preview', type: 'Learning', icon: 'BookOpen', iconColor: 'text-pink-600' },
            { id: '2-4', label: 'Strength Reflection', path: '/discover-strengths/reflect', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        { 
          id: '3', 
          title: 'Find your Flow', 
          path: '/find-your-flow',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-green-600',
          steps: [
            { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
            { id: '3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
            { id: '3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '3-4', label: 'Add Flow to Star Card', path: '/add-flow-starcard', type: 'Activity', icon: 'Zap', iconColor: 'text-yellow-600' },
          ]
        },
        { 
          id: '4', 
          title: 'Visualize your Potential', 
          path: '/visualize-potential',
          totalSteps: 5,
          completedSteps: 0,
          icon: 'Zap',
          iconColor: 'text-indigo-600',
          steps: [
            { id: '4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-2', label: 'Well-being Reflections', path: '/cantril-ladder', type: 'Activity and Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-5', label: 'Final Reflection', path: '/your-statement', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        {
          id: '5',
          title: 'Next Steps',
          path: '/next-steps',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'Download',
          iconColor: 'text-green-700',
          steps: [
            { id: '5-1', label: 'Download your Star Card', path: '/download-starcard', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-2', label: 'Your Holistic Report', path: '/holistic-report', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-3', label: 'Growth Plan', path: '/growth-plan', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-4', label: 'Team Workshop Prep', path: '/team-workshop-prep', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        }
      ];
    }
  };

  const navigationSections = getNavigationSections();

  // Get section icon based on section ID
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'foundations':
        return BookOpen;
      case 'core-strengths':
      case 'assessment':
        return Zap;
      case 'flow-assessment':
      case 'agility':
        return Glasses;
      case 'rounding-out':
      case 'integration':
        return PenLine;
      case 'completion':
        return CheckCircle;
      default:
        return BookOpen;
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Video': return Video;
      case 'BookOpen': return BookOpen;
      case 'Zap': return Zap;
      case 'Glasses': return Glasses;
      case 'PenLine': return PenLine;
      case 'Download': return Download;
      case 'Clock': return Clock;
      case 'Activity': return Activity;
      default: return BookOpen;
    }
  };

  // Create sections with real-time progress data, filtering out header sections
  const sectionsWithProgress = navigationSections
    .filter(section => !section.isHeader)
    .map(section => {
      // Get section progress based on completed steps
      const sectionStepIds = section.steps.map((step: any) => step.id);
      const progressData = getSectionProgressData(sectionStepIds);

      // Check if section is unlocked - simplified logic for now
      const isUnlocked = true;

      // Convert steps to match NavigationStep interface
      const convertedSteps = section.steps.map((step: any) => ({
        id: step.id,
        title: step.label || step.title,
        type: step.type,
        path: step.path,
        label: step.label,
        estimatedTime: step.estimatedTime,
        required: step.required
      }));

      return {
        ...section,
        steps: convertedSteps,
        totalSteps: progressData.total,
        completedSteps: progressData.completed,
        locked: !isUnlocked,
        progressDisplay: `${progressData.completed}/${progressData.total}`,
        isComplete: progressData.completed === progressData.total
      };
    });

  // Render sections with week headers
  const renderSectionsWithHeaders = () => {
    const allSections = navigationSections;
    const items: JSX.Element[] = [];

    allSections.forEach((section, index) => {
      if (section.isHeader) {
        // Render week header
        items.push(
          <div key={section.id} className="pt-4 pb-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              {section.title}
            </h3>
          </div>
        );
      } else {
        // Find section in sectionsWithProgress
        const sectionWithProgress = sectionsWithProgress.find(s => s.id === section.id);
        if (sectionWithProgress) {
          items.push(
            <CollapsibleSection 
              key={section.id} 
              section={sectionWithProgress}
              icon={getSectionIcon(section.id)}
            />
          );
        }
      }
    });

    return items;
  };

  // Force week-based navigation for students temporarily for debugging
  const forceWeekNavigation = userRole === 'student' || userRole === 'facilitator';
  
  console.log('🔍 FINAL RENDER CHECK:', {
    userRole,
    forceWeekNavigation,
    sectionsWithProgressLength: sectionsWithProgress.length,
    renderingWeekBased: forceWeekNavigation
  });

  return (
    <div className="space-y-2">
      {forceWeekNavigation ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide px-2 py-1">
            WEEK 1: Foundation
          </div>
          {sectionsWithProgress.slice(0, 2).map((section) => (
            <CollapsibleSection 
              key={section.id} 
              section={section}
              icon={getSectionIcon(section.id)}
            />
          ))}
          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide px-2 py-1 mt-4">
            WEEK 2: Assessment
          </div>
          {sectionsWithProgress.slice(2, 4).map((section) => (
            <CollapsibleSection 
              key={section.id} 
              section={section}
              icon={getSectionIcon(section.id)}
            />
          ))}
        </div>
      ) : (
        sectionsWithProgress.map((section) => (
          <CollapsibleSection 
            key={section.id} 
            section={section}
            icon={getSectionIcon(section.id)}
          />
        ))
      )}
    </div>
  );
}