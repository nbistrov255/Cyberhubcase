# Quick Reference Guide

Быстрая справка по Backend API для разработки Frontend.

---

## 🚀 Самые используемые Endpoints

### Auth & Profile
```typescript
// Логин
POST /api/auth/session
Body: { login: string, password: string }
Response: { success: true, session_token: string }

// Профиль
GET /api/profile
Headers: Authorization: Bearer <token>
Response: { 
  success: true, 
  profile: { 
    uuid, nickname, balance, dailySum, monthlySum, tradeLink, cases: [...] 
  } 
}
```

### Cases
```typescript
// Открыть кейс
POST /api/cases/open
Headers: Authorization: Bearer <token>
Body: { caseId: string }
Response: { 
  success: true, 
  item: { id, name, title, type, image, rarity }, 
  xpEarned: number 
}

// Информация о кейсе
GET /api/cases/:id
Response: { 
  success: true, 
  case: {...}, 
  contents: [{ title, image_url, price_eur, rarity, chance, ... }] 
}
```

### Inventory
```typescript
// Получить инвентарь
GET /api/inventory
Headers: Authorization: Bearer <token>
Response: { items: [...] }

// Claim предмет
POST /api/inventory/claim
Headers: Authorization: Bearer <token>
Body: { inventory_id: number }
// Money:
Response: { success: true, type: 'money', message: '...' }
// Skin/Physical:
Response: { success: true, type: 'item', requestId: 'REQ-XXXXXX' }

// Sell предмет
POST /api/inventory/sell
Headers: Authorization: Bearer <token>
Body: { inventory_id: number }
Response: { success: true, sold_amount: number }
```

### Live Feed & Stats
```typescript
// Live Feed (NO AUTH)
GET /api/drops/recent
Response: { 
  success: true, 
  drops: [{ id, item_name, image, rarity, timestamp, user_uuid, user_name }] 
}

// Public Stats (NO AUTH)
GET /api/stats/public
Response: { 
  success: true, 
  stats: { unique_users: number, total_spins: number } 
}
```

---

## 🔧 Admin Endpoints

### Items
```typescript
GET /api/admin/items       // Список
POST /api/admin/items      // Создать
DELETE /api/admin/items/:id // Удалить
```

### Cases
```typescript
GET /api/admin/cases       // Список + contents
POST /api/admin/cases      // Создать
PUT /api/admin/cases/:id   // Обновить
DELETE /api/admin/cases/:id // Удалить
```

### Requests
```typescript
GET /api/admin/requests              // Список заявок
POST /api/admin/requests/:id/approve // Одобрить
POST /api/admin/requests/:id/deny    // Отклонить (body: { comment })
POST /api/admin/requests/:id/return  // Вернуть в инвентарь
```

---

## 📦 Структуры данных

### Item
```typescript
{
  id: string,
  type: 'skin' | 'physical' | 'money',
  title: string,
  image_url: string,
  price_eur: number,
  sell_price_eur: number,
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic',
  stock: number, // -1 = unlimited
  is_active: 0 | 1
}
```

### Case
```typescript
{
  id: string,
  title: string,
  type: 'daily' | 'monthly' | 'event',
  threshold_eur: number, // Min deposit для открытия
  image_url: string,
  is_active: 0 | 1,
  
  // В /api/admin/cases также:
  contents: [{
    itemId: string,
    dropChance: number, // weight
    item: { ... }
  }]
}
```

### Inventory Item
```typescript
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
  created_at: number, // ms
  updated_at: number  // ms
}
```

### Request
```typescript
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

## 🎨 Rarity Colors (Frontend)

```typescript
const rarityColors = {
  common: '#6b7280',    // Серый
  rare: '#3b82f6',      // Синий
  epic: '#a855f7',      // Фиолетовый
  legendary: '#eab308', // Золотой
  mythic: '#ef4444'     // Красный
};
```

---

## ⚡ Helper Functions (Frontend)

### Auth Headers
```typescript
import { getAuthHeaders } from '@/config/api';

fetch('/api/profile', {
  headers: getAuthHeaders()
});
```

### Session Management
```typescript
import { getSessionToken, setSessionToken, clearSessionToken } from '@/config/api';

// Save
setSessionToken(token);

// Get
const token = getSessionToken();

// Clear (logout)
clearSessionToken();
```

---

## 🐛 Common Errors

### 401 Unauthorized
```json
{ "error": "No token" }
{ "error": "Invalid session" }
```
**Fix:** Убедись что отправляешь `Authorization: Bearer <token>`

### 400 Bad Request
```json
{ "error": "Already opened" }
{ "error": "Item not available" }
{ "error": "TRADE_LINK_MISSING" }
```
**Fix:** Проверь условия (уже открыл кейс? статус предмета? есть trade link?)

### 403 Forbidden
```json
{ "error": "Not enough deposit" }
```
**Fix:** У пользователя недостаточно депозитов для открытия кейса

### 404 Not Found
```json
{ "error": "Case not found" }
```
**Fix:** Проверь ID кейса

### 500 Internal Server Error
```json
{ "error": "Case empty" }
```
**Fix:** У кейса нет предметов в `case_items`

---

## 🔥 Critical Rules

1. **НИКОГДА** не меняй SmartShell функции (`gqlRequest`, `getServiceToken`, `getClientBalance`, `calculateProgressSafe`)
2. **ВСЕГДА** проверяй `/backend_reference/index.ts` перед написанием Frontend кода
3. **ВСЕГДА** используй правильные названия полей (`item_name`, НЕ `prize_name`)
4. **ВСЕГДА** проверяй `status` предмета перед claim/sell
5. **ВСЕГДА** отправляй `Authorization` header для protected endpoints

---

## 📝 Примеры кода

### Открытие кейса
```typescript
const openCase = async (caseId: string) => {
  const token = getSessionToken();
  
  const response = await fetch(`${API_BASE}/api/cases/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ caseId })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data; // { success: true, item: {...}, xpEarned: 10 }
};
```

### Claim предмета
```typescript
const claimItem = async (inventoryId: number) => {
  const response = await fetch(`${API_BASE}/api/inventory/claim`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ inventory_id: inventoryId })
  });
  
  const data = await response.json();
  
  if (data.error === 'TRADE_LINK_MISSING') {
    // Показать модалку для ввода Trade Link
    showTradeLinkModal();
    return;
  }
  
  if (data.type === 'money') {
    toast.success(`Added ${data.message}`);
  } else {
    toast.success(`Request created: ${data.requestId}`);
  }
};
```

### Live Feed
```typescript
const fetchLiveFeed = async () => {
  const response = await fetch(`${API_BASE}/api/drops/recent`);
  const data = await response.json();
  
  if (data.success && data.drops) {
    setFeedItems(data.drops.map(drop => ({
      id: drop.id,
      itemName: drop.item_name,
      itemImage: drop.image,
      rarity: drop.rarity,
      playerName: drop.user_name,
      timestamp: new Date(drop.timestamp)
    })));
  }
};

// Auto-refresh every 10s
useEffect(() => {
  fetchLiveFeed();
  const interval = setInterval(fetchLiveFeed, 10000);
  return () => clearInterval(interval);
}, []);
```

---

## 🎯 Workflow для новой функции

1. **Проверь** `/backend_reference/index.ts` - есть ли нужный endpoint?
2. **Если НЕТ** - спроектируй и добавь в `index.ts`
3. **Если НУЖНА таблица** - добавь в `database.ts`
4. **Обнови** `/backend_reference/API_REFERENCE.md`
5. **Обнови** `/backend_reference/CHANGELOG.md`
6. **Добавь endpoint** в `/src/config/api.ts`
7. **Создай/обнови** Frontend компонент
8. **Протестируй** интеграцию

---

**Last Updated:** 2024-12-30
