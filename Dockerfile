# Base Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# -----------------------------
# deps: install node_modules
# -----------------------------
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --no-save --frozen-lockfile

# -----------------------------
# builder: compile Next.js app
# -----------------------------
FROM base AS builder
WORKDIR /app

# Bring node_modules
COPY --from=deps /app/node_modules ./node_modules
# Bring source
COPY . .

# ---- Build-time public envs (client bundle) ----
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NUMBER
ARG NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NAME

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NUMBER=$NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NUMBER \
    NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NAME=$NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NAME

# Build (Next.js "standalone" output)
RUN bun run build

# -----------------------------
# runner: minimal runtime image
# -----------------------------
FROM base AS runner
WORKDIR /app

# Runtime defaults (override via `docker run --env-file` as needed)
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Public assets
COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["bun", "server.js"]