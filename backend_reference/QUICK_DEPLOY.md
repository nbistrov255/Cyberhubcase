# ⚡ Quick Deploy Guide

## 🚀 Деплой за 3 команды

```bash
# 1. Скопировать файл
scp backend_reference/index.ts root@91.107.120.48:/app/src/index.ts

# 2. Перезапустить
ssh root@91.107.120.48 "cd /path/to/docker && docker-compose restart cyberhub_api"

# 3. Проверить логи
ssh root@91.107.120.48 "docker-compose logs -f cyberhub_api"
```

---

## ✅ Что должно быть в логах

### При запуске:
```
[nodemon] starting `ts-node src/index.ts`
[Backend] Started on port 3000
```

### При нажатии "ПОЛУЧИТЬ":
```
📥 CLAIM REQUEST RECEIVED
💰 Auto-claiming money...
🔒 Item locked (status = 'processing')
💰 [SmartShell] Adding 5€ BONUS to 5704047b-...
🔑 Service token obtained
📡 Step 1/2: Fetching current BONUS balance...
✅ Step 1/2: Received 2543 clients
📊 Current BONUS: 100€, Adding: 5€, New: 105€
📡 Step 2/2: Setting new BONUS balance...
✅ BONUS updated: 105€ (added 5€)
✅ Money added
```

---

## ❌ Чего НЕ должно быть

```
TSError: ⨯ Unable to compile TypeScript
Fetch Error: This operation was aborted
❌ Failed to add BONUS
SmartShell HTTP Error: 400
```

---

## 🎯 Быстрый тест

1. Открой кейс → получи money item
2. Нажми "ПОЛУЧИТЬ"
3. Проверь:
   - ✅ Карточка исчезла
   - ✅ Баланс в TopBar обновился
   - ✅ Нет перезагрузки страницы
   - ✅ БОНУСНЫЙ баланс в SmartShell увеличился

---

## 📝 Что изменилось

| Параметр | Было | Стало |
|----------|------|-------|
| API | `createPayment` ❌ | `setBonus` ✅ |
| Timeout | 60 сек | **90 сек** |
| Логи | Минимум | **Детальные** |
| Запрос | `first: 5000` | `first: 10000` |

---

## 🔧 Если timeout всё равно мало

Увеличь до 120 сек:

```typescript
// /app/src/index.ts:61
const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 сек
```

Затем:
```bash
docker-compose restart cyberhub_api
```

---

## 📞 Помощь

Если не работает, дай:
- Логи VDS (`docker-compose logs cyberhub_api`)
- Network tab из DevTools (XHR → `/api/inventory/claim`)
- Console из DevTools (F12)

🚀 **Готово!**
