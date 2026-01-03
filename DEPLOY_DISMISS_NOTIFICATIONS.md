# 🚀 DEPLOY: Fix Persistent Notifications Bug

## 🐛 Проблема

**Симптомы:**
1. Админ отклоняет заявку в админке
2. Клиент видит красный круг с крестиком (статус "denied")
3. Клиент нажимает крестик → заявка исчезает
4. F5 (перезагрузка страницы)
5. ❌ **Заявка снова появляется!**
6. При клике на крестик пишет: "Cannot close pending request. Wait for admin response."

**Причина:**
- Клиент сохранял закрытые уведомления в `localStorage`
- Backend при GET `/api/user/requests` отдавал ВСЕ requests (pending, approved, denied)
- При перезагрузке `localStorage` очищался или не синхронизировался правильно
- Заявки появлялись снова

---

## ✅ Решение

### Backend:
1. ✅ Добавлена таблица `dismissed_notifications` для хранения закрытых уведомлений
2. ✅ Добавлен endpoint `POST /api/user/requests/:requestId/dismiss`
3. ✅ Обновлен endpoint `GET /api/user/requests` - фильтрует dismissed notifications

### Frontend:
1. ✅ `handleRemoveRequest` теперь вызывает API вместо `localStorage`
2. ✅ `fetchActiveRequests` не фильтрует по `localStorage` (backend сам фильтрует)
3. ✅ Миграция: очистка старого `closedNotifications` из `localStorage`

---

## 📋 Deployment Instructions

### **Шаг 1: Backup БД на VDS**

```bash
ssh root@91.107.120.48
cd /root/cyberhub-backend
cp cyberhub.db cyberhub.db.backup_$(date +%Y%m%d_%H%M%S)
ls -lh cyberhub.db*
```

---

### **Шаг 2: Обновить Backend файлы**

#### 2.1. Обновить `database.ts`

**Файл:** `/root/cyberhub-backend/database.ts`

**Добавить ПОСЛЕ таблицы `admin_sessions` (строка ~165):**

```typescript
  // 🔥 Таблица закрытых уведомлений (Dismissed Notifications)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dismissed_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_uuid TEXT NOT NULL,
      request_id TEXT NOT NULL,
      dismissed_at INTEGER NOT NULL,
      UNIQUE(user_uuid, request_id)
    );
  `)
  
  // Индекс для быстрого поиска
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dismissed_user 
    ON dismissed_notifications(user_uuid);
  `)
```

---

#### 2.2. Обновить `index.ts`

**Файл:** `/root/cyberhub-backend/index.ts`

##### **2.2.1. Добавить endpoint Dismiss (ПОСЛЕ строки 731)**

```typescript
// 🔥 НОВОЕ: POST /api/user/requests/:requestId/dismiss - Закрыть уведомление
app.post("/api/user/requests/:requestId/dismiss", requireSession, async (req, res) => {
    try {
        const user_uuid = res.locals.session.user_uuid;
        const requestId = req.params.requestId;
        
        // Проверяем что request принадлежит пользователю
        const request = await db.get(`
            SELECT id FROM requests 
            WHERE id = ? AND user_uuid = ?
        `, requestId, user_uuid);
        
        if (!request) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }
        
        // Сохраняем dismissal
        await db.run(`
            INSERT INTO dismissed_notifications (user_uuid, request_id, dismissed_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_uuid, request_id) DO UPDATE SET dismissed_at = excluded.dismissed_at
        `, user_uuid, requestId, Date.now());
        
        console.log(`🗑️ [Dismiss] User ${user_uuid} dismissed request ${requestId}`);
        res.json({ success: true });
    } catch (e: any) {
        console.error("❌ [Dismiss] Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});
```

##### **2.2.2. Заменить GET /api/user/requests (строки 704-731)**

**СТАРАЯ ВЕРСИЯ (удалить):**
```typescript
app.get("/api/user/requests", requireSession, async (req, res) => {
    try {
        const user_uuid = res.locals.session.user_uuid;
        
        // Получаем только активные заявки (pending)
        const requests = await db.all(`
            SELECT 
                r.id as requestId,
                r.inventory_id as id,
                r.item_title as itemName,
                r.status,
                r.created_at,
                r.updated_at,
                r.admin_comment,
                inv.rarity as itemRarity
            FROM requests r
            LEFT JOIN inventory inv ON r.inventory_id = inv.id
            WHERE r.user_uuid = ? AND r.status IN ('pending', 'approved', 'denied')
            ORDER BY r.created_at DESC
        `, user_uuid);
        
        console.log(`📋 [User Requests] Found ${requests.length} requests for user ${user_uuid}`);
        res.json({ success: true, requests });
    } catch (e: any) {
        console.error("❌ [User Requests] Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});
```

**НОВАЯ ВЕРСИЯ (вставить):**
```typescript
// 🔥 ОБНОВЛЕНО: GET /api/user/requests - Получить активные заявки (исключая dismissed)
app.get("/api/user/requests", requireSession, async (req, res) => {
    try {
        const user_uuid = res.locals.session.user_uuid;
        
        // 🔥 НОВОЕ: Получаем только НЕзакрытые заявки
        const requests = await db.all(`
            SELECT 
                r.id as requestId,
                r.inventory_id as id,
                r.item_title as itemName,
                r.status,
                r.created_at,
                r.updated_at,
                r.admin_comment,
                r.type as itemType,
                inv.rarity as itemRarity,
                inv.image_url as itemImage,
                sp.case_id,
                c.title as caseName
            FROM requests r
            LEFT JOIN inventory inv ON r.inventory_id = inv.id
            LEFT JOIN spins sp ON sp.user_uuid = r.user_uuid AND sp.prize_title = r.item_title
            LEFT JOIN cases c ON sp.case_id = c.id
            LEFT JOIN dismissed_notifications dn ON dn.request_id = r.id AND dn.user_uuid = r.user_uuid
            WHERE r.user_uuid = ? 
                AND r.status IN ('pending', 'approved', 'denied')
                AND dn.id IS NULL
            ORDER BY r.created_at DESC
        `, user_uuid);
        
        console.log(`📋 [User Requests] Found ${requests.length} active requests for user ${user_uuid}`);
        res.json({ success: true, requests });
    } catch (e: any) {
        console.error("❌ [User Requests] Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});
```

**Ключевые изменения:**
- ✅ `LEFT JOIN dismissed_notifications` - присоединяем dismissed
- ✅ `AND dn.id IS NULL` - показываем только те requests которые НЕ dismissed
- ✅ Добавлены поля `itemType`, `itemImage`, `caseName` для полной информации

---

### **Шаг 3: Restart Backend**

```bash
cd /root/cyberhub-backend
pm2 stop cyberhub-backend
pm2 start cyberhub-backend
pm2 logs cyberhub-backend --lines 50
```

**Ожидаемый вывод:**
```
✅ Database initialized
🔐 Root admin created/verified
🚀 Server running on port 3000
🔥 WebSocket server started
```

---

### **Шаг 4: Проверка БД**

```bash
sqlite3 /root/cyberhub-backend/cyberhub.db

-- Проверить что таблица создалась
.tables

-- Должно быть:
-- dismissed_notifications

-- Проверить структуру
.schema dismissed_notifications

-- Должно быть:
-- CREATE TABLE dismissed_notifications (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   user_uuid TEXT NOT NULL,
--   request_id TEXT NOT NULL,
--   dismissed_at INTEGER NOT NULL,
--   UNIQUE(user_uuid, request_id)
-- );

.exit
```

---

### **Шаг 5: Deploy Frontend (автоматически через Figma Make)**

Frontend уже обновлен в этом сеансе:
- ✅ `handleRemoveRequest` теперь async и вызывает `/api/user/requests/:requestId/dismiss`
- ✅ `fetchActiveRequests` не фильтрует по `localStorage`
- ✅ Миграция: очистка `closedNotifications` из `localStorage` при загрузке

**Изменения автоматически применятся при следующем build.**

---

## 🧪 Тестирование

### **Тест 1: Создание и отклонение заявки**

1. **Клиент:** Откройте кейс и получите скин
2. **Клиент:** Нажмите "Получить"
3. **Backend:** Проверьте логи:
   ```
   📝 Creating request REQ-XXXXXX for item "..."
   ✅ Request created successfully
   ```
4. **Админ:** Откройте админку → Requests
5. **Админ:** Отклоните заявку с причиной "Test rejection"
6. **Backend:** Проверьте логи:
   ```
   ✅ [Admin] Request REQ-XXXXXX denied
   🔥 WebSocket: inventory updated for user ...
   ```
7. **Клиент:** Увидите красный круг с крестиком
8. **Клиент:** Кликните на круг → откроется drawer с причиной отклонения

---

### **Тест 2: Dismiss заявки**

1. **Клиент:** Нажмите крестик на заявке
2. **Backend:** Проверьте логи:
   ```
   🗑️ [Dismiss] User <uuid> dismissed request REQ-XXXXXX
   ```
3. **БД:** Проверьте:
   ```bash
   sqlite3 cyberhub.db "SELECT * FROM dismissed_notifications;"
   ```
   Должна появиться запись:
   ```
   1|<user_uuid>|REQ-XXXXXX|<timestamp>
   ```
4. **Клиент:** Заявка исчезла из UI ✅

---

### **Тест 3: Перезагрузка (главный тест!)**

1. **Клиент:** Нажмите F5 (перезагрузка страницы)
2. **Backend:** Проверьте логи:
   ```
   📋 [User Requests] Found 0 active requests for user <uuid>
   ```
3. **Клиент:** Заявка НЕ появилась снова! ✅✅✅
4. **Консоль DevTools:** Проверьте:
   ```
   ✅ [PlayerProfile] Active requests loaded: 0
   🧹 [PlayerProfile] Removed old closedNotifications from localStorage (migrated to backend)
   ```

---

### **Тест 4: Множественные заявки**

1. **Клиент:** Создайте 3 заявки (откройте 3 кейса)
2. **Админ:** Отклоните 2, одобрите 1
3. **Клиент:** Закройте все 3 заявки крестиком
4. **БД:** Проверьте:
   ```bash
   sqlite3 cyberhub.db "SELECT COUNT(*) FROM dismissed_notifications WHERE user_uuid='<uuid>';"
   ```
   Должно вернуть: `3`
5. **Клиент:** F5 → видите 0 заявок ✅

---

## 🔍 Troubleshooting

### Ошибка: "Cannot close pending request"

**Проблема:** Request имеет статус "pending" в state, но визуально показывается как "denied"

**Решение:**
1. Проверьте логи backend:
   ```
   📋 [User Requests] Found X requests for user <uuid>
   ```
2. Проверьте БД:
   ```bash
   sqlite3 cyberhub.db "SELECT id, status FROM requests WHERE user_uuid='<uuid>' ORDER BY created_at DESC LIMIT 5;"
   ```
3. Если статус в БД = "denied", но клиент видит "pending":
   - Проблема в WebSocket синхронизации
   - Нажмите кнопку "Refresh" в инвентаре
   - Backend снова загрузит правильный статус

---

### Ошибка: "Request not found" при dismiss

**Проблема:** Request был удален из БД, но клиент пытается его dismiss

**Решение:**
1. Это нормально - клиент просто игнорирует ошибку
2. Request удаляется из UI даже если backend вернул ошибку
3. Проверьте логи:
   ```
   ❌ [handleRemoveRequest] Failed to dismiss request REQ-XXXXXX: 404
   🗑️ [handleRemoveRequest] Removing ... from claimRequests
   ```

---

### Заявки все еще появляются после F5

**Проблема:** Backend не фильтрует dismissed notifications

**Решение:**
1. Проверьте что таблица `dismissed_notifications` создалась:
   ```bash
   sqlite3 cyberhub.db ".tables" | grep dismissed
   ```
2. Проверьте что endpoint `/api/user/requests` обновился:
   ```bash
   curl -H "Authorization: Bearer <token>" http://91.107.120.48:3000/api/user/requests
   ```
3. Если в ответе есть dismissed requests - обновите SQL запрос в index.ts (добавьте `LEFT JOIN dismissed_notifications`)

---

## 📊 Мониторинг

### Полезные SQL запросы

```bash
# Посмотреть все dismissed notifications
sqlite3 cyberhub.db "SELECT * FROM dismissed_notifications ORDER BY dismissed_at DESC LIMIT 10;"

# Посмотреть dismissed notifications для конкретного юзера
sqlite3 cyberhub.db "SELECT * FROM dismissed_notifications WHERE user_uuid='<uuid>';"

# Посмотреть requests которые НЕ dismissed
sqlite3 cyberhub.db "
SELECT r.id, r.status, dn.id as dismissed_id 
FROM requests r 
LEFT JOIN dismissed_notifications dn ON dn.request_id = r.id AND dn.user_uuid = r.user_uuid
WHERE r.user_uuid='<uuid>' AND dn.id IS NULL;
"

# Статистика
sqlite3 cyberhub.db "
SELECT 
    COUNT(*) as total_requests,
    SUM(CASE WHEN dn.id IS NOT NULL THEN 1 ELSE 0 END) as dismissed_count
FROM requests r
LEFT JOIN dismissed_notifications dn ON dn.request_id = r.id AND dn.user_uuid = r.user_uuid
WHERE r.user_uuid='<uuid>';
"
```

---

## 🎯 Результат

После deployment:
- ✅ Крестик удаляет заявку навсегда (сохраняется в БД)
- ✅ При F5 закрытые заявки НЕ появляются снова
- ✅ Каждый пользователь видит только свои незакрытые заявки
- ✅ Админ видит полную историю в таблице `requests`
- ✅ Нет фантомных "pending" заявок
- ✅ localStorage больше не используется для dismissed notifications

---

## 📝 Rollback Plan

Если что-то пойдет не так:

```bash
# 1. Восстановить БД из backup
cd /root/cyberhub-backend
cp cyberhub.db cyberhub.db.broken
cp cyberhub.db.backup_<timestamp> cyberhub.db

# 2. Откатить изменения в коде
git checkout HEAD database.ts index.ts

# 3. Restart
pm2 restart cyberhub-backend
```

**Frontend откатится автоматически** если вы откатите backend (старый localStorage код все еще работает).

---

## ✅ Checklist

- [ ] Backup БД создан
- [ ] `database.ts` обновлен (таблица + индекс)
- [ ] `index.ts` обновлен (dismiss endpoint + GET фильтрация)
- [ ] Backend перезапущен
- [ ] Таблица `dismissed_notifications` существует в БД
- [ ] Тест 1: Заявка отклонена
- [ ] Тест 2: Крестик работает (dismiss API вызывается)
- [ ] Тест 3: F5 → заявки НЕ появляются ✅
- [ ] Логи чистые (нет ошибок)
- [ ] Frontend migration запустилась (closedNotifications удален)

---

**Готово! 🚀 Проблема с persistent notifications исправлена навсегда.**
