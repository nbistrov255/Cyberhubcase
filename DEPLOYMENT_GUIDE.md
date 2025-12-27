# 🚀 CyberHub Deployment Guide

## 📋 Обзор проекта

Проект состоит из **двух независимых приложений**:

### 1️⃣ **Клиентское приложение** (Desktop .exe)
- **Назначение**: Приложение для клиентов компьютерных клубов
- **Формат**: Десктопное приложение для Windows (.exe)
- **Интеграция**: SmartShell API
- **Функционал**: Открытие кейсов, инвентарь, профили игроков

### 2️⃣ **Админ-панель** (Web)
- **Назначение**: Веб-панель управления для персонала
- **Формат**: Веб-сайт (домен)
- **Интеграция**: SmartShell API + Backend
- **Функционал**: Управление кейсами, пользователями, заявками, логами

---

## 📦 Как экспортировать проект

### Вариант 1: Скачать все файлы из Figma Make

1. В интерфейсе Figma Make найдите кнопку **"Export"** или **"Download"**
2. Скачайте весь проект как `.zip` архив
3. Распакуйте архив

### Вариант 2: Вручную скопировать структуру

Скопируйте все файлы и папки:

```
cyberhub-project/
├── src/
│   ├── app/
│   │   ├── App.tsx                          # Точка входа (КЛИЕНТ)
│   │   ├── AdminAppEntry.tsx                # Точка входа (АДМИН)
│   │   ├── ClientApp.tsx                    # Клиентское приложение
│   │   ├── admin/                           # Админ-панель
│   │   ├── components/                      # Компоненты клиента
│   │   └── contexts/                        # Контексты
│   └── styles/                              # Стили
├── package.json
├── vite.config.ts
├── postcss.config.mjs
├── ADMIN_README.md
├── SWITCH_TO_ADMIN.md
└── DEPLOYMENT_GUIDE.md (этот файл)
```

---

## 🔧 Разделение проектов

### Шаг 1: Создайте два отдельных проекта

```bash
# Создайте две папки
mkdir cyberhub-client
mkdir cyberhub-admin
```

### Шаг 2: Клиентское приложение (Desktop)

**Скопируйте в `cyberhub-client/`:**

```
cyberhub-client/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # import ClientApp
│   │   ├── ClientApp.tsx
│   │   ├── components/                # ВСЕ кроме admin/
│   │   └── contexts/
│   │       └── LanguageContext.tsx    # ТОЛЬКО клиентский
│   └── styles/
├── package.json
├── vite.config.ts
└── electron.config.js                 # (создать позже)
```

**Обновите `/src/app/App.tsx`:**
```tsx
import ClientApp from './ClientApp';

export default function App() {
  return <ClientApp />;
}
```

### Шаг 3: Админ-панель (Web)

**Скопируйте в `cyberhub-admin/`:**

```
cyberhub-admin/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # import AdminAppEntry
│   │   ├── AdminAppEntry.tsx
│   │   ├── admin/                     # ВСЯ папка admin/
│   │   └── components/
│   │       └── ui/                    # Только UI компоненты
│   └── styles/
├── package.json
├── vite.config.ts
└── .env                               # API endpoints
```

**Обновите `/src/app/App.tsx`:**
```tsx
import AdminAppEntry from './AdminAppEntry';

export default function App() {
  return <AdminAppEntry />;
}
```

---

## 💻 Превращение клиента в .exe приложение

### Рекомендуемый вариант: Electron

**Electron** - популярный фреймворк для создания десктопных приложений из веб-технологий.

#### Установка Electron

```bash
cd cyberhub-client
npm install --save-dev electron electron-builder
```

#### Создайте файл `electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: true,
    backgroundColor: '#17171c',
    icon: path.join(__dirname, 'icon.ico'),
  });

  // В разработке
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    // В продакшене
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Открыть DevTools (только для разработки)
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

#### Обновите `package.json`:

```json
{
  "name": "cyberhub-client",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "electron .",
    "electron:build": "vite build && electron-builder"
  },
  "build": {
    "appId": "com.cyberhub.client",
    "productName": "CyberHub",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "electron/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

#### Сборка .exe:

```bash
# 1. Соберите React приложение
npm run build

# 2. Соберите Electron приложение
npm run electron:build
```

Готовый `.exe` файл будет в папке `release/`

---

### Альтернатива: Tauri (легче и быстрее)

**Tauri** - более современный и легкий вариант (использует системный браузер вместо Chromium).

```bash
cd cyberhub-client
npm install --save-dev @tauri-apps/cli
npx tauri init
npx tauri build
```

---

## 🌐 Деплой админ-панели (Web)

### Вариант 1: Vercel (рекомендуется)

```bash
cd cyberhub-admin
npm install -g vercel
vercel
```

### Вариант 2: Netlify

```bash
cd cyberhub-admin
npm run build
# Загрузите папку dist/ на Netlify
```

### Вариант 3: Собственный сервер

```bash
cd cyberhub-admin
npm run build

# Скопируйте dist/ на сервер
scp -r dist/* user@your-server:/var/www/admin.cyberhub.com/
```

**Nginx конфигурация:**

```nginx
server {
    listen 80;
    server_name admin.cyberhub.com;
    root /var/www/admin.cyberhub.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔗 Интеграция SmartShell API

### Настройка для клиента

**Создайте `/src/config/api.ts`:**

```typescript
export const API_CONFIG = {
  SMARTSHELL_API: 'https://api.smartshell.com/v1',
  ENDPOINTS: {
    GET_USER: '/users/current',
    GET_BALANCE: '/users/balance',
    OPEN_CASE: '/cases/open',
    GET_INVENTORY: '/users/inventory',
    CLAIM_PRIZE: '/prizes/claim',
  }
};
```

### Настройка для админ-панели

**Создайте `.env`:**

```env
VITE_API_URL=https://api.cyberhub.com
VITE_SMARTSHELL_API=https://api.smartshell.com/v1
VITE_SMARTSHELL_API_KEY=your_api_key_here
```

---

## 📚 Передача проекта разработчику

### Что передать:

1. **Исходный код** (весь проект)
2. **Документация:**
   - `/ADMIN_README.md` - описание админ-панели
   - `/SWITCH_TO_ADMIN.md` - как переключаться
   - `/DEPLOYMENT_GUIDE.md` - этот файл
3. **Структура проекта** (описана выше)
4. **Дизайн-система:**
   - Цвета (`/src/styles/theme.css`)
   - Компоненты UI (`/src/app/components/ui/`)
5. **Зависимости:**
   - `package.json`
   - `package-lock.json`

### Как упаковать для передачи:

#### Способ 1: ZIP архив

```bash
# Исключите node_modules и временные файлы
zip -r cyberhub-project.zip . -x "node_modules/*" "dist/*" ".git/*"
```

#### Способ 2: Git репозиторий

```bash
# Создайте Git репозиторий
git init
git add .
git commit -m "Initial commit: CyberHub Client + Admin"

# Загрузите на GitHub/GitLab
git remote add origin https://github.com/yourusername/cyberhub.git
git push -u origin main
```

**Создайте `.gitignore`:**

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
release/
```

#### Способ 3: Отправить ChatGPT

**Для ChatGPT/Claude создайте один файл с описанием:**

```markdown
# CyberHub Project Structure

## Клиентское приложение
[Вставьте ключевые файлы: ClientApp.tsx, компоненты]

## Админ-панель
[Вставьте ключевые файлы: AdminApp.tsx, страницы админки]

## Стили и конфигурация
[Вставьте theme.css, vite.config.ts]

## Задачи для backend:
1. Интеграция SmartShell API
2. Создание REST API для админ-панели
3. База данных для кейсов, предметов, пользователей
4. Система аутентификации
```

---

## 📋 Чек-лист перед передачей

- [ ] Разделены клиент и админка в отдельные проекты
- [ ] Клиент настроен на Electron/Tauri
- [ ] Админка собирается для веб (vite build)
- [ ] Документация обновлена
- [ ] package.json содержит все зависимости
- [ ] .env.example создан с примерами переменных
- [ ] Удалены лишние файлы (node_modules, dist)
- [ ] README.md описывает установку и запуск
- [ ] Git репозиторий создан (опционально)

---

## 🎯 Следующие шаги для бэкенд-разработчика

### 1. Backend API (Node.js/Python/PHP)

**Эндпоинты для клиента:**
- `POST /api/auth/smartshell` - авторизация через SmartShell
- `GET /api/cases` - список доступных кейсов
- `POST /api/cases/:id/open` - открыть кейс
- `GET /api/inventory` - инвентарь пользователя
- `POST /api/prizes/claim` - забрать приз

**Эндпоинты для админки:**
- `POST /api/admin/auth/login` - вход админа
- CRUD `/api/admin/items` - управление предметами
- CRUD `/api/admin/cases` - управление кейсами
- CRUD `/api/admin/requests` - заявки
- GET `/api/admin/logs` - логи

### 2. База данных

**Таблицы:**
- `users` - пользователи
- `items` - предметы
- `cases` - кейсы
- `case_items` - состав кейсов (many-to-many)
- `user_inventory` - инвентарь
- `prize_requests` - заявки на выдачу
- `admin_users` - администраторы
- `audit_logs` - логи действий

### 3. SmartShell интеграция

- Получение данных о пользователе
- Списание баланса при открытии кейса
- Начисление баланса (Balance Bonus)
- Webhook события от SmartShell

---

## 📞 Контакты и поддержка

При возникновении вопросов:
- Проверьте документацию в `/ADMIN_README.md`
- Изучите примеры в коде
- Обратитесь к разработчику фронтенда

---

**Версия**: 1.0.0  
**Дата создания**: Декабрь 2024  
**Автор**: CyberHub Team  

Удачи в разработке! 🚀
