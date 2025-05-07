import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CameraIcon, TrashIcon, Upload, CheckIcon, XIcon } from 'lucide-react';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  const pixelRatio = window.devicePixelRatio;
  
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
  
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';
  
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();
  
  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );
  
  ctx.restore();
}

interface AvatarUploaderProps {
  currentAvatar?: string;
  onAvatarChange: (base64Image: string) => void;
}

export default function AvatarUploader({ 
  currentAvatar, 
  onAvatarChange 
}: AvatarUploaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // When user selects a file
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setIsDialogOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };
  
  // When an image loads in the crop dialog
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Make initial crop 100% circular
    setCrop(centerAspectCrop(width, height, 1));
  }, []);
  
  // Generate the cropped result
  const generateCroppedImage = useCallback(async () => {
    if (
      !imgRef.current ||
      !previewCanvasRef.current ||
      !completedCrop
    ) {
      return;
    }
    
    // Draw the cropped image to the canvas
    canvasPreview(
      imgRef.current,
      previewCanvasRef.current,
      completedCrop,
      scale,
      rotate
    );
    
    // Convert canvas to base64 image with quality parameter
    // Reduce quality to ensure the image size is manageable
    const base64Image = previewCanvasRef.current.toDataURL('image/jpeg', 0.8);
    
    // Call the prop function with the result
    onAvatarChange(base64Image);
    
    // Close dialog
    setIsDialogOpen(false);
    
    // Debug to console
    console.log("Image processed and passed to parent component", base64Image.substring(0, 50) + "...");
  }, [completedCrop, scale, rotate, onAvatarChange]);
  
  const handleRemoveAvatar = () => {
    onAvatarChange('');
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-gray-200">
          {currentAvatar ? (
            <AvatarImage src={currentAvatar} alt="User avatar" />
          ) : (
            <AvatarFallback className="bg-indigo-100 text-indigo-800">
              <CameraIcon className="h-10 w-10 text-indigo-400" />
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
          <label className="cursor-pointer p-2 bg-white rounded-full mr-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            <input 
              type="file" 
              className="hidden" 
              onChange={onFileChange} 
              accept="image/*" 
            />
          </label>
          
          {currentAvatar && (
            <button 
              onClick={handleRemoveAvatar}
              className="p-2 bg-white rounded-full"
            >
              <TrashIcon className="h-5 w-5 text-red-600" />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">Click to update avatar</p>
      
      {/* Crop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Avatar</DialogTitle>
            <DialogDescription>
              Drag to reposition. Use the slider to zoom.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[400px] mx-auto"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  style={{ transform: `scale(${scale})` }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
            
            <div className="mt-4">
              <label className="text-sm font-medium">Zoom</label>
              <Slider
                value={[scale]}
                min={0.5}
                max={2}
                step={0.01}
                onValueChange={(value) => setScale(value[0])}
                className="mt-2"
              />
            </div>
            
            {/* Hidden canvas used for cropping */}
            <canvas
              ref={previewCanvasRef}
              className="hidden"
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={generateCroppedImage}>
              <CheckIcon className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}