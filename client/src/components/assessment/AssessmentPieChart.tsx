import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AssessmentPieChartProps {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}

const COLORS = {
  acting: 'rgb(241, 64, 64)',     // Red
  feeling: 'rgb(22, 126, 253)',   // Blue
  planning: 'rgb(255, 203, 47)',  // Yellow
  thinking: 'rgb(1, 162, 82)'     // Green
};

// Custom bold label renderer for outer labels
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, payload } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 35; // Position labels 35px from outer edge
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill={payload.color}
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ 
        fontWeight: 600,
        fontSize: window.innerWidth >= 1024 ? '20px' : '17.5px',
        filter: 'drop-shadow(0px 0px 2px white)' // Add white glow for better visibility
      }}
    >
      {`${name}: ${value}%`}
    </text>
  );
};

// Inner label renderer for smaller screens
const renderInnerLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white"
      textAnchor="middle" 
      dominantBaseline="central"
      style={{ 
        fontWeight: 700,
        fontSize: '14px',
        filter: 'drop-shadow(0px 0px 1px black)' // Black outline for better contrast
      }}
    >
      {name}
    </text>
  );
};

export function AssessmentPieChart({ thinking, acting, feeling, planning }: AssessmentPieChartProps) {
  // Ensure we're using numbers
  const thinkingValue = Number(thinking) || 0;
  const actingValue = Number(acting) || 0;
  const feelingValue = Number(feeling) || 0;
  const planningValue = Number(planning) || 0;
  
  // Calculate total for percentages
  const total = thinkingValue + actingValue + feelingValue + planningValue;
  
  // Calculate percentages
  const calculatePercentage = (value: number) => 
    total === 0 ? 25 : Math.round((value / total) * 100);
  
  const data = [
    { name: 'Acting', value: calculatePercentage(actingValue), rawValue: actingValue, color: COLORS.acting },
    { name: 'Feeling', value: calculatePercentage(feelingValue), rawValue: feelingValue, color: COLORS.feeling },
    { name: 'Planning', value: calculatePercentage(planningValue), rawValue: planningValue, color: COLORS.planning },
    { name: 'Thinking', value: calculatePercentage(thinkingValue), rawValue: thinkingValue, color: COLORS.thinking }
  ];
  
  console.log("Assessment Pie Chart Data:", { 
    raw: { thinking: thinkingValue, acting: actingValue, feeling: feelingValue, planning: planningValue, total },
    percentages: data.map(d => ({ name: d.name, percentage: d.value }))
  });

  // Filter out any attributes with 0 value
  const filteredData = data.filter(item => item.rawValue > 0);

  // If all values are 0, show equal distribution
  const chartData = filteredData.length === 0 
    ? data.map(item => ({ ...item, value: 25 })) 
    : filteredData;

  return (
    <div className="w-full h-full mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={window.innerWidth >= 1024}
            label={window.innerWidth >= 1024 ? renderCustomizedLabel : renderInnerLabel}
            outerRadius={window.innerWidth >= 1024 ? "78%" : "70.2%"}
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