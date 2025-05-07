import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { downloadElementAsImage } from "@/lib/html2canvas";
import { UserIcon } from "lucide-react";
import { ProfileData, QuadrantData } from "@shared/schema";

interface StarCardProps {
  profile: ProfileData;
  quadrantData: QuadrantData;
  downloadable?: boolean;
}

export default function StarCard({ profile, quadrantData, downloadable = true }: StarCardProps) {
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
        className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Star Card</h2>
        
        {/* User Profile */}
        <div className="flex items-center mb-8">
          <div className="bg-gray-200 rounded-full h-16 w-16 flex items-center justify-center mr-4">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <UserIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">Name: {profile.name || 'User'}</p>
            <p className="text-gray-600">Title: {profile.title || 'title'}</p>
            <p className="text-gray-600">Organization: {profile.organization || 'company'}</p>
          </div>
        </div>
        
        {/* Apex Strength */}
        <div className="text-center mb-6 relative">
          <div className="absolute top-0 left-0 right-0 h-8 bg-contain bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 100\"><path d=\"M0,100 C300,20 700,20 1000,100\" fill=\"none\" stroke=\"%23f0f0f0\" stroke-width=\"60\"/></svg>')" }}>
          </div>
          <div className="pt-6 pb-2">
            <p className="text-lg text-gray-700">Imagination</p>
            <p className="text-sm text-gray-500 italic">Your Apex Strength</p>
          </div>
        </div>
        
        {/* Star and Core */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex-1"></div>
          <div className="text-right mr-2 text-gray-600">Flow</div>
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-10 w-10 text-gray-300">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-gray-500 mt-10">Core</p>
            </div>
          </div>
          <div className="text-left ml-2 text-gray-600">Flow</div>
          <div className="flex-1"></div>
        </div>
        
        {/* Quadrants */}
        <div className="grid grid-cols-2 gap-px mb-6 w-48 mx-auto">
          <div className="bg-gray-300 p-3 text-center">
            <p className="text-xs font-bold uppercase">Thinking</p>
            <p className="text-sm">{quadrantData?.thinking || 0}%</p>
          </div>
          <div className="bg-gray-300 p-3 text-center">
            <p className="text-xs font-bold uppercase">Acting</p>
            <p className="text-sm">{quadrantData?.acting || 0}%</p>
          </div>
          <div className="bg-gray-300 p-3 text-center">
            <p className="text-xs font-bold uppercase">Planning</p>
            <p className="text-sm">{quadrantData?.planning || 0}%</p>
          </div>
          <div className="bg-gray-300 p-3 text-center">
            <p className="text-xs font-bold uppercase">Feeling</p>
            <p className="text-sm">{quadrantData?.feeling || 0}%</p>
          </div>
        </div>
        
        {/* Arrows */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-20 w-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-gray-400">
              <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="h-20 w-20"></div>
          <div className="h-20 w-20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-gray-400">
              <path d="M12 5v14M19 12l-7 7-7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        
        {/* Bottom Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-20 w-20 bg-gray-100"></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-gray-400">
            <path d="M5 12h14M12 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="h-20 w-20 bg-gray-100"></div>
        </div>
        
        {/* Logo */}
        <div className="text-right">
          <img 
            src="/src/assets/all-star-teams-logo-250px.png" 
            alt="AllStarTeams" 
            className="h-6 w-auto inline-block"
          />
        </div>
      </div>
      
      {downloadable && (
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