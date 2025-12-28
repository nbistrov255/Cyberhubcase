# Integration Tests - Frontend + Backend

## 🧪 Manual Testing Checklist

This document provides step-by-step instructions for testing the integration between frontend and backend.

---

## ✅ Pre-Test Setup

1. **Backend is running** at `http://91.107.120.48:3000`
2. **Frontend is running** locally
3. **Admin account** credentials available
4. **Test user account** credentials available
5. **Browser DevTools** open (Console & Network tabs)

---

## 🔐 Test Suite 1: Authentication

### Test 1.1: Login Flow
**Steps:**
1. Open client application
2. Click on any locked feature (e.g., "Open Case")
3. Login modal should appear
4. Enter valid credentials
5. Click "SIGN IN"

**Expected Results:**
- ✅ Network request to `POST /api/auth/login`
- ✅ Response contains `session_token`
- ✅ Token saved to `localStorage.session_token`
- ✅ User profile loaded
- ✅ Balance displayed in top bar
- ✅ Modal closes
- ✅ Success toast notification

**Failure Cases:**
- ❌ Wrong credentials → Error toast "Login failed"
- ❌ Network error → Error toast
- ❌ Empty fields → Validation message

---

## 🛠️ Test Suite 2: Admin - Items Management

### Test 2.1: View Items List
**Steps:**
1. Open admin panel at `/admin`
2. Navigate to "Items" section
3. Items list should load

**Expected Results:**
- ✅ Network request to `GET /api/admin/items`
- ✅ Items displayed in grid/table
- ✅ Each item shows: type, title, image, price, sell price
- ✅ Loading spinner while fetching

**Check DevTools:**
```javascript
// Request
GET http://91.107.120.48:3000/api/admin/items
Headers: {
  Authorization: "Bearer ..."
}

// Response
[
  {
    "id": 1,
    "type": "skin",
    "title": "AK-47 | Redline",
    "image_url": "...",
    "price_eur": 50.00,
    "sell_price_eur": 45.00
  }
]
```

### Test 2.2: Create Item
**Steps:**
1. Click "Add Item" button
2. Fill in form:
   - Type: "skin"
   - Title: "Test Skin"
   - Image URL: "https://via.placeholder.com/300"
   - Price EUR: 100
   - Sell Price EUR: 90
3. Click "Save Item"

**Expected Results:**
- ✅ Network request to `POST /api/admin/items`
- ✅ Request body contains all 5 fields
- ✅ Modal closes on success
- ✅ Items list refreshes
- ✅ New item appears in list

**Check DevTools:**
```javascript
// Request
POST http://91.107.120.48:3000/api/admin/items
Headers: {
  Content-Type: "application/json",
  Authorization: "Bearer ..."
}
Body: {
  "type": "skin",
  "title": "Test Skin",
  "image_url": "https://via.placeholder.com/300",
  "price_eur": 100,
  "sell_price_eur": 90
}

// Response
{
  "success": true,
  "item": { ... }
}
```

### Test 2.3: Edit Item
**Steps:**
1. Click "Edit" on an existing item
2. Modify title to "Updated Title"
3. Click "Save Item"

**Expected Results:**
- ✅ Network request to `PUT /api/admin/items/:id`
- ✅ Request body contains updated data
- ✅ Item updates in list
- ✅ Changes reflected immediately

**Check DevTools:**
```javascript
// Request
PUT http://91.107.120.48:3000/api/admin/items/1
Body: {
  "type": "skin",
  "title": "Updated Title",
  ...
}
```

### Test 2.4: Delete Item
**Steps:**
1. Click "Delete" on an item
2. Confirm deletion in dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Network request to `DELETE /api/admin/items/:id`
- ✅ Item removed from list
- ✅ No page reload needed

**Check DevTools:**
```javascript
// Request
DELETE http://91.107.120.48:3000/api/admin/items/1
Headers: {
  Authorization: "Bearer ..."
}
```

### Test 2.5: Type Filter
**Steps:**
1. Create items of all 3 types (skin, physical, money)
2. Click "Skins" filter button
3. Click "Physical" filter button
4. Click "Money" filter button

**Expected Results:**
- ✅ Only matching items shown
- ✅ Filter buttons highlight correctly
- ✅ No API call (client-side filtering)

---

## 🎒 Test Suite 3: Client - Inventory

### Test 3.1: View Inventory (Empty)
**Steps:**
1. Login as user with no inventory items
2. Navigate to "Inventory" page

**Expected Results:**
- ✅ Network request to `GET /api/inventory`
- ✅ "No items in your inventory" message
- ✅ No error in console

**Check DevTools:**
```javascript
// Request
GET http://91.107.120.48:3000/api/inventory
Headers: {
  Authorization: "Bearer ..."
}

// Response
{
  "items": []
}
```

### Test 3.2: View Inventory (With Items)
**Setup:** Manually add items to user's inventory in database

**Steps:**
1. Login as user
2. Navigate to "Inventory" page

**Expected Results:**
- ✅ Network request to `GET /api/inventory`
- ✅ Items displayed in grid
- ✅ Each card shows: image, title, market price, sell price
- ✅ Type badge visible (SKIN/PHYSICAL)
- ✅ Money items NOT displayed

**Check DevTools:**
```javascript
// Response
{
  "items": [
    {
      "id": 1,
      "inventory_id": 101,
      "title": "AK-47 | Redline",
      "image_url": "...",
      "type": "skin",
      "sell_price_eur": 45.00,
      "price_eur": 50.00,
      "created_at": "..."
    }
  ]
}
```

### Test 3.3: Hover on Item
**Steps:**
1. Hover mouse over an item card

**Expected Results:**
- ✅ Dark overlay appears
- ✅ "SELL FOR X€" button appears
- ✅ Button shows correct sell price
- ✅ Smooth animation

### Test 3.4: Sell Item
**Steps:**
1. Hover over item
2. Click "SELL FOR X€" button

**Expected Results:**
- ✅ Network request to `POST /api/inventory/sell`
- ✅ Request body contains `inventory_id`
- ✅ Success toast: "Item sold for X€"
- ✅ Item disappears from grid (animated)
- ✅ No page reload
- ✅ Balance updates in top bar (if profile refreshed)

**Check DevTools:**
```javascript
// Request
POST http://91.107.120.48:3000/api/inventory/sell
Headers: {
  Content-Type: "application/json",
  Authorization: "Bearer ..."
}
Body: {
  "inventory_id": 101
}

// Response
{
  "success": true,
  "amount": 45.00,
  "new_balance": 145.50
}
```

### Test 3.5: Search Items
**Steps:**
1. Have multiple items in inventory
2. Type in search box "AK"

**Expected Results:**
- ✅ Only items matching "AK" shown
- ✅ No API call (client-side search)
- ✅ Real-time filtering as you type

### Test 3.6: Filter by Type
**Steps:**
1. Have mix of skin and physical items
2. Click "SKINS" filter
3. Click "PHYSICAL" filter

**Expected Results:**
- ✅ Only matching type shown
- ✅ Filter button highlighted
- ✅ No API call

---

## 🚨 Test Suite 4: Maintenance Mode

### Test 4.1: Enable Maintenance
**Steps:**
1. Login to admin panel
2. Go to Settings
3. Toggle "Maintenance Mode" ON
4. Click "Save Changes"

**Expected Results:**
- ✅ Toggle turns red
- ✅ Warning message appears
- ✅ `localStorage.maintenanceMode` set to "true"

### Test 4.2: Client Blocked
**Steps:**
1. Open client application (or refresh)
2. Should see maintenance screen

**Expected Results:**
- ✅ Full-screen maintenance message
- ✅ "Under Maintenance" heading
- ✅ Animated elements
- ✅ No access to any pages
- ✅ Background is #17171c

### Test 4.3: Admin Still Works
**Steps:**
1. Open admin panel at `/admin`

**Expected Results:**
- ✅ Admin panel loads normally
- ✅ NOT blocked by maintenance
- ✅ Can still manage items, cases, etc.

### Test 4.4: Disable Maintenance
**Steps:**
1. In admin Settings, toggle "Maintenance Mode" OFF
2. Click "Save Changes"
3. Refresh client app

**Expected Results:**
- ✅ Client app loads normally
- ✅ All features accessible

---

## 🔒 Test Suite 5: Authorization

### Test 5.1: Unauthorized Access to Items
**Steps:**
1. Logout (clear `localStorage.session_token`)
2. Try to access `GET /api/admin/items` via DevTools console:
```javascript
fetch('http://91.107.120.48:3000/api/admin/items')
  .then(r => r.json())
  .then(console.log)
```

**Expected Results:**
- ✅ 401 Unauthorized status
- ✅ Error response

### Test 5.2: Invalid Token
**Steps:**
1. Set invalid token: `localStorage.setItem('session_token', 'invalid')`
2. Try to access inventory

**Expected Results:**
- ✅ 401 Unauthorized
- ✅ Frontend handles gracefully
- ✅ May redirect to login

### Test 5.3: Expired Token
**Setup:** Backend should have token expiration

**Steps:**
1. Login normally
2. Wait for token to expire
3. Try to perform action

**Expected Results:**
- ✅ 401 Unauthorized
- ✅ User redirected to login
- ✅ Toast: "Session expired"

---

## ⚠️ Test Suite 6: Error Handling

### Test 6.1: Network Offline
**Steps:**
1. Open DevTools → Network tab
2. Set to "Offline"
3. Try to create item

**Expected Results:**
- ✅ Error toast displayed
- ✅ No crash
- ✅ User can retry

### Test 6.2: 500 Server Error
**Setup:** Backend returns 500 error

**Expected Results:**
- ✅ Error toast: "Failed to ..."
- ✅ Console error logged
- ✅ No crash

### Test 6.3: Malformed Response
**Setup:** Backend returns invalid JSON

**Expected Results:**
- ✅ Error handled gracefully
- ✅ Error toast shown
- ✅ Console error

### Test 6.4: Missing Required Fields
**Steps:**
1. Try to create item with missing title
2. Backend should return 400

**Expected Results:**
- ✅ Error toast with message
- ✅ Form not reset
- ✅ User can fix and retry

---

## 📊 Test Suite 7: Data Integrity

### Test 7.1: Sell Price Validation
**Test:** sell_price_eur should be ≤ price_eur

**Steps:**
1. Create item with sell_price > price
2. Backend should reject or auto-correct

**Expected:**
- ✅ Validation error OR
- ✅ Auto-corrected to price_eur

### Test 7.2: Duplicate Sell Prevention
**Steps:**
1. Sell an item
2. Try to sell same inventory_id again via API

**Expected Results:**
- ✅ 404 Not Found (item already sold)
- ✅ Error message

### Test 7.3: Balance Update on Sell
**Steps:**
1. Note current balance
2. Sell item worth 50€
3. Check balance

**Expected Results:**
- ✅ Balance increased by exactly 50€
- ✅ Transaction logged (if applicable)

---

## 🎯 Test Suite 8: Money Type Items

### Test 8.1: Money Item Won
**Setup:** User wins item with type: "money", value 100€

**Expected Backend Behavior:**
1. Add 100€ to user balance
2. Do NOT create inventory entry
3. Log transaction

**Frontend:**
- ✅ Money item NOT in `GET /api/inventory` response
- ✅ Balance updated immediately

### Test 8.2: Money Item in Admin
**Steps:**
1. Create item with type: "money"
2. Should appear in admin items list

**Expected Results:**
- ✅ Shows in admin
- ✅ Can edit/delete normally
- ✅ Can be added to cases

---

## 🔄 Test Suite 9: Real-Time Updates

### Test 9.1: Sell Without Reload
**Steps:**
1. Have 5 items in inventory
2. Sell 1 item
3. Do NOT refresh page

**Expected Results:**
- ✅ Item removed from grid
- ✅ Grid re-flows smoothly
- ✅ Count shows 4 items
- ✅ No page reload

### Test 9.2: Admin Create/Edit
**Steps:**
1. Create new item
2. Should appear immediately

**Expected Results:**
- ✅ List refreshes automatically
- ✅ New item at top/bottom
- ✅ Smooth animation

---

## 📱 Test Suite 10: Responsive Design

### Test 10.1: Mobile Inventory
**Steps:**
1. Open inventory on mobile (or resize to 375px)
2. Items should stack

**Expected Results:**
- ✅ Single column grid
- ✅ Touch-friendly buttons
- ✅ Sell button still accessible

### Test 10.2: Admin on Tablet
**Steps:**
1. Resize admin panel to tablet size

**Expected Results:**
- ✅ Forms adapt to smaller screen
- ✅ All fields accessible
- ✅ No horizontal scroll

---

## 🧹 Clean-Up After Tests

1. Delete test items created
2. Clear test user inventory
3. Disable maintenance mode
4. Logout from admin
5. Clear localStorage if needed

---

## 📝 Bug Report Template

If a test fails, report with:

```markdown
### Bug: [Short Description]

**Test Case:** Test X.Y - [Name]
**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
- 

**Actual Behavior:**
- 

**Network Request:**
```http
POST /api/...
Headers: ...
Body: ...
```

**Response:**
```json
{
  "error": "..."
}
```

**Console Errors:**
```
Error: ...
```

**Screenshots:**
[Attach if relevant]

**Environment:**
- Frontend Version: [commit hash]
- Backend Version: [version]
- Browser: Chrome 120
```

---

**Last Updated**: December 28, 2024
**Total Test Cases**: 30+
