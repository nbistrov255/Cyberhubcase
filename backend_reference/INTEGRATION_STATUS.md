# Backend-Frontend Integration Status

Статус интеграции всех компонентов фронтенда с backend API.

---

## ✅ ПОЛНОСТЬЮ ИНТЕГРИРОВАНО

### 🔐 Авторизация
- **Component:** `/src/app/components/LoginModal.tsx`
- **Endpoint:** `POST /api/auth/session`
- **Status:** ✅ Работает
- **Notes:** SmartShell авторизация, session token сохраняется в localStorage

### 👤 Профиль пользователя
- **Component:** `/src/app/components/ProfilePage.tsx`
- **Endpoint:** `GET /api/profile`
- **Status:** ✅ Работает
- **Features:**
  - Показывает баланс (SmartShell)
  - Daily/Monthly прогресс
  - Доступные кейсы
  - Trade Link управление

### 📊 Live Feed
- **Component:** `/src/app/components/TopBar.tsx`
- **Endpoint:** `GET /api/drops/recent`
- **Status:** ✅ Работает
- **Features:**
  - Последние 20 дропов
  - Автообновление каждые 10 секунд
  - Правильный маппинг полей: `drops`, `item_name`, `user_name`, `timestamp`

### 📈 Публичная статистика
- **Component:** `/src/app/components/TopBar.tsx`
- **Endpoint:** `GET /api/stats/public`
- **Status:** ✅ Работает
- **Features:**
  - Количество открытых кейсов
  - Уникальные игроки

### 🎁 Кейсы
- **Component:** `/src/app/components/CaseOpeningPage.tsx`
- **Endpoints:**
  - `GET /api/cases/:id` - Получить информацию о кейсе
  - `POST /api/cases/open` - Открыть кейс
- **Status:** ✅ Работает
- **Features:**
  - Превью содержимого кейса
  - Weighted random на сервере
  - Анимация рулетки (визуализация)
  - Winner добавляется в инвентарь и Live Feed

### 🎒 Инвентарь
- **Component:** `/src/app/components/InventoryPage.tsx`
- **Endpoints:**
  - `GET /api/inventory`
  - `POST /api/inventory/claim`
  - `POST /api/inventory/sell`
- **Status:** ✅ Работает
- **Features:**
  - Показ всех предметов (available + processing)
  - Claim для денег (авто) и скинов/физ (заявка)
  - Sell для скинов/физ товаров
  - Проверка Trade Link перед claim

### 📋 История открытий
- **Component:** `/src/app/components/PlayerProfile.tsx`
- **Endpoint:** `GET /api/user/history`
- **Status:** ✅ Работает
- **Features:**
  - Последние 50 открытий
  - Показывает prize, rarity, дату

### 🔧 Админка - Items
- **Component:** `/src/app/admin/pages/ItemsPage.tsx`
- **Endpoints:**
  - `GET /api/admin/items`
  - `POST /api/admin/items`
  - `DELETE /api/admin/items/:id`
- **Status:** ✅ Работает
- **Features:**
  - Список всех предметов
  - Создание/редактирование
  - Удаление с каскадом (удаляется из case_items)
  - Поддержка всех типов: skin, physical, money
  - Управление stock, rarity

### 🔧 Админка - Cases
- **Component:** `/src/app/admin/pages/CasesPage.tsx`
- **Endpoints:**
  - `GET /api/admin/cases`
  - `POST /api/admin/cases`
  - `PUT /api/admin/cases/:id`
  - `DELETE /api/admin/cases/:id`
- **Status:** ✅ Работает
- **Features:**
  - Список всех кейсов + contents
  - Создание/редактирование
  - Управление содержимым (items + weights)
  - Статусы: draft/published
  - Типы: daily/monthly/event

### 🔧 Админка - Requests
- **Component:** `/src/app/admin/pages/RequestsPage.tsx`
- **Endpoints:**
  - `GET /api/admin/requests`
  - `POST /api/admin/requests/:id/approve`
  - `POST /api/admin/requests/:id/deny`
  - `POST /api/admin/requests/:id/return`
- **Status:** ✅ Работает
- **Features:**
  - Список всех заявок на вывод
  - Показ Trade Link с кнопкой Copy
  - Одобрение/отклонение/возврат
  - Фильтрация по статусу
  - Правильный маппинг: `user_nickname`, `trade_link`, `item_title`

---

## ⚙️ КОНФИГУРАЦИЯ

### API Config
- **File:** `/src/config/api.ts`
- **Status:** ✅ Полностью настроен
- **Features:**
  - Все endpoints из backend
  - Helper функции для auth headers
  - Session token management

### Environment
- **Variable:** `VITE_API_BASE_URL`
- **Default:** `http://91.107.120.48:3000`
- **Status:** ✅ Работает

---

## 🔄 DATA FLOW

### 1. Авторизация
```
User → LoginModal → POST /api/auth/session → SmartShell API
SmartShell API → Backend → Session Token → Frontend localStorage
```

### 2. Получение профиля
```
Frontend → GET /api/profile (с Bearer token)
Backend → SmartShell API (баланс + депозиты)
Backend → SQLite (кейсы + claims)
Backend → Response { profile, cases }
```

### 3. Открытие кейса
```
User → CaseOpeningPage → POST /api/cases/open { caseId }
Backend → Проверка прогресса (SmartShell)
Backend → Weighted Random (выбор winner)
Backend → INSERT в spins, inventory, case_claims
Backend → Response { item, xpEarned }
Frontend → Анимация рулетки → Показ winner
```

### 4. Claim предмета
```
User → InventoryPage → POST /api/inventory/claim { inventory_id }

// Если money:
Backend → addClientDeposit (SmartShell mock)
Backend → UPDATE inventory status = 'received'
Backend → Response { type: 'money', message }

// Если skin/physical:
Backend → Проверка trade_link
Backend → INSERT в requests
Backend → UPDATE inventory status = 'processing'
Backend → Response { type: 'item', requestId }
```

### 5. Live Feed
```
TopBar → useEffect (mount + interval 10s)
GET /api/drops/recent
Backend → SELECT spins + JOIN sessions (user nickname)
Backend → Response { drops: [...] }
Frontend → Update carousel
```

---

## 🎯 ТИПЫ ДАННЫХ (Frontend ↔ Backend)

### Item
```typescript
// Backend (database)
{
  id: string,
  type: 'skin' | 'physical' | 'money',
  title: string,
  image_url: string,
  price_eur: number,
  sell_price_eur: number,
  rarity: string,
  stock: number
}

// Frontend должен использовать ТЕ ЖЕ поля!
```

### Case
```typescript
// Backend
{
  id: string,
  title: string,
  type: 'daily' | 'monthly' | 'event',
  threshold_eur: number,
  image_url: string,
  is_active: 0 | 1
}

// Frontend mapping
{
  ...case,
  threshold: case.threshold_eur,
  image: case.image_url,
  status: case.is_active ? 'published' : 'draft'
}
```

### Inventory Item
```typescript
// Backend
{
  id: number,
  user_uuid: string,
  item_id: string,
  title: string,
  type: 'skin' | 'physical' | 'money',
  image_url: string,
  amount_eur: number,
  sell_price_eur: number,
  rarity: string,
  status: 'available' | 'processing' | 'received' | 'sold',
  created_at: number,
  updated_at: number
}
```

### Request
```typescript
// Backend
{
  id: string, // REQ-XXXXXX
  user_uuid: string,
  user_nickname: string,
  trade_link: string | null,
  inventory_id: number,
  item_title: string,
  type: 'skin' | 'physical',
  status: 'pending' | 'approved' | 'denied' | 'returned',
  admin_comment: string | null,
  created_at: number,
  updated_at: number
}
```

---

## ⚠️ КРИТИЧЕСКИЕ МОМЕНТЫ

### 1. SmartShell Integration
**НЕ ТРОГАТЬ функции:**
- `gqlRequest()`
- `getServiceToken()`
- `getClientBalance()`
- `calculateProgressSafe()`

Эти функции общаются с внешним API SmartShell.

### 2. Timezone
Все daily/monthly расчеты используют **Europe/Riga** timezone.
- `getRigaDayKey()` → `2024-12-30`
- `getRigaMonthKey()` → `2024-12`

### 3. Weighted Random
Winner при открытии кейса **всегда определяется на сервере**.
Frontend анимация - это только визуализация.

### 4. Trade Link Validation
- Обязателен для claim скинов/физ товаров
- НЕ обязателен для денег (автовывод)
- Проверяется в `/api/inventory/claim`

### 5. Session Management
- Token хранится в `localStorage`
- Отправляется в заголовке `Authorization: Bearer <token>`
- Expires через 24 часа (backend устанавливает)

---

## 🐛 ИЗВЕСТНЫЕ БАГИ

*Пока нет*

---

## 📋 TODO

- [ ] Добавить endpoint для leaderboard (топ игроков)
- [ ] Добавить webhook уведомления для новых requests
- [ ] Добавить admin endpoint для bulk operations (массовое одобрение заявок)
- [ ] Добавить rate limiting для opening кейсов

---

## 📊 METRICS

**Total Endpoints:** 24  
**Integrated:** 24 (100%)  
**With Auth:** 20  
**Public:** 3  
**Admin Only:** 9  

**Last Updated:** 2024-12-30
