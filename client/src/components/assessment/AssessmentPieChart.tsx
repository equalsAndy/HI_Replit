import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AssessmentPieChartProps {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}

const COLORS = {
  thinking: 'rgb(1, 162, 82)',    // Green
  acting: 'rgb(241, 64, 64)',      // Red
  feeling: 'rgb(22, 126, 253)',    // Blue
  planning: 'rgb(255, 203, 47)'    // Yellow
};

export function AssessmentPieChart({ thinking, acting, feeling, planning }: AssessmentPieChartProps) {
  const data = [
    { name: 'Thinking', value: thinking, color: COLORS.thinking },
    { name: 'Acting', value: acting, color: COLORS.acting },
    { name: 'Feeling', value: feeling, color: COLORS.feeling },
    { name: 'Planning', value: planning, color: COLORS.planning }
  ];

  // Filter out any attributes with 0 value
  const filteredData = data.filter(item => item.value > 0);
  
  // If all values are 0, show equal distribution
  const chartData = filteredData.length === 0 
    ? data.map(item => ({ ...item, value: 25 })) 
    : filteredData;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={0} // Changed to 0 to make it a solid pie chart
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={1}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Added name to label
            labelLine={true} // Show label lines
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `${value}%`}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
          />
          {/* Removed Legend since labels are now on the chart */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}