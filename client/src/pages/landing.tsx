import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { Play, CheckCircle2, Brain, Activity, HeartPulse, Rocket, Users2, Sparkles } from "lucide-react";
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import AllStarTeamsLogo from '../assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '../assets/imaginal_agility_logo_nobkgrd.png';
import { VideoModal } from '@/components/ui/video-modal';

// ===== Feature list helper & style toggle =====
type FeatureListVariant =
  | "grid"
  | "check"
  | "numbered"
  | "cards"
  | "checkHeadline"
  | "split"
  | "badge"
  | "illustrated"
  | "timeline";

// Flip this between "grid" | "check" | "numbered" | "cards" to preview styles quickly, or use ?variant= in URL.
const FEATURE_LIST_VARIANT: FeatureListVariant = ((): FeatureListVariant => {
  try {
    const params = new URLSearchParams(window.location.search);
    const v = (params.get("variant") || "").toLowerCase();
    const allowed = [
      "grid", "check", "numbered", "cards", "checkheadline", "split", "badge", "illustrated", "timeline"
    ];
    if (allowed.includes(v)) {
      // Map kebab/camel in URL to exact union literal where needed
      if (v === "checkheadline") return "checkHeadline";
      return v as FeatureListVariant;
    }
  } catch {}
  return "check";
})();
function pickIconByTitle(title: string) {
  const t = title.toLowerCase();
  if (t.includes("awareness") || t.includes("imagination")) return Brain;
  if (t.includes("flow")) return Activity;
  if (t.includes("wellbeing") || t.includes("well-being") || t.includes("well being")) return HeartPulse;
  if (t.includes("growth") || t.includes("future")) return Rocket;
  if (t.includes("team")) return Users2;
  if (t.includes("ai")) return Sparkles;
  return CheckCircle2;
}

function FeatureList({
  items,
  color,
  variant = FEATURE_LIST_VARIANT,
}: {
  items: { title: string; text?: string }[];
  color: "indigo" | "purple";
  variant?: FeatureListVariant;
}) {
  const colorMap =
    color === "indigo"
      ? { icon: "text-indigo-600", chip: "bg-indigo-100", num: "text-indigo-600" }
      : { icon: "text-purple-600", chip: "bg-purple-100", num: "text-purple-600" };

  // 1) Check + Title Headline
  if (variant === "checkHeadline") {
    return (
      <ul role="list" className="space-y-4">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 className={`h-6 w-6 ${colorMap.icon} mt-1`} />
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">{it.title}</h4>
              {it.text && <p className="text-gray-700 text-sm leading-relaxed">{it.text}</p>}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // 2) Two-Column Split (spec sheet style)
  if (variant === "split") {
    return (
      <ul role="list" className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="grid grid-cols-[auto,1fr] gap-4 items-start">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-5 w-5 ${colorMap.icon}`} />
              <span className="font-semibold text-gray-900">{it.title}</span>
            </div>
            {it.text && <p className="text-gray-700 text-sm leading-relaxed">{it.text}</p>}
          </li>
        ))}
      </ul>
    );
  }

  // 3) Badge style (chips)
  if (variant === "badge") {
    return (
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 shadow-sm bg-gray-50">
            <CheckCircle2 className={`h-4 w-4 ${colorMap.icon}`} />
            <span className="font-semibold text-gray-900">{it.title}</span>
            {it.text && <span className="sr-only"> — {it.text}</span>}
          </li>
        ))}
      </ul>
    );
  }

  // 4) Illustrated features (icon per benefit)
  if (variant === "illustrated") {
    return (
      <ul role="list" className="space-y-3">
        {items.map((it, i) => {
          const Icon = pickIconByTitle(it.title);
          return (
            <li key={i} className="flex items-start gap-3">
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${colorMap.chip}`}>
                <Icon className={`h-4 w-4 ${colorMap.icon}`} />
              </span>
              <span className="text-gray-700 leading-relaxed">
                <span className="font-semibold">{it.title}</span>
                {it.text ? <> {it.text}</> : null}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  // 5) Timeline / step path
  if (variant === "timeline") {
    return (
      <ul role="list" className="relative ml-4 space-y-5">
        <span className="absolute left-0 top-2 bottom-2 w-px bg-gray-200" aria-hidden="true"></span>
        {items.map((it, i) => (
          <li key={i} className="relative pl-6">
            <span className={`absolute -left-2 top-1.5 h-3 w-3 rounded-full ${colorMap.icon.replace('text-','bg-')}`} aria-hidden="true"></span>
            <h4 className="font-semibold text-gray-900">{it.title}</h4>
            {it.text && <p className="text-gray-700 text-sm leading-relaxed">{it.text}</p>}
          </li>
        ))}
      </ul>
    );
  }

  if (variant === "numbered") {
    return (
      <ol role="list" className="space-y-4">
        {items.map((it, i) => (
          <li key={i} className="flex gap-4">
            <span className={`text-2xl font-bold ${colorMap.num}`}>{i + 1}.</span>
            <span className="text-gray-700 leading-relaxed">
              <span className="font-semibold">{it.title}</span>
              {it.text ? <> {it.text}</> : null}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  if (variant === "check") {
    return (
      <ul role="list" className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden="true"
              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${colorMap.chip}`}
            >
              <CheckCircle2 className={`h-4 w-4 ${colorMap.icon}`} />
            </span>
            <span className="text-gray-700 leading-relaxed">
              <span className="font-semibold">{it.title}</span>
              {it.text ? <> {it.text}</> : null}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (variant === "cards") {
    return (
      <ul role="list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((it, i) => (
          <li key={i} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <CheckCircle2 className="h-4 w-4 text-gray-700" />
                </span>
                {/* Force title to one line; full text on hover via title attr */}
                <h4 className="font-semibold text-gray-800 text-base whitespace-nowrap truncate" title={it.title}>
                  {it.title}
                </h4>
              </div>
              {it.text && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {it.text}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // Default: "grid" (Option 3)
  return (
    <ul role="list" className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <CheckCircle2 className={`h-5 w-5 ${colorMap.icon} mt-1`} />
          <span className="text-gray-700 leading-relaxed">
            <span className="font-semibold">{it.title}</span>
            {it.text ? <> {it.text}</> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
// ===== End helper =====

export default function Landing() {
  const [, navigate] = useLocation();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // Enforce Auth0 login redirect for unauthenticated users
  const { isAuthenticated: auth0IsAuthenticated, loginWithRedirect } = useAuth0();
  useEffect(() => {
    if (!auth0IsAuthenticated) loginWithRedirect();
  }, [auth0IsAuthenticated, loginWithRedirect]);
  if (!auth0IsAuthenticated) return null;

  // Check if user is already authenticated via app session
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: Infinity,
    refetchInterval: false,
    retry: false // Don't retry if authentication fails
  });

  const user = userData?.user;
  const isAuthenticated = !!user;

  // Redirect authenticated users to appropriate location
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user is admin, redirect to admin dashboard
      if (user.role === 'admin') {
        navigate('/admin');
        return;
      }

      // For other users, redirect to their last completed step in the most recent workshop
      if (user.navigationProgress) {
        try {
          const progress = JSON.parse(user.navigationProgress);
          const appType = progress.appType;
          const completedSteps = progress.completedSteps || [];
          const currentStepId = progress.currentStepId;

          // Determine the redirect path based on app type and progress
          if (appType === 'ast' || appType === 'allstarteams') {
            // Set session storage for AllStarTeams
            sessionStorage.setItem('selectedApp', 'ast');
            
            // If user has progress, go to AllStarTeams workshop
            if (completedSteps.length > 0 || currentStepId) {
              navigate('/allstarteams');
            } else {
              // No progress yet, redirect to workshop start
              navigate('/auth?app=ast');
            }
          } else if (appType === 'ia' || appType === 'imaginal-agility') {
            // Set session storage for Imaginal Agility
            sessionStorage.setItem('selectedApp', 'imaginal-agility');
            
            // If user has progress, go to Imaginal Agility workshop
            if (completedSteps.length > 0 || currentStepId) {
              navigate('/imaginal-agility');
            } else {
              // No progress yet, redirect to workshop start
              navigate('/auth?app=imaginal-agility');
            }
          } else {
            // No app type specified, redirect based on user type
            if (user.isTestUser) {
              navigate('/testuser');
            } else {
              navigate('/');
            }
          }
        } catch (error) {
          console.error('Error parsing navigation progress:', error);
          // Fallback based on user type
          if (user.isTestUser) {
            navigate('/testuser');
          } else {
            navigate('/');
          }
        }
      } else {
        // No navigation progress, redirect based on user type
        if (user.isTestUser) {
          navigate('/testuser');
        } else {
          navigate('/');
        }
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo flex items-center">
            <img 
              src={HiLogo} 
              alt="Heliotrope Imaginal"
              className="h-10 w-auto"
            />
          </div>
          
          {/* Login button removed for production test */}
          <div className="flex items-center space-x-3">
            {/* <Link href="/auth">
              <Button variant="outline" size="sm" className="rounded-md">Login</Button>
            </Link> */}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Welcome to the Heliotrope Imaginal Workshops
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Transformative learning experiences grounded in research-backed psychology and neuroscience, drawing from thousands of years of human wisdom.
            </p>
          </div>

          {/* Login and Invite Buttons - Moved Above Cards */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md text-lg font-semibold"
                onClick={() => {
                  window.location.href = '/auth';
                }}
              >
                Login
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-md text-lg font-semibold"
                onClick={() => {
                  window.location.href = '/register';
                }}
              >
                I have an invite code
              </Button>
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AllStarTeams Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow h-full">
                <div className="p-8 h-full flex flex-col">
                  <div className="flex justify-center mb-6">
                    <img 
                      src={AllStarTeamsLogo} 
                      alt="AllStarTeams" 
                      className="h-16 w-auto"
                    />
                  </div>
                  <div className="text-center mb-6">
                    <p className="text-lg font-semibold text-indigo-600 mb-4">Individual & Team Workshop</p>
                  </div>
                  
                  <FeatureList
                    color="indigo"
                    items={[
                      { title: "Build Self-Awareness", text: "through five strengths: imagining, thinking, planning, acting, and feeling." },
                      { title: "Identify Flow State", text: "when performing at your peak and recreate it on demand." },
                      { title: "Enhance Wellbeing", text: "by reflecting on your current state and how to reach an optimal one." },
                      { title: "Envision Future Growth", text: "to activate deep learning and development." },
                      { title: "Build Exceptional Teams", text: "through strengths-based fusion mapping and mutual understanding." },
                      { title: "Humanistic AI", text: "provides supplementary coaching and analytics." },
                    ]}
                  />
                </div>
              </div>

              {/* Imaginal Agility Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow h-full">
                <div className="p-8 h-full flex flex-col">
                  <div className="flex justify-center mb-6">
                    <img 
                      src={ImaginalAgilityLogo} 
                      alt="Imaginal Agility" 
                      className="h-16 w-auto"
                    />
                  </div>
                  <div className="text-center mb-6">
                    <p className="text-lg font-semibold text-purple-600 mb-4">Individual & Team Workshop</p>
                  </div>
                  
                  <FeatureList
                    color="purple"
                    items={[
                      { title: "Develop Your Imagination", text: "as a core strategic capability for growth and change." },
                      { title: "Learn The I4C Model", text: "to enhance your curiosity, caring, creativity, and courage." },
                      { title: "Climb the Ladder of Imagination", text: "through structured visioning and creative problem-solving." },
                      { title: "Elevate Your HaiQ", text: "(Human-AI Collaboration Quotient) for the future workforce." },
                      { title: "Grow Return on Imagination", text: "(ROI 2.0) at scale across teams and organizations." },
                      { title: "Humanistic AI", text: "provides supplementary coaching and analytics." },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Video Introduction Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">See what our workshops are all about!</h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                Experience the transformative power of our workshops and discover how they can help unlock your team's full potential.
              </p>
              
              <Button
                size="lg"
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md text-lg font-semibold inline-flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                Watch Workshop Overview
              </Button>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Heliotrope Imaginal's Platform?</h3>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Our science-backed assessments and workshops have helped thousands of professionals 
              and teams unlock their full potential through personalized insights and guided growth.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 Heliotrope Imaginal. All rights reserved.</p>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId="LkoL6MErRkg"
        title="Workshop Overview Video"
      />
    </div>
  );
}
