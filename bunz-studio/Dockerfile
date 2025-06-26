# Use the official Node.js 18 Alpine image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxt -u 1001

# Copy built application
COPY --from=base --chown=nuxt:nodejs /app/.output /app/.output

# Switch to non-root user
USER nuxt

# Expose port
EXPOSE 3000

# Set environment
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]