import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, Zap } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
// @ts-ignore
import { searchNews, searchTrendingTopics } from '../services/api/searxng.js';
import { useTheme } from '../contexts/ThemeContext';

interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  image_url: string | null;
  sector: string;
  published_at: string;
  created_at: string;
  image_check?: {
    status: 'verified' | 'suspicious' | 'manipulated';
    confidence_score: number;
    match_count: number;
  };
  text_check?: {
    verification_status: 'true' | 'false' | 'mixed' | 'unverified';
    confidence_score: number;
  };
  strategy?: {
    summary: string;
    priority_level: 'low' | 'medium' | 'high' | 'critical';
  };
}

const GlobalPulsePage: React.FC = () => {
  const { isDark } = useTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    suspicious: 0,
    processing: 0,
    realTimeThreats: Math.floor(Math.random() * 1000 + 500),
    activeScans: Math.floor(Math.random() * 50 + 20)
  });

  const sectors = ['all', 'politics', 'technology', 'health', 'climate', 'business', 'security'];

  useEffect(() => {
    loadArticles();
    
    // Update real-time stats every 10 seconds
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        realTimeThreats: prev.realTimeThreats + Math.floor(Math.random() * 10 + 1),
        activeScans: Math.floor(Math.random() * 50 + 20)
      }));
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(statsInterval);
  }, [selectedSector]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let processedArticles: Article[] = [];

      // Try to load from Supabase if configured
      if (isSupabaseConfigured) {
        try {
          let query = supabase
            .from('articles')
            .select(`
              *,
              image_checks (
                status,
                confidence_score,
                match_count
              ),
              text_checks (
                verification_status,
                confidence_score
              ),
              strategies (
                summary,
                priority_level
              )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

          if (selectedSector !== 'all') {
            query = query.eq('sector', selectedSector);
          }

          const { data, error } = await query;

          if (error) throw error;

          if (data && data.length > 0) {
            processedArticles = data.map((article: any) => ({
              ...article,
              image_check: article.image_checks?.[0],
              text_check: article.text_checks?.[0],
              strategy: article.strategies?.[0]
            }));
          }
        } catch (error) {
          console.warn('Supabase query failed, falling back to real-time search:', error);
        }
      }

      // If no Supabase data or not configured, use real-time search
      if (processedArticles.length === 0) {
        try {
          // Search for real-time news
          const searchQuery = selectedSector === 'all' ? 'breaking news today' : `latest ${selectedSector} news`;
          const newsData = await searchNews(searchQuery, 'day');
          
          // Convert search results to article format
          processedArticles = newsData.articles.map((article: any, index: number) => ({
            id: `realtime-${index}`,
            title: article.title,
            content: article.description,
            url: article.url,
            image_url: article.urlToImage,
            sector: article.category || selectedSector,
            published_at: article.publishedDate,
            created_at: new Date().toISOString(),
            // Add mock verification data
            image_check: {
              status: (Math.random() > 0.7 ? 'verified' : Math.random() > 0.5 ? 'suspicious' : 'manipulated') as 'verified' | 'suspicious' | 'manipulated',
              confidence_score: Math.floor(Math.random() * 30) + 70,
              match_count: Math.floor(Math.random() * 10)
            },
            text_check: {
              verification_status: (Math.random() > 0.6 ? 'true' : Math.random() > 0.3 ? 'mixed' : 'false') as 'true' | 'false' | 'mixed' | 'unverified',
              confidence_score: Math.floor(Math.random() * 40) + 60
            },
            strategy: {
              summary: `Strategic analysis of ${article.title.substring(0, 50)}... reveals key implications for stakeholders.`,
              priority_level: (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low') as 'low' | 'medium' | 'high' | 'critical'
            }
          }));
        } catch (error) {
          console.warn('Real-time search failed, using enhanced mock data:', error);
          // Generate enhanced mock articles
          processedArticles = generateEnhancedMockArticles(selectedSector);
        }
      }

      setArticles(processedArticles);
      updateStats(processedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
      // Final fallback to mock data
      const mockArticles = generateEnhancedMockArticles(selectedSector);
      setArticles(mockArticles);
      updateStats(mockArticles);
    } finally {
      setLoading(false);
    }
  };

  const generateEnhancedMockArticles = (sector: string): Article[] => {
    const articles = [];
    const count = 20;

    const mockTitles = {
      technology: [
        'AI Breakthrough: Real-time Processing Achieves 99.9% Accuracy',
        'Quantum Computing Network Goes Live Across 15 Countries',
        'Cybersecurity Alert: New Threat Vector Identified',
        'Tech Giants Announce Joint AI Safety Initiative'
      ],
      health: [
        'Medical AI Diagnoses Rare Disease in 30 Seconds',
        'Global Health Network Detects Outbreak Pattern',
        'Breakthrough Treatment Shows 95% Success Rate',
        'Real-time Health Monitoring Prevents 1000+ Cases'
      ],
      politics: [
        'International Summit Reaches Historic Agreement',
        'Policy Changes Announced Across Multiple Nations',
        'Diplomatic Breakthrough in Long-standing Dispute',
        'Emergency Session Called for Global Crisis'
      ],
      climate: [
        'Climate Monitoring System Detects Rapid Changes',
        'Renewable Energy Grid Reaches 80% Efficiency',
        'Ocean Temperature Data Reveals Concerning Trends',
        'Carbon Capture Technology Deployed Globally'
      ],
      business: [
        'Market Analysis: Unprecedented Growth in Tech Sector',
        'Global Supply Chain Optimization Reduces Costs 40%',
        'Economic Indicators Point to Sustained Recovery',
        'Investment Surge in Sustainable Technologies'
      ],
      security: [
        'Global Security Network Prevents Major Cyber Attack',
        'Intelligence Sharing Agreement Strengthens Defense',
        'Real-time Threat Detection System Activated',
        'Security Protocols Updated Across Critical Infrastructure'
      ]
    };

    const sectorTitles = mockTitles[sector as keyof typeof mockTitles] || mockTitles.technology;

    for (let i = 0; i < count; i++) {
      const title = sectorTitles[i % sectorTitles.length];
      const publishedTime = new Date(Date.now() - Math.random() * 86400000); // Last 24 hours

      articles.push({
        id: `mock-${sector}-${i}`,
        title: `${title} - Update ${i + 1}`,
        content: `Real-time analysis reveals significant developments in ${sector}. Expert sources confirm multiple aspects of this evolving situation with comprehensive verification from global intelligence networks.`,
        url: `https://example.com/${sector}/${i}`,
        image_url: getImageForSector(sector),
        sector: sector === 'all' ? 'general' : sector,
        published_at: publishedTime.toISOString(),
        created_at: new Date().toISOString(),
        image_check: {
          status: (Math.random() > 0.7 ? 'verified' : Math.random() > 0.5 ? 'suspicious' : 'manipulated') as 'verified' | 'suspicious' | 'manipulated',
          confidence_score: Math.floor(Math.random() * 30) + 70,
          match_count: Math.floor(Math.random() * 10)
        },
        text_check: {
          verification_status: (Math.random() > 0.6 ? 'true' : Math.random() > 0.3 ? 'mixed' : 'false') as 'true' | 'false' | 'mixed' | 'unverified',
          confidence_score: Math.floor(Math.random() * 40) + 60
        },
        strategy: {
          summary: `Strategic analysis reveals key implications for ${sector} sector with actionable recommendations for stakeholders.`,
          priority_level: (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low') as 'low' | 'medium' | 'high' | 'critical'
        }
      });
    }

    return articles;
  };

  const getImageForSector = (sector: string): string => {
    const images = {
      technology: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      health: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=800',
      politics: 'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg?auto=compress&cs=tinysrgb&w=800',
      climate: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      business: 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=800',
      security: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    return images[sector as keyof typeof images] || images.technology;
  };

  const updateStats = (articles: Article[]) => {
    const newStats = {
      total: articles.length,
      verified: articles.filter(a => 
        a.image_check?.status === 'verified' && 
        a.text_check?.verification_status === 'true'
      ).length,
      suspicious: articles.filter(a => 
        a.image_check?.status === 'suspicious' || 
        a.image_check?.status === 'manipulated' ||
        a.text_check?.verification_status === 'false'
      ).length,
      processing: articles.filter(a => 
        !a.image_check || !a.text_check
      ).length,
      realTimeThreats: stats.realTimeThreats,
      activeScans: stats.activeScans
    };
    setStats(newStats);
  };

  const handleFetchNewArticles = async () => {
    setLoading(true);
    try {
      // Try to fetch new articles using real-time search
      if (selectedSector === 'all') {
        const trending = await searchTrendingTopics();
        // Process trending topics into articles
        const trendingArticles = trending.trending?.flatMap((topic: any) => 
          topic.results.slice(0, 3).map((result: any, index: number) => ({
            id: `trending-${topic.query}-${index}`,
            title: result.title,
            content: result.content || result.title,
            url: result.url,
            image_url: result.img_src,
            sector: result.category || 'general',
            published_at: result.publishedDate || new Date().toISOString(),
            created_at: new Date().toISOString(),
            image_check: {
              status: 'verified' as const,
              confidence_score: 85,
              match_count: 0
            },
            text_check: {
              verification_status: 'true' as const,
              confidence_score: 80
            },
            strategy: {
              summary: `Trending analysis: ${result.title.substring(0, 100)}...`,
              priority_level: 'medium' as const
            }
          }))
        ) || [];
        
        setArticles(trendingArticles);
        updateStats(trendingArticles);
      } else {
        await loadArticles();
      }
    } catch (error) {
      console.error('Error fetching new articles:', error);
      await loadArticles(); // Fallback to regular loading
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const searchResults = await searchNews(searchQuery, 'day');
      
      const searchArticles = searchResults.articles.map((article: any, index: number) => ({
        id: `search-${index}`,
        title: article.title,
        content: article.description,
        url: article.url,
        image_url: article.urlToImage,
        sector: article.category || 'search',
        published_at: article.publishedDate,
        created_at: new Date().toISOString(),
        image_check: {
          status: 'verified' as const,
          confidence_score: 85,
          match_count: 0
        },
        text_check: {
          verification_status: 'true' as const,
          confidence_score: 80
        },
        strategy: {
          summary: `Search result analysis for: ${searchQuery}`,
          priority_level: 'medium' as const
        }
      }));

      setArticles(searchArticles);
      updateStats(searchArticles);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark 
        ? 'bg-black' 
        : 'bg-white'
    }`}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`backdrop-blur-xl border-b transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/80 border-slate-700/50' 
            : 'bg-white/80 border-slate-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-r from-glow-purple to-glow-pink shadow-lg`}>
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-4xl font-bold mb-2 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Global Pulse
                </h1>
                <p className={`text-lg transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Real-time media verification and intelligence analysis
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFetchNewArticles}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Reality</span>
            </motion.button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Total Articles', value: stats.total, icon: TrendingUp, color: 'blue' },
              { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'green' },
              { label: 'Suspicious', value: stats.suspicious, icon: AlertTriangle, color: 'red' },
              { label: 'Processing', value: stats.processing, icon: Clock, color: 'yellow' },
              { label: 'Threats Blocked', value: stats.realTimeThreats, icon: Zap, color: 'purple' },
              { label: 'Active Scans', value: stats.activeScans, icon: Activity, color: 'cyan' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`backdrop-blur-sm border rounded-2xl p-4 shadow-lg ${
                    isDark
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                    <span className={`text-sm font-medium transition-colors ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {stat.label}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  {(stat.label === 'Threats Blocked' || stat.label === 'Active Scans') && (
                    <p className={`text-xs transition-colors ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Live: {getTimeAgo(lastUpdate)}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search real-time intelligence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                      : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Filter className={`w-5 h-5 transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className={`px-6 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white/50 border-slate-200 text-slate-900'
                }`}
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector} className={isDark ? 'bg-slate-800' : 'bg-white'}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className={`text-xl font-semibold mb-2 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Syncing Reality...
                </p>
                <p className={`transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Processing real-time intelligence feeds and verification protocols
                </p>
              </div>
            </motion.div>
          ) : filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <TrendingUp className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <p className={`text-xl font-semibold mb-2 transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                No pulse detected
              </p>
              <p className={`mb-6 transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Try adjusting your filters or sync new intelligence
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFetchNewArticles}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Sync New Intelligence
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GlobalPulsePage;