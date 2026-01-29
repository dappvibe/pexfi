import Database from 'better-sqlite3';

const dbPath = '/data/gemini.db';

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize schema (fresh DB assumption allows us to just create what we need)
db.exec(`
  CREATE TABLE IF NOT EXISTS interactions (
    id TEXT PRIMARY KEY,
    chat_id TEXT,
    prompt TEXT,
    system_instructions TEXT DEFAULT '',
    response JSON,
    previous_interaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_chats ON interactions(chat_id);
`);

console.log(`Connected to SQLite at ${dbPath}`);
