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
    const apikey = api.getApiKey('jules');
    if (!apikey) return;

    const issue = ctx.issue;
    const sessionUrl = issue.fields[api.FIELD_SESSION_ID];
    const simpleId = api.getSessionIdFromUrl(sessionUrl);
    if (!simpleId) return;

    const connection = api.createConnection(apikey);

    ctx.issue.comments.added.forEach((comment) => {
      // Skip comments made by Jules
      if (comment.author.login === 'jules') return;

      const payload = {
        prompt: comment.text,
      };

      try {
        const response = connection.postSync('/sessions/' + simpleId + ':sendMessage', null, JSON.stringify(payload));
        if (response.code !== 200) {
          console.error('Failed to forward comment to Jules: ' + response.response);
        } else {
          // Forwarding successful, add reaction
          api.addReaction('jules', issue, comment, 'eyes');
        }
      } catch (err) {
        console.error('Exception forwarding comment to Jules: ' + err);
      }
    });
  },
});
