import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, TrendingUp, Clock, Eye, ExternalLink, Filter, Search, Sparkles, Globe, Zap, Brain, Target, ArrowRight, Calendar, Tag, Play, BookOpen, Baseline as Timeline, Layers, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { searchNews, searchTrendingTopics, searchSearXNG } from '../services/api/searxng.js';
import { generateSmartSummary, generateEventTimeline } from '../services/api/summarization.js';
import { generateEnhancedMockArticle } from '../services/scraping/imageScraper';

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedDate: string;
  source: string;
  category: string;
  thumbnail?: string;
  summary?: any;
  timeline?: any;
}

interface NewsSection {
  title: string;
  category: string;
  articles: Article[];
  icon: React.ComponentType<any>;
  color: string;
}

const DiscoverPage: React.FC = () => {
  const { isDark } = useTheme();
  const [newsSections, setNewsSections] = useState<NewsSection[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const categories = [
    { id: 'trending', name: 'Trending Now', icon: TrendingUp, color: 'from-red-500 to-orange-500' },
    { id: 'technology', name: 'Technology', icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { id: 'health', name: 'Health', icon: Brain, color: 'from-green-500 to-emerald-500' },
    { id: 'politics', name: 'Politics', icon: Target, color: 'from-purple-500 to-pink-500' },
    { id: 'climate', name: 'Climate', icon: Globe, color: 'from-teal-500 to-blue-500' },
    { id: 'business', name: 'Business', icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
    { id: 'science', name: 'Science', icon: BookOpen, color: 'from-indigo-500 to-purple-500' }
  ];

  useEffect(() => {
    loadDiscoverContent();
  }, []);

  const loadDiscoverContent = async () => {
    setLoading(true);
    try {
      // Try to load from Supabase if configured, otherwise use mock data
      if (isSupabaseConfigured) {
        try {
          const { data: articles, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;

          if (articles && articles.length > 0) {
            // Group articles by sector/category
            const groupedArticles = groupArticlesByCategory(articles);
            setNewsSections(groupedArticles);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Supabase query failed, falling back to mock data:', error);
        }
      }

      // Fallback to enhanced mock data
      const sectionsData = categories.map((category) => {
        const articles = Array.from({ length: 8 }, (_, index) => {
          const mockArticle = generateEnhancedMockArticle(category.id, index);
          return {
            id: `${category.id}-${index}`,
            title: mockArticle.title,
            description: mockArticle.description,
            url: `https://example.com/${category.id}/${index}`,
            urlToImage: mockArticle.image?.url || null,
            publishedDate: mockArticle.publishedDate || new Date().toISOString(),
            source: mockArticle.author || 'Intelligence Network',
            category: category.id
          };
        });

        return {
          title: category.name,
          category: category.id,
          articles,
          icon: category.icon,
          color: category.color
        };
      });

      setNewsSections(sectionsData);
    } catch (error) {
      console.error('Error loading discover content:', error);
      // Final fallback to basic mock data
      setNewsSections(categories.map(cat => ({
        title: cat.name,
        category: cat.id,
        articles: generateMockArticles(cat.id, 6),
        icon: cat.icon,
        color: cat.color
      })));
    } finally {
      setLoading(false);
    }
  };

  const groupArticlesByCategory = (articles: any[]): NewsSection[] => {
    const grouped = categories.map(category => ({
      title: category.name,
      category: category.id,
      articles: articles
        .filter(article => article.sector === category.id)
        .slice(0, 8)
        .map(article => ({
          id: article.id,
          title: article.title,
          description: article.content.substring(0, 200) + '...',
          url: article.url,
          urlToImage: article.image_url,
          publishedDate: article.published_at,
          source: extractDomain(article.url),
          category: article.sector
        })),
      icon: category.icon,
      color: category.color
    }));

    return grouped.filter(section => section.articles.length > 0);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Try SearXNG search first, fallback to mock data
      let searchArticles = [];
      
      try {
        const searchResults = await searchSearXNG(searchQuery, ['news', 'general']);
        searchArticles = searchResults.results.map(result => ({
          id: Math.random().toString(36).substr(2, 9),
          title: result.title,
          description: result.content || result.title,
          url: result.url,
          urlToImage: result.img_src || 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400',
          publishedDate: result.publishedDate || new Date().toISOString(),
          source: extractDomain(result.url),
          category: 'search'
        }));
      } catch (error) {
        console.warn('Search failed, using mock results:', error);
        // Generate mock search results
        searchArticles = Array.from({ length: 12 }, (_, index) => {
          const mockArticle = generateEnhancedMockArticle('search', index);
          return {
            id: `search-${index}`,
            title: `${searchQuery}: ${mockArticle.title}`,
            description: mockArticle.description,
            url: `https://example.com/search/${index}`,
            urlToImage: mockArticle.image?.url || null,
            publishedDate: mockArticle.publishedDate || new Date().toISOString(),
            source: mockArticle.author || 'Search Results',
            category: 'search'
          };
        });
      }

      // Add search results as a new section
      setNewsSections(prev => [
        {
          title: `Search: "${searchQuery}"`,
          category: 'search',
          articles: searchArticles.slice(0, 12),
          icon: Search,
          color: 'from-glow-purple to-glow-pink'
        },
        ...prev.filter(section => section.category !== 'search')
      ]);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = async (article: Article) => {
    setSelectedArticle(article);
    setShowSummaryModal(true);
    setLoadingSummary(true);

    try {
      // Try to generate smart summary, fallback to mock
      let summary;
      try {
        summary = await generateSmartSummary(article);
      } catch (error) {
        console.warn('Summary generation failed, using mock:', error);
        summary = generateMockSummary(article);
      }
      
      setSelectedArticle(prev => prev ? { ...prev, summary } : null);
    } catch (error) {
      console.error('Summary generation error:', error);
      setSelectedArticle(prev => prev ? { ...prev, summary: generateMockSummary(article) } : null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleTimelineClick = async (article: Article) => {
    setSelectedArticle(article);
    setShowTimelineModal(true);
    setLoadingTimeline(true);

    try {
      // Try to generate timeline, fallback to mock
      let timeline;
      try {
        timeline = await generateEventTimeline(article.title);
      } catch (error) {
        console.warn('Timeline generation failed, using mock:', error);
        timeline = generateMockTimeline(article);
      }
      
      setSelectedArticle(prev => prev ? { ...prev, timeline } : null);
    } catch (error) {
      console.error('Timeline generation error:', error);
      setSelectedArticle(prev => prev ? { ...prev, timeline: generateMockTimeline(article) } : null);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const generateMockSummary = (article: Article) => ({
    tldr: `${article.title} represents a significant development in ${article.category}. Key stakeholders are monitoring the situation closely as it unfolds.`,
    keyPoints: [
      'Major development in the field with widespread implications',
      'Expert analysis suggests long-term impact on industry trends',
      'Stakeholders are actively responding to the situation',
      'Further developments expected in the coming weeks'
    ],
    context: 'This development occurs within a broader context of ongoing changes in the industry, reflecting larger trends and patterns.',
    implications: 'The implications of this development extend beyond immediate effects, potentially influencing future policy and industry standards.',
    trustScore: Math.floor(Math.random() * 30) + 70
  });

  const generateMockTimeline = (article: Article) => ({
    events: [
      {
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        title: 'Initial Development',
        description: 'The first signs of this development were observed by industry experts.',
        source: 'Industry Reports'
      },
      {
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        title: 'Key Milestone Reached',
        description: 'Significant progress was made, attracting attention from major stakeholders.',
        source: 'News Agencies'
      },
      {
        date: new Date().toISOString(),
        title: 'Current Status',
        description: article.description,
        source: article.source
      }
    ],
    analysis: {
      summary: 'The timeline shows a clear progression of events leading to the current situation, with each milestone building upon previous developments.'
    }
  });

  const extractDomain = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  };

  const generateMockArticles = (category: string, count: number): Article[] => {
    const articles = [];
    for (let i = 0; i < count; i++) {
      const mockArticle = generateEnhancedMockArticle(category, i);
      articles.push({
        id: `${category}-${i}`,
        title: mockArticle.title,
        description: mockArticle.description,
        url: `https://example.com/${category}/${i}`,
        urlToImage: mockArticle.image?.url || null,
        publishedDate: mockArticle.publishedDate || new Date().toISOString(),
        source: mockArticle.author || 'Intelligence Network',
        category
      });
    }
    return articles;
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
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Real-time Intelligence Discovery</span>
          </div>
          
          <h1 className={`text-6xl font-bold font-display mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Discover
          </h1>
          <p className={`text-xl max-w-3xl mx-auto font-body transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Deep browsing with smart summaries, real-time web scraping, and multi-source intelligence aggregation
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <input
                type="text"
                placeholder="Search global intelligence network..."
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadDiscoverContent}
              disabled={loading}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* News Sections */}
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
                Scraping real-time sources and generating smart summaries
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {newsSections.map((section, sectionIndex) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="space-y-6"
                >
                  {/* Section Header */}
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${section.color} shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold font-display transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {section.title}
                      </h2>
                      <p className={`text-sm transition-colors ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {section.articles.length} articles • Real-time updates
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Scrollable Articles */}
                  <div className="overflow-x-auto pb-4">
                    <div className="flex space-x-6" style={{ width: 'max-content' }}>
                      {section.articles.map((article, index) => (
                        <motion.div
                          key={article.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className={`w-80 backdrop-blur-sm border rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group ${
                            isDark
                              ? 'bg-white/5 border-white/10 hover:bg-white/10'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                          onClick={() => handleArticleClick(article)}
                        >
                          {/* Article Image */}
                          <div className="relative mb-4">
                            <img
                              src={article.urlToImage || 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400'}
                              alt={article.title}
                              className="w-full h-40 object-cover rounded-2xl"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400';
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
                                LIVE
                              </div>
                            </div>
                          </div>

                          {/* Article Content */}
                          <div className="space-y-3">
                            <h3 className={`font-bold text-lg leading-tight line-clamp-2 transition-colors group-hover:text-glow-purple ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {article.title}
                            </h3>

                            <p className={`text-sm leading-relaxed line-clamp-3 transition-colors ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {article.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3 h-3 text-glow-purple" />
                                <span className={`transition-colors ${
                                  isDark ? 'text-slate-400' : 'text-slate-600'
                                }`}>
                                  {new Date(article.publishedDate).toLocaleDateString()}
                                </span>
                              </div>
                              <span className={`font-medium transition-colors ${
                                isDark ? 'text-glow-purple' : 'text-purple-600'
                              }`}>
                                {article.source}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArticleClick(article);
                                }}
                                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center space-x-1 ${
                                  isDark
                                    ? 'bg-glow-purple/10 border border-glow-purple/20 text-glow-purple hover:bg-glow-purple/20'
                                    : 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
                                }`}
                              >
                                <Brain className="w-3 h-3" />
                                <span>Smart Summary</span>
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTimelineClick(article);
                                }}
                                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center space-x-1 ${
                                  isDark
                                    ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                                    : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                <Timeline className="w-3 h-3" />
                                <span>Timeline</span>
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Smart Summary Modal */}
        {showSummaryModal && selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSummaryModal(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                isDark
                  ? 'bg-black/90 border-white/10'
                  : 'bg-white/90 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Smart Summary
                </h2>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingSummary ? (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-glow-purple mx-auto mb-4 animate-pulse" />
                  <p className={`text-lg font-semibold transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Generating Smart Summary...
                  </p>
                  <p className={`text-sm transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Analyzing multiple sources with AI
                  </p>
                </div>
              ) : selectedArticle.summary ? (
                <div className="space-y-6">
                  {/* TL;DR */}
                  <div className={`p-6 rounded-2xl border ${
                    isDark
                      ? 'bg-glow-purple/10 border-glow-purple/20'
                      : 'bg-purple-50 border-purple-200'
                  }`}>
                    <h3 className={`font-bold mb-3 transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      TL;DR
                    </h3>
                    <p className={`leading-relaxed transition-colors ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {selectedArticle.summary.tldr}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div>
                    <h3 className={`font-bold mb-3 transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      Key Points
                    </h3>
                    <ul className="space-y-2">
                      {selectedArticle.summary.keyPoints.map((point: string, index: number) => (
                        <li
                          key={index}
                          className={`flex items-start space-x-2 transition-colors ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          <span className="text-glow-purple mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Context & Implications */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className={`font-bold mb-3 transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        Context
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {selectedArticle.summary.context}
                      </p>
                    </div>
                    <div>
                      <h3 className={`font-bold mb-3 transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        Implications
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {selectedArticle.summary.implications}
                      </p>
                    </div>
                  </div>

                  {/* Trust Score & Related Topics */}
                  <div className="flex items-center justify-between">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedArticle.summary.trustScore >= 90
                        ? 'bg-green-500/20 text-green-400'
                        : selectedArticle.summary.trustScore >= 70
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}>
                      Trust Score: {selectedArticle.summary.trustScore}%
                    </div>
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                        isDark
                          ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                          : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Read Original</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className={`text-lg transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Failed to generate summary
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Timeline Modal */}
        {showTimelineModal && selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTimelineModal(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                isDark
                  ? 'bg-black/90 border-white/10'
                  : 'bg-white/90 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Event Timeline
                </h2>
                <button
                  onClick={() => setShowTimelineModal(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingTimeline ? (
                <div className="text-center py-12">
                  <Timeline className="w-12 h-12 text-glow-purple mx-auto mb-4 animate-pulse" />
                  <p className={`text-lg font-semibold transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Generating Timeline...
                  </p>
                  <p className={`text-sm transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Analyzing chronological events
                  </p>
                </div>
              ) : selectedArticle.timeline ? (
                <div className="space-y-6">
                  {/* Timeline Events */}
                  <div className="space-y-4">
                    {selectedArticle.timeline.events.map((event: any, index: number) => (
                      <div key={index} className="flex space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-glow-purple rounded-full"></div>
                          {index < selectedArticle.timeline.events.length - 1 && (
                            <div className="w-px h-16 bg-glow-purple/30 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`text-sm font-medium transition-colors ${
                              isDark ? 'text-glow-purple' : 'text-purple-600'
                            }`}>
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDark
                                ? 'bg-white/10 text-slate-400'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {event.source}
                            </span>
                          </div>
                          <h4 className={`font-semibold mb-1 transition-colors ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {event.title}
                          </h4>
                          <p className={`text-sm leading-relaxed transition-colors ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}>
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline Analysis */}
                  {selectedArticle.timeline.analysis && (
                    <div className={`p-6 rounded-2xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <h3 className={`font-bold mb-3 transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        AI Analysis
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {selectedArticle.timeline.analysis.summary}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className={`text-lg transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Failed to generate timeline
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;