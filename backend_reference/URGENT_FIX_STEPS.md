# 🚨 СРОЧНОЕ ИСПРАВЛЕНИЕ BACKEND - ПОШАГОВАЯ ИНСТРУКЦИЯ

## ШАГ 1: Подключитесь к VDS

```bash
ssh root@91.107.120.48
```

## ШАГ 2: Найдите где лежат файлы backend

```bash
# Проверьте docker-compose.yml
cat docker-compose.yml | grep -A 10 cyberhub_api

# Обычно там будет что-то вроде:
#   volumes:
#     - ./backend:/app
# или
#     - ./api:/app
```

## ШАГ 3: Проверьте что файл index.ts существует

```bash
# Если volumes: ./backend:/app
ls -la backend/src/index.ts

# Если volumes: ./api:/app  
ls -la api/src/index.ts

# Если volumes: ./:/app
ls -la src/index.ts
```

## ШАГ 4A: Если файл ЕСТЬ - просто перезапустите

```bash
docker restart cyberhub_api
docker logs cyberhub_api -f
```

## ШАГ 4B: Если файла НЕТ - скопируйте из reference

**НА ВАШЕМ ЛОКАЛЬНОМ КОМПЬЮТЕРЕ (не на VDS!):**

1. Найдите папку с проектом где есть `/backend_reference/`
2. Подключитесь к VDS и скопируйте файлы:

```bash
# Вариант 1: Через SCP (с локального компьютера)
scp backend_reference/index.ts root@91.107.120.48:/root/backend/src/
scp backend_reference/database.ts root@91.107.120.48:/root/backend/src/
scp backend_reference/admin-auth.ts root@91.107.120.48:/root/backend/src/

# Вариант 2: Скопировать ВСЮ папку
scp -r backend_reference/* root@91.107.120.48:/root/backend/src/
```

**НА VDS (после копирования):**

```bash
# Перезапустите контейнер
docker restart cyberhub_api

# Проверьте логи
docker logs cyberhub_api -f
```

## ШАГ 5: Проверка что все работает

```bash
# 1. Healthcheck
curl http://localhost:3000/health

# Должен вернуть JSON с "status": "ok"

# 2. Тест логина
curl -X POST http://localhost:3000/api/auth/session \
  -H "Content-Type: application/json" \
  -d '{"login":"37127177620","password":"test123"}'

# Должен вернуть {"success":true,"session_token":"..."}
```

## ШАГ 6: Если все еще не работает

Пришлите мне вывод этих команд:

```bash
# 1. Docker compose конфигурация
cat docker-compose.yml

# 2. Структура файлов
ls -laR backend/ 2>/dev/null || ls -laR api/ 2>/dev/null || ls -laR src/

# 3. Логи контейнера
docker logs cyberhub_api --tail 50

# 4. Процессы в контейнере
docker exec cyberhub_api ps aux

# 5. Содержимое папки в контейнере
docker exec cyberhub_api ls -laR /app/
```

## БЫСТРОЕ РЕШЕНИЕ (если некогда разбираться)

```bash
# Пересоздать контейнер с нуля
cd /root  # или где у вас лежит docker-compose.yml

docker-compose stop cyberhub_api
docker-compose rm -f cyberhub_api
docker-compose up -d cyberhub_api

# Проверить
docker logs cyberhub_api -f
```

---

## 📞 Что мне нужно от вас

Пришлите:
1. Вывод `cat docker-compose.yml`
2. Вывод `ls -la backend/src/` (или где у вас лежат файлы)
3. Вывод `docker logs cyberhub_api --tail 50`

И я точно скажу что делать!
