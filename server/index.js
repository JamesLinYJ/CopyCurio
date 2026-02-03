import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const PORT = process.env.PORT || 8787;
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'server', 'data.sqlite');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const db = new Database(DB_PATH);
// Improve concurrency for simple write-heavy workloads
try {
  db.pragma('journal_mode = WAL');
} catch (e) {
  // Ignore if pragma fails
}

const DEFAULT_STATS = {
  itemsSaved: 0,
  daysActive: 1,
  lastLogin: Date.now(),
  joinDate: Date.now(),
  xp: 0
};

const DEFAULT_SETTINGS = {
  theme: 'system',
  notifications: {
    dailyFact: true,
    explorationGoal: true,
    systemUpdates: false
  },
  privacy: {
    clearOnExit: false
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false
  }
};

const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      json TEXT,
      updated_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS stats (
      user_id TEXT PRIMARY KEY,
      json TEXT,
      updated_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      preview TEXT,
      updated_at INTEGER,
      messages_json TEXT
    );
    CREATE INDEX IF NOT EXISTS sessions_user_updated ON sessions(user_id, updated_at DESC);
    CREATE TABLE IF NOT EXISTS library (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT,
      title TEXT,
      content TEXT,
      category TEXT,
      thumbnail TEXT,
      funFact TEXT,
      date INTEGER
    );
    CREATE INDEX IF NOT EXISTS library_user_date ON library(user_id, date DESC);
  `);
};

initDb();

const ensureUser = (userId) => {
  const row = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!row) {
    db.prepare('INSERT INTO users (id, created_at) VALUES (?, ?)').run(userId, Date.now());
  }
};

const requireDeviceId = (req, res, next) => {
  const deviceId = req.header('x-device-id');
  if (!deviceId) {
    res.status(400).send('Missing x-device-id header');
    return;
  }
  req.deviceId = deviceId;
  ensureUser(deviceId);
  next();
};

const safeJsonParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

const toKb = (value) => (value / 1024).toFixed(1);

const updateItemsSaved = (userId) => {
  const row = db.prepare('SELECT json FROM stats WHERE user_id = ?').get(userId);
  const stats = row ? safeJsonParse(row.json, DEFAULT_STATS) : { ...DEFAULT_STATS };
  const countRow = db.prepare('SELECT COUNT(*) as count FROM library WHERE user_id = ?').get(userId);
  stats.itemsSaved = countRow?.count || 0;
  db.prepare('INSERT INTO stats (user_id, json, updated_at) VALUES (?, ?, ?)\n    ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at')\n    .run(userId, JSON.stringify(stats), Date.now());
  return stats;
};

// --- Settings ---
app.get('/api/settings', requireDeviceId, (req, res) => {
  const row = db.prepare('SELECT json FROM settings WHERE user_id = ?').get(req.deviceId);
  if (!row) {
    db.prepare('INSERT INTO settings (user_id, json, updated_at) VALUES (?, ?, ?)')
      .run(req.deviceId, JSON.stringify(DEFAULT_SETTINGS), Date.now());
    res.json({ settings: DEFAULT_SETTINGS });
    return;
  }
  res.json({ settings: safeJsonParse(row.json, DEFAULT_SETTINGS) });
});

app.put('/api/settings', requireDeviceId, (req, res) => {
  const settings = req.body?.settings || req.body;
  const merged = { ...DEFAULT_SETTINGS, ...settings, accessibility: { ...DEFAULT_SETTINGS.accessibility, ...(settings?.accessibility || {}) } };
  db.prepare('INSERT INTO settings (user_id, json, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at')
    .run(req.deviceId, JSON.stringify(merged), Date.now());
  res.json({ settings: merged });
});

// --- Stats ---
app.get('/api/stats', requireDeviceId, (req, res) => {
  const row = db.prepare('SELECT json FROM stats WHERE user_id = ?').get(req.deviceId);
  let stats = row ? safeJsonParse(row.json, DEFAULT_STATS) : { ...DEFAULT_STATS };

  const lastDate = new Date(stats.lastLogin).toDateString();
  const today = new Date().toDateString();
  if (lastDate !== today) {
    stats.daysActive += 1;
    stats.lastLogin = Date.now();
  }

  if (!row) {
    stats.joinDate = Date.now();
  }

  db.prepare('INSERT INTO stats (user_id, json, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at')
    .run(req.deviceId, JSON.stringify(stats), Date.now());

  res.json({ stats });
});

app.post('/api/stats/xp', requireDeviceId, (req, res) => {
  const amount = Number(req.body?.amount || 0);
  const row = db.prepare('SELECT json FROM stats WHERE user_id = ?').get(req.deviceId);
  const stats = row ? safeJsonParse(row.json, DEFAULT_STATS) : { ...DEFAULT_STATS };
  stats.xp = (stats.xp || 0) + amount;
  db.prepare('INSERT INTO stats (user_id, json, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at')
    .run(req.deviceId, JSON.stringify(stats), Date.now());
  res.json({ stats });
});

// --- Sessions ---
app.get('/api/sessions', requireDeviceId, (req, res) => {
  const rows = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC').all(req.deviceId);
  const sessions = rows.map((row) => ({
    id: row.id,
    title: row.title,
    preview: row.preview,
    updatedAt: row.updated_at,
    messages: safeJsonParse(row.messages_json, [])
  }));
  res.json({ sessions });
});

app.post('/api/sessions', requireDeviceId, (req, res) => {
  const firstMessageText = String(req.body?.firstMessageText || '').trim();
  const title = firstMessageText.slice(0, 15) + (firstMessageText.length > 15 ? '...' : '');
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  db.prepare('INSERT INTO sessions (id, user_id, title, preview, updated_at, messages_json) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, req.deviceId, title, title, now, JSON.stringify([]));
  res.json({ session: { id, title, preview: title, updatedAt: now, messages: [] } });
});

app.put('/api/sessions/:id', requireDeviceId, (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const updatedAt = Date.now();
  const lastMsg = messages[messages.length - 1];
  const preview = lastMsg ? String(lastMsg.text || '').slice(0, 30) + '...' : '';
  db.prepare('UPDATE sessions SET preview = ?, updated_at = ?, messages_json = ? WHERE id = ? AND user_id = ?')
    .run(preview, updatedAt, JSON.stringify(messages.slice(-100)), req.params.id, req.deviceId);
  res.json({ ok: true });
});

app.delete('/api/sessions/:id', requireDeviceId, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?').run(req.params.id, req.deviceId);
  const rows = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC').all(req.deviceId);
  const sessions = rows.map((row) => ({
    id: row.id,
    title: row.title,
    preview: row.preview,
    updatedAt: row.updated_at,
    messages: safeJsonParse(row.messages_json, [])
  }));
  res.json({ sessions });
});

app.delete('/api/sessions', requireDeviceId, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(req.deviceId);
  res.json({ ok: true });
});

// --- Library ---
app.get('/api/library', requireDeviceId, (req, res) => {
  const rows = db.prepare('SELECT * FROM library WHERE user_id = ? ORDER BY date DESC').all(req.deviceId);
  const items = rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    category: row.category,
    thumbnail: row.thumbnail || undefined,
    funFact: row.funFact || undefined,
    date: row.date
  }));
  res.json({ items });
});

app.post('/api/library', requireDeviceId, (req, res) => {
  const item = req.body?.item || {};
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const date = Date.now();
  db.prepare('INSERT INTO library (id, user_id, type, title, content, category, thumbnail, funFact, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(
      id,
      req.deviceId,
      item.type || 'card',
      item.title || '',
      item.content || '',
      item.category || '通用',
      item.thumbnail || null,
      item.funFact || null,
      date
    );
  updateItemsSaved(req.deviceId);
  res.json({
    item: {
      id,
      type: item.type || 'card',
      title: item.title || '',
      content: item.content || '',
      category: item.category || '通用',
      thumbnail: item.thumbnail || undefined,
      funFact: item.funFact || undefined,
      date
    }
  });
});

app.delete('/api/library/:id', requireDeviceId, (req, res) => {
  db.prepare('DELETE FROM library WHERE id = ? AND user_id = ?').run(req.params.id, req.deviceId);
  updateItemsSaved(req.deviceId);
  const rows = db.prepare('SELECT * FROM library WHERE user_id = ? ORDER BY date DESC').all(req.deviceId);
  const items = rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    category: row.category,
    thumbnail: row.thumbnail || undefined,
    funFact: row.funFact || undefined,
    date: row.date
  }));
  res.json({ items });
});

app.post('/api/library/optimize-images', requireDeviceId, (req, res) => {
  const result = db.prepare('UPDATE library SET thumbnail = NULL WHERE user_id = ? AND thumbnail LIKE ?')
    .run(req.deviceId, 'data:image%');
  res.json({ optimized: result.changes || 0 });
});

// --- Storage breakdown ---
app.get('/api/storage/breakdown', requireDeviceId, (req, res) => {
  const libraryRows = db.prepare('SELECT * FROM library WHERE user_id = ?').all(req.deviceId);
  const sessionRows = db.prepare('SELECT * FROM sessions WHERE user_id = ?').all(req.deviceId);
  const settingsRow = db.prepare('SELECT json FROM settings WHERE user_id = ?').get(req.deviceId);
  const statsRow = db.prepare('SELECT json FROM stats WHERE user_id = ?').get(req.deviceId);

  const librarySize = toKb(Buffer.byteLength(JSON.stringify(libraryRows || [])));
  const sessionsSize = toKb(Buffer.byteLength(JSON.stringify(sessionRows || [])));
  const systemSize = toKb(Buffer.byteLength((settingsRow?.json || '') + (statsRow?.json || '')));
  const totalSize = toKb(
    Buffer.byteLength(JSON.stringify(libraryRows || [])) +
      Buffer.byteLength(JSON.stringify(sessionRows || [])) +
      Buffer.byteLength((settingsRow?.json || '') + (statsRow?.json || ''))
  );

  res.json({
    breakdown: {
      librarySize,
      libraryCount: libraryRows.length,
      sessionsSize,
      sessionsCount: sessionRows.length,
      systemSize,
      totalSize
    }
  });
});

// --- Clear all data ---
app.delete('/api/all', requireDeviceId, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(req.deviceId);
  db.prepare('DELETE FROM library WHERE user_id = ?').run(req.deviceId);
  db.prepare('DELETE FROM settings WHERE user_id = ?').run(req.deviceId);
  db.prepare('DELETE FROM stats WHERE user_id = ?').run(req.deviceId);
  res.json({ ok: true });
});

// --- OpenAI Proxy ---
const extractOutputText = (data) => {
  if (typeof data?.output_text === 'string') return data.output_text;
  const outputs = Array.isArray(data?.output) ? data.output : [];
  let text = '';
  for (const item of outputs) {
    if (item?.type === 'message' && Array.isArray(item?.content)) {
      for (const content of item.content) {
        if (content?.type === 'output_text' && typeof content?.text === 'string') {
          text += content.text;
        }
      }
    }
  }
  return text;
};

app.post('/api/ai/responses', async (req, res) => {
  if (!OPENAI_API_KEY) {
    res.status(500).send('Missing OPENAI_API_KEY on server');
    return;
  }

  try {
    const body = {
      model: req.body?.model || OPENAI_MODEL,
      input: req.body?.input,
      instructions: req.body?.instructions,
      temperature: req.body?.temperature
    };

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      res.status(aiResponse.status).send(errText);
      return;
    }

    const data = await aiResponse.json();
    const text = extractOutputText(data).trim();
    res.json({ text });
  } catch (e) {
    res.status(500).send(`OpenAI proxy failed: ${e.message || e}`);
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
