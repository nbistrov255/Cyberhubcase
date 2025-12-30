# 🔧 Руководство по интеграции WebSocket в существующий backend

Если у тебя уже есть рабочий backend код, вот как добавить в него WebSocket:

---

## 📋 Вариант 1: Полная замена (Рекомендуется)

Просто замени файл `backend/src/index.ts` на готовый из `/backend/src/index.ts`.

**Плюсы:**
- ✅ Всё уже настроено
- ✅ Всё работает из коробки
- ✅ Не нужно ничего менять

**Минусы:**
- ⚠️ Потеряются твои кастомные функции (если есть)

---

## 📋 Вариант 2: Ручная интеграция

Если хочешь сохранить свой код, добавь эти блоки:

### Шаг 1: Импорты

В начале файла добавь:

```typescript
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
```

### Шаг 2: Создание HTTP сервера

Вместо:
```typescript
const app = express();
```

Напиши:
```typescript
const app = express();
const server = http.createServer(app);
```

### Шаг 3: Инициализация Socket.IO

После создания server:

```typescript
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
});
```

### Шаг 4: WebSocket обработчики

Добавь где-нибудь после middleware:

```typescript
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);
  
  socket.on('user:identify', (data: { userId: string }) => {
    console.log('👤 User identified:', data.userId);
    socket.join(`user:${data.userId}`);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('🔴 Client disconnected:', socket.id, 'reason:', reason);
  });
});
```

### Шаг 5: Добавь события в routes

**В admin routes (создание/обновление/удаление кейса):**

```typescript
app.post('/api/admin/cases', async (req, res) => {
  // ... твой существующий код ...
  
  // ✅ Добавь эту строку в конце
  io.emit('cases:updated');
  
  res.json({ success: true });
});

app.put('/api/admin/cases/:id', async (req, res) => {
  // ... твой существующий код ...
  
  // ✅ Добавь эту строку в конце
  io.emit('cases:updated');
  
  res.json({ success: true });
});

app.delete('/api/admin/cases/:id', async (req, res) => {
  // ... твой существующий код ...
  
  // ✅ Добавь эту строку в конце
  io.emit('cases:updated');
  
  res.json({ success: true });
});
```

**В routes открытия кейса:**

```typescript
app.post('/api/cases/open', authenticateToken, async (req, res) => {
  const userId = req.userId;
  
  // ... твой существующий код ...
  // ... открытие кейса ...
  // ... обновление баланса ...
  
  const updatedBalance = 1000; // Твой реальный баланс
  
  // ✅ Добавь эти строки в конце
  io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
    balance: updatedBalance 
  });
  io.to(`user:${userId}`).emit(`inventory:updated:${userId}`);
  
  res.json({ success: true });
});
```

**В payment callback:**

```typescript
app.post('/api/payment/callback', async (req, res) => {
  const userId = req.body.userId;
  
  // ... твой существующий код ...
  // ... обработка платежа ...
  
  const updatedBalance = 1500; // Твой реальный баланс
  
  // ✅ Добавь эту строку в конце
  io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
    balance: updatedBalance 
  });
  
  res.json({ success: true });
});
```

### Шаг 6: Изменить запуск сервера

**Было:**
```typescript
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Стало:**
```typescript
server.listen(PORT, () => {
  console.log(`Server with WebSocket running on port ${PORT}`);
});
```

---

## 🎯 Где добавить io.emit()

### 1. cases:updated

Добавь `io.emit('cases:updated')` везде где админ меняет кейсы:

- ✅ POST   /api/admin/cases (создание)
- ✅ PUT    /api/admin/cases/:id (обновление)
- ✅ DELETE /api/admin/cases/:id (удаление)
- ✅ PATCH  /api/admin/cases/:id/items (обновление предметов)
- ✅ PUT    /api/admin/cases/:id/price (изменение цены)

### 2. balance:updated:userId

Добавь где баланс меняется:

- ✅ POST /api/cases/open (списание при открытии)
- ✅ POST /api/payment/callback (пополнение)
- ✅ POST /api/inventory/claim (получение денег)
- ✅ POST /api/admin/balance/add (админ начисляет)
- ✅ POST /api/admin/balance/subtract (админ списывает)

### 3. inventory:updated:userId

Добавь где инвентарь меняется:

- ✅ POST /api/cases/open (получен предмет)
- ✅ POST /api/inventory/claim (получены деньги)
- ✅ PUT  /api/inventory/:id/status (статус изменен)

---

## 📝 Примеры реальных функций

### Пример 1: Админ создает кейс

```typescript
app.post('/api/admin/cases', adminAuth, async (req, res) => {
  try {
    const { name, image, price, items } = req.body;
    
    // Сохраняем в БД
    const newCase = await caseRepository.save({
      name,
      image,
      price,
      items,
      createdAt: new Date()
    });
    
    // ✅ Уведомляем всех клиентов
    io.emit('cases:updated');
    console.log('📦 WebSocket: cases:updated emitted');
    
    res.json({ 
      success: true, 
      case: newCase 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create case' 
    });
  }
});
```

### Пример 2: Пользователь открывает кейс

```typescript
app.post('/api/cases/open', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { caseId } = req.body;
    
    // Получаем кейс
    const caseData = await caseRepository.findOne({ id: caseId });
    
    // Проверяем баланс
    const user = await userRepository.findOne({ id: userId });
    if (user.balance < caseData.price) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient balance' 
      });
    }
    
    // Списываем деньги
    user.balance -= caseData.price;
    await userRepository.save(user);
    
    // Выбираем случайный предмет
    const wonItem = selectRandomItem(caseData.items);
    
    // Добавляем в инвентарь
    await inventoryRepository.save({
      userId,
      itemId: wonItem.id,
      caseId,
      wonAt: new Date()
    });
    
    // ✅ Уведомляем пользователя о балансе
    io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
      balance: user.balance 
    });
    console.log(`💰 WebSocket: balance updated for user ${userId}`);
    
    // ✅ Уведомляем об инвентаре
    io.to(`user:${userId}`).emit(`inventory:updated:${userId}`);
    console.log(`🎒 WebSocket: inventory updated for user ${userId}`);
    
    res.json({ 
      success: true, 
      item: wonItem,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to open case' 
    });
  }
});
```

### Пример 3: Webhook от SmartShell

```typescript
app.post('/api/payment/callback', async (req, res) => {
  try {
    const { 
      userId, 
      amount, 
      status, 
      signature 
    } = req.body;
    
    // Проверяем подпись
    if (!verifySignature(req.body, signature)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid signature' 
      });
    }
    
    // Проверяем статус
    if (status !== 'success') {
      return res.json({ success: false });
    }
    
    // Добавляем деньги
    const user = await userRepository.findOne({ id: userId });
    user.balance += parseFloat(amount);
    await userRepository.save(user);
    
    // Сохраняем транзакцию
    await transactionRepository.save({
      userId,
      amount,
      type: 'deposit',
      status: 'completed',
      createdAt: new Date()
    });
    
    // ✅ Уведомляем пользователя
    io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
      balance: user.balance 
    });
    console.log(`💵 WebSocket: balance credited ${amount}€ for user ${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Payment processing failed' 
    });
  }
});
```

---

## ✅ Checklist интеграции

После добавления кода проверь:

- [ ] `import http from 'http'` добавлен
- [ ] `import { Server as SocketIOServer } from 'socket.io'` добавлен
- [ ] `const server = http.createServer(app)` создан
- [ ] `const io = new SocketIOServer(server, {...})` инициализирован
- [ ] `io.on('connection', ...)` обработчик добавлен
- [ ] `io.emit('cases:updated')` добавлен во все admin/cases routes
- [ ] `io.to(userId).emit('balance:updated:...')` добавлен где баланс меняется
- [ ] `io.to(userId).emit('inventory:updated:...')` добавлен где инвентарь меняется
- [ ] `server.listen(PORT, ...)` вместо `app.listen(PORT, ...)`

---

## 🧪 Тестирование

После интеграции:

1. **Пересобери Docker:**
```bash
docker-compose down
docker-compose up --build -d
```

2. **Проверь логи:**
```bash
docker-compose logs -f backend
```

Должно быть:
```
✅ Server with WebSocket running on port 3000
```

3. **Проверь подключение:**

Открой сайт → DevTools → Console → должно быть:
```
✅ WebSocket connected
```

4. **Проверь события:**

Создай кейс через админку → в консоли backend должно быть:
```
🔥 WebSocket: cases:updated emitted
```

Frontend должен обновить список кейсов БЕЗ перезагрузки страницы.

---

## 🚨 Частые ошибки

### 1. "io is not defined"

**Проблема:** Забыл создать `io`.

**Решение:** Добавь:
```typescript
const io = new SocketIOServer(server, {...});
```

### 2. "server.listen is not a function"

**Проблема:** Используешь `app` вместо `server`.

**Решение:** Замени:
```typescript
app.listen(PORT, ...)  // ❌ Неправильно
```
На:
```typescript
server.listen(PORT, ...)  // ✅ Правильно
```

### 3. События не приходят

**Проблема:** Забыл добавить `io.emit()` или `io.to().emit()`.

**Решение:** Проверь что в каждом нужном route есть:
```typescript
io.emit('cases:updated');
// или
io.to(`user:${userId}`).emit(`balance:updated:${userId}`, {...});
```

### 4. "Cannot read property 'emit' of undefined"

**Проблема:** `io` не инициализирован или не в области видимости.

**Решение:** Сделай `io` глобальной переменной:
```typescript
let io: SocketIOServer;

// После создания:
io = new SocketIOServer(server, {...});
```

---

## 💡 Советы

1. **Логируй всё:** Добавляй `console.log()` после каждого `io.emit()` чтобы видеть что события отправляются.

2. **Проверяй userId:** Убедись что `userId` правильный и существует.

3. **Используй room:** Всегда используй `io.to(`user:${userId}`)` для личных событий.

4. **Graceful shutdown:** Добавь обработчики SIGTERM и SIGINT для корректного завершения WebSocket соединений.

---

**Готово! Теперь твой backend поддерживает real-time обновления!** 🎉
