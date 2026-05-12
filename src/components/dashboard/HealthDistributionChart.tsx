import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { FinancialHealthDist } from '../../types/dashboard.types';

interface Props {
  data: FinancialHealthDist | null;
}

const COLORS = ['#d5332a', '#eb8a14', '#1b7a43']; // Red, Orange, Green

const HealthDistributionChart: React.FC<Props> = ({ data }) => {
  if (!data) return <div className="h-64 flex items-center justify-center text-tertiary">Loading...</div>;

  const chartData = data.distribution.map(item => ({
    name: item.category,
    value: item.value
  }));

  return (
    <div className="h-80 w-full">
      <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider opacity-60">Financial Health Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthDistributionChart;
