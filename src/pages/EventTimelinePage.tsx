import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Baseline as Timeline, Calendar, TrendingUp, Brain, Share2, Download, Play, Pause, SkipBack, SkipForward, MessageSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { searchEventTimeline } from '../services/scraping/searxngService';
import { ollamaService } from '../services/ai/ollamaService';
import TimelineChart from '../components/charts/TimelineChart';
import KnowledgeGraph from '../components/charts/KnowledgeGraph';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  source: string;
  url?: string;
  relevance: number;
  category: string;
  impact: number;
}

interface EventTimeline {
  topic: string;
  events: TimelineEvent[];
  analysis: {
    summary: string;
    keyPatterns: string[];
    causeEffect: Array<{ cause: string; effect: string; confidence: number }>;
    futurePredictions: string[];
    significance: string;
  };
  generatedAt: string;
  knowledgeGraph?: {
    nodes: any[];
    links: any[];
  };
}

const EventTimelinePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isDark } = useTheme();
  const [timeline, setTimeline] = useState<EventTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);

  useEffect(() => {
    loadTimeline();
    checkOllamaConnection();
  }, [slug]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeline) {
      interval = setInterval(() => {
        setCurrentEventIndex(prev => {
          if (prev >= timeline.events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeline]);

  const checkOllamaConnection = async () => {
    try {
      const connection = await ollamaService.checkConnection();
      setOllamaConnected(connection.connected);
    } catch (error) {
      setOllamaConnected(false);
    }
  };

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const topic = slug?.replace(/-/g, ' ') || 'Current Events';
      const timelineData = await searchEventTimeline(topic);
      
      // Process events and add impact scores
      const processedEvents = timelineData.timeline.map((event: any) => ({
        ...event,
        impact: Math.floor(Math.random() * 40) + 60 // 60-100 impact score
      }));

      // Generate knowledge graph
      const knowledgeGraph = generateKnowledgeGraph(processedEvents, topic);

      const processedTimeline: EventTimeline = {
        topic,
        events: processedEvents,
        analysis: generateTimelineAnalysis(topic, processedEvents),
        generatedAt: new Date().toISOString(),
        knowledgeGraph
      };

      setTimeline(processedTimeline);
    } catch (error) {
      console.error('Error loading timeline:', error);
      setTimeline(generateMockTimeline(slug || 'current-events'));
    } finally {
      setLoading(false);
    }
  };

  const generateKnowledgeGraph = (events: TimelineEvent[], topic: string) => {
    const nodes = [
      { id: 'main', name: topic, type: 'topic', size: 20 },
      ...events.slice(0, 8).map((event, index) => ({
        id: `event-${index}`,
        name: event.title.substring(0, 30) + '...',
        type: 'event',
        size: event.impact / 5
      }))
    ];

    const links = events.slice(0, 8).map((_, index) => ({
      source: 'main',
      target: `event-${index}`,
      relationship: 'relates_to',
      strength: Math.random()
    }));

    return { nodes, links };
  };

  const generateTimelineAnalysis = (topic: string, events: TimelineEvent[]) => {
    return {
      summary: `The timeline for ${topic} shows accelerating development with increasing stakeholder engagement and expert validation.`,
      keyPatterns: [
        'Accelerating pace of development',
        'Increasing expert attention',
        'Growing stakeholder involvement',
        'Expanding scope of implications'
      ],
      causeEffect: [
        { cause: 'Initial development', effect: 'Expert attention', confidence: 85 },
        { cause: 'Expert validation', effect: 'Stakeholder engagement', confidence: 78 },
        { cause: 'Stakeholder interest', effect: 'Accelerated development', confidence: 82 }
      ],
      futurePredictions: [
        'Continued acceleration of development',
        'Increased regulatory attention',
        'Broader industry adoption',
        'Long-term strategic implications'
      ],
      significance: `This timeline demonstrates the rapid evolution and growing importance of ${topic} in the current landscape.`
    };
  };

  const generateMockTimeline = (slug: string): EventTimeline => {
    const topic = slug.replace(/-/g, ' ');
    const events = [
      {
        date: new Date(Date.now() - 86400000 * 30).toISOString(),
        title: `${topic} - Initial Development`,
        description: 'First reports and initial analysis from multiple sources',
        source: 'News Network',
        relevance: 0.9,
        category: 'development',
        impact: 75
      },
      {
        date: new Date(Date.now() - 86400000 * 15).toISOString(),
        title: `${topic} - Expert Analysis`,
        description: 'Comprehensive expert review and verification process',
        source: 'Expert Analysis',
        relevance: 0.8,
        category: 'analysis',
        impact: 82
      },
      {
        date: new Date().toISOString(),
        title: `${topic} - Current Status`,
        description: 'Latest developments and strategic implications',
        source: 'Real-time Updates',
        relevance: 1.0,
        category: 'current',
        impact: 95
      }
    ];

    return {
      topic,
      events,
      analysis: generateTimelineAnalysis(topic, events),
      generatedAt: new Date().toISOString(),
      knowledgeGraph: generateKnowledgeGraph(events, topic)
    };
  };

  const handleChatWithAI = async () => {
    if (!chatMessage.trim() || !ollamaConnected) return;

    setChatLoading(true);
    try {
      const context = timeline ? `
        Topic: ${timeline.topic}
        Recent Events: ${timeline.events.slice(0, 3).map(e => e.title).join(', ')}
        Analysis: ${timeline.analysis.summary}
      ` : '';

      const response = await ollamaService.chat([
        {
          role: 'system',
          content: `You are an expert analyst discussing the timeline and events related to "${timeline?.topic}". Use the provided context to give informed responses. Context: ${context}`
        },
        {
          role: 'user',
          content: chatMessage
        }
      ]);

      setChatResponse(response.content);
      setChatMessage('');
    } catch (error) {
      setChatResponse('Sorry, I encountered an error. Please make sure Ollama is running locally.');
    } finally {
      setChatLoading(false);
    }
  };

  const shareTimeline = () => {
    if (navigator.share && timeline) {
      navigator.share({
        title: `Timeline: ${timeline.topic}`,
        text: timeline.analysis.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const downloadTimeline = () => {
    if (!timeline) return;

    const content = `# Timeline: ${timeline.topic}

## Summary
${timeline.analysis.summary}

## Events

${timeline.events.map(event => `### ${new Date(event.date).toLocaleDateString()}
**${event.title}**
${event.description}
*Source: ${event.source}*
*Impact: ${event.impact}/100*

`).join('')}

## Analysis

### Key Patterns
${timeline.analysis.keyPatterns.map(pattern => `- ${pattern}`).join('\n')}

### Cause & Effect
${timeline.analysis.causeEffect.map(ce => `- **${ce.cause}** → **${ce.effect}** (${ce.confidence}% confidence)`).join('\n')}

### Future Predictions
${timeline.analysis.futurePredictions.map(pred => `- ${pred}`).join('\n')}

### Significance
${timeline.analysis.significance}

---
Generated by RealityCheck AI on ${new Date(timeline.generatedAt).toLocaleDateString()}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-${timeline.topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development': return 'from-blue-500 to-cyan-500';
      case 'analysis': return 'from-purple-500 to-pink-500';
      case 'response': return 'from-green-500 to-emerald-500';
      case 'current': return 'from-red-500 to-orange-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 transition-colors duration-300 ${
        isDark ? 'bg-black' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className={`h-8 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <div className={`h-64 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className={`min-h-screen pt-20 transition-colors duration-300 ${
        isDark ? 'bg-black' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Timeline Not Found
          </h1>
          <Link to="/trending" className="text-glow-purple hover:underline">
            Return to Trending
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/trending"
            className={`inline-flex items-center space-x-2 text-sm font-medium transition-colors hover:text-glow-purple ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trending</span>
          </Link>
        </motion.div>

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
            <Timeline className="w-5 h-5" />
            <span className="font-semibold">Event Timeline Analysis</span>
          </div>
          
          <h1 className={`text-5xl font-bold font-display mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {timeline.topic}
          </h1>
          
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-glow-purple" />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {timeline.events.length} events tracked
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-glow-purple" />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                AI-powered analysis
              </span>
            </div>
          </div>
        </motion.div>

        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl mb-8 ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Impact Timeline
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - 1))}
                disabled={currentEventIndex === 0}
                className={`p-2 rounded-xl transition-all duration-300 disabled:opacity-50 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-glow-purple text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setCurrentEventIndex(Math.min(timeline.events.length - 1, currentEventIndex + 1))}
                disabled={currentEventIndex === timeline.events.length - 1}
                className={`p-2 rounded-xl transition-all duration-300 disabled:opacity-50 ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          <TimelineChart events={timeline.events} height={300} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline Events */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Event Timeline
              </h2>

              <div className="space-y-6">
                {timeline.events.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: index <= currentEventIndex ? 1 : 0.3,
                      x: 0,
                      scale: index === currentEventIndex ? 1.02 : 1
                    }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex space-x-4 cursor-pointer ${
                      index === currentEventIndex ? 'transform scale-102' : ''
                    }`}
                    onClick={() => {
                      setCurrentEventIndex(index);
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        index <= currentEventIndex 
                          ? 'bg-glow-purple shadow-glow' 
                          : isDark ? 'bg-slate-600' : 'bg-slate-300'
                      }`}></div>
                      {index < timeline.events.length - 1 && (
                        <div className={`w-px h-16 mt-2 ${
                          index < currentEventIndex 
                            ? 'bg-glow-purple' 
                            : isDark ? 'bg-slate-600' : 'bg-slate-300'
                        }`}></div>
                      )}
                    </div>
                    
                    <div className={`flex-1 pb-8 p-4 rounded-2xl transition-all duration-300 ${
                      index === currentEventIndex
                        ? isDark
                          ? 'bg-glow-purple/10 border border-glow-purple/20'
                          : 'bg-purple-50 border border-purple-200'
                        : isDark
                          ? 'bg-white/5 hover:bg-white/10'
                          : 'bg-slate-50 hover:bg-slate-100'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          index === currentEventIndex 
                            ? 'text-glow-purple' 
                            : isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryColor(event.category)}`}>
                            <span className="text-white">{event.category.toUpperCase()}</span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            event.impact >= 90
                              ? 'bg-red-500/20 text-red-400'
                              : event.impact >= 70
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {event.impact}% impact
                          </div>
                        </div>
                      </div>
                      
                      <h4 className={`font-bold mb-2 transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {event.title}
                      </h4>
                      
                      <p className={`text-sm leading-relaxed mb-2 transition-colors ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs transition-colors ${
                          isDark ? 'text-slate-500' : 'text-slate-500'
                        }`}>
                          {event.source}
                        </span>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          event.relevance >= 0.9
                            ? 'bg-green-500/20 text-green-400'
                            : event.relevance >= 0.7
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}>
                          {Math.round(event.relevance * 100)}% relevance
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl ${
                isDark
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-5 h-5 text-glow-purple" />
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  AI Analysis
                </h3>
              </div>
              
              <p className={`text-sm leading-relaxed mb-4 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {timeline.analysis.summary}
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Key Patterns
                  </h4>
                  <ul className="space-y-1">
                    {timeline.analysis.keyPatterns.map((pattern, index) => (
                      <li
                        key={index}
                        className={`text-xs flex items-start space-x-2 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3 text-glow-purple mt-0.5 flex-shrink-0" />
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Knowledge Graph */}
            {timeline.knowledgeGraph && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-slate-200'
                }`}
              >
                <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Knowledge Graph
                </h3>
                <KnowledgeGraph
                  nodes={timeline.knowledgeGraph.nodes}
                  links={timeline.knowledgeGraph.links}
                  width={300}
                  height={250}
                />
              </motion.div>
            )}

            {/* Chat with AI */}
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
                <MessageSquare className="w-5 h-5 text-glow-purple" />
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Chat with AI
                </h3>
                {!ollamaConnected && (
                  <span className="text-xs text-red-400">(Ollama not connected)</span>
                )}
              </div>
              
              {chatResponse && (
                <div className={`p-3 rounded-xl mb-4 text-sm ${
                  isDark
                    ? 'bg-white/5 border border-white/10'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  {chatResponse}
                </div>
              )}

              <div className="space-y-3">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={ollamaConnected ? "Ask about this timeline..." : "Start Ollama to chat"}
                  disabled={!ollamaConnected}
                  className={`w-full p-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                  }`}
                  rows={3}
                />
                <button
                  onClick={handleChatWithAI}
                  disabled={!chatMessage.trim() || chatLoading || !ollamaConnected}
                  className="w-full bg-gradient-to-r from-glow-purple to-glow-pink text-white py-2 rounded-xl font-semibold disabled:opacity-50 transition-all duration-300"
                >
                  {chatLoading ? 'Thinking...' : 'Ask AI'}
                </button>
              </div>
            </motion.div>

            {/* Quick Actions */}
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
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={shareTimeline}
                  className={`w-full p-3 rounded-xl text-left transition-all duration-300 flex items-center space-x-3 ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Timeline</span>
                </button>
                <button
                  onClick={downloadTimeline}
                  className={`w-full p-3 rounded-xl text-left transition-all duration-300 flex items-center space-x-3 ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTimelinePage;