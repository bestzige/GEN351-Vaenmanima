# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Use exactly one of the following according to your project
RUN npm ci

# Copy source
COPY . .

# ---- Build-time env (only if you need to inject NEXT_PUBLIC_* at build) ----
# ARGs are available at build-time; they won’t persist to runtime.
# Example:
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# 2) Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install prod deps only
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/next.config.js ./next.config.js
# If you use standalone output, copy /.next/standalone and /.next/static instead.

EXPOSE 3000
# Next.js default start
CMD ["npm", "start"]