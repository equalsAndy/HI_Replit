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
    // Create array of quadrant objects with exact RGB colors matching the reference image
    const quadrants: QuadrantInfo[] = [
      { key: 'thinking', label: 'THINKING', color: 'rgb(1, 162, 82)', score: quadrantData?.thinking || 0, position: 0 },
      { key: 'acting', label: 'ACTING', color: 'rgb(241, 64, 64)', score: quadrantData?.acting || 0, position: 0 },
      { key: 'feeling', label: 'FEELING', color: 'rgb(22, 126, 253)', score: quadrantData?.feeling || 0, position: 0 },
      { key: 'planning', label: 'PLANNING', color: 'rgb(255, 203, 47)', score: quadrantData?.planning || 0, position: 0 }
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
        
        {/* Cloud graphic with Apex Strength - Matches example exactly */}
        <div className="relative text-center mb-8 pt-4">
          {/* Cloud SVG */}
          <svg 
            viewBox="0 0 400 120" 
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top part of cloud */}
            <path
              d="M350 60 C350 40, 300 15, 240 15 C180 15, 70 20, 50 60 C30 100, 180 105, 240 105 C300 105, 350 80, 350 60 Z"
              fill="white"
              stroke="#f8f8f8"
              strokeWidth="1"
            />
          </svg>
          
          {/* Text positioned on top of cloud */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-medium text-gray-500">{quadrantData?.apexStrength || 'Imagination'}</p>
            <p className="text-sm text-gray-500 italic">Your Apex Strength</p>
          </div>
        </div>
        
        {/* Main Star Card Diagram - Precisely matches example image */}
        <div className="relative mx-auto mb-6" style={{ width: '280px', height: '280px' }}>
          {/* Flow Label at right side */}
          <div className="absolute top-1/3 right-4 text-sm font-medium text-gray-700">
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
          
          {/* The Four Strength Squares - Exactly as in example image */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 gap-[1px] w-[120px] h-[120px] z-10">
            {/* Top Left - Thinking */}
            <div className="text-white p-2 flex flex-col items-center justify-center aspect-square" style={{ backgroundColor: 'rgb(1, 162, 82)' }}>
              <p className="text-xs font-bold">THINKING</p>
              <p className="text-xs font-medium">{normalizeScore(quadrantData?.thinking || 0)}%</p>
            </div>
            
            {/* Top Right - Acting */}
            <div className="text-white p-2 flex flex-col items-center justify-center aspect-square" style={{ backgroundColor: 'rgb(241, 64, 64)' }}>
              <p className="text-xs font-bold">ACTING</p>
              <p className="text-xs font-medium">{normalizeScore(quadrantData?.acting || 0)}%</p>
            </div>
            
            {/* Bottom Left - Feeling */}
            <div className="text-white p-2 flex flex-col items-center justify-center aspect-square" style={{ backgroundColor: 'rgb(22, 126, 253)' }}>
              <p className="text-xs font-bold">FEELING</p>
              <p className="text-xs font-medium">{normalizeScore(quadrantData?.feeling || 0)}%</p>
            </div>
            
            {/* Bottom Right - Planning */}
            <div className="text-white p-2 flex flex-col items-center justify-center aspect-square" style={{ backgroundColor: 'rgb(255, 203, 47)' }}>
              <p className="text-xs font-bold">PLANNING</p>
              <p className="text-xs font-medium">{normalizeScore(quadrantData?.planning || 0)}%</p>
            </div>
          </div>
          
            {/* Flow Squares positioned exactly as in the example image */}
          {/* Top Right Flow Square */}
          <div className="absolute top-[30px] right-[30px] w-[60px] h-[60px] bg-gray-100 border border-gray-300">
          </div>
          
          {/* Bottom Right Flow Square */}
          <div className="absolute bottom-[30px] right-[30px] w-[60px] h-[60px] bg-gray-100 border border-gray-300">
          </div>
          
          {/* Bottom Left Flow Square */}
          <div className="absolute bottom-[30px] left-[30px] w-[60px] h-[60px] bg-gray-100 border border-gray-300">
          </div>
          
          {/* Top Left Flow Square */}
          <div className="absolute top-[30px] left-[30px] w-[60px] h-[60px] bg-gray-100 border border-gray-300">
          </div>
          
          {/* Right Arrow - Down arrow on right side */}
          <div className="absolute right-[60px] top-[85px] h-[110px]">
            <div className="absolute left-0 top-0 h-full w-[1px] bg-gray-400"></div>
            <div className="absolute bottom-0 left-[-4px]">
              <svg width="10" height="14" viewBox="0 0 10 14">
                <path d="M5 14 L0 7 L10 7 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
          
          {/* Bottom Arrow - Left arrow on bottom */}
          <div className="absolute bottom-[60px] left-[85px] w-[110px]">
            <div className="absolute left-0 top-0 w-full h-[1px] bg-gray-400"></div>
            <div className="absolute left-0 top-[-4px]">
              <svg width="14" height="10" viewBox="0 0 14 10">
                <path d="M0 5 L7 0 L7 10 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>
          
          {/* Left Arrow - Up arrow (no arrowhead visible in example) */}
          <div className="absolute left-[60px] top-[85px] h-[110px]">
            <div className="absolute left-0 top-0 h-full w-[1px] bg-gray-400"></div>
          </div>
          
          {/* Top Arrow - (no arrowhead visible in example) */}
          <div className="absolute top-[60px] left-[85px] w-[110px]">
            <div className="absolute right-0 top-0 w-full h-[1px] bg-gray-400"></div>
          </div>
        </div>
        
        {/* Logo - Positioned at bottom right like in example */}
        <div className="flex justify-end mt-6 pr-4">
          <div className="text-indigo-700 flex items-center">
            <div className="border-2 border-indigo-700 rounded h-6 w-6 flex items-center justify-center mr-1">
              <span className="text-indigo-700 text-sm">✱</span>
            </div>
            <span className="text-indigo-700 text-sm font-medium">allstarteams</span>
          </div>
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