import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, Calendar, Target, TrendingUp, Clock, CheckCircle, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import tuningForkImage from '@assets/turningfork_1749438223210.png';
import StarCard from '@/components/starcard/StarCard';
import WellBeingLadderSvg from '@/components/visualization/WellBeingLadderSvg';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [quarter, setQuarter] = useState('Q2');
  const [year, setYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState<Partial<GrowthPlanData>>({});
  const [use24HourFormat, setUse24HourFormat] = useState(true);

  const queryClient = useQueryClient();

  // Fetch user's Star Card data
  const { data: starCardData } = useQuery({
    queryKey: ['/api/workshop-data/starcard'],
    enabled: currentStep === 1
  });

  // Fetch user's Cantril Ladder data
  const { data: cantrilData } = useQuery({
    queryKey: ['/api/workshop-data/cantril-ladder'],
    enabled: currentStep === 2
  });

  // Fetch flow attributes data
  const { data: flowAttributesData } = useQuery({
    queryKey: ['/api/workshop-data/flow-attributes'],
    enabled: currentStep === 1
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/growth-plan'] });
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
    // Save current step data
    savePlanMutation.mutate(formData);
    
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    } else {
      markStepCompleted('6-1');
      setCurrentContent('final-report');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepTitles = [
    'Quarter Selection',
    'Remember Your Star Power', 
    'Your Ladder',
    'Playing to Strengths',
    'Flow Optimization',
    'Progress Check',
    'Vision Vitality',
    'Key Actions Summary'
  ];

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
                      color: "rgb(59, 130, 246)"
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
    const cantrilResults = (cantrilData as any)?.data as { wellBeingLevel: number; futureWellBeingLevel: number; currentLevel?: number; futureLevel?: number } | undefined;
    
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
              currentValue={cantrilResults?.wellBeingLevel || cantrilResults?.currentLevel || formData.ladderCurrentLevel || 5}
              futureValue={cantrilResults?.futureWellBeingLevel || cantrilResults?.futureLevel || formData.ladderTargetLevel || 7}
            />
          </div>

          <div className="space-y-6">
            {cantrilResults && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h4 className="font-semibold mb-4">Your Current Cantril Ladder Results</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Life Satisfaction:</span>
                    <span className="font-bold">{cantrilResults.wellBeingLevel || cantrilResults.currentLevel}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Future Expectation (1 year):</span>
                    <span className="font-bold">{cantrilResults.futureWellBeingLevel || cantrilResults.futureLevel}/10</span>
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
    const starData = (starCardData as any) || null;
    
    // Create sorted quadrants based on star card data
    const quadrantData = [
      { key: 'planning', label: 'PLANNING', score: starData?.planning || 0 },
      { key: 'thinking', label: 'THINKING', score: starData?.thinking || 0 },
      { key: 'acting', label: 'ACTING', score: starData?.acting || 0 },
      { key: 'feeling', label: 'FEELING', score: starData?.feeling || 0 }
    ].sort((a, b) => b.score - a.score);

    const strengthColors = {
      'PLANNING': { bg: 'bg-yellow-100', circle: 'bg-yellow-500' },
      'THINKING': { bg: 'bg-green-100', circle: 'bg-green-500' },
      'ACTING': { bg: 'bg-red-100', circle: 'bg-red-500' },
      'FEELING': { bg: 'bg-blue-100', circle: 'bg-blue-500' }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <TrendingUp className="w-12 h-12 mx-auto text-orange-500 mb-3" />
          <h3 className="text-xl font-semibold">Playing to Strengths</h3>
          <p className="text-gray-600">Apply your Star Card insights to current projects and challenges</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Purpose</h4>
              <p className="text-sm text-gray-700 mb-4">
                Apply your Star Card insights to current projects and challenges.
              </p>
              
              <h4 className="font-semibold mb-3">Explanation</h4>
              <p className="text-sm text-gray-700 mb-4">
                How are you harnessing your five strengths for maximum impact and engagement.
              </p>

              <h4 className="font-semibold mb-3">Guidelines</h4>
              <p className="text-sm text-gray-700">
                List one stellar example from each following the order of your Star Badge.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Star Card Strength</h4>
                <h4 className="font-semibold">Your Best Example</h4>
              </div>
              
              {quadrantData.map((strength, index) => {
                const colors = strengthColors[strength.label];
                const strengthKey = `strength_${strength.key}`;
                const currentValue = formData.strengthsExamples?.[strengthKey] || '';
                
                return (
                  <div key={strength.key} className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <div className={`${colors.bg} p-2 rounded-full mr-3`}>
                        <div className={`w-6 h-6 ${colors.circle} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                          {index + 1}
                        </div>
                      </div>
                      <span className="font-medium text-sm">
                        {strength.label.charAt(0) + strength.label.slice(1).toLowerCase()} ({strength.score}%)
                      </span>
                    </div>
                    <div>
                      <Textarea
                        placeholder="Type your paragraph..."
                        value={currentValue}
                        onChange={(e) => {
                          const updatedExamples = {
                            ...(formData.strengthsExamples || {}),
                            [strengthKey]: e.target.value
                          };
                          updateFormData('strengthsExamples', updatedExamples);
                        }}
                        className="h-20 text-sm"
                      />
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-600">
                  List strengths in order... Add your best example
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFlowOptimization = () => {
    const formatHour = (hour: number) => {
      if (use24HourFormat) {
        return `${hour.toString().padStart(2, '0')}:00`;
      } else {
        if (hour === 0) return '12:00 AM';
        if (hour === 12) return '12:00 PM';
        if (hour < 12) return `${hour}:00 AM`;
        return `${hour - 12}:00 PM`;
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Clock className="w-12 h-12 mx-auto text-purple-500 mb-3" />
          <h3 className="text-xl font-semibold">Flow Optimization</h3>
          <p className="text-gray-600">Identify and maximize your peak performance periods and energy patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Purpose</h4>
              <p className="text-sm text-gray-700 mb-4">
                Identify and maximize your peak performance periods and energy patterns.
              </p>
              
              <h4 className="font-semibold mb-3">Explanation</h4>
              <p className="text-sm text-gray-700 mb-4">
                Understanding when and how you work best helps align tasks with your natural rhythms.
              </p>

              <h4 className="font-semibold mb-3">Guidelines</h4>
              <p className="text-sm text-gray-700 mb-4">
                Plan Strategically: Align your most demanding or creative tasks with your green-highlighted periods
              </p>

              <div className="mb-4">
                <h5 className="font-medium text-sm mb-2">Mark Flow Times</h5>
                <p className="text-xs text-gray-600">
                  Use green sticky notes on the 24-hour timeline to highlight your peak focus and energy hours.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-sm mb-2">Catalysts: What helps you find flow? 📝</h5>
                <p className="text-xs text-gray-600">
                  Type your response.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Peak Flow Hours</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">12hr</span>
                  <button
                    onClick={() => setUse24HourFormat(!use24HourFormat)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      use24HourFormat ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        use24HourFormat ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-gray-600">24hr</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-3">Select your most productive hours (green highlights)</div>
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
                    className={`p-1 text-xs rounded border ${
                      (formData.flowPeakHours || []).includes(i)
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {formatHour(i)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="flowCatalysts">Catalysts: What helps you find flow?</Label>
              <Textarea
                id="flowCatalysts"
                placeholder="Type your response..."
                value={formData.flowCatalysts || ''}
                onChange={(e) => updateFormData('flowCatalysts', e.target.value)}
                className="h-32"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVisionVitality = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3">
          5
        </div>
        <h3 className="text-xl font-semibold">Vision Vitality</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Purpose</h4>
            <p className="text-sm text-gray-700 mb-4">
              Keep your Module 1 vision active and evolving.
            </p>
            
            <h4 className="font-semibold mb-3">Explanation</h4>
            <p className="text-sm text-gray-700 mb-4">
              Track progress from initial vision through current achievements to next goals.
            </p>

            <h4 className="font-semibold mb-3">Guidelines</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>2. Review Module 1 vision statement</p>
              <p>3. Note START (initial state, challenges)</p>
              <p>4. Document NOW (achievements, current state)</p>
              <p>5. Plan NEXT (priorities, support needed)</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="moduleVision">Module 1 Vision Statement</Label>
            <Textarea
              id="moduleVision"
              placeholder="Type your paragraph..."
              value={formData.visionStart || ''}
              onChange={(e) => updateFormData('visionStart', e.target.value)}
              className="h-20 bg-blue-50"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-300"></div>
            
            <div className="space-y-6">
              <div className="relative pl-12">
                <div className="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h5 className="font-medium mb-1">START</h5>
                  <p className="text-xs text-gray-600 mb-2">Initial State:</p>
                  <Textarea
                    placeholder="Type your paragraph..."
                    value={formData.startState || ''}
                    onChange={(e) => updateFormData('startState', e.target.value)}
                    className="h-16 mb-2 text-sm"
                  />
                  <p className="text-xs text-gray-600 mb-2">Key Challenges:</p>
                  <Textarea
                    placeholder="Type your paragraph..."
                    value={formData.keyChallenges || ''}
                    onChange={(e) => updateFormData('keyChallenges', e.target.value)}
                    className="h-16 text-sm"
                  />
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h5 className="font-medium mb-1">NOW</h5>
                  <p className="text-xs text-gray-600 mb-2">Achievements:</p>
                  <Textarea
                    placeholder="Type your paragraph..."
                    value={formData.visionNow || ''}
                    onChange={(e) => updateFormData('visionNow', e.target.value)}
                    className="h-16 mb-2 text-sm"
                  />
                  <p className="text-xs text-gray-600 mb-2">Current State:</p>
                  <Textarea
                    placeholder="Type your paragraph..."
                    value={formData.currentState || ''}
                    onChange={(e) => updateFormData('currentState', e.target.value)}
                    className="h-16 text-sm"
                  />
                </div>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h5 className="font-medium mb-1">NEXT</h5>
                  <p className="text-xs text-gray-600 mb-2">Priority Focus:</p>
                  <Textarea
                    placeholder="Type your paragraph..."
                    value={formData.visionNext || ''}
                    onChange={(e) => updateFormData('visionNext', e.target.value)}
                    className="h-16 mb-2 text-sm"
                  />
                  <p className="text-xs text-gray-600 mb-2">Support Needed:</p>
                  <Textarea
                    placeholder="Type your paragraph..."
                    value={formData.supportNeeded || ''}
                    onChange={(e) => updateFormData('supportNeeded', e.target.value)}
                    className="h-16 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
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
      case 1: return renderQuarterSelection();
      case 2: return renderStarPower();
      case 3: return renderLadder();
      case 4: return renderPlayingToStrengths();
      case 5: return renderFlowOptimization();
      case 6: return renderProgressCheck();
      case 7: return renderVisionVitality();
      case 8: return renderKeyActions();
      default: return renderQuarterSelection();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src={tuningForkImage} alt="Growth Plan" className="w-8 h-8" />
            Quarterly Growth Plan - {stepTitles[currentStep - 1]}
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
              disabled={currentStep === 1}
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
              {currentStep === 8 ? 'Complete Plan' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}