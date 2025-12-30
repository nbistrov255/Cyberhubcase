import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { DataSource } from 'typeorm';

const app = express();
const server = http.createServer(app);

// 🔥 Socket.IO Configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Разрешаем все домены. В production укажите конкретный домен
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (ваша существующая конфигурация)
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'cyberhub',
  password: process.env.DB_PASSWORD || 'cyberhub_password',
  database: process.env.DB_NAME || 'cyberhub',
  synchronize: true, // В production поставьте false
  logging: false,
  entities: ['src/entities/**/*.ts'],
});

// Initialize database
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
  });

// 🔥 WebSocket Connection Handler
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);
  
  // Когда клиент идентифицируется (отправляет userId)
  socket.on('user:identify', (data: { userId: string }) => {
    console.log('👤 User identified:', data.userId, 'socket:', socket.id);
    // Присоединяем socket к комнате пользователя
    socket.join(`user:${data.userId}`);
  });
  
  // Обработка отключения
  socket.on('disconnect', (reason) => {
    console.log('🔴 Client disconnected:', socket.id, 'reason:', reason);
  });

  // Обработка ошибок
  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error);
  });
});

// ========================================
// AUTH MIDDLEWARE (ваш существующий код)
// ========================================
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Здесь ваша логика проверки токена
  // Например: jwt.verify(token, SECRET_KEY, (err, user) => { ... })
  
  // Временная заглушка - замените на вашу логику
  req.userId = 'user123'; // ID пользователя из токена
  next();
};

// ========================================
// ADMIN ROUTES - CASES MANAGEMENT
// ========================================

// GET all cases (public)
app.get('/api/cases', async (req, res) => {
  try {
    // Здесь ваша логика получения кейсов из БД
    // const cases = await caseRepository.find();
    
    res.json({ 
      success: true, 
      cases: [] // Замените на реальные данные
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cases' });
  }
});

// POST create case (admin only)
app.post('/api/admin/cases', async (req, res) => {
  try {
    const { name, image, price, items } = req.body;
    
    // Здесь ваша логика создания кейса в БД
    // const newCase = await caseRepository.save({ name, image, price, items });
    
    console.log('📦 Admin created new case:', name);
    
    // ✅ WebSocket: Уведомляем всех клиентов о новом кейсе
    io.emit('cases:updated');
    console.log('🔥 WebSocket: cases:updated emitted (new case)');
    
    res.json({ 
      success: true, 
      message: 'Case created successfully',
      // case: newCase 
    });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ success: false, error: 'Failed to create case' });
  }
});

// PUT update case (admin only)
app.put('/api/admin/cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, price, items } = req.body;
    
    // Здесь ваша логика обновления кейса в БД
    // await caseRepository.update(id, { name, image, price, items });
    
    console.log('✏️ Admin updated case:', id);
    
    // ✅ WebSocket: Уведомляем всех клиентов об обновлении
    io.emit('cases:updated');
    console.log('🔥 WebSocket: cases:updated emitted (case updated)');
    
    res.json({ 
      success: true, 
      message: 'Case updated successfully' 
    });
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ success: false, error: 'Failed to update case' });
  }
});

// DELETE case (admin only)
app.delete('/api/admin/cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Здесь ваша логика удаления кейса из БД
    // await caseRepository.delete(id);
    
    console.log('🗑️ Admin deleted case:', id);
    
    // ✅ WebSocket: Уведомляем всех клиентов об удалении
    io.emit('cases:updated');
    console.log('🔥 WebSocket: cases:updated emitted (case deleted)');
    
    res.json({ 
      success: true, 
      message: 'Case deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ success: false, error: 'Failed to delete case' });
  }
});

// ========================================
// USER ROUTES - CASE OPENING
// ========================================

// POST open case
app.post('/api/cases/open', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { caseId } = req.body;
    
    // Здесь ваша логика:
    // 1. Проверить баланс пользователя
    // 2. Списать стоимость кейса
    // 3. Выбрать случайный предмет
    // 4. Добавить предмет в инвентарь
    // 5. Обновить баланс
    
    const wonItem = {
      id: Date.now().toString(),
      name: 'AK-47 | Redline',
      rarity: 'legendary',
      image: 'https://example.com/item.png'
    };
    
    // Получаем обновленный баланс
    const updatedBalance = 1000; // Замените на реальный баланс из БД
    
    console.log(`🎰 User ${userId} opened case ${caseId}, won:`, wonItem.name);
    
    // ✅ WebSocket: Уведомляем пользователя о новом балансе
    io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
      balance: updatedBalance 
    });
    console.log(`🔥 WebSocket: balance updated for user ${userId}`);
    
    // ✅ WebSocket: Уведомляем об обновлении инвентаря
    io.to(`user:${userId}`).emit(`inventory:updated:${userId}`);
    console.log(`🔥 WebSocket: inventory updated for user ${userId}`);
    
    res.json({ 
      success: true, 
      item: wonItem,
      balance: updatedBalance
    });
  } catch (error) {
    console.error('Error opening case:', error);
    res.status(500).json({ success: false, error: 'Failed to open case' });
  }
});

// ========================================
// PAYMENT ROUTES
// ========================================

// POST payment callback (webhook от SmartShell)
app.post('/api/payment/callback', async (req, res) => {
  try {
    const { userId, amount, status } = req.body;
    
    if (status !== 'success') {
      console.log('⚠️ Payment not successful:', status);
      return res.json({ success: false });
    }
    
    // Здесь ваша логика:
    // 1. Проверить подпись от SmartShell
    // 2. Добавить деньги на баланс
    // 3. Сохранить транзакцию в БД
    
    const updatedBalance = 1500; // Замените на реальный баланс из БД
    
    console.log(`💵 Payment processed for user ${userId}: +${amount}€`);
    
    // ✅ WebSocket: Уведомляем пользователя о пополнении баланса
    io.to(`user:${userId}`).emit(`balance:updated:${userId}`, { 
      balance: updatedBalance 
    });
    console.log(`🔥 WebSocket: balance credited for user ${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, error: 'Payment processing failed' });
  }
});

// ========================================
// INVENTORY ROUTES
// ========================================

// GET user inventory
app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Здесь ваша логика получения инвентаря из БД
    // const inventory = await inventoryRepository.find({ userId });
    
    res.json({ 
      success: true, 
      items: [] // Замените на реальные данные
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

// POST claim item (получение денег за предмет)
app.post('/api/inventory/claim', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;
    
    // Здесь ваша логика:
    // 1. Проверить что предмет принадлежит пользователю
    // 2. Начислить деньги на баланс
    // 3. Обновить статус предмета
    
    console.log(`💰 User ${userId} claimed item ${itemId}`);
    
    // ✅ WebSocket: Уведомляем пользователя об обновлении инвентаря
    io.to(`user:${userId}`).emit(`inventory:updated:${userId}`);
    console.log(`🔥 WebSocket: inventory updated for user ${userId}`);
    
    res.json({ 
      success: true, 
      message: 'Item claimed successfully' 
    });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ success: false, error: 'Failed to claim item' });
  }
});

// ========================================
// PROFILE ROUTES
// ========================================

// GET user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Здесь ваша логика получения профиля из БД
    // const profile = await userRepository.findOne({ id: userId });
    
    res.json({ 
      success: true, 
      profile: {
        id: userId,
        username: 'Player',
        balance: 1000,
        dailySum: 50,
        monthlySum: 500,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// ========================================
// STATISTICS ROUTES
// ========================================

// GET public statistics
app.get('/api/stats/public', async (req, res) => {
  try {
    // Здесь ваша логика получения статистики из БД
    
    res.json({
      success: true,
      stats: {
        casesOpened: 12543,
        uniquePlayers: 3421,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    websocket: io.engine.clientsCount > 0 ? 'active' : 'idle',
    clients: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log('🚀  CyberHub Backend Server Started!');
  console.log('🚀 ============================================');
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ============================================');
  console.log('');
  console.log('📊 Available endpoints:');
  console.log('  GET  /health              - Health check');
  console.log('  GET  /api/cases           - Get all cases');
  console.log('  POST /api/cases/open      - Open a case');
  console.log('  GET  /api/profile         - Get user profile');
  console.log('  GET  /api/inventory       - Get user inventory');
  console.log('  POST /api/payment/callback - Payment webhook');
  console.log('');
  console.log('🔐 Admin endpoints:');
  console.log('  POST   /api/admin/cases     - Create case');
  console.log('  PUT    /api/admin/cases/:id - Update case');
  console.log('  DELETE /api/admin/cases/:id - Delete case');
  console.log('');
  console.log('🔥 WebSocket events:');
  console.log('  cases:updated              - Cases list changed');
  console.log('  balance:updated:userId     - User balance changed');
  console.log('  inventory:updated:userId   - User inventory changed');
  console.log('');
  console.log('✅ Server is ready to accept connections!');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    AppDataSource.destroy().then(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    AppDataSource.destroy().then(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});
