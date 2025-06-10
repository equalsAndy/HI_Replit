import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Eye, Heart, Lightbulb, Shield } from 'lucide-react';

interface AssessmentResults {
  imagination: number;
  curiosity: number;
  empathy: number;
  creativity: number;
  courage: number;
  responses: { [key: string]: number };
  radarChart: {
    imagination: number;
    curiosity: number;
    empathy: number;
    creativity: number;
    courage: number;
  };
  completedAt: string;
}

interface ImaginalAgilityResultsProps {
  results: AssessmentResults;
}

const CAPABILITY_INFO = {
  imagination: {
    icon: Zap,
    color: '#8B5CF6',
    description: 'Your ability to generate novel ideas and envision possibilities'
  },
  curiosity: {
    icon: Eye,
    color: '#3B82F6',
    description: 'Your drive to explore, question, and seek new experiences'
  },
  empathy: {
    icon: Heart,
    color: '#10B981',
    description: 'Your capacity to understand and connect with others'
  },
  creativity: {
    icon: Lightbulb,
    color: '#F59E0B',
    description: 'Your talent for finding innovative solutions and expressions'
  },
  courage: {
    icon: Shield,
    color: '#EF4444',
    description: 'Your willingness to take risks and stand up for beliefs'
  }
};

export function ImaginalAgilityResults({ results }: ImaginalAgilityResultsProps) {
  const radarData = [
    {
      capability: 'Imagination',
      score: results.radarChart.imagination,
      fullMark: 5
    },
    {
      capability: 'Curiosity',
      score: results.radarChart.curiosity,
      fullMark: 5
    },
    {
      capability: 'Empathy',
      score: results.radarChart.empathy,
      fullMark: 5
    },
    {
      capability: 'Creativity',
      score: results.radarChart.creativity,
      fullMark: 5
    },
    {
      capability: 'Courage',
      score: results.radarChart.courage,
      fullMark: 5
    }
  ];

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Exceptional';
    if (score >= 4.0) return 'Strong';
    if (score >= 3.5) return 'Good';
    if (score >= 3.0) return 'Moderate';
    if (score >= 2.5) return 'Developing';
    return 'Emerging';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 4.0) return 'bg-blue-100 text-blue-800';
    if (score >= 3.5) return 'bg-purple-100 text-purple-800';
    if (score >= 3.0) return 'bg-yellow-100 text-yellow-800';
    if (score >= 2.5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-purple-700 flex items-center justify-center gap-2">
          <Zap className="h-6 w-6" />
          Your Imagination Radar
        </h2>
        <p className="text-gray-600">
          Completed on {new Date(results.completedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Radar Chart */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="text-center text-lg text-purple-700">
            Five Essential Human Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="capability" className="text-sm font-medium" />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={false}
                />
                <Radar
                  name="Your Scores"
                  dataKey="score"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Capability Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(results.radarChart).map(([capability, score]) => {
          const info = CAPABILITY_INFO[capability as keyof typeof CAPABILITY_INFO];
          const Icon = info.icon;
          
          return (
            <Card key={capability} className="border-l-4" style={{ borderLeftColor: info.color }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: info.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold capitalize text-gray-900">
                      {capability}
                    </h3>
                  </div>
                  <Badge className={getScoreColor(score)}>
                    {getScoreLabel(score)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold" style={{ color: info.color }}>
                      {score.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">out of 5</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: info.color,
                        width: `${(score / 5) * 100}%`
                      }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2">
                    {info.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">
            What This Means
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">A Snapshot, Not a Scorecard</h4>
              <p className="text-sm text-gray-600">
                These results reflect your current self-perception, not fixed abilities.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">A Reflection Tool, Not a Judgment</h4>
              <p className="text-sm text-gray-600">
                Use these insights to understand patterns and explore possibilities.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Foundation for Collaboration</h4>
              <p className="text-sm text-gray-600">
                This radar becomes a starting point for team alignment and AI collaboration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            What Comes Next
          </h3>
          <p className="text-green-700">
            You'll bring this Radar into the next phase: the Team Practice Session, where it becomes 
            a foundation for shared insight, creative alignment, and collaboration with AI.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}