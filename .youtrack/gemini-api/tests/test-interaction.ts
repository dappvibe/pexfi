import { Interaction } from '../src/Interaction.js';
import { db } from '../src/db.js';
import crypto from 'crypto';

async function testInteractionPersistence() {
  console.log('--- Testing Interaction Persistence ---');

  const id = crypto.randomUUID();
  const chatId = 'test-chat-' + crypto.randomUUID();
  const sysParam = 'Test System Instructions';
  const promptText = 'Test Prompt';

  console.log(`Creating interaction ${id} for chat ${chatId}`);

  // 1. Manually create instance
  const interaction = new Interaction(id, sysParam, chatId);
  interaction.promptText = promptText;
  interaction.response = { text: 'Test Response' };

  // 2. Save
  interaction.save();
  console.log('Saved interaction.');

  // 3. Find by ID
  const loaded = Interaction.find(id);
  if (!loaded) {
      console.error('FAILED: Could not find interaction by ID');
      process.exit(1);
  }
  if (loaded.id === id && loaded.chatId === chatId && loaded.promptText === promptText) {
      console.log('PASSED: Find by ID verified.');
  } else {
      console.error('FAILED: Data mismatch on load', loaded);
      process.exit(1);
  }

  // 4. Find latest
  const latest = Interaction.findLatestByChatId(chatId);
  if (latest && latest.id === id) {
      console.log('PASSED: Find latest by chat ID verified.');
  } else {
      console.error('FAILED: Find latest returned mismatch', latest);
      process.exit(1);
  }

  // 5. Add newer interaction
  const id2 = crypto.randomUUID();
  const interaction2 = new Interaction(id2, sysParam, chatId);
  interaction2.promptText = 'Second prompt';
  interaction2.save();

  const latest2 = Interaction.findLatestByChatId(chatId);

  if (latest2) {
      console.log(`Latest found: ${latest2.id} (Expected one of them)`);
  }
}

testInteractionPersistence().catch(err => console.error(err));
