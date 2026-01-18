/**
 * Jules Integration: Unified Workflow
 * Handles session creation and comment forwarding.
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const api = require('./api');

/**
 * Generates the prompt used to create a new Jules session.
 * @param {object} issue - The YouTrack issue object.
 * @returns {string} The prompt string.
 */
function generateSessionPrompt(issue) {
  return `
Apply relevant skills from .agent/skills to assist with this issue.
Choose relevant personas from .agent/personas as defined in task's user story.
You are working on an issue with id: ${issue.id}

Task: ${issue.summary}
${issue.description || ''}`;
}

class JulesWorkflow {
  constructor(ctx) {
    this.ctx = ctx;
    this.issue = ctx.issue;
  }

  /**
   * Main execution method
   */
  run() {
    if (this.shouldCreateSession()) {
      this.createSession();
    }

    if (this.shouldForwardComment()) {
      this.forwardComments();
    }

    if (this.shouldApprovePlan()) {
      this.approvePlan();
    }
  }

  /**
   * Check if 'jules' is in the Assignees list
   */
  isJulesAssigned() {
    // Note: Depends on 'Assignee' field in requirements
    const assignees = this.issue.fields.Assignee;
    if (!assignees || assignees.isEmpty()) return false;

    let found = false;
    assignees.forEach(user => {
      if (user.login === 'jules') found = true;
    });
    return found;
  }

  /**
   * Check if the issue already has a Jules Session ID
   */
  hasSession() {
    return !!this.issue.fields[api.FIELD_SESSION_ID];
  }

  /**
   * Determine if we should create a new session
   */
  shouldCreateSession() {
    return this.isJulesAssigned() && !this.hasSession();
  }

  /**
   * Check if we should forward a comment
   */
  shouldForwardComment() {
    return this.hasSession() && this.issue.comments.added.isNotEmpty();
  }

  /**
   * Check if we should approve the plan
   */
  shouldApprovePlan() {
    return this.hasSession() &&
           this.issue.isChanged('Stage') &&
           this.issue.fields.Stage.name === 'Approved';
  }

  /**
   * Approve the plan in Jules
   */
  approvePlan() {
    const sessionUrl = this.issue.fields[api.FIELD_SESSION_ID];
    const simpleId = api.getSessionIdFromUrl(sessionUrl);
    if (!simpleId) return;

    const apikey = api.getApiKey('jules');
    if (!apikey) return;

    const connection = api.createConnection(apikey, 'jules');
    if (!connection) return;

    // Endpoint: sessions/{id}:approvePlan
    const endpoint = '/sessions/' + simpleId + ':approvePlan';

    try {
      const response = connection.postSync(endpoint, null, '{}');

      if (response && (response.code === 200 || response.code === 204)) {
         workflow.message('✅ Jules Plan Approved');
      } else {
         console.error('Failed to approve plan. Code: ' + response.code + ', Body: ' + response.response);
         workflow.message('❌ Failed to approve Jules plan');
      }
    } catch (ex) {
      console.error('Exception approving plan: ' + ex);
    }
  }

  /**
   * Create a new Jules session using the API
   */
  createSession() {
    const apikey = api.getApiKey('jules');
    if (!apikey) {
      console.warn('Jules API Key missing for user "jules".');
      return;
    }

    const sessionPrompt = generateSessionPrompt(this.issue);

    const payload = {
      prompt: sessionPrompt,
      title: `${this.issue.id}: ${this.issue.summary}`,
      sourceContext: {
        source: api.JULES_SOURCE,
        githubRepoContext: {
          startingBranch: 'develop',
        },
      },
      requirePlanApproval: true,
      automationMode: 'AUTO_CREATE_PR',
    };

    const connection = api.createConnection(apikey, 'jules');
    if (!connection) return;

    try {
      const response = connection.postSync('/sessions', null, JSON.stringify(payload));

      if (response && (response.code === 200 || response.code === 201)) {
        const sessionData = JSON.parse(response.response);
        const resourceName = sessionData.name; // e.g., "sessions/123..."
        const simpleId = resourceName.split('/').pop();

        if (simpleId) {
          // Update issue fields
          this.issue.fields[api.FIELD_SESSION_ID] = 'https://jules.google.com/session/' + simpleId;
          this.issue.fields[api.FIELD_LAST_SYNC] = new Date().getTime();

          // Notify user via workflow message
          workflow.message(`Jules Session Started`);
          this.issue.fields.State = this.ctx.State.Thinking;
        } else {
           console.warn('Jules Session created but ID extraction failed.');
        }
      } else {
        console.error('Failed to create Jules Session. Code: ' + response.code + ' Response: ' + response.response);
      }
    } catch (err) {
      console.error('Exception creating Jules session: ' + err);
    }
  }

  /**
   * Forward valid comments to the active Jules session
   */
  forwardComments() {
    const apikey = api.getApiKey('jules');
    if (!apikey) return;

    const sessionUrl = this.issue.fields[api.FIELD_SESSION_ID];
    const simpleId = api.getSessionIdFromUrl(sessionUrl);
    if (!simpleId) return;

    const connection = api.createConnection(apikey, 'jules');
    if (!connection) return;

    this.issue.comments.added.forEach(comment => {
      // Logic duplicated to ensure safe checking in loop
      if (comment.author.login === 'jules') return;
      if (comment.text.indexOf('@jules') === -1) return;

      const cleanText = comment.text.replace(/@jules/gi, '').trim();
      const payload = {
        prompt: cleanText
      };

      try {
        const response = connection.postSync(`/sessions/${simpleId}:sendMessage`, null, JSON.stringify(payload));

        if (response.code === 200) {
          api.addReaction('jules', this.issue, comment, 'eyes');
          this.issue.fields.State = this.ctx.State.Thinking;
        } else {
          console.error('Failed to forward message to Jules. Code: ' + response.code);
        }
      } catch (err) {
        console.error('Exception forwarding message: ' + err);
      }
    });
  }
}

exports.rule = entities.Issue.onChange({
  title: 'Jules AI Workflow',
  guard: (ctx) => {
    return !ctx.issue.draftId;
  },
  action: (ctx) => {
    const workflowInstance = new JulesWorkflow(ctx);
    workflowInstance.run();
  },
  requirements: {
    jules: {
      type: entities.User,
      login: 'jules'
    },
    Assignee: {
      type: entities.User.fieldType,
      multi: true
    },
    State: {
      type: entities.State.fieldType,
      Thinking: {}
    },
    julesSessionId: {
      type: entities.Field.stringType,
      name: api.FIELD_SESSION_ID
    },
    julesLastSync: {
      type: entities.Field.dateTimeType,
      name: api.FIELD_LAST_SYNC
    }
  }
});
