import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { createInteraction } from './client.js';

const app = express();
const port = process.env.PORT || 3000;
const dbPath = process.env.DB_PATH;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
let db: Database.Database;

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      prompt TEXT,
      response JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log(`Connected to SQLite at ${dbPath}`);
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Routes

// POST /api/:id - Create a new interaction
app.post('/api/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, system_instruction } = req.body;

    // Validation: alphanumeric and dash, up to 16 chars
    const idRegex = /^[a-zA-Z0-9-]{1,16}$/;
    if (!idRegex.test(id)) {
      return res.status(400).json({ error: 'ID must be alphanumeric with dashes and up to 16 characters.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const sysPrompt = system_instruction || 'You are a helpful assistant.';

    console.log('Processing interaction:', { id, prompt, sysPrompt });

    const interaction = await createInteraction(sysPrompt, prompt);

    // Save to DB using the supplied ID
    const stmt = db.prepare('INSERT INTO interactions (id, prompt, response) VALUES (?, ?, ?)');
    stmt.run(id, prompt, JSON.stringify(interaction));

    res.json(interaction);

  } catch (error: any) {
    console.error('Error creating interaction:', error);
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return res.status(409).json({ error: 'Interaction ID already exists' });
    }
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET /api/chat/:id - Get interaction logs
app.get('/api/chat/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM interactions WHERE id = ?');
    const row = stmt.get(id);

    if (!row) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    // Parse the JSON response field back to object
    // @ts-ignore
    row.response = JSON.parse(row.response);

    res.json(row);
  } catch (error: any) {
    console.error('Error retrieving interaction:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Gemini service listening on port ${port}`);
});
