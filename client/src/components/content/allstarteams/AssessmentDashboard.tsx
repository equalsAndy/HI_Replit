import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import MBTIAssessment from './MBTIAssessment';
import EnneagramAssessment from './EnneagramAssessment';

interface AssessmentDashboardProps {
  navigate: (direction: 'next' | 'prev') => void;
  markStepCompleted: (stepId: string) => Promise<void>;
  setCurrentContent: (content: string) => void;
}

interface AssessmentData {
  mbti?: {
    type: string;
    variant: string | null;
    resonance: number;
    notes: string;
    completedAt: string;
  };
  enneagram?: {
    type: number;
    wing: number | null;
    resonance: number;
    notes: string;
    completedAt: string;
  };
}

const AssessmentDashboard: React.FC<AssessmentDashboardProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [activeTab, setActiveTab] = useState<'mbti' | 'enneagram'>('mbti');
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load saved assessment data from backend
  useEffect(() => {
    const loadAssessmentData = async () => {
      try {
        const response = await fetch('/api/workshop-data/assessments/ast-5-2', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setAssessmentData(data);
        }
      } catch (error) {
        console.error('Error loading assessment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessmentData();
  }, []);

  const handleMBTISave = async (data: AssessmentData['mbti']) => {
    const newData = { ...assessmentData, mbti: data };
    setAssessmentData(newData);

    // Save to database
    try {
      await fetch('/api/workshop-data/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assessmentType: 'ast-5-2-mbti',
          results: data
        })
      });
    } catch (error) {
      console.error('Error saving MBTI assessment:', error);
    }
  };

  const handleEnneagramSave = async (data: AssessmentData['enneagram']) => {
    const newData = { ...assessmentData, enneagram: data };
    setAssessmentData(newData);

    // Save to database
    try {
      await fetch('/api/workshop-data/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assessmentType: 'ast-5-2-enneagram',
          results: data
        })
      });
    } catch (error) {
      console.error('Error saving Enneagram assessment:', error);
    }
  };

  const handleContinue = async () => {
    await markStepCompleted('5-2');
    navigate('next');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 id="content-title" className="text-3xl font-bold text-blue-600 mb-4">
          Personal Assessment Dashboard
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Share your existing personality assessment results to help us understand how you show up in teams.
          This information is completely optional and enhances (but doesn't replace) the core workshop experience.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'mbti' | 'enneagram')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="mbti" className="text-base">
            🧠 Myers-Briggs (MBTI)
          </TabsTrigger>
          <TabsTrigger value="enneagram" className="text-base">
            ⭕ Enneagram
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mbti">
          <MBTIAssessment
            savedData={assessmentData.mbti}
            onSave={handleMBTISave}
          />
        </TabsContent>

        <TabsContent value="enneagram">
          <EnneagramAssessment
            savedData={assessmentData.enneagram}
            onSave={handleEnneagramSave}
          />
        </TabsContent>
      </Tabs>

      {/* Continue Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          Continue Workshop <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
