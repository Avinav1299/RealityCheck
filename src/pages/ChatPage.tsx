import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Brain, 
  Zap, 
  Settings,
  MessageSquare,
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  History,
  Trash2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

interface ModelConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  capabilities: string[];
}

const ChatPage: React.FC = () => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const models: ModelConfig[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Advanced reasoning and analysis',
      icon: Brain,
      color: 'from-glow-purple to-glow-pink',
      capabilities: ['Complex reasoning', 'Code generation', 'Creative writing', 'Analysis']
    },
    {
      id: 'mistral',
      name: 'Mistral',
      description: 'Fast and efficient responses',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      capabilities: ['Quick responses', 'Multilingual', 'Efficient processing', 'General tasks']
    },
    {
      id: 'ollama',
      name: 'Ollama',
      description: 'Local model processing',
      icon: Settings,
      color: 'from-green-500 to-emerald-500',
      capabilities: ['Privacy focused', 'Offline processing', 'Local inference', 'Custom models']
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Load chat history from localStorage
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakMessage = (text: string) => {
    if (speechEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMockResponse(inputMessage, selectedModel),
        timestamp: new Date(),
        model: selectedModel
      };

      const updatedMessages = [...newMessages, aiResponse];
      setMessages(updatedMessages);
      setIsTyping(false);

      // Speak the response if enabled
      speakMessage(aiResponse.content);

      // Save to current session
      if (currentSessionId) {
        updateCurrentSession(updatedMessages);
      }
    }, 1500 + Math.random() * 2000);
  };

  const generateMockResponse = (input: string, model: string): string => {
    const responses = {
      'gpt-4': [
        "Based on my comprehensive analysis, this is a multifaceted topic that requires careful consideration of various interconnected factors. Let me break this down systematically for you...",
        "I understand you're seeking insights on this complex matter. From a strategic analytical perspective, there are several key dimensions we should explore...",
        "This is a fascinating question that intersects multiple domains of knowledge. Allow me to provide you with a thorough, evidence-based analysis..."
      ],
      'mistral': [
        "Here's a focused analysis of your query. The key considerations include several important factors that I'll outline clearly...",
        "I can help you with that efficiently. Based on current data patterns and established frameworks...",
        "That's an excellent question. Let me provide you with a structured, actionable response that addresses your core concerns..."
      ],
      'ollama': [
        "Processing your request using local inference capabilities. Based on my analysis of the available information...",
        "Using privacy-focused local processing to analyze your query. The results indicate several important insights...",
        "Local model analysis complete. Here are the key findings and recommendations based on your specific requirements..."
      ]
    };

    const modelResponses = responses[model as keyof typeof responses] || responses['gpt-4'];
    const baseResponse = modelResponses[Math.floor(Math.random() * modelResponses.length)];
    
    return baseResponse + " This demonstrates the advanced capabilities of " + models.find(m => m.id === model)?.name + 
           " in providing detailed, contextual responses to complex research questions and analytical challenges.";
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chat ${chatSessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const updatedSessions = [...chatSessions, newSession];
    setChatSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  const loadSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  const updateCurrentSession = (newMessages: Message[]) => {
    if (!currentSessionId) return;

    const updatedSessions = chatSessions.map(session => 
      session.id === currentSessionId 
        ? { ...session, messages: newMessages, lastUpdated: new Date() }
        : session
    );

    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const exportChat = () => {
    if (messages.length === 0) return;

    const chatContent = messages.map(msg => 
      `**${msg.type === 'user' ? 'You' : models.find(m => m.id === msg.model)?.name || 'Assistant'}**: ${msg.content}\n\n`
    ).join('');

    const blob = new Blob([chatContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([]);
    if (currentSessionId) {
      updateCurrentSession([]);
    }
  };

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8 h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full backdrop-blur-sm border mb-4 ${
            isDark 
              ? 'bg-white/5 border-white/10 text-glow-purple' 
              : 'bg-slate-100 border-slate-200 text-purple-700'
          }`}>
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Advanced AI Consultation</span>
          </div>
          
          <h1 className={`text-5xl font-bold font-display mb-2 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Chat
          </h1>
          <p className={`text-lg font-body transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Engage with advanced AI models for research, analysis, and strategic guidance
          </p>
        </motion.div>

        <div className="flex-1 flex gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 flex flex-col"
          >
            {/* Model Selection */}
            <div className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl mb-6 ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-slate-200'
            }`}>
              <h2 className={`text-xl font-bold font-display mb-4 transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                AI Models
              </h2>
              
              <div className="space-y-3">
                {models.map((model) => {
                  const Icon = model.icon;
                  const isSelected = selectedModel === model.id;
                  
                  return (
                    <motion.button
                      key={model.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full p-4 rounded-2xl border transition-all duration-300 text-left ${
                        isSelected
                          ? isDark
                            ? 'bg-glow-purple/20 border-glow-purple/50 shadow-glow-sm'
                            : 'bg-purple-100 border-purple-300 shadow-lg shadow-purple-500/10'
                          : isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${model.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`font-semibold transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {model.name}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 transition-colors ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {model.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.slice(0, 2).map((capability) => (
                          <span
                            key={capability}
                            className={`text-xs px-2 py-1 rounded-full ${
                              isDark
                                ? 'bg-white/10 text-slate-400'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Chat Sessions */}
            <div className={`backdrop-blur-sm border rounded-3xl p-6 shadow-xl flex-1 ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold font-display transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Chat History
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNewSession}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isDark
                      ? 'bg-glow-purple/10 text-glow-purple hover:bg-glow-purple/20'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                      currentSessionId === session.id
                        ? isDark
                          ? 'bg-glow-purple/20 border-glow-purple/30'
                          : 'bg-purple-100 border-purple-200'
                        : isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => loadSession(session.id)}
                      className="flex-1 text-left"
                    >
                      <p className={`font-medium text-sm transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {session.name}
                      </p>
                      <p className={`text-xs transition-colors ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {session.messages.length} messages
                      </p>
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? 'text-slate-400 hover:text-red-400'
                          : 'text-slate-500 hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className={`backdrop-blur-sm border rounded-3xl shadow-xl flex-1 flex flex-col ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-slate-200'
            }`}>
              {/* Chat Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-r ${models.find(m => m.id === selectedModel)?.color}`}>
                    {React.createElement(models.find(m => m.id === selectedModel)?.icon || Brain, { className: "w-5 h-5 text-white" })}
                  </div>
                  <div>
                    <h3 className={`font-semibold transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {models.find(m => m.id === selectedModel)?.name}
                    </h3>
                    <p className={`text-sm transition-colors ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {models.find(m => m.id === selectedModel)?.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      speechEnabled
                        ? isDark
                          ? 'bg-glow-purple/20 text-glow-purple'
                          : 'bg-purple-100 text-purple-600'
                        : isDark
                          ? 'bg-white/10 text-slate-400 hover:bg-white/20'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {speechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </motion.button>

                  {messages.length > 0 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={exportChat}
                        className={`p-2 rounded-xl transition-all duration-300 ${
                          isDark
                            ? 'bg-white/10 text-slate-400 hover:bg-white/20'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearChat}
                        className={`p-2 rounded-xl transition-all duration-300 ${
                          isDark
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-red-50 text-red-500 hover:bg-red-100'
                        }`}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                      <p className={`text-xl font-semibold mb-2 transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        Start a Conversation
                      </p>
                      <p className={`transition-colors ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Ask questions, seek insights, or discuss research topics
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-4xl flex items-start space-x-3 ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`p-2 rounded-xl ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-glow-purple to-glow-pink'
                              : isDark
                                ? 'bg-slate-700'
                                : 'bg-slate-200'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              <Bot className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                            )}
                          </div>
                          
                          <div className={`p-4 rounded-2xl backdrop-blur-sm border relative group ${
                            message.type === 'user'
                              ? isDark
                                ? 'bg-glow-purple/20 border-glow-purple/30'
                                : 'bg-purple-100 border-purple-200'
                              : isDark
                                ? 'bg-white/5 border-white/10'
                                : 'bg-slate-50 border-slate-200'
                          }`}>
                            <p className={`transition-colors leading-relaxed ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {message.content}
                            </p>
                            
                            {message.model && (
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                                <span className={`text-xs font-medium transition-colors ${
                                  isDark ? 'text-slate-400' : 'text-slate-600'
                                }`}>
                                  {models.find(m => m.id === message.model)?.name}
                                </span>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => copyMessage(message.content)}
                                    className={`p-1 rounded transition-all duration-200 ${
                                      isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                                    }`}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  {speechEnabled && (
                                    <button
                                      onClick={() => speakMessage(message.content)}
                                      className={`p-1 rounded transition-all duration-200 ${
                                        isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                                      }`}
                                    >
                                      <Volume2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-xl ${
                            isDark ? 'bg-slate-700' : 'bg-slate-200'
                          }`}>
                            <Bot className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                          </div>
                          <div className={`p-4 rounded-2xl backdrop-blur-sm border ${
                            isDark
                              ? 'bg-white/5 border-white/10'
                              : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-glow-purple rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-glow-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-glow-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/10">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask the AI anything..."
                    className={`flex-1 p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                    }`}
                  />
                  
                  {recognitionRef.current && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isListening ? stopListening : startListening}
                      className={`p-4 rounded-2xl transition-all duration-300 ${
                        isListening
                          ? 'bg-red-500 text-white shadow-glow'
                          : isDark
                            ? 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20'
                            : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-glow-purple to-glow-pink text-white p-4 rounded-2xl shadow-glow hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
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

export default ChatPage;