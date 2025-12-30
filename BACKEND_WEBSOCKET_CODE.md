# 🔥 Backend WebSocket Integration Code

Это код для интеграции WebSocket в ваш backend (Node.js + TypeORM).

## 📦 Установка уже сделана

В `backend/package.json` уже добавлен `socket.io@^4.7.5`.

Теперь пересоберите Docker:
```bash
docker-compose down
docker-compose up --build -d
```

---

## 🔧 Backend Code (src/index.ts)

Добавьте этот код в ваш `backend/src/index.ts`:

```typescript
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// 🔥 Инициализация Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Или укажите конкретный домен
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// ... ваши существующие middleware и routes ...

// 🔥 WebSocket Connection Handler
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);
  
  // Когда клиент идентифицируется (отправляет userId)
  socket.on('user:identify', (data: { userId: string }) => {
    console.log('👤 User identified:', data.userId);
    socket.join(`user:${data.userId}`); // Присоединяем к комнате пользователя
  });
  
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// 🔥 ADMIN ROUTES - добавьте WebSocket уведомления

// Когда админ добавляет кейс
app.post('/api/admin/cases', async (req, res) => {
  try {
    // ... ваша логика создания кейса ...
    
    // ✅ Уведомляем всех клиентов о новом кейсе
    io.emit('cases:updated');
    console.log('📦 WebSocket: cases:updated emitted');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ success: false, error: 'Failed to create case' });
  }
});

// Когда админ удаляет кейс
app.delete('/api/admin/cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // ... ваша логика удаления кейса ...
    
    // ✅ Уведомляем всех клиентов об удалении
    io.emit('cases:updated');
    console.log('🗑️ WebSocket: cases:updated emitted (case deleted)');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ success: false, error: 'Failed to delete case' });
  }
});

// Когда админ обновляет кейс
app.put('/api/admin/cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // ... ваша логика обновления кейса ...
    
    // ✅ Уведомляем всех клиентов об обновлении
    io.emit('cases:updated');
    console.log('✏️ WebSocket: cases:updated emitted (case updated)');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ success: false, error: 'Failed to update case' });
  }
});

// 🔥 USER ROUTES - обновление баланса

// Когда пользователь открывает кейс
app.post('/api/cases/open', async (req, res) => {
  try {
    const userId = req.userId; // из вашего auth middleware
    
    // ... ваша логика открытия кейса ...
    
    const updatedBalance = await getUserBalance(userId); // ваша функция
    
    // ✅ Уведомляем конкретного пользователя о новом балансе
    io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
      balance: updatedBalance 
    });
    console.log(`💰 WebSocket: balance updated for user ${userId}`);
    
    res.json({ success: true, item: wonItem });
  } catch (error) {
    console.error('Error opening case:', error);
    res.status(500).json({ success: false, error: 'Failed to open case' });
  }
});

// Когда пользователь пополняет баланс
app.post('/api/payment/callback', async (req, res) => {
  try {
    const userId = req.body.userId; // из callback данных
    
    // ... ваша логика обработки платежа ...
    
    const updatedBalance = await getUserBalance(userId);
    
    // ✅ Уведомляем пользователя о пополнении баланса
    io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
      balance: updatedBalance 
    });
    console.log(`💵 WebSocket: balance credited for user ${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, error: 'Payment failed' });
  }
});

// 🔥 INVENTORY ROUTES

// Когда пользователь получает предмет
app.post('/api/inventory/claim', async (req, res) => {
  try {
    const userId = req.userId;
    
    // ... ваша логика добавления предмета в инвентарь ...
    
    // ✅ Уведомляем пользователя об обновлении инвентаря
    io.to(`user:${userId}`).emit(`inventory:updated:${userId}`);
    console.log(`🎒 WebSocket: inventory updated for user ${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ success: false, error: 'Failed to claim item' });
  }
});

// ⚠️ ВАЖНО: Используйте server.listen вместо app.listen!
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server with WebSocket running on port ${PORT}`);
});
```

---

## 📊 WebSocket Events Reference

### События которые Backend отправляет Frontend:

| Event | Когда? | Данные | Кто получает |
|-------|--------|--------|--------------|
| `cases:updated` | Админ добавил/удалил/обновил кейс | нет | Все клиенты |
| `balance:updated:${userId}` | Баланс изменился | `{ balance: number }` | Конкретный пользователь |
| `inventory:updated:${userId}` | Инвентарь изменился | нет | Конкретный пользователь |

### События которые Frontend отправляет Backend:

| Event | Когда? | Данные |
|-------|--------|--------|
| `user:identify` | После подключения | `{ userId: string }` |

---

## 🧪 Testing

После запуска сервера проверьте:

1. **Консоль Backend** - должны видеть:
   ```
   ✅ Server with WebSocket running on port 3000
   🟢 Client connected: <socket-id>
   👤 User identified: <user-id>
   ```

2. **Консоль Frontend** (DevTools):
   ```
   🔌 Initializing WebSocket connection...
   ✅ WebSocket connected: <socket-id>
   ```

3. **Индикатор в TopBar** - должен быть зеленым (Wi-Fi иконка)

---

## 🎯 Offline Mode

Если WebSocket отключится:
- ✅ Frontend автоматически попытается переподключиться
- ✅ Индикатор станет красным (WifiOff иконка)
- ✅ Пользователь увидит "Reconnecting..." в tooltip
- ✅ После восстановления соединения - автоматически подключится

---

## 🔥 Next Steps

После интеграции WebSocket вы можете:

1. **Убрать window.location.reload()** в ClientApp.tsx
2. Добавить state для force refresh вместо reload
3. Добавить WebSocket события для live feed updates
4. Добавить WebSocket для chat (если понадобится)

---

## 📝 Notes

- WebSocket работает параллельно с HTTP API
- Не нужно менять существующие API endpoints
- Socket.io автоматически fallback на polling если WebSocket заблокирован
- Auto-reconnect работает из коробки

---

**Готово! 🎉 WebSocket интегрирован успешно!**
