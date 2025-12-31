# ⚡ БЫСТРАЯ ИНСТРУКЦИЯ - ADMIN АВТОРИЗАЦИЯ

## 🚀 ЧТО ДЕЛАТЬ НА VDS:

### 1. Подключись к VDS:
```bash
ssh root@91.107.120.48
cd /root/cyberhub_backend
```

### 2. Установи bcrypt:
```bash
npm install bcrypt @types/bcrypt
```

### 3. Добавь новый файл admin-auth.ts:
```bash
nano admin-auth.ts
```
**Скопируй содержимое из `/backend_reference/admin-auth.ts`**

### 4. Обнови database.ts:
```bash
nano database.ts
```
**Добавь в конец перед `return db` (см. `/backend_reference/database.ts` строки 142-165):**
```typescript
  // 🔐 Таблица админов
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      last_login_at INTEGER
    );
  `)

  // 🔐 Таблица админских сессий
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      admin_id TEXT,
      username TEXT,
      role TEXT,
      created_at INTEGER,
      expires_at INTEGER,
      FOREIGN KEY(admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );
  `)
```

### 5. Обнови index.ts:

**a) Добавь импорты (в начало файла):**
```typescript
import { 
  loginAdmin, 
  validateAdminToken, 
  logoutAdmin, 
  ensureRootAdmin,
  checkAdminPermission,
  AdminRole
} from './admin-auth';
```

**b) Добавь инициализацию root админа (после `db = await initDB()`):**
```typescript
(async () => {
  db = await initDB();
  console.log('✅ Database initialized');
  
  // 🔥 ДОБАВЬ:
  await ensureRootAdmin(db);
  
  // ...
})();
```

**c) Добавь middleware (после функции requireSession):**
```typescript
// 🔐 Middleware для админов
async function requireAdminSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No admin token' });
  if (!db) return res.status(500).json({ error: 'DB not ready' });
  
  const session = await validateAdminToken(db, token);
  if (!session) return res.status(401).json({ error: 'Invalid admin session' });
  
  res.locals.adminSession = session;
  next();
}

function requireAdminRole(requiredRole: AdminRole) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = res.locals.adminSession;
    if (!session) return res.status(401).json({ error: 'Admin session required' });
    if (!checkAdminPermission(session.role, requiredRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

**d) Добавь endpoints для логина (ПЕРЕД существующими `/api/admin/*`):**
```typescript
// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }
    
    const result = await loginAdmin(db, username, password);
    if (!result) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const { token, admin } = result;
    res.json({
      success: true,
      session_token: token,
      user_id: admin.id,
      username: admin.username,
      role: admin.role,
      email: admin.email,
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
```

**e) Защити существующие админские endpoints:**

Найди ВСЕ строки типа:
```typescript
app.get('/api/admin/items', async (req, res) => {
```

Замени на:
```typescript
app.get('/api/admin/items', requireAdminSession, async (req, res) => {
```

**Для create/update/delete добавь проверку роли:**
```typescript
app.post('/api/admin/items', requireAdminSession, requireAdminRole('admin'), async (req, res) => {
app.put('/api/admin/items/:id', requireAdminSession, requireAdminRole('admin'), async (req, res) => {
app.delete('/api/admin/items/:id', requireAdminSession, requireAdminRole('admin'), async (req, res) => {
```

### 6. Перезапусти Docker:
```bash
docker restart cyberhub_api
docker logs -f cyberhub_api
```

**Жди в логах:**
```
🔐 [AdminAuth] Creating default ROOT admin...
✅ [AdminAuth] Root admin created:
   Username: admin
   Password: paztehab255
```

### 7. Проверь:
```bash
curl -X POST http://91.107.120.48:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "paztehab255"}'
```

**Должен вернуть:**
```json
{"success":true,"session_token":"admin_...","username":"admin","role":"owner"}
```

---

## ✅ ГОТОВО!

После этого админка на фронте автоматически заработает! 🚀
