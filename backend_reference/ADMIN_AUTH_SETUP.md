# 🔐 ADMIN AUTHENTICATION - INTEGRATION GUIDE

## 📋 ЧТО НУЖНО СДЕЛАТЬ:

### 1️⃣ Установить bcrypt (для хеширования паролей)

```bash
cd /root/cyberhub_backend
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### 2️⃣ Скопировать файлы на VDS

Скопируй эти файлы из `/backend_reference/` в `/root/cyberhub_backend/`:

- ✅ `admin-auth.ts` (новый файл)
- ✅ `database.ts` (обновлённый - добавлены таблицы admin_users и admin_sessions)

### 3️⃣ Обновить index.ts

Добавь в начало файла (после других импортов):

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

### 4️⃣ Инициализировать root админа при старте

Найди строку где инициализируется БД (около строки 800):

```typescript
(async () => {
  db = await initDB();
  console.log('✅ Database initialized');
  
  // 🔥 ДОБАВЬ ЭТУ СТРОКУ:
  await ensureRootAdmin(db);
  
  // ... остальной код
})();
```

### 5️⃣ Добавить Middleware для проверки админских токенов

Добавь ПОСЛЕ функции `requireSession` (около строки 156):

```typescript
// 🔐 Middleware для проверки админского токена
async function requireAdminSession(
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('❌ [AdminAuth] No token provided');
    return res.status(401).json({ error: 'No admin token' });
  }
  
  if (!db) {
    return res.status(500).json({ error: 'DB not ready' });
  }
  
  const session = await validateAdminToken(db, token);
  
  if (!session) {
    console.log('❌ [AdminAuth] Invalid or expired token');
    return res.status(401).json({ error: 'Invalid admin session' });
  }
  
  console.log(`✅ [AdminAuth] Valid session for: ${session.username} (${session.role})`);
  
  // Сохраняем данные админа в res.locals
  res.locals.adminSession = session;
  next();
}

// 🔐 Middleware для проверки прав доступа
function requireAdminRole(requiredRole: AdminRole) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = res.locals.adminSession;
    
    if (!session) {
      return res.status(401).json({ error: 'Admin session required' });
    }
    
    if (!checkAdminPermission(session.role, requiredRole)) {
      console.log(`❌ [AdminAuth] Insufficient permissions: ${session.role} < ${requiredRole}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
```

### 6️⃣ Добавить Endpoints для админской авторизации

Добавь ЭТИ ENDPOINTS ПЕРЕД всеми существующими `/api/admin/*` endpoints (около строки 900):

```typescript
// ============================================================================
// 🔐 ADMIN AUTHENTICATION ENDPOINTS
// ============================================================================

// POST /api/admin/login - Логин админа
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password required' 
      });
    }
    
    const result = await loginAdmin(db, username, password);
    
    if (!result) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
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
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/admin/logout - Выход админа
app.post('/api/admin/logout', requireAdminSession, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await logoutAdmin(db, token);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Admin logout error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/admin/me - Получить данные текущего админа
app.get('/api/admin/me', requireAdminSession, async (req, res) => {
  try {
    const session = res.locals.adminSession;
    res.json({
      success: true,
      admin: {
        id: session.admin_id,
        username: session.username,
        role: session.role,
      }
    });
  } catch (error) {
    console.error('❌ Admin me error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
```

### 7️⃣ Защитить существующие админские endpoints

Найди ВСЕ endpoints `/api/admin/*` (items, cases, requests) и добавь middleware:

**ПРИМЕР - было:**
```typescript
app.get('/api/admin/items', async (req, res) => {
  // ...
});
```

**СТАЛО:**
```typescript
app.get('/api/admin/items', requireAdminSession, async (req, res) => {
  // ...
});
```

**Какие endpoints защитить:**

```typescript
// Items (минимум 'admin' роль)
app.get('/api/admin/items', requireAdminSession, async (req, res) => { ... });
app.post('/api/admin/items', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });
app.put('/api/admin/items/:id', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });
app.delete('/api/admin/items/:id', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });

// Cases (минимум 'admin' роль)
app.get('/api/admin/cases', requireAdminSession, async (req, res) => { ... });
app.post('/api/admin/cases', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });
app.put('/api/admin/cases/:id', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });
app.delete('/api/admin/cases/:id', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });

// Requests (минимум 'moderator' роль для просмотра, 'admin' для approve/deny)
app.get('/api/admin/requests', requireAdminSession, async (req, res) => { ... });
app.post('/api/admin/requests/:id/approve', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });
app.post('/api/admin/requests/:id/deny', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });
app.post('/api/admin/requests/:id/return', requireAdminSession, requireAdminRole('admin'), async (req, res) => { ... });
```

### 8️⃣ Перезапустить Docker контейнер

```bash
docker restart cyberhub_api
docker logs -f cyberhub_api
```

---

## ✅ ОЖИДАЕМЫЕ ЛОГИ ПРИ СТАРТЕ:

```
✅ Database initialized
🔐 [AdminAuth] Creating default ROOT admin...
✅ [AdminAuth] Root admin created:
   Username: admin
   Password: paztehab255
   Role: owner
   🔥 CHANGE PASSWORD IMMEDIATELY!
Server running on port 3000
```

---

## 🧪 ТЕСТ ЧЕРЕЗ CURL:

```bash
# 1. Логин
curl -X POST http://91.107.120.48:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "paztehab255"}'

# Должен вернуть:
# {"success":true,"session_token":"admin_xxxxx","user_id":"...","username":"admin","role":"owner","email":"admin@cyberhub.com"}

# 2. Получить items (с токеном)
curl -X GET http://91.107.120.48:3000/api/admin/items \
  -H "Authorization: Bearer admin_xxxxx"

# Должен вернуть список items
```

---

## 📋 ФИНАЛЬНЫЙ ЧЕКЛИСТ:

- [ ] `npm install bcrypt @types/bcrypt`
- [ ] Скопировать `admin-auth.ts`
- [ ] Скопировать обновлённый `database.ts`
- [ ] Добавить импорты в `index.ts`
- [ ] Добавить `ensureRootAdmin(db)` при инициализации
- [ ] Добавить middleware `requireAdminSession` и `requireAdminRole`
- [ ] Добавить endpoints `/api/admin/login`, `/api/admin/logout`, `/api/admin/me`
- [ ] Защитить все `/api/admin/*` endpoints middleware
- [ ] Перезапустить Docker
- [ ] Проверить логи
- [ ] Протестировать логин через curl или админку

---

## 🔥 ГОТОВО!

После выполнения этих шагов:
1. ✅ Админка будет работать с реальной авторизацией
2. ✅ Root пользователь `admin` / `paztehab255` будет создан автоматически
3. ✅ Все админские endpoints будут защищены токеном
4. ✅ Frontend сможет создавать items без ошибок 401
