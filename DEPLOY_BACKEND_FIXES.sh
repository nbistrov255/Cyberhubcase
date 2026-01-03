#!/bin/bash

# 🔥 DEPLOY BACKEND FIXES TO VDS
# Скрипт для деплоя обновленного backend на VDS

set -e  # Exit on error

echo "🚀 ============================================"
echo "🚀  DEPLOYING BACKEND FIXES TO VDS"
echo "🚀 ============================================"
echo ""

# Configuration
VDS_HOST="91.107.120.48"
VDS_USER="root"
BACKEND_PATH="/root/cyberhub-backend"
LOCAL_BACKEND="/backend_reference/index.ts"

echo "📋 Changes to deploy:"
echo "  1. ✅ New endpoint: GET /api/user/requests"
echo "  2. ✅ WebSocket notifications in approve/deny/return"
echo "  3. ✅ Session expiration check in requireSession"
echo ""

# Step 1: Copy updated index.ts
echo "📤 Step 1/3: Copying updated index.ts to VDS..."
scp ${LOCAL_BACKEND} ${VDS_USER}@${VDS_HOST}:${BACKEND_PATH}/src/index.ts
echo "✅ File copied successfully!"
echo ""

# Step 2: Restart backend container
echo "🔄 Step 2/3: Restarting backend container..."
ssh ${VDS_USER}@${VDS_HOST} << 'EOF'
cd /root/cyberhub-backend
docker-compose restart cyberhub_api
echo "✅ Container restarted!"
EOF
echo ""

# Step 3: Check logs
echo "📋 Step 3/3: Checking backend logs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh ${VDS_USER}@${VDS_HOST} << 'EOF'
cd /root/cyberhub-backend
docker logs --tail 50 cyberhub_api
EOF
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🎉 ============================================"
echo "🎉  DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "🎉 ============================================"
echo ""
echo "✅ Backend endpoints now available:"
echo "   • GET  /api/user/requests"
echo "   • POST /api/admin/requests/:id/approve (with WebSocket)"
echo "   • POST /api/admin/requests/:id/deny (with WebSocket)"
echo "   • POST /api/admin/requests/:id/return (with WebSocket)"
echo ""
echo "🔍 To monitor logs in real-time, run:"
echo "   ssh ${VDS_USER}@${VDS_HOST}"
echo "   docker logs -f cyberhub_api"
echo ""
