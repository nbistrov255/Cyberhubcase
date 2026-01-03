#!/bin/bash

# 🔧 Быстрое исправление Backend

echo "🔍 Проверяю состояние контейнера..."
docker ps | grep cyberhub_api

echo ""
echo "📋 Последние логи:"
docker logs cyberhub_api --tail 30

echo ""
echo "📁 Проверяю структуру файлов..."
docker exec cyberhub_api ls -la /app/src/ 2>&1 || echo "❌ Нет доступа к /app/src/"

echo ""
echo "🔄 Перезапускаю контейнер..."
docker restart cyberhub_api

echo ""
echo "⏳ Ждем 5 секунд..."
sleep 5

echo ""
echo "✅ Проверяю что сервер запустился..."
docker logs cyberhub_api --tail 20

echo ""
echo "🏥 Проверяю healthcheck..."
curl -s http://91.107.120.48:3000/health || echo "❌ Сервер не отвечает"

echo ""
echo "✅ Готово! Если видите 'CyberHub Backend Server Started!' - все OK!"
