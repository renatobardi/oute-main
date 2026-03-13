# 🚀 Production Setup - Quick Start

Complete instructions to deploy 99_home and 03_interview to production at `34.132.93.171`.

## Prerequisites

- SSH access to VM at `ubuntu@34.132.93.171`
- Both `oute-main` and `oute-mind` repositories cloned in home directory:
  ```
  ~/oute-main/      (this repo)
  ~/oute-mind/      (production orchestration)
  ```

---

## Quick Setup (3 Scripts)

### Step 1: SSH to VM

```bash
ssh ubuntu@34.132.93.171
```

### Step 2: Navigate to oute-mind

```bash
cd ~/oute-mind
```

### Step 3: Copy scripts from oute-main

```bash
cp ../oute-main/setup-production.sh .
cp ../oute-main/update-caddyfile.sh .
cp ../oute-main/test-production.sh .
chmod +x setup-production.sh update-caddyfile.sh test-production.sh
```

### Step 4: Run setup script

This adds 99_home and 03_interview to docker-compose.yml and builds the services:

```bash
./setup-production.sh
```

**What it does:**
- ✅ Backs up docker-compose.yml
- ✅ Adds 99_home service (port 3003)
- ✅ Adds 03_interview service (port 3002)
- ✅ Builds Docker images
- ✅ Starts services
- ✅ Reloads Caddy

**Time:** ~5 minutes

### Step 5: Update Caddyfile

This configures the reverse proxy routing rules:

```bash
./update-caddyfile.sh
```

**What it does:**
- ✅ Backs up Caddyfile
- ✅ Configures routing for root (/) → 99_home
- ✅ Configures routing for /chat → 03_interview
- ✅ Keeps existing API routing (/api/auth, /api/projects)
- ✅ Reloads Caddy with new configuration

**Time:** ~30 seconds

### Step 6: Test deployment

Verify everything is working:

```bash
./test-production.sh
```

**Expected output:**
```
✅ 99_home health
✅ 03_interview health
✅ 01_auth-profile health
✅ 00_dashboard health
✅ 02_projects health
✅ Caddy health
✅ Root path (/)
✅ Chat path (/chat)
✅ Auth API (/api/auth)

🎉 All tests passed! Production is ready.
```

---

## Manual Verification

If scripts don't work or you need to debug:

### Check container status
```bash
cd ~/oute-mind
docker compose ps
```

### View logs
```bash
# 99_home logs
docker compose logs -f 99_home

# 03_interview logs
docker compose logs -f 03_interview

# Caddy logs
docker compose logs -f caddy
```

### Test endpoints manually
```bash
# Direct service
curl http://localhost:3003/health
curl http://localhost:3002/health

# Via Caddy
curl http://localhost/health
curl http://34.132.93.171/
curl http://34.132.93.171/chat
```

---

## Troubleshooting

### Services won't start

**Check logs:**
```bash
docker compose logs 99_home
docker compose logs 03_interview
```

**Common issues:**
- ❌ Build failed: Check if Dockerfiles exist in `../oute-main/packages/99_home/Dockerfile`
- ❌ Port already in use: Check `docker compose ps` and `sudo lsof -i :3003`
- ❌ Out of disk space: Check `df -h`

### Routing not working

**Check Caddyfile:**
```bash
cat Caddyfile | grep -A 5 "@root"
```

**Reload Caddy:**
```bash
docker compose up -d caddy
```

**Check Caddy logs:**
```bash
docker compose logs caddy | tail -50
```

### 99_home shows API response instead of landing page

**Cause:** Root routing not configured in Caddyfile

**Solution:**
```bash
./update-caddyfile.sh
```

### "no such service: 99_home"

**Cause:** docker-compose.yml doesn't have the service defined

**Solution:**
```bash
./setup-production.sh
```

---

## Rollback Instructions

If something goes wrong, rollback is easy:

```bash
cd ~/oute-mind

# Restore docker-compose.yml
cp docker-compose.yml.backup.* docker-compose.yml

# Restore Caddyfile
cp Caddyfile.backup.* Caddyfile

# Restart with old configuration
docker compose up -d
```

---

## What's Running After Setup

### Services
```
99_home        → Port 3003 (Landing Page)
03_interview   → Port 3002 (Chat)
00_dashboard   → Port 3020 (Dashboard)
01_auth-profile → Port 3021 (Auth API)
02_projects    → Port 3022 (Projects API)
caddy          → Port 80 (Reverse Proxy)
postgres       → Port 5432 (Database)
```

### Public URLs (via Caddy at 34.132.93.171)
```
http://34.132.93.171/              → 99_home (Landing Page)
http://34.132.93.171/chat          → 03_interview (Chat)
http://34.132.93.171/api/auth      → 01_auth-profile (Auth)
http://34.132.93.171/api/projects  → 02_projects (Projects)
http://34.132.93.171/dashboard     → 00_dashboard (Dashboard)
```

---

## User Journey

1. User visits http://34.132.93.171/ → Sees landing page (99_home)
2. User clicks "Entrar na Oute" → Goes to /login (still 99_home)
3. User fills login form → Calls /api/auth?action=login (01_auth-profile)
4. User receives JWT → Stored in localStorage
5. Redirected to /chat → Sees chat interface (03_interview)
6. User can interact with chat and all features

---

## Next Steps (Optional)

After everything is working:

1. **Enable HTTPS:**
   - Update Caddyfile to use `https://34.132.93.171`
   - Caddy auto-handles SSL certificates

2. **Monitor health:**
   ```bash
   watch -n 5 'docker compose ps'
   ```

3. **View metrics:**
   - Prometheus: http://34.132.93.171:9090
   - Grafana: http://34.132.93.171:3080

4. **Backup database:**
   ```bash
   docker compose exec postgres pg_dump -U app-user oute_db > backup.sql
   ```

---

## Need Help?

Check these files for more details:
- `PRODUCTION_SETUP.md` - Detailed configuration guide
- `CADDY_ROUTING.md` - Complete routing reference
- `docker-compose.yml` - Service definitions
- `Caddyfile` - Reverse proxy configuration

---

## Summary

```bash
# Complete setup in 4 commands:
ssh ubuntu@34.132.93.171
cd ~/oute-mind && cp ../oute-main/{setup,update-caddyfile,test}-production.sh . && chmod +x *.sh
./setup-production.sh
./update-caddyfile.sh
./test-production.sh
```

That's it! 🎉
