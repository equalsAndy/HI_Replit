import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { downloadElementAsImage } from "@/lib/html2canvas";
import { useToast } from "@/hooks/use-toast";
import { ProfileData, QuadrantData } from "@shared/schema";

interface StarCardProps {
  profile: ProfileData;
  quadrantData: QuadrantData;
  downloadable?: boolean;
}

export default function StarCard({ profile, quadrantData, downloadable = true }: StarCardProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      await downloadElementAsImage("star-card", `${profile.name.replace(/\s+/g, '_')}_StarCard.png`);
      toast({
        title: "Success!",
        description: "Your Star Card has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="star-card" id="star-card">
      <h3 className="text-center text-xl font-bold mb-4">Star Card</h3>
      
      <div className="user-info flex items-center mb-8">
        <Avatar className="h-16 w-16 mr-4">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} />
          <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">Name: {profile.name}</p>
          <p>Title: {profile.title}</p>
          <p>Organization: {profile.organization}</p>
        </div>
      </div>
      
      <div className="star-visualization relative mb-8">
        <div className="text-center mb-2">
          <p className="font-medium">{quadrantData.apexStrength}</p>
          <p className="text-sm text-neutral-600">Your Apex Strength</p>
        </div>
        
        <div className="flex justify-center items-center mb-6">
          <div className="star-outline w-16 h-16 border-2 border-neutral-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-600" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
        
        <div className="flow-indicator flex justify-between mb-2">
          <div className="w-1/3"></div>
          <div className="text-center">
            <p className="font-medium">Core</p>
          </div>
          <div className="w-1/3 text-right">
            <p>Flow</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-1 max-w-xs mx-auto">
          <div className="quadrant-thinking p-3 text-center">
            <p className="font-medium text-xs">THINKING</p>
            <p className="font-bold">{quadrantData.thinking}%</p>
          </div>
          <div className="quadrant-acting p-3 text-center">
            <p className="font-medium text-xs">ACTING</p>
            <p className="font-bold">{quadrantData.acting}%</p>
          </div>
          <div className="quadrant-feeling p-3 text-center">
            <p className="font-medium text-xs">FEELING</p>
            <p className="font-bold">{quadrantData.feeling}%</p>
          </div>
          <div className="quadrant-planning p-3 text-center">
            <p className="font-medium text-xs">PLANNING</p>
            <p className="font-bold">{quadrantData.planning}%</p>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 40 40" className="mr-1">
            <rect width="40" height="40" rx="8" fill="#4639A2"/>
            <path d="M12 10L16 16M16 16L20 22M16 16L12 22M20 10L16 16M20 22L24 28M24 10L28 16L24 22L28 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 22L16 28M20 22L24 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-primary font-bold text-md">allstarteams</span>
        </div>
      </div>
      
      {downloadable && (
        <div className="text-center">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleDownload}
          >
            Download as PNG
          </Button>
        </div>
      )}
    </div>
  );
}
