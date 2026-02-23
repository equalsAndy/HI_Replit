import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadarChartProps {
  data: {
    imagination: number;
    curiosity: number;
    empathy: number;
    creativity: number;
    courage: number;
  };
}

const ImaginalAgilityRadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const radarData = [
    { capacity: 'Imagination', score: data.imagination, fullMark: 5 },
    { capacity: 'Curiosity',   score: data.curiosity,   fullMark: 5 },
    { capacity: 'Caring',      score: data.empathy,     fullMark: 5 },
    { capacity: 'Creativity',  score: data.creativity,  fullMark: 5 },
    { capacity: 'Courage',     score: data.courage,     fullMark: 5 },
  ];

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-3">
      <h3 className="text-lg font-semibold text-purple-700 mb-2 text-center">
        Your Capability Prism
      </h3>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 20, right: 50, bottom: 20, left: 50 }}>
            <defs>
              <radialGradient id="prismFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#10b981" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.75} />
              </radialGradient>
            </defs>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="capacity"
              tick={{ fontSize: 15, fill: '#4b5563', fontWeight: 600 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#7c3aed"
              fill="url(#prismFill)"
              strokeWidth={2}
              dot={{ r: 4, fill: '#7c3aed' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImaginalAgilityRadarChart;
