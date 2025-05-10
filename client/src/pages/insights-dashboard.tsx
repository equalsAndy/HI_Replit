import { useState } from "react";
import MainContainer from "@/components/layout/MainContainer";
import { useApplication } from "@/hooks/use-application";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { Link } from "wouter";

// Mock data for demonstration - would come from API in real implementation
const COLORS = ['#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#10B981'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

export default function InsightsDashboard() {
  const { appName } = useApplication();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch 5Cs assessment results
  const { data: results, isLoading } = useQuery({ 
    queryKey: ['/api/5cs-assessment/results'],
    // This is a mock query that would fetch real data in production
    queryFn: () => Promise.resolve({
      ratings: {
        imagination: 4,
        curiosity: 5,
        empathy: 3,
        creativity: 4,
        courage: 3
      },
      reflections: {
        imagination: "I created a plan for a future project that hasn't been attempted before.",
        curiosity: "I researched an unfamiliar topic that led to a breakthrough idea.",
        empathy: "I adjusted my approach after understanding a colleague's perspective.",
        creativity: "I proposed a novel solution that helped solve a complex problem.",
        courage: "I volunteered to present an important project despite feeling nervous."
      },
      strengthProfile: "Your imagination and curiosity are your standout strengths, showing your ability to envision new possibilities and explore diverse perspectives. Your creativity is also strong, enabling you to generate valuable solutions. There's room to develop your empathy and courage further to enhance your overall Imaginal Agility."
    })
  });
  
  // Prepare chart data from results
  const pieChartData = !isLoading && results ? [
    { name: 'Imagination', value: results.ratings.imagination, fullMark: 5 },
    { name: 'Curiosity', value: results.ratings.curiosity, fullMark: 5 },
    { name: 'Empathy', value: results.ratings.empathy, fullMark: 5 },
    { name: 'Creativity', value: results.ratings.creativity, fullMark: 5 },
    { name: 'Courage', value: results.ratings.courage, fullMark: 5 }
  ] : [];
  
  const radarChartData = !isLoading && results ? [
    { 
      subject: 'Imagination',
      A: results.ratings.imagination,
      fullMark: 5,
    },
    { 
      subject: 'Curiosity',
      A: results.ratings.curiosity,
      fullMark: 5,
    },
    { 
      subject: 'Empathy',
      A: results.ratings.empathy,
      fullMark: 5,
    },
    { 
      subject: 'Creativity',
      A: results.ratings.creativity,
      fullMark: 5,
    },
    { 
      subject: 'Courage',
      A: results.ratings.courage,
      fullMark: 5,
    },
  ] : [];
  
  return (
    <MainContainer stepId="C" showStepNavigation={true}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Your Insights Distilled</h1>
        <p className="text-lg mb-6">
          Review your 5Cs assessment results and discover your unique imaginal profile.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Results</TabsTrigger>
            <TabsTrigger value="reflection">Guided Reflection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your 5Cs Profile</CardTitle>
                <CardDescription>
                  Visualization of your capabilities across the five dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                {!isLoading && results && (
                  <>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} />
                          <Radar name="Your Profile" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 w-full">
                      <h3 className="text-xl font-semibold mb-2 text-purple-800">Your Strength Profile</h3>
                      <p className="text-gray-700">{results.strengthProfile}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-center">
              <a href="https://app.mural.co/t/teamprelude0846/m/teamprelude0846/1745418854230/cde344fe1cfbdb22d8a88d0cdf528f7d78537b61" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Launch Team Workshop Mural
                </Button>
              </a>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed 5Cs Assessment Results</CardTitle>
                <CardDescription>
                  Breakdown of your ratings and reflections for each capability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoading && results && (
                  <div className="space-y-8">
                    {Object.entries(results.ratings).map(([capability, rating], index) => (
                      <div key={capability} className="border-b pb-6 last:border-b-0">
                        <h3 className="text-lg font-semibold flex items-center mb-2">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                            <span className="text-white text-sm">{rating}/5</span>
                          </span>
                          {capability.charAt(0).toUpperCase() + capability.slice(1)}
                        </h3>
                        <p className="mb-2 italic text-gray-600">Your reflection:</p>
                        <p className="text-gray-700">{results.reflections[capability as keyof typeof results.reflections]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reflection" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Guided Reflection</CardTitle>
                <CardDescription>
                  Deepen your insights with these reflection questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">What surprised you in your results?</h3>
                    <p className="text-sm text-gray-600">Consider which capabilities were stronger or weaker than you expected.</p>
                    <Textarea className="mt-2 min-h-[80px]" placeholder="Type your reflection here..." />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">What felt validating or affirming?</h3>
                    <p className="text-sm text-gray-600">Reflect on strengths that align with your self-perception.</p>
                    <Textarea className="mt-2 min-h-[80px]" placeholder="Type your reflection here..." />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Where do you see untapped potential?</h3>
                    <p className="text-sm text-gray-600">Identify areas where you'd like to develop further.</p>
                    <Textarea className="mt-2 min-h-[80px]" placeholder="Type your reflection here..." />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Which capability feels most important for the season you're in?</h3>
                    <p className="text-sm text-gray-600">Consider your current challenges and opportunities.</p>
                    <Textarea className="mt-2 min-h-[80px]" placeholder="Type your reflection here..." />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainContainer>
  );
}

// Component to avoid TypeScript errors
function Textarea(props: any) {
  return (
    <textarea
      className={`w-full p-2 border border-gray-300 rounded-md ${props.className}`}
      placeholder={props.placeholder}
    />
  );
}