# RealityCheck AI 2.0 - BYOK Intelligence Platform

Advanced AI-powered intelligence platform with **Bring Your Own API Key (BYOK)** system, real-time web scraping, and comprehensive media verification capabilities.

## 🚀 Major Features

### 🔐 **Bring Your Own API Key (BYOK)**
- **Complete Privacy**: All API keys stored locally in your browser
- **Multi-Provider Support**: OpenAI, Claude, Mistral, Cohere, Ollama
- **Cost Control**: Pay only for what you use directly to providers
- **No Vendor Lock-in**: Switch between models freely
- **Local Storage**: Keys never sent to our servers

### 🌐 **Real-time Web Scraping**
- **SearXNG Integration**: Free, open-source metasearch engine
- **Multiple Instance Rotation**: Automatic failover across public instances
- **Live Trending Analysis**: Real-time topic detection and scoring
- **News Aggregation**: Multi-source news gathering and verification
- **Fact-Check Integration**: Automated fact-checking source discovery

### 🧭 **Enhanced Discover**
- **Smart Summaries**: AI-powered article analysis with RAG pipeline
- **Horizontal Scrolling**: Category-based article browsing
- **Clickable Intelligence**: In-app article summaries instead of external redirects
- **Timeline Generation**: Event chronology with AI analysis
- **Related Content**: Connected insights and contextual information
- **Trust Scoring**: Advanced verification metrics

### 📈 **Trending Intelligence**
- **Live Topic Clusters**: Real-time trending topic analysis
- **Growth Tracking**: Trend momentum and velocity metrics
- **Category Filtering**: Technology, health, politics, climate, business
- **Source Diversity**: Multi-platform trend aggregation
- **Visual Analytics**: Charts and graphs for trend visualization

### 🧠 **Dynamic AI Chat**
- **Model Selection**: Choose from 10+ AI models
- **Real-time Switching**: Change models mid-conversation
- **Voice Integration**: Speech-to-text and text-to-speech
- **Session Management**: Persistent chat history
- **Export Capabilities**: Download conversations in Markdown

### 📊 **Global Pulse Enhanced**
- **Multi-Source Verification**: Wikipedia, fact-checkers, reverse image search
- **Real-time Processing**: Live article analysis and verification
- **Enhanced Image Verification**: Bing Image Search integration
- **Context Integration**: Wikipedia background information
- **Strategic Summaries**: AI-generated insights and recommendations

### 🔍 **Insight Engine Advanced**
- **Document Intelligence**: PDF, DOCX, TXT analysis
- **Research Context**: Targeted analysis based on user focus
- **Key Insights Extraction**: Automated critical information identification
- **Strategic Recommendations**: Actionable guidance and next steps
- **Export Options**: PDF and Markdown report generation

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system and dark/light themes
- **Framer Motion** for smooth animations and micro-interactions
- **React Router** for client-side routing and navigation

### AI & Models
- **OpenAI GPT-4/3.5** for advanced reasoning and analysis
- **Anthropic Claude 3** (Sonnet, Haiku) for excellent analysis
- **Mistral AI** (Large, Medium) for multilingual processing
- **Cohere Command R+** for advanced reasoning
- **Ollama Local Models** for privacy-focused inference

### Data Sources
- **SearXNG** for free, open-source web scraping
- **Wikipedia API** for contextual information (always free)
- **NewsAPI** for real-time news articles
- **Bing Image Search** for reverse image verification
- **RSS Feeds** as fallback news sources

### Backend & Database
- **Supabase** (PostgreSQL) for real-time data storage
- **Real-time Subscriptions** for live UI updates
- **Row Level Security** for data protection
- **Full-text Search** for comprehensive content discovery

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env` file with your API keys:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Model APIs (Optional - Configure in Settings)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_CLAUDE_API_KEY=your_claude_api_key
VITE_MISTRAL_API_KEY=your_mistral_api_key
VITE_COHERE_API_KEY=your_cohere_api_key

# Data Service APIs (Optional)
VITE_NEWSAPI_KEY=your_newsapi_key
VITE_BING_IMAGE_API_KEY=your_bing_image_search_api_key
VITE_GOOGLE_API_KEY=your_google_api_key

# Ollama Configuration (Optional)
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

### 2. BYOK Configuration

The platform is designed to work **100% without built-in API keys**:

1. **Launch the application** - it works immediately with free sources
2. **Click the API key icon** in the navigation to open the API Key Manager
3. **Add your own API keys** for the services you want to use
4. **Select your preferred AI model** from the model selector
5. **Start using advanced features** powered by your own keys

### 3. Free Sources Mode

The platform provides full functionality using only free sources:
- **Wikipedia API** for contextual information
- **SearXNG** for web scraping and search
- **RSS Feeds** for news aggregation
- **Mock Intelligence** for development and testing

### 4. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration file: `supabase/migrations/create_realitycheck_schema.sql`
3. Verify all tables, policies, and indexes are created correctly
4. Enable real-time subscriptions for live updates

### 5. Development

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

## 🔑 API Key Configuration

### AI Models

#### OpenAI (GPT-4, GPT-3.5 Turbo)
- **Website**: [platform.openai.com](https://platform.openai.com)
- **Key Format**: `sk-...`
- **Models**: GPT-4, GPT-3.5 Turbo
- **Best For**: Complex reasoning, analysis, creative tasks

#### Anthropic Claude
- **Website**: [console.anthropic.com](https://console.anthropic.com)
- **Key Format**: `sk-ant-...`
- **Models**: Claude 3 Sonnet, Claude 3 Haiku
- **Best For**: Analysis, reasoning, safety-focused responses

#### Mistral AI
- **Website**: [console.mistral.ai](https://console.mistral.ai)
- **Key Format**: `api_key...`
- **Models**: Mistral Large, Mistral Medium
- **Best For**: Multilingual tasks, efficient processing

#### Cohere
- **Website**: [dashboard.cohere.ai](https://dashboard.cohere.ai)
- **Key Format**: `co_...`
- **Models**: Command R+
- **Best For**: Advanced reasoning, generation tasks

#### Ollama (Local)
- **Website**: [ollama.ai](https://ollama.ai)
- **Setup**: Install Ollama locally, no API key required
- **Models**: Llama 2, Code Llama, Mistral 7B, and more
- **Best For**: Privacy, offline processing, custom models

### Data Services

#### NewsAPI
- **Website**: [newsapi.org](https://newsapi.org)
- **Free Tier**: 100 requests/day
- **Purpose**: Real-time news articles

#### Bing Image Search
- **Website**: [Azure Cognitive Services](https://azure.microsoft.com/services/cognitive-services/bing-image-search-api/)
- **Purpose**: Reverse image search and verification

#### Google APIs
- **Website**: [console.cloud.google.com](https://console.cloud.google.com)
- **Purpose**: Enhanced search and fact-checking

## 🎯 User Workflows

### 1. **Discover** → Enhanced Intelligence Exploration
- Browse trending articles with AI summaries and trust scores
- Click articles for in-app smart summaries instead of external links
- Generate event timelines with AI analysis
- Explore related content and contextual insights
- Filter by category, source, and verification status

### 2. **Trending** → Real-time Global Intelligence
- Monitor live trending topics across multiple categories
- View topic clusters with growth metrics and source diversity
- Analyze trending timelines and pattern recognition
- Search for specific trending topics and events
- Export trending reports and analysis

### 3. **Chat** → Multi-Model AI Consultation
- Choose from 10+ AI models based on your API keys
- Switch models mid-conversation for different perspectives
- Use voice input and speech synthesis for hands-free interaction
- Maintain persistent chat history with session management
- Export conversations in Markdown format

### 4. **Global Pulse** → Enhanced Media Verification
- Real-time article processing with multi-source verification
- Wikipedia context integration for background information
- Enhanced image verification using Bing Image Search
- Strategic AI summaries and actionable recommendations
- Community feedback and trust scoring

### 5. **Insight Engine** → Advanced Document Analysis
- Upload research documents with contextual focus
- Receive comprehensive AI-powered analysis
- Extract key insights and strategic recommendations
- Organize results by category and confidence levels
- Export detailed reports in multiple formats

## 🌐 Free vs. Paid Features

### Always Free
- **SearXNG Web Scraping**: Unlimited search across multiple sources
- **Wikipedia Integration**: Contextual information and fact-checking
- **RSS News Feeds**: Basic news aggregation
- **Document Upload**: File processing and basic analysis
- **Trending Analysis**: Real-time topic detection
- **Basic Chat**: Using mock responses for testing

### With Your API Keys
- **Advanced AI Chat**: Full conversations with your chosen models
- **Smart Summaries**: AI-powered article analysis with RAG
- **Enhanced Verification**: Advanced fact-checking and analysis
- **Strategic Insights**: AI-generated recommendations and next steps
- **Voice Features**: Speech-to-text and text-to-speech
- **Premium Sources**: NewsAPI, Bing Image Search, Google APIs

## 🔒 Privacy & Security

### Data Protection
- **Local Storage**: All API keys stored in your browser only
- **No Server Storage**: Keys never transmitted to our servers
- **Row Level Security**: Supabase RLS policies for data protection
- **Input Validation**: Comprehensive sanitization and validation
- **CORS Configuration**: Proper cross-origin security setup

### Privacy Features
- **BYOK Architecture**: Complete control over your AI interactions
- **Local Processing**: Ollama support for offline AI inference
- **Data Retention**: Configurable cleanup policies
- **Transparent Usage**: Clear indication of which services are being used
- **No Tracking**: No analytics or tracking without explicit consent

## 🚀 Deployment

### Recommended Platforms
- **Vercel** (Frontend + Serverless functions)
- **Netlify** (Frontend + Edge functions)
- **Supabase** (Database + Real-time + Storage)

### Environment Variables
Ensure all API keys are properly configured in your deployment platform's environment settings, or use the in-app API Key Manager for user-provided keys.

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Asset Optimization**: Vite's built-in optimization
- **Bundle Analysis**: Use `npm run build` to analyze bundle size
- **Progressive Loading**: Lazy loading for optimal performance

## 📈 Performance & Scaling

### Frontend Optimization
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for offline functionality
- **CDN**: Static asset delivery optimization

### Backend Scaling
- **Database Indexing**: Optimized queries for large datasets
- **Real-time Limits**: Connection pooling and rate limiting
- **API Caching**: Redis for frequently accessed data
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
- Implement BYOK patterns for new features
- Write comprehensive tests
- Document new features and API integrations
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common setup problems
- Review the API documentation for each integrated service
- Join our community Discord for real-time help

---

**RealityCheck AI 2.0** - The first truly open intelligence platform where you bring your own keys and maintain complete control over your AI interactions.

*Built with ❤️ for researchers, journalists, analysts, and truth-seekers who value privacy, control, and cutting-edge AI capabilities.*