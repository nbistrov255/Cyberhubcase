# 📝 ЭТАЛОННАЯ КОНФИГУРАЦИЯ VITE

## ⚠️ ВАЖНО: НЕ ИЗМЕНЯЙТЕ БЕЗ НЕОБХОДИМОСТИ!

Этот файл содержит **эталонную конфигурацию** `vite.config.ts` для проекта CyberHub.

---

## 🎯 Актуальная конфигурация

### Файл: `/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Required for Tailwind v4
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://91.107.120.48:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

---

## 🔒 КРИТИЧЕСКИЕ КОМПОНЕНТЫ

### 1. ❌ НЕ УДАЛЯТЬ: Плагин `tailwindcss()`

```typescript
plugins: [
  react(),
  tailwindcss(), // Required for Tailwind v4 ← ОБЯЗАТЕЛЬНО!
],
```

**Почему:**
- Tailwind CSS v4 работает ТОЛЬКО через этот плагин
- Без него стили не будут компилироваться
- Альтернативы для v4 нет

---

### 2. ❌ НЕ УДАЛЯТЬ: Секция `server.proxy`

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://91.107.120.48:3000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

**Почему:**
- Проксирует все запросы к `/api/*` на бэкенд
- Решает проблемы с CORS в development
- Обязательно для работы с API

---

### 3. ✅ МОЖНО ИЗМЕНЯТЬ: Alias `@`

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
```

**Использование:**
```typescript
// Вместо
import { Component } from '../../components/Component'

// Можно
import { Component } from '@/components/Component'
```

---

## 📋 Описание компонентов

### Плагины

| Плагин | Назначение | Обязательный |
|--------|------------|--------------|
| `react()` | Поддержка React + JSX/TSX | ✅ Да |
| `tailwindcss()` | Tailwind CSS v4 | ✅ Да |

### Proxy конфигурация

| Параметр | Значение | Описание |
|----------|----------|----------|
| `target` | `http://91.107.120.48:3000` | Адрес бэкенд сервера |
| `changeOrigin` | `true` | Изменяет заголовок Origin |
| `secure` | `false` | Разрешает HTTP (не HTTPS) |

**Маршрутизация:**
```
Frontend запрос:  http://localhost:5173/api/inventory
         ↓
Vite Proxy:      http://91.107.120.48:3000/api/inventory
         ↓
Backend ответ:   { items: [...] }
```

---

## 🔧 Возможные расширения

### Добавление дополнительных proxy маршрутов:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://91.107.120.48:3000',
      changeOrigin: true,
      secure: false,
    },
    '/uploads': {  // Пример: статические файлы
      target: 'http://91.107.120.48:3000',
      changeOrigin: true,
      secure: false,
    },
  }
}
```

### Добавление переменных окружения:

```typescript
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
  },
  // ... остальное
})
```

### Оптимизация сборки:

```typescript
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  // ... остальное
})
```

---

## ⚠️ Что НЕ делать

### ❌ Не добавляйте PostCSS плагины для Tailwind:

```typescript
// НЕПРАВИЛЬНО для v4:
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),  // ← НЕ НУЖНО!
        require('autoprefixer'), // ← НЕ НУЖНО!
      ],
    },
  },
})
```

**Почему:** `@tailwindcss/vite` всё делает автоматически!

---

### ❌ Не создавайте `tailwind.config.ts`:

```typescript
// НЕПРАВИЛЬНО для v4:
// tailwind.config.ts
export default {
  content: ['./src/**/*.tsx'],
  // ...
}
```

**Почему:** Tailwind v4 не использует этот файл!

---

### ❌ Не удаляйте proxy в production сборке:

```typescript
// НЕПРАВИЛЬНО:
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: mode === 'development' ? {
    proxy: { /* ... */ }
  } : undefined,  // ← НЕ ДЕЛАЙТЕ ТАК!
}))
```

**Почему:** Proxy нужен только в dev режиме, но конфиг должен быть всегда!

---

## 🧪 Проверка конфигурации

### После изменения vite.config.ts:

```bash
# 1. Остановите сервер
Ctrl+C

# 2. Очистите кэш
rm -rf node_modules/.vite

# 3. Запустите
npm run dev
```

### Тест работы proxy:

```bash
# В браузере (DevTools → Console):
fetch('/api/cases')
  .then(r => r.json())
  .then(console.log)
```

**Должно:**
- ✅ Запрос идет на `/api/cases`
- ✅ Vite проксирует на `http://91.107.120.48:3000/api/cases`
- ✅ Нет ошибок CORS

### Тест работы Tailwind:

```bash
# В браузере (DevTools → Elements):
# Найдите элемент с классами:
<div class="bg-[#17171c] flex items-center">
```

**Должно:**
- ✅ Классы применяются
- ✅ Фон темный (#17171c)
- ✅ Flex работает

---

## 📚 Связанные файлы

### Зависимости конфигурации:

```
vite.config.ts
  ├── @tailwindcss/vite (плагин)
  │   └── src/styles/tailwind.css (@import 'tailwindcss')
  │       └── src/styles/index.css (импортирует tailwind.css)
  │           └── src/main.tsx (import './styles/index.css')
  │
  └── server.proxy
      └── Все запросы к /api/* в компонентах
```

### Файлы стилей:

- `/src/styles/tailwind.css` - `@import 'tailwindcss';`
- `/src/styles/index.css` - импортирует все стили
- `/src/main.tsx` - импортирует `index.css` первым

---

## 🔄 История изменений

### v1.0 (28 декабря 2024)
- ✅ Добавлен плагин `@tailwindcss/vite` для Tailwind v4
- ✅ Настроен proxy для API на `http://91.107.120.48:3000`
- ✅ Добавлен alias `@` для `./src`
- ✅ Порядок импортов: `react()`, `tailwindcss()`

---

## 💾 Резервная копия

### Если нужно восстановить:

```bash
# Скопируйте эту конфигурацию в vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Required for Tailwind v4
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://91.107.120.48:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
EOF
```

---

## ✅ Чек-лист при изменениях

Перед коммитом изменений в `vite.config.ts`:

- [ ] Плагин `tailwindcss()` присутствует
- [ ] Плагин `react()` присутствует
- [ ] Секция `server.proxy` не удалена
- [ ] Proxy target: `http://91.107.120.48:3000`
- [ ] Alias `@` настроен
- [ ] НЕТ PostCSS плагинов для Tailwind
- [ ] НЕТ ссылок на `tailwind.config.ts`
- [ ] Проект запускается: `npm run dev`
- [ ] Стили работают (темный фон)
- [ ] API запросы работают (через `/api/*`)

---

**Последнее обновление:** 28 декабря 2024  
**Версия Vite:** 6.3.5  
**Версия Tailwind:** 4.1.12  
**Статус:** ✅ Эталонная конфигурация
