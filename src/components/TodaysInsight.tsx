import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Clock, 
  ExternalLink, 
  Eye, 
  TrendingUp,
  AlertTriangle,
  Globe,
  Play,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface InsightData {
  id: string;
  headline: string;
  timestamp: string;
  source: string;
  category: 'climate' | 'disaster' | 'global-alert' | 'technology' | 'health';
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  references: string[];
  trustScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  readingTime: number;
}

const TodaysInsight: React.FC = () => {
  const { isDark } = useTheme();
  const [currentInsight, setCurrentInsight] = useState<InsightData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const mockInsights: InsightData[] = [
    {
      id: '1',
      headline: 'Antarctic Ice Sheet Shows Unprecedented Melting Patterns',
      timestamp: new Date().toISOString(),
      source: 'Climate Research Institute',
      category: 'climate',
      summary: 'Satellite data reveals accelerated ice loss in West Antarctica, with implications for global sea level rise. Advanced AI analysis indicates potential tipping point scenarios within the next decade.',
      imageUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      references: [
        'Nature Climate Change Journal',
        'NASA Earth Observatory',
        'IPCC Assessment Report'
      ],
      trustScore: 94,
      urgencyLevel: 'high',
      tags: ['Climate Change', 'Antarctica', 'Sea Level', 'Satellite Data'],
      readingTime: 4
    },
    {
      id: '2',
      headline: 'AI-Powered Early Warning System Prevents Major Earthquake Damage',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      source: 'Global Seismic Network',
      category: 'disaster',
      summary: 'Revolutionary machine learning algorithms successfully predicted seismic activity 72 hours in advance, enabling evacuation of 50,000 residents. This breakthrough represents a new era in disaster preparedness.',
      imageUrl: 'https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800',
      videoUrl: 'https://example.com/earthquake-prediction-video',
      references: [
        'Seismological Research Letters',
        'UN Disaster Risk Reduction',
        'MIT Technology Review'
      ],
      trustScore: 97,
      urgencyLevel: 'critical',
      tags: ['AI', 'Earthquake', 'Early Warning', 'Disaster Prevention'],
      readingTime: 6
    },
    {
      id: '3',
      headline: 'Breakthrough Quantum Computing Achievement Reshapes Cybersecurity',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      source: 'Quantum Research Consortium',
      category: 'technology',
      summary: 'Scientists achieve 1000-qubit quantum computer milestone, demonstrating ability to break current encryption standards. Global cybersecurity protocols require immediate updates to maintain data protection.',
      imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      references: [
        'Science Magazine',
        'IEEE Quantum Computing',
        'National Security Agency'
      ],
      trustScore: 91,
      urgencyLevel: 'high',
      tags: ['Quantum Computing', 'Cybersecurity', 'Encryption', 'Technology'],
      readingTime: 5
    }
  ];

  useEffect(() => {
    // Load initial insight
    loadRandomInsight();
    
    // Auto-refresh every 4 hours
    const interval = setInterval(() => {
      loadRandomInsight();
    }, 4 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadRandomInsight = () => {
    const randomInsight = mockInsights[Math.floor(Math.random() * mockInsights.length)];
    setCurrentInsight(randomInsight);
    setLastRefresh(new Date());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    loadRandomInsight();
    setIsRefreshing(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'climate': return Globe;
      case 'disaster': return AlertTriangle;
      case 'global-alert': return TrendingUp;
      case 'technology': return Eye;
      case 'health': return FileText;
      default: return Globe;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'climate': return 'from-green-500 to-emerald-500';
      case 'disaster': return 'from-red-500 to-orange-500';
      case 'global-alert': return 'from-yellow-500 to-orange-500';
      case 'technology': return 'from-blue-500 to-cyan-500';
      case 'health': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (!currentInsight) {
    return (
      <div className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
        isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-white border-slate-200'
      }`}>
        <div className="animate-pulse">
          <div className={`h-6 rounded mb-4 ${
            isDark ? 'bg-white/10' : 'bg-slate-200'
          }`}></div>
          <div className={`h-4 rounded mb-2 ${
            isDark ? 'bg-white/10' : 'bg-slate-200'
          }`}></div>
          <div className={`h-4 rounded w-3/4 ${
            isDark ? 'bg-white/10' : 'bg-slate-200'
          }`}></div>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(currentInsight.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 ${
        isDark
          ? 'bg-white/5 border-white/10 hover:bg-white/10'
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${getCategoryColor(currentInsight.category)} shadow-lg`}>
            <CategoryIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold font-display transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Today's Insight
            </h2>
            <p className={`text-sm font-medium transition-colors ${
              isDark ? 'text-glow-purple' : 'text-purple-600'
            }`}>
              Live Intelligence Update
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-3 rounded-2xl transition-all duration-300 ${
            isDark
              ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Headline */}
        <div>
          <h3 className={`text-xl font-bold leading-tight mb-3 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {currentInsight.headline}
          </h3>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-glow-purple" />
              <span className={`text-sm transition-colors ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {new Date(currentInsight.timestamp).toLocaleString()}
              </span>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getUrgencyColor(currentInsight.urgencyLevel)}`}>
              {currentInsight.urgencyLevel.toUpperCase()}
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              currentInsight.trustScore >= 90
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : currentInsight.trustScore >= 70
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {currentInsight.trustScore}% Trust
            </div>
          </div>
        </div>

        {/* Media */}
        {currentInsight.imageUrl && (
          <div className="relative">
            <img
              src={currentInsight.imageUrl}
              alt={currentInsight.headline}
              className="w-full h-64 object-cover rounded-2xl"
              onError={(e) => {
                e.currentTarget.src = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop';
              }}
            />
            {currentInsight.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-black/50 backdrop-blur-sm text-white p-4 rounded-full shadow-lg"
                >
                  <Play className="w-8 h-8" />
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
          isDark
            ? 'bg-glow-purple/10 border-glow-purple/20'
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="w-5 h-5 text-glow-purple" />
            <span className={`font-semibold transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              AI Analysis Summary
            </span>
          </div>
          <p className={`leading-relaxed transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {currentInsight.summary}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {currentInsight.tags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-white/10 text-slate-300 border border-white/20'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* References */}
        <div>
          <h4 className={`font-semibold mb-3 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            References & Sources
          </h4>
          <div className="space-y-2">
            {currentInsight.references.map((reference, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 text-sm transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <FileText className="w-4 h-4 text-glow-purple" />
                <span>{reference}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-4">
            <span className={`text-sm transition-colors ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Source: {currentInsight.source}
            </span>
            <span className={`text-sm transition-colors ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {currentInsight.readingTime} min read
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs transition-colors ${
              isDark ? 'text-slate-500' : 'text-slate-500'
            }`}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodaysInsight;