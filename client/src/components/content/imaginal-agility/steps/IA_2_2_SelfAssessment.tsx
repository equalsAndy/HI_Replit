import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Target, Lightbulb, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ImaginalAgilityRadarChart from '../ImaginalAgilityRadarChart';

interface IA_2_2_ContentProps {
  onNext?: (stepId: string) => void;
  onOpenAssessment?: () => void;
}

function IA_2_2_Content({ onNext, onOpenAssessment }: IA_2_2_ContentProps) {
  // Check if assessment is completed
  const { data: assessmentData, refetch } = useQuery({
    queryKey: ['/api/workshop-data/ia-assessment'],
    queryFn: async () => {
      console.log('🔎 Fetching IA assessment data...');
      const response = await fetch('/api/workshop-data/ia-assessment', {
        credentials: 'include'
      });
      
      console.log('🔎 Fetch response status:', response.status);
      
      if (!response.ok) {
        console.error('🔎 Fetch error:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔎 Fetched IA assessment data:', JSON.stringify(data, null, 2));
      return data;
    },
    retry: false,
    refetchOnWindowFocus: true, // Force refetch when returning to tab
    staleTime: 0 // Always fetch fresh data
  });


  const isAssessmentCompleted = assessmentData && (assessmentData as any).data !== null;
  console.log('🎯 IA_2_2_Content: isAssessmentCompleted:', isAssessmentCompleted);

  // Parse assessment results for radar chart
  let resultData = null;
  if (isAssessmentCompleted && (assessmentData as any).data?.results) {
    const rawResults = (assessmentData as any).data.results;
    console.log('🎯 IA_2_2_Content: rawResults:', rawResults);
    if (typeof rawResults === 'string') {
      try {
        resultData = JSON.parse(rawResults);
        console.log('🎯 IA_2_2_Content: parsed resultData:', resultData);
      } catch (e) {
        console.error('Failed to parse assessment results:', e);
      }
    } else if (typeof rawResults === 'object' && rawResults !== null) {
      if (rawResults.imagination !== undefined) {
        resultData = rawResults;
        console.log('🎯 IA_2_2_Content: object resultData:', resultData);
      }
    }
  }

  console.log('🎯 IA_2_2_Content: Final resultData:', resultData);

  const handleStartAssessment = () => {
    if (onOpenAssessment) {
      onOpenAssessment();
    }
  };

  const dimensions = [
    {
      icon: Lightbulb,
      label: 'Imagination',
      description: 'Your ability to envision new possibilities and think beyond current constraints',
      color: 'text-purple-600'
    },
    {
      icon: Brain,
      label: 'Innovation', 
      description: 'Your capacity to create novel solutions and approaches to challenges',
      color: 'text-blue-600'
    },
    {
      icon: Target,
      label: 'Insight',
      description: 'Your skill in understanding deep patterns and gaining clarity from complexity',
      color: 'text-green-600'
    },
    {
      icon: Users,
      label: 'Intuition',
      description: 'Your ability to sense and trust inner wisdom and gut feelings',
      color: 'text-orange-600'
    }
  ];

  // If assessment is completed, show radar chart
  if (isAssessmentCompleted && resultData) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-purple-800">Your I4C Assessment Results</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Here's your personal radar chart showing your strengths across the five core capabilities.
          </p>
        </div>

        {/* Radar Chart Display */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-8">
              <ImaginalAgilityRadarChart data={{
                imagination: resultData.imagination || 0,
                curiosity: resultData.curiosity || 0,
                empathy: resultData.empathy || 0,
                creativity: resultData.creativity || 0,
                courage: resultData.courage || 0
              }} />
            </div>

            {/* Individual Capability Scores */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Your Capability Scores</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  {capacity: 'Imagination', score: parseFloat(resultData.imagination) || 0, icon: '/assets/Imagination_new.png', color: 'bg-purple-50 border-purple-200'},
                  {capacity: 'Curiosity', score: parseFloat(resultData.curiosity) || 0, icon: '/assets/Curiosity_new.png', color: 'bg-blue-50 border-blue-200'},
                  {capacity: 'Caring', score: parseFloat(resultData.empathy) || 0, icon: '/assets/Caring_new.png', color: 'bg-green-50 border-green-200'},
                  {capacity: 'Creativity', score: parseFloat(resultData.creativity) || 0, icon: '/assets/Creativity_new.png', color: 'bg-orange-50 border-orange-200'},
                  {capacity: 'Courage', score: parseFloat(resultData.courage) || 0, icon: '/assets/Courage_new.png', color: 'bg-red-50 border-red-200'}
                ].map(item => (
                  <div key={item.capacity} className={`${item.color} p-3 rounded-lg border text-center flex flex-col items-center justify-center min-h-[120px]`}>
                    <div className="w-12 h-12 mb-2 flex items-center justify-center">
                      <img 
                        src={item.icon} 
                        alt={item.capacity} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm">{item.capacity}</h4>
                    <div className="text-lg font-bold text-purple-700">{item.score.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">
                      {item.score >= 4.0 ? 'Strength' : item.score >= 3.5 ? 'Developing' : 'Growth Area'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Understanding Results */}
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
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Your assessment is complete! You can now proceed to the next section to start developing your imagination.
          </p>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => onNext?.('ia-3-1')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              Continue to Ladder Overview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show pre-assessment content if assessment is not completed
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-purple-800">I4C Self-Assessment</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Before we dive deeper into developing your imaginal agility, let's establish your current baseline 
          across the five core capabilities.
        </p>
      </div>

      {/* Overview Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-800 text-center">
            What You'll Assess
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lightbulb,
                label: 'Imagination',
                description: 'Your ability to envision new possibilities and think beyond current constraints',
                color: 'text-purple-600'
              },
              {
                icon: Brain,
                label: 'Curiosity', 
                description: 'Your drive to explore, question, and seek new knowledge and experiences',
                color: 'text-blue-600'
              },
              {
                icon: Users,
                label: 'Caring',
                description: 'Your ability to understand and connect with others emotional experiences',
                color: 'text-green-600'
              },
              {
                icon: Target,
                label: 'Creativity',
                description: 'Your capacity to generate novel and valuable solutions to challenges',
                color: 'text-orange-600'
              },
              {
                icon: Brain,
                label: 'Courage',
                description: 'Your willingness to take meaningful risks and act on your convictions',
                color: 'text-red-600'
              }
            ].map((dimension, index) => {
              const IconComponent = dimension.icon;
              
              return (
                <div key={index} className="flex items-start gap-3">
                  <IconComponent className={`w-8 h-8 ${dimension.color} mt-1 flex-shrink-0`} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{dimension.label}</h3>
                    <p className="text-sm text-gray-600">{dimension.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Info */}
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                How the Assessment Works
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                You'll evaluate yourself on a scale of 1-5 across each capability, then see your results 
                displayed in an interactive radar chart. This becomes your baseline for growth and development.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3">Assessment Features:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Interactive radar chart visualization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Personalized insights based on your profile
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Development recommendations for each capability
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Save and track your progress over time
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          Ready to discover your current I4C profile? The assessment takes about 10-15 minutes to complete.
        </p>
        
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleStartAssessment}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            size="lg"
          >
            Start Assessment
          </Button>
          
          {/* Debug button to manually check for results */}
          <Button 
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              refetch();
            }}
            variant="outline"
            className="px-4 py-2 text-sm"
          >
            🔄 Check for Results
          </Button>
        </div>
      </div>
    </div>
  );
}

export default IA_2_2_Content;
