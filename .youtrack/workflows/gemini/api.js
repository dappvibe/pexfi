/**
 * Gemini Integration Shared API
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');

const GEMINI_USER_LOGIN = 'gemini';
const FIELD_CACHE_ID = 'context_cache_id';

/**
 * Retrieves the current Gemini Context Cache ID from the gemini user profile.
 * @returns {string|null} The cache ID or null if not found.
 */
function getGeminiCacheId() {
  const user = entities.User.findByLogin(GEMINI_USER_LOGIN);
  if (!user) {
    console.error('Gemini user not found: ' + GEMINI_USER_LOGIN);
    return null;
  }
  return user.getAttribute(FIELD_CACHE_ID);
}

exports.getGeminiCacheId = getGeminiCacheId;
exports.GEMINI_USER_LOGIN = GEMINI_USER_LOGIN;
exports.FIELD_CACHE_ID = FIELD_CACHE_ID;
