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
  Trash2,
  Key
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApiKeys } from '../contexts/ApiKeyContext';
import { aiService } from '../services/ai/aiService';
import ModelSelector from '../components/ModelSelector';
import ApiKeyManager from '../components/ApiKeyManager';

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

const ChatPage: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedModel, availableModels, getActiveKey } = useApiKeys();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Set up AI service with API keys
  useEffect(() => {
    aiService.setApiKeys({ getActiveKey });
  }, [getActiveKey]);

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

    try {
      // Use AI service to get response
      const response = await aiService.chat([
        { role: 'system', content: 'You are a helpful AI assistant specialized in research, analysis, and providing accurate information.' },
        ...newMessages.map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }))
      ], selectedModel);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        model: response.model
      };

      const updatedMessages = [...newMessages, aiResponse];
      setMessages(updatedMessages);

      // Speak the response if enabled
      speakMessage(aiResponse.content);

      // Save to current session
      if (currentSessionId) {
        updateCurrentSession(updatedMessages);
      }
    } catch (error) {
      console.error('AI response error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please check your API key configuration in settings.',
        timestamp: new Date(),
        model: selectedModel
      };

      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
      `**${msg.type === 'user' ? 'You' : `AI (${msg.model})`}**: ${msg.content}\n\n`
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

  const selectedModelData = availableModels.find(m => m.id === selectedModel);
  const hasValidApiKey = selectedModelData?.isAvailable || false;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      {/* Fixed Header */}
      <div className="pt-20 px-6 py-8 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full backdrop-blur-sm border mb-4 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-glow-purple' 
                : 'bg-slate-100 border-slate-200 text-purple-700'
            }`}>
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">BYOK AI Consultation</span>
            </div>
            
            <h1 className={`text-5xl font-bold font-display mb-2 transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Chat
            </h1>
            <p className={`text-lg font-body transition-colors ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Engage with your own AI models for research, analysis, and strategic guidance
            </p>

            {!hasValidApiKey && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-2xl border ${
                  isDark
                    ? 'bg-yellow-500/10 border-yellow-500/20'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Key className="w-5 h-5 text-yellow-400" />
                  <span className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    Configure your API keys to start chatting
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowApiKeyManager(true)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      isDark
                        ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                        : 'bg-yellow-200 text-yellow-700 hover:bg-yellow-300'
                    }`}
                  >
                    Add Keys
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content - Flex Container */}
      <div className="flex-1 flex px-6 pb-6">
        <div className="max-w-7xl mx-auto w-full flex gap-6">
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
                AI Model
              </h2>
              
              <ModelSelector onApiKeyManager={() => setShowApiKeyManager(true)} />

              {selectedModelData && (
                <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className={`text-sm leading-relaxed transition-colors ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {selectedModelData.description}
                  </p>
                  {!selectedModelData.isAvailable && selectedModelData.requiresKey && (
                    <p className="text-xs text-yellow-400 mt-2">
                      API key required for this model
                    </p>
                  )}
                </div>
              )}
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
              <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-3">
                  {selectedModelData && (
                    <>
                      <div className={`p-2 rounded-xl bg-gradient-to-r from-glow-purple to-glow-pink`}>
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-semibold transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {selectedModelData.name}
                        </h3>
                        <p className={`text-sm transition-colors ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {selectedModelData.provider}
                        </p>
                      </div>
                    </>
                  )}
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
                                  {message.model}
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
              <div className="p-6 border-t border-white/10 flex-shrink-0">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={hasValidApiKey ? "Ask the AI anything..." : "Configure API keys to start chatting..."}
                    disabled={!hasValidApiKey}
                    className={`flex-1 p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple disabled:opacity-50 ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
                    }`}
                  />
                  
                  {recognitionRef.current && hasValidApiKey && (
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
                    disabled={!inputMessage.trim() || isTyping || !hasValidApiKey}
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

      {/* API Key Manager Modal */}
      <ApiKeyManager 
        isOpen={showApiKeyManager} 
        onClose={() => setShowApiKeyManager(false)} 
      />
    </div>
  );
};

export default ChatPage;