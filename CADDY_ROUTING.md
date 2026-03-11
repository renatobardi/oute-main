# Caddy Reverse Proxy Configuration for Production

This document describes how Caddy should be configured to route traffic for the OUTE monorepo in production.

## Overview

The OUTE application consists of 5 main services running on the VM at `34.132.93.171`:

| Service | Internal Port | Purpose |
|---------|---------------|---------|
| **99_home** | 3003 | Landing page (root `/`) |
| **03_interview** | 3002 | Chat interface (`/chat`) |
| **00_dashboard** | 3000 | Main dashboard (default fallback) |
| **01_auth-profile** | 3001 | Authentication API (`/api/auth/*`) |
| **02_projects** | 3022 (prod) | Projects API (`/api/projects/*`) |

## Required Caddy Configuration

The Caddy reverse proxy (located in `~/oute-mind/Caddyfile`) should be configured as follows:

```caddyfile
# OUTE Production Routing Configuration

# Root domain routing
34.132.93.171 {
  # Landing page at root
  @root path /
  handle @root {
    reverse_proxy localhost:3003
  }

  # Chat interface
  @chat path /chat*
  handle @chat {
    reverse_proxy localhost:3002
  }

  # Auth API endpoints
  @auth path /api/auth*
  handle @auth {
    reverse_proxy localhost:3001
  }

  # Projects API endpoints
  @projects path /api/projects*
  handle @projects {
    reverse_proxy localhost:3022
  }

  # Default fallback to Dashboard
  handle {
    reverse_proxy localhost:3000
  }

  # CORS headers for cross-origin requests
  header * {
    Access-Control-Allow-Origin "34.132.93.171"
    Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers "Content-Type, Authorization"
    Access-Control-Allow-Credentials "true"
  }

  # Logging
  log {
    output stdout
    format json
  }
}

# HTTPS support (when TLS is configured)
# https://34.132.93.171 {
#   # Same configuration as above
# }

# Health check endpoints (for monitoring)
# These should NOT be proxied, just return 200 OK
34.132.93.171/health {
  respond 200
}
```

## Routing Logic

### Request Flow

```
Client Request (34.132.93.171)
    ↓
Caddy Reverse Proxy (Port 80)
    ↓
    ├─→ /                  → localhost:3003 (99_home - Landing Page)
    ├─→ /chat              → localhost:3002 (03_interview - Chat)
    ├─→ /api/auth/*        → localhost:3001 (01_auth-profile - Auth API)
    ├─→ /api/projects/*    → localhost:3022 (02_projects - Projects API)
    └─→ /* (default)       → localhost:3000 (00_dashboard - Main App)
```

## User Journey

1. **User visits `34.132.93.171/`**
   - Caddy routes to `localhost:3003` (99_home)
   - Landing page loads with hero, CTA, stats

2. **User clicks "Entrar na Oute" (CTA)**
   - Redirects to `/login`
   - Still served by 99_home (3003)

3. **User submits login form**
   - Frontend calls `POST 34.132.93.171/api/auth?action=login`
   - Caddy routes to `localhost:3001` (01_auth-profile)
   - Login API processes credentials, returns JWT

4. **User redirected to `/chat` after login**
   - Caddy routes to `localhost:3002` (03_interview)
   - Chat interface loads with authentication

5. **User interacts with chat**
   - All API calls go through Caddy routing
   - Auth tokens are validated by 01_auth-profile

## Implementation Steps

### On the VM (`oute-mind` repository)

1. **Update `Caddyfile`** with the configuration above
2. **Reload Caddy**:
   ```bash
   cd ~/oute-mind
   docker compose up -d caddy
   ```

3. **Test routing**:
   ```bash
   # Test each endpoint
   curl http://localhost:34.132.93.171/
   curl http://localhost:34.132.93.171/chat
   curl http://localhost:34.132.93.171/api/auth/status
   ```

## Health Checks

Each service exposes a `/health` endpoint:

```bash
curl http://localhost:3003/health  # 99_home
curl http://localhost:3002/health  # 03_interview
curl http://localhost:3000/health  # 00_dashboard
curl http://localhost:3001/health  # 01_auth-profile
curl http://localhost:3022/health  # 02_projects
```

## Environment Variables for Services

Each service reads environment variables from `.env.production`:

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

### 01_auth-profile (.env.production)
```
DATABASE_URL=postgresql://app-user:password@postgres:5432/oute_db
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

### 02_projects (.env.production)
```
DATABASE_URL=postgresql://app-user:password@postgres:5432/oute_db
AUTH_SERVICE_URL=http://01_auth-profile:3001
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

## Troubleshooting

### Issue: "API at root instead of landing page"

**Cause**: Caddy routing not configured correctly, or wrong container is set as default handler.

**Solution**:
1. Verify `Caddyfile` has root path pattern for 99_home (3003)
2. Check Caddy logs: `docker compose logs caddy`
3. Ensure 99_home is running: `docker compose ps`

### Issue: "CORS errors when calling `/api/auth`"

**Cause**: CORS headers not set or origin mismatch.

**Solution**:
1. Check `01_auth-profile/src/hooks.server.ts` has CORS middleware
2. Verify Caddy is passing CORS headers
3. Ensure `VITE_AUTH_SERVICE_URL` matches production domain

### Issue: "Chat not loading after login"

**Cause**: JWT not being passed from 99_home to 03_interview, or routing issue.

**Solution**:
1. Check browser console for JWT storage
2. Verify `/chat` route is routed to 03_interview (3002)
3. Check network tab for auth failures

## Monitoring

Monitor service health in production:

```bash
# SSH to VM
ssh ubuntu@34.132.93.171

# Check all containers
cd ~/oute-mind
docker compose ps

# Check specific service logs
docker compose logs -f 99_home
docker compose logs -f 03_interview
docker compose logs -f 01_auth-profile

# Test endpoint availability
curl -v http://localhost:3003/health
curl -v http://localhost:3002/health
curl -v http://localhost:3001/health
```

## Notes

- All internal service communication uses Docker DNS (e.g., `http://01_auth-profile:3001`)
- Frontend services use environment variables pointing to the public domain (`http://34.132.93.171`)
- This configuration supports both HTTP and HTTPS (when TLS is configured)
- Caddy auto-renews SSL certificates if HTTPS is enabled
