import { useState, useRef, useMemo } from "react";
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

type QuadrantType = 'thinking' | 'acting' | 'feeling' | 'planning';
type QuadrantInfo = {
  key: QuadrantType;
  label: string;
  color: string;
  score: number;
  position: number;
};

export default function StarCard({ 
  profile, 
  quadrantData, 
  downloadable = true,
  preview = false 
}: StarCardProps) {
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  
  // Sort quadrants by score and assign positions
  const sortedQuadrants = useMemo(() => {
    // Create array of quadrant objects with colors matching the reference image
    const quadrants: QuadrantInfo[] = [
      { key: 'thinking', label: 'THINKING', color: 'bg-green-500', score: quadrantData?.thinking || 0, position: 0 },
      { key: 'acting', label: 'ACTING', color: 'bg-red-500', score: quadrantData?.acting || 0, position: 0 },
      { key: 'feeling', label: 'FEELING', color: 'bg-blue-500', score: quadrantData?.feeling || 0, position: 0 },
      { key: 'planning', label: 'PLANNING', color: 'bg-yellow-500', score: quadrantData?.planning || 0, position: 0 }
    ];
    
    // Sort by score in descending order
    const sorted = [...quadrants].sort((a, b) => b.score - a.score);
    
    // Assign positions (0 = top right, 1 = bottom right, 2 = bottom left, 3 = top left)
    // Following clockwise order
    sorted.forEach((quadrant, index) => {
      quadrant.position = index;
    });
    
    return sorted;
  }, [quadrantData]);
  
  // Get quadrant at specific position
  const getQuadrantAtPosition = (position: number): QuadrantInfo | undefined => {
    return sortedQuadrants.find(q => q.position === position);
  };
  
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
  
  // Calculate total score
  const totalScore = quadrantData?.thinking + quadrantData?.acting + quadrantData?.feeling + quadrantData?.planning || 100;
  
  // Convert raw scores to percentages
  const normalizeScore = (score: number): number => {
    return Math.round((score / totalScore) * 100);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cardRef}
        className={`bg-white border border-gray-200 rounded-lg p-5 ${preview ? 'max-w-[300px]' : 'max-w-[400px]'}`}
        style={{ aspectRatio: '1/1.4' }}
      >
        <h2 className="text-xl font-bold text-center uppercase mb-4">Star Card</h2>
        
        {/* User Profile */}
        <div className="flex items-center mb-6">
          <div className="rounded-full h-16 w-16 overflow-hidden mr-4 border border-gray-300">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{profile.name || 'Your Name'}</p>
            <p className="text-sm text-gray-600">Title: {profile.title || 'Your Title'}</p>
            <p className="text-sm text-gray-600">Organization: {profile.organization || 'Your Organization'}</p>
          </div>
        </div>
        
        {/* Apex Strength */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-700">{quadrantData?.apexStrength || 'Imagination'}</p>
          <p className="text-xs text-gray-500 italic">Your Apex Strength</p>
        </div>
        
        {/* Main Star Card Diagram */}
        <div className="relative mx-auto mb-6" style={{ width: '300px', height: '300px' }}>
          {/* Center Star */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="h-14 w-14 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8 text-gray-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">Core</p>
          </div>
          
          {/* Connecting Lines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 z-10"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 z-10"></div>
          
          {/* Position 1 - Top Right - Highest score */}
          {getQuadrantAtPosition(0) && (
            <div className="absolute top-1/2 right-1/2 w-16 h-16 transform translate-x-[1px] -translate-y-[49px]">
              <div className={`${getQuadrantAtPosition(0)?.color} text-white p-2 flex flex-col items-center justify-center aspect-square w-full h-full`}>
                <p className="text-xs font-bold uppercase">{getQuadrantAtPosition(0)?.label}</p>
                <p className="text-sm font-medium">{normalizeScore(getQuadrantAtPosition(0)?.score || 0)}%</p>
              </div>
            </div>
          )}
          
          {/* Position 2 - Bottom Right - Second highest */}
          {getQuadrantAtPosition(1) && (
            <div className="absolute top-1/2 right-1/2 w-16 h-16 transform translate-x-[49px] translate-y-[1px]">
              <div className={`${getQuadrantAtPosition(1)?.color} text-white p-2 flex flex-col items-center justify-center aspect-square w-full h-full`}>
                <p className="text-xs font-bold uppercase">{getQuadrantAtPosition(1)?.label}</p>
                <p className="text-sm font-medium">{normalizeScore(getQuadrantAtPosition(1)?.score || 0)}%</p>
              </div>
            </div>
          )}
          
          {/* Position 3 - Bottom Left - Third highest */}
          {getQuadrantAtPosition(2) && (
            <div className="absolute top-1/2 right-1/2 w-16 h-16 transform -translate-x-[49px] translate-y-[1px]">
              <div className={`${getQuadrantAtPosition(2)?.color} text-white p-2 flex flex-col items-center justify-center aspect-square w-full h-full`}>
                <p className="text-xs font-bold uppercase">{getQuadrantAtPosition(2)?.label}</p>
                <p className="text-sm font-medium">{normalizeScore(getQuadrantAtPosition(2)?.score || 0)}%</p>
              </div>
            </div>
          )}
          
          {/* Position 4 - Top Left - Lowest score */}
          {getQuadrantAtPosition(3) && (
            <div className="absolute top-1/2 right-1/2 w-16 h-16 transform -translate-x-[49px] -translate-y-[49px]">
              <div className={`${getQuadrantAtPosition(3)?.color} text-white p-2 flex flex-col items-center justify-center aspect-square w-full h-full`}>
                <p className="text-xs font-bold uppercase">{getQuadrantAtPosition(3)?.label}</p>
                <p className="text-sm font-medium">{normalizeScore(getQuadrantAtPosition(3)?.score || 0)}%</p>
              </div>
            </div>
          )}
          
          {/* Flow 1 - Outside Position 1 (3px from corner) */}
          <div className="absolute top-2 right-2 w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
            <p className="text-xs font-medium">Flow</p>
            <p className="text-sm font-bold">1</p>
          </div>
          
          {/* Flow 2 - Outside Position 2 (3px from corner) */}
          <div className="absolute bottom-2 right-2 w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
            <p className="text-xs font-medium">Flow</p>
            <p className="text-sm font-bold">2</p>
          </div>
          
          {/* Flow 3 - Outside Position 3 (3px from corner) */}
          <div className="absolute bottom-2 left-2 w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
            <p className="text-xs font-medium">Flow</p>
            <p className="text-sm font-bold">3</p>
          </div>
          
          {/* Flow 4 - Outside Position 4 (3px from corner) */}
          <div className="absolute top-2 left-2 w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
            <p className="text-xs font-medium">Flow</p>
            <p className="text-sm font-bold">4</p>
          </div>
          
          {/* Arrow from Flow 1 to Flow 2 (right side, top to bottom) */}
          <div className="absolute right-8 top-1/2 h-[120px] w-6 z-5">
            <div className="absolute right-0 top-0 h-full w-[1px] bg-gray-400"></div>
            {/* Arrow head */}
            <div className="absolute right-[-4px] bottom-0 rotate-90">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 L10 5 L0 10 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
          
          {/* Arrow from Flow 2 to Flow 3 (bottom, right to left) */}
          <div className="absolute bottom-8 left-1/2 w-[120px] h-6 z-5">
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gray-400"></div>
            {/* Arrow head */}
            <div className="absolute left-0 bottom-[-4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0 L0 5 L10 10 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
          
          {/* Arrow from Flow 3 to Flow 4 (left side, bottom to top) */}
          <div className="absolute left-8 top-1/2 h-[120px] w-6 z-5">
            <div className="absolute left-0 bottom-0 h-full w-[1px] bg-gray-400"></div>
            {/* Arrow head */}
            <div className="absolute left-[-4px] top-0 rotate-90">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0 L0 5 L10 10 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
          
          {/* Arrow from Flow 4 to Flow 1 (top, left to right) */}
          <div className="absolute top-8 left-1/2 w-[120px] h-6 z-5">
            <div className="absolute top-0 right-0 h-[1px] w-full bg-gray-400"></div>
            {/* Arrow head */}
            <div className="absolute right-0 top-[-4px]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 L10 5 L0 10 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Logo - Positioned completely within the card */}
        <div className="flex justify-center mt-5 mb-2">
          <img 
            src="/src/assets/all-star-teams-logo-250px.png" 
            alt="AllStarTeams" 
            className="h-8 w-auto"
          />
        </div>
      </div>
      
      {downloadable && !preview && (
        <Button
          onClick={handleDownload}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download Star Card"}
        </Button>
      )}
    </div>
  );
}