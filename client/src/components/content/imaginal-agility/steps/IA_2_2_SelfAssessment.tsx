import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Target, Lightbulb, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ImaginalAgilityRadarChart from '../ImaginalAgilityRadarChart';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

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
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Scroll Indicator - appears when user is idle */}
          <ScrollIndicator
            idleTime={3000}
            position="nav-adjacent"
            colorScheme="purple"
          />

          {/* Header */}
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Your i4C</p>
            <h1 className="text-4xl font-bold text-gray-900">Prism Reflection</h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              This page presents your I4C Prism — a five-sided prismatic form that reflects how your core human
              capabilities currently take shape together.
            </p>
          </div>

          {/* Prism card with chart */}
          <Card className="bg-white border border-purple-100 shadow-lg shadow-purple-100/60 rounded-2xl">
            <CardContent className="pt-8 pb-10 px-6 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-purple-800">Your I4C Prism</h2>
                <p className="text-gray-700 max-w-3xl mx-auto">
                  This prismatic form is generated from your responses and represents the current configuration of
                  Imagination, Curiosity, Caring, Creativity, and Courage as a unified whole.
                </p>
              </div>
              <div className="flex justify-center">
                <ImaginalAgilityRadarChart data={{
                  imagination: resultData.imagination || 0,
                  curiosity: resultData.curiosity || 0,
                  empathy: resultData.empathy || 0,
                  creativity: resultData.creativity || 0,
                  courage: resultData.courage || 0
                }} />
              </div>
            </CardContent>
          </Card>

          {/* What this prism shows */}
          <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl">
            <CardContent className="py-6 px-6 space-y-3">
              <h3 className="text-xl font-semibold text-purple-800 text-center">What This Prism Shows</h3>
              <p className="text-gray-700 text-center max-w-3xl mx-auto">
                Your I4C Prism does not measure levels or assign scores. It offers a visual snapshot of how your five
                core capabilities fit and take shape together at this moment.
              </p>
              <ul className="space-y-2 text-gray-700 max-w-2xl mx-auto">
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>Notice the overall shape, not individual parts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>Look for balance, emphasis, or asymmetry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>Treat this as a moment-in-time configuration, not a judgement</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Understanding section */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 space-y-4 shadow-inner">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-purple-900">Understanding Your I4C Prism</h3>
              <p className="text-gray-800">
                Your I4C Prism is not a scorecard or a judgment. It is a visual snapshot of how your five core
                capabilities take shape together at this moment.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">What to notice:</h4>
              <ul className="list-disc list-inside text-gray-800 space-y-1">
                <li>The overall shape of the prism, rather than any single side</li>
                <li>Areas of balance, emphasis, or contrast</li>
                <li>How the form feels stable, stretched, compact, or uneven</li>
              </ul>
            </div>
            <p className="text-gray-800">
              There is no ideal configuration. This prismatic form serves as an orientation point as you move into
              practice through the Ladder of Imagination.
            </p>
          </div>

          {/* Completion + CTA */}
          <Card className="bg-white border border-purple-100 shadow-sm rounded-2xl">
            <CardContent className="py-6 px-6 space-y-4">
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-purple-900">Completing This Reflection</h4>
                <p className="text-gray-700">
                  This prism marks the completion of Module 2. You now have a clear orientation to how your core
                  capabilities currently take shape together. When you're ready, continue to Module 3 to begin working
                  with imagination more directly.
                </p>
              </div>
              <div className="flex justify-center">
                <Button 
                  onClick={() => onNext?.('ia-3-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                >
                  Continue to Module 3
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show pre-assessment content if assessment is not completed
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-purple-800">Prism Reflection</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          This brief reflection explores how your five core capabilities — Imagination, Curiosity, Caring, Creativity,
          and Courage — fit and form together right now. There are no right or wrong responses; respond intuitively
          rather than analytically.
        </p>
        <p className="text-md text-gray-600 max-w-3xl mx-auto">
          At completion, you'll receive a short reflection and a visual I4C Prism capturing this moment-in-time
          configuration. It isn't fixed or evaluative — it's a reference you can use as you progress individually and,
          if you choose, with a team or cohort.
        </p>
      </div>

      {/* Overview Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-800 text-center">
            What You'll Reflect On
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
                description: "Your ability to understand and connect with others' emotional experiences",
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
                How This Works
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                You'll respond to a short set of prompts that surface how your five core capabilities show up in your
                experience. Your responses generate a five-sided I4C Prism — a current configuration, not a score.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3">What You'll Receive</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  A visual I4C Prism representing your current prismatic configuration
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Reflective insights to notice patterns, balance, and emphasis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Guidance for working with your prism as you move into the Ladder of Imagination
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  The ability to revisit your prism over time and observe how it evolves through practice
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          Ready to explore your current I4C Prism? This reflection takes about 10–15 minutes to complete.
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
