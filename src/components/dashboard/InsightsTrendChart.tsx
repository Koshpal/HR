import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Props {
  data: any[];
}

const InsightsTrendChart: React.FC<Props> = ({ data }) => {
  if (!data.length) return <div className="h-64 flex items-center justify-center text-tertiary font-medium italic">No historical data available yet.</div>;

  const formattedData = data.map(item => ({
    name: `${item.month}/${item.year}`,
    Income: item.totalIncome,
    Expense: item.totalExpense,
    Savings: item.netSavings
  })).reverse();

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#334eac" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#334eac" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d5332a" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#d5332a" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1b7a43" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#1b7a43" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#999999' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#999999' }}
            tickFormatter={(value) => `$${value/1000}k`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
          />
          <Legend verticalAlign="top" height={40}/>
          <Area 
            type="monotone" 
            dataKey="Income" 
            stroke="#334eac" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIncome)" 
          />
          <Area 
            type="monotone" 
            dataKey="Expense" 
            stroke="#d5332a" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorExpense)" 
          />
          <Area 
            type="monotone" 
            dataKey="Savings" 
            stroke="#1b7a43" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorSavings)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsightsTrendChart;
