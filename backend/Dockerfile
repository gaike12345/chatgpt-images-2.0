FROM node:20-alpine
WORKDIR /app

# Copy dependency files first (layer cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy pre-built dist (build happens locally before deploy)
COPY dist/ ./dist/

# Railway provides PORT env var; our app reads process.env.PORT
# EXPOSE is documentation only; Railway uses PORT env var
EXPOSE 8080

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
