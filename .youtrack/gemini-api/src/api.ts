import { GoogleGenAI } from '@google/genai';
import { Interaction } from './Interaction.js';
import crypto from 'crypto';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in environment/env file');
}

/**
 * Configure the Google GenAI client
 */
export const api = new GoogleGenAI({
  apiKey: apiKey,
});

/**
 * Client wrapper matching user requirements
 */
export const client = {
  interactions: {
    /**
     * Creates and executes an interaction.
     * @param config Configuration for the interaction
     */
    create: async (config: {
      model?: string;
      input: string;
      system_instructions?: string;
      previous_interaction_id?: string;
      chat_id?: string;
    }) => {
      // Generate a new ID for this interaction
      const id = crypto.randomUUID();
      const systemInstructions = config.system_instructions || '';

      const interaction = new Interaction(
        id,
        systemInstructions,
        config.chat_id,
        config.previous_interaction_id,
        config.model
      );

      // Execute the prompt (calls API and saves to DB)
      await interaction.prompt(config.input);

      return interaction;
    }
  }
};

export default client;
