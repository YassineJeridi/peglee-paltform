# --- Build du frontend ---
FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Dépendances serveur (production uniquement) ---
FROM node:22-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

# --- Image finale ---
FROM node:22-alpine
ENV NODE_ENV=production SERVE_CLIENT=true PORT=5001
WORKDIR /app
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY docs/ ./docs/
COPY --from=client-build /app/client/dist ./client/dist
RUN mkdir -p server/uploads && chown -R node:node /app/server/uploads
USER node
EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:5001/api/health || exit 1
CMD ["node", "server/src/server.js"]
