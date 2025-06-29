import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Globe, Zap, Activity, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Metric {
  label: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface MetricsDashboardProps {
  metrics: Metric[];
  animated?: boolean;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ 
  metrics, 
  animated = true 
}) => {
  const { isDark } = useTheme();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={animated ? { opacity: 0, y: 20 } : {}}
            animate={animated ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1 }}
            className={`backdrop-blur-sm border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDark
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : 'bg-white/70 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-xl bg-gradient-to-r ${metric.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className={`text-2xl font-bold mb-1 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium transition-colors ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {metric.label}
              </span>
              
              <div className={`flex items-center space-x-1 text-xs font-semibold ${
                metric.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`w-3 h-3 ${metric.change < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(metric.change)}%</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Default metrics for the platform
export const generateDefaultMetrics = (): Metric[] => [
  {
    label: 'Articles Today',
    value: Math.floor(Math.random() * 500) + 200,
    change: Math.floor(Math.random() * 20) + 5,
    icon: Globe,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    label: 'New Events',
    value: Math.floor(Math.random() * 50) + 10,
    change: Math.floor(Math.random() * 15) + 2,
    icon: Zap,
    color: 'from-purple-500 to-pink-500'
  },
  {
    label: 'Sources Used',
    value: Math.floor(Math.random() * 100) + 50,
    change: Math.floor(Math.random() * 10) + 1,
    icon: Eye,
    color: 'from-green-500 to-emerald-500'
  },
  {
    label: 'Live Scans',
    value: Math.floor(Math.random() * 1000) + 500,
    change: Math.floor(Math.random() * 25) + 10,
    icon: Activity,
    color: 'from-orange-500 to-red-500'
  },
  {
    label: 'AI Responses',
    value: Math.floor(Math.random() * 200) + 100,
    change: Math.floor(Math.random() * 30) + 5,
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    label: 'Uptime',
    value: '99.9%',
    change: 0.1,
    icon: Clock,
    color: 'from-teal-500 to-blue-500'
  }
];

export default MetricsDashboard;