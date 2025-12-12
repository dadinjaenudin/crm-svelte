# =============================================================================
# Backend Dockerfile - Node.js Express API
# =============================================================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

LABEL maintainer="CRM Team"
LABEL description="CRM Backend API - Build Stage"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production + dev for building)
RUN npm ci --include=dev

# Copy source code
COPY . .

# =============================================================================
# Stage 2: Production stage
FROM node:20-alpine

LABEL maintainer="CRM Team"
LABEL description="CRM Backend API - Production"

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy source code from builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/database ./database

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R node:node /app

# Security: Run as non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production \
    PORT=3001

# Start application
CMD ["node", "src/server.js"]
