# CyberHub Backend API Reference

**Базовый URL:** `http://91.107.120.48:3000`

## 🔐 Авторизация

Все эндпоинты (кроме `/api/auth/session`, `/api/stats/public`, `/api/drops/recent`, `/api/cases/:id`) требуют заголовок:
```
Authorization: Bearer <session_token>
```

---

## 📊 PUBLIC ENDPOINTS (без авторизации)

### GET `/api/stats/public`
Публичная статистика платформы.

**Response:**
```json
{
  "success": true,
  "stats": {
    "unique_users": 123,
    "total_spins": 456
  }
}
```

---

### GET `/api/drops/recent`
Последние 20 дропов для Live Feed.

**Response:**
```json
{
  "success": true,
  "drops": [
    {
      "id": 1,
      "item_name": "AK-47 | Redline",
      "image": "https://...",
      "rarity": "legendary",
      "timestamp": 1234567890,
      "user_uuid": "uuid-here",
      "user_name": "PlayerName"
    }
  ]
}
```

---

### GET `/api/cases/:id`
Получить информацию о кейсе и его содержимом (для превью).

**Response:**
```json
{
  "success": true,
  "case": {
    "id": "case-uuid",
    "title": "Daily Case",
    "type": "daily",
    "threshold_eur": 10.0,
    "image_url": "https://..."
  },
  "contents": [
    {
      "id": "item-uuid",
      "title": "AK-47 | Redline",
      "type": "skin",
      "image_url": "https://...",
      "price_eur": 50.0,
      "sell_price_eur": 45.0,
      "rarity": "legendary",
      "weight": 5,
      "chance": 2.5
    }
  ]
}
```

---

## 🔑 AUTH

### POST `/api/auth/session`
Авторизация через SmartShell.

**Request:**
```json
{
  "login": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "session_token": "uuid-token-here"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## 👤 USER ENDPOINTS (требуют авторизации)

### GET `/api/profile`
Получить профиль пользователя с кейсами и прогрессом.

**Response:**
```json
{
  "success": true,
  "profile": {
    "uuid": "user-uuid",
    "nickname": "PlayerName",
    "balance": 123.45,
    "dailySum": 15.0,
    "monthlySum": 150.0,
    "tradeLink": "https://steamcommunity.com/...",
    "cases": [
      {
        "id": "case-uuid",
        "title": "Daily Case",
        "type": "daily",
        "threshold": 10.0,
        "image": "https://...",
        "progress": 15.0,
        "available": true,
        "is_claimed": false
      }
    ]
  }
}
```

---

### POST `/api/user/tradelink`
Обновить Trade Link пользователя.

**Request:**
```json
{
  "trade_link": "https://steamcommunity.com/tradeoffer/new/?partner=123456&token=XXXXXXX"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### GET `/api/user/history`
История открытий кейсов (последние 50).

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "user_uuid": "uuid",
      "case_id": "case-uuid",
      "period_key": "2024-01-15",
      "prize_title": "AK-47 | Redline",
      "prize_amount_eur": 50.0,
      "rarity": "legendary",
      "image_url": "https://...",
      "created_at": 1234567890
    }
  ]
}
```

---

## 🎁 CASES

### POST `/api/cases/open`
Открыть кейс (результат определяется на сервере).

**Request:**
```json
{
  "caseId": "case-uuid"
}
```

**Response (Success):**
```json
{
  "success": true,
  "item": {
    "id": "item-uuid",
    "name": "AK-47 | Redline",
    "title": "AK-47 | Redline",
    "type": "skin",
    "image": "https://...",
    "rarity": "legendary"
  },
  "xpEarned": 10
}
```

**Response (Error - Already Opened):**
```json
{
  "error": "Already opened"
}
```

**Response (Error - Not Enough Deposit):**
```json
{
  "error": "Not enough deposit"
}
```

---

## 🎒 INVENTORY

### GET `/api/inventory`
Получить инвентарь пользователя.

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "user_uuid": "uuid",
      "item_id": "item-uuid",
      "title": "AK-47 | Redline",
      "type": "skin",
      "image_url": "https://...",
      "amount_eur": 50.0,
      "sell_price_eur": 45.0,
      "rarity": "legendary",
      "status": "available",
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  ]
}
```

**Item Status:**
- `available` - можно claim/sell
- `processing` - заявка на вывод создана
- `received` - получено
- `sold` - продано

---

### POST `/api/inventory/sell`
Продать предмет за баланс.

**Request:**
```json
{
  "inventory_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "sold_amount": 45.0
}
```

---

### POST `/api/inventory/claim`
Получить предмет (деньги автоматом, скины/физ → заявка админу).

**Request:**
```json
{
  "inventory_id": 123
}
```

**Response (Money - Auto):**
```json
{
  "success": true,
  "type": "money",
  "message": "Added 10.0€ to balance"
}
```

**Response (Skin/Physical - Request Created):**
```json
{
  "success": true,
  "type": "item",
  "requestId": "REQ-123456"
}
```

**Response (Error - No Trade Link):**
```json
{
  "error": "TRADE_LINK_MISSING"
}
```

---

## 🔧 ADMIN ENDPOINTS (требуют авторизации)

### GET `/api/admin/items`
Получить все предметы.

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": "item-uuid",
      "type": "skin",
      "title": "AK-47 | Redline",
      "image_url": "https://...",
      "price_eur": 50.0,
      "sell_price_eur": 45.0,
      "rarity": "legendary",
      "stock": -1,
      "is_active": 1
    }
  ]
}
```

---

### POST `/api/admin/items`
Создать предмет.

**Request:**
```json
{
  "id": "optional-uuid",
  "type": "skin",
  "title": "AK-47 | Redline",
  "image_url": "https://...",
  "price_eur": 50.0,
  "sell_price_eur": 45.0,
  "rarity": "legendary",
  "stock": -1
}
```

**Response:**
```json
{
  "success": true,
  "item_id": "uuid"
}
```

---

### DELETE `/api/admin/items/:id`
Удалить предмет.

**Response:**
```json
{
  "success": true
}
```

---

### GET `/api/admin/cases`
Получить все кейсы с содержимым.

**Response:**
```json
{
  "success": true,
  "cases": [
    {
      "id": "case-uuid",
      "title": "Daily Case",
      "type": "daily",
      "threshold_eur": 10.0,
      "threshold": 10.0,
      "image_url": "https://...",
      "image": "https://...",
      "is_active": 1,
      "status": "published",
      "items": [...],
      "contents": [
        {
          "itemId": "item-uuid",
          "dropChance": 50,
          "item": {
            "id": "item-uuid",
            "title": "AK-47",
            "image": "https://...",
            "nameEn": "AK-47"
          }
        }
      ]
    }
  ]
}
```

---

### POST `/api/admin/cases`
Создать кейс.

**Request:**
```json
{
  "id": "optional-uuid",
  "title": "Daily Case",
  "type": "daily",
  "threshold_eur": 10.0,
  "image_url": "https://...",
  "status": "published",
  "contents": [
    {
      "itemId": "item-uuid",
      "dropChance": 50
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "id": "case-uuid"
}
```

---

### PUT `/api/admin/cases/:id`
Обновить кейс (тот же формат что POST).

---

### DELETE `/api/admin/cases/:id`
Удалить кейс.

**Response:**
```json
{
  "success": true
}
```

---

### GET `/api/admin/requests`
Получить все заявки на вывод.

**Response:**
```json
[
  {
    "id": "REQ-123456",
    "user_uuid": "uuid",
    "user_nickname": "PlayerName",
    "trade_link": "https://...",
    "inventory_id": 123,
    "item_title": "AK-47 | Redline",
    "type": "skin",
    "status": "pending",
    "admin_comment": null,
    "created_at": 1234567890,
    "updated_at": 1234567890
  }
]
```

**Request Status:**
- `pending` - ожидает обработки
- `approved` - одобрена
- `denied` - отклонена
- `returned` - возвращена в инвентарь

---

### POST `/api/admin/requests/:id/approve`
Одобрить заявку.

**Response:**
```json
{
  "success": true
}
```

---

### POST `/api/admin/requests/:id/deny`
Отклонить заявку.

**Request:**
```json
{
  "comment": "Invalid trade link"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### POST `/api/admin/requests/:id/return`
Вернуть предмет в инвентарь.

**Response:**
```json
{
  "success": true
}
```

---

## 📦 ТИПЫ ДАННЫХ

### Item Types
- `skin` - CS2 Skin
- `physical` - Физический предмет
- `money` - Деньги (автовывод)

### Case Types
- `daily` - Дневной кейс
- `monthly` - Месячный кейс
- `event` - Эвент кейс

### Rarity Levels
- `common` - Серый
- `rare` - Синий
- `epic` - Фиолетовый
- `legendary` - Золотой
- `mythic` - Красный

---

## 🎯 ВАЖНЫЕ МОМЕНТЫ

1. **Баланс** синхронизируется с SmartShell (`getClientBalance`)
2. **Прогресс** (daily/monthly deposits) считается через SmartShell платежи (`calculateProgressSafe`)
3. **Открытие кейса** определяет winner на сервере (weighted random)
4. **Claim** для денег = автовывод, для скинов/физ = создание заявки админу
5. **Trade Link** обязателен для claim скинов/физических предметов
6. **Period Key** в формате `YYYY-MM-DD` (daily) или `YYYY-MM` (monthly)
7. **Timestamps** в миллисекундах (Date.now())
