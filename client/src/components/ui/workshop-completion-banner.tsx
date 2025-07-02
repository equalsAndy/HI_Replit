import { CheckCircle, Lock } from 'lucide-react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';

export function WorkshopCompletionBanner() {
  const { isWorkshopLocked, completedAt } = useWorkshopStatus();
  const isLocked = isWorkshopLocked();
  
  if (!isLocked) return null;

  const workshopName = 'AllStarTeams';

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="font-medium text-green-800">
            {workshopName} Workshop Completed
          </h3>
          <p className="text-sm text-green-600 mt-1">
            Completed on {completedAt ? new Date(completedAt).toLocaleDateString() : 'recently'}. 
            Your responses are now locked, but you can still view all content and download reports.
          </p>
        </div>
        <Lock className="text-green-600 flex-shrink-0" size={16} />
      </div>
    </div>
  );
}