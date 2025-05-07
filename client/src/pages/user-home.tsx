import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusIcon, MinusIcon, UserIcon, StarIcon, ClipboardIcon, LayoutPanelLeftIcon } from "lucide-react";

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
            
            {/* Step 2: Complete an Assessment */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("assessment")}
              >
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-indigo-700 font-medium">Complete an Assessment</span>
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
                    Start your assessment to discover your unique strengths and talents.
                  </p>
                  
                  <Link href="/assessment">
                    <Button className="bg-indigo-700 hover:bg-indigo-800">
                      Begin Assessment
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
              
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="text-center font-bold text-lg mb-4">Star Card</h3>
                
                <div className="flex items-center mb-4">
                  <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center mr-3">
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">Name: {user?.name || 'Your Name'}</p>
                    <p className="text-sm text-gray-600">Title: {user?.title || 'title'}</p>
                    <p className="text-sm text-gray-600">Organization: {user?.organization || 'company'}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center mb-4">
                  <p className="text-sm text-gray-600 text-center mb-1">Imagination</p>
                  <p className="text-xs text-gray-500 text-center mb-3">Your Apex Strength</p>
                  
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full border-2 border-gray-300 w-14 h-14 flex items-center justify-center">
                        <StarIcon className="h-8 w-8 text-gray-300" />
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs text-gray-500">Core</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-1 mb-6">
                  <div className="bg-gray-200 p-2 text-center">
                    <p className="text-xs font-bold">THINKING</p>
                    <p className="text-xs">{starCard?.thinking || 0}%</p>
                  </div>
                  <div className="bg-gray-200 p-2 text-center">
                    <p className="text-xs font-bold">ACTING</p>
                    <p className="text-xs">{starCard?.acting || 0}%</p>
                  </div>
                  <div className="bg-gray-200 p-2 text-center">
                    <p className="text-xs font-bold">PLANNING</p>
                    <p className="text-xs">{starCard?.planning || 0}%</p>
                  </div>
                  <div className="bg-gray-200 p-2 text-center">
                    <p className="text-xs font-bold">FEELING</p>
                    <p className="text-xs">{starCard?.feeling || 0}%</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
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