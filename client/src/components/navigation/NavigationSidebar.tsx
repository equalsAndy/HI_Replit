import { Book, Star, PieChart, Target, CheckCircle } from 'lucide-react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { CollapsibleSection } from './CollapsibleSection';

export function NavigationSidebar() {
  const { progress } = useNavigationProgress();
  
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
  
  if (!progress || !progress.sections || progress.sections.length === 0) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-md">
        <p className="text-gray-600 text-sm">Loading navigation...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {progress.sections.map((section) => (
        <CollapsibleSection 
          key={section.id} 
          section={section} 
          icon={getSectionIcon(section.id)} 
        />
      ))}
    </div>
  );
}