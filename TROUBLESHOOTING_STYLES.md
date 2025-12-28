# Troubleshooting - Styles Not Loading

## Problem: Tailwind CSS styles not applied

If you see white background and unstyled elements, follow these steps:

### 1. Stop the dev server
Press `Ctrl+C` in terminal

### 2. Clear cache and rebuild
```bash
rm -rf node_modules/.vite
rm -rf dist
```

### 3. Restart dev server
```bash
npm run dev
```

### 4. Hard refresh browser
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 5. Check browser console
Open DevTools (F12) and look for:
- ✅ No CSS errors
- ✅ Styles loading from `/src/styles/index.css`
- ✅ Tailwind classes working

---

## Files Changed

### `/src/styles/tailwind.css`
Changed from:
```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';
```

To:
```css
@import 'tailwindcss';
@import 'tw-animate-css';
```

### `/src/styles/index.css`
Reorganized import order:
```css
@import './tailwind.css';  /* First */
@import './fonts.css';
@import './theme.css';
```

### `/src/main.tsx`
Styles now import FIRST:
```tsx
import './styles/index.css';  // Must be first
import { StrictMode } from 'react';
// ... rest of imports
```

### `/vite.config.ts`
Added proxy for API:
```ts
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

---

## Expected Result

After fixes, you should see:
- ✅ Dark background (`#17171c`)
- ✅ Burgundy accent color (`#7c2d3a`)
- ✅ Proper grid layout for cases
- ✅ Styled buttons and cards
- ✅ Smooth animations

---

## Still Not Working?

1. Check Node version: `node --version` (should be 18+)
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run build`
4. Try different browser (Chrome/Firefox)

---

Last Updated: December 28, 2024
