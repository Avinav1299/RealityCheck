import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe, Zap, Brain, Target, Calendar, Eye, ExternalLink, BarChart3, Activity, Layers, Filter, Search, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { searchTrendingTopics, searchWithSearXNG } from '../services/scraping/searxngService';

interface TrendingTopic {
  query: string;
  results: any[];
  timestamp: string;
  category: string;
  trending_score: number;
}

interface TrendingCluster {
  topic: string;
  articles: any[];
  score: number;
  category: string;
  growth: number;
  sources: string[];
}

const TrendingPage: React.FC = () => {
  const { isDark } = useTheme();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingClusters, setTrendingClusters] = useState<TrendingCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'topics' | 'clusters' | 'timeline'>('topics');
  const [searchQuery, setSearchQuery] = useState('');

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
      const [topicsData] = await Promise.all([
        searchTrendingTopics(),
        // Could add more data sources here
      ]);

      setTrendingTopics(topicsData.trending || []);
      
      // Generate trending clusters from topics
      const clusters = generateTrendingClusters(topicsData.trending || []);
      setTrendingClusters(clusters);
    } catch (error) {
      console.error('Error loading trending data:', error);
      // Load mock data
      setTrendingTopics(generateMockTrendingTopics());
      setTrendingClusters(generateMockClusters());
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
        growth: Math.floor(Math.random() * 50) + 10, // Mock growth percentage
        sources: [...new Set(topic.results.map(r => r.source))]
      };
      clusters.push(cluster);
    });

    return clusters.sort((a, b) => b.score - a.score);
  };

  const generateMockTrendingTopics = (): TrendingTopic[] => {
    return [
      {
        query: 'AI breakthrough quantum computing',
        results: [
          {
            title: 'Quantum AI Achieves Unprecedented Processing Speed',
            url: 'https://example.com/quantum-ai',
            content: 'Revolutionary breakthrough in quantum-powered artificial intelligence',
            source: 'Tech News',
            category: 'technology'
          }
        ],
        timestamp: new Date().toISOString(),
        category: 'technology',
        trending_score: 95
      },
      {
        query: 'global climate summit agreements',
        results: [
          {
            title: 'Historic Climate Agreement Reached at Global Summit',
            url: 'https://example.com/climate-summit',
            content: 'World leaders unite on ambitious climate action plan',
            source: 'Global News',
            category: 'environment'
          }
        ],
        timestamp: new Date().toISOString(),
        category: 'environment',
        trending_score: 88
      }
    ];
  };

  const generateMockClusters = (): TrendingCluster[] => {
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
        sources: ['Tech Today', 'AI Weekly', 'Innovation Hub']
      },
      {
        topic: 'Climate Action Initiatives',
        articles: [
          { title: 'Global Climate Summit Results', source: 'Environment News' },
          { title: 'Renewable Energy Adoption Accelerates', source: 'Green Tech' }
        ],
        score: 88,
        category: 'environment',
        growth: 32,
        sources: ['Environment News', 'Green Tech', 'Climate Watch']
      }
    ];
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchWithSearXNG(searchQuery, ['news', 'general']);
      
      // Convert search results to trending format
      const searchTopic: TrendingTopic = {
        query: searchQuery,
        results: searchResults.results.slice(0, 10),
        timestamp: new Date().toISOString(),
        category: 'search',
        trending_score: 100
      };

      setTrendingTopics(prev => [searchTopic, ...prev.filter(t => t.category !== 'search')]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
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
            Discover what's happening right now across the global information landscape with AI-powered trend analysis
          </p>
        </motion.div>

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
                  placeholder="Search trending topics..."
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
                { id: 'timeline', name: 'Timeline', icon: Calendar }
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
                Processing real-time data from multiple sources
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
                    className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 ${
                      isDark
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(topic.category)}`}>
                        <span className="text-white">{topic.category.toUpperCase()}</span>
                      </div>
                      <div className={`text-2xl font-bold ${
                        topic.trending_score >= 90
                          ? 'text-red-400'
                          : topic.trending_score >= 70
                            ? 'text-orange-400'
                            : 'text-yellow-400'
                      }`}>
                        {Math.round(topic.trending_score)}
                      </div>
                    </div>

                    <h3 className={`font-bold text-lg mb-4 transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {topic.query}
                    </h3>

                    <div className="space-y-3">
                      {topic.results.slice(0, 3).map((result, idx) => (
                        <a
                          key={idx}
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                            isDark
                              ? 'bg-white/5 border-white/10 hover:bg-white/10'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <h4 className={`font-semibold text-sm mb-1 line-clamp-2 transition-colors ${
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
                        </a>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`transition-colors ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {topic.results.length} articles
                        </span>
                        <span className={`transition-colors ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {new Date(topic.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'clusters' && (
              <div className="space-y-6">
                {filteredClusters.map((cluster, index) => (
                  <motion.div
                    key={cluster.topic}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                      isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className={`text-2xl font-bold mb-2 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {cluster.topic}
                        </h2>
                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(cluster.category)}`}>
                            <span className="text-white">{cluster.category.toUpperCase()}</span>
                          </div>
                          <span className={`text-sm transition-colors ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {cluster.sources.length} sources
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          cluster.score >= 90
                            ? 'text-red-400'
                            : cluster.score >= 70
                              ? 'text-orange-400'
                              : 'text-yellow-400'
                        }`}>
                          {Math.round(cluster.score)}
                        </div>
                        <div className={`text-sm transition-colors ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          +{cluster.growth}% growth
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cluster.articles.slice(0, 6).map((article, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border ${
                            isDark
                              ? 'bg-white/5 border-white/10'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <h4 className={`font-semibold text-sm mb-2 line-clamp-2 transition-colors ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {article.title}
                          </h4>
                          <span className={`text-xs transition-colors ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {article.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Trending Timeline
                </h2>
                
                <div className="space-y-6">
                  {filteredTopics.map((topic, index) => (
                    <div key={topic.query} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-glow-purple rounded-full"></div>
                        {index < filteredTopics.length - 1 && (
                          <div className="w-px h-16 bg-glow-purple/30 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-sm font-medium text-glow-purple`}>
                            {new Date(topic.timestamp).toLocaleTimeString()}
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(topic.category)}`}>
                            <span className="text-white">{topic.category}</span>
                          </div>
                        </div>
                        <h4 className={`font-bold mb-2 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {topic.query}
                        </h4>
                        <p className={`text-sm transition-colors ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {topic.results.length} articles trending with {Math.round(topic.trending_score)} score
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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

export default TrendingPage;