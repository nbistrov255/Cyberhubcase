import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export async function initDB() {
  const db = await open({
    filename: './cyberhub.db',
    driver: sqlite3.Database
  })

  await db.exec('PRAGMA foreign_keys = ON;')

  // Сессии
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_uuid TEXT,
      nickname TEXT,
      created_at INTEGER,
      last_seen_at INTEGER,
      expires_at INTEGER,
      client_access_token TEXT
    );
  `)

  // Настройки пользователя (Трейд ссылка, уровень)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_uuid TEXT PRIMARY KEY,
      trade_link TEXT,
      level INTEGER DEFAULT 1,
      xp REAL DEFAULT 0
    );
  `)

  // Предметы (из админки)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      type TEXT, -- 'skin', 'physical', 'money'
      title TEXT,
      image_url TEXT,
      price_eur REAL,
      sell_price_eur REAL,
      rarity TEXT,
      stock INTEGER DEFAULT -1,
      is_active INTEGER DEFAULT 1
    );
  `)

  // Кейсы
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      title TEXT,
      type TEXT,
      threshold_eur REAL,
      image_url TEXT,
      is_active INTEGER DEFAULT 1
    );
  `)

  // Содержимое кейсов
  await db.exec(`
    CREATE TABLE IF NOT EXISTS case_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT,
      item_id TEXT,
      weight REAL,
      rarity TEXT,
      FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE,
      FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
    );
  `)

  // Ограничения на открытие (Daily/Monthly)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS case_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_uuid TEXT,
      case_id TEXT,
      period_key TEXT,
      claimed_at INTEGER
    );
  `)

  // История прокрутов (для Live ленты)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS spins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_uuid TEXT,
      case_id TEXT,
      period_key TEXT,
      prize_title TEXT,
      prize_amount_eur REAL,
      rarity TEXT,
      image_url TEXT,
      created_at INTEGER
    );
  `)

  // Инвентарь пользователя
  await db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_uuid TEXT,
      item_id TEXT,
      title TEXT,
      type TEXT,
      image_url TEXT,
      amount_eur REAL,
      sell_price_eur REAL,
      rarity TEXT,
      status TEXT DEFAULT 'available', -- 'available', 'processing', 'received', 'sold', 'returned'
      created_at INTEGER,
      updated_at INTEGER
    );
  `)

  // Заявки на вывод (Requests)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY, -- REQ-XXXXXX
      user_uuid TEXT,
      inventory_id INTEGER,
      item_title TEXT,
      type TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
      admin_comment TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY(inventory_id) REFERENCES inventory(id)
    );
  `)

  // Миграции на случай старой БД
  try { await db.exec("ALTER TABLE items ADD COLUMN rarity TEXT;"); } catch (e) {}
  try { await db.exec("ALTER TABLE items ADD COLUMN stock INTEGER DEFAULT -1;"); } catch (e) {}
  try { await db.exec("ALTER TABLE inventory ADD COLUMN status TEXT DEFAULT 'available';"); } catch (e) {}

  // 🔐 Таблица админов
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL, -- 'owner', 'admin', 'moderator'
      email TEXT,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      last_login_at INTEGER
    );
  `)

  // 🔐 Таблица админских сессий
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      admin_id TEXT,
      username TEXT,
      role TEXT,
      created_at INTEGER,
      expires_at INTEGER,
      FOREIGN KEY(admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );
  `)

  // 🔥 Таблица закрытых уведомлений (Dismissed Notifications)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dismissed_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_uuid TEXT NOT NULL,
      request_id TEXT NOT NULL,
      dismissed_at INTEGER NOT NULL,
      UNIQUE(user_uuid, request_id)
    );
  `)
  
  // Индекс для быстрого поиска dismissed notifications
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dismissed_user 
    ON dismissed_notifications(user_uuid);
  `)

  return db
}