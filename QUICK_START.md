# Quick Start Guide

## 🚀 Running the Project Locally

### Prerequisites
- Node.js 18+ installed
- npm or pnpm
- Backend API running on `http://91.107.120.48:3000`

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
# For Client Application
npm run dev

# For Admin Panel
npm run dev:admin
```

### Step 3: Open Browser
- **Client**: http://localhost:5173
- **Admin**: http://localhost:5173 (when running dev:admin)

---

## 🔧 Vite Configuration

The project uses Vite with proxy configuration for API requests:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://91.107.120.48:3000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This means:
- Frontend makes requests to `/api/...`
- Vite proxies them to `http://91.107.120.48:3000/api/...`
- No CORS issues during development

---

## 🎨 Styles Configuration

### Tailwind CSS v4
The project uses Tailwind CSS v4 with @tailwindcss/vite plugin.

**Import order in `/src/styles/index.css`:**
```css
@import './tailwind.css';  /* Tailwind base styles */
@import './fonts.css';     /* Custom fonts */
@import './theme.css';     /* Theme variables */
```

**In `/src/main.tsx`:**
```tsx
import './styles/index.css';  // MUST be first import
```

---

## 📝 Environment Variables

Create `.env` file (optional):
```env
VITE_API_BASE_URL=http://91.107.120.48:3000
```

If not set, defaults to hardcoded URL.

---

## 🐛 Troubleshooting

### Problem: White background, no styles
**Solution**: See [TROUBLESHOOTING_STYLES.md](./TROUBLESHOOTING_STYLES.md)

Quick fix:
```bash
rm -rf node_modules/.vite
npm run dev
# Hard refresh browser (Ctrl+Shift+R)
```

### Problem: API requests failing
**Check:**
1. Backend is running on `http://91.107.120.48:3000`
2. Vite proxy is configured correctly
3. Browser console for CORS errors

### Problem: Login not working
**Check:**
1. `/api/auth/login` endpoint exists on backend
2. Token being saved to `localStorage.session_token`
3. Network tab in DevTools for response

---

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/     # Client components
│   │   ├── admin/          # Admin panel
│   │   └── contexts/       # React contexts
│   ├── styles/
│   │   ├── index.css       # Main CSS entry
│   │   ├── tailwind.css    # Tailwind imports
│   │   ├── theme.css       # CSS variables
│   │   └── fonts.css       # Font imports
│   └── main.tsx            # App entry point
├── vite.config.ts          # Vite configuration
└── package.json
```

---

## 🔄 Switching Between Client and Admin

### Method 1: Use npm scripts
```bash
npm run dev        # Client app
npm run dev:admin  # Admin panel
```

### Method 2: Edit main.tsx
```typescript
// Client
root.render(<App />);

// Admin
root.render(<AdminAppEntry />);
```

---

## 🚢 Building for Production

```bash
# Build client
npm run build
# Output: /dist

# Build admin
npm run build:admin
# Output: /dist-admin
```

---

## 📊 API Integration

All API calls now use relative URLs through Vite proxy:

**Before:**
```typescript
fetch('http://91.107.120.48:3000/api/admin/items')
```

**After:**
```typescript
fetch('/api/admin/items')  // Proxied automatically
```

---

## ✅ Expected Behavior

### After `npm run dev`:
1. ✅ Terminal shows: `Local: http://localhost:5173`
2. ✅ Browser opens automatically
3. ✅ Dark theme (#17171c) loads
4. ✅ CyberHub logo visible
5. ✅ Burgundy accent color (#7c2d3a)

### When API is working:
1. ✅ Cases load and display
2. ✅ Login modal works
3. ✅ Inventory page loads items
4. ✅ Sell button functional

---

## 📝 Notes

- **Port**: Default is 5173, can be changed in vite.config.ts
- **Hot Reload**: Enabled by default, changes reflect instantly
- **TypeScript**: Strict mode enabled, check for type errors
- **Linting**: No ESLint configured (optional)

---

**Last Updated**: December 28, 2024
**Node Version Required**: 18.x or higher
**Vite Version**: 6.3.5
**Tailwind Version**: 4.1.12
