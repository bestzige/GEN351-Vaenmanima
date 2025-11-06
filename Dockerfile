# 1) Build stage
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Better caching for node_modules
RUN corepack enable || true

# Copy only files needed for deps
COPY package.json package-lock.json ./
# If you actually use pnpm or yarn, swap to that (see Option C below)
RUN npm ci

# Copy source
COPY . .

# Build-time public env (optional)
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# 2) Runtime with Next.js standalone output (no re-install!)
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# If you use Next.js "output: 'standalone'", copy the minimal runtime
# Otherwise copy .next + node_modules (see comments below)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]