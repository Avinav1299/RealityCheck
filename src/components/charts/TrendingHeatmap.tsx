import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeatmapData {
  topic: string;
  hour: number;
  intensity: number;
  category: string;
}

interface TrendingHeatmapProps {
  data: HeatmapData[];
  width?: number;
  height?: number;
}

const TrendingHeatmap: React.FC<TrendingHeatmapProps> = ({ 
  data, 
  width = 800, 
  height = 400 
}) => {
  const { isDark } = useTheme();

  // Group data by topic and hour
  const topics = [...new Set(data.map(d => d.topic))];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensity = (topic: string, hour: number) => {
    const item = data.find(d => d.topic === topic && d.hour === hour);
    return item?.intensity || 0;
  };

  const getIntensityColor = (intensity: number) => {
    const opacity = intensity / 100;
    return isDark 
      ? `rgba(139, 92, 246, ${opacity})`
      : `rgba(139, 92, 246, ${opacity})`;
  };

  const cellWidth = width / hours.length;
  const cellHeight = height / topics.length;

  return (
    <div className={`rounded-2xl border p-4 ${
      isDark ? 'bg-black border-white/10' : 'bg-white border-slate-200'
    }`}>
      <h3 className={`text-lg font-bold mb-4 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}>
        Trending Topics Heatmap (24h)
      </h3>
      
      <div className="relative overflow-x-auto">
        <svg width={width} height={height + 60}>
          {/* Hour labels */}
          {hours.map(hour => (
            <text
              key={hour}
              x={hour * cellWidth + cellWidth / 2}
              y={height + 20}
              textAnchor="middle"
              className={`text-xs ${isDark ? 'fill-slate-400' : 'fill-slate-600'}`}
            >
              {hour}:00
            </text>
          ))}
          
          {/* Topic labels */}
          {topics.map((topic, topicIndex) => (
            <text
              key={topic}
              x={-10}
              y={topicIndex * cellHeight + cellHeight / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className={`text-xs ${isDark ? 'fill-slate-400' : 'fill-slate-600'}`}
            >
              {topic.length > 15 ? topic.substring(0, 15) + '...' : topic}
            </text>
          ))}
          
          {/* Heatmap cells */}
          {topics.map((topic, topicIndex) =>
            hours.map(hour => {
              const intensity = getIntensity(topic, hour);
              return (
                <rect
                  key={`${topic}-${hour}`}
                  x={hour * cellWidth}
                  y={topicIndex * cellHeight}
                  width={cellWidth - 1}
                  height={cellHeight - 1}
                  fill={getIntensityColor(intensity)}
                  stroke={isDark ? '#374151' : '#e5e7eb'}
                  strokeWidth={0.5}
                  className="cursor-pointer hover:stroke-purple-400"
                >
                  <title>{`${topic} at ${hour}:00 - Intensity: ${intensity}%`}</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-4 space-x-4">
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Low
        </span>
        <div className="flex space-x-1">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map(opacity => (
            <div
              key={opacity}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgba(139, 92, 246, ${opacity})` }}
            />
          ))}
        </div>
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          High
        </span>
      </div>
    </div>
  );
};

export default TrendingHeatmap;