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
    // Create array of quadrant objects with initial properties
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
            <p className="font-medium text-gray-800">Name: {profile.name || 'User'}</p>
            <p className="text-sm text-gray-600">Title: {profile.title || 'Title'}</p>
            <p className="text-sm text-gray-600">Organization: {profile.organization || 'Company'}</p>
          </div>
        </div>
        
        {/* Apex Strength */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-700">{quadrantData?.apexStrength || 'Imagination'}</p>
          <p className="text-xs text-gray-500 italic">Your Apex Strength</p>
        </div>
        
        {/* Star and Core */}
        <div className="flex items-center justify-center relative mb-8">
          <div className="h-20 w-20 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white z-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-10 w-10 text-gray-400">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="absolute text-xs text-gray-500 mt-24">Core</p>
        </div>
        
        {/* Quadrants in order of strength */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {/* Top Right - Highest score */}
          {getQuadrantAtPosition(0) && (
            <div className={`${getQuadrantAtPosition(0)?.color} text-white p-3 flex flex-col items-center justify-center aspect-square`}>
              <p className="text-xs font-bold uppercase">{getQuadrantAtPosition(0)?.label}</p>
              <p className="text-sm font-medium mt-1">{normalizeScore(getQuadrantAtPosition(0)?.score || 0)}%</p>
            </div>
          )}
          
          {/* Bottom Right - Second highest */}
          {getQuadrantAtPosition(1) && (
            <div className={`${getQuadrantAtPosition(1)?.color} text-white p-3 flex flex-col items-center justify-center aspect-square`}>
              <p className="text-xs font-bold uppercase">{getQuadrantAtPosition(1)?.label}</p>
              <p className="text-sm font-medium mt-1">{normalizeScore(getQuadrantAtPosition(1)?.score || 0)}%</p>
            </div>
          )}
          
          {/* Bottom Left - Third highest */}
          {getQuadrantAtPosition(2) && (
            <div className={`${getQuadrantAtPosition(2)?.color} text-white p-3 flex flex-col items-center justify-center aspect-square`}>
              <p className="text-xs font-bold uppercase">{getQuadrantAtPosition(2)?.label}</p>
              <p className="text-sm font-medium mt-1">{normalizeScore(getQuadrantAtPosition(2)?.score || 0)}%</p>
            </div>
          )}
          
          {/* Top Left - Lowest score */}
          {getQuadrantAtPosition(3) && (
            <div className={`${getQuadrantAtPosition(3)?.color} text-white p-3 flex flex-col items-center justify-center aspect-square`}>
              <p className="text-xs font-bold uppercase">{getQuadrantAtPosition(3)?.label}</p>
              <p className="text-sm font-medium mt-1">{normalizeScore(getQuadrantAtPosition(3)?.score || 0)}%</p>
            </div>
          )}
        </div>
        
        {/* Logo */}
        <div className="flex justify-end mt-auto">
          <img 
            src="/src/assets/all-star-teams-logo-250px.png" 
            alt="AllStarTeams" 
            className="h-6 w-auto"
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