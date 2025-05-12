import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusIcon, MinusIcon, UserIcon, StarIcon, ClipboardIcon, LayoutPanelLeftIcon, Sparkles, Users } from "lucide-react";
import StarCard from "@/components/starcard/StarCard";
import { QuadrantData, ProfileData } from "@shared/schema";
import { useApplication } from "@/hooks/use-application";

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
  // Add YouTube API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { currentApp } = useApplication();

  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Selected imaginal content
  const [selectedContent, setSelectedContent] = useState<string>("introduction");

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

  // Determine app-specific styles and content
  const appStyles = {
    primaryColor: currentApp === 'allstarteams' ? 'indigo' : 'purple',
    primaryBgColor: currentApp === 'allstarteams' ? 'bg-indigo-600' : 'bg-purple-600',
    primaryTextColor: currentApp === 'allstarteams' ? 'text-indigo-700' : 'text-purple-700',
    primaryLightBgColor: currentApp === 'allstarteams' ? 'bg-indigo-100' : 'bg-purple-100',
    logo: currentApp === 'allstarteams' 
      ? '/src/assets/all-star-teams-logo-250px.png' 
      : '/src/assets/imaginal_agility_logo_nobkgrd.png',
    appName: currentApp === 'allstarteams' ? 'AllStarTeams' : 'Imaginal Agility'
  };

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
              src={appStyles.logo}
              alt={appStyles.appName}
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
              <h2 className={`${appStyles.primaryTextColor} text-xl font-bold`}>Hi, {user?.name}!</h2>
              <p className="text-gray-600">Use these steps to track progress.</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className={`${appStyles.primaryBgColor} h-4 rounded-full`} 
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
                  <UserIcon className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                  <span className={`${appStyles.primaryTextColor} font-medium`}>Complete your Profile</span>
                  {user && user.name && user.title && user.organization && (
                    <span className="ml-2 text-green-500 font-bold">✓</span>
                  )}
                </div>
                {expandedSection === "profile" ? (
                  <MinusIcon className={`h-5 w-5 ${appStyles.primaryTextColor}`} />
                ) : (
                  <PlusIcon className={`h-5 w-5 ${appStyles.primaryTextColor}`} />
                )}
              </div>

              {expandedSection === "profile" && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-4 text-sm text-gray-700">
                    {currentApp === 'allstarteams' 
                      ? 'This information builds your Star Badge.'
                      : 'This information will be used throughout your Imaginal Agility journey.'}
                  </p>

                  {currentApp === 'allstarteams' && (
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
                              <label htmlFor="profile-image-upload" className={`cursor-pointer inline-flex items-center rounded-md ${appStyles.primaryBgColor} px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}>
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
                  )}

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
                        <label className="block text-sm text-gray-700 mb-1">Organization:</label>
                        <Input 
                          name="organization"
                          value={profileData.organization}
                          onChange={handleProfileChange}
                          placeholder="Your company or organization"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button 
                        type="submit" 
                        className={`${appStyles.primaryBgColor} hover:${currentApp === 'allstarteams' ? 'bg-indigo-800' : 'bg-purple-800'}`}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? "Updating..." : "Update Profile"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* App-Specific Content */}
            {currentApp === 'imaginal-agility' ? (
              /* Imaginal Agility Steps */
              <>
                {/* Four Clickable Navigation Elements */}
                {/* Introduction to Imaginal Agility */}
                <div 
                  className={`border border-gray-200 rounded-md mb-4 bg-white overflow-hidden cursor-pointer ${selectedContent === 'introduction' ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setSelectedContent('introduction')}
                  data-content="introduction"
                >
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center">
                      <Sparkles className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Introduction to Imaginal Agility</span>
                      <span id="introduction-checkmark" className="ml-2 text-green-500 opacity-0 font-bold">✓</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* The Triple Challenge */}
                <div 
                  className={`border border-gray-200 rounded-md mb-4 bg-white overflow-hidden cursor-pointer ${selectedContent === 'challenge' ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setSelectedContent('challenge')}
                  data-content="challenge"
                >
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center">
                      <Sparkles className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>The Triple Challenge</span>
                      <span id="challenge-checkmark" className="ml-2 text-green-500 opacity-0 font-bold">✓</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* The Imaginal Agility Solution */}
                <div 
                  className={`border border-gray-200 rounded-md mb-4 bg-white overflow-hidden cursor-pointer ${selectedContent === 'solution' ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setSelectedContent('solution')}
                  data-content="solution"
                >
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center">
                      <Sparkles className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>The Imaginal Agility Solution</span>
                      <span id="solution-checkmark" className="ml-2 text-green-500 opacity-0 font-bold">✓</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Your 5 Capabilities (5Cs) */}
                <div 
                  className={`border border-gray-200 rounded-md mb-4 bg-white overflow-hidden cursor-pointer ${selectedContent === '5cs' ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setSelectedContent('5cs')}
                  data-content="5cs"
                >
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center">
                      <Sparkles className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Your 5 Capabilities (5Cs)</span>
                      <span id="5cs-checkmark" className="ml-2 text-green-500 opacity-0 font-bold">✓</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Imagination Assessment */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/imagination-assessment')}
                  >
                    <div className="flex items-center">
                      <Sparkles className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Take the Imagination Assessment</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* 5Cs Assessment */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/5cs-assessment')}
                  >
                    <div className="flex items-center">
                      <ClipboardIcon className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Complete the 5Cs Assessment</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Insights Dashboard */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/insights-dashboard')}
                  >
                    <div className="flex items-center">
                      <LayoutPanelLeftIcon className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Review Your Insights</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Team Workshop */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/team-workshop')}
                  >
                    <div className="flex items-center">
                      <Users className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Team Workshop</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              /* AllStarTeams Steps */
              <>
                {/* Step 2: Complete the Star Strengths Assessment */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/assessment')}
                  >
                    <div className="flex items-center">
                      <StarIcon className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Take the Star Strengths Assessment</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Step 3: Core Strengths */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/core-strengths')}
                  >
                    <div className="flex items-center">
                      <StarIcon className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Identify Your Core Strengths</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Step 4: Flow State Assessment */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/flow-assessment')}
                  >
                    <div className="flex items-center">
                      <ClipboardIcon className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Complete Flow Assessment</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Step 5: Round Out Your Star */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/rounding-out')}
                  >
                    <div className="flex items-center">
                      <StarIcon className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Round Out Your Star</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Step 6: Visualize Your Potential */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/visualize-yourself')}
                  >
                    <div className="flex items-center">
                      <ClipboardIcon className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Visualize Your Potential</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Step 7: Team Workshop */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/team-workshop')}
                  >
                    <div className="flex items-center">
                      <Users className={`h-5 w-5 ${appStyles.primaryTextColor} mr-2`} />
                      <span className={`${appStyles.primaryTextColor} font-medium`}>Team Workshop</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${appStyles.primaryTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Dynamic Content */}
          <div>
            {currentApp === 'imaginal-agility' ? (
              /* Imaginal Agility Content */
              <>
                {selectedContent === 'introduction' && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-purple-700 mb-4">Introduction to Imaginal Agility</h3>
                    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md mb-4">
                      <iframe 
                        src={`https://www.youtube.com/embed/1Belekdly70?enablejsapi=1${selectedContent === 'introduction' ? '&autoplay=1' : ''}`} 
                        className="w-full h-full" 
                        title="Introduction to Imaginal Agility"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        onLoad={(e) => {
                          // @ts-ignore
                          const player = new YT.Player(e.target, {
                            events: {
                              onStateChange: (event) => {
                                if (event.data === YT.PlayerState.ENDED) {
                                  // Update the corresponding nav item to show completion
                                  const navItem = document.querySelector(`[data-content="introduction"]`);
                                  if (navItem) {
                                    const checkmark = document.getElementById('introduction-checkmark');
                                    if (checkmark) {
                                      checkmark.classList.remove('opacity-0');
                                      checkmark.classList.add('text-green-500');
                                    }
                                  }
                                }
                              }
                            }
                          });
                        }}
                      ></iframe>
                    </div>
                    {selectedContent === 'introduction' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('challenge')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: The Triple Challenge
                        </Button>
                      </div>
                    )}
                    {selectedContent === 'challenge' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('solution')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: The Imaginal Agility Solution
                        </Button>
                      </div>
                    )}
                    {selectedContent === 'solution' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('5cs')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: Your 5 Capabilities (5Cs)
                        </Button>
                      </div>
                    )}
                    {selectedContent === '5cs' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => navigate('/imagination-assessment')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: Take the Imagination Assessment
                        </Button>
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Workshop Philosophy</h4>
                        <p className="text-gray-700">
                          Imaginal Agility is founded on the principle that human imagination becomes more critical—not less—in the age of artificial intelligence. This workshop will help you develop the capacity to envision possibilities beyond what technology alone can generate.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Learning Journey Overview</h4>
                        <p className="text-gray-700">
                          Your journey begins with understanding imagination as an innate human capability that can be systematically strengthened. Throughout this program, you'll progress through awareness, practice, and application of the five core capabilities that fuel Imaginal Agility.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Workshop Principles</h4>
                        <ul className="list-disc pl-5 text-gray-700 space-y-1">
                          <li>Everyone possesses natural imaginative capacities</li>
                          <li>These capabilities grow stronger with deliberate practice</li>
                          <li>The integration of all capabilities creates maximum impact</li>
                          <li>The goal is flourishing alongside technology, not competing with it</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Imagination in Practice</h4>
                        <p className="text-gray-700">
                          The most innovative organizations today don't just implement AI—they reimagine what's possible when human creativity works in concert with technological efficiency. This workshop prepares you to lead with that vision.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedContent === 'challenge' && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-purple-700 mb-4">The Triple Challenge</h3>
                    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md mb-4">
                      <iframe 
                        src={`https://www.youtube.com/embed/zIFGKPMN8t8?enablejsapi=1${selectedContent === 'challenge' ? '&autoplay=1' : ''}`}
                        className="w-full h-full" 
                        title="Module 1: The Triple Challenge"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        onLoad={(e) => {
                          // @ts-ignore
                          const player = new YT.Player(e.target, {
                            events: {
                              onStateChange: (event) => {
                                if (event.data === YT.PlayerState.ENDED) {
                                  const checkmark = document.getElementById('challenge-checkmark');
                                  if (checkmark) {
                                    checkmark.classList.remove('opacity-0');
                                    checkmark.classList.add('text-green-500');
                                  }
                                }
                              }
                            }
                          });
                        }}
                      ></iframe>
                    </div>
                    {selectedContent === 'introduction' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('challenge')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: The Triple Challenge
                        </Button>
                      </div>
                    )}
                    {selectedContent === 'challenge' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('solution')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: The Imaginal Agility Solution
                        </Button>
                      </div>
                    )}
                    {selectedContent === 'solution' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('5cs')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: Your 5 Capabilities (5Cs)
                        </Button>
                      </div>
                    )}
                    {selectedContent === '5cs' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => navigate('/imagination-assessment')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: Take the Imagination Assessment
                        </Button>
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Understanding the Challenge</h4>
                        <p className="text-gray-700">
                          The Triple Challenge represents interconnected threats to human potential in the AI era. Recognizing these patterns is the first step toward counteracting them in your personal and professional life.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Beyond Efficiency</h4>
                        <p className="text-gray-700">
                          While AI excels at optimization and efficiency, these alone don't create breakthrough innovations or meaningful human experiences. The real opportunity lies in developing the capabilities that AI cannot replicate—beginning with imagination.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">The Hidden Costs</h4>
                        <p className="text-gray-700">
                          Organizations focused exclusively on AI implementation often experience unexpected downsides: diminished creative thinking, reduced psychological safety, and growing disengagement. These are symptoms of Psychological Debt—a deficit that grows when efficiency is prioritized over imagination.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Challenge as Opportunity</h4>
                        <p className="text-gray-700">
                          These challenges aren't reasons to reject technology, but invitations to develop the distinctly human capabilities that give technology meaning and direction. The most successful individuals and organizations will be those who balance both.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedContent === 'solution' && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-purple-700 mb-4">The Imaginal Agility Solution</h3>
                    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md mb-4">
                      <iframe 
                        src={`https://www.youtube.com/embed/BLh502BlZLE?enablejsapi=1${selectedContent === 'solution' ? '&autoplay=1' : ''}`}
                        className="w-full h-full" 
                        title="Module 2: The Imaginal Agility Solution"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        onLoad={(e) => {
                          // @ts-ignore
                          const player = new YT.Player(e.target, {
                            events: {
                              onStateChange: (event) => {
                                if (event.data === YT.PlayerState.ENDED) {
                                  const checkmark = document.getElementById('solution-checkmark');
                                  if (checkmark) {
                                    checkmark.classList.remove('opacity-0');
                                    checkmark.classList.add('text-green-500');
                                  }
                                }
                              }
                            }
                          });
                        }}
                      ></iframe>
                    </div>
                    {selectedContent === 'introduction' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('challenge')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: The Triple Challenge
                        </Button>
                      </div>
                    )}
                    {selectedContent === 'challenge' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('solution')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: The Imaginal Agility Solution
                        </Button>
                      </div>
                    )}
                    {selectedContent === 'solution' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('5cs')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: Your 5 Capabilities (5Cs)
                        </Button>
                      </div>
                    )}
                    {selectedContent === '5cs' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => navigate('/imagination-assessment')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: Take the Imagination Assessment
                        </Button>
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">The Core Approach</h4>
                        <p className="text-gray-700">
                          Imaginal Agility is the ability to perceive complex situations clearly and respond effectively through intentional awareness. Unlike temporary skills that quickly become obsolete, this capacity becomes more valuable as change accelerates.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Beyond Technical Training</h4>
                        <p className="text-gray-700">
                          While most AI training focuses on technical adoption, Imaginal Agility addresses the deeper adaptive challenge: developing the human capabilities that complement—rather than compete with—artificial intelligence.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Research Foundation</h4>
                        <p className="text-gray-700">
                          Research confirms that organizations that cultivate imagination and intentional thinking experience greater innovation, resilience, and employee engagement. This isn't just good for humans—it's good for business.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">From Challenge to Capability</h4>
                        <p className="text-gray-700">
                          By transforming potential AI-related disruptions into developmental opportunities, you'll build enduring human capacities that fuel innovation, resilience, and meaningful work—regardless of technological changes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedContent === '5cs' && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-purple-700 mb-4">Your 5 Capabilities (5Cs)</h3>
                    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md mb-4">
                      <iframe 
                        src={`https://www.youtube.com/embed/8wXSL3om6Ig?enablejsapi=1${selectedContent === '5cs' ? '&autoplay=1' : ''}`}
                        className="w-full h-full" 
                        title="Module 3: Your 5Cs"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        onLoad={(e) => {
                          // @ts-ignore
                          const player = new YT.Player(e.target, {
                            events: {
                              onStateChange: (event) => {
                                if (event.data === YT.PlayerState.ENDED) {
                                  const checkmark = document.getElementById('5cs-checkmark');
                                  if (checkmark) {
                                    checkmark.classList.remove('opacity-0');
                                    checkmark.classList.add('text-green-500');
                                  }
                                }
                              }
                            }
                          });
                        }}
                      ></iframe>
                    </div>
                    {selectedContent === 'introduction' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('challenge')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: The Triple Challenge
                        </Button>
                      </div>
                    )}
                    {selectedContent === 'challenge' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('solution')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: The Imaginal Agility Solution
                        </Button>
                      </div>
                    )}
                    {selectedContent === 'solution' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => setSelectedContent('5cs')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: Your 5 Capabilities (5Cs)
                        </Button>
                      </div>
                    )}
                    {selectedContent === '5cs' && (
                      <div className="flex justify-end mb-4">
                        <Button 
                          onClick={() => navigate('/imagination-assessment')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Next: Take the Imagination Assessment
                        </Button>
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">The 5Cs Framework</h4>
                        <p className="text-gray-700">
                          These five capabilities form the foundation of Imaginal Agility. While each is powerful independently, they create exponential impact when developed together. Think of them as different facets of the same diamond—each reflecting and amplifying the others.
                        </p>
                        <ul className="list-disc pl-5 mt-3 mb-3 text-gray-700 space-y-2">
                          <li><strong>Imagination</strong>: The ability to envision new possibilities</li>
                          <li><strong>Curiosity</strong>: An openness to exploring and questioning</li>
                          <li><strong>Empathy</strong>: Understanding perspectives beyond your own</li>
                          <li><strong>Creativity</strong>: Finding novel solutions to complex problems</li>
                          <li><strong>Courage</strong>: Taking bold action in the face of uncertainty</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">Capabilities in Context</h4>
                        <p className="text-gray-700">
                          Unlike technical skills that may become obsolete, these capabilities grow more valuable over time. They enhance your ability to learn, adapt, and create meaning in any context—especially in collaboration with AI and other technologies.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">The Imagination Advantage</h4>
                        <p className="text-gray-700">
                          Organizations with high Imaginal Agility don't just adapt to change—they envision and create preferred futures. By developing these capabilities, you become an architect of possibility rather than simply responding to circumstances.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-purple-700 mb-2">From Individual to Collective</h4>
                        <p className="text-gray-700">
                          As you strengthen these capabilities, you'll notice their impact extends beyond your individual work. Teams with high collective Imaginal Agility solve problems more creatively, navigate complexity more effectively, and find greater meaning in their shared purpose.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* AllStarTeams Content */
              <>
                {starCard ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-indigo-700 mb-3">Your Star Card</h3>
                      <p className="text-gray-600 mb-4">
                        This visualization shows your unique combination of strengths across four dimensions:
                        Thinking, Feeling, Acting, and Planning.
                      </p>
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <StarCard 
                          thinking={starCard.thinking}
                          acting={starCard.acting}
                          feeling={starCard.feeling}
                          planning={starCard.planning}
                          apexStrength={starCard.apexStrength}
                          userName={user?.name || ""}
                          userTitle={user?.title || ""}
                          userOrg={user?.organization || ""}
                          imageUrl={starCard.imageUrl}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-indigo-700 mb-3">Your Apex Strength: {starCard.apexStrength}</h3>
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <p className="text-gray-700 mb-4">
                          Your apex strength is in the <strong>{starCard.apexStrength}</strong> quadrant. 
                          This means you naturally excel at:
                        </p>

                        {starCard.apexStrength === "Thinking" && (
                          <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Analyzing complex information</li>
                            <li>Strategic thinking and problem-solving</li>
                            <li>Developing innovative insights</li>
                            <li>Conceptual reasoning and systems thinking</li>
                          </ul>
                        )}

                        {starCard.apexStrength === "Acting" && (
                          <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Taking decisive action</li>
                            <li>Leading initiatives and driving results</li>
                            <li>Adapting quickly to changing circumstances</li>
                            <li>Being resourceful and pragmatic</li>
                          </ul>
                        )}

                        {starCard.apexStrength === "Feeling" && (
                          <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Building strong relationships</li>
                            <li>Empathizing with others</li>
                            <li>Creating harmonious team environments</li>
                            <li>Understanding and managing emotions effectively</li>
                          </ul>
                        )}

                        {starCard.apexStrength === "Planning" && (
                          <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>Creating organized systems and processes</li>
                            <li>Maintaining attention to detail</li>
                            <li>Developing clear plans and following through</li>
                            <li>Ensuring reliability and consistency</li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">Discover Your Star Profile</h3>
                    <p className="text-gray-700 mb-4">
                      Welcome to the All-Star Teams workshop! Through this journey, you'll discover your 
                      unique strengths profile and learn how to leverage it in your professional life.
                    </p>
                    <p className="text-gray-700 mb-4">
                      Start by completing your profile, then take the Star Strengths Assessment to 
                      uncover your natural aptitudes across four dimensions: Thinking, Feeling, Acting, and Planning.
                    </p>
                    <div className="aspect-video rounded-lg overflow-hidden shadow-md mb-4">
                      <iframe 
                        src="https://www.youtube.com/embed/1Belekdly70" 
                        className="w-full h-full" 
                        title="Introduction to All-Star Teams Workshop"
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="text-gray-700">
                      The assessment takes about 10-15 minutes to complete. Your results will help you 
                      understand your unique combination of strengths and how to leverage them effectively.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}