#!/bin/bash

# 🔍 CHECK IF BACKEND IS DEPLOYED
# Проверяет, деплоен ли обновленный backend на VDS

set -e

echo "🔍 ============================================"
echo "🔍  CHECKING BACKEND DEPLOYMENT STATUS"
echo "🔍 ============================================"
echo ""

VDS_HOST="91.107.120.48"
VDS_USER="root"
BACKEND_PATH="/root/cyberhub-backend"

echo "📋 Checking for backend changes..."
echo ""

# Проверяем наличие комментария "🔥 ПРОВЕРКА expires_at"
echo "1️⃣ Checking for expires_at validation..."
ssh ${VDS_USER}@${VDS_HOST} << 'EOF'
if grep -q "ПРОВЕРКА expires_at" /root/cyberhub-backend/src/index.ts; then
    echo "✅ expires_at validation: PRESENT"
else
    echo "❌ expires_at validation: MISSING"
    echo ""
    echo "⚠️  BACKEND NOT DEPLOYED!"
    echo "Run: scp /backend_reference/index.ts root@91.107.120.48:/root/cyberhub-backend/src/index.ts"
    exit 1
fi
EOF

echo ""

# Проверяем наличие endpoint GET /api/user/requests
echo "2️⃣ Checking for /api/user/requests endpoint..."
ssh ${VDS_USER}@${VDS_HOST} << 'EOF'
if grep -q "GET /api/user/requests" /root/cyberhub-backend/src/index.ts; then
    echo "✅ /api/user/requests endpoint: PRESENT"
else
    echo "❌ /api/user/requests endpoint: MISSING"
    echo ""
    echo "⚠️  BACKEND NOT DEPLOYED!"
    echo "Run: scp /backend_reference/index.ts root@91.107.120.48:/root/cyberhub-backend/src/index.ts"
    exit 1
fi
EOF

echo ""

# Проверяем WebSocket уведомления
echo "3️⃣ Checking for WebSocket notifications..."
ssh ${VDS_USER}@${VDS_HOST} << 'EOF'
if grep -q "WebSocket: inventory updated for user" /root/cyberhub-backend/src/index.ts; then
    echo "✅ WebSocket notifications: PRESENT"
else
    echo "❌ WebSocket notifications: MISSING"
    echo ""
    echo "⚠️  BACKEND NOT DEPLOYED!"
    echo "Run: scp /backend_reference/index.ts root@91.107.120.48:/root/cyberhub-backend/src/index.ts"
    exit 1
fi
EOF

echo ""
echo "🎉 ============================================"
echo "🎉  ALL BACKEND CHANGES ARE DEPLOYED!"
echo "🎉 ============================================"
echo ""
echo "✅ Backend is up to date with all fixes!"
echo ""
