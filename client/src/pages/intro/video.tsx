import React from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

export default function IntroductionVideo() {
  const [_, navigate] = useLocation();
  const { markStepCompleted } = useNavigationProgress();
  
  const handleComplete = () => {
    markStepCompleted('1-1');
    navigate('/discover-strengths/intro');
  };

  // Load Jeopardy modal script on mount
  React.useEffect(() => {
    const s = document.createElement('script');
    s.src = '/static/self-awareness-jeopardy-modal.js';
    s.async = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);
  
  return (
    <MainContainer stepId="1-1">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-3">Discover Your Star Power</h1>
          <p className="text-xl text-purple-600 font-medium">Unlock what makes you exceptional at work</p>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-0 overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <iframe 
                src="https://www.youtube.com/embed/lcjao1ob55A?enablejsapi=1"
                title="AllStarTeams Workshop Introduction"
                className="w-full h-full rounded-lg" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-bold text-lg text-purple-800 mb-2">Discover</h3>
              <p className="text-sm text-gray-600">Take the assessment & reveal your Star Profile</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🌊</div>
              <h3 className="font-bold text-lg text-blue-800 mb-2">Flow</h3>
              <p className="text-sm text-gray-600">Find when you're naturally in the zone</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-bold text-lg text-green-800 mb-2">Launch</h3>
              <p className="text-sm text-gray-600">Apply your strengths where they matter most</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6 mb-8 border border-purple-100">
          <p className="text-center text-gray-700">
            <span className="font-semibold text-purple-800">15 minutes</span> to complete the assessment • 
            <span className="font-semibold text-purple-800">Lifetime</span> of insights
          </p>
        </div>
        
        <div className="flex justify-end items-center space-x-4">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.SAJ?.open(); }}
            className="text-blue-600 underline"
          >
            Open Self‑Awareness Jeopardy
          </a>
          <Button 
            onClick={handleComplete}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            Continue to Strengths Introduction
          </Button>
        </div>
      </div>
    </MainContainer>
  );
}
