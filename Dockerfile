# -----------------------------------------------------------------------------
# Dockerfile.bun (Next.js + Bun, with build-time NEXT_PUBLIC_* injection)
# -----------------------------------------------------------------------------

# 0) Base image
FROM oven/bun:1 AS base
WORKDIR /app

# 1) Install deps
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --no-save --frozen-lockfile

# 2) Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next telemetry at build
ENV NEXT_TELEMETRY_DISABLED=1

# ----- Build-time PUBLIC envs (compiled into client bundle) -----
# Pass these via --build-arg when building the image.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NUMBER
ARG NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NAME
# Optional: expose your R2 CDN base to client (rename or remove if not needed)
ARG NEXT_PUBLIC_R2_BASE_URL

# Make them visible to the build
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NUMBER=$NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NUMBER
ENV NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NAME=$NEXT_PUBLIC_PROMPTPAY_ACCOUNT_NAME
ENV NEXT_PUBLIC_R2_BASE_URL=$NEXT_PUBLIC_R2_BASE_URL

# Build the Next.js app (standalone output)
RUN bun run build

# 3) Runtime
FROM base AS runner
WORKDIR /app

# Disable telemetry at runtime (optional)
# ENV NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Static assets
COPY --from=builder /app/public ./public

# Standalone runtime (tiny image + no install needed)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Next.js standalone emits server.js in the root of standalone
CMD ["bun", "./server.js"]
