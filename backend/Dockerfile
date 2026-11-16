# ==============================================================================
# Strapi v5 Blog Backend Dockerfile
# Pre-installs SQLite, PostgreSQL, and MySQL drivers so users can switch DB via .env
# ==============================================================================
FROM node:24-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .

ENV NODE_ENV=production
# Build Strapi Admin panel & TypeScript server, then strip devDependencies
RUN npm run build && npm prune --omit=dev

# ------------------------------------------------------------------------------
# Production runtime stage
# ------------------------------------------------------------------------------
FROM node:24-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips42 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/data /app/public/uploads

EXPOSE 1337

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
