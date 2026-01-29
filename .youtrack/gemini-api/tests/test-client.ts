import { client } from '../src/api.js';

/**
 * Runs a simple test interaction with Gemini using the new Client API
 */
async function runTest() {
  console.log('--- Starting Gemini Interaction Client Test ---');

  try {
    // 1. Create new interaction
    console.log('1. Starting Conversation...');
    const interaction1 = await client.interactions.create({
      model: 'gemini-2.5-flash',
      input: 'Hi, my name is Phil.',
      system_instructions: 'You are a helpful assistant.'
    });

    console.log('Interaction 1 ID:', interaction1.id);
    console.log('Response:', JSON.stringify(interaction1.response, null, 2));

    // 2. Continue interaction
    console.log('\n2. Continuing Conversation...');
    const interaction2 = await client.interactions.create({
      model: 'gemini-2.5-flash',
      input: 'What is my name?',
      previous_interaction_id: interaction1.id
    });

    console.log('Interaction 2 ID:', interaction2.id);
    console.log('Response:', JSON.stringify(interaction2.response, null, 2));

  } catch (error) {
    console.error('Test execution failed:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

runTest();
