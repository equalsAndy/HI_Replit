import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { BookOpen, ExternalLink, Users, Calendar, Clock, Star, CheckSquare } from 'lucide-react';

// Workshop materials
const workshopMaterials = [
  {
    id: 1,
    title: 'Team 5Cs Assessment',
    description: 'A comprehensive tool to measure your team\'s collective capabilities across the 5Cs framework.',
    type: 'assessment',
    duration: '30 minutes',
    participants: 'All team members',
  },
  {
    id: 2,
    title: 'Future Operating Model Canvas',
    description: 'A collaborative exercise to envision and design new ways of working.',
    type: 'exercise',
    duration: '90 minutes',
    participants: 'Full team',
  },
  {
    id: 3,
    title: 'Stakeholder Empathy Mapping',
    description: 'An exercise to deeply understand the needs of your key stakeholders.',
    type: 'exercise',
    duration: '60 minutes',
    participants: 'Core team',
  },
  {
    id: 4,
    title: 'Team Imagination Profile',
    description: 'A visual representation of your team\'s collective imagination capabilities.',
    type: 'report',
    duration: '15 minutes',
    participants: 'All team members',
  },
];

// Workshop agenda
const workshopAgenda = [
  {
    time: '9:00 AM - 9:30 AM',
    title: 'Introduction & Context',
    description: 'Overview of workshop objectives and introduction to the 5Cs framework',
  },
  {
    time: '9:30 AM - 10:15 AM',
    title: 'Individual Reflections',
    description: 'Team members share insights from their individual assessments',
  },
  {
    time: '10:15 AM - 10:30 AM',
    title: 'Break',
    description: 'Short refreshment break',
  },
  {
    time: '10:30 AM - 12:00 PM',
    title: 'Future Operating Model Exercise',
    description: 'Collaborative work using the Mural board to design future ways of working',
  },
  {
    time: '12:00 PM - 12:45 PM',
    title: 'Lunch Break',
    description: 'Working lunch',
  },
  {
    time: '12:45 PM - 2:15 PM',
    title: 'Stakeholder Empathy Mapping',
    description: 'Identifying and mapping stakeholder needs and perspectives',
  },
  {
    time: '2:15 PM - 2:30 PM',
    title: 'Break',
    description: 'Short refreshment break',
  },
  {
    time: '2:30 PM - 3:30 PM',
    title: 'Commitment & Next Steps',
    description: 'Team commitments and action planning',
  },
  {
    time: '3:30 PM - 4:00 PM',
    title: 'Wrap-up & Reflection',
    description: 'Final reflections and workshop closing',
  },
];

// Pre-workshop checklist
const preWorkshopChecklist = [
  'Complete your individual Imagination Assessment',
  'Complete your individual 5Cs Assessment',
  'Review your Insights Dashboard',
  'Identify 2-3 key business challenges your team is facing',
  'Think about your team\'s current ways of working',
  'Complete the pre-workshop survey (link will be sent by email)',
];

export default function TeamWorkshop() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <AppLogo appName="imaginal-agility" size="md" />
              <h1 className="text-xl font-bold text-purple-800">Team Workshop</h1>
            </div>
            <Link href="/user-home" className="text-purple-600 hover:text-purple-800">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workshop Overview */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Imaginal Agility Team Workshop</CardTitle>
                <CardDescription>A collaborative session to develop your team's capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>
                    The Imaginal Agility Team Workshop is a full-day collaborative session designed 
                    to help your team develop shared capabilities in imagination, curiosity, creativity, 
                    empathy, and courage. Through structured exercises and discussions, you'll work 
                    together to apply these capabilities to real business challenges.
                  </p>
                  
                  <div className="mt-4 bg-purple-50 p-4 rounded-md border border-purple-100">
                    <h3 className="text-md font-semibold text-purple-800 mb-2">Workshop Outcomes</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>A shared understanding of your team's 5Cs profile and how to leverage it</li>
                      <li>A future operating model that enhances collaboration and innovation</li>
                      <li>Deeper empathy for key stakeholders' needs and perspectives</li>
                      <li>Clear action steps to continue developing your team's capabilities</li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 flex items-center"
                      onClick={() => window.open('https://app.mural.co/t/teamprelude0846/m/teamprelude0846/1745418854230/cde344fe1cfbdb22d8a88d0cdf528f7d78537b61', '_blank')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Open Team Mural Board
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Workshop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Workshop Content Tabs */}
            <Tabs defaultValue="materials">
              <TabsList className="mb-4 bg-white">
                <TabsTrigger value="materials" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                  Workshop Materials
                </TabsTrigger>
                <TabsTrigger value="agenda" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                  Agenda
                </TabsTrigger>
                <TabsTrigger value="preparation" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                  Preparation
                </TabsTrigger>
              </TabsList>
              
              {/* Workshop Materials */}
              <TabsContent value="materials" className="mt-0">
                <div className="space-y-4">
                  {workshopMaterials.map((material) => (
                    <Card key={material.id}>
                      <CardContent className="p-4 flex flex-col md:flex-row md:items-center">
                        <div className="flex-1 mb-3 md:mb-0">
                          <h3 className="font-medium text-gray-900">{material.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {material.type}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <Clock className="h-3 w-3 mr-1" />
                              {material.duration}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <Users className="h-3 w-3 mr-1" />
                              {material.participants}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="md:ml-4">
                          Preview
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <div className="flex items-start">
                      <Star className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Facilitator Note</h4>
                        <p className="text-sm text-gray-700">
                          All workshop materials are customizable based on your team's specific needs and challenges. 
                          Contact your workshop facilitator to discuss any adjustments.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Agenda Tab */}
              <TabsContent value="agenda" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Workshop Agenda</CardTitle>
                    <CardDescription>Full-day workshop schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workshopAgenda.map((item, index) => (
                        <div key={index} className="flex">
                          <div className="mr-4 w-32 flex-shrink-0">
                            <p className="text-sm font-medium text-gray-700">{item.time}</p>
                          </div>
                          <div className="flex-1 pb-4 border-b border-gray-200 last:border-0">
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 bg-yellow-50 p-4 rounded-md border border-yellow-100">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-yellow-700 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800">Timing Note</h4>
                          <p className="text-sm text-gray-700">
                            This agenda is designed for a full day workshop (9:00 AM - 4:00 PM). 
                            We can also offer a condensed half-day option focused on key exercises.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Preparation Tab */}
              <TabsContent value="preparation" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Workshop Preparation</CardTitle>
                    <CardDescription>Steps to complete before the workshop</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                        <h3 className="font-semibold text-purple-800 mb-2">Pre-Workshop Checklist</h3>
                        <div className="space-y-2">
                          {preWorkshopChecklist.map((item, index) => (
                            <div key={index} className="flex items-start">
                              <CheckSquare className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Logistics</h3>
                        <div className="space-y-3">
                          <div className="flex">
                            <span className="font-medium text-gray-700 w-24">Location:</span>
                            <span className="text-gray-600">Virtual or in-person (to be determined)</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium text-gray-700 w-24">Duration:</span>
                            <span className="text-gray-600">Full day (9:00 AM - 4:00 PM)</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium text-gray-700 w-24">Materials:</span>
                            <span className="text-gray-600">All materials will be provided</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium text-gray-700 w-24">Technology:</span>
                            <span className="text-gray-600">Laptop with camera and microphone for virtual sessions</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-md border border-green-100">
                        <h3 className="font-semibold text-green-800 mb-2">Ready to Schedule?</h3>
                        <p className="text-sm text-gray-700 mb-3">
                          When your team is prepared to schedule the workshop, click the button below to coordinate with a facilitator.
                        </p>
                        <Button className="bg-green-600 hover:bg-green-700">
                          Request Workshop Date
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Workshop Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Workshop Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <Users className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Participants</h3>
                      <p className="text-sm text-gray-600">5-15 team members</p>
                    </div>
                  </div>
                  <div className="flex">
                    <Clock className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Duration</h3>
                      <p className="text-sm text-gray-600">7 hours (full day)</p>
                    </div>
                  </div>
                  <div className="flex">
                    <BookOpen className="h-5 w-5 text-purple-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Format</h3>
                      <p className="text-sm text-gray-600">Interactive, facilitator-led</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-gray-600">
                      This workshop is designed to be highly interactive with a mix of exercises, discussions, and collaborative work. It builds upon the individual assessments and insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Facilitator */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Facilitator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden mr-4 flex-shrink-0">
                    <div className="h-full w-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Heliotrope Facilitator</h3>
                    <p className="text-sm text-gray-600">Certified Workshop Leader</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Your workshop will be led by a certified Heliotrope facilitator with expertise in team 
                  development and the 5Cs capability framework.
                </p>
                <Button variant="outline" className="w-full">
                  Request Facilitator Bio
                </Button>
              </CardContent>
            </Card>
            
            {/* Resources */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://app.mural.co/t/teamprelude0846/m/teamprelude0846/1745418854230/cde344fe1cfbdb22d8a88d0cdf528f7d78537b61', '_blank')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Mural Whiteboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Workshop Guide (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    5Cs Framework Overview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}