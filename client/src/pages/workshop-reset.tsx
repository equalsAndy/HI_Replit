import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ResetDataButton } from '@/components/profile/ResetDataButton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Helper function to safely parse JSON
const safeParseJSON = (json: string | null) => {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error("JSON parse error:", e);
    return null;
  }
};

export default function WorkshopReset() {
  const [location, navigate] = useLocation();
  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [serverData, setServerData] = useState<Record<string, any>>({});
  const [isResetting, setIsResetting] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Storage keys to check and clear - comprehensive list for all workshop data
  const storageKeys = [
    'allstarteams-navigation-progress',
    'imaginal-agility-navigation-progress',
    'allstar_navigation_progress',
    'allstarteams_starCard',
    'allstarteams_flowAttributes',
    'allstarteams_progress',
    'allstarteams_completedActivities',
    'allstarteams_strengths',
    'allstarteams_values',
    'allstarteams_passions',
    'allstarteams_growthAreas',
    'user-preferences',
    'workshop-progress',
    'assessment-data'
  ];

  // Get user profile data
  const { data: userData } = useQuery<any>({
    queryKey: ['/api/user/profile'],
  });

  // Load local storage and server data on component mount
  useEffect(() => {
    refreshStorageData();
    refreshServerData();
  }, []);

  // Refresh the local storage data
  const refreshStorageData = () => {
    const data: Record<string, any> = {};
    
    storageKeys.forEach(key => {
      const rawData = localStorage.getItem(key);
      data[key] = safeParseJSON(rawData);
    });
    
    setStorageData(data);
  };

  // Refresh server data
  const refreshServerData = async () => {
    const data: Record<string, any> = {};
    
    try {
      // Fetch star card data
      const starCardResponse = await fetch('/api/starcard', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (starCardResponse.ok) {
        data.starCard = await starCardResponse.json();
      }
    } catch (e) {
      data.starCard = { error: 'Failed to fetch' };
    }

    try {
      // Fetch flow attributes
      const flowResponse = await fetch('/api/flow-attributes', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (flowResponse.ok) {
        data.flowAttributes = await flowResponse.json();
      }
    } catch (e) {
      data.flowAttributes = { error: 'Failed to fetch' };
    }

    try {
      // Fetch user profile
      const profileResponse = await fetch('/api/user/profile', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (profileResponse.ok) {
        data.userProfile = await profileResponse.json();
      }
    } catch (e) {
      data.userProfile = { error: 'Failed to fetch' };
    }

    setServerData(data);
  };

  // Clear all local storage data
  const clearLocalStorageData = () => {
    storageKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    refreshStorageData();
    
    toast({
      title: 'Browser Data Cleared',
      description: 'All workshop data has been removed from your browser',
    });
  };

  // Handle reset complete callback
  const handleResetComplete = () => {
    // Refresh both local storage and server data
    refreshStorageData();
    refreshServerData();
    
    // Show success message
    toast({
      title: 'Reset Complete',
      description: 'Your workshop data has been completely reset',
    });
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/allstarteams')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workshop
        </Button>
        <h1 className="text-3xl font-bold">Workshop Data Reset</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Browser Storage Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded mb-4 overflow-auto max-h-[300px]">
              <pre className="text-xs">{JSON.stringify(storageData, null, 2)}</pre>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshStorageData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <AlertDialog open={isAlerting} onOpenChange={setIsAlerting}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Browser Data Only
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Browser Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will only clear the workshop data stored in your browser. 
                      Your server data will remain unchanged.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        clearLocalStorageData();
                        setIsAlerting(false);
                      }}
                    >
                      Yes, Clear Browser Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Server Database Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded mb-4 overflow-auto max-h-[300px]">
              <pre className="text-xs">{JSON.stringify(serverData, null, 2)}</pre>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshServerData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Server Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reset Workshop Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="border p-4 rounded-md bg-red-50">
              <h3 className="font-medium mb-2">⚠️ Complete Data Reset</h3>
              <p className="text-sm mb-3">
                This action will reset ALL your workshop data. It will:
              </p>
              <ul className="list-disc pl-6 text-sm mb-3">
                <li>Delete your star card values (thinking, acting, feeling, planning)</li>
                <li>Remove all flow attributes data</li>
                <li>Clear your workshop progress tracking</li>
                <li>Remove all browser-stored workshop data</li>
              </ul>
              <p className="text-sm font-medium">This action cannot be undone.</p>
              
              {userData && (
                <div className="mt-4">
                  <ResetDataButton 
                    userId={userData.id}
                    onResetComplete={handleResetComplete}
                  />
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm">
                If you're experiencing issues with the workshop, resetting your data may help. 
                If problems persist after reset, please contact support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}