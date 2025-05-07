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
            <p className="font-medium text-gray-800">Name: {profile.name || 'Your Name'}</p>
            <p className="text-sm text-gray-600">Title: {profile.title || 'Your Title'}</p>
            <p className="text-sm text-gray-600">Organization: {profile.organization || 'Your Organization'}</p>
          </div>
        </div>
        
        {/* Apex Strength */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-700">{quadrantData?.apexStrength || 'Imagination'}</p>
          <p className="text-xs text-gray-500 italic">Your Apex Strength</p>
        </div>
        
        {/* Main Star Card Diagram - Precisely matches reference image */}
        <div className="relative mx-auto mb-6" style={{ width: '280px', height: '280px' }}>
          {/* Flow Label at top */}
          <div className="absolute top-0 right-1/3 text-sm font-medium text-gray-700">
            Flow
          </div>
          
          {/* Center Star */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="h-14 w-14 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-8 w-8 text-gray-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">Core</p>
          </div>
          
          {/* The Four Strength Squares - Perfectly aligned with 2px gaps - 15% bigger */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 gap-[2px] w-[120px] h-[120px] z-10">
            {/* Top Left - Thinking */}
            <div className="bg-green-500 text-white p-2 flex flex-col items-center justify-center aspect-square">
              <p className="text-[10px] font-bold">THINKING</p>
              <p className="text-xs font-medium">{normalizeScore(quadrantData?.thinking || 0)}%</p>
            </div>
            
            {/* Top Right - Acting */}
            <div className="bg-red-500 text-white p-2 flex flex-col items-center justify-center aspect-square">
              <p className="text-[10px] font-bold">ACTING</p>
              <p className="text-xs font-medium">{normalizeScore(quadrantData?.acting || 0)}%</p>
            </div>
            
            {/* Bottom Left - Feeling */}
            <div className="bg-blue-500 text-white p-2 flex flex-col items-center justify-center aspect-square">
              <p className="text-[10px] font-bold">FEELING</p>
              <p className="text-xs font-medium">{normalizeScore(quadrantData?.feeling || 0)}%</p>
            </div>
            
            {/* Bottom Right - Planning */}
            <div className="bg-yellow-500 text-white p-2 flex flex-col items-center justify-center aspect-square">
              <p className="text-[10px] font-bold">PLANNING</p>
              <p className="text-xs font-medium">{normalizeScore(quadrantData?.planning || 0)}%</p>
            </div>
          </div>
          
          {/* Flow Squares positioned in relation to each strength */}
          {/* Flow 1 - Above Acting (top right strength) */}
          <div className="absolute top-4 right-[85px] w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
            <p className="text-xs font-medium"></p>
            <p className="text-sm font-bold"></p>
          </div>
          
          {/* Flow 2 - Right of Planning (bottom right strength) */}
          <div className="absolute bottom-[85px] right-4 w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
            <p className="text-xs font-medium"></p>
            <p className="text-sm font-bold"></p>
          </div>
          
          {/* Flow 3 - Below Feeling (bottom left strength) */}
          <div className="absolute bottom-4 left-[85px] w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
            <p className="text-xs font-medium"></p>
            <p className="text-sm font-bold"></p>
          </div>
          
          {/* Flow 4 - Left of Thinking (top left strength) */}
          <div className="absolute top-[85px] left-4 w-12 h-12 bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
            <p className="text-xs font-medium"></p>
            <p className="text-sm font-bold"></p>
          </div>
          
          {/* Arrow from Flow 1 (top right) to Flow 2 (bottom right) */}
          <div className="absolute right-[10px] top-[60px] h-[120px]">
            <div className="absolute left-0 top-0 h-full w-[1px] bg-gray-400"></div>
            <div className="absolute left-[-3px] bottom-0 transform rotate-90">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M0 0L8 4L0 8z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
          
          {/* Arrow from Flow 2 (bottom right) to Flow 3 (bottom left) */}
          <div className="absolute bottom-[10px] left-[60px] w-[120px]">
            <div className="absolute left-0 top-0 w-full h-[1px] bg-gray-400"></div>
            <div className="absolute left-0 top-[-3px]">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M8 0L0 4L8 8z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
          
          {/* Arrow from Flow 3 (bottom left) to Flow 4 (top left) */}
          <div className="absolute left-[10px] top-[60px] h-[120px]">
            <div className="absolute left-0 bottom-0 h-full w-[1px] bg-gray-400"></div>
            <div className="absolute left-[-3px] top-0 transform rotate-90">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M8 0L0 4L8 8z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
          
          {/* Arrow from Flow 4 (top left) to Flow 1 (top right) */}
          <div className="absolute top-[10px] left-[60px] w-[120px]">
            <div className="absolute right-0 top-0 w-full h-[1px] bg-gray-400"></div>
            <div className="absolute right-0 top-[-3px]">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M0 0L8 4L0 8z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Logo - Positioned completely within the card */}
        <div className="flex justify-center mt-4">
          <img 
            src="/src/assets/all-star-teams-logo-250px.png" 
            alt="AllStarTeams" 
            className="h-6 w-auto"
            style={{ marginBottom: '20px' }}  
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