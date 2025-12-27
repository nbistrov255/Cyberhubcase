# CyberHub Admin Panel

## 🚀 Quick Start

### Accessing the Admin Panel

The admin panel is now **completely separate** from the main client application. 

**To switch to admin panel:**

1. Open `/src/app/App.tsx`
2. Replace the content with:

```tsx
import AdminAppEntry from './AdminAppEntry';

export default function App() {
  return <AdminAppEntry />;
}
```

3. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`

**To switch back to client app:**

Replace `/src/app/App.tsx` with:

```tsx
import ClientApp from './ClientApp';

export default function App() {
  return <ClientApp />;
}
```

See **[SWITCH_TO_ADMIN.md](./SWITCH_TO_ADMIN.md)** for detailed instructions.

---

## Overview

Professional web-based admin panel for managing the CyberHub case opening platform. Built with React, TypeScript, and Tailwind CSS.

## Features

### 🔐 Authentication & Authorization
- **Login System**: Secure admin authentication
- **Role-Based Access Control**:
  - **Owner**: Full system access
  - **Admin**: Manage items, cases, chances, deliveries
  - **Operator**: Process requests and deliveries (no case/chance editing)
  - **Viewer**: Read-only access to logs and statistics

### 📊 Dashboard
- Real-time statistics overview
- Cases opened (today, this week, this month)
- Pending requests counter
- Problem cases tracking
- Low stock alerts
- Quick action buttons
- Recent activity feed

### 🎁 Items Management
- **Three Item Types**:
  1. **Physical Items**: Stock-tracked physical prizes
  2. **Balance Bonus**: SmartShell balance credits (unlimited stock)
  3. **Virtual Items**: Digital/game items with stock tracking

- **Multi-language Support**: LV / RU / EN for all item names and descriptions
- **Features**:
  - PNG image upload/URL
  - Rarity system (Common, Rare, Epic, Legendary, Mythic)
  - Stock management with low-stock alerts
  - Active/Hidden status
  - Preview mode
  - Copy text between languages
  - Bulk actions

### 📦 Cases Management
- **Case Types**:
  - **Daily**: Unlimited access, 24-hour reset
  - **Monthly**: Max 5 cards, date-based period

- **Features**:
  - Multi-language names (LV/RU/EN)
  - PNG case images
  - Deposit threshold configuration
  - Item composition management
  - Chance distribution system:
    - **Weights Mode**: Auto-normalization
    - **Percent Mode**: Real-time recalculation
  - Auto-calculate based on rarity presets
  - Draft/Publish workflow
  - Version history tracking
  - Stock protection (auto-disable when out of stock)

### 📝 Requests Management
- **Request Statuses**:
  - Pending
  - Approved
  - Denied
  - Returned
  - Expired

- **Features**:
  - Search by phone/nickname/UUID
  - Status filtering
  - Approve/Deny with comments
  - Return to stock functionality
  - Request details modal
  - Duplicate prevention
  - Action logging

### ⚠️ Problem Queue
- **Problem Types**:
  - Delivery errors
  - Expired prizes
  - Failed payments

- **Actions**:
  - Retry delivery
  - Return to stock
  - Mark as resolved
  - Add comments
  - Track resolution history

### 👥 Users Management
- User search (phone/nickname/UUID)
- User profile viewing
- Opening history
- Inventory inspection
- Manual delivery actions:
  - Mark as delivered
  - Retry delivery
  - Return to stock

### 📋 Logs & Audit
- Comprehensive activity logging
- Filters:
  - Time period
  - Case
  - Item
  - User
  - PC/Location
  - Status
- Export functionality
- Full audit trail

### ⚙️ Settings
- Language selection (EN/RU/LV)
- Rarity color configuration
- Auto-calculate presets
- Low stock threshold
- Prize expiration TTL
- System parameters

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS 4.0** for styling
- **Motion (Framer Motion)** for animations
- **Lucide React** for icons
- **Context API** for state management
- **localStorage** for persistence

## Structure

```
/src/app/admin/
├── AdminApp.tsx                 # Main admin app entry
├── components/
│   ├── AdminLayout.tsx         # Sidebar + Topbar layout
│   └── ItemFormModal.tsx       # Item creation/editing modal
├── contexts/
│   └── AdminLanguageContext.tsx # Multi-language support
└── pages/
    ├── LoginPage.tsx           # Authentication
    ├── DashboardPage.tsx       # Statistics overview
    ├── ItemsPage.tsx           # Items management
    ├── CasesPage.tsx           # Cases management
    ├── RequestsPage.tsx        # Claim requests
    ├── ProblemQueuePage.tsx    # Problem resolution
    ├── UsersPage.tsx           # User management
    ├── LogsPage.tsx            # Audit logs
    └── SettingsPage.tsx        # System configuration
```

## Language Support

All admin interface elements support three languages:
- 🇬🇧 **English** (EN)
- 🇷🇺 **Russian** (RU)
- 🇱🇻 **Latvian** (LV)

Language switcher available in top bar.

## Design System

### Colors
- **Background**: `#17171c`
- **Cards**: `#1d1d22`
- **Secondary**: `#25252a`
- **Accent**: `#7c2d3a`
- **Accent Hover**: `#9a3b4a`

### Rarity Colors
- **Common**: `#9ca3af` (Gray)
- **Rare**: `#3b82f6` (Blue)
- **Epic**: `#8b5cf6` (Purple)
- **Legendary**: `#f59e0b` (Gold)
- **Mythic**: `#ef4444` (Red)

### Typography
- **Headers**: Aldrich font
- **Body**: System fonts
- **Monospace**: For IDs, UUIDs

## Security Features

1. **Role-Based Access**: UI elements hide/disable based on user role
2. **Confirmation Dialogs**: All dangerous actions require confirmation
3. **Action Logging**: Complete audit trail
4. **Stock Protection**: Automatic blocking when stock = 0
5. **Duplicate Prevention**: Return to stock can only be done once

## Best Practices

### Items
- Always fill all language fields
- Use PNG images for consistency
- Set appropriate stock levels
- Configure low stock thresholds

### Cases
- Test chance distribution (must equal 100%)
- Use Draft status for testing
- Verify stock availability before publishing
- Document changes in version history

### Requests
- Process pending requests promptly
- Add comments when denying
- Double-check before returning to stock
- Monitor expiration times

### Problem Queue
- Prioritize delivery errors
- Investigate root causes
- Document resolutions
- Update system settings if needed

## Demo Access

**Credentials**: 
- Username: `admin`
- Password: `password`

**Note**: This is a demo. In production, implement proper authentication backend.

## Future Enhancements

- [ ] Case editor with visual chance distribution
- [ ] Bulk operations for items
- [ ] Analytics and reports
- [ ] Email notifications
- [ ] API integration
- [ ] Real-time updates via WebSocket
- [ ] Advanced filtering and sorting
- [ ] Data export (CSV, Excel)
- [ ] Dark/Light theme toggle
- [ ] Mobile responsive improvements

## Development

The admin panel is completely separate from the client application and can be:
- Hosted on a subdomain (e.g., `admin.cyberhub.com`)
- Accessed via path (e.g., `/admin`)
- Deployed as separate application

Currently integrated in demo mode with client app via `/src/app/Main.tsx` selector.

## Support

For questions or issues, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Built with**: ❤️ by CyberHub Team