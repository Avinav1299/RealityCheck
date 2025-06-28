import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Sun, Moon, TrendingUp, Brain, Zap, Compass, Upload } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navigation: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/discover', name: 'Discover', icon: Compass },
    { path: '/global-pulse', name: 'Global Pulse', icon: TrendingUp },
    { path: '/research', name: 'Research', icon: Upload },
    { path: '/insight-engine', name: 'Insight Engine', icon: Brain },
    { path: '/chat', name: 'Chat', icon: Zap },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        isDark 
          ? 'bg-black/80 border-slate-800/50' 
          : 'bg-white/80 border-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-r from-glow-purple to-glow-pink shadow-glow-purple/25'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/25'
              }`}
            >
              <Shield className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <span className={`text-xl font-bold font-display transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                RealityCheck AI
              </span>
              <p className={`text-sm font-medium transition-colors ${
                isDark ? 'text-glow-purple' : 'text-purple-600'
              }`}>
                Advanced Intelligence Platform
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 ${
                      isActive
                        ? isDark
                          ? 'bg-glow-purple/20 text-glow-purple shadow-glow-sm'
                          : 'bg-purple-100 text-purple-700 shadow-lg shadow-purple-500/10'
                        : isDark
                          ? 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isDark
                ? 'bg-slate-800/50 text-yellow-400 hover:bg-slate-700/50 shadow-lg shadow-slate-900/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-lg shadow-slate-500/10'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;