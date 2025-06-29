import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Brain, Zap, Shield, Globe, Check, X, Key } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApiKeys } from '../contexts/ApiKeyContext';

interface ModelSelectorProps {
  onApiKeyManager?: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onApiKeyManager }) => {
  const { isDark } = useTheme();
  const { selectedModel, setSelectedModel, availableModels } = useApiKeys();
  const [isOpen, setIsOpen] = useState(false);

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return Brain;
      case 'anthropic': return Zap;
      case 'mistral ai': return Shield;
      case 'cohere': return Globe;
      case 'ollama (local)': return Shield;
      default: return Brain;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return 'from-green-500 to-emerald-500';
      case 'anthropic': return 'from-orange-500 to-red-500';
      case 'mistral ai': return 'from-blue-500 to-cyan-500';
      case 'cohere': return 'from-purple-500 to-pink-500';
      case 'ollama (local)': return 'from-slate-500 to-slate-600';
      default: return 'from-glow-purple to-glow-pink';
    }
  };

  const selectedModelData = availableModels.find(m => m.id === selectedModel);
  const availableCount = availableModels.filter(m => m.isAvailable).length;
  const totalCount = availableModels.length;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border transition-all duration-300 min-w-[200px] ${
          isDark
            ? 'bg-white/5 border-white/10 hover:bg-white/10'
            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
        }`}
      >
        {selectedModelData && (
          <>
            <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getProviderColor(selectedModelData.provider)}`}>
              {React.createElement(getProviderIcon(selectedModelData.provider), { 
                className: "w-4 h-4 text-white" 
              })}
            </div>
            <div className="flex-1 text-left">
              <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedModelData.name}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {selectedModelData.provider}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedModelData.isAvailable ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </>
        )}
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`absolute top-full left-0 right-0 mt-2 backdrop-blur-sm border rounded-2xl shadow-xl z-50 ${
            isDark
              ? 'bg-black/90 border-white/10'
              : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Select AI Model
              </h3>
              <div className={`text-xs px-2 py-1 rounded-full ${
                isDark
                  ? 'bg-white/10 text-slate-400'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {availableCount}/{totalCount} available
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableModels.map((model) => {
                const Icon = getProviderIcon(model.provider);
                const isSelected = model.id === selectedModel;
                
                return (
                  <motion.button
                    key={model.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      if (model.isAvailable) {
                        setSelectedModel(model.id);
                        setIsOpen(false);
                      }
                    }}
                    disabled={!model.isAvailable}
                    className={`w-full p-3 rounded-xl border transition-all duration-300 text-left ${
                      isSelected
                        ? isDark
                          ? 'bg-glow-purple/20 border-glow-purple/50'
                          : 'bg-purple-100 border-purple-300'
                        : model.isAvailable
                          ? isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          : isDark
                            ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                            : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getProviderColor(model.provider)} ${
                        !model.isAvailable ? 'opacity-50' : ''
                      }`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold text-sm ${
                          isDark ? 'text-white' : 'text-slate-900'
                        } ${!model.isAvailable ? 'opacity-50' : ''}`}>
                          {model.name}
                        </div>
                        <div className={`text-xs ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        } ${!model.isAvailable ? 'opacity-50' : ''}`}>
                          {model.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {model.requiresKey && !model.isAvailable && (
                          <Key className="w-4 h-4 text-yellow-400" />
                        )}
                        {model.isAvailable ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {availableCount < totalCount && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onApiKeyManager?.();
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isDark
                      ? 'bg-glow-purple/10 border-glow-purple/20 text-glow-purple hover:bg-glow-purple/20'
                      : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span className="font-semibold">Add API Keys</span>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ModelSelector;