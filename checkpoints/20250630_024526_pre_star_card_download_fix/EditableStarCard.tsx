import { useState } from "react";
import StarCard from "./StarCard";
import { StarCardImage } from "./StarCardImage";
import { ProfileData, QuadrantData } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditableStarCardProps {
  profile: ProfileData;
  quadrantData: QuadrantData;
  imageUrl?: string | null;
  flowAttributes?: {text: string; color: string}[];
  downloadable?: boolean;
  preview?: boolean;
  onImageUrlChange?: (url: string) => void;
}

export function EditableStarCard({
  profile,
  quadrantData,
  imageUrl,
  flowAttributes,
  downloadable = true,
  preview = false,
  onImageUrlChange
}: EditableStarCardProps) {
  const [activeTab, setActiveTab] = useState("card");
  
  const handleUploadComplete = (url: string) => {
    if (onImageUrlChange) {
      onImageUrlChange(url);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Tabs defaultValue="card" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card">Star Card</TabsTrigger>
            <TabsTrigger value="image">Upload Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="card" className="flex justify-center items-center py-4">
            <StarCard
              profile={profile}
              quadrantData={quadrantData}
              imageUrl={imageUrl}
              flowAttributes={flowAttributes}
              downloadable={downloadable}
              preview={preview}
            />
          </TabsContent>
          
          <TabsContent value="image" className="py-4">
            <StarCardImage 
              imageUrl={imageUrl} 
              onUploadComplete={handleUploadComplete}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}