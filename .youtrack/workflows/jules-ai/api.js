/**
 * Shared API and Utility functions for Jules Integration
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const http = require('@jetbrains/youtrack-scripting-api/http');

const JULES_BASE_URL = 'https://jules.googleapis.com/v1alpha';
const FIELD_SESSION_ID = 'Jules Session';
const FIELD_LAST_SYNC = 'Jules Last Sync';
const JULES_SOURCE = 'sources/github/dappvibe/pexfi';

/**
 * Retrieves the API key for the specified agent user.
 * @param {string} agentLogin - The login of the agent user (e.g., 'jules', 'gemini').
 * @returns {string|null} The API key or null if not found.
 */
function getApiKey(agentLogin) {
  if (!agentLogin) return null;
  const user = entities.User.findByLogin(agentLogin);
  const key = user ? user.getAttribute('apikey') : null;
  if (!key) {
    console.warn('API key for user "' + agentLogin + '" not found.');
  }
  return key;
}

/**
 * Retrieves the Permanent Token for the specified agent user.
 * @param {string} agentLogin - The login of the agent user (e.g., 'jules', 'gemini').
 * @returns {string|null} The perm token or null if not found.
 */
function getPermToken(agentLogin) {
  if (!agentLogin) return null;
  const user = entities.User.findByLogin(agentLogin);
  return user ? user.getAttribute('permtoken') : null;
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

/**
 * Adds a reaction to a comment as the specified agent.
 * @param {string} agentLogin - The login of the agent user.
 * @param {object} issue - The issue object (to derive base URL).
 * @param {object} comment - The comment object to react to.
 * @param {string} reaction - The reaction string (e.g., 'eyes').
 */
function addReaction(agentLogin, issue, comment, reaction) {
  const token = getPermToken(agentLogin);
  if (!token) {
    console.error('No permtoken found for user ' + agentLogin);
    return;
  }

  // Derive YouTrack Base URL from issue.url
  if (!issue.url) {
     console.error('Issue URL not available');
     return;
  }

  let commentId = comment.id;
  if ((!commentId || typeof commentId === 'undefined') && comment.url) {
      // Try to extract from URL: ...#focus=Comments-7-34.0-0
      // We want "7-34"
      const match = comment.url.match(/focus=Comments-([\d-]+)/);
      if (match) {
          commentId = match[1];
      }
  }

  if (!issue.id || !commentId) {
    console.warn('AddReaction: Invalid issue.id (' + issue.id + ') or comment.id (' + commentId + '). Skipping reaction.');
    return;
  }

  const baseUrlMatches = issue.url.match(/^(https?:\/\/[^\/]+)/);
  if (!baseUrlMatches) {
      console.error('Could not parse base URL from issue.url: ' + issue.url);
      return;
  }
  const baseUrl = baseUrlMatches[1];

  const connection = new http.Connection(baseUrl, null, 20000);
  connection.addHeader('Content-Type', 'application/json');
  connection.addHeader('Authorization', 'Bearer ' + token);
  connection.addHeader('Accept', 'application/json');

  /* const endpoint = '/api/issues/' + issue.id + '/comments/' + commentId + '/reactions'; */
  /* endpoint sometimes requires full entity id which is 7-34 */

  const endpoint = '/api/issues/' + issue.id + '/comments/' + commentId + '/reactions';
  const payload = { reaction: reaction };

  const response = connection.postSync(endpoint, null, JSON.stringify(payload));
  if (response.code !== 200 && response.code !== 201) {
      console.error('Failed to add reaction. Code: ' + response.code + ', Body: ' + response.response);
  }
}

/**
 * Posts a comment to an issue as the specified agent using permtoken.
 * @param {string} agentLogin - The login of the agent user.
 * @param {object} issue - The issue object.
 * @param {string} text - The comment text.
 */
function postComment(agentLogin, issue, text) {
  const token = getPermToken(agentLogin);
  if (!token) {
    console.error('No permtoken found for user ' + agentLogin);
    return;
  }

  // Base URL extraction (duplicated logic, could be helper)
  const baseUrlMatches = issue.url.match(/^(https?:\/\/[^\/]+)/);
  if (!baseUrlMatches) {
      console.error('Could not parse base URL from issue.url: ' + issue.url);
      return;
  }
  const baseUrl = baseUrlMatches[1];

  const connection = new http.Connection(baseUrl, null, 20000);
  connection.addHeader('Content-Type', 'application/json');
  connection.addHeader('Authorization', 'Bearer ' + token);
  connection.addHeader('Accept', 'application/json');

  const endpoint = '/api/issues/' + issue.id + '/comments';
  const payload = { text: text };

  const response = connection.postSync(endpoint, null, JSON.stringify(payload));
  if (response.code !== 200 && response.code !== 201) {
      console.error('Failed to post comment. Code: ' + response.code + ', Body: ' + response.response);
  }
}

exports.JULES_BASE_URL = JULES_BASE_URL;
exports.FIELD_SESSION_ID = FIELD_SESSION_ID;
exports.FIELD_LAST_SYNC = FIELD_LAST_SYNC;
exports.JULES_SOURCE = JULES_SOURCE;
exports.FIELD_PLAN = 'Plan';
exports.getApiKey = getApiKey;
exports.getPermToken = getPermToken;
exports.getSessionIdFromUrl = getSessionIdFromUrl;
exports.createConnection = createConnection;
exports.addReaction = addReaction;
exports.postComment = postComment;
