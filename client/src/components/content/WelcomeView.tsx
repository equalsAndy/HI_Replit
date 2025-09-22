import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUnifiedWorkshopNavigation } from '@/hooks/useUnifiedWorkshopNavigation';
import { useQuery } from '@tanstack/react-query';
import VideoTranscriptGlossary from '../common/VideoTranscriptGlossary';
import { trpc } from "@/utils/trpc";
import '@/styles/section-headers.css';
import { Check, X, Play } from 'lucide-react';
import JeopardySelfAwarenessGame from './JeopardySelfAwarenessGame';
// import organizationalChallengesImg from '@/assets/graphics/organizational-challenges-diagram.png';

interface WelcomeViewProps {
  currentContent: string;
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
  starCard?: any;
  isImaginalAgility?: boolean;
  triggerWelcomeVideo?: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  isImaginalAgility = false,
  triggerWelcomeVideo
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

  // Welcome video functionality for replay (passed as prop)
  
  // Fetch video from database using tRPC (single video for backwards compatibility)
  const { data: videoData, isLoading: videoLoading, error } = trpc.lesson.byStep.useQuery({
    workshop: isImaginalAgility ? 'imaginal-agility' : 'allstarteams',
    stepId: stepId,
  }, {
    staleTime: 0, // Force fresh fetch
    cacheTime: 0, // Don't cache results
  });

  // Debug logging
  console.log('🎬 WelcomeView tRPC query:', {
    workshop: isImaginalAgility ? 'imaginal-agility' : 'allstarteams',
    stepId: stepId,
    videoLoading,
    error: error?.message,
    videoData: videoData ? {
      workshop: videoData.workshop,
      stepId: videoData.stepId,
      youtubeId: videoData.youtubeId,
      title: videoData.title,
      transcriptMd: videoData.transcriptMd ? 'HAS_TRANSCRIPT' : 'NO_TRANSCRIPT',
      glossary: videoData.glossary ? `HAS_GLOSSARY(${videoData.glossary.length})` : 'NO_GLOSSARY'
    } : 'NO_VIDEO_DATA'
  });
  
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  
  // Get navigation progress using the unified hook
  const navigation = useUnifiedWorkshopNavigation(isImaginalAgility ? 'ia' : 'ast');
  const { 
    updateVideoProgress,
    markStepCompleted: navMarkStepCompleted
  } = navigation;

  // Simplified mode: Next button always active for video steps
  useEffect(() => {
    setHasReachedMinimum(true);
    console.log(`🎬 SIMPLIFIED MODE: Next button always active for video step ${stepId}`);
  }, [stepId]);
  const title = isImaginalAgility 
    ? "Welcome to Imaginal Agility Workshop" 
    : isStudentOrFacilitator 
      ? "Welcome to AllStarTeams 5-Week Program"
      : "The Self-Awareness Gap";

  const description = isImaginalAgility
    ? null // IA content will be rendered separately in the main content area
    : isStudentOrFacilitator
      ? "Welcome to AllStarTeams - a new kind of workshop designed just for you! This is where your personal strengths meet your future goals."
      : "Self-awareness is a core human asset and the foundation for trust, collaboration, and growth. This Microcourse Workshop offers a practical way to enhance individual and team self-awareness.";

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
    : "Next: The Self-Awareness Opportunity";

  const nextContentId = isImaginalAgility
    ? "ia-2-1"
    : "self-awareness-opp";

  // Track last logged progress to prevent spam
  const lastLoggedProgressRef = useRef(0);
  
  // Testing bypass disabled - use proper video completion validation
  const [allowTestingBypass, setAllowTestingBypass] = useState(false);
  
  // Calculate start time for video resume based on current progress
  const calculateStartTime = (): number => {
    const videoProgress = navigation.getVideoProgress(stepId) || 0;
    
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
      console.log(`🔍 Available functions:`, { 
        hasPropsMarkCompleted: !!markStepCompleted, 
        hasNavMarkCompleted: !!navMarkStepCompleted 
      });
      
      if (markStepCompleted) {
        console.log(`🎯 Calling PROPS markStepCompleted(${stepId})`);
        await markStepCompleted(stepId);
        console.log(`✅ Step ${stepId} marked complete via props, navigating to ${nextContentId}`);
      } else if (navMarkStepCompleted) {
        console.log(`🎯 Calling UNIFIED HOOK markStepCompleted(${stepId})`);
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


  return (
    <>
      <h1 id="content-title" className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>

      {/* Play Welcome Video Again Link - Only for AST */}
      {!isImaginalAgility && triggerWelcomeVideo && (
        <div className="mb-6">
          <button
            onClick={triggerWelcomeVideo}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            <Play className="h-4 w-4" />
            Play welcome video again
          </button>
        </div>
      )}

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
          {videoLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading video...</span>
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-900">
              <strong>Error loading video from database:</strong> {error.message}
              <br />
              <small>Workshop: {isImaginalAgility ? 'imaginal-agility' : 'allstarteams'}, Step: {stepId}</small>
            </div>
          ) : videoData ? (
            <VideoTranscriptGlossary
              youtubeId={videoData.youtubeId}
              title={videoData.title}
              transcriptMd={videoData.transcriptMd}
              glossary={videoData.glossary ?? []}
              forceUrl={forceUrl}
              startTime={calculateStartTime()}
              onProgress={handleVideoProgress}
            />
          ) : (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
              No video data found in database for workshop '{isImaginalAgility ? 'imaginal-agility' : 'allstarteams'}' step '{stepId}'
              <br />
              <small>Falling back to default video: {fallbackUrl}</small>
              <VideoTranscriptGlossary
                youtubeId={fallbackUrl}
                title={videoTitle}
                transcriptMd=""
                glossary={[]}
                forceUrl={forceUrl}
                startTime={calculateStartTime()}
                onProgress={handleVideoProgress}
              />
            </div>
          )}
        </div>

        {/* AST 1-1 sections: Content, Activities, Reflections */}
        <div className="section-headers-tabs-60 mt-16 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--content">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">📚 Some Things to Know</div>
          </div>
        </div>
        {/* Graphics Cards Container - Side by side on wide screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* First Content Card - Organizational Challenges Diagram */}
          <div className="section-content-card-60 section-content-card-60--content relative h-full">
            <div
              className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10"
              style={{ marginLeft: '-8px' }}
            >
              <div
                className="text-xs font-bold text-purple-600 bg-purple-50 px-0.5 py-1 rounded text-center"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}
              >
                📚 Some Things to Know
              </div>
            </div>
            <div className="section-content-card-60__strip" aria-hidden="true" />
            <div className="section-content-card-60__box h-full">
              <div className="flex flex-col items-center justify-center h-[420px] py-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Here's What Happens Without Self-Awareness</h3>
                <div className="w-full max-w-lg flex justify-center flex-grow items-center">
                  <img 
                    src="/assets/organizational-challenges-diagram.png" 
                    alt="Organizational challenges diagram showing relational, individual, and organizational levels" 
                    className="w-full h-auto rounded-lg shadow-sm max-h-[300px] object-contain"
                    style={{ maxWidth: '115%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Second Content Card - Ben Franklin Quote */}
          <div className="section-content-card-60 section-content-card-60--content relative h-full">
            <div
              className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10"
              style={{ marginLeft: '-8px' }}
            >
              <div
                className="text-xs font-bold text-purple-600 bg-purple-50 px-0.5 py-1 rounded text-center"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}
              >
                📚 Some Things to Know
              </div>
            </div>
            <div className="section-content-card-60__strip" aria-hidden="true" />
            <div className="section-content-card-60__box h-full">
              <div className="flex flex-col items-center justify-center h-[420px] py-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Self-Awareness is Not Easy</h3>
                <div className="w-full max-w-lg flex justify-center flex-grow items-center">
                  <img 
                    src="/assets/ben-franklin-quote.png" 
                    alt="Ben Franklin quote" 
                    className="w-full h-auto rounded-lg shadow-sm max-h-[300px] object-contain"
                    style={{ maxWidth: '115%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Content Card - What Is NOT Self-Awareness */}
        <div className="section-content-card-60 section-content-card-60--content relative">
          <div
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10"
            style={{ marginLeft: '-8px' }}
          >
            <div
              className="text-xs font-bold text-purple-600 bg-purple-50 px-0.5 py-1 rounded text-center"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}
            >
              📚 Content
            </div>
          </div>
          <div className="section-content-card-60__strip" aria-hidden="true" />
          <div className="section-content-card-60__box">
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
                <span className="mr-2">❌</span>
                What Is NOT Self-Awareness
              </h3>
              <p className="text-red-700 mb-4 text-sm italic">
                According to researcher Tasha Eurich, many people mistake these behaviors for genuine self-awareness:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-red-800">Endless Introspection:</strong>
                    <span className="text-red-700"> Overanalyzing feelings and asking "why" questions traps people in rumination without offering actionable insight.</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-red-800">Self-Loathing or Self-Consciousness:</strong>
                    <span className="text-red-700"> Being overly focused on flaws or anxious about self-image is not true self-awareness.</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-red-800">Focusing Only on Internal Thoughts:</strong>
                    <span className="text-red-700"> Genuine self-awareness balances internal knowledge with external awareness of how others see you.</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-red-800">Ignoring Feedback:</strong>
                    <span className="text-red-700"> Not seeking or integrating how others perceive your actions means missing half of self-awareness.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">
                  <span className="mr-2">✅</span>
                  <strong>True Self-Awareness:</strong> The will and skill to understand both who you are (internal) and how others see you (external), using this balanced insight to take actionable, positive steps forward.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-headers-tabs-60 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--activities">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">🧠 Activity</div>
          </div>
        </div>
        <div className="section-content-card-60 section-content-card-60--activities relative">
          <div
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10"
            style={{ marginLeft: '-8px' }}
          >
            <div
              className="text-xs font-bold text-amber-600 bg-amber-50 px-0.5 py-1 rounded text-center"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}
            >
              🧠 Activity
            </div>
          </div>
          <div className="section-content-card-60__strip" aria-hidden="true" />
          <div className="section-content-card-60__box">
            <JeopardySelfAwarenessGame />
          </div>
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
              /* Content removed as requested */
              <></>
            )}
          </>
        )}

        <div className="flex justify-end items-center space-x-4">
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