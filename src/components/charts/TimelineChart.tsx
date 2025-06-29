import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface TimelineEvent {
  date: string;
  title: string;
  impact: number;
  category: string;
}

interface TimelineChartProps {
  events: TimelineEvent[];
  height?: number;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ events, height = 300 }) => {
  const { isDark } = useTheme();

  // Process events for chart data
  const chartData = events.map((event, index) => ({
    date: new Date(event.date).toLocaleDateString(),
    impact: event.impact,
    title: event.title,
    index: index + 1
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${
          isDark 
            ? 'bg-black/90 border-white/20 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <p className="font-semibold">{data.title}</p>
          <p className="text-sm opacity-75">{label}</p>
          <p className="text-sm">Impact: {data.impact}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#374151' : '#e5e7eb'} 
          />
          <XAxis 
            dataKey="date" 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="impact"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#impactGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;