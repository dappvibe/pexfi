/**
 * Jules Integration: Forward Comments
 *
 * Forwards user comments to Jules as chat messages.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const http = require('@jetbrains/youtrack-scripting-api/http');

const JULES_BASE_URL = 'https://jules.googleapis.com/v1alpha';

exports.rule = entities.Issue.onChange({
  title: 'Forward comments to Jules',
  guard: (ctx) => {
    return (
      ctx.issue.fields['Jules Session'] &&
      ctx.issue.comments.added.isNotEmpty() &&
      ctx.issue.comments.added.first().author.login !== 'jules'
    );
  },
  requirements: {
    julesSessionId: {
      type: entities.Field.stringType,
      name: 'Jules Session',
    },
  },
  action: (ctx) => {
    const apikey = entities.User.findByLogin('jules').getAttribute('apikey');
    if (!apikey) return; // Should log error, but keep it silent to avoid user spam

    const issue = ctx.issue;
    const comment = issue.comments.added.first();
    const sessionUrl = issue.fields['Jules Session']; // "https://jules.google.com/session/123..."
    // Extract session ID from URL. URL format: .../session/{id} (No "sessions/" prefix in storage)
    const parts = sessionUrl.split('/session/');
    if (parts.length < 2) return;
    const simpleId = parts[1];

    const connection = new http.Connection(JULES_BASE_URL, null, 20000);
    connection.addHeader('Content-Type', 'application/json');
    connection.addHeader('x-goog-api-key', apikey);

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
