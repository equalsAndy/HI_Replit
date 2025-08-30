import { Video, BookOpen, Zap, Glasses, PenLine, Download, ChevronRight, CheckCircle, Circle, Clock, Activity } from 'lucide-react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { CollapsibleSection } from './CollapsibleSection';
import { navigationSections, imaginalAgilityNavigationSections } from './navigationData';

interface NavigationSidebarProps {
  appType?: 'ast' | 'ia';
  customSections?: any[];
}

export function NavigationSidebar({ appType = 'ast', customSections }: NavigationSidebarProps = {}) {
  const { progress, getSectionProgressData } = useNavigationProgress(appType);
  
  // Use custom sections if provided, otherwise use the default sections based on app type
  const sections = customSections || (appType === 'ia' ? imaginalAgilityNavigationSections : navigationSections);

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

  // Use dynamic sections from navigation progress hook instead of static import
  // Create sections with real-time progress data
  const sectionsWithProgress = sections.map(section => {
    // Get section progress based on completed steps
    const sectionStepIds = section.steps.map((step: any) => step.id);
    const progressData = getSectionProgressData(sectionStepIds);

    // Check if section is unlocked
    const isUnlocked = progress.unlockedSections.includes(section.id);

    return {
      ...section,
      totalSteps: progressData.total,
      completedSteps: progressData.completed,
      locked: !isUnlocked,
      progressDisplay: progressData.display,
      isComplete: progressData.isComplete
    };
  });

  return (
    <div className="space-y-4">
      {sectionsWithProgress.map((section) => (
        <CollapsibleSection 
          key={section.id} 
          section={section}
          icon={getSectionIcon(section.id)}
        />
      ))}
    </div>
  );
}