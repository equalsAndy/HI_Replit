import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '@/shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

import hokusaiWaveImage from '@assets/image_1747799995641.png';
import hokusaiPortraitImage from '@assets/image_1747800012190.png';
import ladderGraphic from '@assets/image_1747800627533.png';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const { updateVideoProgress } = useNavigationProgress();
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  
  const [oneYearVision, setOneYearVision] = useState<string>('');
  const [challenges, setChallenges] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [resourcesNeeded, setResourcesNeeded] = useState<string>('');
  const [actionSteps, setActionSteps] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const stepId = "4-4";
  const videoId = "_VsH5NO9jyg";

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.log('Error destroying player:', error);
        }
      }
    };
  }, [videoId]);

  // Track video progress
  const startProgressTracking = (playerInstance: any) => {
    let interval: NodeJS.Timeout;
    
    const trackProgress = () => {
      if (playerInstance && playerInstance.getCurrentTime && playerInstance.getDuration) {
        try {
          const currentTime = playerInstance.getCurrentTime();
          const duration = playerInstance.getDuration();
          
          if (duration > 0) {
            const percentage = (currentTime / duration) * 100;
            handleVideoProgress(percentage);
          }
        } catch (error) {
          console.log('Video progress tracking error:', error);
        }
      }
    };

    // Track progress every second
    interval = setInterval(trackProgress, 1000);
    
    // Clean up interval when component unmounts
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  };

  // Handle video progress updates
  const handleVideoProgress = (percentage: number) => {
    setVideoProgress(percentage);
    updateVideoProgress(stepId, percentage);
    
    // Check if minimum watch requirement is met (1%)
    if (percentage >= 1 && !hasReachedMinimum) {
      setHasReachedMinimum(true);
    }
  };

  // Initialize YouTube player
  const initializePlayer = () => {
    if (window.YT && window.YT.Player && playerRef.current) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            startProgressTracking(event.target);
          },
          onStateChange: (event: any) => {
            // Handle player state changes if needed
          }
        }
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await apiRequest('/api/visualization', 'POST', {
        oneYearVision,
        challenges,
        strengths,
        resourcesNeeded,
        actionSteps
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      markStepCompleted('4-2');
      setCurrentContent('recap');
    } catch (error) {
      console.error('Error saving future self data:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Future Self</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-gray-700">
          Take a few minutes to reflect on the future you're working toward. 
          These questions will help you imagine your life over time — and the 
          kind of person, teammate, and leader you want to become. There are 
          no right answers. Just be honest and thoughtful.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-3/5 bg-gray-50 p-6 rounded-lg border">
          <div className="aspect-w-16 aspect-h-9">
            <div className="w-full h-64 rounded border border-gray-200 bg-black">
              <div 
                ref={playerRef}
                className="w-full h-full rounded-lg"
                style={{ pointerEvents: 'auto', position: 'relative' }}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium text-gray-900">Katsushika Hokusai</span> is a renowned Japanese ukiyo-e artist who lived during the 18th Century.
            </p>
            <p className="text-sm text-gray-800 italic">
              "From the age of 6 I had a mania for drawing the shapes of things.
              When I was 50 I had published a universe of designs. But all I have done before the the age of 70 is not worth bothering with. At
              75 I'll have learned something of the pattern of nature, of animals, of plants, of trees, birds, fish and insects. When I am 80 you will 
              see real progress. At 90 I shall have cut my way deeply into the mystery of life itself. At 100, I shall be a marvelous artist. At 110, 
              everything I create; a dot, a line, will jump to life as never before.
              <br /><br />
              To all of you who are going to live as long as I do, I promise to keep my word. I am writing this in my old age. I used to call 
              myself Hokusai, but today I sign my self 'The Old Man Mad About Drawing.'"
              <span className="block mt-1 font-medium text-right">— Hokusai Katsushika</span>
            </p>
          </div>
        </div>
        
        <div className="md:w-2/5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <img 
              src={hokusaiWaveImage} 
              alt="The Great Wave off Kanagawa by Hokusai" 
              className="w-full h-auto rounded border border-gray-200"
            />
            <img 
              src={hokusaiPortraitImage} 
              alt="Portrait of Hokusai" 
              className="w-full h-auto rounded border border-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
        <h3 className="text-lg font-medium text-indigo-900 mb-2">Purpose</h3>
        <p className="text-sm text-indigo-800">
          This exercise honors every participant's infinite capacity for growth. 
          Whether someone is 22 or 82, the focus remains on continuing evolution, 
          deepening wisdom, and creating one's masterpiece. The most meaningful 
          futures are not constrained by time but expanded by purpose.
        </p>
        <p className="text-sm text-indigo-800 mt-2">
          Remember Hokusai's wisdom - every decade brings new insight, sharper vision, 
          and deeper connection to your life's work. The canvas of your future self 
          has no boundaries.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Where do you see yourself in 5, 10, and 20 years?</h3>
          <Textarea 
            placeholder="Your answer"
            value={oneYearVision}
            onChange={(e) => setOneYearVision(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">What does your life look like when optimized for flow?</h3>
          <Textarea 
            placeholder="Your answer"
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            When picturing a happy third stage of life, what will you have achieved and still want to achieve?
          </h3>
          <Textarea 
            placeholder="Your answer"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Final Reflection</h3>
          <p className="text-sm text-gray-700 mb-3">
            Look back at your answers. Now write a short paragraph (3-5 sentences) that brings them together. Your vision statement should describe your future self in a way that inspires you — who you are, what you value, and how you want to live and lead.
          </p>
          <p className="text-sm text-gray-600 mb-3">
            You can start with:
          </p>
          <p className="text-sm text-gray-600 mb-1">"In the future, I see myself..."</p>
          <p className="text-sm text-gray-600 mb-1">"My purpose is to..."</p>
          <p className="text-sm text-gray-600 mb-3">"I am becoming someone who..."</p>
          <Textarea 
            placeholder="Your answer"
            value={resourcesNeeded}
            onChange={(e) => setResourcesNeeded(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Final Reflection: Your Next Step</h2>
          <p className="text-gray-700 mb-3">
            You've just completed a personal discovery journey — from identifying your core strength
            to envisioning your future self.
          </p>
          <p className="text-gray-700 mb-4">
            You've seen how your strengths (especially imagination) operate at their best, and how
            your well-being shapes your potential. Now, take a moment to name one insight or
            intention you want to carry forward — as preparation for deeper team practice ahead.
          </p>
          
          <Textarea 
            placeholder="One insight I'm taking forward is..."
            value={actionSteps}
            onChange={(e) => setActionSteps(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <div className="w-3/4 max-w-[250px] mb-6">
            <img 
              src={ladderGraphic} 
              alt="Development Ladder" 
              className="w-full h-auto"
            />
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">What This Ladder Represents</h3>
            
            <h4 className="font-medium text-gray-800">A Natural Progression</h4>
            <p className="text-sm text-gray-700 mb-3">
              Each step builds on the one before — not in leaps, but in deepening awareness.
            </p>
            
            <h4 className="font-medium text-gray-800">Reflective Mirror</h4>
            <p className="text-sm text-gray-700 mb-3">
              This journey wasn't about adding something new. It was about surfacing what's already
              strong within you.
            </p>
            
            <h4 className="font-medium text-gray-800">Team Flow Starts Here</h4>
            <p className="text-sm text-gray-700">
              Your self-awareness is your starting point. Now you're ready to contribute with clarity and
              imagination.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving || !hasReachedMinimum}
          className={`${
            hasReachedMinimum && !saving
              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
              : "bg-gray-300 cursor-not-allowed text-gray-500"
          }`}
        >
          {saving ? 'Saving...' : 'Complete'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default FutureSelfView;