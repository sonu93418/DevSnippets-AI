// ============================================================
// SQLite Database — expo-sqlite v15 (SDK 55) Synchronous API
// Uses openDatabaseSync / execSync / runSync / getAllSync
// ============================================================
import * as SQLite from 'expo-sqlite';

export type Database = SQLite.SQLiteDatabase;

let _db: Database | null = null;
let _initialized = false;

function ensureSchema(db: Database): void {
  if (_initialized) {
    return;
  }

  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS snippets (
      id          TEXT PRIMARY KEY NOT NULL,
      title       TEXT NOT NULL,
      code        TEXT NOT NULL,
      language    TEXT NOT NULL DEFAULT 'plaintext',
      tags        TEXT NOT NULL DEFAULT '[]',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      file_path   TEXT,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_snippets_language   ON snippets(language);
    CREATE INDEX IF NOT EXISTS idx_snippets_favorite   ON snippets(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at);
  `);

  _initialized = true;
}

export function getDatabase(): Database {
  if (!_db) {
    _db = SQLite.openDatabaseSync('devsnippets.db');
  }
  return _db;
}

export function initializeDatabase(): void {
  ensureSchema(getDatabase());
}

// ─── Query Helpers ───────────────────────────────────────────

export function queryAll<T = Record<string, unknown>>(
  sql: string,
  params: SQLite.SQLiteBindParams = []
): T[] {
  initializeDatabase();
  const db = getDatabase();
  return db.getAllSync<T>(sql, params);
}

export function queryFirst<T = Record<string, unknown>>(
  sql: string,
  params: SQLite.SQLiteBindParams = []
): T | null {
  initializeDatabase();
  const db = getDatabase();
  return db.getFirstSync<T>(sql, params) ?? null;
}

export function runQuery(
  sql: string,
  params: SQLite.SQLiteBindParams = []
): SQLite.SQLiteRunResult {
  initializeDatabase();
  const db = getDatabase();
  return db.runSync(sql, params);
}
