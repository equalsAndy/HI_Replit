import { Book, Star, PieChart, Target, CheckCircle } from 'lucide-react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { CollapsibleSection } from './CollapsibleSection';
import { navigationSections } from './navigationData';

export function NavigationSidebar() {
  const { progress, getSectionProgressData, SECTION_STEPS } = useNavigationProgress();
  
  // Get section icon based on section ID
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'foundations':
        return Book;
      case 'core-strengths':
      case 'assessment':
        return Star;
      case 'flow-assessment':
      case 'agility':
        return PieChart;
      case 'rounding-out':
      case 'integration':
        return Target;
      case 'completion':
        return CheckCircle;
      default:
        return Book;
    }
  };
  
  // Create sections with real-time progress data
  const sectionsWithProgress = navigationSections.map(section => {
    // Get section progress based on completed steps
    const sectionStepIds = section.steps.map(step => step.id);
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