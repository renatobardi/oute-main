# 03 Interview - Chat Interface
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json package-lock.json tsconfig.json .eslintrc.json .prettierrc ./
COPY packages/03_interview ./packages/03_interview
COPY packages/design-system ./packages/design-system
COPY shared ./shared

# Install dependencies
RUN npm install --legacy-peer-deps

# Build
WORKDIR /app/packages/03_interview
RUN npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/03_interview/package.json ./packages/03_interview/

# Install production dependencies only
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

# Copy built app from builder
COPY --from=builder /app/packages/03_interview/build ./packages/03_interview/build

EXPOSE 3002

ENV NODE_ENV=production
ENV PORT=3002

# Run the SvelteKit Node server
CMD ["node", "packages/03_interview/build/index.js"]
