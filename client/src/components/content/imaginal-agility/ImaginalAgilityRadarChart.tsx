import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

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
    {
      capacity: 'Imagination',
      score: data.imagination,
      fullMark: 5,
    },
    {
      capacity: 'Curiosity',
      score: data.curiosity,
      fullMark: 5,
    },
    {
      capacity: 'Empathy',
      score: data.empathy,
      fullMark: 5,
    },
    {
      capacity: 'Creativity',
      score: data.creativity,
      fullMark: 5,
    },
    {
      capacity: 'Courage',
      score: data.courage,
      fullMark: 5,
    },
  ];

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-2">
      <h3 className="text-lg font-semibold text-purple-700 mb-1 text-center">
        Five Core Capabilities
      </h3>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="capacity" 
              tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
              className="text-sm"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 5]} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ r: 4, fill: '#8b5cf6' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImaginalAgilityRadarChart;