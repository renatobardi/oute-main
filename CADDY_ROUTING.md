# Caddy Reverse Proxy Configuration for Production

This document describes how Caddy should be configured to route traffic for the OUTE monorepo in production.

## Overview

The OUTE application consists of 6 main services running on the VM at `34.132.93.171`:

| Service | Internal Port | Purpose |
|---------|---------------|---------|
| **99_home** | 3003 | Landing page (root `/`) |
| **03_interview** | 3002 | Chat interface (`/chat`) |
| **98_oops** | 3004 | 404 not found page (default fallback) |
| **00_dashboard** | 3000 | Main dashboard |
| **01_auth-profile** | 3001 | Authentication API (`/api/auth/*`) |
| **02_projects** | 3002 | Projects API (`/api/projects/*`) |

## Required Caddy Configuration

The Caddy reverse proxy (located in `~/oute-mind/Caddyfile`) should be configured as follows:

```caddyfile
# OUTE Production Routing Configuration
# Caddy uses Docker DNS to resolve container names within the oute-network.
# Services use `expose` (not `ports`), so they are only reachable via the Docker network.

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

  # Default fallback to 404 Oops page
  handle {
    reverse_proxy http://oute-oops:3004
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
```

## Routing Logic

### Request Flow

```
Client Request (34.132.93.171)
    ↓
Caddy Reverse Proxy (Port 80 on host)
    ↓  (routes to containers via Docker internal network)
    ├─→ /                  → http://oute-home:3003 (99_home - Landing Page)
    ├─→ /chat              → http://oute-interview:3002 (03_interview - Chat)
    ├─→ /api/auth/*        → http://01_auth-profile:3001 (Auth API)
    ├─→ /api/projects/*    → http://02_projects:3002 (Projects API)
    └─→ /* (default)       → http://oute-oops:3004 (404 Oops Page)
```

## User Journey

1. **User visits `34.132.93.171/`**
   - Caddy routes to `http://oute-home:3003` (99_home)
   - Landing page loads with hero, CTA, stats

2. **User clicks "Entrar na Oute" (CTA)**
   - Redirects to `/login`
   - Still served by 99_home (3003)

3. **User submits login form**
   - Frontend calls `POST 34.132.93.171/api/auth?action=login`
   - Caddy routes to `http://01_auth-profile:3001`
   - Login API processes credentials, returns JWT

4. **User redirected to `/chat` after login**
   - Caddy routes to `http://oute-interview:3002` (03_interview)
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
   # Test each endpoint (via Caddy on port 80)
   curl http://localhost/
   curl http://localhost/chat
   curl http://localhost/api/auth/status
   ```

## Health Checks

Each service exposes a `/health` endpoint:

```bash
# Via Caddy (recommended - service ports are not exposed on host)
curl http://localhost/health
curl http://localhost/dashboard/health
curl http://localhost/api/auth/health
curl http://localhost/api/projects/health

# Via docker exec (for debugging when Caddy is down)
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-interview curl -sf http://localhost:3002/health
docker exec oute-dashboard curl -sf http://localhost:3000/health
docker exec oute-auth curl -sf http://localhost:3001/health
docker exec oute-projects curl -sf http://localhost:3002/health
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
gcloud compute ssh oute-mind --zone=us-central1-a

# Check all containers
cd ~/oute-mind
docker compose ps

# Check specific service logs
docker compose logs -f 99_home
docker compose logs -f 03_interview
docker compose logs -f 01_auth-profile

# Test endpoint availability (via docker exec, ports not exposed on host)
docker exec oute-home curl -sf http://localhost:3003/health
docker exec oute-interview curl -sf http://localhost:3002/health
docker exec oute-auth curl -sf http://localhost:3001/health
```

## Notes

- All internal service communication uses Docker DNS (e.g., `http://01_auth-profile:3001`)
- Frontend services use environment variables pointing to the public domain (`http://34.132.93.171`)
- This configuration supports both HTTP and HTTPS (when TLS is configured)
- Caddy auto-renews SSL certificates if HTTPS is enabled
