import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Download, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TestUserToolsProps {
  userId: number;
}

const TestUserTools: React.FC<TestUserToolsProps> = ({ userId }) => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Handle data export
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/export`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();
      
      // Create and download JSON file
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `test-user-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: 'Data Exported',
        description: 'Your test user data has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to export your data. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle data reset
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/user/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: 'Data Reset Complete',
            description: 'All your workshop progress has been reset successfully.',
          });
          setIsResetDialogOpen(false);
          // Redirect to refresh the page state
          setTimeout(() => {
            setLocation('/testuser');
          }, 1000);
        } else {
          throw new Error(data.error || 'Reset failed');
        }
      } else {
        throw new Error('Failed to reset data');
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: 'Failed to reset your data. Please try again.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="text-xl text-gray-800">Test User Tools</CardTitle>
          <p className="text-sm text-gray-600">Manage your testing data and progress</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Data Button */}
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="h-auto p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-center">
                <Download className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {isExporting ? 'Exporting...' : 'Export All Data'}
                </span>
              </div>
            </Button>

            {/* Reset Data Button */}
            <Button
              onClick={() => setIsResetDialogOpen(true)}
              disabled={isResetting}
              className="h-auto p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-center">
                <Trash2 className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  {isResetting ? 'Resetting...' : 'Reset All Data'}
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Reset All Data</DialogTitle>
            <DialogDescription className="text-gray-600">
              This action will permanently delete all your workshop progress and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">The following data will be deleted:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All workshop navigation progress</li>
                <li>• Star Card and assessment responses</li>
                <li>• Flow attributes and well-being data</li>
                <li>• Step-by-step reflections</li>
                <li>• Video progress tracking</li>
                <li>• All completed step markers</li>
              </ul>
              <p className="text-xs text-red-600 mt-3 font-medium">
                Your account and test user status will be preserved.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetData}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isResetting ? 'Resetting...' : 'Reset All Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestUserTools;