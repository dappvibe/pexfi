/**
 * Jules Integration: Poll for Activities
 *
 * Checks open sessions for new messages from Jules and posts them as comments.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const http = require('@jetbrains/youtrack-scripting-api/http');

const JULES_BASE_URL = 'https://jules.googleapis.com/v1alpha';

exports.rule = entities.Issue.onSchedule({
  title: 'Sync Jules responses',
  cron: '0 * * * * ?',
  search: 'Stage: Shaping has: {Jules Session}', // Only poll relevant issues
  action: (ctx) => {
    const issue = ctx.issue;
    const sessionUrl = issue.fields['Jules Session'];
    if (!sessionUrl) return;

    // Extract Session ID
    const parts = sessionUrl.split('/session/');
    if (parts.length < 2) return;
    const sessionId = parts[1];

    const apikey = entities.User.findByLogin('jules').getAttribute('apikey');
    if (!apikey) return;

    const connection = new http.Connection(JULES_BASE_URL, null, 20000);
    connection.addHeader('Content-Type', 'application/json');
    connection.addHeader('x-goog-api-key', apikey);

    try {
      // Get Activities (messages, plan updates, etc.)
      // Note: Ordering by createTime might be needed if not default
      // Re-attach 'sessions/' prefix for API
      const response = connection.getSync('/sessions/' + sessionId + '/activities?pageSize=50');

      if (response && response.code === 200) {
        const data = JSON.parse(response.response);
        if (!data.activities) return;

        let lastSync = issue.fields['Jules Last Sync'];
        // Treat lastSync as a timestamp (number)
        let lastSyncTime = lastSync ? parseInt(lastSync) : 0;
        let newMaxTime = lastSyncTime;

        // Process activities
        // We filter for "agent" originator and assume "agentMessaged" event type contains the text
        const newActivities = data.activities.filter((activity) => {
          const time = new Date(activity.createTime).getTime();
          return activity.originator === 'agent' && activity.agentMessaged && time > lastSyncTime;
        });

        // Sort by time ascending to post in order
        newActivities.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());

        newActivities.forEach((activity) => {
          const time = new Date(activity.createTime).getTime();
          if (time > newMaxTime) newMaxTime = time;

          const message = activity.agentMessaged.agentMessage;
          issue.addComment(`🤖 **Jules:**\n\n${message}`);
        });

        // Update Last Sync
        if (newMaxTime > lastSyncTime) {
          issue.fields['Jules Last Sync'] = newMaxTime.toString();
        }
      } else if (response.code === 404) {
        // Session deleted or not found
        console.warn('Jules Session not found (404). Clearing session fields.');
        issue.fields['Jules Session'] = null;
        issue.fields['Jules Last Sync'] = null;
        issue.addComment(
          '⚠️ **Jules Session Disconnected**\n\nThe session was not found (404). It may have been deleted or expired.'
        );
      } else {
        console.error('Jules Sync Error: ' + response.code + ' ' + response.response);
      }
    } catch (err) {
      console.error('Jules Sync Exception: ' + err);
    }
  },
  requirements: {
    julesSessionId: {
      type: entities.Field.stringType,
      name: 'Jules Session',
    },
    julesLastSync: {
      type: entities.Field.stringType,
      name: 'Jules Last Sync',
    },
  },
});
