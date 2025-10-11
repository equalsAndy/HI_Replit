import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Sparkles, CheckCircle, ChevronDown, ChevronUp, Upload, ExternalLink, HelpCircle, FileText } from 'lucide-react';

type FamiliarityLevel = 'love_it' | 'know_results' | 'did_it_forgot' | 'curious' | 'not_my_thing' | '';

interface AssessmentData {
  mbti_familiarity: FamiliarityLevel;
  mbti_result: string;
  enneagram_familiarity: FamiliarityLevel;
  enneagram_result: string;
  clifton_familiarity: FamiliarityLevel;
  clifton_result: string;
  disc_familiarity: FamiliarityLevel;
  disc_result: string;
}

interface Framework {
  id: string;
  name: string;
  shortName: string;
  description: string;
  resources: { name: string; url: string; }[];
}

interface AddYourAssessmentsProps {
  onBack: () => void;
  onComplete?: () => void;
}

const frameworks: Framework[] = [
  {
    id: 'mbti',
    name: 'Myers-Briggs Type Indicator (MBTI)',
    shortName: 'MBTI',
    description: '16 personality types based on preferences in how you energize, take in information, make decisions, and approach life.',
    resources: [
      { name: '16Personalities (free, paid for deeper insights)', url: 'https://www.16personalities.com/free-personality-test' },
      { name: 'HumanMetrics (free, paid for full report)', url: 'https://www.humanmetrics.com/personality' },
      { name: 'Truity TypeFinder (free, paid for detailed results)', url: 'https://www.truity.com/test/type-finder-personality-test-new' },
      { name: 'Official MBTI Online (paid)', url: 'https://www.mbtionline.com/' },
    ]
  },
  {
    id: 'enneagram',
    name: 'Enneagram',
    shortName: 'Enneagram',
    description: '9 personality types focused on core motivations, fears, and paths to growth and integration.',
    resources: [
      { name: 'Truity Enneagram', url: 'https://www.truity.com/test/enneagram-personality-test' },
      { name: 'Eclectic Energies', url: 'https://www.eclecticenergies.com/enneagram/test' },
      { name: 'Crystal Knows', url: 'https://www.crystalknows.com/enneagram-test' },
    ]
  },
  {
    id: 'clifton',
    name: 'CliftonStrengths',
    shortName: 'CliftonStrengths',
    description: 'Identifies your top natural talents from 34 themes, focusing on what you do best rather than fixing weaknesses.',
    resources: [
      { name: 'Official Gallup CliftonStrengths', url: 'https://www.gallup.com/cliftonstrengths/en/254033/strengthsfinder.aspx' },
    ]
  },
  {
    id: 'disc',
    name: 'DISC Assessment',
    shortName: 'DISC',
    description: 'Measures behavioral styles: Dominance, Influence, Steadiness, and Conscientiousness in work and communication.',
    resources: [
      { name: 'Crystal DISC', url: 'https://www.crystalknows.com/disc-personality-test' },
      { name: '123test DISC', url: 'https://www.123test.com/disc-personality-test/' },
      { name: 'Tony Robbins DISC', url: 'https://www.tonyrobbins.com/disc/' },
    ]
  }
];

const AddYourAssessments: React.FC<AddYourAssessmentsProps> = ({ onBack, onComplete }) => {
  const [currentPage, setCurrentPage] = useState<'intro' | 'selection' | 'mbti' | 'enneagram' | 'clifton' | 'disc' | 'complete'>('intro');
  const [selectedFrameworks, setSelectedFrameworks] = useState<Set<string>>(new Set());
  const [completedFrameworks, setCompletedFrameworks] = useState<Set<string>>(new Set());

  // MBTI specific state
  const [mbtiHasResults, setMbtiHasResults] = useState(false);
  const [mbtiResultsExpanded, setMbtiResultsExpanded] = useState(false);
  const [mbtiResult, setMbtiResult] = useState('');
  const [mbtiFile, setMbtiFile] = useState<File | null>(null);
  const [mbtiReportText, setMbtiReportText] = useState('');
  const [mbtiWantToTry, setMbtiWantToTry] = useState(false);
  const [showA_TTooltip, setShowA_TTooltip] = useState(false);

  // MBTI dimension selections
  const [mbtiE_I, setMbtiE_I] = useState<'E' | 'I' | ''>('');
  const [mbtiS_N, setMbtiS_N] = useState<'S' | 'N' | ''>('');
  const [mbtiT_F, setMbtiT_F] = useState<'T' | 'F' | ''>('');
  const [mbtiJ_P, setMbtiJ_P] = useState<'J' | 'P' | ''>('');
  const [mbtiA_T, setMbtiA_T] = useState<'A' | 'T' | ''>('');

  // Enneagram state
  const [enneagramHasResults, setEnneagramHasResults] = useState(false);
  const [enneagramResultsExpanded, setEnneagramResultsExpanded] = useState(false);
  const [enneagramType, setEnneagramType] = useState('');
  const [enneagramWing, setEnneagramWing] = useState('');
  const [enneagramFile, setEnneagramFile] = useState<File | null>(null);
  const [enneagramReportText, setEnneagramReportText] = useState('');
  const [enneagramWantToTry, setEnneagramWantToTry] = useState(false);

  // CliftonStrengths state
  const [cliftonHasResults, setCliftonHasResults] = useState(false);
  const [cliftonResultsExpanded, setCliftonResultsExpanded] = useState(false);
  const [cliftonTop5, setCliftonTop5] = useState(['', '', '', '', '']);
  const [cliftonFile, setCliftonFile] = useState<File | null>(null);
  const [cliftonReportText, setCliftonReportText] = useState('');
  const [cliftonWantToTry, setCliftonWantToTry] = useState(false);

  // DISC state
  const [discHasResults, setDiscHasResults] = useState(false);
  const [discResultsExpanded, setDiscResultsExpanded] = useState(false);
  const [discProfile, setDiscProfile] = useState('');
  const [discFile, setDiscFile] = useState<File | null>(null);
  const [discReportText, setDiscReportText] = useState('');
  const [discWantToTry, setDiscWantToTry] = useState(false);

  // Update mbtiResult when dimensions change
  useEffect(() => {
    if (mbtiE_I && mbtiS_N && mbtiT_F && mbtiJ_P) {
      const baseType = `${mbtiE_I}${mbtiS_N}${mbtiT_F}${mbtiJ_P}`;
      const fullType = mbtiA_T ? `${baseType}-${mbtiA_T}` : baseType;
      setMbtiResult(fullType);
    }
  }, [mbtiE_I, mbtiS_N, mbtiT_F, mbtiJ_P, mbtiA_T]);

  const [formData, setFormData] = useState<AssessmentData>({
    mbti_familiarity: '',
    mbti_result: '',
    enneagram_familiarity: '',
    enneagram_result: '',
    clifton_familiarity: '',
    clifton_result: '',
    disc_familiarity: '',
    disc_result: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load existing data
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const response = await fetch('/api/workshop-data/assessment-profile', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setFormData(data.profile);

          // Pre-populate MBTI if exists
          if (data.profile.mbti_result) {
            setMbtiResult(data.profile.mbti_result);
            setMbtiHasResults(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
    }
  };

  const handleFrameworkToggle = (frameworkId: string) => {
    const newSelected = new Set(selectedFrameworks);
    if (newSelected.has(frameworkId)) {
      newSelected.delete(frameworkId);
    } else {
      newSelected.add(frameworkId);
    }
    setSelectedFrameworks(newSelected);
  };

  const handleContinueFromSelection = () => {
    if (selectedFrameworks.size === 0) return;

    // Navigate to first selected framework
    const frameworks = ['mbti', 'enneagram', 'clifton', 'disc'];
    const firstSelected = frameworks.find(f => selectedFrameworks.has(f));
    if (firstSelected) {
      setCurrentPage(firstSelected as any);
    }
  };

  const handleMbtiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMbtiFile(e.target.files[0]);
    }
  };

  const handleSaveMbti = async () => {
    // Mark MBTI as completed
    const newCompleted = new Set(completedFrameworks);
    newCompleted.add('mbti');
    setCompletedFrameworks(newCompleted);

    // Update form data
    setFormData(prev => ({
      ...prev,
      mbti_familiarity: mbtiHasResults ? 'love_it' : (mbtiWantToTry ? 'curious' : 'did_it_forgot'),
      mbti_result: mbtiResult
    }));

    // Navigate to next selected framework or complete
    const frameworks = ['mbti', 'enneagram', 'clifton', 'disc'];
    const remainingFrameworks = frameworks.filter(f =>
      selectedFrameworks.has(f) && !newCompleted.has(f)
    );

    if (remainingFrameworks.length > 0) {
      setCurrentPage(remainingFrameworks[0] as any);
    } else {
      // All done, save to database
      await saveToDatabase();
    }
  };

  const saveToDatabase = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/workshop-data/assessment-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSaveMessage('✓ Saved successfully!');
        setTimeout(() => {
          if (onComplete) onComplete();
          onBack();
        }, 1000);
      } else {
        setSaveMessage('Error saving. Please try again.');
      }
    } catch (error) {
      console.error('Error saving assessment data:', error);
      setSaveMessage('Error saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    onBack();
  };

  // Intro Page
  if (currentPage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-4"
            >
              <div className="p-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Add Your Assessments
            </h1>

            <p className="text-xl text-gray-600">
              Help us understand what personality frameworks resonate with you
            </p>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              If you've taken personality or strengths assessments before, this is your chance to share what you know about yourself.
              We'll ask about four popular frameworks:
            </p>

            <ul className="space-y-2 pl-6">
              <li className="relative">
                <span className="absolute -left-6 text-blue-600 font-bold">•</span>
                <strong>Myers-Briggs (MBTI)</strong> — 16 personality types
              </li>
              <li className="relative">
                <span className="absolute -left-6 text-indigo-600 font-bold">•</span>
                <strong>Enneagram</strong> — 9 types focused on core motivations
              </li>
              <li className="relative">
                <span className="absolute -left-6 text-purple-600 font-bold">•</span>
                <strong>CliftonStrengths</strong> — Your top natural talents
              </li>
              <li className="relative">
                <span className="absolute -left-6 text-pink-600 font-bold">•</span>
                <strong>DISC Assessment</strong> — Behavioral communication styles
              </li>
            </ul>

            <p>
              We'll use this to customize content and examples throughout your experience. Everything is completely optional.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <p className="font-semibold text-blue-900 mb-2">🎯 Two simple steps</p>
              <p className="text-blue-800">
                First, you'll pick which frameworks to include.
                <br />
                Then, for each one, you can enter results or take the assessment.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <p className="font-semibold text-green-900 mb-2">🔒 Your data stays private</p>
              <p className="text-green-800">
                This helps us personalize <strong>your</strong> experience.
                <br />
                You control what (if anything) gets shared with your team or organization.
              </p>
            </div>

            <p className="text-center text-lg italic text-gray-600 pt-4">
              Ready to dive in? This will take about 5-7 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <motion.button
              onClick={() => setCurrentPage('selection')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Let's Begin
              <ArrowRight className="h-5 w-5" />
            </motion.button>

            <motion.button
              onClick={handleSkip}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200"
            >
              Maybe Later
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Selection Page
  if (currentPage === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-4 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Hub
            </button>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Which assessments would you like to include?
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Select the frameworks you've done or want to explore. You can add your results or take the assessment for each one.
              </p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {frameworks.map((framework, index) => (
              <motion.div
                key={framework.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => handleFrameworkToggle(framework.id)}
                className={`bg-white rounded-xl p-6 shadow-md cursor-pointer transition-all duration-300 border-2 ${
                  selectedFrameworks.has(framework.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedFrameworks.has(framework.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedFrameworks.has(framework.id) && (
                        <CheckCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {framework.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {framework.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Skip for Now
            </button>
            <button
              onClick={handleContinueFromSelection}
              disabled={selectedFrameworks.size === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>

          {selectedFrameworks.size === 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Select at least one framework to continue
            </p>
          )}
        </div>
      </div>
    );
  }

  // MBTI Page
  if (currentPage === 'mbti') {
    const framework = frameworks.find(f => f.id === 'mbti')!;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => setCurrentPage('selection')}
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-4 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Selection
            </button>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {framework.name}
                </h1>
                <span className="text-sm text-gray-500">
                  {Array.from(selectedFrameworks).indexOf('mbti') + 1} of {selectedFrameworks.size}
                </span>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {framework.description}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md mb-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="mbti-has-results"
                checked={mbtiHasResults}
                onChange={(e) => {
                  setMbtiHasResults(e.target.checked);
                  if (e.target.checked) {
                    setMbtiResultsExpanded(true);
                    setMbtiWantToTry(false);
                  }
                }}
                className="w-5 h-5 text-blue-600 mt-0.5 rounded focus:ring-blue-500"
              />
              <label htmlFor="mbti-has-results" className="text-lg font-semibold text-gray-900 cursor-pointer">
                I have my results
              </label>
            </div>

            <AnimatePresence>
              {mbtiHasResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Enter Results Section */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setMbtiResultsExpanded(!mbtiResultsExpanded)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">Enter your MBTI results</span>
                      {mbtiResultsExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {mbtiResultsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 border-t-2 border-gray-200"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            Select your type:
                          </label>

                          {/* MBTI Dimension Selectors */}
                          <div className="grid grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                            {/* Dimension 1: E/I */}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setMbtiE_I('E')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiE_I === 'E'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  E
                                </button>
                                <button
                                  onClick={() => setMbtiE_I('I')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiE_I === 'I'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  I
                                </button>
                              </div>
                              <div className="h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                <span className="text-2xl font-bold text-gray-800">
                                  {mbtiE_I || '?'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 text-center">
                                Energy
                              </span>
                            </div>

                            {/* Dimension 2: S/N */}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setMbtiS_N('S')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiS_N === 'S'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  S
                                </button>
                                <button
                                  onClick={() => setMbtiS_N('N')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiS_N === 'N'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  N
                                </button>
                              </div>
                              <div className="h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                <span className="text-2xl font-bold text-gray-800">
                                  {mbtiS_N || '?'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 text-center">
                                Information
                              </span>
                            </div>

                            {/* Dimension 3: T/F */}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setMbtiT_F('T')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiT_F === 'T'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  T
                                </button>
                                <button
                                  onClick={() => setMbtiT_F('F')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiT_F === 'F'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  F
                                </button>
                              </div>
                              <div className="h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                <span className="text-2xl font-bold text-gray-800">
                                  {mbtiT_F || '?'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 text-center">
                                Decisions
                              </span>
                            </div>

                            {/* Dimension 4: J/P */}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setMbtiJ_P('J')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiJ_P === 'J'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  J
                                </button>
                                <button
                                  onClick={() => setMbtiJ_P('P')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiJ_P === 'P'
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  P
                                </button>
                              </div>
                              <div className="h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                <span className="text-2xl font-bold text-gray-800">
                                  {mbtiJ_P || '?'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 text-center">
                                Lifestyle
                              </span>
                            </div>

                            {/* Dimension 5: A/T (16Personalities) */}
                            <div className="flex flex-col gap-2 relative">
                              <div className="flex gap-1 items-center">
                                <button
                                  onClick={() => setMbtiA_T('A')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiA_T === 'A'
                                      ? 'bg-purple-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  A
                                </button>
                                <button
                                  onClick={() => setMbtiA_T('T')}
                                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                                    mbtiA_T === 'T'
                                      ? 'bg-purple-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  T
                                </button>
                                <div className="relative">
                                  <button
                                    onMouseEnter={() => setShowA_TTooltip(true)}
                                    onMouseLeave={() => setShowA_TTooltip(false)}
                                    onClick={() => setShowA_TTooltip(!showA_TTooltip)}
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                  >
                                    <HelpCircle className="h-4 w-4 text-gray-400" />
                                  </button>
                                  <AnimatePresence>
                                    {showA_TTooltip && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10"
                                      >
                                        <p className="font-semibold mb-1">A/T Dimension (Optional)</p>
                                        <p className="mb-2">
                                          This is specific to 16Personalities:
                                        </p>
                                        <p className="mb-1"><strong>A (Assertive):</strong> Confident, stress-resistant</p>
                                        <p><strong>T (Turbulent):</strong> Self-conscious, perfectionist</p>
                                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                              <div className="h-12 border-2 border-purple-300 rounded-lg flex items-center justify-center bg-purple-50">
                                <span className="text-2xl font-bold text-purple-800">
                                  {mbtiA_T || '?'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 text-center">
                                Identity
                              </span>
                            </div>
                          </div>

                          {/* Result Display */}
                          {mbtiResult && (
                            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-700 mb-1">Your MBTI Type:</p>
                              <p className="text-3xl font-bold text-blue-900 tracking-wider">
                                {mbtiResult}
                              </p>
                              {mbtiA_T && (
                                <p className="text-xs text-purple-600 mt-2">
                                  (Includes 16Personalities A/T dimension)
                                </p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Upload Report Section */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Have a full report?
                    </label>

                    {/* PDF Upload */}
                    <div>
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors text-center">
                          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600">
                            {mbtiFile ? mbtiFile.name : 'Upload PDF report'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleMbtiFileChange}
                          className="hidden"
                        />
                      </label>
                      {mbtiFile && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          PDF ready to upload
                        </p>
                      )}
                    </div>

                    {/* Text Paste Option */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4" />
                        Paste report text
                      </label>
                      <textarea
                        value={mbtiReportText}
                        onChange={(e) => setMbtiReportText(e.target.value)}
                        placeholder="Copy and paste your assessment report here..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm"
                        rows={4}
                      />
                      {mbtiReportText && (
                        <p className="text-xs text-gray-500 mt-1">
                          {mbtiReportText.length} characters
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* I'd like to try it section */}
          {!mbtiHasResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md mb-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="mbti-want-to-try"
                  checked={mbtiWantToTry}
                  onChange={(e) => setMbtiWantToTry(e.target.checked)}
                  className="w-5 h-5 text-blue-600 mt-0.5 rounded focus:ring-blue-500"
                />
                <label htmlFor="mbti-want-to-try" className="text-lg font-semibold text-gray-900 cursor-pointer">
                  I'd like to try it
                </label>
              </div>

              <AnimatePresence>
                {mbtiWantToTry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-gray-600 mb-3">
                      Here are some free versions you can take now (opens in new tab):
                    </p>
                    {framework.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                        <span className="text-gray-700 group-hover:text-blue-900 font-medium">
                          {resource.name}
                        </span>
                      </a>
                    ))}
                    <p className="text-sm text-gray-500 italic mt-3">
                      Come back here after you get your results to enter them!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Skip for Now
            </button>
            <button
              onClick={handleSaveMbti}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Continue'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>

          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg text-center font-medium ${
                saveMessage.includes('Error')
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {saveMessage}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // CliftonStrengths Page
  if (currentPage === 'clifton') {
    const framework = frameworks.find(f => f.id === 'clifton')!;
    const cliftonResult = cliftonTop5.filter(s => s.trim()).join(', ');

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => setCurrentPage('selection')}
              className="flex items-center gap-2 text-green-700 hover:text-green-900 mb-4 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Selection
            </button>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {framework.name}
                </h1>
                <span className="text-sm text-gray-500">
                  {Array.from(selectedFrameworks).indexOf('clifton') + 1} of {selectedFrameworks.size}
                </span>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {framework.description}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md mb-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="clifton-has-results"
                checked={cliftonHasResults}
                onChange={(e) => {
                  setCliftonHasResults(e.target.checked);
                  if (e.target.checked) {
                    setCliftonResultsExpanded(true);
                    setCliftonWantToTry(false);
                  }
                }}
                className="w-5 h-5 text-green-600 mt-0.5 rounded focus:ring-green-500"
              />
              <label htmlFor="clifton-has-results" className="text-lg font-semibold text-gray-900 cursor-pointer">
                I have my results
              </label>
            </div>

            <AnimatePresence>
              {cliftonHasResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Enter Results Section */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setCliftonResultsExpanded(!cliftonResultsExpanded)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">Enter your top 5 strengths</span>
                      {cliftonResultsExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {cliftonResultsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 border-t-2 border-gray-200 space-y-3"
                        >
                          <p className="text-sm text-gray-600 mb-3">
                            Enter your top 5 strengths in order (CliftonStrengths 34 focuses on your top themes):
                          </p>

                          {/* Top 5 Strengths Inputs */}
                          {cliftonTop5.map((strength, index) => (
                            <div key={index}>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                #{index + 1} Strength
                              </label>
                              <input
                                type="text"
                                value={strength}
                                onChange={(e) => {
                                  const newTop5 = [...cliftonTop5];
                                  newTop5[index] = e.target.value;
                                  setCliftonTop5(newTop5);
                                }}
                                placeholder={`e.g., ${['Achiever', 'Strategic', 'Empathy', 'Learner', 'Ideation'][index]}`}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                              />
                            </div>
                          ))}

                          {/* Result Display */}
                          {cliftonResult && (
                            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                              <p className="text-sm text-green-700 mb-2">Your Top 5 Strengths:</p>
                              <div className="space-y-1">
                                {cliftonTop5.filter(s => s.trim()).map((strength, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-green-900 w-6">#{idx + 1}</span>
                                    <span className="text-lg font-semibold text-green-800">{strength}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Upload/Paste Report Section */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Have a full report?
                    </label>

                    <div>
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors text-center">
                          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600">
                            {cliftonFile ? cliftonFile.name : 'Upload PDF report'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => e.target.files && setCliftonFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {cliftonFile && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          PDF ready to upload
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4" />
                        Paste report text
                      </label>
                      <textarea
                        value={cliftonReportText}
                        onChange={(e) => setCliftonReportText(e.target.value)}
                        placeholder="Copy and paste your full 34 strengths report here..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none text-sm"
                        rows={4}
                      />
                      {cliftonReportText && (
                        <p className="text-xs text-gray-500 mt-1">
                          {cliftonReportText.length} characters
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* I'd like to try it section */}
          {!cliftonHasResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md mb-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="clifton-want-to-try"
                  checked={cliftonWantToTry}
                  onChange={(e) => setCliftonWantToTry(e.target.checked)}
                  className="w-5 h-5 text-green-600 mt-0.5 rounded focus:ring-green-500"
                />
                <label htmlFor="clifton-want-to-try" className="text-lg font-semibold text-gray-900 cursor-pointer">
                  I'd like to try it
                </label>
              </div>

              <AnimatePresence>
                {cliftonWantToTry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-gray-600 mb-3">
                      CliftonStrengths is the official Gallup assessment (opens in new tab):
                    </p>
                    {framework.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                      >
                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                        <span className="text-gray-700 group-hover:text-green-900 font-medium">
                          {resource.name}
                        </span>
                      </a>
                    ))}
                    <p className="text-sm text-gray-500 italic mt-3">
                      Note: CliftonStrengths is a paid assessment. Come back here after you get your results!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Skip for Now
            </button>
            <button
              onClick={() => {
                // Mark completed and continue
                const newCompleted = new Set(completedFrameworks);
                newCompleted.add('clifton');
                setCompletedFrameworks(newCompleted);

                // Update form data
                setFormData(prev => ({
                  ...prev,
                  clifton_familiarity: cliftonHasResults ? 'love_it' : (cliftonWantToTry ? 'curious' : 'did_it_forgot'),
                  clifton_result: cliftonResult
                }));

                // Navigate to next
                const frameworks = ['mbti', 'enneagram', 'clifton', 'disc'];
                const remainingFrameworks = frameworks.filter(f =>
                  selectedFrameworks.has(f) && !newCompleted.has(f)
                );

                if (remainingFrameworks.length > 0) {
                  setCurrentPage(remainingFrameworks[0] as any);
                } else {
                  saveToDatabase();
                }
              }}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Continue'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Enneagram Page
  if (currentPage === 'enneagram') {
    const framework = frameworks.find(f => f.id === 'enneagram')!;
    const enneagramResult = enneagramType && enneagramWing ? `${enneagramType}w${enneagramWing}` : enneagramType;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => setCurrentPage('selection')}
              className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 mb-4 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Selection
            </button>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {framework.name}
                </h1>
                <span className="text-sm text-gray-500">
                  {Array.from(selectedFrameworks).indexOf('enneagram') + 1} of {selectedFrameworks.size}
                </span>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {framework.description}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md mb-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="enneagram-has-results"
                checked={enneagramHasResults}
                onChange={(e) => {
                  setEnneagramHasResults(e.target.checked);
                  if (e.target.checked) {
                    setEnneagramResultsExpanded(true);
                    setEnneagramWantToTry(false);
                  }
                }}
                className="w-5 h-5 text-indigo-600 mt-0.5 rounded focus:ring-indigo-500"
              />
              <label htmlFor="enneagram-has-results" className="text-lg font-semibold text-gray-900 cursor-pointer">
                I have my results
              </label>
            </div>

            <AnimatePresence>
              {enneagramHasResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Enter Results Section */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setEnneagramResultsExpanded(!enneagramResultsExpanded)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">Enter your Enneagram results</span>
                      {enneagramResultsExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {enneagramResultsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 border-t-2 border-gray-200 space-y-4"
                        >
                          {/* Type Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your type (1-9):
                            </label>
                            <div className="grid grid-cols-9 gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                  key={num}
                                  onClick={() => setEnneagramType(num.toString())}
                                  className={`py-3 rounded-lg font-semibold text-lg transition-all ${
                                    enneagramType === num.toString()
                                      ? 'bg-indigo-600 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Wing Selection (Optional) */}
                          {enneagramType && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Wing (optional):
                              </label>
                              <div className="flex gap-2">
                                {(() => {
                                  const type = parseInt(enneagramType);
                                  const prevWing = type === 1 ? 9 : type - 1;
                                  const nextWing = type === 9 ? 1 : type + 1;
                                  return [prevWing, nextWing].map((wing) => (
                                    <button
                                      key={wing}
                                      onClick={() => setEnneagramWing(wing.toString())}
                                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                                        enneagramWing === wing.toString()
                                          ? 'bg-purple-600 text-white shadow-md'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      w{wing}
                                    </button>
                                  ));
                                })()}
                                <button
                                  onClick={() => setEnneagramWing('')}
                                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                    enneagramWing === ''
                                      ? 'bg-gray-300 text-gray-700 shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  No wing
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Result Display */}
                          {enneagramType && (
                            <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
                              <p className="text-sm text-indigo-700 mb-1">Your Enneagram Type:</p>
                              <p className="text-3xl font-bold text-indigo-900">
                                Type {enneagramResult}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Upload/Paste Report Section */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Have a full report?
                    </label>

                    <div>
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors text-center">
                          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600">
                            {enneagramFile ? enneagramFile.name : 'Upload PDF report'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => e.target.files && setEnneagramFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {enneagramFile && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          PDF ready to upload
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4" />
                        Paste report text
                      </label>
                      <textarea
                        value={enneagramReportText}
                        onChange={(e) => setEnneagramReportText(e.target.value)}
                        placeholder="Copy and paste your assessment report here..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                        rows={4}
                      />
                      {enneagramReportText && (
                        <p className="text-xs text-gray-500 mt-1">
                          {enneagramReportText.length} characters
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* I'd like to try it section */}
          {!enneagramHasResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md mb-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="enneagram-want-to-try"
                  checked={enneagramWantToTry}
                  onChange={(e) => setEnneagramWantToTry(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 mt-0.5 rounded focus:ring-indigo-500"
                />
                <label htmlFor="enneagram-want-to-try" className="text-lg font-semibold text-gray-900 cursor-pointer">
                  I'd like to try it
                </label>
              </div>

              <AnimatePresence>
                {enneagramWantToTry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-gray-600 mb-3">
                      Here are some free versions you can take now (opens in new tab):
                    </p>
                    {framework.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                      >
                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                        <span className="text-gray-700 group-hover:text-indigo-900 font-medium">
                          {resource.name}
                        </span>
                      </a>
                    ))}
                    <p className="text-sm text-gray-500 italic mt-3">
                      Come back here after you get your results to enter them!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Skip for Now
            </button>
            <button
              onClick={() => {
                // Mark completed and continue
                const newCompleted = new Set(completedFrameworks);
                newCompleted.add('enneagram');
                setCompletedFrameworks(newCompleted);

                // Update form data
                setFormData(prev => ({
                  ...prev,
                  enneagram_familiarity: enneagramHasResults ? 'love_it' : (enneagramWantToTry ? 'curious' : 'did_it_forgot'),
                  enneagram_result: enneagramResult
                }));

                // Navigate to next
                const frameworks = ['mbti', 'enneagram', 'clifton', 'disc'];
                const remainingFrameworks = frameworks.filter(f =>
                  selectedFrameworks.has(f) && !newCompleted.has(f)
                );

                if (remainingFrameworks.length > 0) {
                  setCurrentPage(remainingFrameworks[0] as any);
                } else {
                  saveToDatabase();
                }
              }}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Continue'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // DISC Page
  if (currentPage === 'disc') {
    const framework = frameworks.find(f => f.id === 'disc')!;

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => setCurrentPage('selection')}
              className="flex items-center gap-2 text-orange-700 hover:text-orange-900 mb-4 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Selection
            </button>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {framework.name}
                </h1>
                <span className="text-sm text-gray-500">
                  {Array.from(selectedFrameworks).indexOf('disc') + 1} of {selectedFrameworks.size}
                </span>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {framework.description}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md mb-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="disc-has-results"
                checked={discHasResults}
                onChange={(e) => {
                  setDiscHasResults(e.target.checked);
                  if (e.target.checked) {
                    setDiscResultsExpanded(true);
                    setDiscWantToTry(false);
                  }
                }}
                className="w-5 h-5 text-orange-600 mt-0.5 rounded focus:ring-orange-500"
              />
              <label htmlFor="disc-has-results" className="text-lg font-semibold text-gray-900 cursor-pointer">
                I have my results
              </label>
            </div>

            <AnimatePresence>
              {discHasResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Enter Results Section */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setDiscResultsExpanded(!discResultsExpanded)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">Enter your DISC profile</span>
                      {discResultsExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <AnimatePresence>
                      {discResultsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 border-t-2 border-gray-200 space-y-4"
                        >
                          <p className="text-sm text-gray-600 mb-3">
                            Enter your DISC profile or behavioral style:
                          </p>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your DISC Profile:
                            </label>
                            <input
                              type="text"
                              value={discProfile}
                              onChange={(e) => setDiscProfile(e.target.value)}
                              placeholder="e.g., High D/I, SC, Dominant-Influencer, or your style description"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Common formats: D, I, S, C, DI, SC, IS, CD, or descriptive like "Dominant" or "Steady-Conscientious"
                            </p>
                          </div>

                          {/* Result Display */}
                          {discProfile && (
                            <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                              <p className="text-sm text-orange-700 mb-1">Your DISC Profile:</p>
                              <p className="text-3xl font-bold text-orange-900">
                                {discProfile}
                              </p>
                            </div>
                          )}

                          {/* DISC Key */}
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">DISC Quick Reference:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-bold text-red-600">D</span> - Dominance (Direct, Results-oriented)
                              </div>
                              <div>
                                <span className="font-bold text-yellow-600">I</span> - Influence (Outgoing, Enthusiastic)
                              </div>
                              <div>
                                <span className="font-bold text-green-600">S</span> - Steadiness (Supportive, Cooperative)
                              </div>
                              <div>
                                <span className="font-bold text-blue-600">C</span> - Conscientiousness (Analytical, Reserved)
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Upload/Paste Report Section */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Have a full report?
                    </label>

                    <div>
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-500 transition-colors text-center">
                          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600">
                            {discFile ? discFile.name : 'Upload PDF report'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => e.target.files && setDiscFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {discFile && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          PDF ready to upload
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4" />
                        Paste report text
                      </label>
                      <textarea
                        value={discReportText}
                        onChange={(e) => setDiscReportText(e.target.value)}
                        placeholder="Copy and paste your DISC assessment report here..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none text-sm"
                        rows={4}
                      />
                      {discReportText && (
                        <p className="text-xs text-gray-500 mt-1">
                          {discReportText.length} characters
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* I'd like to try it section */}
          {!discHasResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md mb-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="disc-want-to-try"
                  checked={discWantToTry}
                  onChange={(e) => setDiscWantToTry(e.target.checked)}
                  className="w-5 h-5 text-orange-600 mt-0.5 rounded focus:ring-orange-500"
                />
                <label htmlFor="disc-want-to-try" className="text-lg font-semibold text-gray-900 cursor-pointer">
                  I'd like to try it
                </label>
              </div>

              <AnimatePresence>
                {discWantToTry && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-gray-600 mb-3">
                      Here are some free DISC assessments you can take now (opens in new tab):
                    </p>
                    {framework.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
                      >
                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
                        <span className="text-gray-700 group-hover:text-orange-900 font-medium">
                          {resource.name}
                        </span>
                      </a>
                    ))}
                    <p className="text-sm text-gray-500 italic mt-3">
                      Come back here after you get your results to enter them!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Skip for Now
            </button>
            <button
              onClick={() => {
                // Mark completed and continue
                const newCompleted = new Set(completedFrameworks);
                newCompleted.add('disc');
                setCompletedFrameworks(newCompleted);

                // Update form data
                setFormData(prev => ({
                  ...prev,
                  disc_familiarity: discHasResults ? 'love_it' : (discWantToTry ? 'curious' : 'did_it_forgot'),
                  disc_result: discProfile
                }));

                // All done, save to database
                saveToDatabase();
              }}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Complete & Save'}
              <CheckCircle className="h-5 w-5" />
            </button>
          </motion.div>

          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg text-center font-medium ${
                saveMessage.includes('Error')
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {saveMessage}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AddYourAssessments;
