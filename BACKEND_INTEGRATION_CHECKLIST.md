# Backend Integration Checklist

## 🎯 For Backend AI/Developer

This is a **quick checklist** for implementing the backend API that CyberHub frontend expects.

📖 **Detailed Documentation**: See [FRONTEND_CHANGELOG.md](./FRONTEND_CHANGELOG.md)

---

## ✅ Required Endpoints

### 1️⃣ Admin - Items Management

- [ ] **GET /api/admin/items**
  - Returns: `Array<Item>`
  - Auth: Required (Bearer token)
  - [Example](./API_EXAMPLES.md#2-get-all-items)

- [ ] **POST /api/admin/items**
  - Body: `{ type, title, image_url, price_eur, sell_price_eur }`
  - Auth: Required
  - [Example](./API_EXAMPLES.md#1-create-item)

- [ ] **PUT /api/admin/items/:id**
  - Body: Same as POST
  - Auth: Required
  - [Example](./API_EXAMPLES.md#3-update-item)

- [ ] **DELETE /api/admin/items/:id**
  - Auth: Required
  - [Example](./API_EXAMPLES.md#4-delete-item)

### 2️⃣ Client - Inventory

- [ ] **GET /api/inventory**
  - Returns: `{ items: Array<InventoryItem> }`
  - Auth: Required
  - **Must exclude** `type: "money"` items
  - [Example](./API_EXAMPLES.md#5-get-user-inventory)

- [ ] **POST /api/inventory/sell**
  - Body: `{ inventory_id: number }`
  - Auth: Required
  - **Must add** `sell_price_eur` to user balance
  - **Must delete/mark** inventory entry as sold
  - [Example](./API_EXAMPLES.md#6-sell-inventory-item)

### 3️⃣ Authentication (Already Implemented ✅)

- [x] **POST /api/auth/login**
  - Body: `{ username, password }`
  - Returns: `{ session_token, profile }`

### 4️⃣ Profile (Already Implemented ✅)

- [x] **GET /api/profile**
  - Auth: Required
  - Returns user profile with `dailySum` (balance)

---

## 📊 Critical Data Structures

### Item
```typescript
{
  id: number,
  type: "skin" | "physical" | "money",
  title: string,
  image_url: string,
  price_eur: number,        // Market price
  sell_price_eur: number,   // What user gets when selling
  created_at?: string
}
```

### Inventory Item
```typescript
{
  id: number,              // Item template ID
  inventory_id: number,    // ⚠️ IMPORTANT: Unique inventory entry ID
  title: string,
  image_url: string,
  type: "skin" | "physical" | "money",
  price_eur: number,
  sell_price_eur: number,
  created_at: string
}
```

**Critical**: `inventory_id` is used for selling, not `id`!

---

## ⚠️ Important Rules

### Money Type Items
- When user wins item with `type: "money"`
  - ✅ Add `price_eur` to user balance immediately
  - ✅ Do NOT create inventory entry
  - ✅ Do NOT return in `GET /api/inventory`

### Inventory Sell
- Validate `inventory_id` belongs to authenticated user
- Prevent selling same item twice
- Add `sell_price_eur` to user's `dailySum` balance
- Delete or mark as sold the inventory entry

### Authorization
- All endpoints (except login) require: `Authorization: Bearer <token>`
- Token stored in `localStorage.session_token` on frontend
- Return `401` for invalid/expired tokens

---

## 🧪 Testing Your Implementation

Use [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md) to verify:

**Quick Tests:**
1. Create item via admin → Check it appears in list
2. Give item to user → Check it appears in inventory
3. Sell item → Check balance increases and item disappears
4. Create money item → Check it never appears in inventory

**Full Test Suite:** 30+ test cases in [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md)

---

## 📝 Response Formats

### Success
```json
{
  "success": true,
  "item": { ... }  // or other data
}
```

### Error
```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad request (validation failed)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

---

## 🗄️ Suggested Database Schema

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

Full SQL examples in [API_EXAMPLES.md](./API_EXAMPLES.md#database-schema-implications)

---

## 🔍 Validation Rules

### Item Creation
- `type`: Required, must be "skin", "physical", or "money"
- `title`: Required, 1-255 characters
- `image_url`: Required, valid URL
- `price_eur`: Required, number >= 0
- `sell_price_eur`: Required, number >= 0, recommend <= price_eur

### Inventory Sell
- `inventory_id`: Required, must exist in database
- Must belong to authenticated user
- Must not be already sold (`sold_at IS NULL`)

---

## 📚 Full Documentation Links

1. **[FRONTEND_CHANGELOG.md](./FRONTEND_CHANGELOG.md)** - Complete technical specs ⭐
2. **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Copy-paste HTTP requests
3. **[INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md)** - Testing procedures

---

## ✅ Implementation Checklist

- [ ] Set up base API structure
- [ ] Implement authentication middleware
- [ ] Create Items endpoints (GET, POST, PUT, DELETE)
- [ ] Create Inventory GET endpoint
- [ ] Create Inventory Sell endpoint
- [ ] Add money type handling
- [ ] Test with frontend
- [ ] Handle all error cases
- [ ] Add CORS for frontend domain
- [ ] Deploy to http://91.107.120.48:3000

---

## 🚀 Quick Start Command

```bash
# Test if your endpoints work
curl -X GET http://91.107.120.48:3000/api/admin/items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

See [API_EXAMPLES.md](./API_EXAMPLES.md) for all cURL examples.

---

**Last Updated**: December 28, 2024
**Priority**: High - Frontend is waiting for these endpoints
**Estimated Time**: 4-6 hours for experienced developer
