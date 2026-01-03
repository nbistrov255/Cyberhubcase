# 🔧 ИСПРАВЛЕНИЕ BACKEND НА VDS

## Проблема
```
Error: Cannot find module './index.ts'
[nodemon] app crashed - waiting for file changes before starting...
```

## Причина
Backend упал из-за проблем с путями к файлам или отсутствия файла index.ts

## Решение

### Вариант 1: Проверить структуру файлов на VDS

```bash
# Зайти в контейнер
docker exec -it cyberhub_api bash

# Проверить структуру
ls -la /app/
ls -la /app/src/

# Должно быть:
# /app/src/index.ts ✅
# /app/src/database.ts ✅
# /app/src/admin-auth.ts ✅
# /app/package.json ✅
```

Если файла `/app/src/index.ts` НЕТ - нужно скопировать с хоста:

```bash
# На хосте (не в контейнере!)
docker cp /path/to/backend_reference/index.ts cyberhub_api:/app/src/index.ts
docker cp /path/to/backend_reference/database.ts cyberhub_api:/app/src/database.ts
docker cp /path/to/backend_reference/admin-auth.ts cyberhub_api:/app/src/admin-auth.ts
```

### Вариант 2: Перезапустить контейнер

```bash
# Перезапуск
docker restart cyberhub_api

# Проверить логи
docker logs cyberhub_api --tail 50

# Должны увидеть:
# 🚀 ============================================
# 🚀  CyberHub Backend Server Started!
# 📡 HTTP Server: http://localhost:3000
# 🔌 WebSocket: ws://localhost:3000
```

### Вариант 3: Пересобрать контейнер

Если файлы есть но все равно не работает:

```bash
# Остановить и удалить контейнер
docker stop cyberhub_api
docker rm cyberhub_api

# Пересобрать образ
docker-compose build cyberhub_api

# Запустить снова
docker-compose up -d cyberhub_api

# Проверить логи
docker logs cyberhub_api -f
```

### Вариант 4: Проверить рабочую директорию

Возможно nodemon запускается из неправильной директории:

```bash
# В контейнере
docker exec -it cyberhub_api bash

# Проверить где мы
pwd
# Должно быть: /app

# Проверить что запускается
ps aux | grep node

# Вручную запустить
cd /app
npm run dev
```

## Проверка что все работает

После исправления, проверьте:

```bash
# 1. Логи контейнера
docker logs cyberhub_api --tail 20

# 2. Healthcheck
curl http://91.107.120.48:3000/health

# Должен вернуть:
# {"status":"ok","websocket":"idle","clients":0,"timestamp":"..."}

# 3. Тестовый логин (замените на реальные данные)
curl -X POST http://91.107.120.48:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"login":"37127177620","password":"your_password"}'

# Должен вернуть:
# {"success":true,"session_token":"..."}
```

## Если все еще не работает

Скиньте мне логи:

```bash
# Полные логи
docker logs cyberhub_api --tail 100 > backend_logs.txt
cat backend_logs.txt

# Структура файлов
docker exec cyberhub_api ls -laR /app/src/

# Содержимое package.json
docker exec cyberhub_api cat /app/package.json

# Процессы
docker exec cyberhub_api ps aux
```
