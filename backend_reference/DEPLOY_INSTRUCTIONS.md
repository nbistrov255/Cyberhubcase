# 🚀 Backend Deploy Instructions

## Что было исправлено (2024-12-30)

### ❌ Проблемы ДО исправления:
1. **SmartShell HTTP Error 400** - старый API `createPayment` НЕ работает
2. **Timeout errors** - "This operation was aborted" (даже 30 сек мало)
3. **Карточка не исчезает** - API возвращает ошибку
4. **Можно спамить** - нажать "ПОЛУЧИТЬ" много раз подряд

### ✅ Что ИСПРАВЛЕНО:

| Проблема | Решение | Файл |
|----------|---------|------|
| HTTP 400 | `createPayment` → **`setBonus`** | `index.ts:157-206` |
| Timeout | Увеличен до **60 секунд** | `index.ts:61` |
| Карточка | Правильная обработка ошибок | Frontend + Backend |
| Защита | Item блокируется через `status='processing'` | `index.ts:465-478` |

---

## 📝 Новый API setBonus

**Было (НЕ работало):**
```graphql
mutation CreatePayment { createPayment(...) }  # ❌ HTTP 400
```

**Стало (работает):**
```graphql
mutation SetBonus($input: SetBonusInput!) {
  setBonus(input: $input) {
    uuid
    login
  }
}
variables: {
  input: {
    client_uuid: "5704047b-...",  # UUID клиента
    value: 105  # НОВЫЙ итоговый бонусный баланс (не прибавка!)
  }
}
```

**Алгоритм:**
1. GET текущий `bonus` через `query { clients { data { uuid bonus } } }`
2. CALCULATE: `newBonus = currentBonus + amount`
3. SET новый баланс: `setBonus(client_uuid, newBonus)`

---

## 📦 Файлы для деплоя

Скопируй эти файлы на VDS в папку `/app/src/`:

```bash
/backend_reference/index.ts       → /app/src/index.ts
/backend_reference/database.ts    → /app/src/database.ts
```

---

## 🔧 Команды для деплоя

### 1. Остановить старый контейнер:
```bash
docker-compose down
```

### 2. Скопировать новые файлы:
```bash
# На твоём локальном компьютере:
scp backend_reference/index.ts root@91.107.120.48:/app/src/index.ts
scp backend_reference/database.ts root@91.107.120.48:/app/src/database.ts
```

### 3. Перезапустить контейнер:
```bash
docker-compose up -d --build
```

### 4. Проверить логи:
```bash
docker-compose logs -f cyberhub_api
```

---

## 📝 Проверочный чек-лист

После деплоя проверь:

### ✅ Backend запустился без ошибок TypeScript:
```
[nodemon] starting `ts-node src/index.ts`
[Backend] Started on port 3000
```

❌ **НЕ должно быть:**
```
TSError: ⨯ Unable to compile TypeScript:
```

### ✅ При нажатии "ПОЛУЧИТЬ" на money item в логах должно быть:

```
📥 CLAIM REQUEST RECEIVED
👤 User: 5704047b-..., Item: 6
💰 Auto-claiming money...
🔒 Item locked (status = 'processing')
💰 [SmartShell] Adding 5€ BONUS to 5704047b-...
✅ Found client_id: 12345 for UUID: 5704047b-...
✅ BONUS payment created: <payment_id>, amount: 5€
✅ Money added
📡 GET /api/profile
```

❌ **НЕ должно быть:**
```
This operation was aborted
❌ Failed to add BONUS
```

### ✅ Frontend поведение:

1. Нажимаешь "ПОЛУЧИТЬ" на карточке с деньгами
2. ⚡ **Карточка сразу исчезает** (не нужно обновлять страницу)
3. ⚡ **Баланс в TopBar обновляется автоматически**
4. ⚡ **НЕТ редиректа** (остаёшься на странице Inventory)
5. ⚡ **Нельзя нажать дважды** (item блокируется на сервере)

---

## 🐛 Если что-то не работает

### Проблема 1: "This operation was aborted" в логах

**Причина:** Timeout 30 сек недостаточно (очень медленная сеть до SmartShell API)

**Решение:**
```typescript
// index.ts:61
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 сек
```

### Проблема 2: "❌ Failed to add BONUS: ..."

**Проверь:**
1. `.env` содержит правильные credentials:
   ```env
   SMARTSHELL_LOGIN=ваш_логин
   SMARTSHELL_PASSWORD=ваш_пароль
   SMARTSHELL_CLUB_ID=123
   ```

2. Сервисный аккаунт имеет права на `createPayment` mutation в SmartShell

3. Логи показывают точную ошибку:
   ```bash
   docker-compose logs cyberhub_api | grep "Full error"
   ```

### Проблема 3: Баланс не пополняется в SmartShell

**Проверь тип платежа:**
- Зайди в SmartShell админку → Payments
- Найди последний платёж для клиента
- **Должен быть тип:** `BONUS` (не `DEPOSIT`!)
- **Сумма:** должна совпадать с `amount_eur` из item

### Проблема 4: Карточка не исчезает из инвентаря

**Проверь:**
1. Frontend логи в DevTools Console:
   ```
   ✅ Profile refreshed successfully
   ```

2. Backend вернул `success: true`:
   ```json
   { "success": true, "type": "money", "message": "Added 5€ to balance" }
   ```

3. Item в БД имеет `status='received'`:
   ```sql
   SELECT * FROM inventory WHERE id = <inventory_id>;
   -- status должен быть 'received'
   ```

---

## 🔍 Debugging команды

### Посмотреть текущие inventory items:
```bash
docker exec -it cyberhub_api sqlite3 /app/data.db "SELECT id, user_uuid, title, type, status FROM inventory WHERE status != 'received' LIMIT 10;"
```

### Посмотреть последние requests:
```bash
docker exec -it cyberhub_api sqlite3 /app/data.db "SELECT id, user_uuid, item_title, type, status FROM requests ORDER BY created_at DESC LIMIT 5;"
```

### Проверить SmartShell баланс вручную:
```bash
curl -X POST https://billing.smartshell.gg/api/graphql \
  -H "Authorization: Bearer <YOUR_SERVICE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { clients(page: 1, first: 1) { data { uuid deposit } } }"
  }'
```

---

## 📞 Support

Если проблемы продолжаются, проверь:
1. ✅ Backend логи на VDS (`docker-compose logs -f cyberhub_api`)
2. ✅ Frontend Console в DevTools (F12)
3. ✅ Network tab в DevTools → XHR → `/api/inventory/claim` response
4. ✅ SmartShell API GraphQL Playground (https://billing.smartshell.gg/api/graphql)

---

## 🎯 Финальный результат

После успешного деплоя:

✅ **Backend компилируется** без TypeScript ошибок  
✅ **createPayment с type="BONUS"** реально пополняет баланс  
✅ **Защита от дублей** через `status='processing'`  
✅ **Timeout 30 сек** - достаточно для SmartShell API  
✅ **Frontend без перезагрузки** - `refreshProfile()` вместо `reload()`  
✅ **Карточка исчезает сразу** после успешного claim  

🎉 **Всё работает!**