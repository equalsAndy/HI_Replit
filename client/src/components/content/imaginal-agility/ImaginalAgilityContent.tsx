import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import ImaginalAgilityRadarChart from './ImaginalAgilityRadarChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VideoPlayer } from '@/components/content/VideoPlayer';


// Component for ia-4-1 Assessment step
const ImaginalAgilityAssessmentContent: React.FC<{ onOpenAssessment?: () => void; onNext?: (stepId: string) => void }> = ({ onOpenAssessment, onNext }) => {
  // Check if assessment is completed
  const { data: assessmentData } = useQuery({
    queryKey: ['/api/assessments/imaginal_agility'],
    retry: false
  });

  const isAssessmentCompleted = assessmentData && (assessmentData as any).data !== null;

  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Self-Assessment
      </h1>
      
      <div className="mb-8">
        {/* Video Section */}
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
              onClick={() => onNext && onNext('ia-5-1')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Next: Assessment Results
            </Button>
          ) : (
            <Button 
              onClick={onOpenAssessment}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Take the Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ImaginalAgilityContentProps {
  stepId: string;
  onNext?: (nextStepId: string) => void;
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
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const renderStepContent = () => {
    switch (stepId) {
      case 'ia-1-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Welcome to Imaginal Agility
            </h1>
            
            {/* Video Section using VideoPlayer component */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <VideoPlayer
                workshopType="imaginal-agility"
                stepId="ia-1-1"
                title="Welcome to Imaginal Agility"
                forceUrl="https://youtu.be/F1qGAW4OofQ"
                aspectRatio="16:9"
                autoplay={true}
                className="w-full max-w-2xl mx-auto"
              />
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
                
                <p className="text-xl font-semibold text-purple-600 mt-8">
                  You're not just learning about imagination. You're harnessing it
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => onNext && onNext('ia-1-2')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Continue to Next Step
              </Button>
            </div>
          </div>
        );

      case 'ia-2-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              The Imaginal Agility Solution
            </h1>
            
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
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
                  <p className="text-lg text-purple-800 font-medium text-center">
                    Imaginal Agility is the antidote to AI's cognitive challenges, empowering humans to thrive alongside artificial intelligence.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => onNext && onNext('ia-2-2')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Next: I4C Self-Assessment
              </Button>
            </div>
          </div>
        );

      case 'ia-3-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              The Imaginal Agility Solution
            </h1>
            
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
                  <h3 className="text-lg sm:text-xl font-semibold text-purple-800 mb-6 text-center">
                    The Five Core Capabilities for Imaginal Agility
                  </h3>
                  
                  {/* Responsive layout: Mobile (1 col), Medium (2-1-2), Large+ (5 cols) */}
                  <div className="max-w-6xl mx-auto">
                    {/* Medium screens: 2-1-2 layout */}
                    <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 justify-items-center">
                      {/* First row: 2 items */}
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Imagination_1749499596783.png" 
                          alt="Imagination" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Curiosity_1749499596783.png" 
                          alt="Curiosity" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Second row: 2 items */}
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Creativity_1749499596783.png" 
                          alt="Creativity" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/courage_1749499596782.png" 
                          alt="Courage" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Third row: 1 centered item */}
                      <div className="col-span-2 flex justify-center">
                        <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                          <img 
                            src="/assets/empathy_1749499596783.png" 
                            alt="Empathy" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile: Single column */}
                    <div className="grid md:hidden grid-cols-1 gap-6 justify-items-center">
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Imagination_1749499596783.png" 
                          alt="Imagination" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Curiosity_1749499596783.png" 
                          alt="Curiosity" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Creativity_1749499596783.png" 
                          alt="Creativity" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/courage_1749499596782.png" 
                          alt="Courage" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-40 h-40 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/empathy_1749499596783.png" 
                          alt="Empathy" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* Large screens and up: 5 columns - Moderately sized graphics */}
                    <div className="hidden lg:grid grid-cols-5 gap-8 justify-items-center">
                      <div className="w-44 h-44 xl:w-52 xl:h-52 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Imagination_1749499596783.png" 
                          alt="Imagination" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-44 h-44 xl:w-52 xl:h-52 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Curiosity_1749499596783.png" 
                          alt="Curiosity" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-44 h-44 xl:w-52 xl:h-52 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/Creativity_1749499596783.png" 
                          alt="Creativity" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-44 h-44 xl:w-52 xl:h-52 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/courage_1749499596782.png" 
                          alt="Courage" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="w-44 h-44 xl:w-52 xl:h-52 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/assets/empathy_1749499596783.png" 
                          alt="Empathy" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <p className="text-lg text-purple-800 font-medium text-center mb-4">
                    These five capabilities work together to create Imaginal Agility — your ability to navigate complexity with creative confidence.
                  </p>
                  
                  <p className="text-base text-gray-700 text-center">
                    In the next step, you'll assess your current strengths across these capabilities and create a personalized development map for moving forward.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => onNext && onNext('ia-4-1')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Next: Self-Assessment
              </Button>
            </div>
          </div>
        );

      case 'ia-4-1':
        return <ImaginalAgilityAssessmentContent onOpenAssessment={onOpenAssessment} onNext={onNext} />;

      case 'ia-5-1':
        // Assessment Results with data fetching
        const AssessmentResultsContent = () => {
          const { data: assessmentData } = useQuery({
            queryKey: ['/api/assessments/imaginal_agility'],
            retry: false
          });

          const hasAssessmentData = assessmentData && (assessmentData as any).data;
          let resultData = null;
          
          if (hasAssessmentData) {
            const rawResults = (assessmentData as any).data.results;
            
            // Handle different result formats
            if (typeof rawResults === 'string') {
              // Normal JSON string (new correct format)
              try {
                resultData = JSON.parse(rawResults);
              } catch (e) {
                console.error('Failed to parse JSON string:', e);
                resultData = null;
              }
            } else if (typeof rawResults === 'object' && rawResults !== null && !Array.isArray(rawResults)) {
              // Check if it's already a parsed object
              if (rawResults.imagination !== undefined) {
                resultData = rawResults;
              } else {
                // Fallback: character-indexed object (legacy format)
                const keys = Object.keys(rawResults).map(Number).sort((a, b) => a - b);
                const jsonString = keys.map(key => rawResults[key]).join('');
                
                try {
                  resultData = JSON.parse(jsonString);
                } catch (e) {
                  console.error('Failed to parse reconstructed JSON:', e);
                  resultData = null;
                }
              }
            }
          }

          return (
            <div className="max-w-4xl mx-auto p-6">
              <h1 className="text-3xl font-bold text-purple-700 mb-8">
                Assessment Results
              </h1>
              
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                  <p className="text-lg leading-relaxed mb-6">
                    Here are your Imaginal Agility assessment results. This radar chart shows your current strengths across the five core capabilities.
                  </p>
                  
                  {hasAssessmentData && resultData ? (
                    <div className="space-y-8">
                      {/* Radar Chart */}
                      <div className="flex justify-center mb-8">
                        <ImaginalAgilityRadarChart data={{
                          imagination: resultData.imagination || 0,
                          curiosity: resultData.curiosity || 0,
                          empathy: resultData.empathy || 0,
                          creativity: resultData.creativity || 0,
                          courage: resultData.courage || 0
                        }} />
                      </div>
                      
                      {/* Individual Capability Scores with Icons */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Your Capability Scores</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                          {[
                            {capacity: 'Imagination', score: parseFloat(resultData.imagination) || 0, icon: '/assets/Imagination_sq.png', color: 'bg-gray-50 border-gray-200'},
                            {capacity: 'Curiosity', score: parseFloat(resultData.curiosity) || 0, icon: '/assets/Curiosity_sq.png', color: 'bg-green-50 border-green-200'},
                            {capacity: 'Creativity', score: parseFloat(resultData.creativity) || 0, icon: '/assets/Creativity_sq.png', color: 'bg-orange-50 border-orange-200'},
                            {capacity: 'Courage', score: parseFloat(resultData.courage) || 0, icon: '/assets/courage_sq.png', color: 'bg-red-50 border-red-200'},
                            {capacity: 'Empathy', score: parseFloat(resultData.empathy) || 0, icon: '/assets/empathy_sq.png', color: 'bg-blue-50 border-blue-200'}
                          ].map(item => (
                            <div key={item.capacity} className={`${item.color} p-3 rounded-lg border text-center flex flex-col items-center justify-center min-h-[140px]`}>
                              <div className="w-16 h-16 mb-2 flex items-center justify-center">
                                <img 
                                  src={item.icon} 
                                  alt={item.capacity} 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <h4 className="font-semibold text-gray-800 mb-1 text-sm">{item.capacity}</h4>
                              <div className="text-xl font-bold text-purple-700">{item.score.toFixed(1)}</div>
                              <div className="text-xs text-gray-600">
                                {item.score >= 4.0 ? 'Strength' : item.score >= 3.5 ? 'Developing' : 'Growth Area'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Simplified Interpretation */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Understanding Your Results</h3>
                        <div className="text-center space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-green-700">Strengths (4.0+):</span> Your natural superpowers - leverage these capabilities
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-blue-700">Developing (3.5-3.9):</span> Strong foundation - ready for advanced practice
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-orange-700">Growth Areas (below 3.5):</span> Opportunities for intentional development
                          </p>
                        </div>
                      </div>
                      
                      {/* Development Recommendations */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Recommendations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-800 mb-2">Daily Practice</h4>
                            <p className="text-sm text-gray-700">
                              Spend 10 minutes daily on imagination exercises focused on your growth areas.
                            </p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">Team Collaboration</h4>
                            <p className="text-sm text-gray-700">
                              Partner with teammates who excel in your development areas for mutual learning.
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2">Strength Application</h4>
                            <p className="text-sm text-gray-700">
                              Use your strongest capabilities to tackle complex challenges and mentor others.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                      <div className="text-center">
                        <p className="text-lg font-medium text-yellow-800 mb-2">Assessment Not Completed</p>
                        <p className="text-yellow-700 mb-4">
                          Please complete your self-assessment first to see your radar chart results.
                        </p>
                        <Button 
                          onClick={() => onNext && onNext('ia-4-1')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                        >
                          Take Assessment
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4">Understanding Your Results</h3>
                    <p className="text-base text-purple-700 mb-4">
                      Your radar chart reveals your unique profile across the five capabilities. There are no "right" or "wrong" results — only insights into your current strengths and growth opportunities.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-purple-700">
                      <li><strong>Higher scores</strong> indicate areas where you feel confident and capable</li>
                      <li><strong>Lower scores</strong> represent opportunities for intentional development</li>
                      <li><strong>Balance</strong> across capabilities creates the most agile response to complex challenges</li>
                    </ul>
                  </div>
                  
                  <p className="text-lg leading-relaxed">
                    In the next step, you'll prepare for teamwork by understanding how these capabilities can be leveraged in collaborative settings.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => onNext && onNext('ia-6-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  Next: Teamwork Preparation
                </Button>
              </div>
            </div>
          );
        };

        return <AssessmentResultsContent />;

      case 'ia-6-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Teamwork Preparation
            </h1>
            
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
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <p className="text-lg leading-relaxed mb-6">
                  Now that you understand your individual Imaginal Agility profile, it's time to prepare for collaborative application. Teams that combine diverse imaginal capabilities create breakthrough solutions.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4 text-center">
                    Preparing for Team Collaboration
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-700 mb-2">Share Your Strengths</h4>
                      <p className="text-sm text-gray-700">
                        Be ready to discuss which capabilities feel most natural to you and how you've used them successfully.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-700 mb-2">Embrace Growth Areas</h4>
                      <p className="text-sm text-gray-700">
                        Identify capabilities you'd like to develop and be open to learning from teammates who excel in those areas.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">Practice Active Curiosity</h4>
                      <p className="text-sm text-gray-700">
                        Ask questions about others' perspectives and approaches to expand your own imaginative toolkit.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-700 mb-2">Build on Ideas</h4>
                      <p className="text-sm text-gray-700">
                        Use "Yes, and..." thinking to expand on teammates' contributions rather than immediately evaluating them.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">Remember: Diversity Creates Agility</h3>
                  <p className="text-base text-yellow-700">
                    The most innovative teams combine different thinking styles, experiences, and capabilities. Your unique profile contributes to collective intelligence that no individual could achieve alone.
                  </p>
                </div>
                
                <p className="text-lg leading-relaxed">
                  You're now ready to apply these insights in collaborative practice. The final step will explore the neuroscience behind why this approach works.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => onNext && onNext('ia-8-1')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Next: The Neuroscience
              </Button>
            </div>
          </div>
        );

      case 'ia-8-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Neuroscience
            </h1>
            
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
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <p className="text-lg leading-relaxed mb-6">
                  Understanding the neuroscience behind Imaginal Agility helps explain why these practices are so powerful for human development and team performance.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4 text-center">
                    The Brain Science of Imagination
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-700 mb-2">Default Mode Network</h4>
                      <p className="text-sm text-gray-700">
                        Your brain's "imagination network" activates during rest and creative thinking, connecting distant ideas and generating novel solutions.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-700 mb-2">Neuroplasticity</h4>
                      <p className="text-sm text-gray-700">
                        Regular practice of imaginative thinking literally rewires your brain, strengthening neural pathways for creativity and problem-solving.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">Mirror Neurons</h4>
                      <p className="text-sm text-gray-700">
                        These specialized cells help you understand and empathize with others, essential for collaborative imagination and team innovation.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-700 mb-2">Prefrontal Cortex</h4>
                      <p className="text-sm text-gray-700">
                        This executive region helps you evaluate and implement imaginative ideas, turning creative insights into practical action.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Why It Matters</h3>
                  <p className="text-base text-purple-700 mb-4">
                    Research shows that intentional imagination practice:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-purple-700">
                    <li>Increases cognitive flexibility and adaptive thinking</li>
                    <li>Enhances problem-solving ability under uncertainty</li>
                    <li>Improves emotional regulation and resilience</li>
                    <li>Strengthens social connection and team cohesion</li>
                    <li>Builds confidence for navigating complex challenges</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 text-center">
                    The Path Forward
                  </h3>
                  <p className="text-base text-gray-700 text-center">
                    You now have both the practical tools and scientific understanding to develop your Imaginal Agility. 
                    Continue practicing these capabilities individually and with your team to build lasting cognitive fitness for the AI age.
                  </p>
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    onClick={() => {
                      // Mark ia-8-1 as completed when workshop is completed
                      if (onNext) {
                        onNext('ia-8-1'); // This will trigger the completion logic
                      }
                      setShowCompletionModal(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                  >
                    Complete Workshop
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      // NEW STEPS - Phase 4 Implementation
      case 'ia-1-2':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              The Triple Challenge
            </h1>
            
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
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => onNext && onNext('ia-2-1')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Next: Imaginal Agility Solution
              </Button>
            </div>
          </div>
        );

      case 'ia-2-2':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              I4C Self-Assessment
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Complete the I4C assessment to understand your current capabilities.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800">
                <strong>Coming Soon:</strong> The I4C assessment component is currently being developed.
              </p>
            </div>
            {onNext && (
              <Button 
                onClick={() => onNext('ia-2-3')} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Next: Review Radar Map
              </Button>
            )}
          </div>
        );

      case 'ia-2-3':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Review Radar Map
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              View and analyze your I4C assessment results on the radar map.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800">
                <strong>Coming Soon:</strong> This content is currently being developed and will be available in the next update.
              </p>
            </div>
            {onNext && (
              <Button 
                onClick={() => onNext('ia-3-1')} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Next: Ladder Overview
              </Button>
            )}
          </div>
        );

      case 'ia-3-2':
      case 'ia-3-3':
      case 'ia-3-4':
      case 'ia-3-5':
      case 'ia-3-6':
      case 'ia-4-2':
      case 'ia-4-3':
      case 'ia-4-4':
      case 'ia-4-5':
      case 'ia-4-6':
      case 'ia-5-2':
      case 'ia-5-3':
      case 'ia-5-4':
      case 'ia-5-5':
      case 'ia-6-2':
      case 'ia-7-1':
      case 'ia-7-2':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Step {stepId.toUpperCase().replace(/-/g, '.')}
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              This step is part of the comprehensive Imaginal Agility workshop experience.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800">
                <strong>Coming Soon:</strong> This content is currently being developed and will be available in the next update.
              </p>
            </div>
            {onNext && (
              <Button 
                onClick={() => {
                  // Simple progression logic for placeholder steps
                  const allSteps = [
                    'ia-1-1', 'ia-1-2', 'ia-2-1', 'ia-2-2', 'ia-2-3',
                    'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
                    'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
                    'ia-5-1', 'ia-5-2', 'ia-5-3', 'ia-5-4', 'ia-5-5',
                    'ia-6-1', 'ia-6-2', 'ia-7-1', 'ia-7-2'
                  ];
                  const currentIndex = allSteps.indexOf(stepId);
                  const nextStep = allSteps[currentIndex + 1];
                  if (nextStep) {
                    onNext(nextStep);
                  }
                }} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Next Step
              </Button>
            )}
          </div>
        );

      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Step Not Found
            </h1>
            <p className="text-lg text-gray-700">
              The requested step could not be found. Please check the step ID and try again.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="imaginal-agility-content">
      {renderStepContent()}
      
      {/* Workshop Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-700 text-center mb-4">
              🎉 Congratulations!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <p className="text-lg font-semibold text-purple-800 mb-2">
                Workshop Complete
              </p>
              <p className="text-sm text-gray-700">
                You've successfully completed the Imaginal Agility Workshop!
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-base text-gray-700">
                You've gained valuable insights into your imaginative capabilities and are ready to apply them in collaborative settings.
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-800 mb-2">
                  What You've Accomplished:
                </p>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>✓ Understanding the Triple Challenge</li>
                  <li>✓ Learning the Five Core Capabilities</li>
                  <li>✓ Completing your personal assessment</li>
                  <li>✓ Preparing for team collaboration</li>
                  <li>✓ Understanding the neuroscience behind the approach</li>
                </ul>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowCompletionModal(false)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImaginalAgilityContent;