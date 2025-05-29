import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight, ClipboardCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { AssessmentPieChart } from '@/components/assessment/AssessmentPieChart';

interface AssessmentViewProps extends ContentViewProps {
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

interface StarCard {
  state?: string;
  thinking?: number;
  acting?: number;
  feeling?: number;
  planning?: number;
}

const AssessmentView: React.FC<AssessmentViewProps & { starCard?: StarCard }> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  setIsAssessmentModalOpen,
  starCard
}) => {
  // Fetch the latest assessment data from server using fetch instead of relying on passed props
  const [assessmentData, setAssessmentData] = React.useState<any>(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = React.useState(false);
  
  // Load assessment data directly from the API when component mounts
  React.useEffect(() => {
    const fetchAssessmentData = async () => {
      setIsLoadingAssessment(true);
      try {
        const response = await fetch('/api/workshop-data/userAssessments', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Assessment API response:", data);
          
          // Look for star card assessment in the response
          if (data?.currentUser?.assessments?.starCard) {
            setAssessmentData(data.currentUser.assessments.starCard);
          }
        } else {
          console.error("Failed to fetch assessment data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching assessment data:", error);
      } finally {
        setIsLoadingAssessment(false);
      }
    };
    
    fetchAssessmentData();
  }, []);
  
  // Use the fetched data or fall back to the prop
  const assessmentResults = assessmentData?.formattedResults || starCard;
  
  // Check if the starCard data directly passed as prop has valid scores
  const hasValidStarCardProp = starCard && (
    Number(starCard.thinking) > 0 || 
    Number(starCard.acting) > 0 || 
    Number(starCard.feeling) > 0 || 
    Number(starCard.planning) > 0
  );
  
  // Check if the assessment data we fetched has valid scores
  const hasValidAssessmentData = assessmentData && assessmentData.formattedResults && (
    Number(assessmentData.formattedResults.thinking) > 0 || 
    Number(assessmentData.formattedResults.acting) > 0 || 
    Number(assessmentData.formattedResults.feeling) > 0 || 
    Number(assessmentData.formattedResults.planning) > 0
  );
  
  // Check if direct API call to starcard returns valid data
  const [directStarCardData, setDirectStarCardData] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Directly fetch star card data as a fallback
    const fetchStarCardData = async () => {
      try {
        const response = await fetch('/api/starcard', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Direct StarCard API response:", data);
          setDirectStarCardData(data);
        }
      } catch (error) {
        console.error("Error fetching direct star card data:", error);
      }
    };
    
    if (!hasValidStarCardProp && !hasValidAssessmentData) {
      fetchStarCardData();
    }
  }, [hasValidStarCardProp, hasValidAssessmentData]);
  
  // Check if direct star card API call returned valid data
  const hasValidDirectData = directStarCardData && (
    Number(directStarCardData.thinking) > 0 || 
    Number(directStarCardData.acting) > 0 || 
    Number(directStarCardData.feeling) > 0 || 
    Number(directStarCardData.planning) > 0
  );
  
  // Determine which data source to use
  const effectiveData = hasValidDirectData ? directStarCardData : 
                       hasValidAssessmentData ? assessmentData.formattedResults : 
                       hasValidStarCardProp ? starCard : null;
                       
  // Final assessment completion check
  const isAssessmentComplete = hasValidStarCardProp || hasValidAssessmentData || hasValidDirectData;
  
  // Debug log to check assessment completion status                              
  console.log("Assessment completion check:", {
    hasStarCard: !!starCard,
    hasAssessmentData: !!assessmentData,
    hasValidStarCardProp,
    hasValidAssessmentData,
    hasValidDirectData,
    thinking: effectiveData?.thinking,
    acting: effectiveData?.acting,
    feeling: effectiveData?.feeling,
    planning: effectiveData?.planning,
    isComplete: isAssessmentComplete
  });

  const continueToNextStep = () => {
    markStepCompleted('2-2');
    setCurrentContent('star-card-preview');
  };
  
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Strengths Assessment</h1>
      
      {!isAssessmentComplete ? (
        // Show introduction and start button if assessment is not complete
        <div className="prose max-w-none">
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm mb-6">
            <h3 className="font-medium text-blue-800 mb-3 text-lg">About this assessment</h3>
            <p className="text-blue-700 mb-3 text-sm">
              The AllStarTeams Strengths Assessment helps you discover your unique strengths profile across five key dimensions:
              Thinking, Acting, Feeling, Planning, and Imagining.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-700 text-sm">
              <div>• 22 short questions (10–15 minutes)</div>
              <div>• Rank responses from most to least like you</div>
              <div>• No right or wrong answers</div>
              <div>• Generates your personal Star Card</div>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 shadow-sm mb-6">
            <h3 className="font-medium text-amber-800 mb-3 text-lg">How it works</h3>
            <p className="text-amber-700 text-sm mb-2">
              For each scenario, drag and drop the four options to rank them from most like you (1) to least like you (4).
            </p>
            <p className="text-amber-700 text-sm">
              Your four core strengths (Think, Act, Feel, Plan) are quantified and placed on your Star Card. 
              Imagination appears at the top as your limitless fifth strength.
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 shadow-sm mb-6">
            <h3 className="font-medium text-green-800 mb-2 text-lg flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> What you'll get
            </h3>
            <p className="text-green-700 text-sm">
              Your personal Star Card showing your unique strengths distribution. Later, you'll add Flow State Qualities 
              to complete your profile for personal and team development.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => setIsAssessmentModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
              size="lg"
            >
              {starCard?.state === 'partial' ? 'Continue Assessment' : 'Start Assessment'} <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        // Show assessment results directly in the content view if completed
        <div className="prose max-w-none">
          <div className="bg-green-50 rounded-lg p-5 shadow-sm mb-8">
            <h3 className="font-medium text-green-800 mb-3 text-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" /> Assessment Complete
            </h3>
            <p className="text-green-700">
              Congratulations! You've completed the AllStarTeams Strengths Assessment. Here's your unique strengths profile.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Strengths Profile</h2>
            
            <p className="mb-6">
              Your assessment reveals your natural tendencies across four key dimensions. This profile 
              shows how you naturally approach challenges, collaborate with others, and engage in 
              your work. The AllStarTeams workshop activities will help you explore these dimensions in depth.
            </p>
            
            {/* Yellow Star */}
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-400">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
            </div>
            
            <div className="flex justify-center items-center w-full px-4">
              <div className="w-full max-w-[800px] h-[350px] lg:h-[400px] mx-auto">
                <AssessmentPieChart
                  thinking={effectiveData?.thinking || 0}
                  acting={effectiveData?.acting || 0}
                  feeling={effectiveData?.feeling || 0}
                  planning={effectiveData?.planning || 0}
                />
              </div>
            </div>
            
            {/* Imagination Legend */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-2 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <span className="font-semibold">Imagination</span>
                <span className="ml-3 text-gray-600 text-sm">Your limitless potential capacity that brings<br className="hidden sm:inline" /> the other core dimensions into focus.</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                {(() => {
                  // Calculate total score for proper percentage calculation
                  const thinking = Number(effectiveData?.thinking) || 0;
                  const planning = Number(effectiveData?.planning) || 0;
                  const feeling = Number(effectiveData?.feeling) || 0;
                  const acting = Number(effectiveData?.acting) || 0;
                  const total = thinking + planning + feeling + acting;
                  
                  // Calculate percentages
                  const normalizeValue = (value: number) => total === 0 ? 25 : Math.round((value / total) * 100);
                  
                  // Create and sort data
                  return [
                    { name: 'Thinking', value: thinking, percentage: normalizeValue(thinking), color: 'rgb(1,162,82)', desc: 'Analytical & logical approach' },
                    { name: 'Planning', value: planning, percentage: normalizeValue(planning), color: 'rgb(255,203,47)', desc: 'Organized & methodical' },
                    { name: 'Feeling', value: feeling, percentage: normalizeValue(feeling), color: 'rgb(22,126,253)', desc: 'Empathetic & relationship-focused' },
                    { name: 'Acting', value: acting, percentage: normalizeValue(acting), color: 'rgb(241,64,64)', desc: 'Decisive & action-oriented' }
                  ]
                    .sort((a, b) => b.value - a.value)
                    .map(strength => (
                      <div key={strength.name} className="flex items-center">
                        <div className="w-5 h-5 rounded mr-3" style={{ backgroundColor: strength.color }}></div>
                        <span className="font-semibold">{strength.name}: {strength.percentage}%</span>
                        <span className="ml-3 text-gray-600 text-sm"> - {strength.desc}</span>
                      </div>
                    ));
                })()
                }
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={continueToNextStep}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Continue to Your Star Card <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssessmentView;