# Stage 1: Build environment
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10.11.0

WORKDIR /workspace

# Copy workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./

# Copy the shared library and the frontend application
COPY libs/ui/ ./libs/ui/
COPY apps/llm-knowledge-graph/ ./apps/llm-knowledge-graph/

# Install dependencies (including those for building libs/ui and next.js app)
RUN pnpm install --frozen-lockfile

# Build the Next.js app (Nx will build dependency libs/ui automatically)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm nx build @shekara-dev/llm-knowledge-graph --prod

# Stage 2: Runner environment
FROM node:20-alpine AS runner
RUN npm install -g pnpm@10.11.0
WORKDIR /workspace

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Copy build artifacts and package configs from builder
COPY --from=builder /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml /workspace/nx.json /workspace/tsconfig.base.json ./
COPY --from=builder /workspace/libs/ui/ ./libs/ui/
COPY --from=builder /workspace/apps/llm-knowledge-graph/ ./apps/llm-knowledge-graph/
COPY --from=builder /workspace/node_modules/ ./node_modules/

# Expose port
EXPOSE 3000

# Start command
CMD ["pnpm", "nx", "start", "@shekara-dev/llm-knowledge-graph"]
