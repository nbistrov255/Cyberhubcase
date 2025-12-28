# FRONTEND CHANGELOG - API Integration

## 📋 Overview
This document outlines all technical changes made to integrate the CyberHub frontend with the real backend API at `http://91.107.120.48:3000`.

---

## 🎯 New/Modified Components

### Admin Panel Components

#### 1. **ItemFormModal** (`/src/app/admin/components/ItemFormModal.tsx`)
- **Purpose**: Form modal for creating and editing items
- **Changes**: Complete rewrite to match new API structure
- **Key Features**:
  - Simplified form with new fields: `type`, `title`, `image_url`, `price_eur`, `sell_price_eur`
  - Removed multilingual fields (nameLv, nameRu, nameEn)
  - Removed rarity and stock fields
  - Type selection: "skin", "physical", "money"

#### 2. **ItemsPage** (`/src/app/admin/pages/ItemsPage.tsx`)
- **Purpose**: Admin page for managing items
- **Changes**: Updated to work with new API endpoints
- **Key Features**:
  - Fetches items from `GET /api/admin/items`
  - Creates items via `POST /api/admin/items`
  - Updates items via `PUT /api/admin/items/:id`
  - Deletes items via `DELETE /api/admin/items/:id`
  - Authorization header with Bearer token

#### 3. **SettingsPage** (`/src/app/admin/pages/SettingsPage.tsx`)
- **Purpose**: Admin settings including maintenance mode
- **New Features**:
  - Maintenance mode toggle
  - Saves state to localStorage
  - Blocks client application when enabled

### Client-Side Components

#### 4. **InventoryPage** (`/src/app/components/InventoryPage.tsx`)
- **Purpose**: User inventory with sell functionality
- **Changes**: Complete rewrite with API integration
- **Key Features**:
  - Fetches inventory from `GET /api/inventory`
  - Filters out `type: "money"` items (auto-added to balance)
  - Displays only "skin" and "physical" items
  - Hover to show "SELL FOR X€" button
  - Sells items via `POST /api/inventory/sell`
  - Real-time removal of sold items from UI
  - Search and type filtering (ALL/SKINS/PHYSICAL)

#### 5. **MaintenanceScreen** (`/src/app/components/MaintenanceScreen.tsx`)
- **Purpose**: Displayed when maintenance mode is active
- **Features**: 
  - Animated screen with professional message
  - Blocks all client functionality
  - English-only message

---

## 🔌 API Integration

### Base Configuration
- **Base URL**: `http://91.107.120.48:3000`
- **Headers**: 
  - `Content-Type: application/json` (for POST/PUT requests)
  - `Authorization: Bearer <session_token>` (all authenticated requests except login)

### API Endpoints Used

#### Admin - Items Management

**1. GET /api/admin/items**
- **Purpose**: Fetch all items
- **Location**: `ItemsPage.tsx` - `fetchItems()`
- **Headers**: `Authorization: Bearer <token>`
- **Response Expected**:
```json
[
  {
    "id": 1,
    "type": "skin",
    "title": "AK-47 | Redline",
    "image_url": "https://example.com/image.png",
    "price_eur": 50.00,
    "sell_price_eur": 45.00,
    "created_at": "2024-12-28T10:00:00Z"
  }
]
```

**2. POST /api/admin/items**
- **Purpose**: Create new item
- **Location**: `ItemsPage.tsx` - `handleSaveItem()`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "type": "skin",
  "title": "AK-47 | Redline",
  "image_url": "https://example.com/image.png",
  "price_eur": 50.00,
  "sell_price_eur": 45.00
}
```
- **Response Expected**: Success confirmation
```json
{
  "success": true,
  "item": { /* created item object */ }
}
```

**3. PUT /api/admin/items/:id**
- **Purpose**: Update existing item
- **Location**: `ItemsPage.tsx` - `handleSaveItem()`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**: Same as POST
- **Response Expected**: Success confirmation

**4. DELETE /api/admin/items/:id**
- **Purpose**: Delete item
- **Location**: `ItemsPage.tsx` - `handleDeleteItem()`
- **Headers**: `Authorization: Bearer <token>`
- **Response Expected**: Success confirmation
```json
{
  "success": true
}
```

#### Client - Inventory Management

**5. GET /api/inventory**
- **Purpose**: Fetch user's inventory items
- **Location**: `InventoryPage.tsx` - `fetchInventory()`
- **Headers**: `Authorization: Bearer <token>`
- **Response Expected**:
```json
{
  "items": [
    {
      "id": 1,
      "inventory_id": 123,
      "title": "AK-47 | Redline",
      "image_url": "https://example.com/image.png",
      "type": "skin",
      "sell_price_eur": 45.00,
      "price_eur": 50.00,
      "created_at": "2024-12-28T10:00:00Z"
    }
  ]
}
```
- **Important**: Items with `type: "money"` are automatically filtered out on frontend

**6. POST /api/inventory/sell**
- **Purpose**: Sell an inventory item
- **Location**: `InventoryPage.tsx` - `handleSellItem()`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "inventory_id": 123
}
```
- **Response Expected**:
```json
{
  "success": true,
  "amount": 45.00,
  "message": "Item sold successfully"
}
```

---

## 📦 Data Structures

### Item Object (Admin)
```typescript
interface Item {
  id: number;                    // Unique identifier
  type: 'skin' | 'physical' | 'money';  // Item type
  title: string;                 // Item name
  image_url: string;             // Full URL to item image
  price_eur: number;             // Market price in EUR
  sell_price_eur: number;        // Price user gets when selling
  created_at?: string;           // ISO 8601 timestamp
}
```

### Inventory Item Object (Client)
```typescript
interface InventoryItem {
  id: number;                    // Item template ID
  inventory_id: number;          // Unique inventory entry ID
  title: string;                 // Item name
  image_url: string;             // Full URL to item image
  type: 'skin' | 'physical' | 'money';  // Item type
  sell_price_eur: number;        // Price for selling back
  price_eur: number;             // Original market price
  created_at: string;            // When won/acquired
}
```

### Case Object (Admin - Future Integration)
```typescript
interface Case {
  id: number;
  title: string;
  image_url: string;
  price_eur: number;             // Cost to open the case
  items: CaseItem[];             // Items that can be won
}

interface CaseItem {
  item_id: number;               // Reference to Item.id
  weight: number;                // Drop weight (e.g., 50 = 50%)
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}
```

---

## ⚠️ Backend Requirements

### Required Fields
All API responses must include the exact field names as specified above. Frontend expects:

**For Items:**
- `id` (number, not string)
- `type` (exactly: "skin", "physical", or "money")
- `title` (string)
- `image_url` (string, full URL)
- `price_eur` (number, can be float)
- `sell_price_eur` (number, can be float)

**For Inventory:**
- Response must have `items` array wrapper: `{ "items": [...] }`
- Each item must have both `id` and `inventory_id`
- `inventory_id` is crucial for sell functionality

### Authorization
- Session token must be stored in `localStorage` as `session_token`
- All authenticated endpoints expect: `Authorization: Bearer <token>`
- Token is set during login via `POST /api/auth/login` (existing)

### Error Handling
Frontend expects standard HTTP status codes:
- `200` - Success
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

Error response format (optional but recommended):
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Sell Endpoint Requirements
- Must validate that `inventory_id` belongs to authenticated user
- Must add `sell_price_eur` amount to user's balance
- Must remove/mark as sold the inventory entry
- Should return updated balance (optional)

### Money Type Items
- Items with `type: "money"` should NOT appear in `/api/inventory`
- They should be auto-credited to user balance when won
- Frontend will filter them out anyway, but backend should handle this

---

## 🔧 Storage & State Management

### LocalStorage Keys
- `session_token` - User authentication token
- `maintenanceMode` - "true" or "false" string for maintenance mode
- `language` - "en", "ru", or "lv" for user language preference

### State Management
- All inventory operations update local state without page reload
- Items are removed from UI immediately after successful sell
- Toast notifications for all user actions

---

## 🌐 Multilingual Support

All user-facing text supports 3 languages:
- English (en)
- Russian (ru)
- Latvian (lv)

Translations are in `/src/app/contexts/LanguageContext.tsx` (client) and `/src/app/admin/contexts/AdminLanguageContext.tsx` (admin).

**Note**: Item names (`title`) are stored in a single language on backend. Multilingual item names were removed for simplicity.

---

## 🚨 Maintenance Mode

### How It Works
1. Admin toggles maintenance mode in Settings (`/src/app/admin/pages/SettingsPage.tsx`)
2. State saved to `localStorage.maintenanceMode`
3. Client app checks this value on mount (`/src/app/ClientApp.tsx`)
4. If `"true"`, displays `MaintenanceScreen` component
5. Admin panel remains accessible

**Important**: This is frontend-only. For full maintenance mode, backend should also check and reject requests.

---

## 📝 Migration Notes

### Removed Features
- Multilingual item names (nameLv, nameRu, nameEn) → Single `title`
- Item descriptions (descLv, descRu, descEn) → Removed entirely
- Rarity field on items → Now only exists in case items
- Stock tracking → Removed from items
- isActive flag → Removed

### New Features
- `sell_price_eur` - Critical for inventory sell functionality
- `inventory_id` - Separate from item `id`, tracks individual ownership
- Type-based filtering (money items excluded from inventory display)
- Real-time sell with optimistic UI updates

---

## 🧪 Testing Checklist for Backend

- [ ] POST /api/admin/items creates item with all 5 fields
- [ ] GET /api/admin/items returns array of items
- [ ] PUT /api/admin/items/:id updates existing item
- [ ] DELETE /api/admin/items/:id removes item
- [ ] GET /api/inventory returns `{ "items": [...] }` format
- [ ] GET /api/inventory excludes type: "money" items
- [ ] POST /api/inventory/sell with valid inventory_id works
- [ ] POST /api/inventory/sell adds sell_price_eur to user balance
- [ ] POST /api/inventory/sell prevents selling same item twice
- [ ] Authorization header validated on all protected endpoints
- [ ] Invalid token returns 401 status
- [ ] CORS enabled for frontend domain

---

## 📞 Contact

For questions about frontend implementation:
- Review component files in `/src/app/admin/` and `/src/app/components/`
- Check API calls in `fetch()` statements
- Verify data structures in TypeScript interfaces

**Last Updated**: December 28, 2024
**API Base URL**: http://91.107.120.48:3000
