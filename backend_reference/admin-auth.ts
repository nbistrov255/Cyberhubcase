/**
 * 🔐 ADMIN AUTHENTICATION MODULE
 * 
 * Система авторизации для админ-панели CyberHub
 * 
 * ФУНКЦИИ:
 * - Авторизация админов через логин/пароль (bcrypt)
 * - Генерация токенов для админов
 * - Middleware для проверки прав доступа
 * 
 * РОЛИ:
 * - owner: Полный доступ ко всему
 * - admin: Управление items, cases, requests (без управления админами)
 * - moderator: Только просмотр requests и одобрение/отклонение
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

// --- ТИПЫ ---
export type AdminRole = 'owner' | 'admin' | 'moderator';

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  role: AdminRole;
  email: string;
  is_active: number; // 1 = активен, 0 = заблокирован
  created_at: number;
  last_login_at: number | null;
}

export interface AdminSession {
  token: string;
  admin_id: string;
  username: string;
  role: AdminRole;
  created_at: number;
  expires_at: number;
}

// --- КОНСТАНТЫ ---
const TOKEN_EXPIRY_DAYS = 7; // Токен админа живёт 7 дней
const SALT_ROUNDS = 10; // Для bcrypt

// --- HELPER FUNCTIONS ---

/**
 * Генерирует случайный токен для админской сессии
 */
export function generateAdminToken(): string {
  return `admin_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Хеширует пароль для сохранения в БД
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Проверяет пароль (введённый vs хеш из БД)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Создаёт дефолтного root админа если БД пустая
 */
export async function ensureRootAdmin(db: any): Promise<void> {
  const count = await db.get('SELECT COUNT(*) as total FROM admin_users');
  
  if (count.total === 0) {
    console.log('🔐 [AdminAuth] Creating default ROOT admin...');
    
    // Дефолтные credentials для первого запуска
    const rootUsername = 'admin';
    const rootPassword = 'paztehab255';
    const rootEmail = 'admin@cyberhub.com';
    
    const passwordHash = await hashPassword(rootPassword);
    const rootId = crypto.randomUUID();
    
    await db.run(`
      INSERT INTO admin_users (id, username, password_hash, role, email, is_active, created_at)
      VALUES (?, ?, ?, 'owner', ?, 1, ?)
    `, [rootId, rootUsername, passwordHash, rootEmail, Date.now()]);
    
    console.log('✅ [AdminAuth] Root admin created:');
    console.log(`   Username: ${rootUsername}`);
    console.log(`   Password: ${rootPassword}`);
    console.log(`   Role: owner`);
    console.log(`   🔥 CHANGE PASSWORD IMMEDIATELY!`);
  }
}

/**
 * Логин админа - возвращает токен или null
 */
export async function loginAdmin(
  db: any, 
  username: string, 
  password: string
): Promise<{ token: string; admin: AdminUser } | null> {
  
  console.log(`🔐 [AdminAuth] Login attempt for: ${username}`);
  
  // 1. Находим админа по username
  const admin = await db.get(
    'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
    [username]
  );
  
  if (!admin) {
    console.log(`❌ [AdminAuth] Admin not found or inactive: ${username}`);
    return null;
  }
  
  // 2. Проверяем пароль
  const passwordValid = await verifyPassword(password, admin.password_hash);
  
  if (!passwordValid) {
    console.log(`❌ [AdminAuth] Invalid password for: ${username}`);
    return null;
  }
  
  // 3. Генерируем токен
  const token = generateAdminToken();
  const now = Date.now();
  const expiresAt = now + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  // 4. Сохраняем сессию в БД
  await db.run(`
    INSERT INTO admin_sessions (token, admin_id, username, role, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [token, admin.id, admin.username, admin.role, now, expiresAt]);
  
  // 5. Обновляем last_login_at
  await db.run(
    'UPDATE admin_users SET last_login_at = ? WHERE id = ?',
    [now, admin.id]
  );
  
  console.log(`✅ [AdminAuth] Login successful: ${username} (${admin.role})`);
  console.log(`🔑 [AdminAuth] Token: ${token.substring(0, 20)}...`);
  
  return { token, admin };
}

/**
 * Проверяет токен админа - возвращает данные сессии или null
 */
export async function validateAdminToken(
  db: any,
  token: string
): Promise<AdminSession | null> {
  
  const session = await db.get(
    'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ?',
    [token, Date.now()]
  );
  
  if (!session) {
    return null;
  }
  
  return session as AdminSession;
}

/**
 * Выход админа (удаляет сессию)
 */
export async function logoutAdmin(db: any, token: string): Promise<void> {
  await db.run('DELETE FROM admin_sessions WHERE token = ?', [token]);
  console.log(`🚪 [AdminAuth] Admin logged out`);
}

/**
 * Проверяет права доступа админа к определённому действию
 */
export function checkAdminPermission(
  role: AdminRole,
  requiredRole: AdminRole
): boolean {
  const roleHierarchy: Record<AdminRole, number> = {
    'owner': 3,
    'admin': 2,
    'moderator': 1,
  };
  
  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}
