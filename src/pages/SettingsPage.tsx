import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Database, Globe, Shield, Bell, Palette, Monitor, Smartphone, Zap, Brain, Eye, ToggleLeft, ToggleRight, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApiKeys } from '../contexts/ApiKeyContext';
import ApiKeyManager from '../components/ApiKeyManager';

const SettingsPage: React.FC = () => {
  const { isDark } = useTheme();
  const { availableModels, hasValidKey } = useApiKeys();
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    darkMode: isDark,
    compactMode: false,
    showPreviews: true,
    enableVoice: true,
    saveHistory: true,
    analytics: false
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('realitycheck_settings', JSON.stringify(settings));
    // Show success message or toast
  };

  const resetSettings = () => {
    const defaultSettings = {
      notifications: true,
      autoRefresh: true,
      darkMode: true,
      compactMode: false,
      showPreviews: true,
      enableVoice: true,
      saveHistory: true,
      analytics: false
    };
    setSettings(defaultSettings);
    localStorage.setItem('realitycheck_settings', JSON.stringify(defaultSettings));
  };

  const settingSections = [
    {
      title: 'AI Models',
      icon: Brain,
      settings: [
        {
          key: 'aiModels',
          name: 'Available Models',
          description: `${availableModels.filter(m => m.isAvailable).length}/${availableModels.length} models configured`,
          type: 'action',
          action: () => setShowApiKeyManager(true),
          actionText: 'Manage API Keys'
        }
      ]
    },
    {
      title: 'Interface',
      icon: Monitor,
      settings: [
        {
          key: 'notifications',
          name: 'Notifications',
          description: 'Show system notifications and alerts',
          type: 'toggle',
          value: settings.notifications
        },
        {
          key: 'autoRefresh',
          name: 'Auto Refresh',
          description: 'Automatically refresh content every 30 seconds',
          type: 'toggle',
          value: settings.autoRefresh
        },
        {
          key: 'compactMode',
          name: 'Compact Mode',
          description: 'Use smaller cards and reduced spacing',
          type: 'toggle',
          value: settings.compactMode
        },
        {
          key: 'showPreviews',
          name: 'Show Previews',
          description: 'Display article previews and thumbnails',
          type: 'toggle',
          value: settings.showPreviews
        }
      ]
    },
    {
      title: 'Features',
      icon: Zap,
      settings: [
        {
          key: 'enableVoice',
          name: 'Voice Features',
          description: 'Enable voice input and speech synthesis',
          type: 'toggle',
          value: settings.enableVoice
        },
        {
          key: 'saveHistory',
          name: 'Save History',
          description: 'Keep chat and search history locally',
          type: 'toggle',
          value: settings.saveHistory
        }
      ]
    },
    {
      title: 'Privacy',
      icon: Shield,
      settings: [
        {
          key: 'analytics',
          name: 'Usage Analytics',
          description: 'Help improve the platform by sharing anonymous usage data',
          type: 'toggle',
          value: settings.analytics
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen pt-20 transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
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
            <Settings className="w-5 h-5" />
            <span className="font-semibold">Platform Configuration</span>
          </div>
          
          <h1 className={`text-5xl font-bold font-display mb-4 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Settings
          </h1>
          <p className={`text-xl max-w-2xl mx-auto font-body transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Configure your RealityCheck AI experience, manage API keys, and customize platform behavior
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className={`backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
                  isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-glow-purple to-glow-pink">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className={`text-2xl font-bold transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div
                      key={setting.key}
                      className={`flex items-center justify-between p-4 rounded-2xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {setting.name}
                        </h3>
                        <p className={`text-sm transition-colors ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {setting.description}
                        </p>
                      </div>

                      <div className="ml-4">
                        {setting.type === 'toggle' && (
                          <button
                            onClick={() => updateSetting(setting.key, !setting.value)}
                            className={`p-1 rounded-full transition-colors ${
                              setting.value ? 'text-glow-purple' : isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {setting.value ? (
                              <ToggleRight className="w-8 h-8" />
                            ) : (
                              <ToggleLeft className="w-8 h-8" />
                            )}
                          </button>
                        )}

                        {setting.type === 'action' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={setting.action}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                              isDark
                                ? 'bg-glow-purple/10 border border-glow-purple/20 text-glow-purple hover:bg-glow-purple/20'
                                : 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100'
                            }`}
                          >
                            {setting.actionText}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center space-x-4 mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSettings}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
              isDark
                ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveSettings}
            className="bg-gradient-to-r from-glow-purple to-glow-pink text-white px-8 py-3 rounded-2xl font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </motion.button>
        </motion.div>

        {/* API Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`mt-12 backdrop-blur-sm border rounded-3xl p-8 shadow-xl ${
            isDark
              ? 'bg-white/5 border-white/10'
              : 'bg-white border-slate-200'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-6 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            API Status Overview
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { service: 'OpenAI', key: 'openai', icon: Brain },
              { service: 'Claude', key: 'claude', icon: Zap },
              { service: 'Mistral', key: 'mistral', icon: Shield },
              { service: 'Cohere', key: 'cohere', icon: Globe },
              { service: 'NewsAPI', key: 'newsapi', icon: Database },
              { service: 'Bing Search', key: 'bing', icon: Eye }
            ].map(({ service, key, icon: Icon }) => {
              const isConfigured = hasValidKey(key as any);
              return (
                <div
                  key={service}
                  className={`p-4 rounded-2xl border ${
                    isConfigured
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        isConfigured ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {service}
                      </p>
                      <p className={`text-xs ${
                        isConfigured ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {isConfigured ? 'Connected' : 'Not configured'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* API Key Manager Modal */}
      <ApiKeyManager 
        isOpen={showApiKeyManager} 
        onClose={() => setShowApiKeyManager(false)} 
      />
    </div>
  );
};

export default SettingsPage;