
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
  const [currentStep, setCurrentStep] = useState(0);
  const [quarter, setQuarter] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState<Partial<GrowthPlanData>>({});
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
        body: JSON.stringify({ ...data, quarter, year })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/growth-plan'] });
    }
  });

  useEffect(() => {
    if (existingPlan?.data) {
      setFormData(existingPlan.data);
    }
  }, [existingPlan]);

  const updateFormData = (field: keyof GrowthPlanData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveProgress = async () => {
    await savePlanMutation.mutateAsync(formData);
  };

  const handleNext = async () => {
    await saveProgress();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      markStepCompleted('5-3');
      setCurrentContent('team-workshop-prep');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentQuarter = () => {
    const month = new Date().getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  };

  const steps = [
    'Quarter Selection',
    'Remember Your Star Power', 
    'Your Ladder',
    'Playing to Strengths',
    'Flow Optimization',
    'Vision Vitality',
    'Progress Check',
    'Key Actions Summary'
  ];

  const renderQuarterSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <img 
          src={tuningForkImage} 
          alt="Quarterly Tune-Up" 
          className="w-32 h-32 mx-auto mb-4 opacity-80"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quarterly Tune-Up</h2>
        <p className="text-gray-600">Select which quarter you're planning for</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="quarter">Quarter</Label>
          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger>
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
              <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
              <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
              <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">Current quarter: {getCurrentQuarter()}</p>
        </div>

        <div>
          <Label htmlFor="year">Year</Label>
          <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={(year - 1).toString()}>{year - 1}</SelectItem>
              <SelectItem value={year.toString()}>{year}</SelectItem>
              <SelectItem value={(year + 1).toString()}>{year + 1}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStarPower = () => {
    const starData = (starCardData as any)?.data as Record<string, number> | undefined;
    const strengths = starData ? 
      Object.entries(starData)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .map(([key]) => key) : 
      [];

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Star className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
          <h3 className="text-xl font-semibold">Remember Your Star Power</h3>
          <p className="text-gray-600">Ground your growth journey in your unique strengths profile</p>
        </div>

        {starData && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h4 className="font-semibold mb-4">Your Star Card Results</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(starData).map(([strength, score]) => (
                <div key={strength} className="flex justify-between items-center p-3 bg-white rounded border">
                  <span className="font-medium capitalize">{strength}</span>
                  <span className="text-lg font-bold text-blue-600">{score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="starReflection">Your Star Power Reflection</Label>
          <Textarea
            id="starReflection"
            placeholder="Reflect on your unique strengths pattern and how it guides your development..."
            value={formData.starPowerReflection || ''}
            onChange={(e) => updateFormData('starPowerReflection', e.target.value)}
            className="h-32"
          />
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

        {cantrilResults && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <h4 className="font-semibold mb-4">Your Current Cantril Ladder Results</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Current Life Satisfaction:</span>
                <span className="font-bold">{cantrilResults.currentLevel}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Future Expectation (5 years):</span>
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
    );
  };

  const renderPlayingToStrengths = () => {
    const starData = (starCardData as any)?.data as Record<string, number> | undefined;
    const strengths = starData ? 
      Object.entries(starData)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .map(([key]) => key) : 
      [];

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <TrendingUp className="w-12 h-12 mx-auto text-orange-500 mb-3" />
          <h3 className="text-xl font-semibold">Playing to Strengths</h3>
          <p className="text-gray-600">Apply your Star Card insights to current projects and challenges</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Guidelines:</strong> List one stellar example from each following the order of your Star Badge
          </p>
        </div>

        {strengths.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold">Your Strengths in Order - Add Your Best Examples</h4>
            {strengths.map((strength, index) => (
              <div key={strength} className="border border-gray-200 p-4 rounded-lg bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h5 className="font-medium capitalize text-lg">{strength}</h5>
                  <span className="text-sm text-gray-500">
                    (Score: {starData?.[strength]})
                  </span>
                </div>
                <Textarea
                  placeholder={`Type your best example of ${strength}...`}
                  value={formData.strengthsExamples?.[strength] || ''}
                  onChange={(e) => {
                    const examples = { ...formData.strengthsExamples || {} };
                    examples[strength] = e.target.value;
                    updateFormData('strengthsExamples', examples);
                  }}
                  className="h-20"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Complete your Star Card assessment first to see your strengths here.
          </div>
        )}
      </div>
    );
  };

  const renderFlowOptimization = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const selectedHours = formData.flowPeakHours || [];

    const toggleHour = (hour: number) => {
      const current = selectedHours.includes(hour);
      let newHours;
      if (current) {
        newHours = selectedHours.filter(h => h !== hour);
      } else {
        newHours = [...selectedHours, hour].sort((a, b) => a - b);
      }
      updateFormData('flowPeakHours', newHours);
    };

    const formatHour = (hour: number) => {
      if (hour === 0) return '12 AM';
      if (hour === 12) return '12 PM';
      if (hour < 12) return `${hour} AM`;
      return `${hour - 12} PM`;
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Clock className="w-12 h-12 mx-auto text-blue-500 mb-3" />
          <h3 className="text-xl font-semibold">Flow Optimization</h3>
          <p className="text-gray-600">Identify and maximize your peak performance periods and energy patterns</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Guidelines:</strong> Plan Strategically. Align your most demanding or creative tasks with your green-highlighted periods
          </p>
          <p className="text-sm text-blue-700">
            Mark Flow Times: Use green sticky notes on the 24-hour timeline to highlight your peak focus and energy hours.
          </p>
        </div>

        <div>
          <Label>Mark Your Peak Focus Hours (click to select/deselect)</Label>
          <div className="grid grid-cols-6 gap-2 mt-3">
            {hours.map(hour => (
              <button
                key={hour}
                type="button"
                onClick={() => toggleHour(hour)}
                className={`p-3 text-sm border rounded transition-all ${
                  selectedHours.includes(hour)
                    ? 'bg-green-500 text-white border-green-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}
              >
                {formatHour(hour)}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Selected hours: {selectedHours.length > 0 ? selectedHours.map(formatHour).join(', ') : 'None'}
          </p>
        </div>

        <div>
          <Label htmlFor="flowCatalysts">Catalysts: What helps you find flow?</Label>
          <Textarea
            id="flowCatalysts"
            placeholder="Describe what helps you get into flow state - environment, activities, conditions..."
            value={formData.flowCatalysts || ''}
            onChange={(e) => updateFormData('flowCatalysts', e.target.value)}
            className="h-24"
          />
        </div>
      </div>
    );
  };

  const renderVisionVitality = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 mx-auto text-indigo-500 mb-3" />
        <h3 className="text-xl font-semibold">Vision Vitality</h3>
        <p className="text-gray-600">Keep your Module 1 vision active and evolving</p>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
        <p className="text-sm text-indigo-800 mb-2">
          <strong>Purpose:</strong> Keep your Module 1 vision active and evolving
        </p>
        <p className="text-sm text-indigo-700 mb-2">
          <strong>Explanation:</strong> Track progress from initial vision through current achievements to next goals.
        </p>
        <div className="text-sm text-indigo-700">
          <strong>Guidelines:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Review Module 1 vision statement</li>
            <li>Note START (initial state, challenges)</li>
            <li>Document NOW (achievements, current state)</li>
            <li>Plan NEXT (priorities, support needed)</li>
          </ol>
        </div>
      </div>

      <div>
        <Label htmlFor="visionStatement">Module 1 Vision Statement</Label>
        <Textarea
          id="visionStatement"
          placeholder="Enter your original vision statement from Module 1..."
          value={formData.visionStart || ''}
          onChange={(e) => updateFormData('visionStart', e.target.value)}
          className="h-24"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <h4 className="font-semibold text-red-800">START</h4>
          </div>
          <Label htmlFor="visionStartState" className="text-sm">Initial State:</Label>
          <Textarea
            id="visionStartState"
            placeholder="Key challenges..."
            value={formData.visionStart || ''}
            onChange={(e) => updateFormData('visionStart', e.target.value)}
            className="h-20 mt-1"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <h4 className="font-semibold text-yellow-800">NOW</h4>
          </div>
          <Label htmlFor="visionNowState" className="text-sm">Current State:</Label>
          <Textarea
            id="visionNowState"
            placeholder="Current achievements..."
            value={formData.visionNow || ''}
            onChange={(e) => updateFormData('visionNow', e.target.value)}
            className="h-20 mt-1"
          />
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <h4 className="font-semibold text-green-800">NEXT</h4>
          </div>
          <Label htmlFor="visionNextFocus" className="text-sm">Priority Focus:</Label>
          <Textarea
            id="visionNextFocus"
            placeholder="Support needed..."
            value={formData.visionNext || ''}
            onChange={(e) => updateFormData('visionNext', e.target.value)}
            className="h-20 mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderProgressCheck = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 mx-auto text-teal-500 mb-3" />
        <h3 className="text-xl font-semibold">How am I doing?</h3>
        <p className="text-gray-600">Quick check-in on your progress and team dynamics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-4">How am I doing?</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="workingWell">Working well:</Label>
              <Textarea
                id="workingWell"
                placeholder="What's going well for you..."
                value={formData.progressWorking || ''}
                onChange={(e) => updateFormData('progressWorking', e.target.value)}
                className="h-20"
              />
            </div>

            <div>
              <Label htmlFor="needHelp">Need help with:</Label>
              <Textarea
                id="needHelp"
                placeholder="Areas where you need support..."
                value={formData.progressNeedHelp || ''}
                onChange={(e) => updateFormData('progressNeedHelp', e.target.value)}
                className="h-20"
              />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-4">Quick Team Check</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="flowStatus">Flow status:</Label>
              <Input
                id="flowStatus"
                placeholder="Team flow dynamics..."
                value={formData.teamFlowStatus || ''}
                onChange={(e) => updateFormData('teamFlowStatus', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="energySource">Energy source:</Label>
              <Input
                id="energySource"
                placeholder="What energizes the team..."
                value={formData.teamEnergySource || ''}
                onChange={(e) => updateFormData('teamEnergySource', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="nextCheckin">Next check-in:</Label>
              <Input
                id="nextCheckin"
                placeholder="When to reconnect..."
                value={formData.teamNextCheckin || ''}
                onChange={(e) => updateFormData('teamNextCheckin', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeyActions = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 mx-auto text-purple-500 mb-3" />
        <h3 className="text-xl font-semibold">Key Actions - Next 90 Days</h3>
        <p className="text-gray-600">Summarize your priorities and success metrics</p>
      </div>

      <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-800 mb-4">TOP 3 PRIORITIES</h4>
            <div className="space-y-3">
              {[1, 2, 3].map(num => (
                <div key={num}>
                  <Label htmlFor={`priority${num}`}>{num}.</Label>
                  <Input
                    id={`priority${num}`}
                    placeholder="Type your priority..."
                    value={formData.keyPriorities?.[num - 1] || ''}
                    onChange={(e) => {
                      const priorities = [...(formData.keyPriorities || ['', '', ''])];
                      priorities[num - 1] = e.target.value;
                      updateFormData('keyPriorities', priorities);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-purple-800 mb-4">SUCCESS LOOKS LIKE</h4>
            <Textarea
              placeholder="Describe what success looks like..."
              value={formData.successLooksLike || ''}
              onChange={(e) => updateFormData('successLooksLike', e.target.value)}
              className="h-32"
            />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold text-purple-800 mb-4">KEY DATES & SUPPORT</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keyDates30">30 days:</Label>
              <Input
                id="keyDates30"
                placeholder="30-day milestone..."
                value={formData.keyDates || ''}
                onChange={(e) => updateFormData('keyDates', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="keyDates60">60 days:</Label>
              <Input
                id="keyDates60"
                placeholder="60-day checkpoint..."
                value={formData.keyDates || ''}
                onChange={(e) => updateFormData('keyDates', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Quarterly Tune-Up Complete!</h3>
        <p className="text-green-700">
          Your {quarter} {year} growth plan has been saved. Use this as your guide for the next 90 days.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              Quarterly Tune-Up - {steps[currentStep]}
            </CardTitle>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {currentStep === 0 && renderQuarterSelection()}
            {currentStep === 1 && renderStarPower()}
            {currentStep === 2 && renderLadder()}
            {currentStep === 3 && renderPlayingToStrengths()}
            {currentStep === 4 && renderFlowOptimization()}
            {currentStep === 5 && renderVisionVitality()}
            {currentStep === 6 && renderProgressCheck()}
            {currentStep === 7 && renderKeyActions()}
            
            {/* Navigation */}
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
                disabled={currentStep === 0 && !quarter}
                className="flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
