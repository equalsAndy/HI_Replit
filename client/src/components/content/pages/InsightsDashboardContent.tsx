import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import { useApplication } from '@/hooks/use-application';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { 
  BrainCircuit, 
  Sparkles, 
  Search, 
  Lightbulb, 
  Heart, 
  Shield, 
  Users, 
  Download, 
  Send, 
  ExternalLink,
  LayoutPanelLeft,
  BookOpen
} from 'lucide-react';

// 5Cs sample data
const fiveCsData = [
  { name: 'Imagination', value: 80, fullMark: 100 },
  { name: 'Curiosity', value: 75, fullMark: 100 },
  { name: 'Creativity', value: 65, fullMark: 100 },
  { name: 'Empathy', value: 90, fullMark: 100 },
  { name: 'Courage', value: 70, fullMark: 100 },
];

// Imagination dimensions data
const imaginationData = [
  { name: 'Vivid Detail', value: 85 },
  { name: 'Future Orientation', value: 78 },
  { name: 'Perspective Shifting', value: 92 },
  { name: 'Boundary Breaking', value: 65 },
];

// Team comparison data
const teamComparisonData = [
  { name: 'Imagination', you: 80, team: 65, org: 60 },
  { name: 'Curiosity', you: 75, team: 80, org: 70 },
  { name: 'Creativity', you: 65, team: 60, org: 55 },
  { name: 'Empathy', you: 90, team: 75, org: 65 },
  { name: 'Courage', you: 70, team: 65, org: 60 },
];

// Growth tracking data
const growthTrackingData = [
  { month: 'Jan', imagination: 60, empathy: 50, creativity: 45, curiosity: 55, courage: 40 },
  { month: 'Feb', imagination: 65, empathy: 55, creativity: 50, curiosity: 60, courage: 45 },
  { month: 'Mar', imagination: 70, empathy: 65, creativity: 55, curiosity: 65, courage: 50 },
  { month: 'Apr', imagination: 75, empathy: 75, creativity: 60, curiosity: 70, courage: 60 },
  { month: 'May', imagination: 80, empathy: 90, creativity: 65, curiosity: 75, courage: 70 },
];

// Team strengths data
const teamStrengthData = [
  { name: 'Imaginers', value: 3 },
  { name: 'Empaths', value: 4 },
  { name: 'Creatives', value: 2 },
  { name: 'Explorers', value: 3 },
  { name: 'Courageous', value: 2 },
];

// Development recommendations
const developmentRecommendations = [
  {
    id: 1,
    area: 'Imagination',
    title: 'Visioning Exercises',
    description: 'Practice creating detailed visions of alternative futures to expand your imaginative capacity.',
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
    progress: 40,
  },
  {
    id: 2,
    area: 'Creativity',
    title: 'Idea Generation Practice',
    description: 'Implement structured brainstorming techniques to generate more ideas in less time.',
    icon: <Lightbulb className="h-5 w-5 text-green-500" />,
    progress: 20,
  },
  {
    id: 3,
    area: 'Empathy',
    title: 'Perspective Taking',
    description: 'Develop your ability to see situations from multiple stakeholder viewpoints.',
    icon: <Heart className="h-5 w-5 text-red-500" />,
    progress: 85,
  },
  {
    id: 4,
    area: 'Curiosity',
    title: 'Inquiry Techniques',
    description: 'Learn advanced questioning frameworks to deepen understanding and explore assumptions.',
    icon: <Search className="h-5 w-5 text-blue-500" />,
    progress: 60,
  },
  {
    id: 5,
    area: 'Courage',
    title: 'Productive Discomfort',
    description: 'Practice techniques for staying engaged when faced with challenging situations.',
    icon: <Shield className="h-5 w-5 text-orange-500" />,
    progress: 30,
  },
];

// Team workshop sample scenarios
const teamScenarios = [
  {
    id: 1,
    title: 'Future Operating Model',
    description: 'Collaborative exercise to envision how your team could work differently in the future.',
    participants: 'Entire team',
    duration: '90 minutes',
  },
  {
    id: 2,
    title: 'Stakeholder Empathy Mapping',
    description: 'Structured activity to better understand the needs of your key stakeholders.',
    participants: 'Team leaders and project managers',
    duration: '60 minutes',
  },
  {
    id: 3,
    title: 'Opportunity Identification',
    description: 'Creative exercise to identify untapped opportunities in your market or organization.',
    participants: 'Cross-functional team members',
    duration: '120 minutes',
  },
];

export default function InsightsDashboardContent() {
  const { currentApp } = useApplication();
  const [activeTab, setActiveTab] = useState('individual');

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <LayoutPanelLeft className="h-5 w-5 text-purple-600 mr-2" />
              <h1 className="text-xl font-bold text-purple-800">Insights Dashboard</h1>
            </div>
            <Link href="/user-home" className="text-purple-600 hover:text-purple-800">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4">
        <Tabs defaultValue="individual" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-white">
              <TabsTrigger value="individual" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                Individual Insights
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                Team Insights
              </TabsTrigger>
              <TabsTrigger value="development" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                Development Plan
              </TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Send className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
          
          <TabsContent value="individual" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 5Cs Overview Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Your 5Cs Profile</CardTitle>
                  <CardDescription>
                    Your scores across the five core capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={fiveCsData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis />
                        <Radar
                          name="You"
                          dataKey="value"
                          stroke="#8754b4"
                          fill="#8754b4"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm font-medium">Imagination</span>
                      </div>
                      <span className="text-sm text-gray-500">80%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Search className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium">Curiosity</span>
                      </div>
                      <span className="text-sm text-gray-500">75%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Lightbulb className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Creativity</span>
                      </div>
                      <span className="text-sm text-gray-500">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium">Empathy</span>
                      </div>
                      <span className="text-sm text-gray-500">90%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-sm font-medium">Courage</span>
                      </div>
                      <span className="text-sm text-gray-500">70%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Imagination Details Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Imagination Dimensions</CardTitle>
                  <CardDescription>
                    Detailed breakdown of your imagination capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        width={500}
                        height={300}
                        data={imaginationData}
                        layout="vertical"
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8754b4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 bg-purple-50 p-4 rounded-md border border-purple-100">
                    <div className="flex items-start mb-2">
                      <BrainCircuit className="w-5 h-5 text-purple-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-800">Your Imagination Strength</h4>
                        <p className="text-sm text-gray-700">
                          Your strongest dimension is Perspective Shifting, which allows you to see situations from multiple viewpoints and imagine alternative realities.
                        </p>
                      </div>
                    </div>
                    <div className="pl-7">
                      <p className="text-sm text-gray-700">
                        Consider focusing development on Boundary Breaking to further enhance your imaginative capabilities.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Growth Tracking Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Your Growth Trajectory</CardTitle>
                  <CardDescription>
                    Tracking your progress over time across all capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        width={500}
                        height={300}
                        data={growthTrackingData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="imagination" stroke="#8754b4" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="curiosity" stroke="#3182ce" />
                        <Line type="monotone" dataKey="creativity" stroke="#38a169" />
                        <Line type="monotone" dataKey="empathy" stroke="#e53e3e" />
                        <Line type="monotone" dataKey="courage" stroke="#ed8936" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Key Insights Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Key Insights</CardTitle>
                  <CardDescription>
                    What your assessment results reveal about your capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-2">Your Unique Strengths</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Strong capacity for empathic understanding can help bridge divides in teams</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Ability to imagine detailed future scenarios helps make abstract possibilities concrete</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Balance across all five capabilities indicates versatility in different situations</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                      <h4 className="font-semibold text-blue-800 mb-2">Development Opportunities</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">→</span>
                          <span>Creativity scores suggest opportunity to develop more structured ideation approaches</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">→</span>
                          <span>Consider stretching your boundary-breaking imagination through cross-domain exploration</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">→</span>
                          <span>Further develop courage capability to become more comfortable with uncertainty</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md border border-green-100">
                      <h4 className="font-semibold text-green-800 mb-2">Impact on Collaboration</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Your empathy strength positions you well to foster psychological safety in teams</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Imagination capability helps teams envision new possibilities beyond current constraints</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                      <h4 className="font-semibold text-yellow-800 mb-2">Potential Blind Spots</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">⚠</span>
                          <span>Be mindful of balancing empathy with necessary critical evaluation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">⚠</span>
                          <span>Watch for potential hesitation in situations requiring creative risk-taking</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Comparison Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Team Comparison</CardTitle>
                  <CardDescription>
                    How your capabilities compare to your team and organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        width={500}
                        height={300}
                        data={teamComparisonData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="you" fill="#8754b4" name="You" />
                        <Bar dataKey="team" fill="#3182ce" name="Team Avg" />
                        <Bar dataKey="org" fill="#718096" name="Org Avg" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Team Strengths Distribution Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Team Strengths Distribution</CardTitle>
                  <CardDescription>
                    Primary capabilities across your team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        width={500}
                        height={300}
                        data={teamStrengthData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8754b4" name="Team Members" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Team Strength Analysis</h4>
                        <p className="text-sm text-gray-700">
                          Your team has a strong balance of different capabilities, with particular strength in empathy. Your imagination capability complements the team well.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Team Workshop Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Team Workshop Opportunities</CardTitle>
                  <CardDescription>
                    Collaborative sessions to develop capabilities together
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamScenarios.map((scenario) => (
                      <div key={scenario.id} className="border border-gray-200 rounded-md p-4">
                        <h4 className="font-medium text-purple-800">{scenario.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Participants:</span> {scenario.participants}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Duration:</span> {scenario.duration}
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            View Workshop
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => window.open('https://app.mural.co/t/teamprelude0846/m/teamprelude0846/1745418854230/cde344fe1cfbdb22d8a88d0cdf528f7d78537b61', '_blank')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Open Team Mural Board
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="development" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Development Recommendations Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Development Recommendations</CardTitle>
                  <CardDescription>
                    Personalized recommendations to develop your capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {developmentRecommendations.map((recommendation) => (
                      <div key={recommendation.id} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">{recommendation.icon}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                  {recommendation.area}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                Start
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600">{recommendation.description}</p>
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-gray-700">{recommendation.progress}%</span>
                              </div>
                              <Progress value={recommendation.progress} className="h-1.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Resources Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Recommended Resources</CardTitle>
                  <CardDescription>
                    Materials to support your development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">Imagination in Leadership</h4>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          Article
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        How leaders can use imagination to navigate complexity and create new possibilities.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">Read Article</Button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">The 5Cs Capability Framework</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Video
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        A comprehensive introduction to the five key capabilities for navigating complexity.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">Watch Video</Button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">Developing Empathic Leadership</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Worksheet
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Practical exercises to develop your empathic leadership capabilities.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">Download</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Schedule Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Development Activities</CardTitle>
                  <CardDescription>
                    Upcoming sessions and workshops
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">The Imagination Practice</h4>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                          May 15
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        A guided virtual workshop to develop practical imagination techniques.
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span className="mr-3">10:00 AM - 11:30 AM EST</span>
                        <span>Virtual</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3 w-full">Register</Button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">Curiosity in Action</h4>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          May 22
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Learn structured approaches to inquiry that unlock deeper understanding.
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span className="mr-3">2:00 PM - 3:30 PM EST</span>
                        <span>Virtual</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3 w-full">Register</Button>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900">Creativity Bootcamp</h4>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          June 5
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        An intensive half-day session to boost your creative capabilities.
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span className="mr-3">9:00 AM - 1:00 PM EST</span>
                        <span>Virtual</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3 w-full">Register</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}