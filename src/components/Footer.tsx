import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Footer: React.FC = () => {
  const { isDark } = useTheme();

  const footerLinks = [
    { name: 'Terms', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Security', href: '#' },
    { name: 'Status', href: '#' },
    { name: 'Docs', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Manage Cookies', href: '#' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative border-t backdrop-blur-xl transition-all duration-300 ${
        isDark 
          ? 'bg-black/80 border-slate-800/50' 
          : 'bg-white/80 border-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isDark
                ? 'bg-gradient-to-r from-glow-purple to-glow-pink'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium transition-colors ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                © 2025 RealityCheck AI, Inc.
              </p>
              <p className={`text-xs transition-colors ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Advanced Intelligence Platform
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                whileHover={{ scale: 1.05 }}
                className={`text-sm font-medium transition-colors duration-300 hover:underline ${
                  isDark 
                    ? 'text-slate-400 hover:text-glow-purple' 
                    : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* Additional Info */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs transition-colors ${
              isDark ? 'text-slate-500' : 'text-slate-500'
            }`}>
              Powered by AI
            </span>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isDark ? 'bg-glow-purple' : 'bg-purple-500'
            }`}></div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className={`mt-6 pt-6 border-t text-center ${
          isDark ? 'border-slate-800/50' : 'border-slate-200/50'
        }`}>
          <p className={`text-xs transition-colors ${
            isDark ? 'text-slate-500' : 'text-slate-500'
          }`}>
            Built with advanced AI to navigate the information age with confidence and clarity.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;