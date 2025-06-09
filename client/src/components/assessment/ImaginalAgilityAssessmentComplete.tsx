import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Eye, Heart, Lightbulb, Shield } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ImaginalAgilityAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (results: any) => void;
}

const ImaginalAgilityAssessment = ({ isOpen, onClose, onComplete }: ImaginalAgilityAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Demo answers for testing
  const demoAnswers = {
    imagination_gf_1: 4,
    imagination_gf_2: 5,
    imagination_tf_1: 3,
    imagination_tf_2: 4,
    imagination_pa_1: 5,
    imagination_pa_2: 4,
    imagination_bp_1: 4,
    imagination_bp_2: 3,
    imagination_at_1: 3,
    imagination_at_2: 4,
    imagination_et_1: 4,
    imagination_et_2: 5,
    imagination_pw_1: 5,
    curiosity_1: 4,
    curiosity_2: 4,
    empathy_1: 3,
    empathy_2: 4,
    creativity_1: 4,
    creativity_2: 3,
    courage_1: 3,
    courage_2: 4
  };

  const questions = [
    // Imagination - Generative Fluency (2 questions)
    {
      id: 'imagination_gf_1',
      category: 'imagination',
      subcategory: 'generativeFluency',
      text: 'I can easily come up with multiple, unconventional ideas.',
      icon: <Lightbulb className="w-5 h-5" />
    },
    {
      id: 'imagination_gf_2',
      category: 'imagination',
      subcategory: 'generativeFluency',
      text: 'I often generate new ideas in my daily life.',
      icon: <Lightbulb className="w-5 h-5" />
    },
    // Imagination - Temporal Flexibility (2 questions)
    {
      id: 'imagination_tf_1',
      category: 'imagination',
      subcategory: 'temporalFlexibility',
      text: 'I can vividly imagine different possible futures or pasts.',
      icon: <Eye className="w-5 h-5" />
    },
    {
      id: 'imagination_tf_2',
      category: 'imagination',
      subcategory: 'temporalFlexibility',
      text: 'I often reflect on alternative outcomes before making decisions.',
      icon: <Eye className="w-5 h-5" />
    },
    // Imagination - Perspectival Agility (2 questions)
    {
      id: 'imagination_pa_1',
      category: 'imagination',
      subcategory: 'perspectivalAgility',
      text: 'I can imagine experiences beyond my current reality.',
      icon: <Eye className="w-5 h-5" />
    },
    {
      id: 'imagination_pa_2',
      category: 'imagination',
      subcategory: 'perspectivalAgility',
      text: 'I frequently consider other people\'s viewpoints in discussions.',
      icon: <Eye className="w-5 h-5" />
    },
    // Imagination - Boundary Permeability (2 questions)
    {
      id: 'imagination_bp_1',
      category: 'imagination',
      subcategory: 'boundaryPermeability',
      text: 'I\'m comfortable blending ideas from different domains (e.g., science and art).',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'imagination_bp_2',
      category: 'imagination',
      subcategory: 'boundaryPermeability',
      text: 'I actively seek inspiration from outside my usual field.',
      icon: <BarChart3 className="w-5 h-5" />
    },
    // Imagination - Ambiguity Tolerance (2 questions)
    {
      id: 'imagination_at_1',
      category: 'imagination',
      subcategory: 'ambiguityTolerance',
      text: 'I can explore complex ideas without needing quick answers.',
      icon: <Eye className="w-5 h-5" />
    },
    {
      id: 'imagination_at_2',
      category: 'imagination',
      subcategory: 'ambiguityTolerance',
      text: 'I feel comfortable with uncertainty when solving problems.',
      icon: <Eye className="w-5 h-5" />
    },
    // Imagination - Embodied Translation (2 questions)
    {
      id: 'imagination_et_1',
      category: 'imagination',
      subcategory: 'embodiedTranslation',
      text: 'I can turn abstract ideas into tangible actions or prototypes.',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'imagination_et_2',
      category: 'imagination',
      subcategory: 'embodiedTranslation',
      text: 'I take steps to bring my ideas to life.',
      icon: <BarChart3 className="w-5 h-5" />
    },
    // Imagination - Playful Wonder (1 question)
    {
      id: 'imagination_pw_1',
      category: 'imagination',
      subcategory: 'playfulWonder',
      text: 'I allow myself to daydream, imagine, or wonder—even if it feels unproductive.',
      icon: <Heart className="w-5 h-5" />
    },
    // Curiosity (2 questions)
    {
      id: 'curiosity_1',
      category: 'curiosity',
      subcategory: 'explorationDrive',
      text: 'I frequently seek out new experiences or knowledge.',
      icon: <Eye className="w-5 h-5" />
    },
    {
      id: 'curiosity_2',
      category: 'curiosity',
      subcategory: 'explorationDrive',
      text: 'I enjoy exploring unfamiliar topics.',
      icon: <Eye className="w-5 h-5" />
    },
    // Empathy (2 questions)
    {
      id: 'empathy_1',
      category: 'empathy',
      subcategory: 'emotionalInsight',
      text: 'I\'m good at understanding how others feel.',
      icon: <Heart className="w-5 h-5" />
    },
    {
      id: 'empathy_2',
      category: 'empathy',
      subcategory: 'emotionalInsight',
      text: 'I try to see situations through others\' eyes.',
      icon: <Heart className="w-5 h-5" />
    },
    // Creativity (2 questions)
    {
      id: 'creativity_1',
      category: 'creativity',
      subcategory: 'appliedCreativity',
      text: 'I engage regularly in creative activities (e.g., art, writing, design).',
      icon: <Lightbulb className="w-5 h-5" />
    },
    {
      id: 'creativity_2',
      category: 'creativity',
      subcategory: 'appliedCreativity',
      text: 'I often come up with novel solutions to everyday challenges.',
      icon: <Lightbulb className="w-5 h-5" />
    },
    // Courage (2 questions)
    {
      id: 'courage_1',
      category: 'courage',
      subcategory: 'principledAction',
      text: 'I take risks to pursue ideas or values I believe in.',
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 'courage_2',
      category: 'courage',
      subcategory: 'principledAction',
      text: 'I stand up for what I believe, even when it\'s unpopular.',
      icon: <Shield className="w-5 h-5" />
    }
  ];

  const scaleLabels = [
    { value: 5, label: 'Strongly Agree' },
    { value: 4, label: 'Agree' },
    { value: 3, label: 'Neutral' },
    { value: 2, label: 'Disagree' },
    { value: 1, label: 'Strongly Disagree' }
  ];

  const categoryColors = {
    imagination: 'bg-purple-500',
    curiosity: 'bg-blue-500',
    empathy: 'bg-green-500',
    creativity: 'bg-orange-500',
    courage: 'bg-red-500'
  };

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const fillDemoAnswers = () => {
    setIsDemoMode(true);
    setResponses(demoAnswers);
    // Jump to last question but don't auto-submit
    setCurrentQuestion(questions.length - 1);
  };

  const calculateScores = () => {
    // Calculate imagination sub-dimension scores
    const imaginationSubDimensions = {
      generativeFluency: (responses.imagination_gf_1 + responses.imagination_gf_2) / 2,
      temporalFlexibility: (responses.imagination_tf_1 + responses.imagination_tf_2) / 2,
      perspectivalAgility: (responses.imagination_pa_1 + responses.imagination_pa_2) / 2,
      boundaryPermeability: (responses.imagination_bp_1 + responses.imagination_bp_2) / 2,
      ambiguityTolerance: (responses.imagination_at_1 + responses.imagination_at_2) / 2,
      embodiedTranslation: (responses.imagination_et_1 + responses.imagination_et_2) / 2,
      playfulWonder: responses.imagination_pw_1
    };

    // Calculate overall scores
    const calculatedScores = {
      imagination: Object.values(imaginationSubDimensions).reduce((a, b) => a + b, 0) / 7,
      curiosity: (responses.curiosity_1 + responses.curiosity_2) / 2,
      empathy: (responses.empathy_1 + responses.empathy_2) / 2,
      creativity: (responses.creativity_1 + responses.creativity_2) / 2,
      courage: (responses.courage_1 + responses.courage_2) / 2,
      subDimensions: imaginationSubDimensions
    };

    setScores(calculatedScores);
    setShowResults(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (Object.keys(responses).length === questions.length) {
      calculateScores();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isAnswered = responses[currentQ.id] !== undefined;
  const allQuestionsAnswered = Object.keys(responses).length === questions.length;

  if (showResults && scores) {
    const radarData = [
      {
        capacity: 'Imagination',
        score: scores.imagination,
        fullMark: 5,
      },
      {
        capacity: 'Curiosity',
        score: scores.curiosity,
        fullMark: 5,
      },
      {
        capacity: 'Empathy',
        score: scores.empathy,
        fullMark: 5,
      },
      {
        capacity: 'Creativity',
        score: scores.creativity,
        fullMark: 5,
      },
      {
        capacity: 'Courage',
        score: scores.courage,
        fullMark: 5,
      },
    ];

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Your Imaginal Agility Profile</h2>
          <p className="text-lg text-gray-600">
            Your unique combination of imagination, curiosity, empathy, creativity, and courage
          </p>
          {isDemoMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
              <p className="text-blue-800 text-sm font-medium">
                📊 Demo Results - Sample data for testing purposes
              </p>
            </div>
          )}
        </div>

        {/* Spider/Radar Chart Visualization */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Capacity Radar Chart</h3>
            <p className="text-sm text-gray-600 mt-2">Your scores plotted on a 5-point scale</p>
          </div>
          
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="capacity" 
                  tick={{ fontSize: 14, fontWeight: 'bold', fill: '#374151' }}
                  className="text-gray-700"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 5]} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickCount={6}
                />
                <Radar
                  name="Capacity Scores"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Numerical Scores */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            {radarData.map((item) => (
              <div key={item.capacity} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {item.score.toFixed(1)}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {item.capacity}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  out of 5.0
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Imagination Sub-Dimensions */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Imagination Sub-Dimensions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(scores.subDimensions).map(([dimension, score]) => (
              <div key={dimension} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="font-medium text-gray-900 capitalize">
                  {dimension.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-lg font-bold text-purple-600">{score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interpretation Guide */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Understanding Your Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Strengths (4.0+)</h4>
              <p className="text-sm text-gray-600 mb-3">
                These capacities are your superpowers. Leverage them in your work and relationships.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                {radarData.filter(item => item.score >= 4.0).map(item => (
                  <li key={item.capacity} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {item.capacity}: {item.score.toFixed(1)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Growth Areas (Below 3.5)</h4>
              <p className="text-sm text-gray-600 mb-3">
                Consider developing these areas through targeted practice and reflection.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                {radarData.filter(item => item.score < 3.5).map(item => (
                  <li key={item.capacity} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    {item.capacity}: {item.score.toFixed(1)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Steps */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps for Growth</h3>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Reflection Questions</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Which recent moment best reflects your courage in action?</li>
                <li>• How has your imagination helped you navigate a recent challenge?</li>
                <li>• Where do you feel most curious in your current life or work?</li>
                <li>• What situation recently expanded your empathy or understanding of others?</li>
                <li>• When did creativity last help you solve a difficult problem?</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Development Recommendations</h4>
              <p className="text-sm text-gray-700">
                Consider retaking this assessment every 3-6 months to track your growth. 
                Focus on one capacity at a time for sustained development.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => {
              setCurrentQuestion(0);
              setResponses({});
              setShowResults(false);
              setScores(null);
              setIsDemoMode(false);
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Imaginal Agility Assessment</h1>
            <p className="text-lg text-gray-600 mt-2">
              Discover your unique profile across five foundational human capacities essential for adaptive intelligence in the AI era
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500 mt-4">
              <span>• Imagination</span>
              <span>• Curiosity</span>
              <span>• Empathy</span>
              <span>• Creativity</span>
              <span>• Courage</span>
            </div>
          </div>
          <button
            onClick={fillDemoAnswers}
            className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Demo Mode
          </button>
        </div>
        {isDemoMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-blue-800 text-sm font-medium">
              Demo mode activated! All questions filled with sample answers. Review and click "View Results" when ready.
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <div className="space-y-6">
          {/* Category Badge */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${categoryColors[currentQ.category]} text-white`}>
              {currentQ.icon}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[currentQ.category]} text-white`}>
              {currentQ.category.charAt(0).toUpperCase() + currentQ.category.slice(1)}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
            {currentQ.text}
          </h2>

          {/* Rating Scale */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600">How well does this statement reflect your experience?</p>
            <div className="grid grid-cols-1 gap-3">
              {scaleLabels.map((option) => (
                <label 
                  key={option.value}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    responses[currentQ.id] === option.value 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQ.id}
                    value={option.value}
                    checked={responses[currentQ.id] === option.value}
                    onChange={() => handleResponse(currentQ.id, option.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-4 ${
                    responses[currentQ.id] === option.value 
                      ? 'border-purple-500 bg-purple-500' 
                      : 'border-gray-300'
                  }`}>
                    {responses[currentQ.id] === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className="text-lg font-bold text-gray-600">{option.value}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-sm text-gray-500">
          {Object.keys(responses).length} of {questions.length} answered
        </span>

        <button
          onClick={nextQuestion}
          disabled={!isAnswered}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{currentQuestion === questions.length - 1 ? 'View Results' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Completion Status */}
      {allQuestionsAnswered && currentQuestion === questions.length - 1 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-800 font-medium">
            All questions completed! Click "View Results" to see your Imaginal Agility Profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImaginalAgilityAssessment;