# 🚀 Быстрый деплой WebSocket

## ✅ Всё готово! Просто загрузи файлы на VDS.

### Файлы для загрузки:

```
/backend_reference/index.ts      → backend/src/index.ts (или backend/index.ts)
/backend_reference/package.json  → backend/package.json
/backend_reference/database.ts   → backend/src/database.ts (если используешь)
```

---

## 📋 Пошаговая инструкция:

### 1. Загрузи файлы на VDS

Через SFTP, SCP или любым удобным способом:

```bash
# Вариант 1: SCP
scp /backend_reference/index.ts user@91.107.120.48:/path/to/backend/src/index.ts
scp /backend_reference/package.json user@91.107.120.48:/path/to/backend/package.json

# Вариант 2: SFTP (через FileZilla, WinSCP и т.д.)
# Просто перетащи файлы в нужную папку
```

### 2. Зайди на VDS

```bash
ssh user@91.107.120.48
cd /path/to/backend
```

### 3. Установи зависимости (если Docker не используется)

```bash
npm install
```

### 4. Пересобери Docker (если используется)

```bash
docker-compose down
docker-compose up --build -d
```

### 5. Проверь работу

```bash
# Health check
curl http://91.107.120.48:3000/health

# Должно вернуть:
# {
#   "status": "ok",
#   "websocket": "active",
#   "clients": 0
# }

# Логи
docker-compose logs -f backend
# Или если не Docker:
# pm2 logs backend
```

---

## 🎯 Проверка на сайте:

1. **Открой сайт**
2. **Посмотри в TopBar** (справа, между Settings и Login)
3. **Индикатор должен быть 🟢 зеленым**
4. **DevTools Console:** `✅ WebSocket connected`

---

## 🧪 Тестирование:

### Тест 1: Админ создает кейс

1. Зайди в админку
2. Создай новый кейс
3. **Backend логи:** `🔥 WebSocket: cases:updated emitted`
4. **Frontend:** Список кейсов обновится БЕЗ перезагрузки!

### Тест 2: Claim денег

1. Открой кейс с деньгами
2. Нажми "Claim"
3. **Backend логи:** `🔥 WebSocket: balance updated for user ...`
4. **Frontend:** Баланс в TopBar обновится МГНОВЕННО!

---

## 📊 Что изменилось:

### Добавлено в index.ts:

1. ✅ `import http from "http"`
2. ✅ `import { Server as SocketIOServer } from "socket.io"`
3. ✅ `const server = http.createServer(app)`
4. ✅ `const io = new SocketIOServer(server, {...})`
5. ✅ `io.on("connection", ...)` обработчик
6. ✅ `app.get("/health", ...)` endpoint
7. ✅ `io.emit("cases:updated")` в admin routes
8. ✅ `io.to(...).emit("balance:updated:...")` в claim
9. ✅ `io.to(...).emit("inventory:updated:...")` в open
10. ✅ `server.listen(...)` вместо `app.listen(...)`

### Добавлено в package.json:

```json
{
  "dependencies": {
    "socket.io": "^4.7.5"
  }
}
```

---

## ⚠️ Troubleshooting:

### "Cannot find module 'socket.io'"

```bash
npm install socket.io@^4.7.5
# Или
docker-compose up --build -d
```

### Индикатор красный 🔴

```bash
# Проверь backend
docker ps

# Проверь порт
sudo ufw allow 3000

# Проверь логи
docker-compose logs backend
```

### События не приходят

```bash
# WebSocket логи
docker-compose logs -f backend | grep "🔥"

# Должны видеть:
# 🔥 WebSocket: cases:updated emitted
# 🔥 WebSocket: balance updated for user ...
```

---

## 📞 Нужна помощь?

1. Проверь health: `curl http://91.107.120.48:3000/health`
2. Покажи логи: `docker-compose logs backend`
3. Проверь индикатор в TopBar
4. Напиши мне!

---

## ✅ Checklist:

- [ ] Загрузил index.ts на VDS
- [ ] Загрузил package.json на VDS  
- [ ] Выполнил `docker-compose down && up --build -d`
- [ ] Проверил health check - `"status": "ok"`
- [ ] Индикатор в TopBar зеленый 🟢
- [ ] DevTools Console: `✅ WebSocket connected`
- [ ] Создал тестовый кейс - список обновился
- [ ] Claim деньги - баланс обновился
- [ ] **ВСЁ РАБОТАЕТ!** 🎉

---

**Готово! Наслаждайся real-time обновлениями! 🚀✨**
