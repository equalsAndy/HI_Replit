import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, Calendar, Target, TrendingUp, Clock, CheckCircle, Star, Info, BookOpen, Users, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useCurrentUser } from '@/hooks/use-current-user';
import tuningForkImage from '@assets/turningfork_1749438223210.png';
import StarCard from '@/components/starcard/StarCard';
import WellBeingLadderSvg from '@/components/visualization/WellBeingLadderSvg';
import { getAttributeColor } from '@/components/starcard/starCardConstants';

interface GrowthPlanViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
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

export default function GrowthPlanView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: GrowthPlanViewProps) {
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for intro
  const [quarter, setQuarter] = useState('Q2');
  const [year, setYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState<Partial<GrowthPlanData>>({});

  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  // Fetch user's Star Card data
  const { data: starCardData } = useQuery({
    queryKey: ['/api/workshop-data/starcard'],
    enabled: currentStep >= 1
  });

  // Fetch user's Cantril Ladder data
  const { data: cantrilData } = useQuery({
    queryKey: ['/api/workshop-data/cantril-ladder'],
    enabled: currentStep >= 1
  });

  // Fetch flow attributes data
  const { data: flowAttributesData } = useQuery({
    queryKey: ['/api/workshop-data/flow-attributes'],
    enabled: currentStep >= 1
  });

  // Fetch existing growth plan data
  const { data: existingPlan } = useQuery({
    queryKey: ['/api/growth-plan', quarter, year],
    enabled: !!quarter,
    queryFn: () => apiRequest(`/api/growth-plan?quarter=${quarter}&year=${year}`)
  });

  // Save growth plan mutation
  const savePlanMutation = useMutation({
    mutationFn: (data: Partial<GrowthPlanData>) => 
      apiRequest('/api/growth-plan', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          quarter,
          year
        })
      }),
    onSuccess: (response) => {
      console.log('Growth plan saved successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['/api/growth-plan'] });
    },
    onError: (error) => {
      console.error('Failed to save growth plan:', error);
    }
  });

  // Load existing data when it becomes available
  useEffect(() => {
    if (existingPlan?.success && existingPlan?.data) {
      setFormData(existingPlan.data);
    }
  }, [existingPlan]);

  const updateFormData = (key: keyof GrowthPlanData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    // Save current step data for steps 1-8
    if (currentStep >= 1) {
      savePlanMutation.mutate(formData);
    }
    
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    } else {
      // Removed markStepCompleted call - growth plan completion should not advance menu
      
      // Beta users should go to team workshop prep instead of final report
      if (user?.isBetaTester && user?.role !== 'admin') {
        setCurrentContent('team-workshop-prep');
      } else {
        // setCurrentContent('final-report');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepTitles = [
    'What is a Growth Plan?',
    'Quarter Selection',
    'Remember Your Star Power', 
    'Your Ladder',
    'Playing to Strengths',
    'Flow Optimization',
    'Vision Vitality',
    'Progress Check',
    'Key Actions Summary'
  ];

  const renderIntroduction = () => (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Your Quarterly Growth Plan</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Module 3: Post-Workshop Individual Development
        </p>
      </div>

      {/* What is this? */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="w-5 h-5" />
            What is a Quarterly Growth Plan?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            This post-workshop module is designed for ongoing individual development that builds on 
            your initial workshop experiences and lessons learned. The Growth Plan helps you:
          </p>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Connect your internal vision with actual, observable steps forward</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Apply flow insights to long-term development and sustained performance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Create quarterly reviews with your managers or coaches</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Track progress through measurable, strength-based development</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold">Strengths-Based</h3>
            <p className="text-sm text-gray-600">
              Leverage your Star Card assessment to maximize your natural talents and abilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Goal-Oriented</h3>
            <p className="text-sm text-gray-600">
              Set clear, measurable targets using your Cantril Ladder well-being framework
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Quarterly Rhythm</h3>
            <p className="text-sm text-gray-600">
              Regular 90-day cycles create sustainable growth momentum and accountability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Growth Planning Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Individual Reflection (Steps 1-7)</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Review your Star Power and strengths</li>
                  <li>• Set well-being targets using your ladder</li>
                  <li>• Plan flow optimization strategies</li>
                  <li>• Align with your vision and purpose</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Implementation Focus (Step 8)</h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Define top 3 quarterly priorities</li>
                  <li>• Set success metrics and milestones</li>
                  <li>• Schedule key dates and check-ins</li>
                  <li>• Create accountability structure</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Best Practice:</strong> Ideally, participants can tie this quarterly review 
                with their managers or coaches. The structured approach mirrors those from Module 1 
                to help you connect insights to long-term development and sustained performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Tune-In Prompts Preview */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Team Tune-In 360 Prompts</CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <p className="mb-3">This module includes reflective prompts for team development:</p>
          <ul className="space-y-1 text-sm">
            <li>• "What helps you find flow?"</li>
            <li>• "How are you feeling about our team?"</li>
            <li>• "What do you need to stay engaged?"</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuarterSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 mx-auto text-blue-500 mb-3" />
        <h3 className="text-xl font-semibold">Quarter Selection</h3>
        <p className="text-gray-600">Choose the quarter and year for your growth plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
        <div>
          <Label htmlFor="quarter">Quarter</Label>
          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
              <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
              <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
              <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="year">Year</Label>
          <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {existingPlan?.data && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="text-blue-800">
            <strong>Existing Plan Found:</strong> You have an existing growth plan for {quarter} {year}. 
            You can review and update it as needed.
          </p>
        </div>
      )}
    </div>
  );

  const renderStarPower = () => {
    const starData = (starCardData as any) || null;
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Star className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
          <h3 className="text-xl font-semibold">Remember Your Star Power</h3>
          <p className="text-gray-600">Reflect on your unique strengths constellation from your assessment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Purpose</h4>
              <p className="text-sm text-gray-700 mb-4">
                Your Star Card represents your unique strengths profile. Use this as the foundation for your quarterly growth planning.
              </p>
              
              <h4 className="font-semibold mb-3">How to Use This</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Review your Star Card assessment results</li>
                <li>Consider how these strengths apply to your current role</li>
                <li>Think about opportunities to leverage these strengths</li>
                <li>Identify areas where you can contribute most effectively</li>
              </ol>
            </div>

            <div>
              <Label htmlFor="starPowerReflection">Star Power Reflection</Label>
              <Textarea
                id="starPowerReflection"
                placeholder="How can you leverage your unique strength combination this quarter? What opportunities align with your Star Power?"
                value={formData.starPowerReflection || ''}
                onChange={(e) => updateFormData('starPowerReflection', e.target.value)}
                className="h-32"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <StarCard 
                thinking={starData?.thinking || 0}
                acting={starData?.acting || 0}
                feeling={starData?.feeling || 0}
                planning={starData?.planning || 0}
                flowAttributes={
                  flowAttributesData &&
                  (flowAttributesData as any).attributes &&
                  Array.isArray((flowAttributesData as any).attributes) ?
                  (flowAttributesData as any).attributes.map((attr: any) => {
                    if (!attr || !attr.name) {
                      return { text: "", color: "rgb(156, 163, 175)" };
                    }
                    return {
                      text: attr.name,
                      color: getAttributeColor(attr.name)
                    };
                  }) : []
                }
                downloadable={false}
                preview={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLadder = () => {
    const cantrilResults = (cantrilData as any)?.data as { currentLevel: number; futureLevel: number } | undefined;
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Target className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h3 className="text-xl font-semibold">Your Ladder</h3>
          <p className="text-gray-600">Track your well-being progress and set meaningful targets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <WellBeingLadderSvg 
              currentValue={cantrilResults?.currentLevel || formData.ladderCurrentLevel || 5}
              futureValue={cantrilResults?.futureLevel || formData.ladderTargetLevel || 7}
            />
          </div>

          <div className="space-y-6">
            {cantrilResults && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h4 className="font-semibold mb-4">Your Current Cantril Ladder Results</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Life Satisfaction:</span>
                    <span className="font-bold">{cantrilResults.currentLevel}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Future Expectation (1 year):</span>
                    <span className="font-bold">{cantrilResults.futureLevel}/10</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currentLevel">Mark Current Level (where you are today)</Label>
                <Select 
                  value={formData.ladderCurrentLevel?.toString() || ''} 
                  onValueChange={(value) => updateFormData('ladderCurrentLevel', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level 1-10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetLevel">Set Target Level (realistic stretch goal)</Label>
                <Select 
                  value={formData.ladderTargetLevel?.toString() || ''} 
                  onValueChange={(value) => updateFormData('ladderTargetLevel', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level 1-10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="ladderReflections">Reflections & Action Steps</Label>
              <Textarea
                id="ladderReflections"
                placeholder="What specific actions will help you move from current to target level?"
                value={formData.ladderReflections || ''}
                onChange={(e) => updateFormData('ladderReflections', e.target.value)}
                className="h-32"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayingToStrengths = () => {
    // Extract the actual text value from strengthsExamples
    const strengthsText = typeof formData.strengthsExamples === 'string'
      ? formData.strengthsExamples
      : formData.strengthsExamples?.general || '';

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <TrendingUp className="w-12 h-12 mx-auto text-orange-500 mb-3" />
          <h3 className="text-xl font-semibold">Playing to Strengths</h3>
          <p className="text-gray-600">Apply your Star Card insights to current projects and challenges</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Strengths Examples & Applications</Label>
            <Textarea
              placeholder="How will you apply your top strengths this quarter? Provide specific examples of projects, roles, or responsibilities where you can leverage your unique strength combination..."
              value={strengthsText}
              onChange={(e) => updateFormData('strengthsExamples', { general: e.target.value })}
              className="h-32"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderFlowOptimization = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Clock className="w-12 h-12 mx-auto text-purple-500 mb-3" />
        <h3 className="text-xl font-semibold">Flow Optimization</h3>
        <p className="text-gray-600">Optimize your peak performance hours and flow triggers</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label>Peak Flow Hours</Label>
          <div className="text-sm text-gray-600 mb-3">Select your most productive hours</div>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 24 }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  const currentHours = formData.flowPeakHours || [];
                  const newHours = currentHours.includes(i) 
                    ? currentHours.filter(h => h !== i)
                    : [...currentHours, i];
                  updateFormData('flowPeakHours', newHours);
                }}
                className={`p-2 text-xs rounded border ${
                  (formData.flowPeakHours || []).includes(i)
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {i.toString().padStart(2, '0')}:00
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="flowCatalysts">Flow Catalysts</Label>
          <Textarea
            id="flowCatalysts"
            placeholder="What activities, environments, or conditions help you achieve flow state? How can you optimize these for the quarter ahead?"
            value={formData.flowCatalysts || ''}
            onChange={(e) => updateFormData('flowCatalysts', e.target.value)}
            className="h-32"
          />
        </div>
      </div>
    </div>
  );

  const renderVisionVitality = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 mx-auto text-teal-500 mb-3" />
        <h3 className="text-xl font-semibold">Vision Vitality</h3>
        <p className="text-gray-600">Connect your current work to your larger vision and purpose</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="visionStart">Where I Started</Label>
          <Textarea
            id="visionStart"
            placeholder="Reflect on where you began this journey..."
            value={formData.visionStart || ''}
            onChange={(e) => updateFormData('visionStart', e.target.value)}
            className="h-24"
          />
        </div>

        <div>
          <Label htmlFor="visionNow">Where I Am Now</Label>
          <Textarea
            id="visionNow"
            placeholder="Describe your current state and progress..."
            value={formData.visionNow || ''}
            onChange={(e) => updateFormData('visionNow', e.target.value)}
            className="h-24"
          />
        </div>

        <div>
          <Label htmlFor="visionNext">Where I'm Going Next</Label>
          <Textarea
            id="visionNext"
            placeholder="Outline your next steps and future direction..."
            value={formData.visionNext || ''}
            onChange={(e) => updateFormData('visionNext', e.target.value)}
            className="h-24"
          />
        </div>
      </div>
    </div>
  );

  const renderProgressCheck = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 mx-auto text-blue-500 mb-3" />
        <h3 className="text-xl font-semibold">Progress Check</h3>
        <p className="text-gray-600">Assess what's working and where you need support</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="progressWorking">What's Working Well</Label>
          <Textarea
            id="progressWorking"
            placeholder="Describe what's going well in your current approach..."
            value={formData.progressWorking || ''}
            onChange={(e) => updateFormData('progressWorking', e.target.value)}
            className="h-32"
          />
        </div>

        <div>
          <Label htmlFor="progressNeedHelp">Where I Need Help</Label>
          <Textarea
            id="progressNeedHelp"
            placeholder="Identify areas where you could use support or resources..."
            value={formData.progressNeedHelp || ''}
            onChange={(e) => updateFormData('progressNeedHelp', e.target.value)}
            className="h-32"
          />
        </div>
      </div>
    </div>
  );

  const renderKeyActions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 mx-auto text-red-500 mb-3" />
        <h3 className="text-xl font-semibold">Key Actions Summary</h3>
        <p className="text-gray-600">Define your top priorities and success metrics for the quarter</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="keyPriorities">Top 3 Priorities</Label>
          <Textarea
            id="keyPriorities"
            placeholder="List your three most important priorities for this quarter..."
            value={formData.keyPriorities ? formData.keyPriorities.join('\n') : ''}
            onChange={(e) => updateFormData('keyPriorities', e.target.value.split('\n').filter(p => p.trim()))}
            className="h-24"
          />
        </div>

        <div>
          <Label htmlFor="successLooksLike">Success Looks Like</Label>
          <Textarea
            id="successLooksLike"
            placeholder="Describe what success will look like at the end of this quarter..."
            value={formData.successLooksLike || ''}
            onChange={(e) => updateFormData('successLooksLike', e.target.value)}
            className="h-32"
          />
        </div>

        <div>
          <Label htmlFor="keyDates">Key Dates & Milestones</Label>
          <Textarea
            id="keyDates"
            placeholder="Important dates, deadlines, and milestones for this quarter..."
            value={formData.keyDates || ''}
            onChange={(e) => updateFormData('keyDates', e.target.value)}
            className="h-24"
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderIntroduction();
      case 1: return renderQuarterSelection();
      case 2: return renderStarPower();
      case 3: return renderLadder();
      case 4: return renderPlayingToStrengths();
      case 5: return renderFlowOptimization();
      case 6: return renderVisionVitality();
      case 7: return renderProgressCheck();
      case 8: return renderKeyActions();
      default: return renderIntroduction();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src={tuningForkImage} alt="Growth Plan" className="w-8 h-8" />
            Quarterly Growth Plan - {stepTitles[currentStep]}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Step {currentStep} of 8</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 ml-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / 8) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderCurrentStep()}

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={savePlanMutation.isPending}
            >
              {currentStep === 0 ? 'Begin Growth Planning' : currentStep === 8 ? 'Complete Plan' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}