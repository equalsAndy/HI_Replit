import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useToast } from '@/hooks/use-toast';

interface BeyondASTViewProps {
  navigate?: (path: string) => void;
  markStepCompleted?: (stepId: string) => Promise<void>;
  setCurrentContent?: (content: string) => void;
}

interface InterestData {
  interest_about_me_page: boolean;
  interest_other_assessments: boolean;
  interest_mbti: boolean;
  interest_enneagram: boolean;
  interest_clifton_strengths: boolean;
  interest_disc: boolean;
  interest_other_assessment_names: string;
  interest_ai_coach: boolean;
  interest_positive_psychology: boolean;
  interest_neuroscience: boolean;
  interest_imagination: boolean;
  interest_happiness_wellbeing: boolean;
  other_interests_feedback: string;
  preferred_email: string;
  use_existing_email: boolean;
}

const BeyondASTView: React.FC<BeyondASTViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const { data: user } = useCurrentUser();
  const { toast } = useToast();

  const [interests, setInterests] = useState<InterestData>({
    interest_about_me_page: false,
    interest_other_assessments: false,
    interest_mbti: false,
    interest_enneagram: false,
    interest_clifton_strengths: false,
    interest_disc: false,
    interest_other_assessment_names: '',
    interest_ai_coach: false,
    interest_positive_psychology: false,
    interest_neuroscience: false,
    interest_imagination: false,
    interest_happiness_wellbeing: false,
    other_interests_feedback: '',
    preferred_email: '',
    use_existing_email: true
  });

  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load existing interest data
  useEffect(() => {
    const loadInterests = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/beyond-ast/interests/${user.id}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.interests) {
            setInterests({
              ...data.interests,
              use_existing_email: data.interests.preferred_email === user.email
            });
            if (data.interests.preferred_email !== user.email) {
              setNewEmail(data.interests.preferred_email || '');
            }
          }
        }
      } catch (error) {
        console.error('Error loading interests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterests();
  }, [user?.id, user?.email]);

  const handleCheckboxChange = (field: keyof InterestData) => {
    setInterests(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveInterests = async () => {
    if (!user?.id) return;

    // Validate email if not using existing
    if (!interests.use_existing_email && !newEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address or select 'Use my existing email'",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const dataToSave = {
        ...interests,
        preferred_email: interests.use_existing_email ? user.email : newEmail
      };

      const response = await fetch(`/api/beyond-ast/interests/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 5000);

        toast({
          title: "Interests Saved",
          description: "Thank you for letting us know what interests you!",
        });
      } else {
        throw new Error('Failed to save interests');
      }
    } catch (error) {
      console.error('Error saving interests:', error);
      toast({
        title: "Error",
        description: "Failed to save your interests. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Beyond AllStarTeams
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          This is our laboratory — a space where we're exploring new ideas and features to help you grow.
        </p>
        <p className="text-base text-gray-500 max-w-2xl mx-auto">
          <strong>Access coming soon.</strong> In the meantime, what interests you?
        </p>
      </div>

      {/* Privacy First */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-2xl">🔒</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Privacy First</h3>
              <p className="text-blue-800 text-sm">
                You control what's shared with your org, your team, or kept completely private. Your data, your choices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interest Collection Form */}
      <Card>
        <CardHeader>
          <CardTitle>What Interests You?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* About Me Page */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="about-me"
                checked={interests.interest_about_me_page}
                onCheckedChange={() => handleCheckboxChange('interest_about_me_page')}
              />
              <Label htmlFor="about-me" className="text-base cursor-pointer">
                About Me page for teammates
              </Label>
            </div>

            {/* Other Assessments */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="other-assessments"
                  checked={interests.interest_other_assessments}
                  onCheckedChange={() => handleCheckboxChange('interest_other_assessments')}
                />
                <Label htmlFor="other-assessments" className="text-base cursor-pointer">
                  Add other assessments for more insights
                </Label>
              </div>

              {/* Sub-checkboxes for specific assessments */}
              {interests.interest_other_assessments && (
                <div className="ml-8 space-y-2 mt-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="mbti"
                      checked={interests.interest_mbti}
                      onCheckedChange={() => handleCheckboxChange('interest_mbti')}
                    />
                    <Label htmlFor="mbti" className="text-sm cursor-pointer">
                      Myers-Briggs (MBTI)
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="enneagram"
                      checked={interests.interest_enneagram}
                      onCheckedChange={() => handleCheckboxChange('interest_enneagram')}
                    />
                    <Label htmlFor="enneagram" className="text-sm cursor-pointer">
                      Enneagram
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="clifton"
                      checked={interests.interest_clifton_strengths}
                      onCheckedChange={() => handleCheckboxChange('interest_clifton_strengths')}
                    />
                    <Label htmlFor="clifton" className="text-sm cursor-pointer">
                      CliftonStrengths
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="disc"
                      checked={interests.interest_disc}
                      onCheckedChange={() => handleCheckboxChange('interest_disc')}
                    />
                    <Label htmlFor="disc" className="text-sm cursor-pointer">
                      DISC Assessment
                    </Label>
                  </div>

                  {/* Other assessments text field */}
                  <div className="mt-3">
                    <Label htmlFor="other-assessments-text" className="text-sm text-gray-700 mb-2 block">
                      Other assessments (please specify):
                    </Label>
                    <Input
                      id="other-assessments-text"
                      placeholder="e.g., StrengthsFinder, Big Five, etc."
                      value={interests.interest_other_assessment_names}
                      onChange={(e) => setInterests(prev => ({
                        ...prev,
                        interest_other_assessment_names: e.target.value
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* AI Coach */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="ai-coach"
                checked={interests.interest_ai_coach}
                onCheckedChange={() => handleCheckboxChange('interest_ai_coach')}
              />
              <div className="flex-1">
                <Label htmlFor="ai-coach" className="text-base cursor-pointer block">
                  A trustable (you own the data) personalized AI that can help you at work or outside of work
                </Label>
              </div>
            </div>
          </div>

          {/* Content Topics of Interest */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Content Topics You'd Like to See More Of</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="positive-psychology"
                  checked={interests.interest_positive_psychology}
                  onCheckedChange={() => handleCheckboxChange('interest_positive_psychology')}
                />
                <Label htmlFor="positive-psychology" className="text-base cursor-pointer">
                  Positive Psychology
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="neuroscience"
                  checked={interests.interest_neuroscience}
                  onCheckedChange={() => handleCheckboxChange('interest_neuroscience')}
                />
                <Label htmlFor="neuroscience" className="text-base cursor-pointer">
                  Neuroscience
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="imagination"
                  checked={interests.interest_imagination}
                  onCheckedChange={() => handleCheckboxChange('interest_imagination')}
                />
                <Label htmlFor="imagination" className="text-base cursor-pointer">
                  Imagination
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="happiness-wellbeing"
                  checked={interests.interest_happiness_wellbeing}
                  onCheckedChange={() => handleCheckboxChange('interest_happiness_wellbeing')}
                />
                <Label htmlFor="happiness-wellbeing" className="text-base cursor-pointer">
                  Happiness and Wellbeing
                </Label>
              </div>
            </div>
          </div>

          {/* Other Interests/Feedback */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Anything Else You'd Like to See?</h3>
            <div className="space-y-2">
              <Label htmlFor="other-feedback" className="text-sm text-gray-700">
                Share any other topics, features, or ideas you'd like us to explore:
              </Label>
              <textarea
                id="other-feedback"
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us what you'd like to see..."
                value={interests.other_interests_feedback}
                onChange={(e) => setInterests(prev => ({
                  ...prev,
                  other_interests_feedback: e.target.value
                }))}
              />
            </div>
          </div>

          {/* Email Selection */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Contact Email</h3>

            <div className="flex items-start gap-3">
              <Checkbox
                id="use-existing"
                checked={interests.use_existing_email}
                onCheckedChange={() => setInterests(prev => ({
                  ...prev,
                  use_existing_email: !prev.use_existing_email
                }))}
              />
              <Label htmlFor="use-existing" className="text-base cursor-pointer">
                Use my existing email: <span className="font-mono text-sm">{user?.email}</span>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="use-new"
                checked={!interests.use_existing_email}
                onCheckedChange={() => setInterests(prev => ({
                  ...prev,
                  use_existing_email: !prev.use_existing_email
                }))}
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="use-new" className="text-base cursor-pointer">
                  Add a different email address
                </Label>
                {!interests.use_existing_email && (
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={handleSaveInterests}
              disabled={isSaving}
              className="px-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Let Us Know'
              )}
            </Button>

            {showConfirmation && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Saved successfully!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="text-center text-sm text-gray-600">
        <p>If you are interested in finding out more, let us know above and we'll keep you updated!</p>
      </div>
    </div>
  );
};

export default BeyondASTView;
