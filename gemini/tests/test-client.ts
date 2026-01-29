import { createInteraction } from '../client.js';

/**
 * Runs a simple test interaction with Gemini after configuring it as 'Monthy python'
 */
async function runTest() {
  console.log('--- Starting Gemini Interaction Test ---');

  try {
    const interaction = await createInteraction(
      'You are product manager',
      'Show latest commit of dappvibe/pexfi on github'
    );

    console.log('Interaction response received.');

    // Output the response (safely handling the result structure)
    // Note: interactions API response structure can vary, but usually contains the model response
    console.log(JSON.stringify(interaction, null, 2));

  } catch (error) {
    console.error('Test execution failed:');
    if (error instanceof Error) {
      // Avoid logging potentially sensitive message details if they contain tokens,
      // but standard error messages should be fine.
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

runTest();
