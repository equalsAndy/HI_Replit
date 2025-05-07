import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusIcon, MinusIcon, UserIcon, StarIcon, ClipboardIcon, LayoutPanelLeftIcon } from "lucide-react";
import StarCard from "@/components/starcard/StarCard";

export default function UserHome() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    title: "",
    organization: ""
  });
  
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Get star card data
  const { data: starCard, isLoading: starCardLoading } = useQuery({
    queryKey: ['/api/starcard'],
    enabled: !!user,
    staleTime: Infinity,
  });
  
  // Save profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const res = await apiRequest('PUT', '/api/user/profile', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
      toggleSection(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Toggle expanded section
  const toggleSection = (sectionId: string | null) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
      
      // Initialize form data if opening profile section
      if (sectionId === "profile" && user) {
        setProfileData({
          title: user.title || "",
          organization: user.organization || ""
        });
      }
    }
  };
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(profileData);
  };
  
  // Calculate progress
  const calculateProgress = () => {
    if (!user) return 0;
    return user.progress || 0;
  };
  
  const progress = calculateProgress();
  
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo flex items-center">
            <img 
              src="/src/assets/all-star-teams-logo-250px.png" 
              alt="AllStarTeams" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">{user?.name}</span>
            <div className="flex items-center space-x-1 text-gray-600 border-l border-gray-300 pl-3">
              <span className="text-sm">English</span>
              <span className="text-xs">🇺🇸</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <Button variant="destructive" size="sm" className="rounded-md">Logout</Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Steps */}
          <div>
            <div className="mb-6">
              <h2 className="text-indigo-700 text-xl font-bold">Hi, {user?.name}!</h2>
              <p className="text-gray-600">Use these steps to track progress.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className="bg-indigo-600 h-4 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-500">{progress}%</div>
            </div>
            
            {/* Step 1: Complete your Profile */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("profile")}
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-indigo-700 font-medium">Complete your Profile</span>
                </div>
                {expandedSection === "profile" ? (
                  <MinusIcon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              
              {expandedSection === "profile" && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-4 text-sm text-gray-700">
                    This information builds your Star Badge.
                  </p>
                  
                  <div className="mb-4 flex items-center">
                    <div className="mr-4">
                      <div className="bg-gray-200 rounded-full h-16 w-16 flex items-center justify-center">
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Your Avatar:</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSaveProfile}>
                    <p className="text-red-500 mb-3 text-sm">
                      Enter your Title and Company
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Title:</label>
                        <Input 
                          name="title"
                          value={profileData.title}
                          onChange={handleProfileChange}
                          placeholder="Your job title"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Company:</label>
                        <Input 
                          name="organization"
                          value={profileData.organization}
                          onChange={handleProfileChange}
                          placeholder="Your company name"
                          className="w-full"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-indigo-700 hover:bg-indigo-800"
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? "Saving..." : "Edit Profile"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {/* Introduction Section */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("introduction")}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span className="text-indigo-700 font-medium">Introduction</span>
                </div>
                {expandedSection === "introduction" ? (
                  <MinusIcon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              
              {expandedSection === "introduction" && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-4 text-sm text-gray-700">
                    Watch this introduction video to understand the AllStarTeams process.
                  </p>
                  
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe 
                      src="https://www.youtube.com/embed/ao04eaeDIFQ" 
                      title="Introduction to AllStarTeams" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full h-64 rounded border border-gray-200"
                    ></iframe>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 font-medium">Key points to remember:</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                      <li>The assessment helps identify your natural strengths</li>
                      <li>There are no right or wrong answers</li>
                      <li>Be authentic in your responses for the most accurate results</li>
                      <li>Your Star Card will help guide your personal development</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Step 2: Learn about your Strengths */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("assessment")}
              >
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-indigo-700 font-medium">Learn about your Strengths</span>
                </div>
                {expandedSection === "assessment" ? (
                  <MinusIcon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              
              {expandedSection === "assessment" && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-4 text-sm text-gray-700">
                    Take the assessment to discover your unique strengths. You'll rank options from 'most like me' to 'least like me' for a series of scenarios.
                  </p>
                  
                  <Link href="/foundations">
                    <Button className="bg-indigo-700 hover:bg-indigo-800 mr-2">
                      Learn about Strengths
                    </Button>
                  </Link>
                  
                  <Link href="/assessment">
                    <Button className="bg-indigo-700 hover:bg-indigo-800">
                      Start your AllStarTeams Experience
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Step 2B: Find your Flow State */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("flow")}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-indigo-700 font-medium">Find your Flow State</span>
                </div>
                {expandedSection === "flow" ? (
                  <MinusIcon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              
              {expandedSection === "flow" && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-4 text-sm text-gray-700">
                    This exercise is designed to help you easily understand what "flow" is and recognize when you are in it, personally and professionally.
                  </p>
                  
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe 
                      src="https://www.youtube.com/embed/ao04eaeDIFQ" 
                      title="Introduction to Flow State" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full h-64 rounded border border-gray-200"
                    ></iframe>
                  </div>
                  
                  <p className="mb-4 text-sm text-gray-700">
                    Complete your Flow State Self-Assessment to identify how you experience flow and understand your current flow state.
                  </p>
                  
                  <Link href="/flow-assessment">
                    <Button className="bg-indigo-700 hover:bg-indigo-800">
                      Take Flow Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Step 3: Review your Star Report */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("report")}
              >
                <div className="flex items-center">
                  <ClipboardIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-indigo-700 font-medium">Review your Star Report</span>
                </div>
                {expandedSection === "report" ? (
                  <MinusIcon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              
              {expandedSection === "report" && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-4 text-sm text-gray-700">
                    Review your personalized Star Report to understand your strengths and growth areas.
                  </p>
                  
                  <Link href="/report">
                    <Button 
                      className="bg-indigo-700 hover:bg-indigo-800"
                      disabled={!user || user.progress < 67}
                    >
                      View Report
                    </Button>
                  </Link>
                  
                  {(!user || user.progress < 67) && (
                    <p className="mt-2 text-sm text-red-500">
                      Please complete the assessment first to access your report.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Step 4: Your Whiteboard Start Point */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("whiteboard")}
              >
                <div className="flex items-center">
                  <LayoutPanelLeftIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-indigo-700 font-medium">Your Whiteboard Start Point</span>
                </div>
                {expandedSection === "whiteboard" ? (
                  <MinusIcon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              
              {expandedSection === "whiteboard" && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-4 text-sm text-gray-700">
                    Access your team whiteboard exercises once you've completed your individual assessment.
                  </p>
                  
                  <Button 
                    className="bg-indigo-700 hover:bg-indigo-800"
                    disabled={true}
                  >
                    Coming Soon
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Star Card */}
          <div>
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h2 className="text-indigo-700 text-xl font-bold mb-2">Your Star Card</h2>
              <p className="text-gray-600 mb-4">
                Complete the activities on this page to build your Star Card. Once you've finished, download your 
                Star Card for use in the whiteboard activities.
              </p>
              
              <div className="flex flex-col items-center">
                {user && (
                  <StarCard 
                    profile={{
                      name: user.name || '',
                      title: user.title || '',
                      organization: user.organization || ''
                    }}
                    quadrantData={{
                      thinking: starCard?.thinking || 0,
                      acting: starCard?.acting || 0,
                      feeling: starCard?.feeling || 0,
                      planning: starCard?.planning || 0,
                      apexStrength: starCard?.apexStrength || 'Imagination'
                    }}
                    downloadable={false}
                    preview={true}
                  />
                )}
                
                <div className="mt-4">
                  <img 
                    src="/src/assets/all-star-teams-logo-250px.png" 
                    alt="AllStarTeams" 
                    className="h-6 w-auto opacity-75"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}