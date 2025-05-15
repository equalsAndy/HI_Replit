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
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Get the color from the payload data
  const labelColor = payload.color || 'black';

  return (
    <text 
      x={x} 
      y={y} 
      fill={labelColor} 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontWeight="bold"
      fontSize="14px"
      stroke="white" // Add a white outline
      strokeWidth="0.5" // Make outline thin
      paintOrder="stroke" // Draw stroke first, then fill
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
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
            labelLine={true}
            label={renderCustomizedLabel}
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