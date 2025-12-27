# 🤖 CyberHub - Инструкция для ChatGPT/Backend разработчика

## 📋 О проекте

**CyberHub** - платформа для открытия кейсов для компьютерных клубов с интеграцией **SmartShell API**.

### Два независимых приложения:

1. **Клиентское приложение** (Desktop Windows .exe)
   - React + TypeScript + Tailwind
   - Будет компилироваться в .exe через Electron/Tauri
   - Для клиентов компьютерных клубов

2. **Админ-панель** (Web сайт на домене)
   - React + TypeScript + Tailwind
   - Веб-приложение для персонала
   - Управление кейсами, пользователями, заявками

---

## 🎯 Задача для ChatGPT

Создать **Backend API** для обоих приложений с интеграцией **SmartShell API**.

---

## 📦 Структура проекта (что уже готово)

### Клиентское приложение

**Главные компоненты:**
- `/src/app/ClientApp.tsx` - основное приложение
- `/src/app/components/CasesPage.tsx` - главная страница с кейсами
- `/src/app/components/CaseOpenPage.tsx` - открытие кейса (рулетка)
- `/src/app/components/WinPage.tsx` - экран выигрыша
- `/src/app/components/InventoryPage.tsx` - инвентарь игрока
- `/src/app/components/PlayerProfile.tsx` - профиль игрока

**Контекст локализации:**
- `/src/app/contexts/LanguageContext.tsx` - EN/RU/LV

### Админ-панель

**Главные страницы:**
- `/src/app/admin/pages/LoginPage.tsx` - вход в систему
- `/src/app/admin/pages/DashboardPage.tsx` - статистика
- `/src/app/admin/pages/ItemsPage.tsx` - управление предметами
- `/src/app/admin/pages/CasesPage.tsx` - управление кейсами
- `/src/app/admin/pages/RequestsPage.tsx` - заявки на выдачу призов
- `/src/app/admin/pages/ProblemQueuePage.tsx` - проблемные заявки
- `/src/app/admin/pages/UsersPage.tsx` - управление админами
- `/src/app/admin/pages/LogsPage.tsx` - логи действий

**Контекст локализации:**
- `/src/app/admin/contexts/AdminLanguageContext.tsx` - EN/RU/LV

---

## 🔧 Что нужно реализовать (Backend)

### 1. База данных

#### Таблица `users` (клиенты)
```sql
id              UUID PRIMARY KEY
smartshell_id   VARCHAR UNIQUE    -- ID из SmartShell
username        VARCHAR
balance         DECIMAL(10, 2)    -- Баланс SmartShell
total_spent     DECIMAL(10, 2)
cases_opened    INT
created_at      TIMESTAMP
last_active     TIMESTAMP
```

#### Таблица `items` (предметы в кейсах)
```sql
id              UUID PRIMARY KEY
name_en         VARCHAR
name_ru         VARCHAR
name_lv         VARCHAR
description_en  TEXT
description_ru  TEXT
description_lv  TEXT
image_url       VARCHAR
type            ENUM('physical', 'balance', 'virtual')
rarity          ENUM('common', 'rare', 'epic', 'legendary', 'mythic')
stock           INT               -- NULL для balance (unlimited)
low_stock       INT
status          ENUM('active', 'hidden')
created_at      TIMESTAMP
```

#### Таблица `cases` (кейсы)
```sql
id              UUID PRIMARY KEY
name_en         VARCHAR
name_ru         VARCHAR
name_lv         VARCHAR
image_url       VARCHAR
type            ENUM('daily', 'monthly')
price           DECIMAL(10, 2)
deposit_min     DECIMAL(10, 2)    -- Минимальный депозит для доступа
status          ENUM('draft', 'active', 'hidden')
created_at      TIMESTAMP
version         INT               -- Версионность
```

#### Таблица `case_items` (состав кейса - many-to-many)
```sql
id              UUID PRIMARY KEY
case_id         UUID REFERENCES cases(id)
item_id         UUID REFERENCES items(id)
drop_chance     DECIMAL(5, 2)     -- В процентах (0.01 - 100.00)
```

#### Таблица `user_inventory` (инвентарь игрока)
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
item_id         UUID REFERENCES items(id)
won_from_case   UUID REFERENCES cases(id)
status          ENUM('in_inventory', 'claimed', 'returned')
won_at          TIMESTAMP
claimed_at      TIMESTAMP
```

#### Таблица `prize_requests` (заявки на выдачу)
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
inventory_id    UUID REFERENCES user_inventory(id)
item_id         UUID REFERENCES items(id)
phone           VARCHAR
nickname        VARCHAR
comment         TEXT
status          ENUM('pending', 'approved', 'denied', 'returned', 'expired')
admin_comment   TEXT
processed_by    UUID REFERENCES admin_users(id)
processed_at    TIMESTAMP
created_at      TIMESTAMP
```

#### Таблица `admin_users` (администраторы)
```sql
id              UUID PRIMARY KEY
username        VARCHAR UNIQUE
password_hash   VARCHAR
email           VARCHAR
full_name       VARCHAR
role            ENUM('owner', 'administrator', 'moderator')
status          ENUM('active', 'blocked')
blocked_until   TIMESTAMP
created_at      TIMESTAMP
last_active     TIMESTAMP
```

#### Таблица `audit_logs` (логи действий)
```sql
id              UUID PRIMARY KEY
admin_id        UUID REFERENCES admin_users(id)
action          VARCHAR           -- "created_item", "opened_case", etc.
entity_type     VARCHAR           -- "item", "case", "request"
entity_id       UUID
details         JSONB             -- Дополнительная информация
ip_address      VARCHAR
created_at      TIMESTAMP
```

---

### 2. API Endpoints

#### **Клиентское приложение**

**Аутентификация:**
```
POST /api/auth/smartshell
Body: { smartshell_token: string }
Response: { user: User, token: string }
```

**Кейсы:**
```
GET /api/cases
Response: { cases: Case[] }

GET /api/cases/:id
Response: { case: Case, items: Item[] }

POST /api/cases/:id/open
Headers: { Authorization: "Bearer <token>" }
Response: { won_item: Item, animation_sequence: number[] }
```

**Инвентарь:**
```
GET /api/inventory
Headers: { Authorization: "Bearer <token>" }
Response: { items: InventoryItem[] }

POST /api/inventory/:id/claim
Headers: { Authorization: "Bearer <token>" }
Body: { phone: string, nickname: string, comment: string }
Response: { request_id: UUID }
```

**Профиль:**
```
GET /api/profile
Headers: { Authorization: "Bearer <token>" }
Response: { user: User, stats: Stats }

GET /api/profile/:user_id
Response: { user: PublicUser, recent_wins: Win[] }
```

**Лента дропов:**
```
GET /api/drops/live
Response: { drops: Drop[] }  // Последние 50 выигрышей
```

#### **Админ-панель**

**Аутентификация:**
```
POST /api/admin/auth/login
Body: { username: string, password: string }
Response: { admin: AdminUser, token: string }

POST /api/admin/auth/change-password
Headers: { Authorization: "Bearer <admin-token>" }
Body: { old_password: string, new_password: string }
```

**Предметы:**
```
GET /api/admin/items
GET /api/admin/items/:id
POST /api/admin/items
PUT /api/admin/items/:id
DELETE /api/admin/items/:id
```

**Кейсы:**
```
GET /api/admin/cases
GET /api/admin/cases/:id
POST /api/admin/cases
PUT /api/admin/cases/:id
DELETE /api/admin/cases/:id
PUT /api/admin/cases/:id/publish
```

**Заявки:**
```
GET /api/admin/requests
GET /api/admin/requests/:id
PUT /api/admin/requests/:id/approve
PUT /api/admin/requests/:id/deny
PUT /api/admin/requests/:id/return
```

**Пользователи (админы):**
```
GET /api/admin/users
POST /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
PUT /api/admin/users/:id/block
```

**Логи:**
```
GET /api/admin/logs
Query: ?start_date=...&end_date=...&admin_id=...&action=...
```

**Статистика:**
```
GET /api/admin/stats/dashboard
Response: {
  cases_opened_today: number,
  cases_opened_week: number,
  cases_opened_month: number,
  pending_requests: number,
  problem_queue: number,
  low_stock_items: number,
  revenue_today: number,
  revenue_week: number,
  revenue_month: number
}
```

---

### 3. SmartShell API интеграция

#### Что нужно от SmartShell API:

**Авторизация пользователя:**
- Получить токен/ID пользователя из SmartShell
- Получить баланс пользователя

**Списание средств:**
- При открытии кейса списать стоимость кейса с баланса SmartShell

**Начисление средств:**
- Если выигран "Balance Bonus", начислить на SmartShell баланс

**Проверка депозита:**
- Проверить, что пользователь внёс минимальный депозит для доступа к кейсу

**Webhook (опционально):**
- Уведомление о пополнении баланса
- Уведомление об изменении статуса пользователя

---

### 4. Бизнес-логика

#### Открытие кейса:

```typescript
async function openCase(userId: string, caseId: string) {
  // 1. Проверить баланс пользователя в SmartShell
  const balance = await smartshellAPI.getBalance(userId);
  const caseData = await db.getCase(caseId);
  
  if (balance < caseData.price) {
    throw new Error('Insufficient balance');
  }
  
  // 2. Проверить депозит
  const userDeposit = await smartshellAPI.getTotalDeposit(userId);
  if (userDeposit < caseData.deposit_min) {
    throw new Error('Minimum deposit required');
  }
  
  // 3. Списать стоимость кейса
  await smartshellAPI.deductBalance(userId, caseData.price);
  
  // 4. Получить предметы кейса с шансами
  const items = await db.getCaseItems(caseId);
  
  // 5. ВАЖНО: Генерация на сервере (честная)
  const wonItem = selectRandomItem(items);
  
  // 6. Проверить сток
  if (wonItem.type !== 'balance' && wonItem.stock <= 0) {
    // Если стока нет, выдать другой предмет или вернуть деньги
    await smartshellAPI.addBalance(userId, caseData.price);
    throw new Error('Item out of stock');
  }
  
  // 7. Если выигран Balance Bonus
  if (wonItem.type === 'balance') {
    // Начислить баланс
    await smartshellAPI.addBalance(userId, wonItem.balance_amount);
  } else {
    // Уменьшить сток
    await db.decrementStock(wonItem.id);
  }
  
  // 8. Добавить в инвентарь
  await db.addToInventory(userId, wonItem.id, caseId);
  
  // 9. Логировать действие
  await db.createLog('case_opened', userId, caseId, wonItem.id);
  
  // 10. Добавить в ленту живых дропов
  await db.addLiveDrop(userId, wonItem.id, caseId);
  
  return {
    won_item: wonItem,
    animation_sequence: generateAnimationSequence(wonItem)
  };
}
```

#### Генерация честного результата:

```typescript
function selectRandomItem(items: CaseItem[]): Item {
  // Нормализовать шансы
  const totalChance = items.reduce((sum, item) => sum + item.drop_chance, 0);
  
  // Генерация случайного числа
  const random = Math.random() * totalChance;
  
  let accumulated = 0;
  for (const item of items) {
    accumulated += item.drop_chance;
    if (random <= accumulated) {
      return item;
    }
  }
  
  // Fallback
  return items[0];
}
```

#### Заявка на выдачу:

```typescript
async function claimPrize(userId: string, inventoryItemId: string, data: ClaimData) {
  // 1. Проверить, что предмет в инвентаре
  const inventoryItem = await db.getInventoryItem(inventoryItemId);
  
  if (inventoryItem.user_id !== userId) {
    throw new Error('Not your item');
  }
  
  if (inventoryItem.status !== 'in_inventory') {
    throw new Error('Item already claimed');
  }
  
  // 2. Создать заявку
  const request = await db.createPrizeRequest({
    user_id: userId,
    inventory_id: inventoryItemId,
    item_id: inventoryItem.item_id,
    phone: data.phone,
    nickname: data.nickname,
    comment: data.comment,
    status: 'pending'
  });
  
  // 3. Обновить статус в инвентаре
  await db.updateInventoryStatus(inventoryItemId, 'claimed');
  
  // 4. Логировать
  await db.createLog('prize_claimed', userId, inventoryItemId);
  
  return request;
}
```

---

## 🔐 Безопасность

### JWT Токены

**Для клиентов:**
```typescript
const token = jwt.sign(
  { user_id: user.id, type: 'client' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Для админов:**
```typescript
const token = jwt.sign(
  { admin_id: admin.id, role: admin.role, type: 'admin' },
  process.env.ADMIN_JWT_SECRET,
  { expiresIn: '24h' }
);
```

### Middleware для проверки ролей:

```typescript
function requireRole(allowedRoles: AdminRole[]) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Использование:
app.delete('/api/admin/users/:id', requireRole(['owner']), deleteUser);
```

---

## 📊 Рекомендуемый стек для Backend

### Вариант 1: Node.js + Express
```bash
npm install express cors helmet bcryptjs jsonwebtoken
npm install pg sequelize  # PostgreSQL
```

### Вариант 2: Python + FastAPI
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary
pip install python-jose[cryptography] passlib[bcrypt]
```

### Вариант 3: PHP + Laravel
```bash
composer require laravel/framework
composer require tymon/jwt-auth
```

---

## 🚀 Деплой

### Backend
- API сервер на порте 3000 (или другом)
- База данных PostgreSQL/MySQL
- Redis для кеширования (опционально)

### Клиент (Desktop)
- Собрать .exe через Electron/Tauri
- Распространять через SmartShell или сайт

### Админ-панель (Web)
- Деплой на домен: `admin.cyberhub.com`
- Nginx/Apache reverse proxy к API

---

## ✅ Приоритеты

### Phase 1 (MVP):
1. ✅ База данных + миграции
2. ✅ API для открытия кейсов
3. ✅ API для инвентаря
4. ✅ API админки (CRUD items/cases)
5. ✅ SmartShell интеграция (баланс)

### Phase 2:
6. ✅ Заявки на выдачу
7. ✅ Система логов
8. ✅ Лента живых дропов
9. ✅ Статистика dashboard

### Phase 3:
10. ✅ WebSocket для live updates
11. ✅ Email уведомления
12. ✅ Расширенная аналитика
13. ✅ Экспорт данных

---

## 📝 Примечания

- **Mock данные**: Сейчас всё работает на localStorage
- **Нужно заменить**: Все вызовы localStorage на API запросы
- **Честная генерация**: Открытие кейса ОБЯЗАТЕЛЬНО на сервере
- **Стоки**: Автоматическая проверка при открытии
- **Логи**: Все действия логировать для аудита

---

## 📞 Контакты

При вопросах:
- Проверьте `/DEPLOYMENT_GUIDE.md`
- Изучите `/ADMIN_README.md`
- Посмотрите код компонентов

**Удачи в разработке! 🚀**
