/**
 * Gemini Verification Stub
 *
 * Logs the Gemini Cache ID when it changes or when verification is triggered.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const api = require('./api');

exports.rule = entities.Issue.onChange({
  title: 'Verify Gemini Cache ID',
  guard: (ctx) => {
    // Just a placeholder trigger, e.g. when a specific issue is updated
    return ctx.issue.summary.includes('Verify Gemini');
  },
  requirements: {
    geminiUser: {
      type: entities.User,
      login: api.GEMINI_USER_LOGIN,
    },
    // This ensures the attribute exists on the user profile in the system
    // Note: YouTrack scripting API requirements for User attributes are implicit usually,
    // but defining the user here ensures the user entity is available.
  },
  action: (ctx) => {
    const cacheId = api.getGeminiCacheId();
    const msg = 'Current Gemini Cache ID: ' + (cacheId || 'NOT SET');
    console.log(msg);
    workflow.message(msg);
  },
});
