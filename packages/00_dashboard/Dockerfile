# 00 Dashboard
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json package-lock.json tsconfig.json .eslintrc.json .prettierrc ./
COPY packages/00_dashboard ./packages/00_dashboard
COPY packages/design-system ./packages/design-system
COPY shared ./shared

# Install dependencies
RUN npm install --legacy-peer-deps

# Build
WORKDIR /app/packages/00_dashboard
RUN npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/00_dashboard/package.json ./packages/00_dashboard/
COPY shared ./shared

# Install production dependencies only
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

# Copy built app from builder
COPY --from=builder /app/packages/00_dashboard/build ./packages/00_dashboard/build

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Run the SvelteKit Node server
CMD ["node", "packages/00_dashboard/build/index.js"]
