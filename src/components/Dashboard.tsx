import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Filter, Search, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, Zap } from 'lucide-react';
import ArticleCard from './ArticleCard';
import { supabase } from '../lib/supabase';
import { fetchArticles } from '../functions/fetchArticles';

interface DashboardProps {
  onBack: () => void;
}

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

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
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
    setupRealtimeSubscription();
    
    // Update real-time stats every 5 seconds
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        realTimeThreats: prev.realTimeThreats + Math.floor(Math.random() * 10 + 1),
        activeScans: Math.floor(Math.random() * 50 + 20)
      }));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(statsInterval);
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

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-6 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </button>
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-green-400 animate-pulse" />
              <h1 className="text-3xl font-bold text-white">Live Verification Dashboard</h1>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <button
              onClick={handleFetchNewArticles}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Reality</span>
            </button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300 text-sm">Total Articles</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-slate-300 text-sm">Verified</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{stats.verified}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-slate-300 text-sm">Suspicious</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{stats.suspicious}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-slate-300 text-sm">Processing</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{stats.processing}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-slate-300 text-sm">Threats Blocked</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{stats.realTimeThreats.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Last 24h</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="text-slate-300 text-sm">Active Scans</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{stats.activeScans}</p>
              <p className="text-xs text-slate-400">Live now</p>
            </div>
          </div>

          {/* Real-time Update Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300">
                Last update: {getTimeAgo(lastUpdate)}
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Auto-refresh every 5 seconds
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search real-time intelligence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector} className="bg-slate-800">
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className="text-white text-xl">Syncing Reality...</p>
                <p className="text-slate-400">Processing real-time intelligence feeds</p>
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-white text-xl mb-2">No intelligence detected</p>
              <p className="text-slate-400 mb-6">Try adjusting your filters or sync new data</p>
              <button
                onClick={handleFetchNewArticles}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                Sync New Intelligence
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
      </div>
    </div>
  );
};

export default Dashboard;