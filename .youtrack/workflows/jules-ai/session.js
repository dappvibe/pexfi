/**
 * Jules Integration Workflow for YouTrack
 *
 * -------------------------------------------------------------------------------------
 * ABOUT THIS SCRIPT
 * -------------------------------------------------------------------------------------
 * WHERE IT RUNS:
 * This script runs inside the JetBrains YouTrack Workflow Editor. It is executed by the
 * YouTrack JavaScript Workflow Engine, not in your local CI/CD or Node.js environment.
 *
 * WHY IT EXISTS:
 * It bridges YouTrack Issues with Google Jules AI. When an issue requires architectural
 * or heavy technical discussion, moving it to "Consult AI" triggers this workflow.
 * It acts as an automated "Product Owner" proxy, initiating a Jules session with specific
 * personas (Security, UX, etc.) based on issue tags, facilitating rapid consultation.
 *
 * -------------------------------------------------------------------------------------
 * SETUP INSTRUCTIONS
 * -------------------------------------------------------------------------------------
 * 1. Open YouTrack & navigate to: Settings > Workflows.
 * 2. Create a new Workflow named "Jules Integration".
 * 3. Add a new module/rule inside it (e.g., "consult-jules").
 * 4. Paste the contents of this file into the editor.
 * 5. REQUIREMENTS:
 *    - Create username jules with attribute 'apikey' (password). Input API token.
 *    - Custom Field: Create a text field "Jules Session ID" in your project.
 *    - State: Ensure your project has a state named "Consult AI" (or update TARGET_STATE constants).
 *    - API Key: Retrieve your Jules API Key.
 *      - Option A (Hardcode): Replace `{{JULES_API_KEY}}` below with your key.
 *      - Option B (Secure): Use `ctx.globals` or YouTrack's secure variable feature if available.
 * 6. Attach this workflow to your project.
 * -------------------------------------------------------------------------------------
 */

const entities = require('@jetbrains/youtrack-scripting-api/entities');
const workflow = require('@jetbrains/youtrack-scripting-api/workflow');
const http = require('@jetbrains/youtrack-scripting-api/http');

// Configuration
const JULES_BASE_URL = 'https://jules.googleapis.com/v1alpha';
const TARGET_STATE = 'Shaping'; // State that triggers the automated session
const TARGET_SOURCE = 'sources/github/dappvibe/pexfi';
const TARGET_BRANCH = 'develop';

// Persona Definitions
const PERSONAS = {
  /*  'security': `You are a Chief Security Officer.
      Analyze the following request for potential security vulnerabilities.
      Focus on reentrancy, access control, and integer overflows.
      Be critical and prioritize safety over performance.`,*/

  /*  'ux': `You are a Lead Product Designer.
      Analyze the request from a User Experience perspective.
      Consider accessibility, ease of use, and visual consistency.
      Suggest improvements to the user flow.`,

    'performance': `You are a Performance Engineer.
      Analyze the request for potential bottlenecks.
      Suggest optimizations for gas usage (Solidity) or rendering steps (React).`,*/

  default: `You are a Senior Software Engineer.
    Your goal is to help refine this task, clarify requirements, and suggest implementation details.
    Write professional, concise, and technically accurate responses.`,
};

exports.rule = entities.Issue.onChange({
  title: 'Create session and save ID to field.',
  guard: (ctx) => {
    // Trigger when State changes to 'Consult AI' AND we don't already have a session
    return ctx.issue.fields.Stage.name === TARGET_STATE && !ctx.issue.fields['Jules Session'];
  },
  requirements: {
    ImportantPerson: {
      type: entities.User,
      login: 'jules',
    },
    julesSessionId: {
      type: entities.Field.stringType,
      name: 'Jules Session',
    },
    julesLastSync: {
      type: entities.Field.stringType,
      name: 'Jules Last Sync',
    },
  },
  action: (ctx) => {
    const julesUser = entities.User.findByLogin('jules');
    const apikey = julesUser.getAttribute('apikey');
    if (!apikey) {
      workflow.message('Jules API Key is missing. Set it "apikey" attribute of user "jules".');
      return;
    }

    const issue = ctx.issue;

    // 1. Select Persona based on Tags
    let selectedPersona = PERSONAS.default;
    let personaName = 'Default Engineer';

    if (issue.tags) {
      issue.tags.forEach((tag) => {
        const tagName = tag.name.toLowerCase();
        if (PERSONAS[tagName]) {
          selectedPersona = PERSONAS[tagName];
          personaName = tagName;
        }
      });
    }

    // 2. Prepare Session Payload
    // Combining Persona + Issue Context
    const sessionPrompt =
      `${selectedPersona}\n\n` +
      `CONTEXT FROM YOUTRACK ISSUE ${issue.id}:\n` +
      `Summary: ${issue.summary}\n` +
      `Description: ${issue.description || 'No description provided.'}`;

    const payload = {
      prompt: sessionPrompt,
      title: `${issue.id}: ${issue.summary}`,
      sourceContext: {
        source: TARGET_SOURCE,
        githubRepoContext: {
          startingBranch: TARGET_BRANCH,
        },
      },
      //requirePlanApproval: true,
      //automationMode: 'AUTO_CREATE_PR',
    };

    // 3. Call Jules API
    const connection = new http.Connection(JULES_BASE_URL, null, 20000);
    connection.addHeader('Content-Type', 'application/json');
    connection.addHeader('x-goog-api-key', apikey);

    try {
      const response = connection.postSync('/sessions', null, JSON.stringify(payload));

      if ((response && response.code === 201) || response.code === 200) {
        const sessionData = JSON.parse(response.response);
        const resourceName = sessionData.name; // "sessions/123..."
        const simpleId = resourceName.split('/').pop(); // "123..."
        const sessionUrl = sessionData.url;

        if (!simpleId) {
          workflow.message('Jules Session created but ID missing. Response: ' + response.response);
          return;
        }

        // 4. Update Issue Fields
        issue.fields['Jules Session'] = 'https://jules.google.com/session/' + simpleId;
        issue.fields['Jules Last Sync'] = new Date().getTime().toString();

        // 5. Post Comment
        const comment = `🤖 **Jules AI Session Started**\n` + `**Persona:** ${personaName}`;
        issue.addComment(comment, julesUser);

        workflow.message(`Jules Session created: ${simpleId}`);
      } else {
        const errorMsg = 'Jules API Error: ' + response.code + ' ' + response.response;
        workflow.message(errorMsg);
        console.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      workflow.message(`Failed to create Jules session: ${err}`);
    }
  },
});
