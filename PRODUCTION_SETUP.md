# Production Setup Guide for 99_home and 03_interview

This document provides instructions for deploying 99_home (landing page) and 03_interview (chat) to production at `34.132.93.171`.

## Overview

The OUTE monorepo has 5 main services, but they are managed in **two separate repositories**:

### Services in `oute-main` (source code)
- **00_dashboard** - Main dashboard (SvelteKit)
- **01_auth-profile** - Auth API (Backend)
- **02_projects** - Projects API (Backend)
- **99_home** - Landing page (SvelteKit) ⭐ NEW
- **03_interview** - Chat interface (SvelteKit) ⭐ NEW

### Deployment Location: `oute-mind` repository
The actual Docker Compose configuration and deployment happens in `~/oute-mind`, which is a separate repository that orchestrates all services.

---

## Current Deployment Status

### ✅ Already Deployed (via GitHub Actions)
```
00_dashboard → Internal port 3000 (accessed via Caddy at /dashboard)
01_auth-profile → Internal port 3001 (accessed via Caddy at /api/auth)
02_projects → Internal port 3002 (accessed via Caddy at /api/projects)
```

### ⏳ Need Manual Setup in oute-mind
```
99_home → Internal port 3003 (accessed via Caddy at /)
03_interview → Internal port 3002 (accessed via Caddy at /chat)
```

> **Note**: All services use `expose` (internal Docker network only). No host port mappings. All external access goes through Caddy on port 80.

---

## How to Add 99_home and 03_interview to Production

Since these services are **not yet in `~/oute-mind/docker-compose.yml`**, you need to manually add them.

### Step 1: SSH to the VM

```bash
gcloud compute ssh oute-mind --zone=us-central1-a
cd ~/oute-mind
```

### Step 2: Update docker-compose.yml

Add the following services to `docker-compose.yml`:

```yaml
  99_home:
    build:
      context: ../oute-main
      dockerfile: packages/99_home/Dockerfile
    container_name: oute-home
    expose:
      - '3003'
    environment:
      - NODE_ENV=production
      - VITE_AUTH_SERVICE_URL=http://34.132.93.171
      - VITE_API_TIMEOUT=30000
    networks:
      - oute-network
    depends_on:
      - caddy

  03_interview:
    build:
      context: ../oute-main
      dockerfile: packages/03_interview/Dockerfile
    container_name: oute-interview
    expose:
      - '3002'
    environment:
      - NODE_ENV=production
      - VITE_AUTH_SERVICE_URL=http://34.132.93.171
      - VITE_API_TIMEOUT=30000
    networks:
      - oute-network
    depends_on:
      - caddy
```

### Step 3: Update Caddyfile

Add routing rules for the new services to `Caddyfile`:

```caddyfile
# Root domain routing
34.132.93.171 {
  # Landing page at root
  @root path /
  handle @root {
    reverse_proxy http://oute-home:3003
  }

  # Chat interface
  @chat path /chat*
  handle @chat {
    reverse_proxy http://oute-interview:3002
  }

  # Auth API endpoints
  @auth path /api/auth*
  handle @auth {
    reverse_proxy http://01_auth-profile:3001
  }

  # Projects API endpoints
  @projects path /api/projects*
  handle @projects {
    reverse_proxy http://02_projects:3002
  }

  # Default fallback to Dashboard
  handle {
    reverse_proxy http://00_dashboard:3000
  }

  # CORS headers
  header * {
    Access-Control-Allow-Origin "34.132.93.171"
    Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers "Content-Type, Authorization"
    Access-Control-Allow-Credentials "true"
  }

  log {
    output stdout
    format json
  }
}
```

### Step 4: Build and Deploy

```bash
# From ~/oute-mind directory
cd ~/oute-mind

# Build the new services
docker compose build 99_home 03_interview

# Start the services
docker compose up -d 99_home 03_interview

# Reload Caddy to apply routing rules
docker compose up -d caddy

# Check status
docker compose ps
```

### Step 5: Verify Deployment

```bash
# Test via Caddy (recommended - services are not exposed on host ports)
curl http://localhost/
curl http://localhost/chat

# Test via docker exec (if Caddy is down)
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-interview curl -sf http://localhost:3002/health

# Check Caddy logs
docker compose logs -f caddy
```

---

## Dockerfile Location

Both Dockerfiles are committed to `oute-main`:
- `packages/99_home/Dockerfile`
- `packages/03_interview/Dockerfile`

These are automatically built when referenced in `docker-compose.yml` with the correct context path.

---

## Environment Variables

### 99_home (.env.production)
```
VITE_AUTH_SERVICE_URL=http://34.132.93.171
VITE_API_TIMEOUT=30000
VITE_ENV=production
```

### 03_interview (.env.production)
```
VITE_AUTH_SERVICE_URL=http://34.132.93.171
VITE_API_TIMEOUT=30000
VITE_ENV=production
```

These are already configured in `oute-main`, but if you rebuild, ensure these values are passed correctly.

---

## Troubleshooting

### Issue: Build fails with "Dockerfile not found"

**Solution**: Ensure the context path is correct in docker-compose.yml:
```yaml
build:
  context: ../oute-main  # Relative path from ~/oute-mind to ~/oute-main
  dockerfile: packages/99_home/Dockerfile
```

### Issue: Port 3002 or 3003 already in use

**Solution**: Check what's using the port:
```bash
# List processes using the port
sudo lsof -i :3002
sudo lsof -i :3003

# Kill if necessary (use carefully)
docker stop oute-interview
docker rm oute-interview
```

### Issue: Services won't start (unhealthy)

**Solution**: Check logs:
```bash
docker compose logs 99_home
docker compose logs 03_interview
```

Common issues:
- Missing environment variables
- Port conflicts
- Database connectivity issues
- Network configuration

### Issue: Caddy not routing to new services

**Solution**: Reload Caddy configuration:
```bash
docker compose up -d caddy  # Reloads the configuration

# Verify Caddy config
docker compose logs caddy | grep -i route
```

---

## Full User Journey After Setup

1. **User visits http://34.132.93.171/**
   - Caddy routes to `http://oute-home:3003` (99_home)
   - Landing page loads with hero, CTA, stats

2. **User clicks "Entrar na Oute"**
   - Navigates to `/login` (still served by 99_home)

3. **User logs in**
   - Frontend calls `POST /api/auth?action=login`
   - Caddy routes to `http://01_auth-profile:3001`
   - JWT token returned and stored

4. **User redirected to `/chat`**
   - Caddy routes to `http://oute-interview:3002` (03_interview)
   - Chat interface loads with authentication

---

## Deployment Automation

The GitHub Actions workflow in `oute-main/.github/workflows/deploy-to-vm.yml` automatically deploys:
- 00_dashboard
- 01_auth-profile
- 02_projects

It does **NOT** automatically deploy 99_home and 03_interview because they need to be configured in the separate `oute-mind` repository.

### To Automate Future Deployments

If you want to automate 99_home and 03_interview deployment in the future:

1. Update `~/oute-mind` workflow to also build and deploy these services
2. OR modify `oute-main` workflow to include steps for updating `oute-mind/docker-compose.yml`
3. OR use a unified CI/CD system that manages both repositories

---

## Docker Image Building

The build process:
1. GitHub Actions pushes to `oute-main`
2. VM pulls latest `oute-main` code
3. `docker-compose.yml` references Dockerfiles from `oute-main`
4. `docker compose build` runs the multi-stage build:
   - Stage 1: Build the app with Node.js 20
   - Stage 2: Minimal runtime with only production dependencies

Build time: ~3-5 minutes per service depending on network and disk speed.

---

## Health Checks

Each service has a `/health` endpoint:

```bash
# Via Caddy reverse proxy (recommended - ports not exposed on host)
curl http://34.132.93.171/health
curl http://34.132.93.171/dashboard/health
curl http://34.132.93.171/api/auth/health
curl http://34.132.93.171/api/projects/health

# Via docker exec (if Caddy is down or for debugging)
docker exec oute-dashboard curl -sf http://localhost:3000/health
docker exec oute-auth curl -sf http://localhost:3001/health
docker exec oute-interview curl -sf http://localhost:3002/health
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-projects curl -sf http://localhost:3002/health
```

---

## Next Steps

1. ✅ Code is ready in `oute-main`
2. ✅ Dockerfiles created
3. 📋 **YOU ARE HERE**: Configure in `oute-mind` repository
4. 🚀 Test in production
5. 📊 Monitor health and logs

Once you complete Step 3 in `oute-mind`, the full integration will be complete!
