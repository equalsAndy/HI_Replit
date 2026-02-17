import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import StarCard from '@/components/starcard/StarCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AdminStarCardModalProps {
  userId: number;
  userName: string;
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminStarCardModal({
  userId,
  userName,
  username,
  isOpen,
  onClose
}: AdminStarCardModalProps) {
  const starCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { toast } = useToast();

  // Check if StarCard PNG exists
  const { data: existingStarCard, isLoading: checkingExisting } = useQuery({
    queryKey: [`/api/starcard/admin/check/${userId}`],
    enabled: isOpen,
    retry: false
  });

  // Fetch StarCard data (scores + flow attributes)
  const { data: starCardData, isLoading: loadingData } = useQuery({
    queryKey: [`/api/starcard/admin/data/${userId}`],
    enabled: isOpen && !existingStarCard?.exists,
    retry: false
  });

  // Fetch flow attributes
  const { data: flowData, isLoading: loadingFlow } = useQuery({
    queryKey: [`/api/starcard/admin/flow-attributes/${userId}`],
    enabled: isOpen && !existingStarCard?.exists,
    retry: false
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (existingStarCard?.exists) {
        // Download existing PNG
        const response = await fetch(`/api/starcard/admin/download/${userId}`);
        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${username}-starcard-${userId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Generate from component using html2canvas
        if (!starCardRef.current) {
          throw new Error('StarCard element not found');
        }

        const { downloadElementAsImage, captureElementAsBase64 } = await import('@/lib/html2canvas');
        const filename = `${username}-starcard-${userId}-${Date.now()}.png`;

        // Capture as base64
        const base64Data = await captureElementAsBase64(starCardRef.current);

        // Save to database
        const saveResponse = await fetch('/api/photos/starcard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            imageData: base64Data,
            filename: filename,
            userId: userId // Admin is saving for another user
          })
        });

        if (!saveResponse.ok) {
          console.warn('Failed to save to database, but will continue with download');
        }

        // Download the file
        await downloadElementAsImage(starCardRef.current, filename);
      }

      toast({
        title: 'StarCard downloaded',
        description: `StarCard for ${userName} has been downloaded successfully.`
      });

      onClose();
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: (error as Error).message || 'Failed to download StarCard',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const isLoading = checkingExisting || loadingData || loadingFlow;
  const hasData = starCardData && !starCardData.isEmpty;
  const hasExistingPNG = existingStarCard?.exists;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>StarCard for {userName}</DialogTitle>
          <DialogDescription>
            {hasExistingPNG
              ? 'Saved StarCard PNG'
              : hasData
                ? 'Live preview (will be saved on download)'
                : 'No StarCard data available'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading StarCard...</span>
            </div>
          )}

          {!isLoading && !hasData && !hasExistingPNG && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{userName}</strong> has not completed the StarCard assessment yet.
                <br />
                They need to complete Module 2 (Steps 2-1 and 2-2: Strengths & Flow Patterns)
                before a StarCard can be generated.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && hasExistingPNG && (
            <div className="flex flex-col items-center">
              <img
                src={`/api/starcard/admin/preview/${userId}`}
                alt={`StarCard for ${userName}`}
                className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm"
              />
            </div>
          )}

          {!isLoading && !hasExistingPNG && hasData && (
            <div className="flex flex-col items-center" ref={starCardRef}>
              <StarCard
                thinking={starCardData.thinking}
                feeling={starCardData.feeling}
                acting={starCardData.acting}
                planning={starCardData.planning}
                userName={userName}
                flowAttributes={flowData?.attributes || []}
                state="complete"
                downloadable={false}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            Cancel
          </Button>
          {(hasData || hasExistingPNG) && (
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download StarCard
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
