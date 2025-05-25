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
  
  // Check if assessment is complete based on our data
  const isAssessmentComplete = 
    (assessmentResults && (
      Number(assessmentResults.thinking) > 0 || 
      Number(assessmentResults.acting) > 0 || 
      Number(assessmentResults.feeling) > 0 || 
      Number(assessmentResults.planning) > 0
    )) || false;
  
  // Debug log to check assessment completion status                              
  console.log("Assessment completion check:", {
    hasStarCard: !!starCard,
    hasAssessmentData: !!assessmentData,
    thinking: assessmentResults?.thinking,
    acting: assessmentResults?.acting,
    feeling: assessmentResults?.feeling,
    planning: assessmentResults?.planning,
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
          <p className="text-lg mb-6">
            The AllStarTeams Strengths Assessment helps you discover your unique strengths profile across four key dimensions: Thinking, Acting, Feeling, and Planning.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-5 shadow-sm">
              <h3 className="font-medium text-blue-800 mb-3 text-lg">About this assessment</h3>
              <ul className="text-blue-700 space-y-3">
                <li className="flex items-start">
                  <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>22 questions about how you approach work and collaboration</span>
                </li>
                <li className="flex items-start">
                  <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Takes approximately 10-15 minutes to complete</span>
                </li>
                <li className="flex items-start">
                  <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rank options based on how well they describe you</span>
                </li>
                <li className="flex items-start">
                  <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Creates your personal Star Card showing your strengths distribution</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-5 shadow-sm">
              <h3 className="font-medium text-amber-800 mb-3 text-lg">Instructions</h3>
              <p className="text-amber-700">
                For each scenario, drag and drop the options to rank them from most like you (1) to least 
                like you (4). There are no right or wrong answers - just be honest about your preferences.
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-5 shadow-sm mb-8">
            <h3 className="font-medium text-green-800 mb-3 text-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" /> What you'll get
            </h3>
            <p className="text-green-700">
              Your personal Star Card showing your unique distribution of strengths across the four 
              dimensions: Thinking, Acting, Feeling, and Planning. This will guide your learning journey
              through the rest of the AllStarTeams program.
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
            
            <div className="flex justify-center items-center my-4 w-full px-4">
              <div className="w-full max-w-[800px] h-[350px] lg:h-[400px] mx-auto">
                <AssessmentPieChart
                  thinking={assessmentResults?.thinking || 0}
                  acting={assessmentResults?.acting || 0}
                  feeling={assessmentResults?.feeling || 0}
                  planning={assessmentResults?.planning || 0}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                {(() => {
                  // Calculate total score for proper percentage calculation
                  const thinking = Number(assessmentResults?.thinking) || 0;
                  const planning = Number(assessmentResults?.planning) || 0;
                  const feeling = Number(assessmentResults?.feeling) || 0;
                  const acting = Number(assessmentResults?.acting) || 0;
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