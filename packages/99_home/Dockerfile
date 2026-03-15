# 99 Home - Landing Page
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json package-lock.json tsconfig.json .eslintrc.json .prettierrc ./
COPY packages/99_home ./packages/99_home
COPY packages/design-system ./packages/design-system
COPY shared ./shared

# Install dependencies
RUN npm install --legacy-peer-deps

# Build design-system first (dist/ is gitignored)
WORKDIR /app/packages/design-system
RUN npm run build

# Build
WORKDIR /app/packages/99_home
RUN npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/99_home/package.json ./packages/99_home/

# Install production dependencies only
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

# Copy built app from builder
COPY --from=builder /app/packages/99_home/build ./packages/99_home/build

EXPOSE 3003

ENV NODE_ENV=production
ENV PORT=3003

# Run the SvelteKit Node server
CMD ["node", "packages/99_home/build/index.js"]
