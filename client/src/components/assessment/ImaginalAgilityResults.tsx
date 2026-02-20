import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
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
    label: 'Imagination',
    icon: Zap,
    color: '#8B5CF6',
    description: 'Your ability to generate novel ideas and envision possibilities'
  },
  curiosity: {
    label: 'Curiosity',
    icon: Eye,
    color: '#3B82F6',
    description: 'Your drive to explore, question, and seek new experiences'
  },
  empathy: {
    label: 'Caring',
    icon: Heart,
    color: '#10B981',
    description: 'Your capacity to understand and connect with others'
  },
  creativity: {
    label: 'Creativity',
    icon: Lightbulb,
    color: '#F59E0B',
    description: 'Your talent for finding innovative solutions and expressions'
  },
  courage: {
    label: 'Courage',
    icon: Shield,
    color: '#EF4444',
    description: 'Your willingness to take risks and stand up for beliefs'
  }
};

function getScoreLabel(score: number) {
  if (score >= 4.5) return 'Exceptional';
  if (score >= 4.0) return 'Strong';
  if (score >= 3.5) return 'Good';
  if (score >= 3.0) return 'Moderate';
  if (score >= 2.5) return 'Developing';
  return 'Emerging';
}

function getScoreColor(score: number) {
  if (score >= 4.5) return 'bg-green-100 text-green-800';
  if (score >= 4.0) return 'bg-blue-100 text-blue-800';
  if (score >= 3.5) return 'bg-purple-100 text-purple-800';
  if (score >= 3.0) return 'bg-yellow-100 text-yellow-800';
  if (score >= 2.5) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

function getPrismShapeDescription(scores: AssessmentResults['radarChart']): string {
  const caps = [
    { name: 'Imagination', score: scores.imagination },
    { name: 'Curiosity',   score: scores.curiosity },
    { name: 'Caring',      score: scores.empathy },
    { name: 'Creativity',  score: scores.creativity },
    { name: 'Courage',     score: scores.courage },
  ].sort((a, b) => b.score - a.score);

  const spread = caps[0].score - caps[4].score;
  if (spread < 0.5) {
    return 'Your Prism is remarkably balanced — all five capabilities shine with similar strength.';
  }

  const topNames = caps.slice(0, 2).map(c => c.name).join(' and ');
  const bottomName = caps[caps.length - 1].name;
  return `Your Prism stretches furthest toward ${topNames}, with room to explore ${bottomName} more fully.`;
}

export function ImaginalAgilityResults({ results }: ImaginalAgilityResultsProps) {
  const radarData = [
    { capability: 'Imagination', score: results.radarChart.imagination, fullMark: 5 },
    { capability: 'Curiosity',   score: results.radarChart.curiosity,   fullMark: 5 },
    { capability: 'Caring',      score: results.radarChart.empathy,     fullMark: 5 },
    { capability: 'Creativity',  score: results.radarChart.creativity,  fullMark: 5 },
    { capability: 'Courage',     score: results.radarChart.courage,     fullMark: 5 },
  ];

  const shapeDescription = getPrismShapeDescription(results.radarChart);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-purple-700 flex items-center justify-center gap-2">
          <Zap className="h-6 w-6" />
          Your Capability Prism
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
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <defs>
                  <radialGradient id="prismFillResults" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.75} />
                  </radialGradient>
                </defs>
                <PolarGrid />
                <PolarAngleAxis dataKey="capability" className="text-sm font-medium" />
                <Radar
                  name="Your Scores"
                  dataKey="score"
                  stroke="#7c3aed"
                  fill="url(#prismFillResults)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7c3aed' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Qualitative shape description */}
          <p className="mt-4 text-center text-sm text-purple-700 italic font-medium">
            {shapeDescription}
          </p>
        </CardContent>
      </Card>

      {/* Capability Breakdown — qualitative only */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(results.radarChart) as [keyof typeof CAPABILITY_INFO, number][]).map(([key, score]) => {
          const info = CAPABILITY_INFO[key];
          if (!info) return null;
          const Icon = info.icon;

          return (
            <Card key={key} className="border-l-4" style={{ borderLeftColor: info.color }}>
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
                      {info.label}
                    </h3>
                  </div>
                  <Badge className={getScoreColor(score)}>
                    {getScoreLabel(score)}
                  </Badge>
                </div>

                {/* Proportional bar — visual only, no number */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
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
                This Prism becomes a starting point for team alignment and AI collaboration.
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
            You'll bring this Prism into the next phase: the Team Practice Session, where it becomes
            a foundation for shared insight, creative alignment, and collaboration with AI.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
