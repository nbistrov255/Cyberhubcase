#!/bin/bash

# 🚀 QUICK FIX: Dismiss Notifications System
# Этот скрипт НЕ запускает автоматически - это ТОЛЬКО справка!

echo "════════════════════════════════════════════════════"
echo "🔥 FIX: Persistent Notifications Bug"
echo "════════════════════════════════════════════════════"
echo ""
echo "📋 ШАГ 1: BACKUP БД"
echo "cd /root/cyberhub-backend"
echo "cp cyberhub.db cyberhub.db.backup_\$(date +%Y%m%d_%H%M%S)"
echo ""
echo "════════════════════════════════════════════════════"
echo "📋 ШАГ 2: ОБНОВИТЬ database.ts"
echo ""
echo "Добавить ПОСЛЕ таблицы admin_sessions (строка ~165):"
echo ""
cat << 'EOF'
  // 🔥 Таблица закрытых уведомлений
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dismissed_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_uuid TEXT NOT NULL,
      request_id TEXT NOT NULL,
      dismissed_at INTEGER NOT NULL,
      UNIQUE(user_uuid, request_id)
    );
  `)
  
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dismissed_user 
    ON dismissed_notifications(user_uuid);
  `)
EOF
echo ""
echo "════════════════════════════════════════════════════"
echo "📋 ШАГ 3: ОБНОВИТЬ index.ts"
echo ""
echo "3.1. Добавить endpoint ПОСЛЕ строки 731:"
echo ""
cat << 'EOF'
app.post("/api/user/requests/:requestId/dismiss", requireSession, async (req, res) => {
    try {
        const user_uuid = res.locals.session.user_uuid;
        const requestId = req.params.requestId;
        
        const request = await db.get(`
            SELECT id FROM requests 
            WHERE id = ? AND user_uuid = ?
        `, requestId, user_uuid);
        
        if (!request) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }
        
        await db.run(`
            INSERT INTO dismissed_notifications (user_uuid, request_id, dismissed_at)
            VALUES (?, ?, ?)
            ON CONFLICT(user_uuid, request_id) DO UPDATE SET dismissed_at = excluded.dismissed_at
        `, user_uuid, requestId, Date.now());
        
        console.log(`🗑️ [Dismiss] User ${user_uuid} dismissed request ${requestId}`);
        res.json({ success: true });
    } catch (e: any) {
        console.error("❌ [Dismiss] Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});
EOF
echo ""
echo "3.2. ЗАМЕНИТЬ GET /api/user/requests (строки 704-731):"
echo ""
cat << 'EOF'
app.get("/api/user/requests", requireSession, async (req, res) => {
    try {
        const user_uuid = res.locals.session.user_uuid;
        
        const requests = await db.all(`
            SELECT 
                r.id as requestId,
                r.inventory_id as id,
                r.item_title as itemName,
                r.status,
                r.created_at,
                r.updated_at,
                r.admin_comment,
                r.type as itemType,
                inv.rarity as itemRarity,
                inv.image_url as itemImage,
                sp.case_id,
                c.title as caseName
            FROM requests r
            LEFT JOIN inventory inv ON r.inventory_id = inv.id
            LEFT JOIN spins sp ON sp.user_uuid = r.user_uuid AND sp.prize_title = r.item_title
            LEFT JOIN cases c ON sp.case_id = c.id
            LEFT JOIN dismissed_notifications dn ON dn.request_id = r.id AND dn.user_uuid = r.user_uuid
            WHERE r.user_uuid = ? 
                AND r.status IN ('pending', 'approved', 'denied')
                AND dn.id IS NULL
            ORDER BY r.created_at DESC
        `, user_uuid);
        
        console.log(`📋 [User Requests] Found ${requests.length} active requests for user ${user_uuid}`);
        res.json({ success: true, requests });
    } catch (e: any) {
        console.error("❌ [User Requests] Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});
EOF
echo ""
echo "════════════════════════════════════════════════════"
echo "📋 ШАГ 4: RESTART BACKEND"
echo "cd /root/cyberhub-backend"
echo "pm2 stop cyberhub-backend"
echo "pm2 start cyberhub-backend"
echo "pm2 logs cyberhub-backend --lines 50"
echo ""
echo "════════════════════════════════════════════════════"
echo "📋 ШАГ 5: ПРОВЕРКА"
echo "sqlite3 cyberhub.db '.tables' | grep dismissed"
echo ""
echo "Должно вернуть: dismissed_notifications"
echo ""
echo "════════════════════════════════════════════════════"
echo "✅ ГОТОВО!"
echo ""
echo "📖 Подробная документация: /DEPLOY_DISMISS_NOTIFICATIONS.md"
echo "════════════════════════════════════════════════════"
