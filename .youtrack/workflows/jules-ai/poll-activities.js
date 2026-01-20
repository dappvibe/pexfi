/**
 * Jules Integration: Poll for Activities
 *
 * Checks open sessions for new messages from Jules and posts them as comments.
 * Also syncs new plans to the Plan custom field.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');

const api = require('./api');

exports.rule = entities.Issue.onSchedule({
  title: 'Sync Jules responses',
  cron: '0 * * * * ?',
  search: `Assignee: jules State: {No State},Thinking,Waiting has: {${api.FIELD_SESSION_ID}}`, // Only poll relevant issues
  action: (ctx) => {
    const issue = ctx.issue;
    const sessionUrl = issue.fields[api.FIELD_SESSION_ID];

    const sessionId = api.getSessionIdFromUrl(sessionUrl);
    if (!sessionId) return;

    const apikey = api.getApiKey('jules');
    if (!apikey) return;

    const connection = api.createConnection(apikey, 'jules');
    if (!connection) return;

    try {
      // Get Activities (messages, plan updates, etc.)
      const response = connection.getSync('/sessions/' + sessionId + '/activities?pageSize=100');

      if (response && response.code === 200) {
        const data = JSON.parse(response.response);
        if (!data.activities) return;

        let lastSync = issue.fields[api.FIELD_LAST_SYNC];
        let lastSyncTime = lastSync || 0;
        let newMaxTime = lastSyncTime;

        // Process activities
        // Filter for "agent" originator.
        // We include both agentMessaged and agentPlanUpdated (or generic plan check)
        const newActivities = data.activities.filter((activity) => {
          const time = new Date(activity.createTime).getTime();
          return activity.originator === 'agent' && time > lastSyncTime;
        });

        // Sort by time ascending
        newActivities.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());

        newActivities.forEach((activity) => {
          const time = new Date(activity.createTime).getTime();
          if (time > newMaxTime) newMaxTime = time;

          // Handle Messages
          if (activity.agentMessaged) {
            const message = activity.agentMessaged.agentMessage;
            // Post with permtoken
            api.postComment('jules', issue, `🤖 **Jules:**\n\n${message}`);
          } else if (activity.agentMessage) {
            // Fallback for some API versions
            api.postComment('jules', issue, `🤖 **Jules:**\n\n${activity.agentMessage}`);
          }

          // Handle Plans
          // Structure based on client.ts: activity.planGenerated.plan.steps
          if (activity.planGenerated && activity.planGenerated.plan) {
            const steps = activity.planGenerated.plan.steps;
            let planMarkdown = '';

            if (steps && steps.length > 0) {
              // Sort steps by index just in case
              steps.sort((a, b) => a.index - b.index);

              planMarkdown =
                '<hr>\n\n' +
                steps
                  .map((step, index) => {
                    return step.description
                      ? `### ${index + 1}. ${step.title}\n${step.description}`
                      : `### ${index + 1}. ${step.title}`;
                  })
                  .join('\n\n');
            } else {
              planMarkdown = '_Empty Plan_';
            }

            issue.fields[api.FIELD_PLAN] = planMarkdown;
            if (issue.fields.Stage) {
              issue.fields.Stage = ctx.Stage.Shaping;
            }
            workflow.message(`${issue.id}: Plan Updated`);
          }
        });

        // Sync Issue State with Session State
        const sessionResponse = connection.getSync('/sessions/' + sessionId);
        if (sessionResponse && sessionResponse.code === 200) {
          const sessionData = JSON.parse(sessionResponse.response);
          const julesState = sessionData.state;

          if (['QUEUED', 'PLANNING', 'IN_PROGRESS'].indexOf(julesState) !== -1) {
            issue.fields.State = ctx.State.Thinking;
          } else if (['AWAITING_PLAN_APPROVAL', 'AWAITING_USER_FEEDBACK'].indexOf(julesState) !== -1) {
            issue.fields.State = ctx.State.Waiting;
          } else if (julesState === 'PAUSED') {
            issue.fields.State = ctx.State.Paused;
          } else if (julesState === 'COMPLETED') {
            issue.fields.State = ctx.State.Finished;
          } else if (julesState === 'FAILED') {
            issue.fields.State = ctx.State.Blocked;
          }
        }

        // Update Last Sync
        if (newMaxTime > lastSyncTime) {
          issue.fields[api.FIELD_LAST_SYNC] = newMaxTime;
        }
      } else if (response.code === 404) {
        // Session deleted or not found
        console.warn('Jules Session not found (404). Clearing session fields.');
        issue.fields[api.FIELD_SESSION_ID] = null;
        issue.fields[api.FIELD_LAST_SYNC] = null;
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
      name: api.FIELD_SESSION_ID,
    },
    julesLastSync: {
      type: entities.Field.dateTimeType,
      name: api.FIELD_LAST_SYNC,
    },
    julesPlan: {
      type: entities.Field.textType, // Assuming text type for Plan
      name: api.FIELD_PLAN,
    },
    State: {
      type: entities.State.fieldType,
      Waiting: {},
      Thinking: {},
      Finished: {},
      Paused: {},
      Blocked: {},
    },
    Stage: {
      type: entities.EnumField.fieldType,
      Shaping: {},
      Approved: {}
    }
  },
});
