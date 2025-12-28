# CyberHub - Case Opening Platform

## 🎮 Project Overview

CyberHub is a full-featured case opening platform with a Counter-Strike aesthetic, consisting of:

1. **Client Application** - Desktop-style Windows app for users to open cases and manage inventory
2. **Admin Panel** - Web-based dashboard for managing items, cases, users, and system settings

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4.0
- **Animations**: Motion (Framer Motion)
- **Backend API**: http://91.107.120.48:3000
- **Languages**: English, Russian, Latvian

---

## 📚 Documentation

### Quick Start Guides
- **[DOCS_INDEX.md](./DOCS_INDEX.md)** - Complete documentation navigation 📑
- **[HOW_TO_EXPORT.md](./HOW_TO_EXPORT.md)** - How to export and run the project
- **[DOWNLOAD_INSTRUCTIONS.md](./DOWNLOAD_INSTRUCTIONS.md)** - Download and setup instructions
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment guide

### Admin Panel
- **[ADMIN_README.md](./ADMIN_README.md)** - Complete admin panel documentation

### Backend Integration (For Backend Developers)
- **[BACKEND_INTEGRATION_CHECKLIST.md](./BACKEND_INTEGRATION_CHECKLIST.md)** - Quick checklist ⭐ **START HERE**
- **[FRONTEND_CHANGELOG.md](./FRONTEND_CHANGELOG.md)** - Complete technical specs 📖
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Copy-paste ready examples 💻
- **[INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md)** - Testing procedures 🧪

### Credits
- **[ATTRIBUTIONS.md](./ATTRIBUTIONS.md)** - Third-party libraries and assets

---

## 🚀 Quick Start

### Development Mode

```bash
# Install dependencies
npm install

# Run client application (default)
npm run dev

# Run admin panel
npm run dev:admin
```

### Build for Production

```bash
# Build client application
npm run build

# Build admin panel
npm run build:admin
```

---

## 🎯 Key Features

### Client Application
- ✅ Multi-language support (EN/RU/LV)
- ✅ Live drop feed animation
- ✅ Case opening with roulette animation
- ✅ Inventory management with sell functionality
- ✅ User profiles and statistics
- ✅ Event cases with countdown timers
- ✅ Maintenance mode support
- ✅ Full API integration

### Admin Panel
- ✅ Dashboard with real-time statistics
- ✅ Items management (create, edit, delete)
- ✅ Cases management with drag-drop item assignment
- ✅ Event cases with automatic date calculation
- ✅ User management and permissions
- ✅ Claim requests handling
- ✅ Logs and monitoring
- ✅ Multi-language interface
- ✅ Role-based access control (Owner, Admin, Moderator)
- ✅ Maintenance mode toggle

---

## 🔧 API Integration Status

### Implemented Endpoints

#### Authentication
- ✅ `POST /api/auth/login` - User login

#### Admin - Items
- ✅ `GET /api/admin/items` - Fetch all items
- ✅ `POST /api/admin/items` - Create item
- ✅ `PUT /api/admin/items/:id` - Update item
- ✅ `DELETE /api/admin/items/:id` - Delete item

#### Client - Inventory
- ✅ `GET /api/inventory` - Fetch user inventory
- ✅ `POST /api/inventory/sell` - Sell inventory item

#### User Profile
- ✅ `GET /api/profile` - Get user profile
- ✅ `PUT /api/profile` - Update profile

#### Case Opening
- ✅ `POST /api/cases/open` - Open a case

### Pending Backend Implementation
- ⏳ `GET /api/cases` - Fetch all cases
- ⏳ `POST /api/admin/cases` - Create case
- ⏳ `PUT /api/admin/cases/:id` - Update case
- ⏳ `DELETE /api/admin/cases/:id` - Delete case

---

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin panel
│   │   │   ├── components/     # Admin components
│   │   │   ├── contexts/       # Admin contexts
│   │   │   └── pages/          # Admin pages
│   │   ├── components/         # Client components
│   │   ├── contexts/           # Client contexts
│   │   ├── AdminApp.tsx        # Admin app entry
│   │   └── ClientApp.tsx       # Client app entry
│   ├── config/                 # API configuration
│   ├── styles/                 # Global styles
│   └── main.tsx                # App entry point
│
├── FRONTEND_CHANGELOG.md       # API integration docs
├── API_EXAMPLES.md             # Request/response examples
├── INTEGRATION_TESTS.md        # Testing guide
├── ADMIN_README.md             # Admin panel guide
├── DEPLOYMENT_GUIDE.md         # Deployment instructions
└── package.json
```

---

## 🎨 Design System

### Colors
- **Background**: `#17171c` (Dark)
- **Accent**: `#7c2d3a` (Burgundy)
- **Cards**: `#1d1d22`
- **Borders**: `rgba(255, 255, 255, 0.1)`

### Typography
Custom typography setup in `/src/styles/theme.css` - do not override with Tailwind classes unless requested.

### Rarity Colors
- **Common**: `#9ca3af` (Gray)
- **Rare**: `#3b82f6` (Blue)
- **Epic**: `#8b5cf6` (Purple)
- **Legendary**: `#f59e0b` (Gold)
- **Mythic**: `#ef4444` (Red)

---

## 🔐 Environment Variables

Currently using hardcoded API URL. For production, create `.env`:

```env
VITE_API_BASE_URL=http://91.107.120.48:3000
```

---

## 🐛 Known Issues

None currently. See [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md) for testing checklist.

---

## 📝 Development Notes

### Switching Between Client and Admin

Edit `/src/main.tsx`:
```typescript
// For client app
root.render(<App />);

// For admin panel
root.render(<AdminAppEntry />);
```

Or use npm scripts:
```bash
npm run dev        # Client
npm run dev:admin  # Admin
```

### Adding New API Endpoints

1. Check [FRONTEND_CHANGELOG.md](./FRONTEND_CHANGELOG.md) for data structures
2. See [API_EXAMPLES.md](./API_EXAMPLES.md) for request formats
3. Test with [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md)

### Adding Translations

- **Client**: `/src/app/contexts/LanguageContext.tsx`
- **Admin**: `/src/app/admin/contexts/AdminLanguageContext.tsx`

Add keys in all 3 languages: `en`, `ru`, `lv`

---

## 🤝 For Backend Developers

**Start here**: [FRONTEND_CHANGELOG.md](./FRONTEND_CHANGELOG.md)

This document contains:
- Complete list of API endpoints frontend expects
- Request/response JSON structures
- Required fields and validations
- Database schema implications

Then check:
- [API_EXAMPLES.md](./API_EXAMPLES.md) - Copy-paste ready examples
- [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md) - How to test integration

---

## 📦 Building for Production

### Client Application (Desktop)
```bash
npm run build
# Output: /dist folder
# Deploy as desktop app or web app
```

### Admin Panel (Web)
```bash
npm run build:admin
# Output: /dist-admin folder
# Deploy to web hosting with custom domain
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📄 License

Proprietary - CyberHub Platform

---

## 📞 Support

For technical questions:
- Review documentation in this repository
- Check API integration guides
- See testing checklists

**Last Updated**: December 28, 2024