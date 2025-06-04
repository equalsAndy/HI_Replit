import React, { useEffect } from 'react';
import { getAllPendingBackups, getEndpointForAssessmentType } from '../utils/localStorage.js';

interface AutoSyncProps {
  userId: number;
}

const AutoSync: React.FC<AutoSyncProps> = ({ userId }) => {
  useEffect(() => {
    const syncPendingBackups = async () => {
      const pendingBackups = getAllPendingBackups(userId);
      
      if (pendingBackups.length > 0) {
        console.log(`Syncing ${pendingBackups.length} pending backups...`);
      }
      
      for (const backup of pendingBackups) {
        try {
          const endpoint = getEndpointForAssessmentType(backup.assessmentType);
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(backup.data)
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              // Clear successful backup
              localStorage.removeItem(backup.key);
              console.log(`✅ Synced ${backup.assessmentType} from local storage`);
            }
          }
        } catch (error) {
          console.log(`⏳ Failed to sync ${backup.assessmentType}, will retry later`);
        }
      }
    };
    
    // Sync on component mount and every 60 seconds
    syncPendingBackups();
    const interval = setInterval(syncPendingBackups, 60000);
    
    return () => clearInterval(interval);
  }, [userId]);
  
  return null; // This component has no UI
};

export default AutoSync;