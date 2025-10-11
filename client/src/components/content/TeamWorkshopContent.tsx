import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, ArrowRight, Star, MessageSquare, FileText, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TaliaCoach from '@/components/coaching/TaliaCoach';

interface TeamWorkshopContentProps {
  userId: number;
  teamAccess: boolean;
  workshopCompleted: boolean;
  userName: string;
}

export default function TeamWorkshopContent({ 
  userId, 
  teamAccess, 
  workshopCompleted, 
  userName 
}: TeamWorkshopContentProps) {
  const [showCoach, setShowCoach] = useState(false);

  if (teamAccess) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Team Workshop Preparation</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You've completed your individual AST assessment! Now get ready to discover how your unique strengths will contribute to powerful team collaboration.
          </p>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            Individual Workshop Complete
          </Badge>
        </div>

        {/* Preparation Overview */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Calendar className="w-5 h-5" />
              What to Expect in Your Team Workshop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">Team Constellation Mapping</h4>
                <p className="text-sm text-blue-700">
                  See how your individual Star Card connects with your teammates to create collective capabilities that exceed what any individual could achieve alone.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">Strengths Fusion Exercise</h4>
                <p className="text-sm text-blue-700">
                  Discover how different strength combinations create new team "superpowers" - like Strategic Empathy or Innovative Execution.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">Team Vision Co-Creation</h4>
                <p className="text-sm text-blue-700">
                  Build a shared vision that honors individual aspirations while creating collective purpose and direction.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800">Flow State Alignment</h4>
                <p className="text-sm text-blue-700">
                  Learn how to create team environments where everyone can access their optimal performance states simultaneously.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Contribution Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Your Unique Team Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Based on your individual assessment, you bring specific strengths that will enhance team dynamics. Your facilitator will help the team understand how each person's contribution creates collective capability.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-800">Questions to Reflect On:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  How do my top strengths complement what I know about my teammates?
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  What team challenges could benefit from my unique perspective?
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  When does our team feel most energized and productive together?
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  What would it look like if we operated at our collective best?
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Pre-Workshop Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-Workshop Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Complete individual AST assessment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                <span className="text-sm text-gray-600">Review your Star Card and key insights</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                <span className="text-sm text-gray-600">Think about team collaboration preferences</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                <span className="text-sm text-gray-600">Prepare to share openly about your strengths</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => setShowCoach(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Get Preparation Coaching
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Download Team Prep Guide
          </Button>
        </div>

        {/* Coaching Integration */}
        {showCoach && (
          <TaliaCoach
            userId={userId}
            workshopCompleted={workshopCompleted}
            conversationType="team_prep"
            teamAccess={true}
          />
        )}
      </div>
    );
  } else {
    // No team access - information and proposal content
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Team Workshop Benefits</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You've gained powerful individual insights. Discover how team AST workshops can transform these discoveries into collective excellence.
          </p>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Star className="w-4 h-4 mr-1" />
            Ready for Team Collaboration
          </Badge>
        </div>

        {/* Benefits Overview */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Why Team AST Workshops Transform Organizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Enhanced Collaboration
                </h4>
                <p className="text-sm text-amber-700">
                  Teams report 40% improvement in communication and 60% better role clarity when they understand how their diverse strengths complement each other.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Improved Performance
                </h4>
                <p className="text-sm text-amber-700">
                  Organizations see measurable improvements in project delivery, innovation, and employee engagement when teams align around strengths.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Innovation Boost
                </h4>
                <p className="text-sm text-amber-700">
                  Diverse strengths combinations create new possibilities. Teams discover "fusion capabilities" that emerge when different perspectives combine.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Sustainable Growth
                </h4>
                <p className="text-sm text-amber-700">
                  Unlike one-time training, AST creates lasting frameworks teams use for ongoing collaboration, conflict resolution, and development.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Team Workshops Include */}
        <Card>
          <CardHeader>
            <CardTitle>What Team AST Workshops Include</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-800">Team Constellation Mapping</h4>
                <p className="text-sm text-gray-600">
                  Visual mapping of how individual Star Cards combine to create collective capabilities and identify team strengths gaps.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-800">Strengths Fusion Exercises</h4>
                <p className="text-sm text-gray-600">
                  Interactive sessions where team members discover how their different strengths create new "fusion capabilities" like Strategic Empathy or Innovative Execution.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-800">Collaborative Vision Creation</h4>
                <p className="text-sm text-gray-600">
                  Facilitated process to build shared vision that honors individual aspirations while creating collective purpose and alignment.
                </p>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold text-gray-800">Team Flow Optimization</h4>
                <p className="text-sm text-gray-600">
                  Learn to create work environments where multiple team members can access their optimal performance states simultaneously.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Making the Business Case */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Making the Case to Your Manager</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-green-800">Sample Conversation Starter:</h4>
              <blockquote className="italic text-green-700 border-l-4 border-green-300 pl-4">
                "I recently completed individual strengths training and gained valuable insights about my work style and optimal performance conditions. I think our team could benefit significantly from doing this together - it would help us understand how our different strengths can work together more effectively and improve our collaboration on [specific project/challenge]."
              </blockquote>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">Key Points to Emphasize:</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Improved communication and reduced conflicts
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Better role clarity and task allocation
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Increased innovation through diverse perspectives
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Higher employee engagement and retention
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => setShowCoach(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Get Help Making the Case
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Download Proposal Template
          </Button>
        </div>

        {/* Coaching Integration */}
        {showCoach && (
          <TaliaCoach
            userId={userId}
            workshopCompleted={workshopCompleted}
            conversationType="team_prep"
            teamAccess={false}
          />
        )}
      </div>
    );
  }
}