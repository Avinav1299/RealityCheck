# Docker Setup Guide for RealityCheck AI

This guide will help you run RealityCheck AI locally using Docker with both development and production configurations.

## Prerequisites

1. **Docker and Docker Compose** installed on your system
2. **Ollama** installed locally (for AI features)

## Quick Start

### 1. Clone and Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API keys (optional)
nano .env
```

### 2. Development Mode (Recommended for Local Development)

```bash
# Start development server with hot reload
npm run docker:dev

# Or manually with docker-compose
docker-compose -f docker-compose.dev.yml up --build realitycheck-dev
```

This will:
- Start the Vite dev server on http://localhost:5173
- Enable hot reload for instant code changes
- Mount your local code directory for live editing

### 3. Production Mode (For Testing Production Build)

```bash
# Build and run production version
npm run docker:prod

# Or manually with docker-compose
docker-compose -f docker-compose.dev.yml --profile production up --build realitycheck-prod
```

This will:
- Build the optimized production bundle
- Serve via Nginx on http://localhost:3000
- Test the production configuration

### 4. Stop Services

```bash
# Stop all services
npm run docker:down

# Or manually
docker-compose -f docker-compose.dev.yml down
```

## Service URLs

- **Development**: http://localhost:5173
- **Production**: http://localhost:3000
- **Redis** (optional): localhost:6379

## Ollama Integration

### Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - Download from https://ollama.ai/download
```

### Start Ollama

```bash
# Start Ollama service
ollama serve

# Install models (in another terminal)
ollama pull llama2
ollama pull codellama
ollama pull mistral
```

### Configure Ollama URL

If Ollama is running on a different host or port, update your `.env` file:

```env
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

## Environment Configuration

### Required Variables

```env
# Supabase (Required for data storage)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Ollama (Optional - defaults to localhost:11434)
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

### Optional API Keys

```env
# Enhanced data sources (optional)
VITE_NEWSAPI_KEY=your_newsapi_key
VITE_BING_IMAGE_API_KEY=your_bing_search_key
VITE_GOOGLE_API_KEY=your_google_api_key

# Free sources only mode
VITE_USE_FREE_SOURCES_ONLY=false
```

## Docker Services

### Development Service (`realitycheck-dev`)
- **Purpose**: Local development with hot reload
- **Port**: 5173
- **Features**: 
  - Live code reloading
  - Source maps for debugging
  - Development optimizations
  - Volume mounting for instant updates

### Production Service (`realitycheck-prod`)
- **Purpose**: Production build testing
- **Port**: 3000
- **Features**:
  - Optimized build bundle
  - Nginx static file serving
  - Production environment simulation
  - Gzip compression

### Redis Service (`redis`)
- **Purpose**: Optional caching layer
- **Port**: 6379
- **Features**:
  - API response caching
  - Session storage
  - Performance optimization

## Troubleshooting

### 1. Build Failures

```bash
# Clean Docker cache
docker system prune -f

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

### 2. Port Conflicts

If ports 5173 or 3000 are in use, modify the docker-compose.dev.yml file:

```yaml
ports:
  - "5174:5173"  # Change external port
```

### 3. Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve

# Check Docker network connectivity
docker exec -it <container_name> curl http://host.docker.internal:11434/api/tags
```

### 4. Volume Mount Issues (Windows)

For Windows users, ensure Docker Desktop has access to your drive:
1. Open Docker Desktop
2. Go to Settings > Resources > File Sharing
3. Add your project directory

### 5. Hot Reload Not Working

```bash
# Enable polling for file changes
CHOKIDAR_USEPOLLING=true npm run docker:dev
```

## Performance Optimization

### 1. Docker Layer Caching

The Dockerfile is optimized for layer caching:
- Dependencies are installed before copying source code
- Only rebuilds when package.json changes

### 2. Development Performance

```bash
# Use bind mounts for faster file access
docker-compose -f docker-compose.dev.yml up --build
```

### 3. Production Optimization

```bash
# Multi-stage build reduces final image size
# Nginx serves static files efficiently
# Gzip compression enabled
```

## Security Considerations

### 1. Environment Variables
- Never commit real API keys to version control
- Use `.env` files for local development
- Use Docker secrets for production

### 2. Network Security
```bash
# Ollama runs on localhost only by default
# Docker containers use internal networking
# Nginx configured with security headers
```

### 3. File Permissions
```bash
# Ensure proper file permissions
chmod +x docker-setup.sh  # If using setup scripts
```

## Advanced Configuration

### 1. Custom Nginx Configuration

Edit `nginx.conf` for custom routing or headers:

```nginx
# Add custom headers
add_header X-Custom-Header "RealityCheck-AI";

# Custom proxy settings
location /api/ {
    proxy_pass http://your-api-server;
}
```

### 2. Multi-Environment Setup

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Staging
docker-compose -f docker-compose.staging.yml up

# Production
docker-compose -f docker-compose.prod.yml up
```

### 3. Health Checks

Add health checks to docker-compose.dev.yml:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5173"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f realitycheck-dev

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100
```

### Monitor Resources

```bash
# Container stats
docker stats

# System usage
docker system df
```

## Backup and Data

### Redis Data Backup

```bash
# Backup Redis data
docker exec redis redis-cli BGSAVE
docker cp redis:/data/dump.rdb ./backup/

# Restore Redis data
docker cp ./backup/dump.rdb redis:/data/
docker-compose restart redis
```

### Volume Management

```bash
# List volumes
docker volume ls

# Remove unused volumes
docker volume prune
```

## Support

For issues:
1. Check Docker and Docker Compose versions
2. Verify Ollama is running and accessible
3. Check environment variable configuration
4. Review Docker logs for error messages
5. Ensure sufficient disk space and memory

---

**Happy coding with RealityCheck AI!** 🚀