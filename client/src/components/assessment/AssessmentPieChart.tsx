
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

// Custom bold label renderer
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, payload } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.6; // Adjusted radius
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Create a background for better visibility
  return (
    <g>
      {/* Text shadow/background for better visibility */}
      <text 
        x={x} 
        y={y} 
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ 
          fontWeight: 600,
          fontSize: '14px',
          stroke: 'white',
          strokeWidth: 4,
          strokeLinejoin: 'round',
          paintOrder: 'stroke'
        }}
      >
        {`${name}: ${value}%`}
      </text>
      
      {/* Actual text */}
      <text 
        x={x} 
        y={y} 
        fill={payload.color}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ 
          fontWeight: 600,
          fontSize: '14px'
        }}
      >
        {`${name}: ${value}%`}
      </text>
    </g>
  );
};

export function AssessmentPieChart({ thinking, acting, feeling, planning }: AssessmentPieChartProps) {
  const data = [
    { name: 'Thinking', value: thinking, color: COLORS.thinking },
    { name: 'Acting', value: acting, color: COLORS.acting },
    { name: 'Feeling', value: feeling, color: COLORS.feeling },
    { name: 'Planning', value: planning, color: COLORS.planning }
  ].sort((a, b) => b.value - a.value); // Sort by value descending

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
            labelLine={true}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
