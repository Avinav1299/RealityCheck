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
  FileText,
  Zap,
  Brain
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface InsightData {
  id: string;
  headline: string;
  timestamp: string;
  source: string;
  category: 'climate' | 'disaster' | 'global-alert' | 'technology' | 'health' | 'security';
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  references: string[];
  trustScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  readingTime: number;
  verificationStatus: 'verified' | 'processing' | 'flagged';
  aiConfidence: number;
}

const TodaysInsight: React.FC = () => {
  const { isDark } = useTheme();
  const [currentInsight, setCurrentInsight] = useState<InsightData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const mockInsights: InsightData[] = [
    {
      id: '1',
      headline: 'AI-Powered Verification Systems Detect 15,000 Deepfakes in Real-Time',
      timestamp: new Date().toISOString(),
      source: 'Global AI Security Network',
      category: 'technology',
      summary: 'Advanced neural networks successfully identified and flagged sophisticated deepfake content across major platforms in the last 30 seconds, preventing potential misinformation spread to millions of users.',
      imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      references: [
        'MIT AI Lab Real-time Detection Report',
        'Stanford Digital Forensics Institute',
        'Global Platform Security Alliance'
      ],
      trustScore: 96,
      urgencyLevel: 'high',
      tags: ['AI', 'Deepfakes', 'Real-time', 'Security', 'Verification'],
      readingTime: 3,
      verificationStatus: 'verified',
      aiConfidence: 94
    },
    {
      id: '2',
      headline: 'Breaking: Quantum Computing Breakthrough Achieved in Live Laboratory',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      source: 'Quantum Research Consortium',
      category: 'technology',
      summary: 'Scientists achieve stable 1000-qubit quantum state for 12 consecutive seconds, marking a revolutionary milestone in quantum computing stability and practical applications.',
      imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      videoUrl: 'https://example.com/quantum-breakthrough',
      references: [
        'Nature Quantum Information',
        'IBM Quantum Network',
        'European Quantum Initiative'
      ],
      trustScore: 98,
      urgencyLevel: 'critical',
      tags: ['Quantum', 'Computing', 'Breakthrough', 'Science'],
      readingTime: 4,
      verificationStatus: 'verified',
      aiConfidence: 97
    },
    {
      id: '3',
      headline: 'Real-Time Climate Monitoring Detects Rapid Arctic Ice Formation',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      source: 'Arctic Climate Observatory',
      category: 'climate',
      summary: 'Satellite data reveals unexpected ice formation patterns in the Arctic, with AI models detecting changes occurring 300% faster than historical averages in the past 2 minutes.',
      imageUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      references: [
        'NASA Earth Observatory Live Feed',
        'Arctic Research Station Network',
        'Climate AI Prediction Models'
      ],
      trustScore: 91,
      urgencyLevel: 'high',
      tags: ['Climate', 'Arctic', 'Real-time', 'Satellite', 'AI'],
      readingTime: 5,
      verificationStatus: 'verified',
      aiConfidence: 89
    },
    {
      id: '4',
      headline: 'Global Health AI Identifies New Treatment Pattern in 47 Seconds',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      source: 'Medical AI Research Network',
      category: 'health',
      summary: 'Machine learning algorithms analyzing global health data discovered a novel treatment correlation that could benefit 2.3 million patients worldwide, verified across 15 countries.',
      imageUrl: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=800',
      references: [
        'World Health Organization AI Division',
        'Global Medical Database Consortium',
        'International Treatment Research Network'
      ],
      trustScore: 93,
      urgencyLevel: 'medium',
      tags: ['Health', 'AI', 'Treatment', 'Global', 'Research'],
      readingTime: 6,
      verificationStatus: 'verified',
      aiConfidence: 91
    },
    {
      id: '5',
      headline: 'Cybersecurity AI Prevents 2,847 Attacks in Last 60 Seconds',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      source: 'Global Cyber Defense Network',
      category: 'security',
      summary: 'Advanced threat detection systems successfully identified and neutralized sophisticated cyber attacks targeting critical infrastructure across 23 countries in real-time.',
      imageUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
      references: [
        'International Cybersecurity Alliance',
        'Critical Infrastructure Protection Agency',
        'AI Threat Intelligence Network'
      ],
      trustScore: 95,
      urgencyLevel: 'critical',
      tags: ['Cybersecurity', 'AI', 'Real-time', 'Defense', 'Global'],
      readingTime: 4,
      verificationStatus: 'verified',
      aiConfidence: 96
    }
  ];

  useEffect(() => {
    // Load initial insight
    loadRandomInsight();
    
    // Auto-refresh every 30 seconds for real-time feel
    const interval = setInterval(() => {
      if (autoRefreshEnabled) {
        loadRandomInsight();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  const loadRandomInsight = () => {
    const randomInsight = mockInsights[Math.floor(Math.random() * mockInsights.length)];
    // Update timestamp to current time for real-time feel
    const updatedInsight = {
      ...randomInsight,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    setCurrentInsight(updatedInsight);
    setLastRefresh(new Date());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate real-time processing
    await new Promise(resolve => setTimeout(resolve, 800));
    loadRandomInsight();
    setIsRefreshing(false);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'climate': return Globe;
      case 'disaster': return AlertTriangle;
      case 'global-alert': return TrendingUp;
      case 'technology': return Brain;
      case 'health': return FileText;
      case 'security': return Eye;
      default: return Zap;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'climate': return 'from-green-500 to-emerald-500';
      case 'disaster': return 'from-red-500 to-orange-500';
      case 'global-alert': return 'from-yellow-500 to-orange-500';
      case 'technology': return 'from-blue-500 to-cyan-500';
      case 'health': return 'from-purple-500 to-pink-500';
      case 'security': return 'from-red-600 to-pink-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'processing': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 animate-pulse';
      case 'flagged': return 'text-red-400 bg-red-500/10 border-red-500/20';
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
              Live Intelligence
            </h2>
            <p className={`text-sm font-medium transition-colors ${
              isDark ? 'text-glow-purple' : 'text-purple-600'
            }`}>
              Real-time Global Monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`p-2 rounded-xl transition-all duration-300 ${
              autoRefreshEnabled
                ? isDark
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-green-100 border border-green-200 text-green-600'
                : isDark
                  ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          >
            <Zap className={`w-4 h-4 ${autoRefreshEnabled ? 'animate-pulse' : ''}`} />
          </motion.button>

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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-glow-purple" />
              <span className={`text-sm font-medium transition-colors ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {getTimeAgo(currentInsight.timestamp)}
              </span>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getUrgencyColor(currentInsight.urgencyLevel)}`}>
              {currentInsight.urgencyLevel.toUpperCase()}
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getVerificationColor(currentInsight.verificationStatus)}`}>
              {currentInsight.verificationStatus.toUpperCase()}
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

            <div className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              AI: {currentInsight.aiConfidence}%
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
            <Brain className="w-5 h-5 text-glow-purple" />
            <span className={`font-semibold transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              AI Real-time Analysis
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
            Live Data Sources
          </h4>
          <div className="space-y-2">
            {currentInsight.references.map((reference, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 text-sm transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <div className="w-2 h-2 bg-glow-purple rounded-full animate-pulse"></div>
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
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className={`text-xs font-medium transition-colors ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              LIVE
            </span>
            <span className={`text-xs transition-colors ${
              isDark ? 'text-slate-500' : 'text-slate-500'
            }`}>
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TodaysInsight;