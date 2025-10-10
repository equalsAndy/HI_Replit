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
  Brain,
  Star,
  Save,
  Download,
  ArrowRight
} from 'lucide-react';
import WooScaleContainer from './allstarteams/WooScaleContainer';
import MBTIAssessment from './allstarteams/MBTIAssessment';
import EnneagramAssessment from './allstarteams/EnneagramAssessment';

// Woo Orientation Inventory Component
const WooInventoryComponent = ({ onComplete, savedData, onSave }) => {
  const [currentSection, setCurrentSection] = useState('core');
  const [responses, setResponses] = useState(savedData || {
    core: {},
    wordResonance: {}
  });

  // Core 12 Questions (from the Woo document)
  const coreQuestions = [
    { id: 1, text: "I get uncomfortable when people talk about 'energy' or unseen forces.", reverse: true },
    { id: 2, text: "I often sense meaning or pattern beneath the surface of events.", reverse: false },
    { id: 3, text: "I can appreciate symbolic or metaphorical language even if I don't take it literally.", reverse: false },
    { id: 4, text: "I prefer facts to feelings when making decisions.", reverse: true },
    { id: 5, text: "Imagination is one of the most practical tools humans have.", reverse: false },
    { id: 6, text: "I use intuition or 'gut feeling' as valid input when reasoning.", reverse: false },
    { id: 7, text: "Creativity needs structure and evidence to be useful.", reverse: true },
    { id: 8, text: "I enjoy exploring ideas that can't be proven but feel meaningful.", reverse: false },
    { id: 9, text: "I find practices like mindfulness or meditation helpful for grounding or reflection.", reverse: false },
    { id: 10, text: "I get frustrated when conversations become too abstract.", reverse: true },
    { id: 11, text: "Everything in life is connected in ways science hasn't yet explained.", reverse: false },
    { id: 12, text: "I sometimes experience coincidences or synchronicities as personally significant.", reverse: false }
  ];

  const wordResonanceQuestions = [
    { id: 'astrology', word: 'Astrology', description: 'Used only as metaphor for meaning-making' },
    { id: 'faith', word: 'Faith', description: 'General trust or openness, not religion' },
    { id: 'imagination', word: 'Imagination', description: 'Creative and generative thinking' }
  ];

  const handleCoreResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      core: { ...prev.core, [questionId]: value }
    }));
  };

  const handleWordResponse = (wordId, value) => {
    setResponses(prev => ({
      ...prev,
      wordResonance: { ...prev.wordResonance, [wordId]: value }
    }));
  };

  const calculateWOA = () => {
    const coreResponses = responses.core;
    const validResponses = Object.entries(coreResponses).filter(([_, value]) => value !== 0);
    
    if (validResponses.length === 0) return 0;
    
    const sum = validResponses.reduce((acc, [questionId, value]) => {
      const question = coreQuestions.find(q => q.id === parseInt(questionId));
      const adjustedValue = question?.reverse ? (6 - value) : value;
      return acc + adjustedValue;
    }, 0);
    
    return (sum / validResponses.length).toFixed(1);
  };

  const calculateWRI = () => {
    const wordResponses = responses.wordResonance;
    const values = Object.values(wordResponses);
    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getWooLevel = (composite) => {
    if (composite >= 4.5) return { level: 5, label: "High Woo", color: "bg-purple-600" };
    if (composite >= 3.5) return { level: 4, label: "Medium-High Woo", color: "bg-purple-500" };
    if (composite >= 2.5) return { level: 3, label: "Medium Woo", color: "bg-blue-500" };
    if (composite >= 1.5) return { level: 2, label: "Medium-Low Woo", color: "bg-green-500" };
    return { level: 1, label: "Low Woo", color: "bg-gray-500" };
  };

  const isComplete = () => {
    return Object.keys(responses.core).length === 12 && 
           Object.keys(responses.wordResonance).length === 3;
  };

  const handleComplete = () => {
    const woa = parseFloat(calculateWOA());
    const wri = parseFloat(calculateWRI());
    const composite = woa * 0.8 + wri * 0.2;
    const wooLevel = getWooLevel(composite);
    
    const results = {
      woa,
      wri,
      composite,
      level: wooLevel.level,
      label: wooLevel.label,
      responses,
      completedAt: new Date().toISOString()
    };
    
    onSave('woo', results);
    onComplete('woo', results);
  };

  if (currentSection === 'results' && isComplete()) {
    const woa = parseFloat(calculateWOA());
    const wri = parseFloat(calculateWRI());
    const composite = woa * 0.8 + wri * 0.2;
    const wooLevel = getWooLevel(composite);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-blue-600 mb-2">Your Woo Orientation Results</h3>
          <p className="text-gray-600">Your relationship with imagination, ambiguity, and symbolic language</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Woo Orientation Average (WOA)</CardTitle>
              <CardDescription>Your comfort with imagination and metaphor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">{woa}/5.0</div>
              <Progress value={(woa / 5) * 100} className="w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Word Resonance Index (WRI)</CardTitle>
              <CardDescription>Your comfort with culturally loaded terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">{wri}/5.0</div>
              <Progress value={(wri / 5) * 100} className="w-full" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Overall Woo Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-4 h-4 rounded-full ${wooLevel.color}`}></div>
              <span className="text-2xl font-bold">{wooLevel.label}</span>
              <Badge variant="outline">{composite.toFixed(1)}/5.0</Badge>
            </div>
            <Progress value={(composite / 5) * 100} className="w-full mb-4" />
            <p className="text-sm text-gray-600">
              🔐 Your responses are private and stored only in your browser unless you choose to save them.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-3">
          <Button 
            onClick={() => setCurrentSection('core')}
            variant="outline"
          >
            Retake Assessment
          </Button>
          <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700">
            Save Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-600 mb-2">Woo Orientation Inventory v3</h3>
        <p className="text-gray-600">Privacy-First, Non-Religious Assessment</p>
        <div className="mt-4 text-sm text-gray-500 space-y-1">
          <p>🕊️ It is not about belief or religion. There are no right or wrong answers.</p>
          <p>🔒 Your responses are private — not shared with your organization or facilitator.</p>
          <p>🌈 Results are anonymous and stored only in your browser unless you choose to export them.</p>
        </div>
      </div>

      <Tabs value={currentSection} onValueChange={setCurrentSection}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="core">Core 12 Questions</TabsTrigger>
          <TabsTrigger value="words">Word Resonance</TabsTrigger>
          <TabsTrigger value="results" disabled={!isComplete()}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section A - Core Scale (12 items)</CardTitle>
              <CardDescription>
                Measures comfort with imagination, metaphor, and ambiguity.
                Rate each statement from Strongly Agree (5) to Strongly Disagree (1), or select "Prefer not to answer" (0).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {coreQuestions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <p className="font-medium">{question.id}. {question.text}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 w-20">Strongly Disagree</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleCoreResponse(question.id, value)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                            responses.core[question.id] === value
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 w-20">Strongly Agree</span>
                    <button
                      onClick={() => handleCoreResponse(question.id, 0)}
                      className={`px-3 py-1 text-xs rounded border ${
                        responses.core[question.id] === 0
                          ? 'bg-gray-200 border-gray-400'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Prefer not to answer
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="words" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section B - Word Resonance Scale</CardTitle>
              <CardDescription>
                Rate your personal comfort or resonance with these words (1 = Uncomfortable, 3 = Neutral, 5 = Comfortable).
                These words are used only as metaphors for meaning-making.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {wordResonanceQuestions.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div>
                    <p className="font-medium">{item.word}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 w-24">Uncomfortable</span>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleWordResponse(item.id, value)}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                            responses.wordResonance[item.id] === value
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 w-24">Comfortable</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Complete both sections to see your results.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {currentSection !== 'results' && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Progress: {Object.keys(responses.core).length + Object.keys(responses.wordResonance).length}/15 questions
          </div>
          <div className="space-x-2">
            {currentSection === 'core' && Object.keys(responses.core).length === 12 && (
              <Button onClick={() => setCurrentSection('words')}>
                Next: Word Resonance <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {currentSection === 'words' && isComplete() && (
              <Button onClick={() => setCurrentSection('results')}>
                View Results <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('woo');
  const [assessmentData, setAssessmentData] = useState({
    woo: null,
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

  // Helper function to get Woo level name from score (12-question scale)
  const getWooLevelName = (score) => {
    if (score >= 55) return "Cosmic Wanderer";
    if (score >= 45) return "Intuitive Explorer";
    if (score >= 33) return "Balanced Bridger";
    if (score >= 21) return "Grounded Pragmatist";
    return "Rational Realist";
  };

  const assessmentConfigs = {
    woo: {
      title: "Woo Scale",
      description: "A playful exploration of your relationship with imagination, intuition, and mystery",
      icon: <Brain className="h-5 w-5" />,
      color: "blue"
    },
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

    if (assessmentType === 'woo') {
      return (
        <WooScaleContainer
          onComplete={(results) => handleAssessmentComplete('woo', results)}
          savedData={data}
          onSave={(results) => saveAssessmentData('woo', results)}
          onSkip={() => setActiveTab('mbti')}
        />
      );
    }

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
        <TabsList className="grid w-full grid-cols-5">
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