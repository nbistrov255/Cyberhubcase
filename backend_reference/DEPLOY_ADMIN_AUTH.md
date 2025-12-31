# ⚡ БЫСТРЫЙ ДЕПЛОЙ - ADMIN АВТОРИЗАЦИЯ

## 📂 **ГДЕ ЛЕЖАТ ФАЙЛЫ НА VDS:**

```
/opt/cyberhub/src/
├── index.ts          ← ЗАМЕНИТЬ
├── database.ts       ← ЗАМЕНИТЬ
└── admin-auth.ts     ← НОВЫЙ ФАЙЛ (создать)
```

---

## 🚀 **ШАГИ НА VDS:**

### 1. Подключись к VDS:
```bash
ssh root@91.107.120.48
cd /opt/cyberhub
```

### 2. Обнови package.json (через FileZilla или nano):
```bash
nano package.json
```
**Скопируй содержимое** из `/backend_reference/package.json` и замени весь файл

### 3. Создай новый файл `src/admin-auth.ts`:
```bash
nano src/admin-auth.ts
```
**Скопируй содержимое** из `/backend_reference/admin-auth.ts` и вставь

### 4. Замени `src/database.ts`:
```bash
nano src/database.ts
```
**Замени весь файл** содержимым из `/backend_reference/database.ts`

### 5. Замени `src/index.ts`:
```bash
nano src/index.ts
```
**Замени весь файл** содержимым из `/backend_reference/index.ts`

### 6. Пересобери Docker:
```bash
docker compose down
docker compose up -d --build
docker compose logs -f --tail=100 backend
```

---

## ✅ **ОЖИДАЕМЫЕ ЛОГИ:**

```
✅ Database initialized
🔐 [AdminAuth] Creating default ROOT admin...
✅ [AdminAuth] Root admin created:
   Username: admin
   Password: paztehab255
   Role: owner
   🔥 CHANGE PASSWORD IMMEDIATELY!
🚀 Server ready!
```

---

## 🔐 **CREDENTIALS:**

```
Username: admin
Password: paztehab255
Role: owner
```

---

## 🧪 **ТЕСТ:**

```bash
curl -X POST http://91.107.120.48:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "paztehab255"}'
```

**Должно вернуть:**
```json
{
  "success": true,
  "session_token": "admin_xxxxxxxxxxxxx",
  "user_id": "...",
  "username": "admin",
  "role": "owner",
  "email": "admin@cyberhub.com"
}
```

---

## ✅ **ГОТОВО!**

После этого админка автоматически заработает! 🎉