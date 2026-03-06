import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import ImaginalAgilityRadarChart from '../ImaginalAgilityRadarChart';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA_2_2_ContentProps {
  onNext?: (stepId: string) => void;
  onOpenAssessment?: () => void;
}


function IA_2_2_Content({ onNext, onOpenAssessment }: IA_2_2_ContentProps) {
  // Check if assessment is completed
  const { data: assessmentData } = useQuery({
    queryKey: ['/api/workshop-data/ia-assessment'],
    queryFn: async () => {
      const response = await fetch('/api/workshop-data/ia-assessment', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: true, // Force refetch when returning to tab
    staleTime: 0 // Always fetch fresh data
  });


  const isAssessmentCompleted = assessmentData && (assessmentData as any).data !== null;

  // Parse assessment results for radar chart
  let resultData = null;
  if (isAssessmentCompleted && (assessmentData as any).data?.results) {
    const rawResults = (assessmentData as any).data.results;
    if (typeof rawResults === 'string') {
      try {
        resultData = JSON.parse(rawResults);
      } catch (e) {
        console.error('Failed to parse assessment results:', e);
      }
    } else if (typeof rawResults === 'object' && rawResults !== null) {
      if (rawResults.imagination !== undefined) {
        resultData = rawResults;
      }
    }
  }

  const handleStartAssessment = () => {
    if (onOpenAssessment) {
      onOpenAssessment();
    }
  };

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
            <h1 className="text-4xl font-bold text-gray-900">Your Prism</h1>
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

              {/* Capability icons — visual only, no numbers */}
              <div className="bg-white rounded-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    {capacity: 'Imagination', score: parseFloat(resultData.imagination) || 0, icon: '/assets/Imagination_new.png', color: 'bg-purple-50 border-purple-200'},
                    {capacity: 'Curiosity',   score: parseFloat(resultData.curiosity)   || 0, icon: '/assets/Curiosity_new.png',   color: 'bg-green-50 border-green-200'},
                    {capacity: 'Caring',      score: parseFloat(resultData.empathy)     || 0, icon: '/assets/Caring_new.png',      color: 'bg-blue-50 border-blue-200'},
                    {capacity: 'Creativity',  score: parseFloat(resultData.creativity)  || 0, icon: '/assets/Creativity_new.png',  color: 'bg-orange-50 border-orange-200'},
                    {capacity: 'Courage',     score: parseFloat(resultData.courage)     || 0, icon: '/assets/Courage_new.png',     color: 'bg-red-50 border-red-200'}
                  ].map(item => (
                    <div key={item.capacity} className={`${item.color} p-3 rounded-lg border text-center flex flex-col items-center justify-center min-h-[220px] overflow-hidden`}>
                      <div className="w-full h-36 mb-3 flex items-center justify-center">
                        <img
                          src={item.icon}
                          alt={item.capacity}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">{item.capacity}</h4>
                      {/* Proportional bar — full card width, stays inside rounded corners */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${(item.score / 5) * 100}%`, backgroundColor: item.score >= 4.0 ? '#10b981' : '#8b5cf6' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                <h4 className="text-lg font-semibold text-purple-900">What's Next</h4>
                <p className="text-gray-700">
                  This prism marks the completion of Module 2. You now have a clear picture of how your core
                  capabilities currently take shape together. In Module 3, you'll begin working with them directly.
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
        <h1 className="text-4xl font-bold text-purple-800">Your I4C Self-Assessment</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          This assessment is a tool for this course — not a profile of who you are.
        </p>
        <p className="text-md text-gray-600 max-w-3xl mx-auto">
          These questions explore how you currently engage with five capabilities:
          Imagination, Curiosity, Caring, Creativity, and Courage. Your answers
          will generate a radar map that shows where you are right now — not where
          you'll always be.
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Imagination', image: '/assets/Imagination_sq.png', description: 'Your ability to envision new possibilities and think beyond current constraints', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
              { label: 'Curiosity',   image: '/assets/Curiosity_sq.png',   description: 'Your drive to explore, question, and seek new knowledge and experiences', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
              { label: 'Caring',      image: '/assets/Caring_sq.png',      description: "Your ability to understand and connect with others' emotional experiences", bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
              { label: 'Creativity',  image: '/assets/Creativity_sq.png',  description: 'Your capacity to generate novel and valuable solutions to challenges', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
              { label: 'Courage',     image: '/assets/courage_sq.png',     description: 'Your willingness to take meaningful risks and act on your convictions', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
            ].map((item, index) => (
              <div key={index} className={`flex items-start gap-3 ${item.bgColor} ${item.borderColor} border rounded-lg p-3`}>
                <img src={item.image} alt={item.label} className="w-10 h-10 object-contain flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Guidance */}
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                A few things to keep in mind
              </h3>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  Answer based on what's actually true for you lately, not what you think should be true.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  There are no good or bad scores. A low number just means that capability hasn't been active recently — it says nothing about your potential.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  Try not to shape your answers toward a particular image of yourself. The more honest you are, the more useful this becomes.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  Your results stay in this course. They're for your learning, not your evaluation.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          The assessment takes about 10–15 minutes.
        </p>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleStartAssessment}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            size="lg"
          >
            Start Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}

export default IA_2_2_Content;
