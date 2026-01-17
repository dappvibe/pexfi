/**
 * Shared API and Utility functions for Jules Integration
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const http = require('@jetbrains/youtrack-scripting-api/http');

const JULES_BASE_URL = 'https://jules.googleapis.com/v1alpha';
const FIELD_SESSION_ID = 'Jules Session';
const FIELD_LAST_SYNC = 'Jules Last Sync';

/**
 * Retrieves the API key for the specified agent user.
 * @param {string} agentLogin - The login of the agent user (e.g., 'jules', 'gemini').
 * @returns {string|null} The API key or null if not found.
 */
function getApiKey(agentLogin) {
  if (!agentLogin) return null;
  const user = entities.User.findByLogin(agentLogin);
  return user ? user.getAttribute('apikey') : null;
}

/**
 * Extracts the simple Session ID from the full Session URL.
 * @param {string} sessionUrl - The full URL (e.g., https://jules.google.com/session/123...)
 * @returns {string|null} The session ID or null if invalid.
 */
function getSessionIdFromUrl(sessionUrl) {
  if (!sessionUrl) return null;
  const parts = sessionUrl.split('/session/');
  return parts.length >= 2 ? parts[1] : null;
}

/**
 * Creates an authenticated HTTP connection to the Jules API.
 * @param {string} [apikey] - Optional API key.
 * @param {string} [agentLogin] - Optional agent login to fetch key if apikey is missing.
 * @returns {http.Connection|null} The connection object or null if no API key is available.
 */
function createConnection(apikey, agentLogin) {
  const key = apikey || getApiKey(agentLogin);
  if (!key) return null;

  const connection = new http.Connection(JULES_BASE_URL, null, 20000);
  connection.addHeader('Content-Type', 'application/json');
  connection.addHeader('x-goog-api-key', key);
  return connection;
}

exports.JULES_BASE_URL = JULES_BASE_URL;
exports.FIELD_SESSION_ID = FIELD_SESSION_ID;
exports.FIELD_LAST_SYNC = FIELD_LAST_SYNC;
exports.getApiKey = getApiKey;
exports.getSessionIdFromUrl = getSessionIdFromUrl;
exports.createConnection = createConnection;
