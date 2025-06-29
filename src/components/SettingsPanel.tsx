import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Zap, Shield, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [useFreeSourcesOnly, setUseFreeSourcesOnly] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    newsapi: false,
    openai: false,
    bing: false,
    google: false
  });

  useEffect(() => {
    // Check if free sources only is enabled
    const freeOnly = localStorage.getItem('useFreeSourcesOnly') === 'true';
    setUseFreeSourcesOnly(freeOnly);

    // Check API key availability
    setApiStatus({
      newsapi: !!import.meta.env.VITE_NEWSAPI_KEY && import.meta.env.VITE_NEWSAPI_KEY !== 'demo-key',
      openai: !!import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'demo-key',
      bing: !!import.meta.env.VITE_BING_IMAGE_API_KEY && import.meta.env.VITE_BING_IMAGE_API_KEY !== 'demo-key',
      google: !!import.meta.env.VITE_GOOGLE_API_KEY && import.meta.env.VITE_GOOGLE_API_KEY !== 'demo-key'
    });
  }, []);

  const toggleFreeSourcesOnly = () => {
    const newValue = !useFreeSourcesOnly;
    setUseFreeSourcesOnly(newValue);
    localStorage.setItem('useFreeSourcesOnly', newValue.toString());
    
    // Reload page to apply changes
    window.location.reload();
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
        className={`relative w-full max-w-2xl backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
          isDark
            ? 'bg-black/80 border-white/10'
            : 'bg-white/80 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-glow-purple" />
            <h2 className={`text-2xl font-bold transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Platform Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
            }`}
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Free Sources Toggle */}
          <div className={`p-6 rounded-2xl border ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className={`font-semibold transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Use Free Sources Only
                  </h3>
                  <p className={`text-sm transition-colors ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Rely on Wikipedia, RSS feeds, and open APIs instead of commercial services
                  </p>
                </div>
              </div>
              <button
                onClick={toggleFreeSourcesOnly}
                className={`p-1 rounded-full transition-colors ${
                  useFreeSourcesOnly ? 'text-green-400' : isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {useFreeSourcesOnly ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>
            {useFreeSourcesOnly && (
              <div className="text-sm text-green-400 bg-green-500/10 p-3 rounded-xl">
                ✓ Using Wikipedia, RSS feeds, and open sources for all data
              </div>
            )}
          </div>

          {/* API Status */}
          <div className={`p-6 rounded-2xl border ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className={`font-semibold transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                API Services Status
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'newsapi', name: 'NewsAPI', icon: Database },
                { key: 'openai', name: 'OpenAI GPT-4', icon: Zap },
                { key: 'bing', name: 'Bing Image Search', icon: Globe },
                { key: 'google', name: 'Google APIs', icon: Shield }
              ].map(({ key, name, icon: Icon }) => (
                <div
                  key={key}
                  className={`flex items-center space-x-3 p-3 rounded-xl ${
                    apiStatus[key as keyof typeof apiStatus]
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      apiStatus[key as keyof typeof apiStatus] ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {name}
                    </p>
                    <p className={`text-xs ${
                      apiStatus[key as keyof typeof apiStatus] ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {apiStatus[key as keyof typeof apiStatus] ? 'Connected' : 'Not configured'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className={`p-6 rounded-2xl border ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className={`font-semibold transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Active Data Sources
              </h3>
            </div>
            
            <div className="space-y-2">
              {[
                { name: 'Wikipedia API', status: 'Always Available', color: 'green' },
                { name: 'Supabase Database', status: 'Connected', color: 'green' },
                { name: 'RSS Feeds', status: 'Multiple Sources', color: 'green' },
                { name: 'Mock Intelligence', status: 'Fallback Active', color: 'yellow' }
              ].map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className={`text-sm transition-colors ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {source.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    source.color === 'green'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {source.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className={`text-sm transition-colors ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Changes will take effect after page reload
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel;