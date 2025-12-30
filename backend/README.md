# 🎮 CyberHub Backend with WebSocket

Backend сервер для CyberHub с поддержкой WebSocket для real-time обновлений.

## 🚀 Quick Start

### 1. Установка зависимостей

В Docker контейнере зависимости установятся автоматически при сборке.

Если хотите запустить локально:
```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите свои настройки.

### 3. Запуск

**В Docker (рекомендуется):**
```bash
docker-compose up --build -d
```

**Локально:**
```bash
npm run dev
```

## 📡 WebSocket Events

### События от Backend → Frontend:

| Event | Trigger | Recipients | Data |
|-------|---------|------------|------|
| `cases:updated` | Админ изменил кейсы | Все клиенты | - |
| `balance:updated:${userId}` | Баланс изменился | Конкретный пользователь | `{ balance: number }` |
| `inventory:updated:${userId}` | Инвентарь обновлен | Конкретный пользователь | - |

### События от Frontend → Backend:

| Event | Когда? | Data |
|-------|--------|------|
| `user:identify` | После подключения | `{ userId: string }` |

## 🔌 API Endpoints

### Public Endpoints

```
GET  /health              - Health check (статус сервера)
GET  /api/cases           - Получить список кейсов
GET  /api/stats/public    - Публичная статистика
```

### Authenticated Endpoints

```
POST /api/cases/open      - Открыть кейс
GET  /api/profile         - Получить профиль пользователя
GET  /api/inventory       - Получить инвентарь
POST /api/inventory/claim - Получить деньги за предмет
```

### Admin Endpoints

```
POST   /api/admin/cases     - Создать кейс
PUT    /api/admin/cases/:id - Обновить кейс
DELETE /api/admin/cases/:id - Удалить кейс
```

### Webhooks

```
POST /api/payment/callback - Webhook от платежной системы
```

## 🔥 WebSocket Integration

### Когда отправлять события:

**1. cases:updated** - Отправляется когда:
- Админ создал новый кейс
- Админ обновил существующий кейс
- Админ удалил кейс

```typescript
io.emit('cases:updated');
```

**2. balance:updated:userId** - Отправляется когда:
- Пользователь открыл кейс (списание)
- Пользователь пополнил баланс
- Пользователь получил деньги за предмет

```typescript
io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
  balance: newBalance 
});
```

**3. inventory:updated:userId** - Отправляется когда:
- Пользователь выиграл предмет
- Пользователь получил деньги за предмет
- Статус предмета изменился

```typescript
io.to(`user:${userId}`).emit(`inventory:updated:${userId}`);
```

## 🧪 Testing WebSocket

### 1. Проверка подключения

Откройте в браузере DevTools → Console и выполните:

```javascript
const socket = io('http://91.107.120.48:3000');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});
```

### 2. Проверка событий

```javascript
// Подписка на обновления кейсов
socket.on('cases:updated', () => {
  console.log('📦 Cases updated!');
});

// Подписка на обновление баланса
socket.on('balance:updated:YOUR_USER_ID', (data) => {
  console.log('💰 Balance updated:', data.balance);
});
```

### 3. Health Check

Проверьте статус сервера:
```bash
curl http://91.107.120.48:3000/health
```

Ответ:
```json
{
  "status": "ok",
  "websocket": "active",
  "clients": 5,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 📊 Мониторинг

### Логи WebSocket

В консоли сервера вы увидите:
```
🟢 Client connected: <socket-id>
👤 User identified: <user-id> socket: <socket-id>
🔥 WebSocket: cases:updated emitted
💰 WebSocket: balance updated for user <user-id>
🔴 Client disconnected: <socket-id> reason: <reason>
```

### Количество подключений

```bash
curl http://91.107.120.48:3000/health
```

Параметр `clients` покажет количество активных WebSocket подключений.

## 🔧 Troubleshooting

### WebSocket не подключается

**1. Проверьте firewall:**
```bash
sudo ufw allow 3000
```

**2. Проверьте что сервер запущен:**
```bash
docker ps
```

**3. Проверьте логи:**
```bash
docker logs cyberhub-backend
```

### Клиенты не получают события

**1. Проверьте что пользователь идентифицировался:**
```typescript
// Frontend должен отправить:
socket.emit('user:identify', { userId: 'USER_ID' });
```

**2. Проверьте что userId совпадает:**
```typescript
// Backend отправляет:
io.to(`user:${userId}`).emit(`balance:updated:${userId}`, ...);

// Frontend слушает:
socket.on(`balance:updated:${userId}`, ...);
```

## 🛡️ Security

### CORS

В production укажите конкретный домен вместо `*`:

```typescript
const io = new SocketIOServer(server, {
  cors: {
    origin: 'https://yourdomain.com',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### Authentication

Добавьте проверку токена в WebSocket:

```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Проверка токена...
  if (isValid) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

## 📦 Production Deployment

### 1. Соберите Docker image:
```bash
docker-compose build
```

### 2. Запустите контейнеры:
```bash
docker-compose up -d
```

### 3. Проверьте статус:
```bash
docker-compose ps
curl http://91.107.120.48:3000/health
```

### 4. Логи в реальном времени:
```bash
docker-compose logs -f backend
```

## 🔄 Updates

Когда вы обновляете код:

```bash
# 1. Остановить контейнеры
docker-compose down

# 2. Пересобрать
docker-compose up --build -d

# 3. Проверить
curl http://91.107.120.48:3000/health
```

## 📞 Support

Если возникли проблемы:
1. Проверьте логи: `docker-compose logs -f backend`
2. Проверьте health check: `curl http://91.107.120.48:3000/health`
3. Проверьте что порт 3000 открыт

---

**Готово! Backend с WebSocket настроен и готов к работе! 🚀**
