import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UserUploadData {
  name: string;
  email: string;
  organization: string;
  jobTitle: string;
  role: 'participant' | 'admin';
  includeWorkshopData: boolean;
}

const generateTestUserData = (userNumber: number) => {
  return {
    userInfo: {
      username: `testuser${userNumber}`,
      name: `Test User ${userNumber}`,
      email: `testuser${userNumber}@example.com`,
      role: "participant",
      organization: "Test Organization",
      jobTitle: "Test Participant",
      isTestUser: true
    },
    navigationProgress: {
      completedSteps: ["1-1", "2-1", "2-2", "2-3", "2-4", "3-1", "3-2", "3-3", "3-4", "4-1", "4-2", "4-3", "4-4", "4-5"],
      currentStepId: "5-1",
      appType: "ast",
      lastVisitedAt: new Date().toISOString(),
      unlockedSteps: ["1-1", "2-1", "2-2", "2-3", "2-4", "3-1", "3-2", "3-3", "3-4", "4-1", "4-2", "4-3", "4-4", "4-5", "5-1"],
      videoProgress: {"2-1": null}
    },
    assessments: {
      starCard: {
        thinking: 25 + Math.random() * 20,
        feeling: 15 + Math.random() * 20,
        acting: 20 + Math.random() * 20,
        planning: 25 + Math.random() * 20,
        createdAt: new Date().toISOString()
      },
      stepByStepReflection: {
        reflections: {
          strength1: "My strengths help me tackle daily challenges by providing a systematic approach to problem-solving and decision-making.",
          strength2: "I rely on my analytical thinking when facing complex situations that require careful consideration and strategic planning.",
          strength3: "My collaborative nature has helped me overcome team challenges by fostering open communication and shared problem-solving.",
          strength4: "My attention to detail contributes to quality outcomes and helps prevent issues before they become problems.",
          teamValues: "I value collaboration, clear communication, and mutual respect in team environments.",
          uniqueContribution: "I bring a balanced perspective that combines analytical thinking with practical implementation skills."
        },
        starCardData: {
          thinking: 25 + Math.random() * 20,
          acting: 20 + Math.random() * 20,
          feeling: 15 + Math.random() * 20,
          planning: 25 + Math.random() * 20
        },
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      flowAssessment: {
        answers: {
          "1": 4, "2": 4, "3": 4, "4": 4, "5": 4, "6": 4,
          "7": 4, "8": 4, "9": 3, "10": 4, "11": 4, "12": 4
        },
        flowScore: 47,
        completed: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      flowAttributes: {
        flowScore: 0,
        attributes: [
          {"name": "Analytical", "score": 95},
          {"name": "Collaborative", "score": 90},
          {"name": "Detail-oriented", "score": 85},
          {"name": "Strategic", "score": 80}
        ],
        createdAt: new Date().toISOString()
      },
      roundingOutReflection: {
        strengths: "I feel most challenged when I have to make quick decisions without sufficient information or when working in highly chaotic environments.",
        values: "I need to develop stronger emotional intelligence and improve my ability to adapt quickly to changing situations.",
        passions: "I'll leverage my analytical and planning strengths to create better processes and systems that help teams work more effectively.",
        growthAreas: "I want to develop better communication skills and become more comfortable with ambiguity and rapid change.",
        createdAt: new Date().toISOString()
      },
      cantrilLadder: {
        wellBeingLevel: 7,
        futureWellBeingLevel: 9,
        currentFactors: "Strong professional relationships, meaningful work that challenges me, good work-life balance, and opportunities for growth and learning.",
        futureImprovements: "Taking on more leadership responsibilities, developing new skills, improving work-life integration, and having greater impact on organizational success.",
        specificChanges: "I'd like to lead a major project, mentor junior colleagues, and develop expertise in emerging areas relevant to my field.",
        quarterlyProgress: "Successfully completing key project milestones, receiving positive feedback from colleagues and supervisors, and making measurable progress on skill development goals.",
        quarterlyActions: "I'll volunteer for leadership opportunities, seek out mentoring relationships, invest time in learning new skills, and actively contribute to team and organizational improvements.",
        createdAt: new Date().toISOString()
      },
      futureSelfReflection: {
        futureSelfDescription: "In 5 years, I see myself in a senior role with greater responsibility and impact. In 10 years, I'd like to be recognized as an expert in my field. In 20 years, I envision myself as a leader who has made significant contributions to my industry.",
        visualizationNotes: "My life optimized for flow involves work that challenges me intellectually while allowing for creativity and collaboration with talented colleagues.",
        additionalNotes: "I'm excited about the opportunities ahead and committed to continuous learning and growth.",
        createdAt: new Date().toISOString()
      },
      finalReflection: {
        futureLetterText: "Dear Future Self, this workshop has helped me understand my strengths and how to use them more effectively. I commit to continuing my growth journey and leveraging what I've learned to make a positive impact.",
        createdAt: new Date().toISOString()
      }
    }
  };
};

export default function UserUploader() {
  const [formData, setFormData] = useState<UserUploadData>({
    name: '',
    email: '',
    organization: '',
    jobTitle: '',
    role: 'participant',
    includeWorkshopData: true
  });
  const [userCounter, setUserCounter] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/admin/users/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create user');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "User Created Successfully",
        description: `User "${data.user.name}" has been created with complete workshop data.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      // Reset form for next user
      setFormData({
        name: '',
        email: '',
        organization: '',
        jobTitle: '',
        role: 'participant',
        includeWorkshopData: true
      });
      setUserCounter(prev => prev + 1);
    },
    onError: (error) => {
      toast({
        title: "Failed to Create User",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    }
  });

  const handleQuickGenerate = () => {
    const testData = generateTestUserData(userCounter);
    createUserMutation.mutate({
      ...testData,
      password: "P@ssw0rd"
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required fields.",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      userInfo: {
        username: formData.email.split('@')[0],
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organization: formData.organization,
        jobTitle: formData.jobTitle,
        isTestUser: true
      },
      password: "P@ssw0rd"
    };

    if (formData.includeWorkshopData) {
      const testData = generateTestUserData(userCounter);
      userData.navigationProgress = testData.navigationProgress;
      userData.assessments = testData.assessments;
    }

    createUserMutation.mutate(userData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Quick Test User Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a test user with complete workshop data (all assessments, progress, etc.)
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Next user will be: Test User {userCounter}</span>
              <Button 
                onClick={handleQuickGenerate} 
                disabled={createUserMutation.isPending}
                className="flex items-center gap-2"
              >
                {createUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Generate Test User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Custom User Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Enter job title"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'participant' | 'admin') => 
                setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeWorkshopData"
                checked={formData.includeWorkshopData}
                onChange={(e) => setFormData(prev => ({ ...prev, includeWorkshopData: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="includeWorkshopData" className="text-sm">
                Include complete workshop data (assessments, progress, etc.)
              </Label>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending}
                className="flex items-center gap-2"
              >
                {createUserMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Create User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• All generated users use password: <code className="bg-gray-100 px-1 rounded">P@ssw0rd</code></p>
            <p>• Test users are marked with <code className="bg-gray-100 px-1 rounded">isTestUser: true</code></p>
            <p>• Workshop data includes complete assessments and progress through step 4-5</p>
            <p>• Users are created at step 5-1 (Download Star Card) ready to continue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}