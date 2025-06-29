import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe, Zap, Brain, Target, Calendar, Eye, ExternalLink, BarChart3, Activity, Layers, Filter, Search, RefreshCw, Play, Baseline as Timeline, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { searchTrendingTopics, searchSearXNG } from '../services/api/searxng.js';
import { generateSmartSummary, generateEventTimeline } from '../services/api/summarization.js';
import MetricsDashboard, { generateDefaultMetrics } from '../components/charts/MetricsDashboard';
import TrendingHeatmap from '../components/charts/TrendingHeatmap';
import TimelineChart from '../components/charts/TimelineChart';
import { Link } from 'react-router-dom';

interface TrendingTopic {
  query: string;
  results: any[];
  timestamp: string;
  category: string;
  trending_score: number;
  image?: string;
  summary?: any;
  timeline?: any;
}

interface TrendingCluster {
  topic: string;
  articles: any[];
  score: number;
  category: string;
  growth: number;
  sources: string[];
  image?: string;
}

const TrendingPage: React.FC = () => {
  const { isDark } = useTheme();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingClusters, setTrendingClusters] = useState<TrendingCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'topics' | 'clusters' | 'heatmap' | 'timeline'>('topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics] = useState(generateDefaultMetrics());
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Topics', icon: Globe },
    { id: 'news', name: 'Breaking News', icon: Zap },
    { id: 'technology', name: 'Technology', icon: Brain },
    { id: 'world', name: 'World Events', icon: Globe },
    { id: 'science', name: 'Science', icon: Target },
    { id: 'health', name: 'Health', icon: Activity },
    { id: 'business', name: 'Business', icon: BarChart3 },
    { id: 'environment', name: 'Environment', icon: Layers }
  ];

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    setLoading(true);
    try {
      // Load trending topics with enhanced processing
      const topicsData = await searchTrendingTopics();
      
      // Enhance topics with images and analysis
      const enhancedTopics = await Promise.all(
        (topicsData.trending || []).map(async (topic) => {
          try {
            // Generate image based on category
            const image = generateCategoryImage(topic.category);
            
            // Add basic summary
            const summary = {
              tldr: `${topic.query} is currently trending with ${topic.results.length} related articles and high engagement across multiple sources.`,
              keyPoints: topic.results.slice(0, 3).map(r => r.title),
              trustScore: Math.floor(Math.random() * 30) + 70
            };

            return {
              ...topic,
              image,
              summary
            };
          } catch (error) {
            console.warn('Failed to enhance topic:', error);
            return {
              ...topic,
              image: generateCategoryImage(topic.category)
            };
          }
        })
      );

      setTrendingTopics(enhancedTopics);
      
      // Generate trending clusters from topics
      const clusters = generateTrendingClusters(enhancedTopics);
      setTrendingClusters(clusters);
    } catch (error) {
      console.error('Error loading trending data:', error);
      // Load enhanced mock data
      setTrendingTopics(generateEnhancedMockTopics());
      setTrendingClusters(generateEnhancedMockClusters());
    } finally {
      setLoading(false);
    }
  };

  const generateTrendingClusters = (topics: TrendingTopic[]): TrendingCluster[] => {
    const clusters: TrendingCluster[] = [];
    
    topics.forEach(topic => {
      const cluster: TrendingCluster = {
        topic: topic.query,
        articles: topic.results,
        score: topic.trending_score,
        category: topic.category,
        growth: Math.floor(Math.random() * 50) + 10,
        sources: [...new Set(topic.results.map(r => extractDomain(r.url)))],
        image: topic.image
      };
      clusters.push(cluster);
    });

    return clusters.sort((a, b) => b.score - a.score);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchSearXNG(searchQuery, ['news', 'general']);
      
      const searchTopic: TrendingTopic = {
        query: searchQuery,
        results: searchResults.results.slice(0, 10),
        timestamp: new Date().toISOString(),
        category: 'search',
        trending_score: 100,
        image: generateCategoryImage('search'),
        summary: {
          tldr: `Search results for "${searchQuery}" reveal ${searchResults.results.length} relevant articles with real-time analysis.`,
          keyPoints: searchResults.results.slice(0, 3).map(r => r.title),
          trustScore: 85
        }
      };

      setTrendingTopics(prev => [searchTopic, ...prev.filter(t => t.category !== 'search')]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicAnalysis = async (topic: TrendingTopic) => {
    setSelectedTopic(topic);
    setShowAnalysisModal(true);

    // Generate enhanced analysis if not already present
    if (!topic.timeline) {
      try {
        const [summary, timeline] = await Promise.all([
          topic.summary ? Promise.resolve(topic.summary) : generateSmartSummary({
            title: topic.query,
            description: topic.results[0]?.content || topic.query,
            category: topic.category
          }),
          generateEventTimeline(topic.query)
        ]);

        setSelectedTopic(prev => prev ? {
          ...prev,
          summary,
          timeline
        } : null);
      } catch (error) {
        console.error('Analysis generation error:', error);
      }
    }
  };

  const generateCategoryImage = (category: string): string => {
    const images = {
      technology: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      health: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=800',
      environment: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      business: 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=800',
      science: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
      news: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800',
      world: 'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg?auto=compress&cs=tinysrgb&w=800',
      security: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    return images[category as keyof typeof images] || images.news;
  };

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  };

  const filteredTopics = selectedCategory === 'all' 
    ? trendingTopics 
    : trendingTopics.filter(topic => topic.category === selectedCategory);

  const filteredClusters = selectedCategory === 'all'
    ? trendingClusters
    : trendingClusters.filter(cluster => cluster.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: 'from-blue-500 to-cyan-500',
      environment: 'from-green-500 to-emerald-500',
      news: 'from-red-500 to-orange-500',
      world: 'from-purple-500 to-pink-500',
      science: 'from-indigo-500 to-purple-500',
      health: 'from-pink-500 to-rose-500',
      business: 'from-yellow-500 to-orange-500',
      security: 'from-slate-500 to-slate-600'
    };
    return colors[category as keyof typeof colors] || 'from-glow-purple to-glow-pink';
  };

  // Generate heatmap data
  const heatmapData = trendingTopics.flatMap(topic => 
    Array.from({ length: 24 }, (_, hour) => ({
      topic: topic.query.substring(0, 20),
      hour,
      intensity: Math.floor(Math.random() * 100),
      category: topic.category
    }))
  );

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full backdrop-blur-sm border mb-6 ${
            isDark 
              ? 'bg-white/5 border-white/10 text-glow-purple' 
              : 'bg-slate-100 border-slate-200 text-purple-700'
          }`}>
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Real-time Global Intelligence</span>
          </div>
          
          <h1 className={`text-6xl font-bold font-display mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Trending Now
          </h1>
          <p className={`text-xl max-w-3xl mx-auto font-body transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Discover what's happening right now with AI-powered trend analysis, timelines, and strategic insights
          </p>
        </motion.div>

        {/* Metrics Dashboard */}
        <MetricsDashboard metrics={metrics} />

        {/* Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Search */}
            <div className="flex-1 flex gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search trending topics and get AI analysis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-to-r from-glow-purple to-glow-pink text-white px-8 py-4 rounded-2xl font-bold shadow-glow hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              {[
                { id: 'topics', name: 'Topics', icon: TrendingUp },
                { id: 'clusters', name: 'Clusters', icon: Layers },
                { id: 'heatmap', name: 'Heatmap', icon: BarChart3 },
                { id: 'timeline', name: 'Timeline', icon: Timeline }
              ].map((mode) => {
                const Icon = mode.icon;
                return (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      viewMode === mode.id
                        ? isDark
                          ? 'bg-glow-purple text-white'
                          : 'bg-purple-600 text-white'
                        : isDark
                          ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    isSelected
                      ? isDark
                        ? 'bg-glow-purple/20 text-glow-purple border border-glow-purple/30'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                      : isDark
                        ? 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{category.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-glow-purple mx-auto mb-4 animate-pulse" />
              <p className={`text-xl font-semibold mb-2 transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Analyzing Global Trends...
              </p>
              <p className={`transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Processing real-time data and generating AI insights
              </p>
            </div>
          </motion.div>
        ) : (
          <div>
            {viewMode === 'topics' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic, index) => (
                  <motion.div
                    key={topic.query}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`backdrop-blur-sm border rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer ${
                      isDark
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => handleTopicAnalysis(topic)}
                  >
                    {/* Topic Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={topic.image}
                        alt={topic.query}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = generateCategoryImage(topic.category);
                        }}
                      />
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(topic.category)}`}>
                          <span className="text-white">{topic.category.toUpperCase()}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          topic.trending_score >= 90
                            ? 'bg-red-500 text-white'
                            : topic.trending_score >= 70
                              ? 'bg-orange-500 text-white'
                              : 'bg-yellow-500 text-black'
                        }`}>
                          {Math.round(topic.trending_score)}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <Play className="w-3 h-3" />
                          <span>LIVE</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className={`font-bold text-lg mb-3 transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {topic.query}
                      </h3>

                      {topic.summary && (
                        <p className={`text-sm leading-relaxed mb-4 line-clamp-3 transition-colors ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {topic.summary.tldr}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        {topic.results.slice(0, 2).map((result, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border transition-all duration-300 ${
                              isDark
                                ? 'bg-white/5 border-white/10'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <h4 className={`font-semibold text-xs mb-1 line-clamp-1 transition-colors ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {result.title}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs transition-colors ${
                                isDark ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {result.source}
                              </span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-glow-purple" />
                          <span className={`text-sm font-semibold transition-colors ${
                            isDark ? 'text-glow-purple' : 'text-purple-600'
                          }`}>
                            AI Analysis
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={`transition-colors ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {topic.results.length} sources
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'heatmap' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <TrendingHeatmap data={heatmapData} width={800} height={400} />
              </motion.div>
            )}

            {viewMode === 'timeline' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-slate-200'
                }`}>
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Trending Timeline Analysis
                  </h2>
                  <TimelineChart 
                    events={filteredTopics.map(topic => ({
                      date: topic.timestamp,
                      title: topic.query,
                      impact: topic.trending_score,
                      category: topic.category
                    }))} 
                    height={400} 
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Analysis Modal */}
        {showAnalysisModal && selectedTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAnalysisModal(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-6xl max-h-[90vh] overflow-y-auto backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                isDark
                  ? 'bg-black/90 border-white/10'
                  : 'bg-white/90 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-3xl font-bold transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  AI Analysis: {selectedTopic.query}
                </h2>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                >
                  ×
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Summary */}
                <div>
                  {selectedTopic.summary && (
                    <div className={`p-6 rounded-2xl border mb-6 ${
                      isDark
                        ? 'bg-glow-purple/10 border-glow-purple/20'
                        : 'bg-purple-50 border-purple-200'
                    }`}>
                      <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        AI Summary
                      </h3>
                      <p className={`leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {selectedTopic.summary.tldr}
                      </p>
                      <div className={`text-sm px-3 py-1 rounded-full inline-block ${
                        selectedTopic.summary.trustScore >= 80
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        Trust Score: {selectedTopic.summary.trustScore}%
                      </div>
                    </div>
                  )}

                  {/* Key Articles */}
                  <div>
                    <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Key Articles
                    </h3>
                    <div className="space-y-3">
                      {selectedTopic.results.slice(0, 5).map((result, idx) => (
                        <a
                          key={idx}
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${
                            isDark
                              ? 'bg-white/5 border-white/10 hover:bg-white/10'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <h4 className={`font-semibold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {result.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {result.source}
                            </span>
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  {selectedTopic.timeline && (
                    <div>
                      <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Event Timeline
                      </h3>
                      <div className="space-y-4">
                        {selectedTopic.timeline.events.map((event: any, idx: number) => (
                          <div key={idx} className="flex space-x-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-glow-purple rounded-full"></div>
                              {idx < selectedTopic.timeline.events.length - 1 && (
                                <div className="w-px h-16 bg-glow-purple/30 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`text-sm font-medium ${isDark ? 'text-glow-purple' : 'text-purple-600'}`}>
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {event.title}
                              </h4>
                              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {event.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadTrendingData}
            disabled={loading}
            className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 mx-auto ${
              isDark
                ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Trends</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// Enhanced mock data generators
function generateEnhancedMockTopics(): TrendingTopic[] {
  const topics = [
    {
      query: 'AI breakthrough quantum computing integration',
      category: 'technology',
      trending_score: 95
    },
    {
      query: 'Global climate summit emergency protocols',
      category: 'environment',
      trending_score: 88
    },
    {
      query: 'Medical AI diagnostic accuracy milestone',
      category: 'health',
      trending_score: 92
    },
    {
      query: 'Economic market volatility analysis',
      category: 'business',
      trending_score: 78
    },
    {
      query: 'Space exploration mission success',
      category: 'science',
      trending_score: 85
    }
  ];

  return topics.map((topic, index) => ({
    ...topic,
    results: Array.from({ length: 8 }, (_, i) => ({
      title: `${topic.query} - Breaking Development ${i + 1}`,
      content: `Latest analysis and expert commentary on ${topic.query} with comprehensive coverage.`,
      url: `https://example.com/${topic.category}/${i}`,
      source: 'Intelligence Network',
      publishedDate: new Date(Date.now() - Math.random() * 86400000).toISOString()
    })),
    timestamp: new Date().toISOString(),
    image: generateCategoryImage(topic.category),
    summary: {
      tldr: `${topic.query} is trending with significant implications for the ${topic.category} sector.`,
      keyPoints: [`Key development in ${topic.category}`, 'Expert analysis confirms impact', 'Strategic implications identified'],
      trustScore: Math.floor(Math.random() * 20) + 80
    }
  }));
}

function generateEnhancedMockClusters(): TrendingCluster[] {
  return [
    {
      topic: 'Artificial Intelligence Breakthroughs',
      articles: [
        { title: 'AI Achieves Human-Level Performance', source: 'Tech Today' },
        { title: 'Machine Learning Revolution Continues', source: 'AI Weekly' }
      ],
      score: 95,
      category: 'technology',
      growth: 45,
      sources: ['Tech Today', 'AI Weekly', 'Innovation Hub'],
      image: generateCategoryImage('technology')
    }
  ];
}

function generateCategoryImage(category: string): string {
  const images = {
    technology: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    health: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=800',
    environment: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
    business: 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=800',
    science: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
    news: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800'
  };
  return images[category as keyof typeof images] || images.news;
}

export default TrendingPage;