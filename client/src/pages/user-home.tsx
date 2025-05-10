import { useState } from "react";
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
                {/* The Triple Challenge */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">The Triple Challenge</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe 
                          src="https://www.youtube.com/embed/1Belekdly70" 
                          className="w-full h-full" 
                          title="Module 1: The Triple Challenge"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    <div className="lg:w-1/2">
                      <p className="text-gray-700 mb-3">
                        We face three interconnected challenges today: technological disruption, 
                        organizational complexity, and environmental pressures.
                      </p>
                      <p className="text-gray-700">
                        Understanding these challenges is the first step to developing the 
                        agility needed to navigate them effectively.
                      </p>
                    </div>
                  </div>
                </div>

                {/* The Imaginal Agility Solution */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">The Imaginal Agility Solution</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe 
                          src="https://www.youtube.com/embed/1Belekdly70" 
                          className="w-full h-full" 
                          title="Module 2: The Imaginal Agility Solution"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    <div className="lg:w-1/2">
                      <p className="text-gray-700 mb-3">
                        Imaginal Agility is the ability to perceive complex situations clearly and 
                        respond effectively through intentional awareness and purposeful action.
                      </p>
                      <p className="text-gray-700">
                        This module explores how developing these capabilities can help you thrive 
                        in rapidly changing environments and create innovative solutions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Your 5Cs */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">Your 5Cs</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe 
                          src="https://www.youtube.com/embed/1Belekdly70" 
                          className="w-full h-full" 
                          title="Module 3: Your 5Cs"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    <div className="lg:w-1/2">
                      <p className="text-gray-700 mb-3">
                        The 5Cs framework consists of five interconnected capabilities that form 
                        the foundation of Imaginal Agility.
                      </p>
                      <p className="text-gray-700">
                        Understanding and developing these capabilities will help you navigate 
                        complexity and create meaningful change.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Getting Started */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">Getting Started</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe 
                          src="https://www.youtube.com/embed/1Belekdly70" 
                          className="w-full h-full" 
                          title="Module 4: Getting Started"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    <div className="lg:w-1/2">
                      <p className="text-gray-700 mb-3">
                        Ready to begin your Imaginal Agility journey? This introduction will guide you 
                        through the assessment process and what to expect.
                      </p>
                      <p className="text-gray-700">
                        The assessment will help you understand your current capabilities and 
                        identify areas for growth and development.
                      </p>
                    </div>
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
                {/* Learn about your Strengths */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/assessment')}
                  >
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-indigo-700 font-medium">Take the Star Assessment</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Find your Flow State */}
                <div className="border border-gray-200 rounded-md mb-4 bg-white overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer"
                    onClick={() => navigate('/flow-assessment')}
                  >
                    <div className="flex items-center">
                      <ClipboardIcon className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-indigo-700 font-medium">Find your Flow State</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column */}
          <div>
            {currentApp === 'allstarteams' ? (
              <StarCard 
                profile={{
                  name: user?.name || '',
                  title: user?.title || '',
                  organization: user?.organization || '',
                  avatarUrl: user?.avatarUrl
                }}
                quadrantData={{
                  thinking: starCard?.thinking || 0,
                  acting: starCard?.acting || 0, 
                  feeling: starCard?.feeling || 0,
                  planning: starCard?.planning || 0,
                  apexStrength: starCard?.apexStrength || '',
                }}
                imageUrl={starCard?.imageUrl}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-purple-800">Imaginal Agility</h2>

                {/* Section 1: Introduction */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">Introduction to Imaginal Agility</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe 
                          src="https://www.youtube.com/embed/1Belekdly70" 
                          className="w-full h-full" 
                          title="Introduction to Imaginal Agility"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    <div className="lg:w-1/2">
                      <p className="text-gray-700 mb-3">
                        Welcome to your Imaginal Agility journey. This program will help you cultivate 
                        essential human capabilities that AI cannot replicate.
                      </p>
                      <p className="text-gray-700">
                        Through the 5Cs framework - Imagination, Curiosity, Empathy, Creativity, and Courage - 
                        you'll develop the skills needed to navigate complex challenges and create innovative solutions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* The Triple Challenge */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">The Triple Challenge</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe 
                          src="https://www.youtube.com/embed/1Belekdly70" 
                          className="w-full h-full" 
                          title="Module 1: The Triple Challenge"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    <div className="lg:w-1/2">
                      <p className="text-gray-700 mb-3">
                        We face three interconnected challenges today: technological disruption, 
                        organizational complexity, and environmental pressures.
                      </p>
                      <p className="text-gray-700">
                        Understanding these challenges is the first step to developing the 
                        agility needed to navigate them effectively.
                      </p>
                    </div>
                  </div>
                </div>

                {/* The Imaginal Agility Solution */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">The Imaginal Agility Solution</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe 
                          src="https://www.youtube.com/embed/1Belekdly70" 
                          className="w-full h-full" 
                          title="Module 2: The Imaginal Agility Solution"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    <div className="lg:w-1/2">
                      <p className="text-gray-700 mb-3">
                        Imaginal Agility is the ability to perceive complex situations clearly and 
                        respond effectively through intentional awareness and purposeful action.
                      </p>
                      <p className="text-gray-700">
                        This module explores how developing these capabilities can help you thrive 
                        in rapidly changing environments and create innovative solutions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Your 5Cs */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">Your 5Cs</h3>
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe 
                          src="https://www.youtube.com/embed/1Belekdly70" 
                          className="w-full h-full" 
                          title="Module 3: Your 5Cs"
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    <div className="lg:w-1/2">
                      <p className="text-gray-700 mb-3">
                        The 5Cs framework consists of five interconnected capabilities:
                      </p>
                      <ul className="space-y-1 mb-3">
                        <li className="flex items-center">
                          <span className="mr-2 h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 font-semibold text-xs">1</span>
                          <span className="text-gray-700 text-sm">Imagination - Conceiving what doesn't yet exist</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 font-semibold text-xs">2</span>
                          <span className="text-gray-700 text-sm">Curiosity - Openness to new perspectives</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 font-semibold text-xs">3</span>
                          <span className="text-gray-700 text-sm">Empathy - Understanding others' experiences</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 font-semibold text-xs">4</span>
                          <span className="text-gray-700 text-sm">Creativity - Bringing new ideas into existence</span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 font-semibold text-xs">5</span>
                          <span className="text-gray-700 text-sm">Courage - Taking action despite uncertainty</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}