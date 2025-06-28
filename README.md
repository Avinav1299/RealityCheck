# RealityCheck AI 2.0

Advanced AI-powered intelligence platform that combines real-time media verification, document analysis, and strategic consultation to navigate the information age with confidence.

## 🚀 Features

### 🧭 **Discover**
- **Live Intelligence Feed**: Trending articles with AI-powered summaries and insights
- **Trust Scoring**: Advanced verification metrics for content reliability
- **Smart Filtering**: Filter by trending, latest, verified, or global content
- **Tag-Based Discovery**: Explore content by topics and categories
- **Related Articles**: Connected insights and contextual information
- **Interactive Cards**: Animated discovery interface with hover effects

### 🌍 **Global Pulse**
- **Real-time Media Verification**: Advanced fact-checking across global news sources
- **TinEye Integration**: Reverse image search to detect manipulated or miscontextualized media
- **GPT-4 Analysis**: Chain-of-thought reasoning for comprehensive claim verification
- **Google Fact Check API**: Integration with authoritative fact-checking sources
- **Live Dashboard**: Real-time updates with sector filtering and search capabilities
- **Reality Digest**: AI-generated strategic summaries and recommendations

### 📄 **Research**
- **Document Upload**: Support for PDF, DOCX, and TXT files with drag-and-drop interface
- **Reality Digest Generation**: Comprehensive AI-powered analysis with key facts extraction
- **5W Analysis**: Who, What, When, Where, Why connections and insights
- **Causal Link Mapping**: Identify cause-and-effect relationships with confidence scores
- **Export Capabilities**: Download reports in PDF or Markdown format
- **Strategic Recommendations**: AI-generated next actions and implementation guidance

### 🧠 **Insight Engine**
- **Document Intelligence**: Upload PDFs, DOCX, and text files for AI-powered analysis
- **Research Context**: Define specific research focus for targeted insights
- **Key Insights Extraction**: Automated identification of critical information
- **Strategic Recommendations**: Actionable guidance based on document analysis
- **Category Organization**: Sort by relevance, date, and research domains

### 💬 **Chat**
- **Multi-Model Support**: Choose from GPT-4, Mistral, or Ollama models
- **Voice Integration**: Web Speech API for voice queries and responses
- **Chat History**: Persistent conversation management with local storage
- **Export Functionality**: Download chat sessions in Markdown format
- **Real-time Responses**: Advanced AI consultation with typing indicators

### 🔮 **Oracle Room**
- **Advanced AI Consultation**: Strategic guidance and expert-level analysis
- **Document Context Integration**: Reference uploaded documents in conversations
- **Conversation Management**: Save, export, and organize chat sessions
- **Model Comparison**: Switch between different AI models for varied perspectives

### 🎨 **Design & Experience**
- **Dark Mode First**: Default black (#000000) theme with light mode toggle
- **Futuristic Typography**: Poppins, Inter, and Space Grotesk fonts
- **Glowing UI Accents**: Blue/purple glow effects for interactive elements
- **Glassmorphism Effects**: Floating card designs with backdrop blur
- **Smooth Animations**: Framer Motion powered interactions and transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom design system and dark/light themes
- **Framer Motion** for smooth animations and micro-interactions
- **React Router** for client-side routing and navigation
- **React Dropzone** for intuitive file upload experiences

### AI & APIs
- **OpenAI GPT-4** for advanced text analysis and conversation
- **TinEye API** for reverse image search and manipulation detection
- **Google Fact Check API** for authoritative verification sources
- **NewsAPI** for real-time news article fetching
- **Mistral AI** for fast and efficient language processing
- **Ollama** for local model processing and privacy

### Backend & Database
- **Supabase** (PostgreSQL) for real-time data storage
- **Real-time Subscriptions** for live UI updates
- **Row Level Security** for data protection and privacy
- **Full-text Search** for comprehensive content discovery

### Document Processing
- **PDF-Parse** for PDF content extraction
- **Mammoth** for DOCX document processing
- **jsPDF** for PDF report generation
- **File Type Detection** for secure upload validation

### Voice & Speech
- **Web Speech API** for voice input and output
- **Speech Recognition** for voice-to-text conversion
- **Speech Synthesis** for text-to-speech responses

## 📋 Database Schema

### Core Tables
- `articles` - News articles and media content
- `image_checks` - TinEye verification results and metadata
- `text_checks` - GPT + Fact Check API analysis results
- `strategies` - AI-generated strategic recommendations
- `feedback` - User ratings and community validation
- `documents` - Uploaded research documents and analysis
- `chat_sessions` - Chat conversation history

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Model APIs
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_MISTRAL_API_KEY=your_mistral_api_key

# Verification APIs
VITE_NEWSAPI_KEY=your_newsapi_key
VITE_TINEYE_API_KEY=your_tineye_api_key
VITE_TINEYE_PRIVATE_KEY=your_tineye_private_key
VITE_GOOGLE_API_KEY=your_google_api_key

# Optional: Custom Configuration
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_CUSTOM_API_BASE_URL=https://your-api.com
```

### 2. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration file: `supabase/migrations/create_realitycheck_schema.sql`
3. Verify all tables, policies, and indexes are created correctly
4. Enable real-time subscriptions for live updates

### 3. API Key Configuration

#### OpenAI API
1. Create account at [OpenAI Platform](https://platform.openai.com)
2. Generate API key with GPT-4 access
3. Add to environment variables

#### TinEye API
1. Sign up at [TinEye API](https://tineye.com/api)
2. Get your API key and private key
3. Add to environment variables

#### NewsAPI
1. Register at [NewsAPI](https://newsapi.org)
2. Get your free API key (100 requests/day)
3. Add to environment variables

#### Google Fact Check API
1. Enable Fact Check Tools API in Google Cloud Console
2. Create credentials and get API key
3. Add to environment variables

### 4. Development

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

## 🎯 User Flow

### 1. **Discover** → Intelligence Exploration
- Browse trending articles with AI summaries and trust scores
- Filter by content type, topic, and verification status
- Explore related articles and contextual insights
- Access detailed analysis and source verification

### 2. **Research** → Document Analysis
- Upload research documents with contextual information
- Receive comprehensive Reality Digests with key facts
- Explore 5W analysis and causal link mapping
- Download detailed reports in PDF or Markdown format

### 3. **Chat** → AI Consultation
- Choose from multiple AI models for different use cases
- Engage in voice-enabled conversations with speech synthesis
- Maintain persistent chat history with export capabilities
- Access model-specific capabilities and features

### 4. **Global Pulse** → Media Verification
- Monitor real-time verified news across sectors
- View verification badges and confidence scores
- Access Reality Digest summaries and strategic insights
- Provide feedback on content accuracy and helpfulness

### 5. **Insight Engine** → Advanced Analysis
- Upload documents for AI-powered research insights
- Define research context for targeted analysis
- Receive strategic recommendations and next steps
- Organize results by category and confidence levels

## 🤖 AI Model Support

### GPT-4 (OpenAI)
- **Strengths**: Advanced reasoning, comprehensive analysis, creative problem-solving
- **Use Cases**: Complex research questions, strategic planning, detailed analysis
- **Features**: Chain-of-thought reasoning, tool calling, multimodal capabilities

### Mistral AI
- **Strengths**: Fast processing, efficient responses, multilingual support
- **Use Cases**: Quick analysis, real-time verification, general inquiries
- **Features**: Efficient processing, cost-effective, multilingual capabilities

### Ollama (Local)
- **Strengths**: Privacy-focused, offline processing, customizable models
- **Use Cases**: Sensitive documents, air-gapped environments, custom workflows
- **Features**: Local inference, privacy protection, custom model support

## 🎨 UI Design Philosophy

### Dark-First Design
- **Default Black Theme**: Pure black (#000000) background for optimal contrast
- **Light Mode Toggle**: Clean white (#ffffff) alternative theme
- **Glowing Accents**: Blue/purple glow effects for interactive elements
- **Consistent Branding**: Purple-pink gradient identity throughout

### Futuristic Typography
- **Display Font**: Space Grotesk for headlines and branding
- **Body Font**: Poppins for readable content and descriptions
- **System Font**: Inter as fallback for optimal performance
- **Font Weights**: Maximum 2 weights for clean hierarchy

### Glassmorphism Effects
- **Floating Cards**: Elevated design with soft shadows and backdrop blur
- **Transparency**: Strategic use of opacity for depth and layering
- **Smooth Transitions**: Framer Motion powered animations
- **Interactive Feedback**: Hover states and micro-interactions

### Component Naming Convention
- **Discover**: Live intelligence exploration and trending content
- **Global Pulse**: Real-time media verification feed
- **Research**: Document upload and Reality Digest generation
- **Insight Engine**: Advanced document analysis workspace
- **Chat**: Multi-model AI conversation interface
- **Oracle Room**: Advanced AI consultation and strategic planning

## 🚀 Deployment

### Recommended Platforms
- **Vercel** (Frontend + Serverless functions)
- **Netlify** (Frontend + Edge functions)
- **Supabase** (Database + Real-time + Storage)

### Environment Variables
Ensure all API keys are properly configured in your deployment platform's environment settings.

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Asset Optimization**: Vite's built-in optimization
- **Bundle Analysis**: Use `npm run build` to analyze bundle size

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

## 🔒 Security & Privacy

### Data Protection
- **Row Level Security**: Supabase RLS policies
- **API Key Protection**: Environment variable security
- **Input Validation**: Comprehensive sanitization
- **CORS Configuration**: Proper cross-origin setup

### Privacy Features
- **Local Processing**: Ollama for sensitive documents
- **Data Retention**: Configurable cleanup policies
- **User Consent**: Transparent data usage policies
- **Encryption**: End-to-end for sensitive communications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write comprehensive tests
- Document new features
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

**RealityCheck AI 2.0** - Empowering truth through advanced intelligence in the digital age.

*Built with ❤️ for researchers, journalists, analysts, and truth-seekers worldwide.*