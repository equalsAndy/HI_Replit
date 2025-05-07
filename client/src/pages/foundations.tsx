import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";

export default function Foundations() {
  // Get user profile
  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  const modules = [
    { 
      id: "A", 
      title: "Reflect On Your Strengths",
      path: "/core-strengths",
      isComplete: false
    },
    { 
      id: "B", 
      title: "Identify Your Flow",
      path: "/flow-assessment",
      isComplete: false
    },
    { 
      id: "C", 
      title: "Rounding Out",
      path: "/rounding-out",
      isComplete: false
    },
    { 
      id: "D", 
      title: "Complete Your Star Card",
      path: "/report",
      isComplete: false
    }
  ];
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
              <InfoIcon className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Individual Foundations</h1>
          </div>
          
          <p className="text-gray-700 mb-6">
            Welcome! Explore your inner potential and how it connects to your work, team, and aspirations. 
            Click any step to begin.
          </p>
          
          <div className="space-y-3">
            {modules.map((module) => (
              <Link key={module.id} href={module.path}>
                <div className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-md p-4 cursor-pointer transition-colors">
                  <div className="font-bold text-blue-700 mr-3">{module.id}:</div>
                  <div className="text-gray-800">{module.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <div className="rounded-md bg-gray-900 aspect-video flex items-center justify-center overflow-hidden">
            <div className="text-center text-white">
              <InfoIcon className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-1">Video unavailable</h3>
              <p className="text-gray-400">This video is unavailable</p>
              <a href="https://youtube.com" className="text-blue-400 text-sm mt-4 inline-block">
                Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}