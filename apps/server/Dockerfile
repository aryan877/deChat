#
# 1) Base image
#
FROM node:20-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    pkg-config \
    libudev-dev \
    libusb-1.0-0-dev \
    && rm -rf /var/lib/apt/lists/*

# Set up non-root user and directories
RUN useradd -m -s /bin/bash nodeapp
ENV NPM_CONFIG_PREFIX=/home/nodeapp/.npm-global
ENV PATH=$PATH:/home/nodeapp/.npm-global/bin
ENV HOME=/home/nodeapp

# Set up directories and permissions
RUN mkdir -p /home/nodeapp/.npm-global /app && \
    chown -R nodeapp:nodeapp /home/nodeapp /app

# Switch to non-root user
USER nodeapp

# Install global packages
RUN npm install -g pnpm@9.15.0 turbo@2.3.3

#
# 2) Pruner
#
FROM base AS pruner
WORKDIR /app
COPY --chown=nodeapp:nodeapp . .
RUN turbo prune server --docker

#
# 3) Builder
#
FROM base AS builder
WORKDIR /app
ENV PYTHON=/usr/bin/python3

# Copy package.json files and workspace config
COPY --from=pruner --chown=nodeapp:nodeapp /app/out/json/ .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code for all packages
COPY --from=pruner --chown=nodeapp:nodeapp /app/out/full/ .

# Build all packages
RUN pnpm turbo run build --filter=server

#
# 4) Runner - Final stage that will run the application
#
FROM base AS runner
WORKDIR /app

# Copy package.json files and workspace config
COPY --from=pruner --chown=nodeapp:nodeapp /app/out/json/ .

# Copy only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder --chown=nodeapp:nodeapp /app/apps/server/dist /app/apps/server/dist
COPY --from=builder --chown=nodeapp:nodeapp /app/packages /app/packages

# Set default environment variables
ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

# Simple healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]