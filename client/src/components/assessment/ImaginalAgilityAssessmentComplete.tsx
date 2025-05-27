import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Eye, Heart, Lightbulb, Shield, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImaginalAgilityAssessmentCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: any) => void;
}

const ImaginalAgilityAssessmentComplete: React.FC<ImaginalAgilityAssessmentCompleteProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const { toast } = useToast();

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
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' }
  ];

  const categoryColors = {
    imagination: 'bg-purple-500',
    curiosity: 'bg-blue-500',
    empathy: 'bg-green-500',
    creativity: 'bg-orange-500',
    courage: 'bg-red-500'
  };

  const categoryLabels = {
    imagination: 'Imagination',
    curiosity: 'Curiosity',
    empathy: 'Empathy',
    creativity: 'Creativity',
    courage: 'Courage'
  };

  // Demo mode functionality
  const fillRandomResponses = () => {
    const randomResponses = {};
    questions.forEach(q => {
      randomResponses[q.id] = Math.floor(Math.random() * 5) + 1;
    });
    setResponses(randomResponses);
    setDemoMode(true);
  };

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
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

  const handleComplete = async () => {
    if (scores && onComplete) {
      try {
        // Save to database using existing API pattern
        const response = await fetch('/api/workshop-data/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            assessmentType: 'imaginationAssessment',
            completedAt: new Date().toISOString(),
            responses,
            scores
          })
        });

        if (response.ok) {
          toast({
            title: "Assessment completed!",
            description: "Your results have been saved.",
          });
          onComplete(scores);
        } else {
          throw new Error('Failed to save assessment');
        }
      } catch (error) {
        console.error('Error saving assessment:', error);
        toast({
          title: "Error saving assessment",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
    onClose();
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isAnswered = responses[currentQ.id] !== undefined;
  const allQuestionsAnswered = Object.keys(responses).length === questions.length;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(0);
      setResponses({});
      setShowResults(false);
      setScores(null);
      setDemoMode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (showResults && scores) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-bold text-gray-900">
              Your Imaginal Agility Profile
            </DialogTitle>
            <p className="text-center text-lg text-gray-600">
              Your unique combination of imagination, curiosity, empathy, creativity, and courage
            </p>
          </DialogHeader>

          <div className="space-y-8">
            {/* Capacity Scores */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Capacity Scores</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {Object.entries(scores).filter(([key]) => key !== 'subDimensions').map(([capacity, score]) => (
                  <div key={capacity} className="text-center space-y-3">
                    <div className={`w-16 h-16 mx-auto rounded-full ${categoryColors[capacity]} flex items-center justify-center text-white font-bold text-lg`}>
                      {score.toFixed(1)}
                    </div>
                    <h4 className="font-medium text-gray-900 capitalize">{capacity}</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${categoryColors[capacity]}`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      ></div>
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

            {/* Action Items */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps for Growth</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Your Strengths</h4>
                  <p className="text-sm text-gray-600">
                    Focus on leveraging your highest-scoring capacities in your work and relationships.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Growth Areas</h4>
                  <p className="text-sm text-gray-600">
                    Consider developing your lower-scoring areas through targeted practice and reflection.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-x-4">
              <Button onClick={handleComplete} className="bg-purple-600 hover:bg-purple-700">
                Complete Assessment
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="text-center flex-1">
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-4">
                Imaginal Agility Assessment
              </DialogTitle>
              <p className="text-lg text-gray-600 mb-4">
                Discover your unique profile across five foundational human capacities essential for adaptive intelligence in the AI era
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <span>• Imagination</span>
                <span>• Curiosity</span>
                <span>• Empathy</span>
                <span>• Creativity</span>
                <span>• Courage</span>
              </div>
            </div>
            <Button
              onClick={fillRandomResponses}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              Demo Mode
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Progress Bar */}
          <div>
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
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-2 rounded-lg ${categoryColors[currentQ.category]} text-white`}>
                {currentQ.icon}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${categoryColors[currentQ.category]}`}>
                {categoryLabels[currentQ.category]}
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              {currentQ.text}
            </h3>

            <p className="text-gray-600 mb-8">
              How well does this statement reflect your experience?
            </p>

            {/* Scale Options */}
            <div className="space-y-4">
              {scaleLabels.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    responses[currentQ.id] === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={currentQ.id}
                      value={option.value}
                      checked={responses[currentQ.id] === option.value}
                      onChange={() => handleResponse(currentQ.id, option.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-lg text-gray-900">{option.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-500">{option.value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <span className="text-sm text-gray-500">
              {Object.keys(responses).length} of {questions.length} answered
            </span>

            <Button
              onClick={nextQuestion}
              disabled={!isAnswered && !demoMode}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
            >
              <span>{currentQuestion === questions.length - 1 ? 'View Results' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImaginalAgilityAssessmentComplete;