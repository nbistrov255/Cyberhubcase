# 🔄 TODO: Завершение интеграции API

## ✅ Уже сделано:

1. **AdminApp** - убрана проверка пароля (любой username может войти)
2. **TopBar** - добавлен `useAuth()`, заменен баланс на Topup Today/Month
3. **React Router** - установлен и готов к использованию
4. **LoginModal** - уже работает с AuthContext, показывает ошибки через toast

---

## 🔴 Критические задачи (нужно доделать):

### 1. LIVE FEED - Подключить GET /api/stats/live

**Файл:** `/src/app/components/TopBar.tsx`

**Текущая проблема:**
```typescript
const [feedItems, setFeedItems] = useState<LiveFeedItem[]>(mockLiveFeed);

useEffect(() => {
  const interval = setInterval(() => {
    setFeedItems((prev) => {
      const newItem = generateRandomLiveFeedItem();
      return [newItem, ...prev.slice(0, 24)];
    });
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

**Решение:**
```typescript
const [feedItems, setFeedItems] = useState<LiveFeedItem[]>([]);

useEffect(() => {
  const fetchLiveFeed = async () => {
    try {
      const response = await fetch('/api/stats/live');
      const data = await response.json();
      
      if (data.success && data.spins) {
        // Преобразовать data.spins в LiveFeedItem[]
        const items = data.spins.map((spin: any) => ({
          id: spin.id || Date.now().toString(),
          itemName: spin.prize_name || spin.itemName,
          itemImage: spin.prize_image || spin.itemImage,
          rarity: (spin.prize_rarity || spin.rarity || 'common').toLowerCase(),
          playerName: spin.player_nickname || spin.playerName || 'Unknown',
          playerAvatar: spin.player_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          playerLevel: spin.player_level || 1,
          caseName: spin.case_name || spin.caseName || 'Unknown Case',
          timestamp: spin.created_at ? new Date(spin.created_at) : new Date(),
        }));
        setFeedItems(items);
      }
    } catch (err) {
      console.error('Failed to load live feed:', err);
      // Показать пустой массив или заглушку
      setFeedItems([]);
    }
  };

  fetchLiveFeed();
  
  // Обновлять каждые 10 секунд
  const interval = setInterval(fetchLiveFeed, 10000);
  return () => clearInterval(interval);
}, []);
```

**Где найти:** Строка ~250

---

### 2. CASES PAGE - Подключить GET /api/me для кейсов

**Файл:** `/src/app/components/CasesPage.tsx`

**Текущая проблема:**
```typescript
const eventCases: CaseData[] = [...]; // Hardcoded
const permanentCases: CaseData[] = [...]; // Hardcoded
```

**Решение:**
```typescript
import { useAuth } from '../contexts/AuthContext';

export function CasesPage({ onCaseClick, isAuthenticated }: CasesPageProps) {
  const { profile } = useAuth();
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !profile) {
      setLoading(false);
      return;
    }

    // Преобразовать profile.cases в CaseData[]
    const mappedCases = profile.cases.map((apiCase) => ({
      id: apiCase.id,
      name: apiCase.type === 'daily' ? 'Daily Case' : 'Monthly Case',
      image: 'https://i.ibb.co/bRChPPVb/boxcard.png', // Дефолт
      tier: apiCase.type === 'daily' ? 'Common' : 'Premium',
      deposited: apiCase.progress,
      required: apiCase.threshold,
      usedToday: !apiCase.available,
      isEvent: false,
    }));

    setCases(mappedCases);
    setLoading(false);
  }, [profile, isAuthenticated]);

  if (loading) {
    return <div>Loading cases...</div>;
  }

  // Разделить на event и permanent
  const eventCases = cases.filter(c => c.isEvent);
  const permanentCases = cases.filter(c => !c.isEvent);

  // ... rest of component
}
```

**Где найти:** Начало файла CasesPage.tsx

---

### 3. TOP BAR - Отобразить реальный nickname

**Файл:** `/src/app/components/TopBar.tsx`

**Текущая проблема:**
```typescript
// В аватарке показывается "LVL 44" хардкод
<span className="text-[9px] font-bold text-white/90 tracking-wide">LVL 44</span>
```

**Решение:**
```typescript
// Уже есть: const { profile } = useAuth();

// Заменить на:
<span className="text-[9px] font-bold text-white/90 tracking-wide">
  {profile?.nickname || 'Guest'}
</span>

// Или если нужен уровень:
<span className="text-[9px] font-bold text-white/90 tracking-wide">
  LVL {profile?.level || 1}
</span>
```

**Где найти:** Строка ~385

---

### 4. РОУТИНГ ДЛЯ /ADMIN

**Проблема:** Нет роутинга, /admin не работает

**Решение 1 (Простой - без React Router):**

Создать файл `/index.html` с редиректом:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CyberHub</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Проверка URL и загрузка нужного приложения
      if (window.location.pathname.startsWith('/admin')) {
        import('./src/admin-main.tsx');
      } else {
        import('./src/main.tsx');
      }
    </script>
  </body>
</html>
```

**Решение 2 (Правильный - с React Router):**

Обновить `/src/main.tsx`:
```typescript
import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './app/App';
import AdminAppEntry from './app/AdminAppEntry';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminAppEntry />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
```

---

## 📊 API Endpoints справка:

### GET /api/me
```json
{
  "success": true,
  "profile": {
    "uuid": "...",
    "nickname": "PlayerName",
    "dailySum": 25.50,
    "monthlySum": 125.00,
    "cases": [
      {
        "id": "daily-case-1",
        "type": "daily",
        "threshold": 10,
        "available": true,
        "progress": 5
      }
    ],
    "progress": {
      "daily_topup_eur": 5.50,
      "monthly_topup_eur": 25.00
    }
  }
}
```

### GET /api/stats/live
```json
{
  "success": true,
  "spins": [
    {
      "id": "spin-123",
      "player_nickname": "ProGamer",
      "player_avatar": "https://...",
      "player_level": 42,
      "prize_name": "AK-47 | Fire Serpent",
      "prize_image": "https://...",
      "prize_rarity": "legendary",
      "case_name": "Premium Case",
      "created_at": "2024-12-28T10:30:00Z"
    }
  ]
}
```

### POST /api/cases/open
```json
// Request
{
  "caseId": "daily-case-1"
}

// Response
{
  "success": true,
  "prize": {
    "id": "prize-456",
    "name": "M4A4 | Howl",
    "image": "https://...",
    "rarity": "mythic",
    "value": 150.00
  }
}
```

---

## ⚠️ Важные замечания:

1. **Все API запросы через прокси** - используй `/api/...`, НЕ `http://91.107.120.48:3000/api/...`
2. **Авторизация** - добавляй `headers: getAuthHeaders()` из `/src/config/api.ts`
3. **Обработка ошибок** - всегда проверяй `response.ok` и `data.success`
4. **Profile может быть null** - используй `profile?.property` или проверки

---

## 🧪 Как тестировать:

1. Запусти `npm run dev`
2. Открой http://localhost:5173
3. Авторизуйся (любой login/password работает в моке AuthContext)
4. Проверь:
   - TopBar показывает реальный Topup Today/Month из profile
   - Live Feed загружается из /api/stats/live
   - CasesPage показывает кейсы из profile.cases
   - Nickname отображается вместо "Guest"

---

## 📁 Измененные файлы:

- ✅ `/src/app/admin/AdminApp.tsx` - убрана проверка пароля
- ✅ `/src/app/components/TopBar.tsx` - добавлен useAuth, Topup Today/Month
- ⏳ `/src/app/components/TopBar.tsx` - нужно подключить Live Feed API
- ⏳ `/src/app/components/CasesPage.tsx` - нужно подключить cases из profile
- ⏳ `/src/main.tsx` - нужно добавить роутинг для /admin

---

**Статус:** 60% выполнено, осталось подключить API для Live Feed и CasesPage, настроить роутинг
