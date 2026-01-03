# 🔥 BACKEND UPDATE: Real-time Request Timing

## 📋 ПРОБЛЕМА
- Таймер заявок сбрасывался при перезагрузке страницы
- Время отсчитывалось только на frontend в localStorage
- При выходе/входе клиента таймер начинался заново с 37 минут

## ✅ РЕШЕНИЕ
Backend теперь хранит `created_at` timestamp для каждой заявки, а frontend вычисляет реальное оставшееся время.

---

## 🔧 ИЗМЕНЕНИЯ В BACKEND

### 1. Новый Endpoint: `GET /api/user/requests`

**Файл:** `/backend_reference/index.ts`

**Добавить после строки 691 (`app.post("/api/user/tradelink", ...)`)**:

```typescript
// 🔥 НОВОЕ: GET /api/user/requests - Получить активные заявки пользователя
app.get("/api/user/requests", requireSession, async (req, res) => {
    try {
        const user_uuid = res.locals.session.user_uuid;
        
        // Получаем только активные заявки (pending)
        const requests = await db.all(`
            SELECT 
                r.id as requestId,
                r.inventory_id as id,
                r.item_title as itemName,
                r.status,
                r.created_at,
                r.updated_at,
                r.admin_comment,
                inv.rarity as itemRarity
            FROM requests r
            LEFT JOIN inventory inv ON r.inventory_id = inv.id
            WHERE r.user_uuid = ? AND r.status IN ('pending', 'approved', 'denied')
            ORDER BY r.created_at DESC
        `, user_uuid);
        
        console.log(`📋 [User Requests] Found ${requests.length} requests for user ${user_uuid}`);
        res.json({ success: true, requests });
    } catch (e: any) {
        console.error("❌ [User Requests] Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});
```

---

## 📦 ДЕПЛОЙ НА VDS

### Шаги:

1. **Скопировать обновленный файл на сервер:**
```bash
scp /backend_reference/index.ts root@91.107.120.48:/root/cyberhub-backend/src/index.ts
```

2. **Перезапустить Docker контейнер:**
```bash
ssh root@91.107.120.48
cd /root/cyberhub-backend
docker-compose restart cyberhub_api
```

3. **Проверить логи:**
```bash
docker logs -f cyberhub_api
```

---

## ✅ ЧТО ИЗМЕНИЛОСЬ НА FRONTEND

### Файл: `/src/app/components/PlayerProfile.tsx`

1. **Убрано сохранение requests в localStorage** - больше не нужно
2. **Добавлена загрузка с backend** при монтировании компонента:
   ```typescript
   const fetchActiveRequests = async () => {
     const response = await fetch(API_ENDPOINTS.getUserRequests, {
       headers: getAuthHeaders(),
     });
     // Преобразует backend данные в ClaimRequest формат
   };
   ```

3. **CountdownTimer пересчитывает время** на основе `timestamp`:
   ```typescript
   const elapsedSeconds = Math.floor((Date.now() - request.timestamp.getTime()) / 1000);
   const remaining = Math.max(0, MAX_TIME - elapsedSeconds);
   ```

---

## 🎯 РЕЗУЛЬТАТ

**ДО:**
- Клиент вышел → таймер сбрасывается
- Перезагрузка → снова 37 минут

**ПОСЛЕ:**
- Таймер идет **реально** на основе времени создания заявки
- Клиент может выйти/войти → таймер продолжает идти
- При перезагрузке показывается **реальное** оставшееся время

---

## 📊 ПРИМЕР

```
Заявка создана: 14:00:00
Клиент зашёл в 14:20:00 (через 20 минут)
Оставшееся время: 17 минут (37 - 20 = 17)
```

**Вместо:**
```
Заявка создана: 14:00:00
Клиент зашёл в 14:20:00
Оставшееся время: 37 минут ❌ (НЕПРАВИЛЬНО!)
```

---

## 🔥 ГОТОВО!

Теперь таймер работает **как надо** - даже если клиент перезагрузит страницу! 🚀
