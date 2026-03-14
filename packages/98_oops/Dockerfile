# 98 Oops - 404 Not Found Page
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json package-lock.json tsconfig.json ./
COPY packages/98_oops ./packages/98_oops
COPY packages/design-system ./packages/design-system

# Install dependencies
RUN npm install --legacy-peer-deps

# Build
WORKDIR /app/packages/98_oops
RUN npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/98_oops/package.json ./packages/98_oops/

# Install production dependencies only
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

# Copy built app from builder
COPY --from=builder /app/packages/98_oops/build ./packages/98_oops/build

EXPOSE 3004

ENV NODE_ENV=production
ENV PORT=3004

# Run the SvelteKit Node server
CMD ["node", "packages/98_oops/build/index.js"]
