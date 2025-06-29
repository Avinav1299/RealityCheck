# RealityCheck AI 2.0 - Ollama-Powered Intelligence Platform

Advanced AI-powered intelligence platform with **Ollama-only integration**, real-time web scraping, enhanced discovery features, visual analytics, and comprehensive media verification capabilities.

## 🚀 Major Features

### 🤖 **Ollama-Only AI Integration**
- **Local AI Processing**: Complete privacy with local Ollama models
- **Auto-Detection**: Automatically discovers installed Ollama models
- **Model Switching**: Dynamic model selection during conversations
- **No API Keys Required**: Zero external dependencies for AI functionality
- **Privacy First**: All AI processing happens locally on your machine

### 🌐 **Real-time Web Scraping & Image Extraction**
- **SearXNG Integration**: Free, open-source metasearch engine
- **Image Scraping**: Automatic extraction from og:image, Twitter cards, and content
- **Multiple Instance Rotation**: Automatic failover across public instances
- **Live Trending Analysis**: Real-time topic detection and scoring
- **News Aggregation**: Multi-source news gathering and verification
- **Content Enhancement**: Rich media extraction and processing

### 🧭 **Enhanced Discover**
- **Smart Summaries**: AI-powered article analysis with RAG pipeline
- **Horizontal Scrolling**: Category-based article browsing
- **Clickable Intelligence**: In-app article summaries instead of external redirects
- **Timeline Generation**: Event chronology with AI analysis
- **Related Content**: Connected insights and contextual information
- **Trust Scoring**: Advanced verification metrics

### 📈 **Advanced Trending Intelligence**
- **Live Topic Clusters**: Real-time trending topic analysis with images
- **Growth Tracking**: Trend momentum and velocity metrics
- **Visual Analytics**: Interactive charts, heatmaps, and knowledge graphs
- **Category Filtering**: Technology, health, politics, climate, business
- **Timeline Views**: Chronological trend development
- **Export Capabilities**: Comprehensive trend reports

### 🧠 **Dynamic AI Chat (Ollama-Powered)**
- **Local Model Selection**: Choose from installed Ollama models
- **Real-time Switching**: Change models mid-conversation
- **Voice Integration**: Speech-to-text and text-to-speech
- **Session Management**: Persistent chat history
- **Export Capabilities**: Download conversations in Markdown

### 📊 **Visual Data Analytics**
- **Timeline Charts**: Interactive event progression visualization
- **Knowledge Graphs**: Entity relationship mapping with clickable nodes
- **Trending Heatmaps**: 24-hour topic intensity visualization
- **Metrics Dashboard**: Real-time platform statistics
- **Interactive Elements**: Hover states, animations, and drill-down capabilities

### 📅 **Event Timeline Pages**
- **Dynamic Timelines**: AI-generated event chronologies
- **Impact Analysis**: Event impact scoring and visualization
- **Knowledge Graphs**: Connected entity visualization
- **AI Chat Integration**: Discuss events with local Ollama models
- **Export Options**: Timeline reports in multiple formats

### 🔍 **Enhanced Global Pulse**
- **Multi-Source Verification**: Wikipedia context integration
- **Enhanced Image Search**: Advanced image verification
- **Real-time Processing**: Live article analysis and verification
- **Strategic Summaries**: AI-generated insights and recommendations
- **Community Feedback**: User rating and validation system

### 📄 **Advanced Insight Engine**
- **Document Intelligence**: Enhanced PDF, DOCX, TXT analysis
- **Research Context**: User-defined analysis focus
- **Key Insights**: Automated critical information extraction
- **Strategic Recommendations**: Actionable guidance and next steps
- **Export Capabilities**: Multiple format report generation

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system and dark/light themes
- **Framer Motion** for smooth animations and micro-interactions
- **React Router** for client-side routing and navigation

### AI & Models
- **Ollama Integration**: Local AI model processing
- **Auto-Discovery**: Automatic model detection and selection
- **Model Management**: Dynamic switching between installed models
- **Privacy-Focused**: All AI processing happens locally

### Data Visualization
- **Recharts**: Interactive charts and timeline visualization
- **React Force Graph**: Knowledge graph visualization
- **Chart.js**: Advanced charting capabilities
- **Custom Components**: Heatmaps, metrics dashboards, and analytics

### Data Sources
- **SearXNG**: Free, open-source web scraping
- **Image Scraping**: Axios + Cheerio for content extraction
- **Wikipedia API**: Contextual information (always free)
- **RSS Feeds**: Fallback news sources

### Backend & Database
- **Supabase** (PostgreSQL) for real-time data storage
- **Real-time Subscriptions** for live UI updates
- **Row Level Security** for data protection
- **Full-text Search** for comprehensive content discovery

## 🔧 Setup Instructions

### 1. Install Ollama

First, install Ollama on your local machine:

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### 2. Install AI Models

Install your preferred models:

```bash
# Popular models
ollama pull llama2
ollama pull codellama
ollama pull mistral
ollama pull llama2:13b

# List installed models
ollama list
```

### 3. Start Ollama Service

```bash
# Start Ollama (runs on localhost:11434)
ollama serve
```

### 4. Environment Configuration

Create a `.env` file with your optional API keys:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional Data Service APIs
VITE_NEWSAPI_KEY=your_newsapi_key
VITE_BING_IMAGE_API_KEY=your_bing_image_search_api_key
VITE_GOOGLE_API_KEY=your_google_api_key

# Ollama Configuration (Optional - defaults to localhost:11434)
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

### 5. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration file: `supabase/migrations/20250626175139_snowy_block.sql`
3. Verify all tables, policies, and indexes are created correctly
4. Enable real-time subscriptions for live updates

### 6. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 User Workflows

### 1. **Discover** → Enhanced Intelligence Exploration
- Browse trending articles with AI summaries and trust scores
- Click articles for in-app smart summaries instead of external links
- Generate event timelines with AI analysis
- Explore related content and contextual insights
- Filter by category, source, and verification status

### 2. **Trending** → Real-time Global Intelligence
- Monitor live trending topics with scraped images
- View interactive heatmaps and knowledge graphs
- Analyze trending timelines and pattern recognition
- Click topics to view detailed event timelines
- Export trending reports and analysis

### 3. **Chat** → Local AI Consultation
- Choose from installed Ollama models
- Switch models mid-conversation for different perspectives
- Use voice input and speech synthesis for hands-free interaction
- Maintain persistent chat history with session management
- Export conversations in Markdown format

### 4. **Event Timelines** → Deep Event Analysis
- View interactive timeline charts with impact analysis
- Explore knowledge graphs of connected entities
- Chat with AI about specific events and timelines
- Download comprehensive timeline reports
- Share insights and analysis

### 5. **Global Pulse** → Enhanced Media Verification
- Real-time article processing with multi-source verification
- Wikipedia context integration for background information
- Enhanced image verification and analysis
- Strategic AI summaries and actionable recommendations
- Community feedback and trust scoring

### 6. **Insight Engine** → Advanced Document Analysis
- Upload research documents with contextual focus
- Receive comprehensive AI-powered analysis
- Extract key insights and strategic recommendations
- Organize results by category and confidence levels
- Export detailed reports in multiple formats

## 🌐 Free vs. Enhanced Features

### Always Free
- **SearXNG Web Scraping**: Unlimited search across multiple sources
- **Wikipedia Integration**: Contextual information and fact-checking
- **RSS News Feeds**: Basic news aggregation
- **Document Upload**: File processing and basic analysis
- **Trending Analysis**: Real-time topic detection
- **Ollama Chat**: Full AI conversations with local models

### With Optional API Keys
- **Enhanced News**: NewsAPI for premium news sources
- **Advanced Image Search**: Bing Image Search for verification
- **Google APIs**: Enhanced search and fact-checking capabilities
- **Premium Sources**: Access to additional data providers

## 📊 Visual Analytics Features

### Interactive Charts
- **Timeline Charts**: Event progression with impact scoring
- **Knowledge Graphs**: Entity relationships with clickable nodes
- **Trending Heatmaps**: 24-hour topic intensity visualization
- **Metrics Dashboards**: Real-time platform statistics

### Data Visualization
- **Recharts Integration**: Professional chart components
- **Force Graph**: Interactive network visualization
- **Custom Components**: Specialized analytics widgets
- **Export Capabilities**: Save charts and reports

## 🔒 Privacy & Security

### Local AI Processing
- **Ollama Integration**: All AI processing happens locally
- **No External AI APIs**: Complete privacy for AI interactions
- **Model Control**: Full control over which models to use
- **Data Retention**: All chat history stored locally

### Data Protection
- **Row Level Security**: Supabase RLS policies for data protection
- **Input Validation**: Comprehensive sanitization and validation
- **CORS Configuration**: Proper cross-origin security setup
- **Local Storage**: Sensitive data stored in browser only

## 🚀 Deployment

### Recommended Platforms
- **Vercel** (Frontend + Serverless functions)
- **Netlify** (Frontend + Edge functions)
- **Supabase** (Database + Real-time + Storage)

### Environment Variables
Ensure all optional API keys are properly configured in your deployment platform's environment settings.

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Asset Optimization**: Vite's built-in optimization
- **Bundle Analysis**: Use `npm run build` to analyze bundle size
- **Progressive Loading**: Lazy loading for optimal performance

## 📈 Performance & Scaling

### Frontend Performance
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for offline functionality
- **CDN**: Static asset delivery optimization

### Backend Scaling
- **Database Indexing**: Optimized queries for large datasets
- **Real-time Limits**: Connection pooling and rate limiting
- **API Caching**: Intelligent response caching
- **Load Balancing**: Horizontal scaling for high traffic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement Ollama-first patterns for new features
- Write comprehensive tests
- Document new features and integrations
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common setup problems
- Review the Ollama documentation for model management
- Join our community Discord for real-time help

---

**RealityCheck AI 2.0** - The first truly local intelligence platform powered by Ollama, featuring advanced visual analytics, real-time web scraping, and comprehensive media verification.

*Built with ❤️ for researchers, journalists, analysts, and truth-seekers who value privacy, local control, and cutting-edge AI capabilities.*