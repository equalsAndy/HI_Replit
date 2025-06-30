import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Star, TrendingUp, Target, Clock, Users, ArrowRight } from 'lucide-react';

interface QuarterlyReportProps {
  navigate: (content: string) => void;
  setCurrentContent: (content: string) => void;
}

interface GrowthPlanData {
  id?: number;
  userId: number;
  quarter: string;
  year: number;
  starPowerReflection?: string;
  ladderCurrentLevel?: number;
  ladderTargetLevel?: number;
  ladderReflections?: string;
  strengthsExamples?: Record<string, string>;
  flowPeakHours?: number[];
  flowCatalysts?: string;
  visionStart?: string;
  visionNow?: string;
  visionNext?: string;
  progressWorking?: string;
  progressNeedHelp?: string;
  teamFlowStatus?: string;
  teamEnergySource?: string;
  teamNextCheckin?: string;
  keyPriorities?: string[];
  successLooksLike?: string;
  keyDates?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StarCardData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}

export default function QuarterlyReportView({ navigate, setCurrentContent }: QuarterlyReportProps) {
  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user/me'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch star card data
  const { data: starCardData } = useQuery<StarCardData>({
    queryKey: ['/api/workshop-data/starcard'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch growth plan data
  const { data: growthPlanData } = useQuery<GrowthPlanData>({
    queryKey: ['/api/growth-plan'],
    staleTime: 5 * 60 * 1000,
  });

  // Report data with proper typing
  const reportData = {
    quarter: growthPlanData?.quarter || 'Q2',
    year: growthPlanData?.year || 2025,
    userName: (userProfile as any)?.name || 'Test User',
    completedDate: new Date().toLocaleDateString(),
    starCard: starCardData || { planning: 30, thinking: 29, acting: 23, feeling: 18 },
    wellBeing: { current: 7, future: 9 },
    growthPlan: (growthPlanData as GrowthPlanData) || {}
  };

  const getTopStrengths = () => {
    if (!starCardData) return [];
    const sorted = Object.entries(starCardData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);
    return sorted.map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      score: value
    }));
  };

  const formatFlowHours = (hours?: number[]) => {
    if (!hours || hours.length === 0) return 'Not specified';
    return hours.map(hour => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:00 ${period}`;
    }).join(', ');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-blue-500 pb-6">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">
            {reportData.quarter} {reportData.year} Quarterly Growth Plan
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-2">
          Thank you for completing your quarterly growth plan!
        </p>
        <div className="text-sm text-gray-500">
          <p><strong>{reportData.userName}</strong> • Completed: {reportData.completedDate}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
          <Star className="w-6 h-6 mr-2" />
          Executive Summary
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Top Strengths</h3>
            <div className="space-y-2">
              {getTopStrengths().map((strength, index) => (
                <div key={index} className="flex justify-between items-center bg-white rounded p-2">
                  <span className="font-medium">{strength.name}</span>
                  <span className="text-blue-600 font-bold">{strength.score}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Well-being Journey</h3>
            <div className="bg-white rounded p-3">
              <div className="flex justify-between items-center">
                <span>Current Level:</span>
                <span className="text-2xl font-bold text-blue-600">{reportData.wellBeing.current}/10</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Target Level:</span>
                <span className="text-2xl font-bold text-green-600">{reportData.wellBeing.future}/10</span>
              </div>
              <div className="mt-2 text-center">
                <TrendingUp className="w-5 h-5 inline text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  +{reportData.wellBeing.future - reportData.wellBeing.current} point growth target
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-8">
        {/* Star Power Reflection */}
        <section className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Star Power Reflection
          </h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded">
            {(reportData.growthPlan as any)?.starPowerReflection || 'No reflection provided'}
          </p>
        </section>

        {/* Flow Optimization */}
        <section className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Flow Optimization
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Peak Performance Hours</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {formatFlowHours((reportData.growthPlan as any)?.flowPeakHours)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Flow Catalysts</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {(reportData.growthPlan as any)?.flowCatalysts || 'Not specified'}
              </p>
            </div>
          </div>
        </section>

        {/* Vision Vitality */}
        <section className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <ArrowRight className="w-5 h-5 mr-2 text-purple-500" />
            Vision Vitality
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">START - Where I'm Coming From</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {(reportData.growthPlan as any)?.visionStart || 'Not specified'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">NOW - Current State</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {(reportData.growthPlan as any)?.visionNow || 'Not specified'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">NEXT - Future Direction</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {(reportData.growthPlan as any)?.visionNext || 'Not specified'}
              </p>
            </div>
          </div>
        </section>

        {/* Progress Check */}
        <section className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-500" />
            Progress Check
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">What's Working Well</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {(reportData.growthPlan as any)?.progressWorking || 'Not specified'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Where I Need Help</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {(reportData.growthPlan as any)?.progressNeedHelp || 'Not specified'}
              </p>
            </div>
          </div>
        </section>

        {/* Key Actions */}
        <section className="border rounded-lg p-6 bg-green-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-red-500" />
            Key Actions for {reportData.quarter} {reportData.year}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Top 3 Priorities</h4>
              <div className="bg-white p-3 rounded">
                {(reportData.growthPlan as any)?.keyPriorities && (reportData.growthPlan as any)?.keyPriorities.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {(reportData.growthPlan as any)?.keyPriorities.map((priority: string, index: number) => (
                      <li key={index} className="text-gray-700">{priority}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Not specified</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Success Looks Like</h4>
              <p className="text-gray-600 bg-white p-3 rounded">
                {(reportData.growthPlan as any)?.successLooksLike || 'Not specified'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Dates & Milestones</h4>
              <p className="text-gray-600 bg-white p-3 rounded">
                {(reportData.growthPlan as any)?.keyDates || 'Not specified'}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center border-t pt-6">
        <p className="text-gray-600 mb-4">
          This quarterly growth plan was completed on {reportData.completedDate}
        </p>
        <p className="text-sm text-gray-500">
          Keep this report handy throughout the quarter to track your progress and stay aligned with your goals.
        </p>
      </div>
    </div>
  );
}