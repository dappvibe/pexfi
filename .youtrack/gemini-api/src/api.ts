import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not defined in environment/env file');
}

if (!githubToken) {
  throw new Error('GITHUB_TOKEN is not defined in environment/env file');
}

/**
 * Configure the Google GenAI client
 */
export const api = new GoogleGenAI({
  apiKey: apiKey,
});

/**
 * Creates an interaction with Gemini 2.5 Flash configured to use the GitHub MCP server.
 *
 * @param systemInstructions - The persona or system prompt for the model
 * @param prompt - The user input/question
 * @returns The interaction result from Gemini
 */
export async function createInteraction(systemInstructions: string, prompt: string) {
  const mcpServer = {
    type: 'mcp_server',
    name: 'github',
    url: 'https://api.githubcopilot.com/mcp/',
    headers: {
      Authorization: `Bearer ${githubToken.trim()}`,
    },
  };

  return await api.interactions.create({
    model: 'gemini-2.5-flash',
    input: prompt,
    tools: [mcpServer],
    system_instruction: systemInstructions,
  });
}

export default api;
