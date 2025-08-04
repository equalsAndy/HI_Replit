
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  Monitor, 
  User, 
  PlayCircle, 
  Calendar,
  FileText,
  Presentation,
  Star,
  ChevronRight
} from 'lucide-react';

interface TeamWorkshopPrepViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function TeamWorkshopPrepView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: TeamWorkshopPrepViewProps) {
  const handleNext = () => {
    markStepCompleted('5-4');
    setCurrentContent('methodology');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Placeholder Content Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800">
          <span className="text-sm font-medium">🚧 Placeholder Content</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          This content is currently under development and shows placeholder information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Strengths Flow Fusion Workshop
            </h1>
            <p className="text-xl text-gray-700">
              Inspire, learn, and grow your team
            </p>
            <p className="text-gray-600 leading-relaxed">
              The Strengths Flow Fusion Workshop is dynamic, interactive session designed to transform the 
              way your team collaborates and executes. By combining each member's core strengths with 
              defined flow attributes, this workshop promotes a holistic and seamless team synergy.
            </p>
          </div>

          {/* Workshop Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle>Workshop Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Collective insight to optimize strengths and flow</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Adopt a shared vision informed by wisdom and balance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Expand each team member's sense of what is possible</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Heighten engagement, productivity, and morale</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              title="Coming Soon"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Open Team Mural Flow Card
            </Button>
            <Button 
              variant="outline" 
              className="px-6 py-3"
              title="Coming Soon"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Workshop
            </Button>
          </div>

          {/* Workshop Tabs */}
          <div className="space-y-4">
            <Tabs defaultValue="materials" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="materials" title="Coming Soon">Workshop Materials</TabsTrigger>
                <TabsTrigger value="agenda" title="Coming Soon">Agenda</TabsTrigger>
                <TabsTrigger value="preparation" title="Coming Soon">Preparation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="materials" className="space-y-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">Team Star Assessment</h4>
                        <p className="text-sm text-gray-600">
                          Discover your team's unique strengths and characteristics
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">Shared Vision Mapping</h4>
                        <p className="text-sm text-gray-600">
                          Create a unified vision centered on collective team growth
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Prepare</Badge>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">Holistic Thinking Exercise</h4>
                        <p className="text-sm text-gray-600">
                          Gain perspective and deepen awareness of potential
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Prepare</Badge>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">Flow Integration Profile</h4>
                        <p className="text-sm text-gray-600">
                          Develop a personalized profile of your team's seamless integration
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Prepare</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="agenda">
                <p className="text-gray-600">Agenda content coming soon...</p>
              </TabsContent>

              <TabsContent value="preparation">
                <p className="text-gray-600">Preparation content coming soon...</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Workshop Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workshop Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-medium">Participants</div>
                  <div className="text-sm text-gray-600">5-12 team members</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-medium">Duration</div>
                  <div className="text-sm text-gray-600">4 hours</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Monitor className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-medium">Format</div>
                  <div className="text-sm text-gray-600">Interactive</div>
                  <div className="text-sm text-gray-600">Facilitated</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                Workshop is designed to be: tunefully interactive, and tailored to your teams transformation.
              </div>
            </CardContent>
          </Card>

          {/* Facilitator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facilitator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">Experienced Facilitator</div>
                  <div className="text-sm text-blue-600 cursor-pointer" title="Coming Soon">Watch Video</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Interactive and comprehensive, this workshop is the catalyst for your teams transformation. 
                Active participation is a must in an effort to maximize workshop outcomes.
              </p>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer" title="Coming Soon">
                <Presentation className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Mural Whiteboard</span>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer" title="Coming Soon">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm">AllStarTeams Guide (PDF)</span>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer" title="Coming Soon">
                <Star className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Star Model Overview</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center mt-8">
        <Button onClick={handleNext} className="flex items-center gap-2">
          Continue to More Information
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
