/**
 * Jules Integration: Session Cleanup on Issue Removal
 *
 * Deletes the corresponding Jules session when a YouTrack issue is removed.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const api = require('./api');

exports.rule = entities.Issue.onChange({
  title: 'Jules Session Cleanup',
  guard: (ctx) => {
    return ctx.issue.fields[api.FIELD_SESSION_ID] !== '';
  },
  action: (ctx) => {
    const sessionUrl = ctx.issue.fields[api.FIELD_SESSION_ID];
    const simpleId = api.getSessionIdFromUrl(sessionUrl);

    if (simpleId) {
      api.deleteSession('jules', simpleId);
      console.log('Jules Session deleted: ' + simpleId);
    }
  },
  requirements: {
    julesSessionId: {
      type: entities.Field.stringType,
      name: api.FIELD_SESSION_ID,
    },
  },
  runOn: {
    removal: true,
  },
});
