import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusIcon, MinusIcon, UserIcon, StarIcon, ClipboardIcon, LayoutPanelLeftIcon } from "lucide-react";
import StarCard from "@/components/starcard/StarCard";
import { QuadrantData, ProfileData } from "@shared/schema";

// Define the user type based on the app's data structure
interface UserType {
  id: number;
  name: string;
  title: string;
  organization: string;
  progress: number;
  avatarUrl?: string;
}

// Define the StarCard type
interface StarCardType {
  userId: number;
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  apexStrength: string;
  imageUrl?: string;
  id: number;
}

export default function UserHome() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    title: "",
    organization: ""
  });
  
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery<UserType | undefined>({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Get star card data
  const { data: starCard, isLoading: starCardLoading } = useQuery<StarCardType | undefined>({
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
          name: user?.name || "",
          title: user?.title || "",
          organization: user?.organization || ""
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
          <Link href="/" className="logo flex items-center cursor-pointer">
            <img 
              src="/src/assets/all-star-teams-logo-250px.png" 
              alt="AllStarTeams" 
              className="h-10 w-auto"
            />
          </Link>
          
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium">{user?.name}</span>
            <div className="flex items-center space-x-1 text-gray-600 border-l border-gray-300 pl-3">
              <span className="text-sm">English</span>
              <span className="text-xs">🇺🇸</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              className="rounded-md"
              onClick={async () => {
                try {
                  await apiRequest('POST', '/api/auth/logout', {});
                  window.location.href = '/auth';
                } catch (error) {
                  console.error("Logout failed:", error);
                }
              }}
            >
              Logout
            </Button>
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
                  {user && user.name && user.title && user.organization && (
                    <span className="ml-2 text-green-500 font-bold">✓</span>
                  )}
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
                  
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Star Card Image:</p>
                    <div className="flex items-start space-x-4">
                      <div className="w-24 h-24 overflow-hidden rounded-md border border-gray-300">
                        {starCard?.imageUrl ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={starCard.imageUrl} 
                              alt="Star Card Image" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                // Remove image
                                apiRequest('DELETE', '/api/upload/starcard', {})
                                  .then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
                                    toast({
                                      title: "Image removed",
                                      description: "Your Star Card image has been removed.",
                                    });
                                  })
                                  .catch(error => {
                                    toast({
                                      title: "Failed to remove image",
                                      description: String(error),
                                      variant: "destructive",
                                    });
                                  });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              type="button"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center">
                            <label htmlFor="profile-image-upload" className="cursor-pointer inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                              {starCard?.imageUrl ? 'Change Image' : 'Upload Image'}
                            </label>
                            <input 
                              id="profile-image-upload" 
                              type="file" 
                              accept="image/*" 
                              className="sr-only"
                              onChange={(e) => {
                                if (!e.target.files || !e.target.files[0]) return;
                                
                                const file = e.target.files[0];
                                const formData = new FormData();
                                formData.append('image', file);
                                
                                toast({
                                  title: "Uploading image...",
                                  description: "Please wait while your image is being uploaded.",
                                });
                                
                                fetch('/api/upload/starcard', {
                                  method: 'POST',
                                  body: formData,
                                })
                                  .then(response => response.json())
                                  .then(data => {
                                    queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
                                    toast({
                                      title: "Image uploaded",
                                      description: "Your Star Card image has been updated successfully.",
                                    });
                                    // Reset the input
                                    e.target.value = '';
                                  })
                                  .catch(error => {
                                    toast({
                                      title: "Failed to upload image",
                                      description: String(error),
                                      variant: "destructive",
                                    });
                                  });
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Upload a photo to personalize your Star Card. JPG, PNG, or GIF, max 5MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSaveProfile}>
                    <p className="text-red-500 mb-3 text-sm">
                      Enter your information to complete your profile
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Name:</label>
                        <Input 
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          placeholder="Your full name"
                          className="w-full"
                        />
                      </div>

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
                        {updateProfile.isPending ? "Updating..." : "Update Profile"}
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
                  {user && user.progress >= 20 && (
                    <span className="ml-2 text-green-500 font-bold">✓</span>
                  )}
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
                      src="https://www.youtube.com/embed/NzDxPRpBvUM" 
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
                  {user && user.progress >= 67 && (
                    <span className="ml-2 text-green-500 font-bold">✓</span>
                  )}
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
                    <Button className="bg-indigo-700 hover:bg-indigo-800">
                      Let's Go!
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
                  {user && user.progress >= 80 && (
                    <span className="ml-2 text-green-500 font-bold">✓</span>
                  )}
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
                    Flow is a state of complete immersion in an activity, characterized by energized focus, full involvement, 
                    and enjoyment in the process. Discover how to recognize and create more flow experiences in your work.
                  </p>
                  
                  <p className="mb-4 text-sm text-gray-700">
                    Learn about flow state, take the self-assessment, and reflect on how to create more flow in your daily work.
                  </p>
                  
                  <Link href="/find-your-flow">
                    <Button className="bg-indigo-700 hover:bg-indigo-800">
                      Find my Flow!
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Step 3: Visualize Yourself */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("visualize")}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-indigo-700 font-medium">Visualize Yourself</span>
                  {user && user.progress >= 90 && (
                    <span className="ml-2 text-green-500 font-bold">✓</span>
                  )}
                </div>
                {expandedSection === "visualize" ? (
                  <MinusIcon className="h-5 w-5 text-indigo-600" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              
              {expandedSection === "visualize" && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-4 text-sm text-gray-700">
                    Engage your imagination to visualize your future self, explore personal growth through the Ladder of Wellbeing, and create a vision of your potential.
                  </p>
                  
                  <Link href="/visualize-yourself">
                    <Button className="bg-indigo-700 hover:bg-indigo-800">
                      Start Visualization
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Step 4: Review your Star Report */}
            <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleSection("report")}
              >
                <div className="flex items-center">
                  <ClipboardIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-indigo-700 font-medium">Review your Star Report</span>
                  {user && user.progress >= 100 && (
                    <span className="ml-2 text-green-500 font-bold">✓</span>
                  )}
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
            
            {/* Step 5: Your Whiteboard Start Point */}
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
                <div className="flex justify-center" style={{ width: '400px', height: '555px' }}>
                  <StarCard 
                    profile={{
                      name: user?.name || "",
                      title: user?.title || "",
                      organization: user?.organization || ""
                    }}
                    quadrantData={{
                      thinking: (user?.progress >= 67 && starCard?.thinking) || 0,
                      acting: (user?.progress >= 67 && starCard?.acting) || 0,
                      feeling: (user?.progress >= 67 && starCard?.feeling) || 0,
                      planning: (user?.progress >= 67 && starCard?.planning) || 0,
                      apexStrength: (user?.progress >= 67 && starCard?.apexStrength) || "Imagination"
                    }}
                    imageUrl={starCard?.imageUrl || null}
                    downloadable={user?.progress >= 67 || false}
                    preview={false}
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