# Docker Deployment Guide for RealityCheck AI

This guide will help you deploy RealityCheck AI locally using Docker with real-world data sources.

## Prerequisites

1. **Docker and Docker Compose** installed on your system
2. **API Keys** for real data sources (optional but recommended)

## Quick Start

1. **Clone and prepare the environment:**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API keys (optional)
nano .env
```

2. **Build and run with Docker Compose:**
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

3. **Access the application:**
- Main app: http://localhost:3000
- Proxy service: http://localhost:8080

## API Keys Configuration

For real-world data, add these keys to your `.env` file:

### Required for AI Chat Features:
```env
VITE_CLAUDE_API_KEY=sk-ant-your_actual_claude_key
VITE_OPENAI_API_KEY=sk-your_actual_openai_key
```

### Optional for Enhanced Data:
```env
VITE_NEWSAPI_KEY=your_newsapi_key
VITE_BING_IMAGE_API_KEY=your_bing_search_key
VITE_GOOGLE_API_KEY=your_google_api_key
```

## Real-World Data Sources

The application now uses multiple real-world data sources:

### 1. RSS Feed Scraping (No API Key Required)
- CNN, BBC, Reuters, NPR news feeds
- TechCrunch, Wired, Ars Technica for technology
- Bloomberg, Financial Times for business
- WHO, Medical News Today for health

### 2. Image Analysis (Client-Side)
- Real metadata analysis of images
- Compression detection
- Manipulation indicators
- URL context analysis

### 3. Wikipedia Integration
- Free Wikipedia API for fact-checking
- No API key required

## Docker Services

### Main Application (`realitycheck-app`)
- Nginx-served React application
- Built with production optimizations
- CORS proxy configuration

### Proxy Service (`proxy`)
- Handles API requests to avoid CORS issues
- Routes requests to external APIs
- Load balancing for better reliability

### Redis Cache (`redis`)
- Caches API responses
- Improves performance
- Reduces API calls

## Development vs Production

### Development Mode:
```bash
# Run development server
npm run dev
```

### Production Mode (Docker):
```bash
# Build and deploy
docker-compose up --build
```

## Troubleshooting

### 1. API Connection Issues
- Check your `.env` file has correct API keys
- Ensure no firewall blocking external API calls
- Verify internet connection

### 2. Docker Build Issues
```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose up --build
```

### 3. Real Data Not Loading
- Check browser console for errors
- Verify RSS feeds are accessible
- Some corporate networks block external feeds

### 4. CORS Issues
- Use the proxy service on port 8080
- Check nginx configuration
- Ensure proper headers are set

## Performance Optimization

### 1. Enable Redis Caching
```bash
# Redis is included in docker-compose
# Caches API responses for 1 hour
```

### 2. Configure Nginx Caching
```bash
# Static assets cached for 1 year
# API responses cached for 5 minutes
```

### 3. Optimize Image Loading
```bash
# Images are lazy-loaded
# Thumbnails generated automatically
```

## Security Considerations

1. **API Keys**: Never commit real API keys to version control
2. **CORS**: Properly configured in nginx
3. **Headers**: Security headers enabled
4. **SSL**: Use reverse proxy with SSL in production

## Monitoring and Logs

### View Application Logs:
```bash
docker-compose logs -f realitycheck-app
```

### View All Service Logs:
```bash
docker-compose logs -f
```

### Monitor Resource Usage:
```bash
docker stats
```

## Scaling

### Horizontal Scaling:
```bash
# Scale app instances
docker-compose up --scale realitycheck-app=3
```

### Load Balancer Configuration:
```nginx
upstream app_servers {
    server realitycheck-app_1:80;
    server realitycheck-app_2:80;
    server realitycheck-app_3:80;
}
```

## Backup and Recovery

### Backup Redis Data:
```bash
docker exec redis redis-cli BGSAVE
docker cp redis:/data/dump.rdb ./backup/
```

### Restore Redis Data:
```bash
docker cp ./backup/dump.rdb redis:/data/
docker-compose restart redis
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Docker logs
3. Verify API key configuration
4. Test with mock data first (set `VITE_USE_FREE_SOURCES_ONLY=true`)