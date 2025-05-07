import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { downloadElementAsImage } from "@/lib/html2canvas";
import { UserIcon } from "lucide-react";
import { ProfileData, QuadrantData } from "@shared/schema";

interface StarCardProps {
  profile: ProfileData;
  quadrantData: QuadrantData;
  downloadable?: boolean;
  preview?: boolean;
}

export default function StarCard({ 
  profile, 
  quadrantData, 
  downloadable = true,
  preview = false 
}: StarCardProps) {
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  
  // Handle download
  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setDownloading(true);
    try {
      await downloadElementAsImage(cardRef.current, `${profile.name || 'User'}_Star_Card.png`);
    } catch (error) {
      console.error("Error downloading star card:", error);
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cardRef}
        className={`bg-white border border-gray-200 rounded-lg p-4 ${preview ? 'max-w-[300px]' : 'max-w-[400px]'}`}
        style={{ aspectRatio: '1/1.4' }}
      >
        <h2 className="text-xl font-bold text-center mb-4">Star Card</h2>
        
        {/* User Profile */}
        <div className="flex items-center mb-4">
          <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center mr-3">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <UserIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">{profile.name || 'User'}</p>
            <p className="text-xs text-gray-600">{profile.title || 'title'}</p>
            <p className="text-xs text-gray-600">{profile.organization || 'company'}</p>
          </div>
        </div>
        
        {/* Apex Strength */}
        <div className="text-center mb-3">
          <p className="text-base text-gray-700">{quadrantData?.apexStrength || 'Imagination'}</p>
          <p className="text-xs text-gray-500 italic">Your Apex Strength</p>
        </div>
        
        {/* Star and Core */}
        <div className="flex items-center justify-center mb-3">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8 text-gray-300">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-gray-500 mt-14">Core</p>
            </div>
          </div>
        </div>
        
        {/* Quadrants */}
        <div className="grid grid-cols-2 gap-1 mb-3 mx-auto">
          <div className="bg-gray-200 p-3 text-center aspect-square flex flex-col items-center justify-center">
            <p className="text-xs font-bold uppercase">THINKING</p>
            <p className="text-sm font-medium mt-1">{quadrantData?.thinking || 0}%</p>
          </div>
          <div className="bg-gray-200 p-3 text-center aspect-square flex flex-col items-center justify-center">
            <p className="text-xs font-bold uppercase">ACTING</p>
            <p className="text-sm font-medium mt-1">{quadrantData?.acting || 0}%</p>
          </div>
          <div className="bg-gray-200 p-3 text-center aspect-square flex flex-col items-center justify-center">
            <p className="text-xs font-bold uppercase">PLANNING</p>
            <p className="text-sm font-medium mt-1">{quadrantData?.planning || 0}%</p>
          </div>
          <div className="bg-gray-200 p-3 text-center aspect-square flex flex-col items-center justify-center">
            <p className="text-xs font-bold uppercase">FEELING</p>
            <p className="text-sm font-medium mt-1">{quadrantData?.feeling || 0}%</p>
          </div>
        </div>
        
        <div className="text-center mb-2">
          <p className="text-xs text-gray-600">FLOW</p>
        </div>
        
        {/* Flow Areas */}
        <div className="grid grid-cols-3 gap-1 mb-3">
          <div className="aspect-square bg-gray-100"></div>
          <div className="aspect-square bg-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-gray-400">
              <path d="M5 12h14M5 12l7 7M5 12l7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="aspect-square bg-gray-100"></div>
        </div>
        
        {/* Logo */}
        <div className="text-right mt-1">
          <img 
            src="/src/assets/all-star-teams-logo-250px.png" 
            alt="AllStarTeams" 
            className="h-5 w-auto inline-block"
          />
        </div>
      </div>
      
      {downloadable && !preview && (
        <Button
          onClick={handleDownload}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700"
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download Star Card"}
        </Button>
      )}
    </div>
  );
}