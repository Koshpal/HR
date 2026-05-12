import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ParticipationDept } from '../../types/dashboard.types';

interface Props {
  data: ParticipationDept[];
}

const COLORS = ['#334eac', '#17a2b8', '#99a6d6', '#7bb5be'];

const DepartmentParticipationChart: React.FC<Props> = ({ data }) => {
  if (!data.length) return <div className="h-64 flex items-center justify-center text-tertiary">No data available</div>;

  return (
    <div className="h-80 w-full">
      <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider opacity-60">Participation by Department</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e0e0e0" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            dataKey="department" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666666' }}
            width={100}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(value) => [`${value}%`, 'Participation Rate']}
          />
          <Bar dataKey="participationRate" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepartmentParticipationChart;
