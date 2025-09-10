import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Save, Trash } from 'lucide-react';
import TestUserBanner from '@/components/auth/TestUserBanner';
import { ResetUserDataButton } from '@/components/admin/ResetUserDataButton';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

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

export default function WorkshopResetTestContent() {
  const [location, navigate] = useLocation();
  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [serverData, setServerData] = useState<Record<string, any>>({});
  const [resetResult, setResetResult] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  // Storage keys to check and clear - comprehensive list for all workshop data
  const storageKeys = [
    // AllStarTeams Workshop specific storage items
    'allstarteams-navigation-progress',
    'allstar_navigation_progress',
    'allstarteams_starCard',
    'allstarteams_flowAttributes',
    'allstarteams_progress',
    'allstarteams_completedActivities',
    'allstarteams_strengths',
    'allstarteams_values',
    'allstarteams_passions',
    'allstarteams_growthAreas',
    'allstarteams_insights',
    'allstarteams_reflection',
    
    // Imaginal Agility Workshop specific storage items
    'imaginal-agility-navigation-progress',
    'imaginal_agility_progress',
    'imaginal_agility_assessments',
    'imaginal_agility_reflections',
    'imaginal_agility_5Cs',
    'imaginal_agility_insights',
    
    // Shared storage items across workshops
    'user-preferences',
    'workshop-progress',
    'assessment-data',
    'active-workshop',
    'current-workshop',
    'workshop-state',
    'cached-assessments',
    'cached-reflections',
    'cached-star-card',
    'cached-flow-attributes',
    'cached-user-progress',
    
    // Legacy and common items
    'star-card',
    'flow-attributes',
    'flow-assessment',
    'strengths-assessment',
    'reflections'
  ];

  // Load local storage data on component mount and when user changes
  useEffect(() => {
    refreshStorageData();
    refreshServerData();
    
    // Clear React Query cache to ensure fresh data for new user
    queryClient.clear();
  }, []);
  
  // Add effect to refresh data when page becomes visible (handles user switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh data to handle user switching
        setTimeout(() => {
          refreshServerData();
          queryClient.clear();
        }, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    
    // First, display a clear "loading" state
    setServerData({ status: "Loading data from server..." });
    
    try {
      // Fetch raw userAssessments data to show in the database view - only for current user
      const userAssessmentsResponse = await fetch('/api/user/assessments', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (userAssessmentsResponse.ok) {
        const assessmentsData = await userAssessmentsResponse.json();
        
        // Filter to only show current user's data
        if (assessmentsData.userInfo && assessmentsData.currentUser) {
          // Extract only current user's data
          const currentUserId = assessmentsData.userInfo.sessionUserId;
          const currentUserData = {
            success: assessmentsData.success,
            userInfo: assessmentsData.userInfo,
            currentUser: assessmentsData.currentUser,
            // Only include current user's data, not other users
            myAssessments: assessmentsData.currentUser.assessments || {}
          };
          
          data.userAssessments = currentUserData;
        } else {
          // Keep original data structure if unexpected format
          data.userAssessments = assessmentsData;
        }
        
        console.log("Raw user assessments data:", data.userAssessments);
      } else {
        console.log("User assessments fetch failed with status:", userAssessmentsResponse.status);
        data.userAssessments = { status: `Error: ${userAssessmentsResponse.status}`, error: true };
      }
    } catch (e) {
      console.error("User assessments fetch error:", e);
      data.userAssessments = { error: 'Failed to fetch', message: e instanceof Error ? e.message : String(e) };
    }
    
    try {
      // Fetch star card data from the correct endpoint
      const starCardResponse = await fetch('/api/starcard', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (starCardResponse.ok) {
        const responseData = await starCardResponse.json();
        // Check if this is empty data
        if (responseData.isEmpty) {
          data.starCard = { status: "No star card data found", isEmpty: true };
        } else {
          data.starCard = responseData;
        }
        console.log("Star card data:", responseData);
      } else {
        console.log("Star card fetch failed with status:", starCardResponse.status);
        data.starCard = { status: `Error: ${starCardResponse.status}`, error: true };
      }
    } catch (e) {
      console.error("Star card fetch error:", e);
      data.starCard = { error: 'Failed to fetch', message: e instanceof Error ? e.message : String(e) };
    }

    try {
      // Fetch flow attributes
      const flowResponse = await fetch('/api/flow-attributes', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (flowResponse.ok) {
        const responseData = await flowResponse.json();
        // Check if this is empty data
        if (responseData.isEmpty) {
          data.flowAttributes = { status: "No flow attributes found", isEmpty: true };
        } else {
          data.flowAttributes = responseData;
        }
        console.log("Flow attributes data:", responseData);
      } else {
        console.log("Flow attributes fetch failed with status:", flowResponse.status);
        data.flowAttributes = { status: `Error: ${flowResponse.status}`, error: true };
      }
    } catch (e) {
      console.error("Flow attributes fetch error:", e);
      data.flowAttributes = { error: 'Failed to fetch', message: e instanceof Error ? e.message : String(e) };
    }

    try {
      // Fetch user profile
      const profileResponse = await fetch('/api/auth/me', {
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

  // Display current user's actual data summary
  const getCurrentDataSummary = () => {
    const summary: Record<string, any> = {};
    let totalItems = 0;
    
    storageKeys.forEach(key => {
      const data = storageData[key];
      if (data !== null && data !== undefined) {
        summary[key] = data;
        totalItems++;
      }
    });
    
    return { summary, totalItems };
  };
  
  // Show detailed breakdown of user's current data
  const showDataBreakdown = () => {
    const { summary, totalItems } = getCurrentDataSummary();
    
    let breakdown = `=== YOUR WORKSHOP DATA BREAKDOWN ===\n\n`;
    
    // Show server data first
    breakdown += `SERVER DATA (Database):\n`;
    if (Object.keys(serverData).length > 0) {
      Object.entries(serverData).forEach(([key, value]) => {
        breakdown += `${key}:\n`;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const objKeys = Object.keys(value);
          breakdown += `  Properties: ${objKeys.join(', ')}\n`;
          if (key === 'starCard') {
            breakdown += `  Star Values: thinking=${value.thinking}, acting=${value.acting}, feeling=${value.feeling}, planning=${value.planning}\n`;
          }
          if (key === 'flowAttributes' && value.attributes) {
            breakdown += `  Flow Attributes: ${value.attributes.length} items\n`;
          }
        }
        breakdown += '\n';
      });
    } else {
      breakdown += `  No server data loaded yet\n\n`;
    }
    
    // Show localStorage data
    breakdown += `BROWSER STORAGE (localStorage):\n`;
    if (totalItems === 0) {
      breakdown += `  No workshop data found in localStorage\n\n`;
    } else {
      breakdown += `Found ${totalItems} items:\n`;
      Object.entries(summary).forEach(([key, value]) => {
        breakdown += `${key}:\n`;
        if (Array.isArray(value)) {
          breakdown += `  Type: Array with ${value.length} items\n`;
          breakdown += `  Items: ${JSON.stringify(value)}\n`;
        } else if (typeof value === 'object') {
          breakdown += `  Type: Object\n`;
          const objKeys = Object.keys(value);
          breakdown += `  Properties: ${objKeys.join(', ')}\n`;
          if (value.completed && Array.isArray(value.completed)) {
            breakdown += `  Completed items: ${value.completed.length}\n`;
          }
        } else {
          breakdown += `  Type: ${typeof value}\n`;
          breakdown += `  Value: ${String(value)}\n`;
        }
        breakdown += '\n';
      });
    }
    
    setResetResult(breakdown);
  };

  // Clear all local storage and session storage data
  const clearAllData = () => {
    // Clear all defined storage keys from localStorage
    storageKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Also clear any direct assessment cache items
    localStorage.removeItem('star-card');
    localStorage.removeItem('flow-attributes');
    localStorage.removeItem('strengths-assessment');
    
    // Dispatch events to notify components about data clearing
    window.dispatchEvent(new CustomEvent('userDataCleared'));
    window.dispatchEvent(new CustomEvent('assessmentDataCleared'));
    window.dispatchEvent(new CustomEvent('workshopDataReset'));
    console.log('🔄 Local data cleared, dispatched clearing events');
    localStorage.removeItem('flow-assessment');
    localStorage.removeItem('workshop-progress');
    localStorage.removeItem('cached_assessments');
    localStorage.removeItem('cached_star_card');
    localStorage.removeItem('cached_flow_data');
    
    // Clear the same from sessionStorage
    sessionStorage.removeItem('star-card');
    sessionStorage.removeItem('flow-attributes');
    sessionStorage.removeItem('strengths-assessment');
    sessionStorage.removeItem('flow-assessment');
    sessionStorage.removeItem('workshop-progress');
    sessionStorage.removeItem('cached_assessments');
    sessionStorage.removeItem('cached_star_card');
    sessionStorage.removeItem('cached_flow_data');
    
    console.log("Cleared all browser storage data");
    refreshStorageData();
  };

  // Reset user data via API with complete client-side refresh
  const resetUserData = async () => {
    setIsResetting(true);
    setResetResult('');
    
    try {
      // Get current user ID from API
      const userResponse = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Add cache control headers to prevent browser caching
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        setResetResult('Error: Failed to get user profile. Please log in first.');
        setIsResetting(false);
        return;
      }
      
      const userData = await userResponse.json();
      console.log("User profile data:", userData);
      
      // Extract userId using multiple fallbacks to handle different response formats
      const userId = userData?.id || userData?.user?.id;
      
      // Check if we have a valid user ID
      if (!userId) {
        setResetResult('Error: Could not determine user ID. Please make sure you are logged in.');
        setIsResetting(false);
        return;
      }
      
      // Log the user ID for debugging
      console.log("User ID for reset:", userId);
      
      // STEP 1: Clear ALL browser data (localStorage and sessionStorage)
      clearAllData();
      
      // STEP 2: Clear any data in memory 
      setServerData({ status: "Resetting data on server..." });
      
      // STEP 3: Call the reset API to clear all server-side data
      // Use a timestamp to prevent browser from reusing cached responses
      const timestamp = new Date().getTime();
      const resetResponse = await fetch(`/api/test-users/reset/user/${userId}?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // Add cache control headers to prevent browser caching
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
      
      // Check if reset was successful based on status
      if (resetResponse.ok) {
        // Get response as text first to inspect
        const responseText = await resetResponse.text();
        
        // Attempt to parse as JSON if possible
        try {
          const responseData = JSON.parse(responseText);
          setResetResult(`✅ RESET SUCCESSFUL!\n\nServer Response: ${JSON.stringify(responseData, null, 2)}\n\nStatus: ${resetResponse.status} ${resetResponse.statusText}`);
        } catch (e) {
          // Not valid JSON, but still successful if status is 200
          setResetResult(`✅ RESET SUCCESSFUL!\n\nStatus: ${resetResponse.status} ${resetResponse.statusText}\n\nNote: Server returned HTML instead of JSON, but the reset operation completed successfully.`);
        }
        
        // Force a full refresh of all data
        // First clear any server data we might have cached in memory
        setServerData({ status: "Data reset complete. Refreshing..." });
        
        // Wait a moment to allow the server to fully process the reset
        setTimeout(async () => {
          // 1. Clear browser memory data again to be sure
          clearAllData();
          
          // 2. Refresh the server data to show changes - force no-cache
          await refreshServerData();
          
          // 3. Also explicitly clear flow assessment data separately
          try {
            // Force a fresh fetch of flow attributes with cache disabled
            const flowResponse = await fetch('/api/starcard/flow-attributes', {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              },
              credentials: 'include',
              cache: 'no-store'
            });
            
            if (flowResponse.ok) {
              const flowData = await flowResponse.json();
              console.log("Refreshed flow attributes data:", flowData);
            }
          } catch (e) {
            console.error("Error refreshing flow data:", e);
          }
        }, 1000);
      } else {
        // Reset failed
        const responseText = await resetResponse.text();
        setResetResult(`❌ RESET FAILED!\n\nStatus: ${resetResponse.status} ${resetResponse.statusText}\n\nError: ${responseText}`);
      }
    } catch (error) {
      setResetResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative">
      {/* Test Banner at the top */}
      <div className="w-full fixed top-0 left-0 right-0 z-50">
        <TestUserBanner showInHeader={true} user={{isTestUser: true}} />
      </div>
      
      <div className="container py-8 max-w-4xl mt-12">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/allstarteams')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workshop
          </Button>
          <h1 className="text-3xl font-bold">Workshop Reset Test Tool</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Browser Storage (localStorage)</CardTitle>
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Database Data (Server)</CardTitle>
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
          
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Current User Data</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={showDataBreakdown}
                    className="bg-blue-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Show My Data
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={refreshStorageData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearAllData}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <h3 className="font-medium mb-2">Server Reset</h3>
                <div className="flex flex-col space-y-2">
                  {/* Original legacy reset button */}
                  <Button 
                    onClick={resetUserData}
                    disabled={isResetting}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isResetting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Trash className="h-4 w-4 mr-2" />
                        Reset User Data (Legacy)
                      </>
                    )}
                  </Button>
                  
                  {/* New fixed reset button using ResetUserDataButton component */}
                  <div className="mt-2">
                    <ResetUserDataButton 
                      userId={serverData.userAssessments?.userInfo?.sessionUserId || serverData.userProfile?.user?.id || serverData.userProfile?.id} 
                      onSuccess={() => {
                        // Invalidate all queries
                        queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/user/assessments'] });
                        
                        // Refresh UI data
                        refreshServerData();
                        refreshStorageData();
                        
                        // Show success message
                        toast({
                          title: 'Reset Complete',
                          description: 'User data has been reset successfully with improved reset method!',
                        });
                        
                        // Clear local storage too
                        clearAllData();
                      }} 
                    />
                  </div>
                </div>
                
                {resetResult && (
                  <div className="bg-slate-50 p-4 rounded overflow-auto max-h-[150px]">
                    <pre className="text-xs whitespace-pre-wrap">{resetResult}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-2">
              <li>First, make sure you're logged in to test the reset functionality</li>
              <li>Click "Show My Data" to see a detailed breakdown of your actual workshop progress and data</li>
              <li>Click "Reset User Data" to test the full reset process (both localStorage and server)</li>
              <li>Check the response to see if there are any errors</li>
              <li>The reset is working correctly if:
                <ul className="list-disc pl-6 mt-1">
                  <li>Your localStorage data is cleared</li>
                  <li>The server response shows success</li>
                  <li>When you go back to the workshop, your progress is reset</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}