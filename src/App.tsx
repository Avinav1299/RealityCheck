import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GlobalPulsePage from './pages/GlobalPulsePage';
import InsightEnginePage from './pages/InsightEnginePage';
import DiscoverPage from './pages/DiscoverPage';
import ResearchPage from './pages/ResearchPage';
import ChatPage from './pages/ChatPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ThemeProvider from './contexts/ThemeContext';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300 flex flex-col relative">
          <AnimatedBackground variant="cubes" intensity="medium" />
          <Navigation />
          <main className="flex-1 relative z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/global-pulse" element={<GlobalPulsePage />} />
              <Route path="/insight-engine" element={<InsightEnginePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/article/:id" element={<ArticleDetailPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;