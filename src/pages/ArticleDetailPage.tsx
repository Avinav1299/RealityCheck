import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  ExternalLink, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Calendar,
  Globe,
  Tag,
  User,
  FileText,
  Target,
  Brain
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  image_url: string | null;
  sector: string;
  published_at: string;
  source: string;
  author?: string;
  readingTime: number;
  tags: string[];
  image_check?: {
    status: 'verified' | 'suspicious' | 'manipulated';
    confidence_score: number;
    match_count: number;
  };
  text_check?: {
    verification_status: 'true' | 'false' | 'mixed' | 'unverified';
    confidence_score: number;
    reasoning: string;
  };
  strategy?: {
    summary: string;
    priority_level: 'low' | 'medium' | 'high' | 'critical';
    action_steps: string[];
  };
  related_articles: Array<{
    id: string;
    title: string;
    image_url: string;
    published_at: string;
  }>;
  timeline_events: Array<{
    date: string;
    event: string;
    relevance: number;
  }>;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isDark } = useTheme();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Simulate loading article data
    const loadArticle = async () => {
      setLoading(true);
      
      // Mock article data
      const mockArticle: Article = {
        id: id || '1',
        title: 'AI-Powered Verification Systems Reach New Milestone in Accuracy',
        content: `Advanced artificial intelligence systems for media verification have achieved unprecedented accuracy rates, marking a significant breakthrough in the fight against misinformation and manipulated content.

The latest developments in machine learning algorithms have enabled verification systems to detect sophisticated deepfakes, manipulated images, and false narratives with over 99.2% accuracy. This represents a quantum leap from previous generations of detection technology.

Key innovations include:

• Multi-modal analysis combining visual, textual, and contextual signals
• Real-time processing capabilities for immediate verification
• Cross-platform integration with major social media networks
• Advanced neural networks trained on millions of verified samples

The implications for journalism, social media platforms, and information integrity are profound. News organizations can now verify content in real-time, while platforms can automatically flag suspicious material before it spreads.

Dr. Sarah Chen, lead researcher at the AI Verification Institute, explains: "We've reached a tipping point where AI can reliably distinguish between authentic and manipulated content. This technology will be crucial in maintaining information integrity in the digital age."

The system has already been deployed by several major news organizations and has successfully identified over 10,000 instances of manipulated content in the past month alone.

However, experts caution that as detection technology improves, so too do the methods used to create convincing fake content. The ongoing arms race between creators and detectors of synthetic media continues to evolve.

Future developments will focus on:

• Improving detection of subtle manipulations
• Reducing false positive rates
• Expanding language and cultural coverage
• Developing real-time browser extensions for consumers

The technology represents a significant step forward in the global effort to combat misinformation and preserve the integrity of digital information.`,
        url: 'https://example.com/ai-verification-milestone',
        image_url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200',
        sector: 'technology',
        published_at: new Date(Date.now() - 3600000).toISOString(),
        source: 'TechNews Today',
        author: 'Dr. Michael Rodriguez',
        readingTime: 8,
        tags: ['AI', 'Verification', 'Technology', 'Misinformation', 'Machine Learning'],
        image_check: {
          status: 'verified',
          confidence_score: 96,
          match_count: 0
        },
        text_check: {
          verification_status: 'true',
          confidence_score: 94,
          reasoning: 'Content verified through multiple authoritative sources and expert validation. Claims are supported by peer-reviewed research and official statements.'
        },
        strategy: {
          summary: 'This breakthrough in AI verification technology represents a critical advancement in combating misinformation. Organizations should consider integration opportunities.',
          priority_level: 'high',
          action_steps: [
            'Evaluate current verification workflows for potential AI integration',
            'Assess budget allocation for advanced verification technology',
            'Train editorial teams on AI-assisted verification processes',
            'Establish partnerships with AI verification providers'
          ]
        },
        related_articles: [
          {
            id: '2',
            title: 'Social Media Platforms Implement Real-Time Fact Checking',
            image_url: 'https://images.pexels.com/photos/267399/pexels-photo-267399.jpeg?auto=compress&cs=tinysrgb&w=400',
            published_at: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: '3',
            title: 'Government Agencies Adopt Advanced Media Verification Tools',
            image_url: 'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg?auto=compress&cs=tinysrgb&w=400',
            published_at: new Date(Date.now() - 10800000).toISOString()
          },
          {
            id: '4',
            title: 'Deepfake Detection Technology Shows Promise in Early Trials',
            image_url: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400',
            published_at: new Date(Date.now() - 14400000).toISOString()
          }
        ],
        timeline_events: [
          {
            date: new Date(Date.now() - 86400000 * 30).toISOString(),
            event: 'AI Verification Institute announces breakthrough research',
            relevance: 95
          },
          {
            date: new Date(Date.now() - 86400000 * 15).toISOString(),
            event: 'Major news organizations begin pilot testing',
            relevance: 88
          },
          {
            date: new Date(Date.now() - 86400000 * 7).toISOString(),
            event: 'First successful deployment in live newsroom environment',
            relevance: 92
          },
          {
            date: new Date().toISOString(),
            event: 'Public announcement of 99.2% accuracy milestone',
            relevance: 100
          }
        ]
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      setArticle(mockArticle);
      setLoading(false);
    };

    loadArticle();
  }, [id]);

  const getVerificationBadge = (status: string, confidence: number) => {
    switch (status) {
      case 'verified':
      case 'true':
        return {
          icon: CheckCircle,
          text: 'Verified',
          color: 'text-green-400',
          bg: 'bg-green-500/10 border-green-500/20'
        };
      case 'suspicious':
      case 'mixed':
        return {
          icon: AlertTriangle,
          text: 'Mixed',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10 border-yellow-500/20'
        };
      case 'manipulated':
      case 'false':
        return {
          icon: XCircle,
          text: 'False',
          color: 'text-red-400',
          bg: 'bg-red-500/10 border-red-500/20'
        };
      default:
        return {
          icon: Clock,
          text: 'Unverified',
          color: 'text-slate-400',
          bg: 'bg-slate-500/10 border-slate-500/20'
        };
    }
  };

  const shareArticle = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.strategy?.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would save to user preferences
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 transition-colors duration-300 ${
        isDark ? 'bg-black' : 'bg-white'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className={`h-8 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <div className={`h-64 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <div className="space-y-3">
              <div className={`h-4 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
              <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
              <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={`min-h-screen pt-20 transition-colors duration-300 ${
        isDark ? 'bg-black' : 'bg-white'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Article Not Found
          </h1>
          <Link to="/discover" className="text-glow-purple hover:underline">
            Return to Discover
          </Link>
        </div>
      </div>
    );
  }

  const imageBadge = getVerificationBadge(article.image_check?.status || 'unverified', article.image_check?.confidence_score || 0);
  const textBadge = getVerificationBadge(article.text_check?.verification_status || 'unverified', article.text_check?.confidence_score || 0);

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-8 pb-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/discover"
            className={`inline-flex items-center space-x-2 text-sm font-medium transition-colors hover:text-glow-purple ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discover</span>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-glow-purple/20 text-glow-purple">
                      {article.sector.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-glow-purple" />
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-glow-purple" />
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {article.readingTime} min read
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareArticle}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        isDark
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleBookmark}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        isBookmarked
                          ? 'bg-glow-purple text-white'
                          : isDark
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <h1 className={`text-4xl font-bold font-display mb-6 leading-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {article.title}
                </h1>

                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-glow-purple" />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {article.source}
                    </span>
                  </div>
                  {article.author && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-glow-purple" />
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {article.author}
                      </span>
                    </div>
                  )}
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className={`px-4 py-2 rounded-full border text-sm font-semibold flex items-center space-x-2 ${imageBadge.bg}`}>
                    <Eye className="w-4 h-4" />
                    <span className={imageBadge.color}>
                      Image: {imageBadge.text} ({article.image_check?.confidence_score}%)
                    </span>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-sm font-semibold flex items-center space-x-2 ${textBadge.bg}`}>
                    <FileText className="w-4 h-4" />
                    <span className={textBadge.color}>
                      Content: {textBadge.text} ({article.text_check?.confidence_score}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {article.image_url && (
                <div className="mb-8">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-96 object-cover rounded-2xl"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop';
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div className={`prose prose-lg max-w-none ${
                isDark ? 'prose-invert' : ''
              }`}>
                {article.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={`mb-6 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDark
                          ? 'bg-white/10 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* External Link */}
              <div className="mt-6">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    isDark
                      ? 'bg-glow-purple/10 border border-glow-purple/20 text-glow-purple hover:bg-glow-purple/20'
                      : 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <span>Read Original Article</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              </div>
            </motion.article>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* AI Analysis */}
            {article.strategy && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="w-5 h-5 text-glow-purple" />
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    AI Strategic Analysis
                  </h3>
                </div>
                
                <p className={`text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {article.strategy.summary}
                </p>

                <div className="space-y-2">
                  <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Recommended Actions:
                  </h4>
                  <ul className="space-y-1">
                    {article.strategy.action_steps.map((step, index) => (
                      <li
                        key={index}
                        className={`text-sm flex items-start space-x-2 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        <Target className="w-3 h-3 text-glow-purple mt-1 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Story Timeline
              </h3>
              
              <div className="space-y-4">
                {article.timeline_events.map((event, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-glow-purple rounded-full mt-2"></div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {event.event}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Related Articles */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Related Articles
              </h3>
              
              <div className="space-y-4">
                {article.related_articles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    to={`/article/${relatedArticle.id}`}
                    className="block group"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={relatedArticle.image_url}
                        alt={relatedArticle.title}
                        className="w-16 h-16 object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium line-clamp-2 group-hover:text-glow-purple transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {relatedArticle.title}
                        </h4>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {new Date(relatedArticle.published_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;