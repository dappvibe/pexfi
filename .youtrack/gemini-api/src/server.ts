import express from 'express';
import cors from 'cors';
import { client } from './api.js';
import { db } from './db.js';
import { Interaction } from './Interaction.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// POST /chat/:chatId - Continue or start a chat
app.post('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { prompt, system_instruction } = req.body;

    // Validation: alphanumeric and dash, up to 36 chars (UUID support)
    const idRegex = /^[a-zA-Z0-9-]{1,36}$/;
    if (!idRegex.test(chatId)) {
      return res.status(400).json({ error: 'Chat ID must be alphanumeric with dashes and up to 36 characters.' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Processing interaction for chat: ${chatId}`);

    // Check for previous interaction in this chat to verify context
    const lastInteraction = Interaction.findLatestByChatId(chatId);

    // Create new interaction
    const interaction = await client.interactions.create({
        input: prompt,
        system_instructions: system_instruction,
        chat_id: chatId,
        previous_interaction_id: lastInteraction ? lastInteraction.id : undefined,
        model: 'gemini-2.5-flash'
    });

    res.json(interaction);

  } catch (error: any) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET /chat/:chatId - Get interaction logs for a chat
app.get('/chat/:chatId', (req, res) => {
  try {
    const { chatId } = req.params;

    // Get all interactions for this chat, ordered by time
    const stmt = db.prepare('SELECT * FROM interactions WHERE chat_id = ? ORDER BY created_at ASC');
    const rows = stmt.all(chatId) as any[];

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Parse JSON responses
    const results = rows.map(row => {
        try {
            row.response = JSON.parse(row.response);
        } catch (e) {
            // keep as is
        }
        return row;
    });

    res.json(results);
  } catch (error: any) {
    console.error('Error retrieving chat:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Gemini service listening on port ${port}`);
});
