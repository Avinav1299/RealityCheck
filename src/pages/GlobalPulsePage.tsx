import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Filter, Search, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import { supabase } from '../lib/supabase';
import { fetchArticles } from '../functions/fetchArticles';
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
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    suspicious: 0,
    processing: 0
  });

  const sectors = ['all', 'politics', 'technology', 'health', 'climate', 'business'];

  useEffect(() => {
    loadArticles();
    setupRealtimeSubscription();
  }, [selectedSector]);

  const loadArticles = async () => {
    setLoading(true);
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

      const processedArticles = data?.map(article => ({
        ...article,
        image_check: article.image_checks?.[0],
        text_check: article.text_checks?.[0],
        strategy: article.strategies?.[0]
      })) || [];

      setArticles(processedArticles);
      updateStats(processedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('articles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
        loadArticles();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'image_checks' }, () => {
        loadArticles();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'text_checks' }, () => {
        loadArticles();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const updateStats = (articles: Article[]) => {
    const stats = {
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
      ).length
    };
    setStats(stats);
  };

  const handleFetchNewArticles = async () => {
    setLoading(true);
    try {
      await fetchArticles(selectedSector === 'all' ? 'general' : selectedSector);
      await loadArticles();
    } catch (error) {
      console.error('Error fetching new articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div>
              <h1 className={`text-4xl font-bold mb-2 transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Global Pulse
              </h1>
              <p className={`text-lg transition-colors ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Real-time media verification across global news sources
              </p>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Articles', value: stats.total, icon: TrendingUp, color: 'blue' },
              { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'green' },
              { label: 'Suspicious', value: stats.suspicious, icon: AlertTriangle, color: 'red' },
              { label: 'Processing', value: stats.processing, icon: Clock, color: 'yellow' }
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
                    {stat.value}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search the pulse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  Fetching latest intelligence and running verification protocols
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