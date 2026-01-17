/**
 * Jules Integration: Forward Comments
 *
 * Forwards user comments to Jules as chat messages.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const http = require('@jetbrains/youtrack-scripting-api/http');

const api = require('./api');

exports.rule = entities.Issue.onChange({
  title: 'Forward comments to Jules',
  guard: (ctx) => {
    return (
      ctx.issue.fields[api.FIELD_SESSION_ID] &&
      ctx.issue.comments.added.isNotEmpty() &&
      ctx.issue.comments.added.first().author.login !== 'jules'
    );
  },
  requirements: {
    julesSessionId: {
      type: entities.Field.stringType,
      name: api.FIELD_SESSION_ID,
    },
  },
  action: (ctx) => {
    const apikey = api.getApiKey();
    if (!apikey) return; // Should log error, but keep it silent to avoid user spam

    const issue = ctx.issue;
    const comment = issue.comments.added.first();
    const sessionUrl = issue.fields[api.FIELD_SESSION_ID]; // "https://jules.google.com/session/123..."

    const simpleId = api.getSessionIdFromUrl(sessionUrl);
    if (!simpleId) return;

    const connection = api.createConnection(apikey);

    const payload = {
      prompt: comment.text,
    };

    try {
      // Using :sendMessage custom verb. Re-attach 'sessions/' prefix for API.
      const response = connection.postSync('/sessions/' + simpleId + ':sendMessage', null, JSON.stringify(payload));
      if (response.code !== 200) {
        console.error('Failed to forward comment to Jules: ' + response.response);
      }
    } catch (err) {
      console.error('Exception forwarding comment to Jules: ' + err);
    }
  },
});
