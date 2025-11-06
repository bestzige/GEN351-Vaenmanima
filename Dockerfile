##### DEPENDENCIES
FROM --platform=linux/amd64 node:21.5.0-alpine3.18 AS deps
WORKDIR /app

# System deps needed for native builds (sharp, prisma engines, etc.)
RUN apk add --no-cache libc6-compat python3 make g++ git

# Copy manifest + lockfiles only for better Docker cache
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install deps based on the detected lockfile
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && corepack prepare pnpm@latest --activate && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### BUILDER
FROM --platform=linux/amd64 node:21.5.0-alpine3.18 AS builder
WORKDIR /app

# Ensure native deps exist here as well (some packages build during postinstall)
RUN apk add --no-cache libc6-compat python3 make g++ git

# Build-time args (avoid hard failing on env validation)
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG NEXTAPP_URL

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# If you use Prisma, make sure schema is present (usually already copied above)
# RUN npx prisma generate  # optional if your install didn't run it

# Build (skip strict env validation at build time)
RUN \
  if [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn db:deploy && yarn build; \
  elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm run db:deploy && npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && corepack prepare pnpm@latest --activate && SKIP_ENV_VALIDATION=1 pnpm run db:deploy && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi


##### RUNNER
FROM --platform=linux/amd64 node:21.5.0-alpine3.18 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Needed by sharp/Prisma on Alpine
RUN apk add --no-cache libc6-compat

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy minimal runtime artifacts
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
# .next/standalone contains node_modules, server.js, and the compiled app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# static assets served by Next
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Next.js standalone starts from server.js at repo root (copied by the line above)
CMD ["node", "server.js"]