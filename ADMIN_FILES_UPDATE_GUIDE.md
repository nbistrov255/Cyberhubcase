# 🔧 ADMIN FILES UPDATE GUIDE

## 📋 ПРОБЛЕМА
Админка и клиент использовали ОДИНАКОВЫЙ ключ localStorage `'session_token'`, что вызывало конфликт.

## ✅ РЕШЕНИЕ
Создан отдельный ключ для админа: `'admin_session_token'` и утилиты в `/src/app/admin/utils/adminAuth.ts`

---

## 🚀 МАССОВАЯ ЗАМЕНА В ADMIN ФАЙЛАХ

### Шаг 1: Добавить импорт

Во всех файлах админки которые используют токен, добавить:

```typescript
import { getAdminToken, getAdminAuthHeaders } from '../utils/adminAuth';
```

### Шаг 2: Заменить все вхождения

#### Вариант A: Если используется только токен

```typescript
// ❌ СТАРОЕ
const token = localStorage.getItem('session_token');
const response = await fetch('/api/admin/something', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// ✅ НОВОЕ
const token = getAdminToken();
const response = await fetch('/api/admin/something', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

#### Вариант B: Если нужны полные headers (проще!)

```typescript
// ❌ СТАРОЕ
const token = localStorage.getItem('session_token');
const response = await fetch('/api/admin/something', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});

// ✅ НОВОЕ
const response = await fetch('/api/admin/something', {
  headers: getAdminAuthHeaders(),
  body: JSON.stringify(data),
});
```

---

## 📁 ФАЙЛЫ ДЛЯ ОБНОВЛЕНИЯ

### ✅ Уже обновлены:
- `/src/app/admin/AdminApp.tsx`
- `/src/app/admin/utils/adminAuth.ts` (создан)

### ⚠️ Требуют обновления:

#### 1. `/src/app/admin/components/AdminLayout.tsx`
**Строка 63:**
```typescript
const token = localStorage.getItem('session_token');
// Заменить на:
const token = getAdminToken();
```

#### 2. `/src/app/admin/components/CaseFormModal.tsx`
**Строка 96:**
```typescript
const token = localStorage.getItem('session_token');
// Заменить на:
const token = getAdminToken();
```

#### 3. `/src/app/admin/pages/DashboardPage.tsx`
**Строка 32:**
```typescript
const token = localStorage.getItem('session_token');
// Заменить на:
const token = getAdminToken();
```

#### 4. `/src/app/admin/pages/ItemsPage.tsx`
**Строки: 42, 87, 150**
```typescript
const token = localStorage.getItem('session_token');
// Заменить на:
const token = getAdminToken();
```

#### 5. `/src/app/admin/pages/LogsPage.tsx`
**Строка 35:**
```typescript
const token = localStorage.getItem('session_token');
// Заменить на:
const token = getAdminToken();
```

#### 6. `/src/app/admin/pages/ProblemQueuePage.tsx`
**Строки: 42, 112, 135**
```typescript
const token = localStorage.getItem('session_token');
// Заменить на:
const token = getAdminToken();
```

#### 7. `/src/app/admin/pages/UsersPage.tsx`
**Строки: 53, 108, 159, 184, 216**
```typescript
const token = localStorage.getItem('session_token');
// Заменить на:
const token = getAdminToken();
```

#### 8. `/src/app/admin/pages/CasesPage.tsx`
Этот файл использует `getAuthHeaders` из клиентского API! Нужно заменить на:
```typescript
// Убрать импорт
import { getAuthHeaders } from '../../../config/api';

// Добавить импорт
import { getAdminAuthHeaders } from '../utils/adminAuth';

// Заменить все вхождения getAuthHeaders() на getAdminAuthHeaders()
```

#### 9. `/src/app/admin/pages/RequestsPage.tsx`
Уже добавлен импорт, проверить что не используется старый токен.

---

## 🤖 АВТОМАТИЧЕСКАЯ ЗАМЕНА (VS Code)

### Find and Replace в папке `/src/app/admin`:

1. **Найти:** `localStorage\.getItem\('session_token'\)`  
   **Заменить на:** `getAdminToken()`

2. **Найти:** `localStorage\.removeItem\('session_token'\)`  
   **Заменить на:** `clearAdminToken()`

3. **Найти:** `localStorage\.setItem\('session_token', (.+?)\)`  
   **Заменить на:** `setAdminToken($1)`

### Добавить импорты вручную в каждый файл:
```typescript
import { getAdminToken, getAdminAuthHeaders } from '../utils/adminAuth';
```

---

## ✅ ПРОВЕРКА ПОСЛЕ ОБНОВЛЕНИЯ

1. Очистить localStorage: `localStorage.clear()`
2. Перезагрузить админку
3. Войти как админ → проверить что токен сохраняется в `admin_session_token`
4. Перезагрузить страницу → проверить что сессия сохранилась
5. Войти на клиентский сайт → проверить что клиентская сессия НЕ затерлась

---

## 🎯 ИТОГ

После всех замен:
- ✅ Админ использует `admin_session_token`
- ✅ Клиент использует `session_token`
- ✅ Оба могут работать одновременно без конфликтов
- ✅ Авторизация сохраняется после перезагрузки

---

**Готово!** 🚀
