# 🔥 MIGRATION: Dismiss Notifications System

## Проблема
Клиент сохраняет закрытые уведомления в localStorage, но при перезагрузке backend снова отдает все requests (pending, approved, denied). Это приводит к тому что закрытые заявки появляются снова.

## Решение
Добавить таблицу `dismissed_notifications` на backend и endpoint для dismiss.

---

## 📋 Шаг 1: Добавить таблицу в database.ts

**Файл:** `/backend_reference/database.ts`

**Добавить ПОСЛЕ таблицы `requests` (строка 133):**

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

## 📋 Шаг 2: Добавить endpoint Dismiss

**Файл:** `/backend_reference/index.ts`

**Добавить ПОСЛЕ `/api/user/requests` (после строки 731):**

```typescript
// 🔥 НОВОЕ: POST /api/user/requests/:requestId/dismiss - Закрыть уведомление (больше не показывать)
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

---

## 📋 Шаг 3: Обновить GET /api/user/requests

**Файл:** `/backend_reference/index.ts`

**ЗАМЕНИТЬ функцию `/api/user/requests` (строки 704-731):**

```typescript
// 🔥 ОБНОВЛЕНО: GET /api/user/requests - Получить активные заявки пользователя (исключая dismissed)
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

**Что изменилось:**
- ✅ Добавлен `LEFT JOIN dismissed_notifications` 
- ✅ Фильтр `AND dn.id IS NULL` - показывать только те requests которые НЕ в dismissed
- ✅ Добавлены дополнительные поля: `itemType`, `itemImage`, `caseName`

---

## 📋 Deployment Instructions

### 1. Backup БД
```bash
cd /root/cyberhub-backend
cp cyberhub.db cyberhub.db.backup_$(date +%Y%m%d_%H%M%S)
```

### 2. Обновить код
```bash
# Скопировать новые версии database.ts и index.ts на сервер
# Используй FileZilla или scp
```

### 3. Restart сервера
```bash
pm2 stop cyberhub-backend
pm2 start cyberhub-backend
pm2 logs cyberhub-backend
```

### 4. Проверка
```bash
# Проверить что таблица создалась
sqlite3 cyberhub.db "SELECT name FROM sqlite_master WHERE type='table' AND name='dismissed_notifications';"

# Должно вернуть: dismissed_notifications
```

---

## 🧪 Тестирование

1. **Создать заявку:**
   - Открыть кейс
   - Получить скин
   - Нажать "Получить"

2. **Админ отклоняет:**
   - В админке отклонить с причиной "Test rejection"

3. **Клиент закрывает:**
   - Увидеть красный круг с крестиком
   - Нажать крестик
   - **Проверить backend лог:** `🗑️ [Dismiss] User XXX dismissed request REQ-XXXXX`

4. **Перезагрузка:**
   - F5 на клиенте
   - **Ожидаемо:** Заявка НЕ появляется снова ✅

5. **Проверить БД:**
```bash
sqlite3 cyberhub.db "SELECT * FROM dismissed_notifications;"
```

---

## 📊 Структура таблицы

```sql
CREATE TABLE dismissed_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_uuid TEXT NOT NULL,         -- Какой пользователь закрыл
    request_id TEXT NOT NULL,        -- Какую заявку закрыл (REQ-XXXXXX)
    dismissed_at INTEGER NOT NULL,   -- Когда закрыл (timestamp)
    UNIQUE(user_uuid, request_id)    -- Один юзер не может закрыть одну заявку дважды
);

CREATE INDEX idx_dismissed_user ON dismissed_notifications(user_uuid);
```

---

## 🎯 Результат

- ✅ Закрытые уведомления хранятся в БД (не в localStorage)
- ✅ При перезагрузке закрытые заявки НЕ появляются
- ✅ Каждый пользователь видит только свои незакрытые заявки
- ✅ Админ может видеть всю историю в таблице `requests`
