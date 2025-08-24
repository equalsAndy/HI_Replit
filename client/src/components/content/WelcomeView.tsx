import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useQuery } from '@tanstack/react-query';
import VideoPlayer from './VideoPlayer';

interface WelcomeViewProps {
  currentContent: string;
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
  starCard?: any;
  isImaginalAgility?: boolean;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  isImaginalAgility = false
}) => {
  // Get user data for content customization
  const { data: userData, isLoading: userLoading } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      role?: string;
      contentAccess?: string;
      isTestUser: boolean;
    }
  }>({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent auth loop
  });
  const userRole = userData?.user?.role;
  const contentAccess = userData?.user?.contentAccess;
  // Check contentAccess first (for admin/facilitator interface toggle), then fall back to role
  const isStudentContent = contentAccess === 'student' || userRole === 'student';
  const isStudentOrFacilitator = isStudentContent || userRole === 'facilitator';
  
  // Debug logging
  console.log('🔍 WelcomeView Debug:');
  console.log('- userData:', userData);
  console.log('- userRole:', userRole);
  console.log('- isStudentOrFacilitator:', isStudentOrFacilitator);
  
  // Different content based on which app is active
  const stepId = isImaginalAgility ? "ia-1-1" : "1-1";
  
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  
  // Get navigation progress using the main hook
  const { 
    progress: navigationProgress, 
    updateVideoProgress,
    markStepCompleted: navMarkStepCompleted
  } = useNavigationProgress();

  // Simplified mode: Next button always active for video steps
  useEffect(() => {
    setHasReachedMinimum(true);
    console.log(`🎬 SIMPLIFIED MODE: Next button always active for video step ${stepId}`);
  }, [stepId]);
  const title = isImaginalAgility 
    ? "Welcome to Imaginal Agility Workshop" 
    : isStudentOrFacilitator 
      ? "Welcome to AllStarTeams 5-Week Program"
      : "Welcome to AllStarTeams Workshop";

  const description = isImaginalAgility
    ? null // IA content will be rendered separately in the main content area
    : isStudentOrFacilitator
      ? "Welcome to AllStarTeams - a new kind of workshop designed just for you! This is where your personal strengths meet your future goals."
      : "Welcome to the AllStarTeams workshop! Through this journey, you'll discover your unique strengths profile and learn how to leverage it in your professional life.";

  const fallbackUrl = isImaginalAgility 
    ? "https://youtu.be/JxdhWd8agmE" 
    : "https://youtu.be/pp2wrqE8r2o";

  // For students/facilitators, force the student video URL
  const forceUrl = isStudentOrFacilitator && !isImaginalAgility 
    ? "https://www.youtube.com/watch?v=oHG4OJQtZ4g"
    : undefined;

  const videoTitle = isImaginalAgility
    ? "Imaginal Agility Workshop Introduction"
    : "AllStarTeams Workshop Introduction";

  const nextButton = isImaginalAgility
    ? "Next: The Triple Challenge"
    : "Next: Intro to Star Strengths";

  const nextContentId = isImaginalAgility
    ? "ia-2-1"
    : "intro-strengths";

  // Track last logged progress to prevent spam
  const lastLoggedProgressRef = useRef(0);
  
  // Testing bypass disabled - use proper video completion validation
  const [allowTestingBypass, setAllowTestingBypass] = useState(false);
  
  // Calculate start time for video resume based on current progress
  const calculateStartTime = (): number => {
    const videoProgress = navigationProgress?.videoProgress?.[stepId] || 0;
    
    // Convert percentage to seconds (assuming average video duration of 150 seconds)
    // Only resume if progress is between 5% and 95% to avoid edge cases
    const progressNumber = typeof videoProgress === 'number' ? videoProgress : 0;
    if (progressNumber >= 5 && progressNumber < 95) {
      const startTimeSeconds = (progressNumber / 100) * 150;
      console.log(`🎬 WelcomeView: Resuming from ${progressNumber}% = ${startTimeSeconds} seconds`);
      return startTimeSeconds;
    }
    
    return 0; // Start from beginning
  };

  // Simplified linear progression: Next button always active for video steps
  const isStepComplete = (): boolean => {
    console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);
    console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
    return true;
  };
  
  // Handle video progress updates
  const handleVideoProgress = (percentage: number) => {
    // Only log significant progress changes (every 10% or initial threshold)
    if (Math.abs(percentage - lastLoggedProgressRef.current) >= 10 || 
        (percentage >= 1 && !hasReachedMinimum)) {
      console.log(`🎬 WelcomeView video progress: ${percentage.toFixed(2)}%`);
      lastLoggedProgressRef.current = percentage;
    }
    
    // Update navigation progress tracking with actual percentage
    console.log(`🎬 WelcomeView calling updateVideoProgress(${stepId}, ${percentage})`);
    updateVideoProgress(stepId, percentage);
    
    // Check if minimum watch requirement is met (5%)
    if (percentage >= 5 && !hasReachedMinimum) {
      console.log(`🎬 WelcomeView: Minimum threshold reached at ${percentage.toFixed(2)}%`);
      setHasReachedMinimum(true);
    }
  };

  // Handle completion and progression
  const handleNext = async () => {
    try {
      console.log(`🚀 Next button clicked for step: ${stepId}`);
      
      // Try both markStepCompleted functions - props first, then navigation hook
      if (markStepCompleted) {
        await markStepCompleted(stepId);
        console.log(`✅ Step ${stepId} marked complete via props, navigating to ${nextContentId}`);
      } else if (navMarkStepCompleted) {
        await navMarkStepCompleted(stepId);
        console.log(`✅ Step ${stepId} marked complete via navigation hook, navigating to ${nextContentId}`);
      } else {
        console.log(`⚠️ No markStepCompleted function available`);
  }

      
      if (setCurrentContent) {
        setCurrentContent(nextContentId);
        // Scroll to content title anchor when navigating to next content
        setTimeout(() => {
          const anchor = document.getElementById('content-title');
          if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
  } catch (error) {
    console.error(`❌ Error completing step ${stepId}:`, error);
  }
};

// Load Self‑Awareness Jeopardy widget script
useEffect(() => {
  const s = document.createElement('script');
  s.src = '/static/self-awareness-jeopardy-modal.js';
  s.async = true;
  document.body.appendChild(s);
  return () => { document.body.removeChild(s); };
}, []);

  return (
    <>
      <h1 id="content-title" className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>

      <div className="prose max-w-none">
        {!isImaginalAgility && !isStudentOrFacilitator && (
          <p className="text-lg text-gray-700 mb-6">
            {description}
          </p>
        )}
        
        {!isImaginalAgility && isStudentOrFacilitator && (
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-6">
              {description}
            </p>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm mb-6">
              <p className="text-base text-gray-700 mb-4">
                Over the next five weeks, you'll take a journey that's all about self-awareness, imagination, and developing real-life skills. This is your space where you'll discover your core strengths, understand what helps you thrive, and imagine the kind of future you want.
              </p>
              <p className="text-base text-gray-700">
                Every part of this course is about building insight that lasts for life - for work and for the teams you'll join.
              </p>
            </div>
          </div>
        )}

        {/* YouTube Video Player */}
        <div className="mb-8 max-w-4xl mx-auto">
          <VideoPlayer
            workshopType={isImaginalAgility ? "imaginal-agility" : "allstarteams"}
            stepId={stepId}
            fallbackUrl={fallbackUrl}
            forceUrl={forceUrl}
            title={videoTitle}
            aspectRatio="16:9"
            autoplay={true}
            onProgress={handleVideoProgress}
            startTime={calculateStartTime()}
          />
        </div>

        {isImaginalAgility ? (
          <>
            <div className="text-base text-gray-700 space-y-4 mb-8">
              <p>Welcome.</p>
              
              <p>Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.</p>
              
              <p>As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.</p>
              
              <p>This Micro Course is your starting point.</p>
              
              <p>You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.</p>
              
              <p>It's the first step in building Imaginal Agility — a skillset for navigating change, solving problems, and creating value.</p>
              
              <p>Next, you'll meet with your team to turn fresh insight into shared breakthroughs.</p>
              
              <p>You're not just learning about imagination. You're harnessing it — together.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Workshop Philosophy</h2>
              <p className="text-base text-gray-700 mb-6">
                Imaginal Agility is founded on the principle that human imagination becomes
                more critical—not less—in the age of artificial intelligence. This workshop will
                help you develop the capacity to envision possibilities beyond what
                technology alone can generate.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Learning Journey Overview</h2>
              <p className="text-base text-gray-700 mb-6">
                Your journey begins with understanding imagination as an innate human
                capability that can be systematically strengthened. Throughout this program,
                you'll progress through awareness, practice, and application of the five core
                capabilities that fuel Imaginal Agility.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Workshop Principles</h2>
              <ul className="space-y-3 mb-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-base text-gray-700">Everyone possesses natural imaginative capacities</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-base text-gray-700">These capabilities grow stronger with deliberate practice</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-base text-gray-700">The integration of all capabilities creates maximum impact</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                  <span className="text-base text-gray-700">The goal is flourishing alongside technology, not competing with it</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm mb-8">
              <h2 className="text-xl font-semibold text-purple-700 mb-4">Imagination in Practice</h2>
              <p className="text-base text-gray-700 mb-4">
                The most innovative organizations today don't just implement AI—they
                reimagine what's possible when human creativity works in concert with
                technology.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Student Content - 5 Week Program Outline */}
            {isStudentOrFacilitator ? (
              <>
                <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm mb-8">
                  <h2 className="text-2xl font-semibold text-blue-700 mb-6">Your 5-Week Journey</h2>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Week 1: Discover Your Star Strengths</h3>
                      <p className="text-gray-700">Take your Star Strengths self-assessment and discover your core strengths across imagination, thinking, planning, feeling, and acting.</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Week 2: Identify Your Flow</h3>
                      <p className="text-gray-700">Discover when you feel and perform at your best. Complete your digital Star Card with your flow qualities.</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Week 3: Reflect on Well-being</h3>
                      <p className="text-gray-700">Explore your personal growth and well-being through guided reflection exercises.</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Week 4: Visualize Your Future Self</h3>
                      <p className="text-gray-700">Create a vision of who you're becoming. Select images that reflect your goals, energy, and dream life.</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Week 5: Team Up and Apply</h3>
                      <p className="text-gray-700">Join your team for a live facilitated session where you'll apply everything you've learned together.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm mb-8">
                  <h2 className="text-xl font-semibold text-blue-700 mb-4">What You'll Receive</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">Your personalized Digital Star Card - ready for download</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">A personalized AI report summarizing your strengths, flow, and vision</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 mr-3 flex-shrink-0"></div>
                      <span className="text-base text-gray-700">A completion badge you can share on LinkedIn and with future employers</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-blue-200 shadow-sm mb-8">
                  <h2 className="text-xl font-semibold text-blue-700 mb-4">Remember</h2>
                  <p className="text-base text-gray-700 mb-4">
                    This isn't about perfection - it's about courage, reflection, and practice. Take it one step at a time. Each part builds on the last.
                  </p>
                  <p className="text-base text-gray-700 font-medium">
                    This is your path forward, and it starts now.
                  </p>
                </div>
              </>
            ) : (
              /* Original Adult Content */
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">PART I: INDIVIDUAL MICRO COURSE (SELF-GUIDED)</h2>
                <p className="text-lg text-gray-700 mb-4">
                  This self-paced experience is an opportunity for reflection and self-expression. Through several guided exercises and self-assessments, you will:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">Discover your Star Strengths</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">Identify your Flow State</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">Visualize your Professional Growth</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Takeaways:</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">A personalized Digital Star Card</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">A personalized AI Holistic Profile Report</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">Readiness for High-Impact Teamwork Practice</span>
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">PART II: TEAMWORK PRACTICE (FACILITATED)</h2>
                <p className="text-lg text-gray-700 mb-6">
                  Join your teammates in a guided session where you'll bring your insights to life.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Together, you'll align your strengths, deepen collaboration, and practice in real time using a shared digital whiteboard.
                </p>
              </>
            )}
          </>
        )}

        <div className="flex justify-end items-center space-x-4">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.SAJ?.open(); }}
            className="text-blue-600 underline"
          >
            Open Self‑Awareness Jeopardy
          </a>
          <Button
            onClick={handleNext}
            disabled={!isStepComplete() && !allowTestingBypass}
            className={`${(isStepComplete() || allowTestingBypass)
              ? (isImaginalAgility ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            size="lg"
          >
            {(isStepComplete() || allowTestingBypass) ? nextButton : "Watch video to continue (5% minimum)"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default WelcomeView;
