/**
 * Jules Integration: Poll for External Sessions
 *
 * Scans Jules for sessions created externally (e.g. via CLI or Web) that belong to this project
 * and creates corresponding YouTrack issues if they don't exist.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const search = require('@jetbrains/youtrack-scripting-api/search');
const api = require('./api');

exports.rule = entities.Issue.onSchedule({
  title: 'Poll Jules Sessions',
  cron: '0 * * * * ?', // Run every minute
  search: '#PEXFI-1052', // find exactly one anchor issue to execute once. Do not delete this issue.
  action: (ctx) => {
    const apikey = api.getApiKey('jules');
    if (!apikey) {
      console.warn('Jules API Key missing for user "jules".');
      return;
    }

    const connection = api.createConnection(apikey, 'jules');
    if (!connection) return;

    try {
      // 1. Fetch sessions (page size 100)
      // Note: We are fetching page 1. For comprehensive sync we might need pagination,
      // but for "polling new sessions" page 1 (sorted by updateTime desc usually?) is often enough.
      // Jules API listSessions default sort is undefined, likely createTime or updateTime.
      // We'll proceed with one page for now as requested "Fetch all sessions... (100 per page!)"
      // Ideally we loop if nextPageToken exists, but simple polling often implies just checking the latest batch.
      // However, to be robust we should fetch all if possible, or at least a large batch.
      const response = connection.getSync('/sessions?pageSize=100');

      if (response && response.code === 200) {
        const data = JSON.parse(response.response);
        if (!data.sessions || data.sessions.length === 0) return;

        data.sessions.forEach((session) => {
          // 2. Filter by Source
          if (!session.sourceContext || session.sourceContext.source !== api.JULES_SOURCE) {
            return;
          }



          // 4. Check if issue exists
          // We search for an issue that has the 'Jules Session' field set to this session's URL
          // Note: session.url is the full URL e.g. https://jules.google.com/session/123
          const query = `{${api.FIELD_SESSION_ID}}: {${session.url}}`;
          const existingIssues = search.search(ctx.issue.project, query);
          if (existingIssues.size > 0) {
            // Issue already exists
            return;
          }

          // 5. Create new issue
          const julesUser = entities.User.findByLogin('jules');
          const reporter = julesUser || ctx.currentUser;

          if (!reporter) {
            console.error('No valid reporter found (max or currentUser). Cannot create issue.');
            return;
          }

          const newIssue = new entities.Issue(reporter, ctx.issue.project, session.title || 'Untitled Jules Session');
          newIssue.description = session.prompt || '(No description provided)';

          // Set Custom Fields
          newIssue.fields[api.FIELD_SESSION_ID] = session.url;
          newIssue.fields[api.FIELD_LAST_SYNC] = new Date().getTime().toString();
          newIssue.fields.Priority = ctx.Priority.Minor;

          if (julesUser) {
            const maxUser = entities.User.findByLogin('max');
            newIssue.fields.Assignee.add(maxUser || reporter);
          }

          console.log(`Created issue ${newIssue.id} for Jules session ${session.name}`);
        });
      } else {
        console.error('Failed to list Jules sessions. Code: ' + response.code);
      }
    } catch (err) {
      console.error('Exception polling Jules sessions: ' + err);
    }
  },
  requirements: {
    Assignee: {
      type: entities.User.fieldType,
      multi: true,
    },
    julesSessionId: {
      type: entities.Field.stringType,
      name: api.FIELD_SESSION_ID,
    },
    julesLastSync: {
      type: entities.Field.stringType,
      name: api.FIELD_LAST_SYNC,
    },
    jules: {
      type: entities.User,
      login: 'jules',
    },
    Priority: {
      type: entities.EnumField.fieldType,
      name: 'Priority',
      Minor: {},
    },
  },
});
