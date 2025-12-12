import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface DemoAccountModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  hasWorkshopData: boolean;
}

export function DemoAccountModal({
  open,
  onClose,
  userName,
  hasWorkshopData,
}: DemoAccountModalProps) {
  const { toast } = useToast();

  const resetWorkshopMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/demo-accounts/restore/ast', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset workshop');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Workshop reset',
        description: 'Demo data has been restored successfully.',
      });
      onClose();
      // Reload the page to reflect the reset data
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: 'Reset failed',
        description: error.message || 'Failed to reset workshop. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleReset = () => {
    resetWorkshopMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Demo Account</DialogTitle>
          </div>
          <DialogDescription className="pt-4 space-y-3">
            <p>
              Welcome to <span className="font-semibold">{userName}</span>'s demo workshop!
            </p>
            <p>
              This is a demonstration account pre-populated with sample workshop data.
              You can:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Explore completed activities and reflections</li>
              <li>Try out workshop features and navigation</li>
              <li>View generated reports and insights</li>
              <li>Reset the workshop to demo state anytime</li>
            </ul>
            {hasWorkshopData && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This account has active workshop data. You can reset
                  it to the original demo state using the button below or from the profile menu.
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasWorkshopData && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetWorkshopMutation.isPending}
              className="w-full sm:w-auto"
            >
              {resetWorkshopMutation.isPending ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Demo State
                </>
              )}
            </Button>
          )}
          <Button onClick={onClose} className="w-full sm:w-auto">
            Continue to Workshop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
