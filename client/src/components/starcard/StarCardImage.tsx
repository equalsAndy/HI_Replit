import { useState } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";

interface StarCardImageProps {
  imageUrl?: string | null;
  className?: string;
  onUploadComplete?: (url: string) => void;
}

export function StarCardImage({ imageUrl, className = "", onUploadComplete }: StarCardImageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleImageChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleUploadComplete = (url: string) => {
    // Invalidate the star card cache to refresh the data
    queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
    
    // Call the parent component's onUploadComplete callback if provided
    if (onUploadComplete) {
      onUploadComplete(url);
    } else {
      toast({
        title: "Image updated",
        description: "Your Star Card image has been updated successfully.",
      });
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <CardContent className="p-0">
        <ImageUpload
          onImageChange={handleImageChange}
          currentImageUrl={imageUrl}
          buttonText="Upload Star Card Image"
          label="Star Card Image"
          endpoint="/api/upload/starcard"
          onUploadComplete={handleUploadComplete}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}