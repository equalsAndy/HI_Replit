import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  currentImageUrl?: string | null;
  buttonText?: string;
  className?: string;
  label?: string;
  endpoint?: string;
  onUploadComplete?: (url: string) => void;
}

export function ImageUpload({
  onImageChange,
  currentImageUrl,
  buttonText = "Upload Image",
  className = "",
  label = "Profile Image",
  endpoint = "/api/upload/starcard",
  onUploadComplete
}: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onImageChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // If endpoint is provided, automatically upload the file
      if (endpoint) {
        uploadFile(file);
      }
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      if (data.success && data.imageUrl) {
        // Update image preview with the URL from the server
        setImagePreview(data.imageUrl);
        
        // Call the onUploadComplete callback if provided
        if (onUploadComplete) {
          onUploadComplete(data.imageUrl);
        }
        
        toast({
          title: "Upload successful",
          description: "Your image has been uploaded.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      
      {imagePreview ? (
        <div className="relative w-full max-w-[200px] mx-auto">
          <img
            src={imagePreview}
            alt="Image preview"
            className="w-full h-auto object-cover rounded-md"
          />
          <button
            type="button"
            onClick={handleReset}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center gap-2 cursor-pointer w-full max-w-[200px] mx-auto"
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground text-center">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Click to upload an image
              </p>
            </>
          )}
        </div>
      )}
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        disabled={uploading}
      />
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        className="max-w-[200px] mx-auto"
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  );
}