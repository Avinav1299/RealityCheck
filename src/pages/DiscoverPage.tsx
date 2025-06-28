import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  TrendingUp, 
  Clock, 
  Eye, 
  ExternalLink, 
  Filter, 
  Search,
  Sparkles,
  Globe,
  Zap,
  Brain,
  Target,
  ArrowRight,
  Calendar,
  Tag
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  image_url: string | null;
  sector: string;
  published_at: string;
  created_at: string;
  source?: string;
  ai_summary?: string;
  tags?: string[];
  related_articles?: string[];
  trust_score?: number;
}

const DiscoverPage: React.FC = () => {
  const { isDark } = useTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filters = [
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'latest', name: 'Latest', icon: Clock },
    { id: 'verified', name: 'Verified', icon: Eye },
    { id: 'global', name: 'Global', icon: Globe },
  ];

  const popularTags = [
    'AI', 'Technology', 'Politics', 'Health', 'Climate', 'Business', 
    'Science', 'Security', 'Innovation', 'Research'
  ];

  useEffect(() => {
    loadArticles();
  }, [selectedFilter]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .limit(20);

      switch (selectedFilter) {
        case 'trending':
          query = query.order('created_at', { ascending: false });
          break;
        case 'latest':
          query = query.order('published_at', { ascending: false });
          break;
        case 'verified':
          // Would filter by verification status in real implementation
          query = query.order('created_at', { ascending: false });
          break;
        case 'global':
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enhance articles with mock data
      const enhancedArticles = (data || []).map(article => ({
        ...article,
        source: extractDomain(article.url),
        ai_summary: generateAISummary(article.content),
        tags: generateTags(article.sector, article.title),
        trust_score: Math.floor(Math.random() * 30) + 70,
        related_articles: []
      }));

      setArticles(enhancedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
      // Load mock data on error
      setArticles(generateMockArticles());
    } finally {
      setLoading(false);
    }
  };

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  };

  const generateAISummary = (content: string): string => {
    const summaries = [
      "AI analysis reveals key insights about emerging trends and their potential impact on global markets.",
      "Advanced verification confirms authenticity while highlighting important contextual factors.",
      "Strategic intelligence indicates significant developments with high confidence levels.",
      "Comprehensive analysis shows strong correlation with verified data sources and expert opinions."
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  };

  const generateTags = (sector: string, title: string): string[] => {
    const baseTags = [sector.charAt(0).toUpperCase() + sector.slice(1)];
    const additionalTags = popularTags.filter(() => Math.random() > 0.7).slice(0, 3);
    return [...baseTags, ...additionalTags];
  };

  const generateMockArticles = (): Article[] => {
    return [
      {
        id: '1',
        title: 'AI-Powered Verification Systems Reach New Milestone in Accuracy',
        content: 'Advanced artificial intelligence systems for media verification have achieved unprecedented accuracy rates...',
        url: 'https://example.com/ai-verification',
        image_url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
        sector: 'technology',
        published_at: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
        source: 'TechNews',
        ai_summary: 'Breakthrough in AI verification technology shows 99.2% accuracy in detecting manipulated media content.',
        tags: ['AI', 'Technology', 'Verification'],
        trust_score: 92
      },
      {
        id: '2',
        title: 'Global Climate Summit Announces Revolutionary Carbon Capture Initiative',
        content: 'World leaders unveil ambitious new carbon capture technology that could transform climate action...',
        url: 'https://example.com/climate-summit',
        image_url: 'https://images.pexels.com/photos/9324336/pexels-photo-9324336.jpeg?auto=compress&cs=tinysrgb&w=800',
        sector: 'climate',
        published_at: new Date(Date.now() - 7200000).toISOString(),
        created_at: new Date(Date.now() - 7200000).toISOString(),
        source: 'Climate Today',
        ai_summary: 'Major breakthrough in carbon capture technology promises to accelerate global decarbonization efforts.',
        tags: ['Climate', 'Innovation', 'Global'],
        trust_score: 88
      }
    ];
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => article.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark 
        ? 'bg-black' 
        : 'bg-white'
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
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Live Intelligence Discovery</span>
          </div>
          
          <h1 className={`text-6xl font-bold font-display mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Discover
          </h1>
          <p className={`text-xl max-w-3xl mx-auto font-body transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Explore trending articles, verified intelligence, and AI-powered insights from across the global information landscape
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search the intelligence network..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = selectedFilter === filter.id;
                
                return (
                  <motion.button
                    key={filter.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      isActive
                        ? isDark
                          ? 'bg-glow-purple text-white shadow-glow'
                          : 'bg-purple-600 text-white shadow-lg'
                        : isDark
                          ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                          : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{filter.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isSelected
                      ? isDark
                        ? 'bg-glow-purple/20 text-glow-purple border border-glow-purple/30'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                      : isDark
                        ? 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Articles Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <Brain className="w-12 h-12 text-glow-purple mx-auto mb-4 animate-pulse" />
              <p className={`text-xl font-semibold mb-2 transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Discovering Intelligence...
              </p>
              <p className={`transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Analyzing global information streams
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-glow'
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:shadow-xl'
                }`}
              >
                {/* Article Image */}
                {article.image_url && (
                  <div className="relative mb-6">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-2xl"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                        article.trust_score && article.trust_score >= 90
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : article.trust_score && article.trust_score >= 70
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {article.trust_score}% Trust
                      </div>
                    </div>
                  </div>
                )}

                {/* Article Content */}
                <div className="space-y-4">
                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-glow-purple" />
                      <span className={`transition-colors ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`font-medium transition-colors ${
                      isDark ? 'text-glow-purple' : 'text-purple-600'
                    }`}>
                      {article.source}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`font-bold text-lg leading-tight line-clamp-2 transition-colors group-hover:text-glow-purple ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {article.title}
                  </h3>

                  {/* AI Summary */}
                  <div className={`p-4 rounded-2xl backdrop-blur-sm border ${
                    isDark
                      ? 'bg-glow-purple/10 border-glow-purple/20'
                      : 'bg-purple-50 border-purple-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-glow-purple" />
                      <span className={`text-sm font-semibold transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        AI Summary
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed transition-colors ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {article.ai_summary}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {article.tags?.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDark
                            ? 'bg-white/10 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full backdrop-blur-sm border text-sm py-3 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 font-semibold ${
                      isDark
                        ? 'bg-glow-purple/10 border-glow-purple/20 text-glow-purple hover:bg-glow-purple/20'
                        : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <span>Explore Intelligence</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredArticles.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Compass className={`w-16 h-16 mx-auto mb-4 transition-colors ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <p className={`text-xl font-semibold mb-2 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              No Intelligence Found
            </p>
            <p className={`transition-colors ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Try adjusting your search or filters to discover more content
            </p>
          </motion.div>
        )}
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
          isDark ? 'bg-glow-purple' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
          isDark ? 'bg-glow-pink' : 'bg-pink-300'
        }`}></div>
      </div>
    </div>
  );
};

export default DiscoverPage;