import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Save, Trash } from 'lucide-react';

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

export default function WorkshopResetTest() {
  const [location, navigate] = useLocation();
  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [serverData, setServerData] = useState<Record<string, any>>({});
  const [resetResult, setResetResult] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);

  // Storage keys to check and clear - comprehensive list for all workshop data
  const storageKeys = [
    // AllStar Teams Workshop keys
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
    'allstarteams_userData',
    'allstarteams_assessment',
    'allstarteams_profile',
    'allstarteams_coreStrengths',
    
    // Imaginal Agility Workshop keys
    'imaginal-agility-navigation-progress',
    'imaginal_navigation_progress',
    'imaginal_userData',
    'imaginal_assessment',
    'imaginal_profile',
    'imaginal_progress',
    
    // General application keys
    'user-preferences',
    'workshop-progress',
    'assessment-data',
    'app-state',
    'last-workshop',
    'auth-state'
  ];

  // Load local storage data on component mount
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

  // Clear all local storage data and return count of items cleared
  const clearAllData = () => {
    let itemsCleared = 0;
    
    storageKeys.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        itemsCleared++;
      }
    });
    
    refreshStorageData();
    return itemsCleared;
  };

  // Reset user data via API with improved error handling and verification
  const resetUserData = async () => {
    setIsResetting(true);
    setResetResult('');
    
    try {
      // Step 1: Get current user ID from API
      setResetResult('Step 1/4: Identifying user account...');
      const userResponse = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        setResetResult('⛔ ERROR: Failed to get user profile. Please log in first.');
        return;
      }
      
      const userData = await userResponse.json();
      const userId = userData.id;
      
      if (!userId) {
        setResetResult('⛔ ERROR: Could not determine user ID.');
        return;
      }
      
      // Step 2: Call the reset API
      setResetResult(`Step 2/4: Resetting server database data for user ID ${userId}...`);
      const resetResponse = await fetch(`/api/test-users/reset/${userId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      // Parse the response
      let responseData;
      let responseText = '';
      
      try {
        responseText = await resetResponse.text();
        responseData = JSON.parse(responseText);
      } catch (e) {
        setResetResult(`⚠️ WARNING: Received invalid JSON response from server. Text response: ${responseText.substring(0, 100)}...`);
        responseData = null;
      }
      
      // Step 3: Clear local storage data
      setResetResult(`Step 3/4: Clearing browser local storage data...`);
      const localStorageItemsCleared = clearAllData();
      
      // Step 4: Verify the reset
      setResetResult(`Step 4/4: Verifying reset completion...`);
      
      // Refresh data to verify reset
      await Promise.all([refreshServerData(), refreshStorageData()]);
      
      // Prepare detailed reset report
      let resetReport = `=== WORKSHOP DATA RESET REPORT ===\n\n`;
      
      // Server reset status
      if (resetResponse.ok && responseData && responseData.success) {
        resetReport += `✅ SERVER DATABASE RESET: SUCCESSFUL\n`;
        
        if (responseData.deletions) {
          resetReport += `   Star Card: ${responseData.deletions.starCard ? 'Deleted ✓' : 'Failed ✗'}\n`;
          resetReport += `   Flow Attributes: ${responseData.deletions.flowAttributes ? 'Deleted ✓' : 'Failed ✗'}\n`;
          resetReport += `   User Progress: ${responseData.deletions.userProgress ? 'Reset ✓' : 'Failed ✗'}\n`;
        }
      } else {
        resetReport += `❌ SERVER DATABASE RESET: FAILED\n`;
        resetReport += `   Status: ${resetResponse.status} ${resetResponse.statusText}\n`;
        if (responseData && responseData.error) {
          resetReport += `   Error: ${responseData.error}\n`;
        }
      }
      
      // Local storage reset status
      resetReport += `\n`;
      resetReport += `✅ BROWSER STORAGE RESET: ${localStorageItemsCleared > 0 ? 'SUCCESSFUL' : 'NO DATA FOUND'}\n`;
      resetReport += `   Cleared ${localStorageItemsCleared} items from localStorage\n`;
      
      // Overall status - consider reset successful if server reset worked
      const resetSuccessful = resetResponse.ok && responseData && responseData.success;
      
      resetReport += `\n`;
      resetReport += `=== OVERALL RESET STATUS: ${resetSuccessful ? 'SUCCESSFUL ✅' : 'PARTIALLY FAILED ⚠️'} ===\n`;
      
      if (!resetSuccessful && responseData && responseData.dataRemaining) {
        resetReport += `\nWARNING: Some data could not be deleted. Details:\n`;
        resetReport += JSON.stringify(responseData.dataRemaining, null, 2);
      }
      
      // Set the final result
      setResetResult(resetReport);
      
    } catch (error) {
      setResetResult(`⛔ ERROR DURING RESET: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsResetting(false);
    }
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
              <Button 
                onClick={resetUserData}
                disabled={isResetting}
                className="bg-red-500 hover:bg-red-600 text-white mb-4"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Reset User Data
                  </>
                )}
              </Button>
              
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
  );
}