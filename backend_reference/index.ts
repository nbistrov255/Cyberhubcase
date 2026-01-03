import express from "express";
import http from "http"; // 🔥 WebSocket: добавлен для http.createServer
import { Server as SocketIOServer } from "socket.io"; // 🔥 WebSocket: Socket.IO
import cors from "cors";
import crypto from "crypto";
import { initDB } from "./database";
import { 
  loginAdmin, 
  validateAdminToken, 
  logoutAdmin, 
  ensureRootAdmin,
  checkAdminPermission,
  AdminRole
} from './admin-auth';

// --- КОНФИГУРАЦИЯ ---
const PORT = 3000;
const RIGA_TZ = "Europe/Riga";

if (!process.env.SMARTSHELL_LOGIN) console.error("❌ ERROR: SMARTSHELL_LOGIN is missing");

const app = express();
app.use(cors());

// ЛИМИТЫ (для картинок)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ЛОГГЕР
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

let db: any = null;

// --- HELPERS ---
function rigaDateParts(now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: RIGA_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;
    return { y, m, d };
  } catch (e) {
    const d = new Date(now.getTime() + (3 * 3600 * 1000));
    return { y: d.getUTCFullYear().toString(), m: (d.getUTCMonth() + 1).toString().padStart(2, '0'), d: d.getUTCDate().toString().padStart(2, '0') };
  }
}
function getRigaDayKey() { const { y, m, d } = rigaDateParts(); return `${y}-${m}-${d}`; }
function getRigaMonthKey() { const { y, m } = rigaDateParts(); return `${y}-${m}`; }

function normalizeDatePart(createdAt: string): string | null {
  if (!createdAt) return null;
  const s = String(createdAt).trim();
  const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`;
  const m2 = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
  return null;
}

// --- SMARTSHELL ---
async function gqlRequest<T>(query: string, variables: any = {}, token?: string): Promise<T> {
  const url = process.env.SMARTSHELL_API_URL || "https://billing.smartshell.gg/api/graphql";
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // ⚡ 90 секунд для тяжёлых запросов (баланс, платежи)

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ query, variables }), signal: controller.signal });
    clearTimeout(timeoutId);

    const text = await res.text();
    if (!res.ok) {
        throw new Error(`SmartShell HTTP Error: ${res.status}`);
    }
    
    try {
        const json = JSON.parse(text);
        if (json.errors) throw new Error(json.errors[0]?.message);
        return json.data;
    } catch (e) {
        throw new Error("Invalid JSON from SmartShell");
    }
  } catch (e: any) {
    console.error("Fetch Error:", e.message);
    throw e;
  }
}

let _serviceToken: string | null = null;
let _serviceTokenExp = 0;
async function getServiceToken(): Promise<string> {
  if (_serviceToken && Date.now() < _serviceTokenExp) return _serviceToken;
  try {
    const data = await gqlRequest<{ login: { access_token: string, expires_in: number } }>(`
      mutation Login($input: LoginInput!) { login(input: $input) { access_token expires_in } }
    `, { input: { login: process.env.SMARTSHELL_LOGIN, password: process.env.SMARTSHELL_PASSWORD, company_id: Number(process.env.SMARTSHELL_CLUB_ID) } });
    _serviceToken = data.login.access_token;
    _serviceTokenExp = Date.now() + (data.login.expires_in - 60) * 1000;
    return _serviceToken;
  } catch (e) { 
      console.error("❌ Admin Login Failed:", e); 
      throw e; 
  }
}

// --- БАЛАНС ---
async function getClientBalance(userUuid: string): Promise<number> {
  try {
    const token = await getServiceToken();
    const data = await gqlRequest<{ clients: { data: { uuid: string, deposit: number }[] } }>(`
      query GetAllClients { clients(page: 1, first: 5000) { data { uuid deposit } } }
    `, {}, token);
    const client = data.clients?.data?.find(c => c.uuid === userUuid);
    return client ? (client.deposit || 0) : 0;
  } catch (e) {
    return 0;
  }
}

// --- СТАТИСТИКА ---
async function calculateProgressSafe(userUuid: string) {
  try {
    const token = await getServiceToken();
    const data = await gqlRequest<any>(`
      query GetPayments($uuid: String!) { getPaymentsByClientId(uuid: $uuid, page: 1, first: 100) { data { created_at title sum amount is_refunded items { type } } } }
    `, { uuid: userUuid }, token);
    
    const items = data.getPaymentsByClientId?.data || [];
    let daily = 0, monthly = 0;
    const todayKey = getRigaDayKey();
    const monthKey = getRigaMonthKey();

    for (const p of items) {
      if (p.is_refunded) continue;
      const val = Number(p.sum) || Number(p.amount) || 0;
      if (val <= 0) continue;
      const title = String(p.title || "").toLowerCase();
      const isDeposit = title.includes("пополнение") || title.includes("deposit") || title.includes("top-up") || (p.items && p.items.some((i: any) => i.type === "DEPOSIT"));
      if (!isDeposit) continue;
      const dateStr = normalizeDatePart(p.created_at);
      if (!dateStr) continue;
      if (dateStr === todayKey) daily += val;
      if (dateStr.startsWith(monthKey)) monthly += val;
    }
    return { daily: Math.round(daily * 100) / 100, monthly: Math.round(monthly * 100) / 100 };
  } catch (e) { return { daily: 0, monthly: 0 }; }
}

async function requireSession(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  if (!db) return res.status(500).json({ error: "DB not ready" });
  const session = await db.get("SELECT * FROM sessions WHERE token = ?", token);
  if (!session) return res.status(401).json({ error: "Invalid session" });
  
  // 🔥 ПРОВЕРКА expires_at
  if (session.expires_at && session.expires_at < Date.now()) {
    console.log(`❌ [Auth] Session expired for user ${session.user_uuid}`);
    await db.run("DELETE FROM sessions WHERE token = ?", token);
    return res.status(401).json({ error: "Session expired" });
  }
  
  // 🔥 ОБНОВЛЕНИЕ last_seen_at для продления сессии
  await db.run("UPDATE sessions SET last_seen_at = ? WHERE token = ?", Date.now(), token);
  
  const settings = await db.get("SELECT * FROM user_settings WHERE user_uuid = ?", session.user_uuid);
  res.locals.session = { ...session, ...settings };
  next();
}

// 🔐 MIDDLEWARE ДЛЯ АДМИНСКОЙ АВТОРИЗАЦИИ
async function requireAdminSession(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('❌ [AdminAuth] No token provided');
    return res.status(401).json({ error: 'No admin token' });
  }
  
  if (!db) {
    return res.status(500).json({ error: 'DB not ready' });
  }
  
  const session = await validateAdminToken(db, token);
  
  if (!session) {
    console.log('❌ [AdminAuth] Invalid or expired token');
    return res.status(401).json({ error: 'Invalid admin session' });
  }
  
  console.log(`✅ [AdminAuth] Valid session for: ${session.username} (${session.role})`);
  
  // Сохраняем данные админа в res.locals
  res.locals.adminSession = session;
  next();
}

// 🔐 MIDDLEWARE ДЛЯ ПРОВЕРКИ ПРАВ ДОСТУПА
function requireAdminRole(requiredRole: AdminRole) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = res.locals.adminSession;
    
    if (!session) {
      return res.status(401).json({ error: 'Admin session required' });
    }
    
    if (!checkAdminPermission(session.role, requiredRole)) {
      console.log(`❌ [AdminAuth] Insufficient permissions: ${session.role} < ${requiredRole}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// 🔥 ФУНКЦИЯ ПОПОЛНЕНИЯ БОНУСОВ через SmartShell setBonus
async function addClientDeposit(userUuid: string, amount: number): Promise<boolean> {
    console.log(`💰 [SmartShell] Adding ${amount}€ BONUS to ${userUuid}`);
    try {
        const token = await getServiceToken();
        console.log(`🔑 Service token obtained`);
        
        // 1. Получаем текущий БОНУСНЫЙ баланс клиента (оптимизировано: только нужные поля)
        console.log(`📡 Step 1/2: Fetching current BONUS balance...`);
        const clientData = await gqlRequest<{ clients: { data: { uuid: string, bonus: number }[] } }>(`
            query GetClients { 
                clients(page: 1, first: 10000) { 
                    data { uuid bonus } 
                } 
            }
        `, {}, token);
        console.log(`✅ Step 1/2: Received ${clientData.clients?.data?.length || 0} clients`);
        
        const client = clientData.clients?.data?.find(c => c.uuid === userUuid);
        if (!client) {
            console.error(`❌ Client not found: ${userUuid}`);
            return false;
        }
        
        const currentBonus = client.bonus || 0;
        const newBonus = currentBonus + amount;
        
        console.log(`📊 Current BONUS: ${currentBonus}€, Adding: ${amount}€, New: ${newBonus}€`);
        
        // 2. Устанавливаем новый БОНУСНЫЙ баланс через setBonus
        console.log(`📡 Step 2/2: Setting new BONUS balance...`);
        await gqlRequest<{ setBonus: { uuid: string; login: string } }>(`
            mutation SetBonus($input: SetBonusInput!) {
                setBonus(input: $input) {
                    uuid
                    login
                }
            }
        `, {
            input: {
                client_uuid: userUuid,
                value: newBonus
            }
        }, token);
        
        console.log(`✅ BONUS updated: ${newBonus}€ (added ${amount}€)`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to add BONUS: ${error.message}`);
        console.error(`Full error:`, error);
        return false;
    }
}

// === ROUTES ===

app.get("/api/stats/public", async (req, res) => {
    try {
        const stats = await db.get("SELECT COUNT(DISTINCT user_uuid) as unique_users, COUNT(*) as total_spins FROM spins");
        res.json({ success: true, stats: stats || { unique_users: 0, total_spins: 0 } });
    } catch (e) { res.json({ success: false, stats: { unique_users: 0, total_spins: 0 } }); }
});

app.get("/api/drops/recent", async (req, res) => {
  try {
    const drops = await db.all(`SELECT s.id, s.prize_title as item_name, s.image_url as image, s.rarity, s.created_at as timestamp, s.user_uuid FROM spins s ORDER BY s.created_at DESC LIMIT 20`);
    for (let drop of drops) {
        const user = await db.get("SELECT nickname FROM sessions WHERE user_uuid = ? ORDER BY created_at DESC LIMIT 1", drop.user_uuid);
        drop.user_name = user ? user.nickname : "Anonymous";
    }
    res.json({ success: true, drops });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/auth/session", async (req, res) => {
  try {
    const { login, password } = req.body;
    const authData = await gqlRequest<{ clientLogin: { access_token: string } }>(`mutation CL($i: ClientLoginInput!) { clientLogin(input: $i) { access_token } }`, { i: { login, password } });
    const clientToken = authData.clientLogin.access_token;
    const meData = await gqlRequest<{ clientMe: { uuid: string, nickname: string } }>(`query { clientMe { uuid nickname } }`, {}, clientToken);
    const { uuid, nickname } = meData.clientMe;
    
    const sessionToken = crypto.randomUUID();
    await db.run("DELETE FROM sessions WHERE user_uuid = ?", uuid);
    await db.run(`INSERT INTO sessions (token, user_uuid, nickname, created_at, last_seen_at, expires_at, client_access_token) VALUES (?, ?, ?, ?, ?, ?, ?)`, sessionToken, uuid, nickname, Date.now(), Date.now(), Date.now() + 86400000, clientToken);
    
    res.json({ success: true, session_token: sessionToken });
  } catch (e: any) { 
    res.status(401).json({ success: false, error: "Invalid credentials" }); 
  }
});

app.get("/api/profile", requireSession, async (req, res) => {
  const { user_uuid, nickname } = res.locals.session;
  const casesDB = await db.all("SELECT * FROM cases");
  
  let progress = { daily: 0, monthly: 0 };
  let balance = 0;
  try {
      [progress, balance] = await Promise.all([calculateProgressSafe(user_uuid), getClientBalance(user_uuid)]);
  } catch (e) {}

  const todayKey = getRigaDayKey();
  const monthKey = getRigaMonthKey();
  const claims = await db.all(`SELECT case_id FROM case_claims WHERE user_uuid = ? AND (period_key = ? OR period_key = ?)`, user_uuid, todayKey, monthKey);
  const claimedIds = new Set(claims.map((c: any) => c.case_id));
  
  const cases = casesDB.map((cfg: any) => {
    const type = (cfg.type || "").toLowerCase();
    const current = type.includes("daily") ? progress.daily : progress.monthly;
    return { 
        ...cfg, 
        threshold: cfg.threshold_eur,
        image: cfg.image_url,
        progress: current, 
        available: current >= cfg.threshold_eur && !claimedIds.has(cfg.id), 
        is_claimed: claimedIds.has(cfg.id) 
    };
  });
  
  res.json({ success: true, profile: { uuid: user_uuid, nickname, balance, dailySum: progress.daily, monthlySum: progress.monthly, tradeLink: res.locals.session.trade_link, cases } });
});

// ============================================================================
// 🔐 ADMIN AUTHENTICATION ENDPOINTS
// ============================================================================

// POST /api/admin/login - Логин админа
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password required' 
      });
    }
    
    const result = await loginAdmin(db, username, password);
    
    if (!result) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    const { token, admin } = result;
    
    res.json({
      success: true,
      session_token: token,
      user_id: admin.id,
      username: admin.username,
      role: admin.role,
      email: admin.email,
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// POST /api/admin/logout - Выход админа
app.post('/api/admin/logout', requireAdminSession, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await logoutAdmin(db, token);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Admin logout error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/admin/me - Получить данные текущего админа
app.get('/api/admin/me', requireAdminSession, async (req, res) => {
  try {
    const session = res.locals.adminSession;
    res.json({
      success: true,
      admin: {
        id: session.admin_id,
        username: session.username,
        role: session.role,
      }
    });
  } catch (error) {
    console.error('❌ Admin me error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================================
//  ADMIN ITEMS ENDPOINTS (Protected)
// ============================================================================

app.get("/api/admin/items", requireAdminSession, async (req, res) => {
    const items = await db.all("SELECT * FROM items ORDER BY title ASC");
    res.json({ success: true, items });
});

app.post("/api/admin/items", async (req, res) => {
    try {
        let { id, type, title, image_url, price_eur, sell_price_eur, rarity, stock } = req.body;
        if (!sell_price_eur) sell_price_eur = price_eur;
        if (!rarity) rarity = 'common';
        if (stock === undefined || stock === '') stock = -1;
        const itemId = id || crypto.randomUUID();
        
        await db.run(`INSERT INTO items (id, type, title, image_url, price_eur, sell_price_eur, rarity, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT(id) DO UPDATE SET type=excluded.type, title=excluded.title, image_url=excluded.image_url, price_eur=excluded.price_eur, sell_price_eur=excluded.sell_price_eur, rarity=excluded.rarity, stock=excluded.stock`, itemId, type, title, image_url, price_eur, sell_price_eur, rarity, stock);
        res.json({ success: true, item_id: itemId });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/admin/items/:id", async (req, res) => {
    try {
        await db.run("DELETE FROM case_items WHERE item_id = ?", req.params.id);
        await db.run("DELETE FROM items WHERE id = ?", req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

const saveCaseHandler = async (req: any, res: any) => {
  try {
    let { id, title, nameEn, type, threshold_eur, threshold, image_url, image, items, contents, status } = req.body;
    if (req.params.id) id = req.params.id;
    if (!title && nameEn) title = nameEn;
    let finalThreshold = 0;
    if (threshold_eur !== undefined && threshold_eur !== null) finalThreshold = Number(threshold_eur);
    else if (threshold !== undefined && threshold !== null) finalThreshold = Number(threshold);
    if (!image_url && image) image_url = image;
    const is_active = (status === 'published') ? 1 : 0;
    const caseId = id || crypto.randomUUID();

    await db.run("BEGIN TRANSACTION");
    await db.run(`INSERT INTO cases (id, title, type, threshold_eur, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, type=excluded.type, threshold_eur=excluded.threshold_eur, image_url=excluded.image_url, is_active=excluded.is_active`, caseId, title, type, finalThreshold, image_url, is_active);
    await db.run("DELETE FROM case_items WHERE case_id = ?", caseId);
    
    const itemsToSave = (items && items.length > 0) ? items : (contents || []);
    if (itemsToSave && Array.isArray(itemsToSave)) {
      for (const item of itemsToSave) {
        const iId = item.item_id || item.itemId;
        const weight = item.weight || item.dropChance || 0;
        const rarity = item.rarity || 'common';
        if (iId) await db.run(`INSERT INTO case_items (case_id, item_id, weight, rarity) VALUES (?, ?, ?, ?)`, caseId, iId, weight, rarity);
      }
    }
    await db.run("COMMIT");
    
    // 🔥 WebSocket: Уведомляем всех клиентов об изменении кейсов
    const io = req.app.get("io");
    if (io) {
        io.emit("cases:updated");
        console.log("🔥 WebSocket: cases:updated emitted (case saved)");
    }
    
    res.json({ success: true, id: caseId });
  } catch (e: any) { await db.run("ROLLBACK"); res.status(500).json({ error: e.message }); }
};

app.post("/api/admin/cases", saveCaseHandler);
app.put("/api/admin/cases/:id", saveCaseHandler);
app.delete("/api/admin/cases/:id", async (req, res) => {
    try {
        await db.run("DELETE FROM cases WHERE id = ?", req.params.id);
        await db.run("DELETE FROM case_items WHERE case_id = ?", req.params.id);
        res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/admin/cases", requireAdminSession, async (req, res) => {
  const cases = await db.all("SELECT * FROM cases");
  const result = [];
  for (const c of cases) {
    const items = await db.all(`SELECT ci.item_id, ci.weight, ci.rarity, i.title, i.image_url FROM case_items ci JOIN items i ON ci.item_id = i.id WHERE ci.case_id = ?`, c.id);
    result.push({ ...c, items, threshold: c.threshold_eur, image: c.image_url, status: c.is_active ? 'published' : 'draft', contents: items.map((i: any) => ({ itemId: i.item_id, dropChance: i.weight, item: { ...i, id: i.item_id, image: i.image_url, nameEn: i.title } })) });
  }
  res.json({ success: true, cases: result });
});

app.get("/api/cases/:id", async (req, res) => {
    const { id } = req.params;
    const caseData = await db.get("SELECT * FROM cases WHERE id = ?", id);
    if (!caseData) return res.status(404).json({ error: "Case not found" });
    const items = await db.all(`SELECT i.*, ci.weight, ci.rarity as drop_rarity FROM case_items ci JOIN items i ON ci.item_id = i.id WHERE ci.case_id = ?`, id);
    const totalWeight = items.reduce((sum: number, i: any) => sum + i.weight, 0);
    const contents = items.map((i: any) => ({ ...i, chance: totalWeight > 0 ? (i.weight / totalWeight) * 100 : 0, rarity: i.drop_rarity || i.rarity }));
    res.json({ success: true, case: caseData, contents });
});

app.post("/api/cases/open", requireSession, async (req, res) => {
    try {
        const { user_uuid } = res.locals.session;
        const { caseId } = req.body;
        const caseMeta = await db.get("SELECT * FROM cases WHERE id = ?", caseId);
        if (!caseMeta) return res.status(404).json({ error: "Case not found" });
        
        const type = (caseMeta.type || "").toLowerCase();
        const periodKey = type.includes("daily") ? getRigaDayKey() : getRigaMonthKey();
        if (await db.get("SELECT id FROM case_claims WHERE user_uuid=? AND case_id=? AND period_key=?", user_uuid, caseId, periodKey)) return res.status(400).json({ error: "Already opened" });

        const progress = await calculateProgressSafe(user_uuid);
        const currentProgress = type.includes("daily") ? progress.daily : progress.monthly;
        if (currentProgress < caseMeta.threshold_eur) return res.status(403).json({ error: "Not enough deposit" });

        const caseItems = await db.all(`SELECT i.*, ci.weight, ci.rarity as drop_rarity FROM case_items ci JOIN items i ON ci.item_id = i.id WHERE ci.case_id = ?`, caseId);
        
        if (caseItems.length === 0) return res.status(500).json({ error: "Case empty" });
        
        let rnd = Math.random() * caseItems.reduce((acc: number, i: any) => acc + i.weight, 0);
        const selected = caseItems.find((i: any) => (rnd -= i.weight) <= 0) || caseItems[0];
        const xpEarned = caseMeta.threshold_eur || 5; 
        
        console.log(`🎰 WINNER SELECTED: ${selected.title} (ID: ${selected.id})`);

        await db.run("BEGIN TRANSACTION");
        await db.run(`INSERT INTO case_claims (user_uuid, case_id, period_key, claimed_at) VALUES (?, ?, ?, ?)`, user_uuid, caseId, periodKey, Date.now());
        await db.run(`INSERT INTO user_settings (user_uuid, xp) VALUES (?, ?) ON CONFLICT(user_uuid) DO UPDATE SET xp = xp + ?`, user_uuid, xpEarned, xpEarned);
        await db.run(`INSERT INTO spins (user_uuid, case_id, period_key, prize_title, prize_amount_eur, rarity, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, user_uuid, caseId, getRigaDayKey(), selected.title, selected.price_eur, selected.drop_rarity || selected.rarity, selected.image_url, Date.now());
        await db.run(`INSERT INTO inventory (user_uuid, item_id, title, type, image_url, amount_eur, sell_price_eur, rarity, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`, user_uuid, selected.id, selected.title, selected.type, selected.image_url, selected.price_eur, selected.sell_price_eur, selected.drop_rarity || selected.rarity, Date.now(), Date.now());
        await db.run("COMMIT");

        // 🔥 WebSocket: Уведомляем пользователя об обновлении инвентаря
        const io = req.app.get("io");
        if (io) {
            io.to(`user:${user_uuid}`).emit(`inventory:updated:${user_uuid}`);
            console.log(`🔥 WebSocket: inventory updated for user ${user_uuid}`);
        }

        res.json({ 
            success: true, 
            item: { 
                id: selected.id, 
                name: selected.title, 
                title: selected.title,
                type: selected.type, 
                image: selected.image_url, 
                rarity: selected.drop_rarity || selected.rarity 
            },
            xpEarned 
        });
    } catch (e: any) { 
        console.error("OPEN ERROR:", e);
        await db.run("ROLLBACK"); 
        res.status(500).json({ error: e.message }); 
    }
});

app.get("/api/user/history", requireSession, async (req, res) => {
    try {
        const history = await db.all("SELECT * FROM spins WHERE user_uuid = ? ORDER BY created_at DESC LIMIT 50", res.locals.session.user_uuid);
        res.json({ success: true, history });
    } catch (e) {
        res.json({ success: false, history: [] });
    }
});

app.get("/api/inventory", requireSession, async (req, res) => {
    const items = await db.all("SELECT * FROM inventory WHERE user_uuid = ? AND status IN ('available', 'processing') ORDER BY created_at DESC", res.locals.session.user_uuid);
    res.json({ items });
});

app.post("/api/inventory/sell", requireSession, async (req, res) => {
    const { inventory_id } = req.body;
    const item = await db.get("SELECT * FROM inventory WHERE id = ? AND user_uuid = ?", inventory_id, res.locals.session.user_uuid);
    if (!item || item.status !== 'available') return res.status(400).json({ error: "Item not available" });
    if (item.type === 'money') return res.status(400).json({ error: "Money cannot be sold" });

    await addClientDeposit(res.locals.session.user_uuid, item.sell_price_eur);
    await db.run("UPDATE inventory SET status = 'sold', updated_at = ? WHERE id = ?", Date.now(), inventory_id);
    res.json({ success: true, sold_amount: item.sell_price_eur });
});

// 🔥🔥🔥 НОВАЯ ВЕРСИЯ CLAIM (С ПОДРОБНЫМИ ЛОГАМИ) 🔥🔥🔥
app.post("/api/inventory/claim", requireSession, async (req, res) => {
    console.log("📥 CLAIM REQUEST RECEIVED");
    try {
        const { inventory_id } = req.body;
        const { user_uuid, trade_link } = res.locals.session;
        
        console.log(`👤 User: ${user_uuid}, Item: ${inventory_id}`);

        const item = await db.get("SELECT * FROM inventory WHERE id = ? AND user_uuid = ?", inventory_id, user_uuid);
        if (!item) {
            console.error("❌ Item not found or not yours");
            return res.status(400).json({ error: "Item not available" });
        }
        
        if (item.status !== 'available') {
             console.error(`❌ Item status is ${item.status}, expected 'available'`);
             return res.status(400).json({ error: "Item not available" });
        }
        
        // 1. Если это ДЕНЬГИ
        if (item.type === 'money') {
            console.log("💰 Auto-claiming money...");
            const amount = item.amount_eur || item.price_eur || 0;
            
            // ⚡ ЗАЩИТА ОТ ДУБЛИРОВАНИЯ: Сначала помечаем как 'processing'
            await db.run("UPDATE inventory SET status = 'processing', updated_at = ? WHERE id = ?", Date.now(), inventory_id);
            console.log("🔒 Item locked (status = 'processing')");
            
            // Пытаемся пополнить баланс
            const success = await addClientDeposit(user_uuid, amount);
            
            if (!success) {
                // Откатываем статус обратно если не удалось
                await db.run("UPDATE inventory SET status = 'available', updated_at = ? WHERE id = ?", Date.now(), inventory_id);
                console.error("❌ Failed to add balance, item restored");
                return res.status(500).json({ error: "Failed to add balance" });
            }
            
            // Только после успешного пополнения помечаем как 'received'
            await db.run("UPDATE inventory SET status = 'received', updated_at = ? WHERE id = ?", Date.now(), inventory_id);
            console.log("✅ Money added");
            
            // 🔥 WebSocket: Уведомляем пользователя об обновлении баланса
            const io = req.app.get("io");
            if (io) {
                // Получаем новый баланс
                const newBalance = await getClientBalance(user_uuid);
                io.to(`user:${user_uuid}`).emit(`balance:updated:${user_uuid}`, { 
                    balance: newBalance 
                });
                console.log(`🔥 WebSocket: balance updated for user ${user_uuid} (${newBalance}€)`);
            }
            
            // 🔥 WebSocket: Уведомляем об обновлении инвентаря
            if (io) {
                io.to(`user:${user_uuid}`).emit(`inventory:updated:${user_uuid}`);
                console.log(`🔥 WebSocket: inventory updated for user ${user_uuid}`);
            }
            
            return res.json({ success: true, type: 'money', message: `Added ${amount}€ to balance` });
        }

        // 2. Если это СКИН/ФИЗ
        if ((item.type === 'skin' || !item.type) && !trade_link) {
            console.error("❌ No trade link");
            return res.status(400).json({ error: "TRADE_LINK_MISSING" });
        }

        const requestId = `REQ-${Math.floor(Math.random() * 1000000)}`;
        console.log(`📝 Creating request ${requestId} for item "${item.title}"`);

        await db.run("BEGIN TRANSACTION");
        await db.run("UPDATE inventory SET status = 'processing', updated_at = ? WHERE id = ?", Date.now(), inventory_id);
        
        await db.run(`
            INSERT INTO requests (id, user_uuid, inventory_id, item_title, type, status, created_at) 
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
        `, requestId, user_uuid, inventory_id, item.title, item.type || 'skin', Date.now());
        
        await db.run("COMMIT");
        
        console.log("✅ Request created successfully");
        res.json({ success: true, type: 'item', requestId });

    } catch (e: any) { 
        console.error("🔥 CLAIM ERROR:", e);
        await db.run("ROLLBACK"); 
        res.status(500).json({ error: e.message }); 
    }
});
// 🔥🔥🔥 КОНЕЦ НОВОЙ ФУНКЦИИ 🔥🔥🔥

app.post("/api/user/tradelink", requireSession, async (req, res) => {
    await db.run(`INSERT INTO user_settings (user_uuid, trade_link) VALUES (?, ?) ON CONFLICT(user_uuid) DO UPDATE SET trade_link = excluded.trade_link`, res.locals.session.user_uuid, req.body.trade_link);
    res.json({ success: true });
});

// 🔥 НОВОЕ: GET /api/user/requests - Получить активные заявки (исключая dismissed)
app.get("/api/user/requests", requireSession, async (req, res) => {
    try {
        const user_uuid = res.locals.session.user_uuid;
        
        // 🔥 НОВОЕ: Получаем только НЕзакрытые заявки
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

// 🔥 НОВОЕ: POST /api/user/requests/:requestId/dismiss - Закрыть уведомление (больше не показывать)
app.post("/api/user/requests/:requestId/dismiss", requireSession, async (req, res) => {
    try {
        const user_uuid = res.locals.session.user_uuid;
        const requestId = req.params.requestId;
        
        // Проверяем что request принадлежит пользователю
        const request = await db.get(`
            SELECT id FROM requests 
            WHERE id = ? AND user_uuid = ?
        `, requestId, user_uuid);
        
        if (!request) {
            return res.status(404).json({ success: false, error: "Request not found" });
        }
        
        // Сохраняем dismissal
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

app.get("/api/admin/requests", requireAdminSession, async (req, res) => {
    const requests = await db.all(`
        SELECT 
            r.*, 
            u.nickname as user_nickname, 
            s.trade_link,
            i.image_url as item_image,
            i.rarity as item_rarity,
            c.title as case_name
        FROM requests r 
        LEFT JOIN sessions u ON r.user_uuid = u.user_uuid 
        LEFT JOIN user_settings s ON r.user_uuid = s.user_uuid
        LEFT JOIN inventory inv ON r.inventory_id = inv.id
        LEFT JOIN items i ON inv.item_id = i.id
        LEFT JOIN spins sp ON sp.user_uuid = r.user_uuid AND sp.prize_title = r.item_title
        LEFT JOIN cases c ON sp.case_id = c.id
        ORDER BY r.created_at DESC
    `);
    res.json(requests);
});

app.post("/api/admin/requests/:id/approve", requireAdminSession, async (req, res) => {
    try {
        await db.run("BEGIN TRANSACTION");
        await db.run("UPDATE requests SET status = 'approved', updated_at = ? WHERE id = ?", Date.now(), req.params.id);
        const reqData = await db.get("SELECT inventory_id, user_uuid FROM requests WHERE id = ?", req.params.id);
        
        if (!reqData) {
            await db.run("ROLLBACK");
            return res.status(404).json({ error: "Request not found" });
        }
        
        await db.run("UPDATE inventory SET status = 'received', updated_at = ? WHERE id = ?", Date.now(), reqData.inventory_id);
        await db.run("COMMIT");
        
        console.log(`✅ [Admin] Request ${req.params.id} approved`);
        
        // 🔥 WebSocket: Уведомляем пользователя об обновлении инвентаря
        const io = req.app.get("io");
        if (io && reqData.user_uuid) {
            io.to(`user:${reqData.user_uuid}`).emit(`inventory:updated:${reqData.user_uuid}`);
            console.log(`🔥 WebSocket: inventory updated for user ${reqData.user_uuid} (request approved)`);
        }
        
        res.json({ success: true });
    } catch (e: any) {
        await db.run("ROLLBACK");
        console.error("❌ [Admin] Approve error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/admin/requests/:id/deny", requireAdminSession, async (req, res) => {
    try {
        await db.run("BEGIN TRANSACTION");
        await db.run("UPDATE requests SET status = 'denied', admin_comment = ?, updated_at = ? WHERE id = ?", req.body.comment, Date.now(), req.params.id);
        const reqData = await db.get("SELECT inventory_id, user_uuid FROM requests WHERE id = ?", req.params.id);
        await db.run("UPDATE inventory SET status = 'available', updated_at = ? WHERE id = ?", Date.now(), reqData.inventory_id);
        await db.run("COMMIT");
        
        // 🔥 WebSocket: Уведомляем пользователя об обновлении инвентаря
        const io = req.app.get("io");
        if (io && reqData.user_uuid) {
            io.to(`user:${reqData.user_uuid}`).emit(`inventory:updated:${reqData.user_uuid}`);
            console.log(`🔥 WebSocket: inventory updated for user ${reqData.user_uuid} (request denied)`);
        }
        
        res.json({ success: true });
    } catch (e: any) {
        await db.run("ROLLBACK");
        console.error("❌ [Admin] Deny error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/admin/requests/:id/return", requireAdminSession, async (req, res) => {
    try {
        await db.run("BEGIN TRANSACTION");
        await db.run("UPDATE requests SET status = 'returned', updated_at = ? WHERE id = ?", Date.now(), req.params.id);
        const reqData = await db.get("SELECT inventory_id, user_uuid FROM requests WHERE id = ?", req.params.id);
        await db.run("UPDATE inventory SET status = 'available', updated_at = ? WHERE id = ?", Date.now(), reqData.inventory_id);
        await db.run("COMMIT");
        
        // 🔥 WebSocket: Уведомляем пользователя об обновлении инвентаря
        const io = req.app.get("io");
        if (io && reqData.user_uuid) {
            io.to(`user:${reqData.user_uuid}`).emit(`inventory:updated:${reqData.user_uuid}`);
            console.log(`🔥 WebSocket: inventory updated for user ${reqData.user_uuid} (request returned)`);
        }
        
        res.json({ success: true });
    } catch (e: any) {
        await db.run("ROLLBACK");
        console.error("❌ [Admin] Return error:", e);
        res.status(500).json({ error: e.message });
    }
});

initDB().then(async database => { 
    db = database; 
    
    // 🔐 Инициализация root админа (создаётся автоматически если БД пустая)
    await ensureRootAdmin(db);
    
    // 🔥 WebSocket: Создаем HTTP server и Socket.IO
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
        cors: {
            origin: "*", // В production укажите конкретный домен
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ["websocket", "polling"],
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    
    // 🔥 WebSocket: Обработчики подключения
    io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);
        
        // Когда клиент идентифицируется (отправляет userId)
        socket.on("user:identify", (data: { userId: string }) => {
            console.log("👤 User identified:", data.userId, "socket:", socket.id);
            // Присоединяем socket к комнате пользователя
            socket.join(`user:${data.userId}`);
        });
        
        // Обработка отключения
        socket.on("disconnect", (reason) => {
            console.log("🔴 Client disconnected:", socket.id, "reason:", reason);
        });

        // Обработка ошибок
        socket.on("error", (error) => {
            console.error("🔴 Socket error:", error);
        });
    });
    
    // 🔥 WebSocket: Health Check endpoint
    app.get("/health", (req, res) => {
        res.json({
            status: "ok",
            websocket: io.engine.clientsCount > 0 ? "active" : "idle",
            clients: io.engine.clientsCount,
            timestamp: new Date().toISOString()
        });
    });
    
    // 🔥 WebSocket: Делаем io доступным для всех routes
    app.set("io", io);
    
    server.listen(PORT, "0.0.0.0", () => {
        console.log("");
        console.log("🚀 ============================================");
        console.log("🚀  CyberHub Backend Server Started!");
        console.log("🚀 ============================================");
        console.log(`📡 HTTP Server: http://localhost:${PORT}`);
        console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
        console.log(`✅ Server ready to accept connections!`);
        console.log("🚀 ============================================");
        console.log("");
    });
});