import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GlobalPulsePage from './pages/GlobalPulsePage';
import InsightEnginePage from './pages/InsightEnginePage';
import DiscoverPage from './pages/DiscoverPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import SummaryPage from './pages/SummaryPage';
import EventTimelinePage from './pages/EventTimelinePage';
import TrendingPage from './pages/TrendingPage';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ThemeProvider from './contexts/ThemeContext';
import ApiKeyProvider from './contexts/ApiKeyContext';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  return (
    <ThemeProvider>
      <ApiKeyProvider>
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
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/trending" element={<TrendingPage />} />
                <Route path="/live" element={<TrendingPage />} />
                <Route path="/article/:id" element={<ArticleDetailPage />} />
                <Route path="/summary/:id" element={<SummaryPage />} />
                <Route path="/event/:slug" element={<EventTimelinePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ApiKeyProvider>
    </ThemeProvider>
  );
}

export default App;