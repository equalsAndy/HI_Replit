import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import ImaginalAgilityRadarChart from './ImaginalAgilityRadarChart';
import imaginalAgilityLogo from '@assets/imaginal_agility_logo_nobkgrd.png';


// Component for ia-4-1 Assessment step
const ImaginalAgilityAssessmentContent: React.FC<{ onOpenAssessment?: () => void }> = ({ onOpenAssessment }) => {
  // Check if assessment is completed
  const { data: assessmentData } = useQuery({
    queryKey: ['/api/assessments/imaginal-agility'],
    retry: false
  });

  const isAssessmentCompleted = assessmentData && (assessmentData as any).data !== null;

  return (
    <div className="prose max-w-none">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-700">Self-Assessment</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-2xl">
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <iframe 
                src="https://www.youtube.com/embed/Xdn8lkSzTZU" 
                title="Self-Assessment" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-lg shadow-md"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-lg text-gray-700 space-y-4">
        <p>As organizations face what Deloitte identifies as an "imagination deficit" in the AI era, robust imagination self-assessment becomes essential for maintaining human creative agency and fostering transformative innovation capacity.</p>
        
        <p>This Self-Assessment helps participants to reflect on their five core capabilities essential for personal growth, team synergy, and collaborative intelligence:</p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>Imagination</li>
          <li>Curiosity</li>
          <li>Empathy</li>
          <li>Creativity</li>
          <li>Courage</li>
        </ul>
        
        <p>Your responses will generate a visual radar map for reflection and use in the Teamwork Practice Session. The process should take about 10–15 minutes.</p>
        
        <div className="mt-8">
          {isAssessmentCompleted ? (
            <Button 
              onClick={() => window.location.href = '/imaginal-agility/ia-5-1'}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Next: Assessment Results
            </Button>
          ) : (
            <Button 
              onClick={onOpenAssessment}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Start Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ImaginalAgilityContentProps {
  stepId: string;
  onNext?: () => void;
  onOpenAssessment?: () => void;
  assessmentResults?: any;
  user?: any;
}

const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({
  stepId,
  onNext,
  onOpenAssessment,
  assessmentResults,
  user
}) => {


  const renderStepContent = () => {
    switch (stepId) {
      case 'ia-1-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            {/* Step Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">
                Introduction to Imaginal Agility
              </h1>
            </div>
            
            {/* Video Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-2xl">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/k3mDEAbUwZ4" 
                      title="Introduction to Imaginal Agility" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-lg shadow-md"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <p className="text-xl font-medium text-purple-700 mb-6">Welcome.</p>
                
                <p className="text-lg leading-relaxed">
                  Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.
                </p>
                
                <p className="text-lg leading-relaxed">
                  As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.
                </p>
                
                <p className="text-lg leading-relaxed font-medium text-purple-700">
                  This Micro Course is your starting point.
                </p>
                
                <p className="text-lg leading-relaxed">
                  You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.
                </p>
                
                <p className="text-lg leading-relaxed">
                  It's the first step in building Imaginal Agility — a skillset for navigating change, solving problems, and creating value.
                </p>
                
                <p className="text-lg leading-relaxed">
                  Next, you'll meet with your team to turn fresh insight into shared breakthroughs.
                </p>
                
                <p className="text-xl font-medium text-purple-700 pt-4">
                  You're not just learning about imagination. You're harnessing it — together.
                </p>
              </div>
              
              {/* Next Button */}
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => onNext && onNext('ia-2-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  Next: The Triple Challenge
                </Button>
              </div>
            </div>
          </div>
        );

      case 'ia-2-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            {/* Step Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">
                The Triple Challenge
              </h1>
            </div>
            
            {/* Video Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-2xl">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/EsExXeKFiKg" 
                      title="The Triple Challenge" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-lg shadow-md"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <p className="text-lg leading-relaxed mb-8">
                  As artificial intelligence accelerates, it's causing a serious decline in human cognition seen in three cascading challenges. The first step in addressing a challenge is acknowledging it exists. It's now on the radar screen and may no longer be ignored.
                </p>
                
                {/* Triple Challenge Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-xl">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-red-800">Metacognitive Laziness</h3>
                    </div>
                    <p className="text-sm text-red-700 text-center">
                      Outsourcing thinking and sense-making to AI systems, weakening our ability to think critically
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-xl">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-orange-800">Imagination Deficit</h3>
                    </div>
                    <p className="text-sm text-orange-700 text-center">
                      Diminishing the generative core of human potential through AI dependency
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-xl">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-yellow-800">Psychological Debt</h3>
                    </div>
                    <p className="text-sm text-yellow-700 text-center">
                      Accumulating fatigue, disconnection, and loss of purpose from AI over-reliance
                    </p>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
                  <p className="text-lg text-purple-800 font-medium text-center">
                    These challenges cascade together, creating an urgent need for intentional development of human cognitive capabilities.
                  </p>
                </div>
              </div>
              
              {/* Next Button */}
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => onNext && onNext('ia-3-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  Next: Imaginal Agility Solution
                </Button>
              </div>
            </div>
          </div>
        );

      case 'ia-3-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            {/* Step Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">
                Imaginal Agility Solution
              </h1>
            </div>
            
            {/* Video Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-2xl">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/l3XVwPGE6UY" 
                      title="Imaginal Agility Solution" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-lg shadow-md"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <p className="text-lg leading-relaxed mb-8">
                  Imagination is a primal human power — not content with what we know, but impelled to ask: 'What if?' Let's explore what this means, and how to harness it — individually and as a team.
                </p>
                
                {/* Five Core Capabilities */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-purple-800 mb-6 text-center">
                    The Five Core Capabilities for Imaginal Agility
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-purple-100">
                      <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <img 
                          src="/assets/Imagination_1749499596783.png" 
                          alt="Imagination" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-semibold text-purple-700 text-sm">Imagination</h4>
                      <p className="text-xs text-gray-600 mt-1">Generate novel possibilities</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                      <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <img 
                          src="/assets/Curiosity_1749499596783.png" 
                          alt="Curiosity" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-semibold text-blue-700 text-sm">Curiosity</h4>
                      <p className="text-xs text-gray-600 mt-1">Explore and question deeply</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-green-100">
                      <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <img 
                          src="/assets/Creativity_1749499596783.png" 
                          alt="Creativity" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-semibold text-green-700 text-sm">Creativity</h4>
                      <p className="text-xs text-gray-600 mt-1">Develop original solutions</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-orange-100">
                      <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <img 
                          src="/assets/courage_1749499596782.png" 
                          alt="Courage" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-semibold text-orange-700 text-sm">Courage</h4>
                      <p className="text-xs text-gray-600 mt-1">Take meaningful risks</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-pink-100">
                      <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <img 
                          src="/assets/empathy_1749499596783.png" 
                          alt="Empathy" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-semibold text-pink-700 text-sm">Empathy</h4>
                      <p className="text-xs text-gray-600 mt-1">Connect and understand</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <p className="text-lg text-purple-800 font-medium text-center mb-4">
                    Upon viewing the video, please click on the button below to complete your Core Capabilities Self-Assessment.
                  </p>
                  <div className="text-center">
                    <p className="text-sm text-purple-600">
                      This assessment will help you understand your current strengths and growth opportunities across these five essential capabilities.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Next Button */}
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => onNext && onNext('ia-4-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  Next: Self-Assessment
                </Button>
              </div>
            </div>
          </div>
        );

      case 'ia-4-1':
        return <ImaginalAgilityAssessmentContent onOpenAssessment={onOpenAssessment} />;

      case 'ia-4-2':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">
                Assessment Results
              </h1>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-2xl">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/If2FH40IgTM" 
                      title="Review Results" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-lg shadow-md"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-lg text-gray-700 space-y-4">
              <h2 className="text-2xl font-semibold text-purple-700">Review Your Imagination Radar</h2>
              
              <p>You've just completed your self-assessment. Now it's time to explore your results.</p>
              
              <p>Your Radar Map reveals how five essential human capabilities show up in your life and work.</p>
              
              <h3 className="text-xl font-semibold text-purple-700">What This Is</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>A snapshot, not a scorecard</li>
                <li>A reflection tool, not a judgment</li>
                <li>A way to see patterns and possibilities</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-purple-700">What Comes Next</h3>
              <p>You'll bring this Radar into the next phase: the Team Practice Session, where it becomes a foundation for shared insight, creative alignment, and collaboration with AI.</p>
              
              {assessmentResults && (
                <div className="mt-8">
                  <ImaginalAgilityRadarChart data={assessmentResults} />
                </div>
              )}
              
              {/* Next Button */}
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => onNext && onNext('ia-5-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  Next: Teamwork Preparation
                </Button>
              </div>
            </div>
          </div>
        );

      case 'ia-5-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            {/* Step Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">
                Teamwork Preparation
              </h1>
            </div>
            
            {/* Video Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-2xl">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/hOV2zaWVxeU" 
                      title="Assessment Results" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-lg shadow-md"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-purple-800 mb-4">
                    Your Assessment Results
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Now that you've completed your self-assessment, let's explore your radar profile and understand your unique Imaginal Agility strengths.
                  </p>
                </div>
                
                {/* What to Expect Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-purple-700 mb-4 text-center">
                    What to Expect
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">🎯</span>
                      </div>
                      <h4 className="font-semibold text-blue-700 mb-2">Structured Whiteboard Practice</h4>
                      <p className="text-sm text-gray-600">
                        Guided exercises will help your team apply imaginal agility in a creative, visual, and action-oriented way.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">⚡</span>
                      </div>
                      <h4 className="font-semibold text-green-700 mb-2">Real-Time Co-Creation</h4>
                      <p className="text-sm text-gray-600">
                        You'll brainstorm, align, and design solutions together — rapidly and with purpose.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">🤖</span>
                      </div>
                      <h4 className="font-semibold text-purple-700 mb-2">Human + AI Synergy</h4>
                      <p className="text-sm text-gray-600">
                        You'll raise your HaiQ — the ability to stay imaginative, collaborative, and human while working with AI.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* What You Leave With Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-green-700 mb-4 text-center">
                    What You Leave With
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <p className="text-gray-700">A shared model for alignment and trust</p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <p className="text-gray-700">Tools and language to apply imagination at scale</p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <p className="text-gray-700">Personal and team AI insights and prompt packs</p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <p className="text-gray-700">Clearer team identity and action direction</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <p className="text-lg text-purple-800 font-medium">
                    Together, you'll enter a shared digital whiteboard space designed for real-time collaboration. This is where individual insights become team breakthroughs.
                  </p>
                </div>
              </div>
              
              {/* Next Button */}
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => onNext && onNext('ia-6-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  Next: Discernment Guide
                </Button>
              </div>
            </div>
          </div>
        );

      case 'ia-6-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            {/* Step Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">
                Discernment Guide
              </h1>
            </div>
            
            {/* Video Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-2xl">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/hOV2zaWVxeU" 
                      title="Teamwork Preparation" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-lg shadow-md"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-purple-800 mb-4">
                    Welcome to the Next Stage of the Imaginal Agility Workshop
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Now that you've completed your self-assessment and explored your radar profile, it's time to bring your imagination into action — with your team.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">What's Next</h4>
                  <p className="text-gray-700 leading-relaxed">
                    This workshop is designed to help teams develop their collective Imaginal Agility. You've now gained insight into your personal strengths and can contribute meaningfully to your team's journey forward.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Individual Preparation</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li>• Review your assessment results</li>
                      <li>• Identify your top strengths</li>
                      <li>• Consider growth areas</li>
                      <li>• Prepare to share insights with your team</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <h4 className="text-lg font-semibold text-green-800 mb-3">Team Workshop Focus</h4>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li>• Collective strengths mapping</li>
                      <li>• Complementary skill identification</li>
                      <li>• Collaborative imagination exercises</li>
                      <li>• Action planning for team agility</li>
                    </ul>
                  </div>
                </div>
              
              {/* AI Mirror Test */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-blue-800 mb-4">THE AI MIRROR TEST</h3>
                <p className="text-xl font-semibold text-blue-700 mb-6">A 3-Phase Self-Awareness Tool for Conscious AI Collaboration</p>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  The AI Mirror Test is a professional-grade reflection tool to help you assess the quality of your engagement with AI. It supports development of HaiQ (Human-AI Intelligence Quotient) by guiding you through a 3-phase cycle:
                </p>
                
                {/* Three Phases */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <h4 className="text-lg font-semibold text-blue-700">Pre-Reflection</h4>
                      <p className="text-sm text-blue-600 font-medium">Name the Frame</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Before you begin interacting with AI, take a moment to answer:</p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal pl-4">
                      <li>What is your primary intention in this AI interaction?</li>
                      <li>What do you expect the AI to do well — or poorly?</li>
                      <li>Are you entering this as a co-creator, consumer, or critic?</li>
                    </ol>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <h4 className="text-lg font-semibold text-green-700">Active Observation</h4>
                      <p className="text-sm text-green-600 font-medium">Catch Yourself in the Act</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">During your interaction with AI, gently observe:</p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal pl-4">
                      <li>Did you revise your prompt at all, or accept the first response?</li>
                      <li>Did you question anything the AI produced?</li>
                      <li>What did you *not* say or ask that shaped the result?</li>
                    </ol>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-100">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <h4 className="text-lg font-semibold text-purple-700">Post-Reflection</h4>
                      <p className="text-sm text-purple-600 font-medium">What Did I Miss?</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">After your AI interaction, take 1–2 minutes to reflect:</p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal pl-4">
                      <li>What surprised you about your own behavior?</li>
                      <li>Did AI help you think more clearly — or just faster?</li>
                      <li>What will you do differently next time?</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              {/* Self-Assessment Practice */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h4 className="text-xl font-semibold text-purple-700 mb-4">Self-Assessment Practice</h4>
                <p className="text-lg text-gray-700 mb-6">Rate your interaction on these 5 dimensions (0 = not at all, 10 = fully):</p>
                
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h5 className="font-semibold text-blue-700 text-sm mb-2">Agency</h5>
                    <p className="text-xs text-gray-600">How much did you direct the interaction?</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <h5 className="font-semibold text-green-700 text-sm mb-2">Reflection</h5>
                    <p className="text-xs text-gray-600">Did you notice your own patterns and revise?</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <h5 className="font-semibold text-purple-700 text-sm mb-2">Imaginative Initiative</h5>
                    <p className="text-xs text-gray-600">Did you use the AI to expand your thinking?</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <h5 className="font-semibold text-orange-700 text-sm mb-2">Clarity</h5>
                    <p className="text-xs text-gray-600">Did the interaction help clarify your ideas?</p>
                  </div>
                  
                  <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
                    <h5 className="font-semibold text-pink-700 text-sm mb-2">Discernment</h5>
                    <p className="text-xs text-gray-600">Did you evaluate AI outputs with critical thinking?</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    This is a learning tool you can practice with any AI interaction to develop stronger discernment skills and more conscious collaboration with AI systems.
                  </p>
                </div>
              </div>
              </div>
              
              {/* Next Button */}
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => onNext && onNext('ia-8-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  Next: The Neuroscience
                </Button>
              </div>
            </div>
          </div>
        );


      case 'ia-8-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            {/* Step Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-purple-800">
                The Neuroscience
              </h1>
            </div>
            
            {/* Video Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-2xl">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/43Qs7OvToeI" 
                      title="The Neuroscience" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-lg shadow-md"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Cards */}
            <div className="space-y-8">
              {/* Main Introduction */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">The Neuroscience of Imagination</h2>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Modern neuroscience reveals that imagination isn't just creativity — it's a sophisticated cognitive process that involves multiple brain networks working together.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Understanding how your brain generates, evaluates, and implements imaginative thinking gives you practical tools for enhancing this essential human capability.
                </p>
              </div>
              
              {/* Key Brain Networks */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-6 text-center">Key Brain Networks</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">🧠</span>
                      </div>
                      <h4 className="font-semibold text-blue-700 mb-2">Default Mode Network</h4>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Generates spontaneous ideas and possibilities during rest and reflection
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-100">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">🎯</span>
                      </div>
                      <h4 className="font-semibold text-purple-700 mb-2">Executive Control Network</h4>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Evaluates and refines imaginative content with focused attention
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">🔄</span>
                      </div>
                      <h4 className="font-semibold text-green-700 mb-2">Salience Network</h4>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Switches between different modes of thinking and attention
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-center text-gray-700">
                    By understanding these networks, you can learn to work with your brain's natural imagination processes more effectively.
                  </p>
                </div>
              </div>
              
              {/* Journey Completion */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-6 text-center">Your Imaginal Agility Journey Continues</h3>
                
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">🎉</span>
                  </div>
                  <p className="text-lg font-medium text-green-700">Congratulations on completing the Imaginal Agility Workshop core modules!</p>
                </div>
                
                <h4 className="text-lg font-semibold text-green-700 mb-4">You've developed foundational skills in:</h4>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <p className="text-gray-700">Self-assessment of core imagination capabilities</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <p className="text-gray-700">Understanding the neuroscience of imaginative thinking</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <p className="text-gray-700">Practical tools for reality discernment</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <p className="text-gray-700">Framework for conscious AI collaboration</p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-xs">✓</span>
                    </div>
                    <p className="text-gray-700">Team preparation for collaborative imagination</p>
                  </div>
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-purple-700 mb-6 text-center">What's Next?</h3>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
                  Your journey in developing Imaginal Agility doesn't end here. Consider these next steps:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <h4 className="font-semibold text-purple-700 mb-2">Daily Practice</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Practice the AI Mirror Test regularly</li>
                      <li>• Apply discernment tools in decision-making</li>
                      <li>• Continue developing core capabilities</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-700 mb-2">Team Application</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Share radar results with your team</li>
                      <li>• Explore collaborative applications</li>
                      <li>• Foster transformative innovation capacity</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <p className="text-lg font-medium text-purple-800 text-center">
                    Remember: Imaginal Agility is not a destination but a practice — a way of engaging with uncertainty, complexity, and possibility that grows stronger with intentional use.
                  </p>
                </div>
                
                {/* Workshop Completion Button */}
                <div className="text-center mt-8">
                  <button 
                    onClick={() => {
                      // Workshop completion modal would go here
                      alert('Workshop Complete! Congratulations on completing the Imaginal Agility Workshop.');
                    }}
                    className="bg-gradient-to-r from-green-600 to-green-800 text-white py-4 px-8 rounded-lg hover:opacity-90 transition-opacity text-lg font-semibold"
                  >
                    🎉 Complete Workshop
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Step Not Found</h1>
            <p>The requested step content is not available.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderStepContent()}
    </div>
  );
};

export default ImaginalAgilityContent;