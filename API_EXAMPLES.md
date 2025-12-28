# API Examples - Request & Response

## 🎯 Quick Reference for Backend Developers

This file contains copy-paste ready examples of all API requests and expected responses.

---

## 🔐 Authentication

### Login (Already Implemented)
```http
POST http://91.107.120.48:3000/api/auth/login
Content-Type: application/json

{
  "username": "player123",
  "password": "secret"
}
```

**Response:**
```json
{
  "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "profile": {
    "id": 1,
    "username": "player123",
    "dailySum": 100.50
  }
}
```

---

## 🛠️ Admin - Items Management

### 1. Create Item
```http
POST http://91.107.120.48:3000/api/admin/items
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "type": "skin",
  "title": "AK-47 | Redline",
  "image_url": "https://example.com/ak47-redline.png",
  "price_eur": 50.00,
  "sell_price_eur": 45.00
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "id": 1,
    "type": "skin",
    "title": "AK-47 | Redline",
    "image_url": "https://example.com/ak47-redline.png",
    "price_eur": 50.00,
    "sell_price_eur": 45.00,
    "created_at": "2024-12-28T10:00:00.000Z"
  }
}
```

### 2. Get All Items
```http
GET http://91.107.120.48:3000/api/admin/items
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": 1,
    "type": "skin",
    "title": "AK-47 | Redline",
    "image_url": "https://example.com/ak47-redline.png",
    "price_eur": 50.00,
    "sell_price_eur": 45.00,
    "created_at": "2024-12-28T10:00:00.000Z"
  },
  {
    "id": 2,
    "type": "physical",
    "title": "Gaming Headset",
    "image_url": "https://example.com/headset.png",
    "price_eur": 120.00,
    "sell_price_eur": 100.00,
    "created_at": "2024-12-28T11:00:00.000Z"
  },
  {
    "id": 3,
    "type": "money",
    "title": "$50 Balance",
    "image_url": "https://example.com/money.png",
    "price_eur": 50.00,
    "sell_price_eur": 50.00,
    "created_at": "2024-12-28T12:00:00.000Z"
  }
]
```

### 3. Update Item
```http
PUT http://91.107.120.48:3000/api/admin/items/1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "type": "skin",
  "title": "AK-47 | Redline (Updated)",
  "image_url": "https://example.com/ak47-redline-v2.png",
  "price_eur": 55.00,
  "sell_price_eur": 50.00
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "id": 1,
    "type": "skin",
    "title": "AK-47 | Redline (Updated)",
    "image_url": "https://example.com/ak47-redline-v2.png",
    "price_eur": 55.00,
    "sell_price_eur": 50.00,
    "created_at": "2024-12-28T10:00:00.000Z"
  }
}
```

### 4. Delete Item
```http
DELETE http://91.107.120.48:3000/api/admin/items/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## 🎒 Client - Inventory

### 5. Get User Inventory
```http
GET http://91.107.120.48:3000/api/inventory
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "inventory_id": 101,
      "title": "AK-47 | Redline",
      "image_url": "https://example.com/ak47-redline.png",
      "type": "skin",
      "sell_price_eur": 45.00,
      "price_eur": 50.00,
      "created_at": "2024-12-28T10:30:00.000Z"
    },
    {
      "id": 2,
      "inventory_id": 102,
      "title": "Gaming Headset",
      "image_url": "https://example.com/headset.png",
      "type": "physical",
      "sell_price_eur": 100.00,
      "price_eur": 120.00,
      "created_at": "2024-12-28T11:30:00.000Z"
    }
  ]
}
```

**Important Notes:**
- `id` = Item template ID (from items table)
- `inventory_id` = Unique inventory entry ID (primary key of inventory table)
- Items with `type: "money"` should NOT be included
- Money items should be auto-credited to user balance when won

### 6. Sell Inventory Item
```http
POST http://91.107.120.48:3000/api/inventory/sell
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "inventory_id": 101
}
```

**Response:**
```json
{
  "success": true,
  "amount": 45.00,
  "new_balance": 145.50,
  "message": "Item sold successfully"
}
```

**Backend Logic:**
1. Verify `inventory_id` belongs to authenticated user
2. Get `sell_price_eur` from the item
3. Add `sell_price_eur` to user's `dailySum` (balance)
4. Delete or mark as sold the inventory entry
5. Return success with amount and optionally new balance

---

## 🎁 Admin - Cases Management (Future)

### Create Case with Items
```http
POST http://91.107.120.48:3000/api/admin/cases
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Starter Case",
  "image_url": "https://example.com/starter-case.png",
  "price_eur": 5.00,
  "items": [
    {
      "item_id": 1,
      "weight": 50,
      "rarity": "common"
    },
    {
      "item_id": 2,
      "weight": 30,
      "rarity": "rare"
    },
    {
      "item_id": 3,
      "weight": 15,
      "rarity": "epic"
    },
    {
      "item_id": 4,
      "weight": 5,
      "rarity": "legendary"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "case": {
    "id": 1,
    "title": "Starter Case",
    "image_url": "https://example.com/starter-case.png",
    "price_eur": 5.00,
    "items": [
      {
        "item_id": 1,
        "weight": 50,
        "rarity": "common"
      },
      {
        "item_id": 2,
        "weight": 30,
        "rarity": "rare"
      },
      {
        "item_id": 3,
        "weight": 15,
        "rarity": "epic"
      },
      {
        "item_id": 4,
        "weight": 5,
        "rarity": "legendary"
      }
    ],
    "created_at": "2024-12-28T10:00:00.000Z"
  }
}
```

---

## ❌ Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Missing required field: title"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Item not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 🔍 Field Validations

### Item Creation/Update
- `type`: Required, must be one of: "skin", "physical", "money"
- `title`: Required, string, 1-255 characters
- `image_url`: Required, string, valid URL format
- `price_eur`: Required, number >= 0
- `sell_price_eur`: Required, number >= 0, should be <= price_eur

### Inventory Sell
- `inventory_id`: Required, integer, must exist and belong to user
- Must not be already sold
- Item must still exist in database

---

## 🧪 Test Scenarios

### Scenario 1: Create and Sell Item Flow
1. Admin creates item (POST /api/admin/items)
2. User wins item from case (handled by case opening endpoint)
3. Item appears in inventory (GET /api/inventory)
4. User sells item (POST /api/inventory/sell)
5. Item removed from inventory
6. Balance increased by sell_price_eur

### Scenario 2: Money Type Item
1. Admin creates item with type: "money"
2. User wins money item
3. Amount auto-credited to balance
4. Item does NOT appear in GET /api/inventory
5. No sell action needed

### Scenario 3: Invalid Sell Attempt
1. User tries to sell item_id instead of inventory_id → 400 error
2. User tries to sell someone else's item → 403 error
3. User tries to sell already sold item → 404 error

---

## 📊 Database Schema Implications

### Items Table
```sql
CREATE TABLE items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('skin', 'physical', 'money') NOT NULL,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  price_eur DECIMAL(10,2) NOT NULL,
  sell_price_eur DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Inventory Table
```sql
CREATE TABLE inventory (
  inventory_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sold_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);
```

### Join Query for GET /api/inventory
```sql
SELECT 
  i.id,
  inv.inventory_id,
  i.title,
  i.image_url,
  i.type,
  i.sell_price_eur,
  i.price_eur,
  inv.created_at
FROM inventory inv
JOIN items i ON inv.item_id = i.id
WHERE inv.user_id = ? 
  AND inv.sold_at IS NULL
  AND i.type != 'money'
ORDER BY inv.created_at DESC;
```

---

**Last Updated**: December 28, 2024
