import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  CheckCircle,
  Circle,
  ExternalLink,
  BarChart3,
  Users,
  Star,
  Save,
  Download,
  ArrowRight
} from 'lucide-react';
import MBTIAssessment from './allstarteams/MBTIAssessment';
import EnneagramAssessment from './allstarteams/EnneagramAssessment';

// Assessment Status Component
const AssessmentStatus = ({ assessmentKey, status, score, onTake, onView }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Circle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <div className="font-medium">{getStatusText()}</div>
          {score && (
            <div className="text-sm text-gray-500">
              Score: {score}
            </div>
          )}
        </div>
      </div>
      <div className="space-x-2">
        {status === 'completed' && (
          <Button size="sm" variant="outline" onClick={onView}>
            View Results
          </Button>
        )}
        <Button size="sm" onClick={onTake}>
          {status === 'completed' ? 'Retake' : 'Take Assessment'}
        </Button>
      </div>
    </div>
  );
};

// Main Component
const ComprehensiveAssessmentsView = ({ navigate, markStepCompleted, setCurrentContent }) => {
  const [activeTab, setActiveTab] = useState('mbti');
  const [assessmentData, setAssessmentData] = useState({
    mbti: null,
    disc: null,
    enneagram: null,
    strengths: null
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('ast-assessments-data');
    if (savedData) {
      try {
        setAssessmentData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved assessment data:', error);
      }
    }
  }, []);

  const saveAssessmentData = async (assessmentType, data) => {
    const newData = { ...assessmentData, [assessmentType]: data };
    setAssessmentData(newData);
    localStorage.setItem('ast-assessments-data', JSON.stringify(newData));

    // Save to database (this data is NOT sent to OpenAI report writer)
    try {
      const response = await fetch('/api/workshop-data/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assessmentType: `ast-5-2-${assessmentType}`, // Prefix to identify as step 5-2
          results: data
        })
      });

      if (!response.ok) {
        console.error('Failed to save assessment to database:', await response.text());
      }
    } catch (error) {
      console.error('Error saving assessment to database:', error);
    }
  };

  const handleAssessmentComplete = async (assessmentType, results) => {
    await saveAssessmentData(assessmentType, results);
  };

  const assessmentConfigs = {
    mbti: {
      title: "Myers-Briggs Type Indicator (MBTI)",
      description: "Discover your personality type and preferences",
      icon: <Users className="h-5 w-5" />,
      color: "green",
      links: [
        { name: "16Personalities (Free)", url: "https://www.16personalities.com/free-personality-test" },
        { name: "123Test MBTI", url: "https://www.123test.com/jung-personality-test/" },
        { name: "Truity TypeFinder", url: "https://www.truity.com/test/type-finder-personality-test-new" }
      ]
    },
    disc: {
      title: "DiSC Personality Assessment",
      description: "Understand your work style and communication preferences",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "purple",
      links: [
        { name: "Truity DiSC (Free Basic)", url: "https://www.truity.com/test/disc-personality-test" },
        { name: "Crystal DiSC Test", url: "https://www.crystalknows.com/disc-personality-test" },
        { name: "123Test DiSC", url: "https://www.123test.com/disc-personality-test/" }
      ]
    },
    enneagram: {
      title: "Enneagram Personality Test",
      description: "Explore your core motivations and behavior patterns",
      icon: <Star className="h-5 w-5" />,
      color: "orange",
      links: [
        { name: "Personality Path (Free)", url: "https://personalitypath.com/free-enneagram-personality-test/" },
        { name: "Truity Enneagram", url: "https://www.truity.com/test/enneagram-personality-test" },
        { name: "Eclectic Energies", url: "https://www.eclecticenergies.com/enneagram/test" }
      ]
    },
    strengths: {
      title: "Strengths Assessment",
      description: "Identify your natural talents and abilities",
      icon: <Star className="h-5 w-5" />,
      color: "amber",
      links: [
        { name: "HIGH5 Test (Free)", url: "https://high5test.com/" },
        { name: "Strengths Test Alternative", url: "https://www.personality-quizzes.com/strengthsfinder" },
        { name: "CliftonStrengths (Paid)", url: "https://www.gallup.com/cliftonstrengths/" }
      ]
    }
  };

  const renderAssessmentContent = (assessmentType) => {
    const config = assessmentConfigs[assessmentType];
    const data = assessmentData[assessmentType];

    if (assessmentType === 'mbti') {
      return (
        <MBTIAssessment
          savedData={data}
          onSave={(results) => saveAssessmentData('mbti', results)}
        />
      );
    }

    if (assessmentType === 'enneagram') {
      return (
        <EnneagramAssessment
          savedData={data}
          onSave={(results) => saveAssessmentData('enneagram', results)}
        />
      );
    }

    // For other assessments (DiSC, Strengths), show the framework
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {config.icon}
              <span>{config.title}</span>
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Familiarity Check */}
            <div className="space-y-3">
              <h4 className="font-medium">Your Familiarity</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="radio" name={`${assessmentType}-familiarity`} value="never-heard" />
                  <span>I've never heard of this assessment</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name={`${assessmentType}-familiarity`} value="heard-not-taken" />
                  <span>I've heard of it but never taken it</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name={`${assessmentType}-familiarity`} value="taken-before" />
                  <span>I've taken it before</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name={`${assessmentType}-familiarity`} value="know-my-type" />
                  <span>I know my type/results</span>
                </label>
              </div>
            </div>

            {/* Free Assessment Links */}
            {config.links && (
              <div className="space-y-3">
                <h4 className="font-medium">Free Assessment Options</h4>
                <div className="grid gap-2">
                  {config.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">{link.name}</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Take one of these free assessments, then return here to enter your results.
                </p>
              </div>
            )}

            {/* Results Entry */}
            <div className="space-y-3">
              <h4 className="font-medium">Enter Your Results</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Type/Score:</label>
                  <input
                    type="text"
                    placeholder={assessmentType === 'mbti' ? 'e.g., INFP' : 'Enter your result'}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">How accurate does this feel? (1-10)</label>
                  <Slider defaultValue={[7]} max={10} min={1} step={1} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Notes:</label>
                  <textarea
                    placeholder="Any insights or observations about your results..."
                    className="w-full p-2 border rounded-md h-20"
                  />
                </div>
                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Results
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 id="content-title" className="text-3xl font-bold text-blue-600 mb-4">
          Assessment Collection
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Explore various personality and strengths assessments to deepen your self-awareness
        </p>
        <p className="text-sm text-gray-500">
          Complete assessments here or elsewhere, then store your results for future reference
        </p>
      </div>

      {/* Assessment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(assessmentConfigs).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {config.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(assessmentConfigs).map((assessmentType) => (
          <TabsContent key={assessmentType} value={assessmentType}>
            {renderAssessmentContent(assessmentType)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={() => setCurrentContent('workshop-resources')}>
          Back to Resources
        </Button>
        <div className="space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button 
            onClick={async () => {
              await markStepCompleted('5-2');
              setCurrentContent('introducing-imaginal-agility');
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue Workshop <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveAssessmentsView;