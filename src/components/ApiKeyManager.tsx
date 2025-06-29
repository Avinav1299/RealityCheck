import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Check, X, AlertTriangle, Shield, Zap, Brain, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApiKeys } from '../contexts/ApiKeyContext';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const { apiKeys, updateApiKey, hasValidKey } = useApiKeys();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState(apiKeys);

  const apiServices = [
    {
      key: 'openai' as const,
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5 Turbo models',
      icon: Brain,
      color: 'from-green-500 to-emerald-500',
      placeholder: 'sk-...',
      helpUrl: 'https://platform.openai.com/api-keys'
    },
    {
      key: 'claude' as const,
      name: 'Anthropic Claude',
      description: 'Claude 3 Sonnet, Haiku models',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      placeholder: 'sk-ant-...',
      helpUrl: 'https://console.anthropic.com/account/keys'
    },
    {
      key: 'mistral' as const,
      name: 'Mistral AI',
      description: 'Mistral Large, Medium models',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      placeholder: 'api_key...',
      helpUrl: 'https://console.mistral.ai/api-keys'
    },
    {
      key: 'cohere' as const,
      name: 'Cohere',
      description: 'Command R+ models',
      icon: Globe,
      color: 'from-purple-500 to-pink-500',
      placeholder: 'co_...',
      helpUrl: 'https://dashboard.cohere.ai/api-keys'
    },
    {
      key: 'ollama' as const,
      name: 'Ollama (Local)',
      description: 'Local model endpoint',
      icon: Shield,
      color: 'from-slate-500 to-slate-600',
      placeholder: 'http://localhost:11434',
      helpUrl: 'https://ollama.ai/download'
    }
  ];

  const dataServices = [
    {
      key: 'newsapi' as const,
      name: 'NewsAPI',
      description: 'Real-time news articles',
      icon: Globe,
      color: 'from-indigo-500 to-purple-500',
      placeholder: 'api_key...',
      helpUrl: 'https://newsapi.org/account'
    },
    {
      key: 'bing' as const,
      name: 'Bing Search',
      description: 'Image search and verification',
      icon: Eye,
      color: 'from-blue-600 to-blue-700',
      placeholder: 'subscription_key...',
      helpUrl: 'https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/'
    },
    {
      key: 'google' as const,
      name: 'Google APIs',
      description: 'Search and fact-checking',
      icon: Brain,
      color: 'from-red-500 to-yellow-500',
      placeholder: 'AIza...',
      helpUrl: 'https://console.cloud.google.com/apis/credentials'
    }
  ];

  const handleSave = () => {
    Object.entries(tempKeys).forEach(([service, key]) => {
      updateApiKey(service as any, key);
    });
    onClose();
  };

  const toggleShowKey = (service: string) => {
    setShowKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const updateTempKey = (service: string, value: string) => {
    setTempKeys(prev => ({
      ...prev,
      [service]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
          isDark
            ? 'bg-black/90 border-white/10'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Key className="w-6 h-6 text-glow-purple" />
            <h2 className={`text-3xl font-bold transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              API Key Manager
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className={`p-6 rounded-2xl border mb-8 ${
          isDark
            ? 'bg-blue-500/10 border-blue-500/20'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bring Your Own API Keys (BYOK)
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                RealityCheck AI is designed to work with your own API keys for maximum privacy and control. 
                Keys are stored locally in your browser and never sent to our servers. You only pay for what you use directly to the providers.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* AI Models Section */}
          <div>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AI Models
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {apiServices.map((service) => {
                const Icon = service.icon;
                const isValid = hasValidKey(service.key);
                const currentValue = tempKeys[service.key] || '';
                
                return (
                  <div
                    key={service.key}
                    className={`p-6 rounded-2xl border transition-all duration-300 ${
                      isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${service.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {service.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {service.description}
                        </p>
                      </div>
                      <div className={`p-1 rounded-full ${
                        isValid ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {isValid ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showKeys[service.key] ? 'text' : 'password'}
                        value={currentValue}
                        onChange={(e) => updateTempKey(service.key, e.target.value)}
                        placeholder={service.placeholder}
                        className={`w-full p-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                        }`}
                      />
                      <button
                        onClick={() => toggleShowKey(service.key)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                          isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        }`}
                      >
                        {showKeys[service.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <a
                      href={service.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-1 text-xs mt-2 transition-colors hover:text-glow-purple ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      <span>Get API key</span>
                      <span>→</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Services Section */}
          <div>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Data Services
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {dataServices.map((service) => {
                const Icon = service.icon;
                const isValid = hasValidKey(service.key);
                const currentValue = tempKeys[service.key] || '';
                
                return (
                  <div
                    key={service.key}
                    className={`p-6 rounded-2xl border transition-all duration-300 ${
                      isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${service.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {service.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {service.description}
                        </p>
                      </div>
                      <div className={`p-1 rounded-full ${
                        isValid ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}>
                        {isValid ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showKeys[service.key] ? 'text' : 'password'}
                        value={currentValue}
                        onChange={(e) => updateTempKey(service.key, e.target.value)}
                        placeholder={service.placeholder}
                        className={`w-full p-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-glow-purple ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-400'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                        }`}
                      />
                      <button
                        onClick={() => toggleShowKey(service.key)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                          isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        }`}
                      >
                        {showKeys[service.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <a
                      href={service.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-1 text-xs mt-2 transition-colors hover:text-glow-purple ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      <span>Get API key</span>
                      <span>→</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Keys are stored locally and never sent to our servers
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="bg-gradient-to-r from-glow-purple to-glow-pink text-white px-8 py-3 rounded-2xl font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300"
            >
              Save Keys
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApiKeyManager;