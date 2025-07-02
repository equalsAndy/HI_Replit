import { CheckCircle, Lock } from 'lucide-react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useApplication } from '@/hooks/use-application';

export function WorkshopCompletionBanner() {
  const { isWorkshopLocked, astCompletedAt, iaCompletedAt } = useWorkshopStatus();
  const { currentApp } = useApplication();
  
  // Map currentApp to the format expected by the hook
  const appType: 'ast' | 'ia' = currentApp === 'allstarteams' ? 'ast' : 'ia';
  const isLocked = isWorkshopLocked(appType);
  
  if (!isLocked) return null;

  const completedDate = appType === 'ast' ? astCompletedAt : iaCompletedAt;
  const workshopName = currentApp === 'allstarteams' ? 'AllStarTeams' : 'Imaginal Agility';

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-medium text-green-800">
            {workshopName} Workshop Completed
          </h3>
          <p className="text-sm text-green-600 mt-1">
            Completed on {completedDate ? new Date(completedDate).toLocaleDateString() : 'recently'}. 
            Your responses are now locked, but you can still view all content and download reports.
          </p>
        </div>
        <Lock className="text-green-600 flex-shrink-0" size={16} />
      </div>
    </div>
  );
}