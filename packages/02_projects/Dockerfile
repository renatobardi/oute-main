# 02 Projects
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json package-lock.json tsconfig.json .eslintrc.json .prettierrc ./
COPY packages/02_projects ./packages/02_projects
COPY packages/design-system ./packages/design-system
COPY shared ./shared

# Install dependencies
RUN npm install --legacy-peer-deps

# Build design-system first (dist/ is gitignored)
WORKDIR /app/packages/design-system
RUN npm run build

# Build
WORKDIR /app/packages/02_projects
RUN npm run build

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/02_projects/package.json ./packages/02_projects/
COPY shared ./shared

# Install production dependencies only
RUN npm ci --legacy-peer-deps --omit=dev && npm cache clean --force

# Copy built app
COPY --from=builder /app/packages/02_projects/build ./packages/02_projects/build

EXPOSE 3005

ENV NODE_ENV=production
ENV PORT=3005

CMD ["node", "packages/02_projects/build/index.js"]
