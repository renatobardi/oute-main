#!/bin/bash

# 🔧 Update Caddyfile with routing for 99_home and 03_interview

set -e

echo "🔧 Updating Caddyfile for production routing"
echo "============================================"
echo ""

if [ ! -f "Caddyfile" ]; then
  echo "❌ Caddyfile not found in current directory"
  echo "Make sure you're in ~/oute-mind"
  exit 1
fi

echo "📝 Backing up Caddyfile..."
cp Caddyfile Caddyfile.backup.$(date +%s)
echo "✅ Backup created"
echo ""

echo "🔄 Applying new routing configuration..."
echo ""

# Create the new Caddyfile content
cat > Caddyfile << 'CADDY_CONFIG'
# OUTE Production Routing Configuration
# Services:
#  - 99_home (3003): Landing page at root /
#  - 03_interview (3002): Chat interface at /chat
#  - 00_dashboard (3000): Main app (default fallback)
#  - 01_auth-profile (3001): Auth API at /api/auth/*
#  - 02_projects (3022): Projects API at /api/projects/*

34.132.93.171 {
  # Landing page at root (99_home)
  @root path /
  handle @root {
    reverse_proxy localhost:3003 {
      # Forward X-Forwarded headers
      header_up X-Forwarded-For {http.request.remote}
      header_up X-Forwarded-Proto {http.request.proto}
      header_up X-Forwarded-Host {http.request.host}
    }
  }

  # Chat interface (03_interview)
  @chat path /chat*
  handle @chat {
    reverse_proxy localhost:3002 {
      header_up X-Forwarded-For {http.request.remote}
      header_up X-Forwarded-Proto {http.request.proto}
      header_up X-Forwarded-Host {http.request.host}
    }
  }

  # Auth API endpoints (01_auth-profile)
  @auth path /api/auth*
  handle @auth {
    reverse_proxy localhost:3021 {
      header_up X-Forwarded-For {http.request.remote}
      header_up X-Forwarded-Proto {http.request.proto}
      header_up X-Forwarded-Host {http.request.host}
    }
  }

  # Projects API endpoints (02_projects)
  @projects path /api/projects*
  handle @projects {
    reverse_proxy localhost:3022 {
      header_up X-Forwarded-For {http.request.remote}
      header_up X-Forwarded-Proto {http.request.proto}
      header_up X-Forwarded-Host {http.request.host}
    }
  }

  # Default fallback to Dashboard (00_dashboard)
  handle {
    reverse_proxy localhost:3020 {
      header_up X-Forwarded-For {http.request.remote}
      header_up X-Forwarded-Proto {http.request.proto}
      header_up X-Forwarded-Host {http.request.host}
    }
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

  # Error handling
  handle_errors {
    @4xx {
      expression {http.response.status} >= 400 && {http.response.status} < 500
    }
    @5xx {
      expression {http.response.status} >= 500
    }

    respond @4xx "Error {http.response.status}"
    respond @5xx "Server Error {http.response.status}"
  }
}

# Health check endpoint (does not proxy)
34.132.93.171/health {
  respond "OK" 200
}

# Metrics endpoint for monitoring (if needed)
# 34.132.93.171/metrics {
#   reverse_proxy localhost:9090
# }
CADDY_CONFIG

echo "✅ New Caddyfile created"
echo ""
echo "📋 Configuration includes:"
echo "  ✓ Root (/) → 99_home (3003)"
echo "  ✓ /chat → 03_interview (3002)"
echo "  ✓ /api/auth/* → 01_auth-profile (3021)"
echo "  ✓ /api/projects/* → 02_projects (3022)"
echo "  ✓ /* (default) → 00_dashboard (3020)"
echo ""
echo "🔄 Reloading Caddy..."
docker compose up -d caddy

echo ""
echo "⏳ Waiting for Caddy to reload..."
sleep 5

echo ""
echo "Testing routing..."

# Test root path
if curl -sf http://localhost:80/ > /dev/null 2>&1; then
  echo "✅ Root (/) is accessible"
else
  echo "⚠️  Root (/) not responding - check Caddy logs"
fi

# Test chat path
if curl -sf http://localhost:80/chat > /dev/null 2>&1; then
  echo "✅ Chat (/chat) is accessible"
else
  echo "⚠️  Chat (/chat) not responding - check Caddy logs"
fi

# Test auth API
if curl -sf http://localhost:80/api/auth/health > /dev/null 2>&1; then
  echo "✅ Auth API (/api/auth) is accessible"
else
  echo "⚠️  Auth API (/api/auth) not responding - check Caddy logs"
fi

echo ""
echo "📊 Caddy logs:"
echo "============="
docker compose logs --tail=20 caddy || true

echo ""
echo "✅ Caddyfile updated successfully!"
echo ""

