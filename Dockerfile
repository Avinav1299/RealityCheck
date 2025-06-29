# Multi-stage build for production deployment
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Fix permissions on built files before copying to final stage
RUN chmod -R 755 /app/dist

# Production stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage with explicit permissions
COPY --from=builder --chown=nginx:nginx --chmod=755 /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Ensure all files have correct permissions
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    # Ensure nginx can read the config
    chmod 644 /etc/nginx/nginx.conf && \
    # Create runtime directories with proper permissions
    mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx && \
    # Create log files with proper permissions
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log && \
    chown nginx:nginx /var/log/nginx/access.log && \
    chown nginx:nginx /var/log/nginx/error.log && \
    chmod 644 /var/log/nginx/access.log && \
    chmod 644 /var/log/nginx/error.log && \
    # Create PID file with proper permissions
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid && \
    chmod 644 /var/run/nginx.pid

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx (must run as root to bind to port 80)
CMD ["nginx", "-g", "daemon off;"]