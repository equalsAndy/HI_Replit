import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useQuery } from '@tanstack/react-query';
import VideoTranscriptGlossary from '../common/VideoTranscriptGlossary';
import { trpc } from "@/utils/trpc";
import '@/styles/section-headers.css';

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
  
  // Fetch video from database using tRPC
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
  const [showJeopardyModal, setShowJeopardyModal] = useState(false);
  
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
            />
          ) : (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
              No video data found in database for workshop '{isImaginalAgility ? 'imaginal-agility' : 'allstarteams'}' step '{stepId}'
            </div>
          )}
        </div>

        {/* AST 1-1 sections: Purpose, Activities, Reflections */}
        <div className="section-headers-tabs-60 mt-16 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--purpose">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">🎯 Purpose</div>
          </div>
        </div>
        <div className="section-content-card-60 section-content-card-60--purpose relative">
          <div
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10"
            style={{ marginLeft: '-8px' }}
          >
            <div
              className="text-xs font-bold text-teal-600 bg-teal-50 px-0.5 py-1 rounded text-center"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}
            >
              🎯 Purpose
            </div>
          </div>
          <div className="section-content-card-60__strip" aria-hidden="true" />
          <div className="section-content-card-60__box">
            <p>Workshop overview and objectives</p>
          </div>
        </div>

        <div className="section-headers-tabs-60 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--activities">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">🧠 Activities</div>
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
              🧠 Activities
            </div>
          </div>
          <div className="section-content-card-60__strip" aria-hidden="true" />
          <div className="section-content-card-60__box">
            <ul className="list-disc ml-6">
              <li>Welcome video introduction</li>
              <li>Journey through strengths, flow, and potential visualization</li>
            </ul>
          </div>
        </div>

        <div className="section-headers-tabs-60 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--reflection">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">🤔 Reflections</div>
          </div>
        </div>
        <div className="section-content-card-60 section-content-card-60--reflection relative">
          <div
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10"
            style={{ marginLeft: '-8px' }}
          >
            <div
              className="text-xs font-bold text-rose-600 bg-rose-50 px-0.5 py-1 rounded text-center"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.1em' }}
            >
              🤔 Reflections
            </div>
          </div>
          <div className="section-content-card-60__strip" aria-hidden="true" />
          <div className="section-content-card-60__box">
            <p>What participants will discover about themselves</p>
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
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setShowJeopardyModal(true); }}
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

      {/* Self-Awareness Jeopardy Modal */}
      {showJeopardyModal && (
        <SelfAwarenessJeopardyModal onClose={() => setShowJeopardyModal(false)} />
      )}
    </>
  );
};

// Self-Awareness Jeopardy Modal Component
const SelfAwarenessJeopardyModal = ({ onClose }: { onClose: () => void }) => {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const categories = {
    'Communication': [
      'This skill helps you express your thoughts and feelings clearly to others.',
      'When you know your communication style, you can do this more effectively with teammates.',
      'This type of listening involves fully focusing on what the other person is saying.',
      'Being aware of your body language is part of this broader self-knowledge.',
      'This quality allows you to understand how your words affect others.'
    ],
    'Leadership': [
      'A leader with this quality knows their strengths and weaknesses.',
      'This type of leader can adapt their style based on what the situation needs.',
      'When you understand your values, you can lead with this quality.',
      'This skill helps leaders recognize and manage their emotions during difficult situations.',
      'A leader with this awareness can better understand and motivate their team members.'
    ],
    'Teamwork': [
      'Knowing your role and contribution style helps improve this group dynamic.',
      'This awareness helps you understand how your actions affect team morale.',
      'When you know your work preferences, you can better contribute to this collective effort.',
      'Understanding your conflict resolution style improves this team process.',
      'This knowledge helps you know when to lead and when to follow.'
    ],
    'Decision Making': [
      'Understanding your biases and assumptions improves this cognitive process.',
      'This awareness helps you recognize when emotions might be clouding your judgment.',
      'Knowing your values helps you make decisions with this quality.',
      'This skill involves understanding the consequences of your choices.',
      'Being aware of your decision-making patterns is part of this broader knowledge.'
    ],
    'Personal Growth': [
      'This practice involves regularly examining your thoughts, feelings, and behaviors.',
      'Understanding your learning style contributes to this lifelong process.',
      'This awareness helps you identify areas where you want to improve.',
      'Knowing your motivations and drivers supports this personal journey.',
      'This skill helps you set goals that align with your true values and interests.'
    ]
  };

  const handleCategoryClick = (category: string) => {
    setCurrentCategory(category);
    setGameStarted(true);
  };

  const handleQuestionClick = (question: string) => {
    setCurrentQuestion(question);
    setShowAnswer(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleBackToCategories = () => {
    setCurrentCategory(null);
    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  const handleBackToQuestions = () => {
    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1a237e',
        color: 'white',
        borderRadius: '8px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        width: '800px',
        overflow: 'hidden',
        position: 'relative',
        border: '3px solid #ffd700'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#3949ab',
          padding: '20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '2.5em',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            Self-Awareness Jeopardy!
          </h1>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px', minHeight: '400px' }}>
          {!gameStarted ? (
            // Welcome Screen
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.8em' }}>
                Welcome to Self-Awareness Jeopardy!
              </h2>
              <p style={{ fontSize: '1.2em', lineHeight: '1.6', marginBottom: '30px' }}>
                Test your knowledge about self-awareness and its importance in various aspects of life and work.
              </p>
              <p style={{ fontSize: '1.1em', marginBottom: '30px' }}>
                <strong>How to play:</strong><br />
                Choose a category, then select a question. Remember, the answer to every question is <em>"What is Self-Awareness?"</em>
              </p>
              <button
                onClick={() => setGameStarted(true)}
                style={{
                  backgroundColor: '#ffd700',
                  color: '#1a237e',
                  border: 'none',
                  padding: '15px 30px',
                  fontSize: '1.3em',
                  fontWeight: 'bold',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                Start Game
              </button>
            </div>
          ) : !currentCategory ? (
            // Category Selection
            <div>
              <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '30px', fontSize: '1.8em' }}>
                Choose a Category
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                {Object.keys(categories).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    style={{
                      backgroundColor: '#3949ab',
                      color: 'white',
                      border: '2px solid #ffd700',
                      padding: '20px',
                      fontSize: '1.1em',
                      fontWeight: 'bold',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#5e72e4';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#3949ab';
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Exit Game
                </button>
              </div>
            </div>
          ) : !currentQuestion ? (
            // Question Selection
            <div>
              <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '20px', fontSize: '1.8em' }}>
                {currentCategory}
              </h2>
              <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.1em' }}>
                Choose a question:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories[currentCategory as keyof typeof categories].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    style={{
                      backgroundColor: '#3949ab',
                      color: 'white',
                      border: '1px solid #ffd700',
                      padding: '15px',
                      fontSize: '1em',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#5e72e4';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#3949ab';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={handleBackToCategories}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  Back to Categories
                </button>
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Exit Game
                </button>
              </div>
            </div>
          ) : (
            // Question Display
            <div>
              <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '20px', fontSize: '1.8em' }}>
                {currentCategory}
              </h2>
              <div style={{
                backgroundColor: '#3949ab',
                padding: '30px',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '30px',
                border: '2px solid #ffd700'
              }}>
                <p style={{ fontSize: '1.3em', lineHeight: '1.5', margin: 0 }}>
                  {currentQuestion}
                </p>
              </div>
              
              {!showAnswer ? (
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={handleShowAnswer}
                    style={{
                      backgroundColor: '#ffd700',
                      color: '#1a237e',
                      border: 'none',
                      padding: '15px 30px',
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginBottom: '20px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    Show Answer
                  </button>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#2e7d32',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  border: '2px solid #4caf50'
                }}>
                  <h3 style={{ color: '#ffd700', margin: '0 0 10px 0', fontSize: '1.4em' }}>
                    What is Self-Awareness?
                  </h3>
                  <p style={{ margin: 0, fontSize: '1.1em' }}>
                    Self-awareness is the foundation that enables all of these improvements and capabilities!
                  </p>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={handleBackToQuestions}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  Back to Questions
                </button>
                <button
                  onClick={handleBackToCategories}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  Back to Categories
                </button>
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Exit Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;
