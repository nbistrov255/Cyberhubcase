# ⚡ WebSocket Quick Reference - Шпаргалка

## 🎯 Главное в 1 минуту:

### Что делать:
1. Скачай `/backend/src/index.ts`
2. Замени свой файл на VDS
3. `docker-compose down && docker-compose up --build -d`
4. Проверь: зеленый индикатор 🟢 в TopBar

### Если работает:
- ✅ Индикатор зеленый 🟢
- ✅ В логах: `✅ WebSocket connected`
- ✅ Кейсы обновляются без reload

### Если не работает:
- 🔴 Индикатор красный
- Проверь: `docker ps`, `curl http://91.107.120.48:3000/health`
- Логи: `docker-compose logs -f backend`

---

## 📡 События WebSocket:

### Backend → Frontend:

```typescript
// Всем пользователям
io.emit('cases:updated');

// Конкретному пользователю
io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { balance: 100 });
io.to(`user:${userId}`).emit(`inventory:updated:${userId}`);
```

### Когда отправлять:

| Event | Когда |
|-------|-------|
| `cases:updated` | Админ создал/обновил/удалил кейс |
| `balance:updated:${userId}` | Изменился баланс (открыл кейс, пополнил, получил деньги) |
| `inventory:updated:${userId}` | Изменился инвентарь (выиграл, получил деньги) |

---

## 🔧 Backend код (минимум):

```typescript
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  socket.on('user:identify', (data) => {
    socket.join(`user:${data.userId}`);
  });
});

// В routes:
io.emit('cases:updated'); // всем
io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { balance: 100 }); // одному

// Запуск:
server.listen(3000); // НЕ app.listen!
```

---

## 🧪 Проверка:

```bash
# Сервер запущен?
docker ps

# WebSocket работает?
curl http://91.107.120.48:3000/health

# Логи:
docker-compose logs -f backend
```

---

## 🟢 Индикатор:

- **Зеленый** 🟢 = подключен, всё работает
- **Красный** 🔴 = переподключение, подождите

---

## 📝 Частые команды:

```bash
# Пересобрать
docker-compose down
docker-compose up --build -d

# Логи
docker-compose logs -f backend

# Health check
curl http://91.107.120.48:3000/health

# Открыть порт
sudo ufw allow 3000
```

---

## ⚠️ Частые ошибки:

| Проблема | Решение |
|----------|---------|
| `io is not defined` | Создай `const io = new SocketIOServer(...)` |
| `server.listen is not a function` | Используй `server.listen()` не `app.listen()` |
| Красный индикатор | Проверь `docker ps` и `sudo ufw allow 3000` |
| События не приходят | Добавь `io.emit()` в routes |

---

## 📦 Файлы:

- `/backend/src/index.ts` - **главный файл (просто замени)**
- `/INSTALLATION_INSTRUCTIONS.md` - **пошаговая инструкция**
- `/README_WEBSOCKET.md` - **полная документация**
- `/WEBSOCKET_VISUAL_GUIDE.md` - **визуальное объяснение**

---

**Всё! Больше ничего не нужно знать для начала! 🚀**
