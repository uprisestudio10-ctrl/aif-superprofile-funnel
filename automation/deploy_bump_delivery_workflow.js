const N8N_URL = 'https://prateek.n8n.preetamsoni.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo';

const filterAndTemplateCode = `// 1. Retrieve webhook input triggers
const triggerData = $('Webhook Trigger').first().json.body || $('Webhook Trigger').first().json.query || $('Webhook Trigger').first().json || {};

const targetWorkshopDate = (triggerData.workshop_date || 'all').toLowerCase();
const recordingUrl = triggerData.recording_url || 'https://www.youtube.com/watch?v=7vdqzvzCzEs';
const promptsUrl = triggerData.prompts_url || 'https://live.prateekmayani.com/downloads/Kruti_Sharma_300_Prompts_Library.pdf';
const testMode = triggerData.test_mode === true || triggerData.test_mode === 'true';
const testEmail = triggerData.test_email || 'prateekmayanii@gmail.com';

const items = $input.all();
const output = [];
const seenEmails = new Set();

let bothCount = 0;
let recOnlyCount = 0;
let proOnlyCount = 0;

for (const item of items) {
  const row = item.json;
  const email = (row.Email || row.email || '').trim().toLowerCase();
  const name = (row.Name || row.name || 'there').trim();
  const wsDate = (row['Workshop Date'] || '').toLowerCase();

  // If specific workshop date requested (and not all), check date match if wsDate is populated
  if (targetWorkshopDate !== 'all' && wsDate && !wsDate.includes(targetWorkshopDate)) {
    continue;
  }

  if (!email || !email.includes('@') || seenEmails.has(email)) {
    continue;
  }

  const cleanAmt = parseInt(String(row.Amount).replace(/\\D/g, '')) || 0;

  // Guardrail: Skip course buyers (>= ₹900)
  if (cleanAmt >= 900) {
    continue;
  }
  
  // Bump verification:
  // 178: Ticket + Recording
  // 228: Ticket + Prompts
  // 248: Ticket + Combo (Recording + Prompts)
  // 377: Ticket + Recording + Prompts
  const isRec = row['Recording Purchased'] === 'YES' || [178, 248, 377, 677, 876].includes(cleanAmt);
  const isPro = row['Prompts Purchased'] === 'YES' || [228, 248, 377, 727, 876].includes(cleanAmt);

  // If neither bump was purchased, skip completely!
  if (!isRec && !isPro) {
    continue;
  }

  seenEmails.add(email);

  const recipientTarget = testMode ? testEmail : email;

  // Case 1: Both Recording & Prompts Purchased
  if (isRec && isPro) {
    bothCount++;
    output.push({
      json: {
        recipientEmail: recipientTarget,
        recipientName: name,
        bumpType: 'BOTH',
        emailSubject: '🎁 Your Workshop Replay + 300+ Prompts Vault [AI Influencer Workshop]',
        emailHtml: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>Thank you for attending the <strong>AI Influencer Workshop</strong> today!</p>

<p>Here are the replay recording and prompt resources you unlocked:</p>

<p style="margin: 16px 0 6px 0;"><strong>1. Workshop Replay Recording:</strong></p>
<p style="margin: 0 0 16px 0;">
  👉 <a href="\${recordingUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${recordingUrl}</a>
</p>

<p style="margin: 16px 0 6px 0;"><strong>2. 300+ Master Prompts Vault (PDF):</strong></p>
<p style="margin: 0 0 16px 0;">
  👉 <a href="\${promptsUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${promptsUrl}</a>
</p>

<p>We recommend opening the links on your laptop or desktop for the best learning experience.</p>

<p>If you have any questions or need anything, feel free to reply directly to this email.</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
AI Influencer Workshop</p>
</div>\`
      }
    });
  } 
  // Case 2: Recording Only Purchased
  else if (isRec && !isPro) {
    recOnlyCount++;
    output.push({
      json: {
        recipientEmail: recipientTarget,
        recipientName: name,
        bumpType: 'RECORDING_ONLY',
        emailSubject: '🎥 Your Workshop Replay: AI Influencer Workshop',
        emailHtml: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>Thank you for attending the <strong>AI Influencer Workshop</strong> today! Your session replay recording is now ready.</p>

<p style="margin: 16px 0 6px 0;"><strong>Workshop Replay Recording:</strong></p>
<p style="margin: 0 0 16px 0;">
  👉 <a href="\${recordingUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${recordingUrl}</a>
</p>

<p>We recommend opening the link on your laptop/desktop for the best learning experience.</p>

<p>If you have any questions, feel free to reply directly to this email.</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
AI Influencer Workshop</p>
</div>\`
      }
    });
  }
  // Case 3: Prompts Only Purchased
  else if (!isRec && isPro) {
    proOnlyCount++;
    output.push({
      json: {
        recipientEmail: recipientTarget,
        recipientName: name,
        bumpType: 'PROMPTS_ONLY',
        emailSubject: '⚡ Your 300+ AI Influencer Prompts Vault (PDF)',
        emailHtml: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>Thank you for purchasing the <strong>300+ Prompts Vault</strong> add-on with the AI Influencer Workshop!</p>

<p style="margin: 16px 0 6px 0;"><strong>300+ Master Prompts Vault (PDF):</strong></p>
<p style="margin: 0 0 16px 0;">
  👉 <a href="\${promptsUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${promptsUrl}</a>
</p>

<p>Simply copy the prompt formulas and test them on your characters.</p>

<p>If you have any questions, feel free to reply directly to this email.</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
AI Influencer Workshop</p>
</div>\`
      }
    });
  }

  // In test mode, only send 1 of each type to prevent inbox spam
  if (testMode && output.length >= 3) {
    break;
  }
}

return output;
`;

async function deploy() {
  console.log("Checking if bump delivery workflow exists...");
  const listRes = await fetch(`${N8N_URL}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const list = await listRes.json();
  const existing = list.data ? list.data.find(w => w.name.includes("Post-Workshop Bump Delivery")) : null;

  const workflowPayload = {
    name: "AI Influencer Workshop - Post-Workshop Bump Delivery (Recording & Prompts)",
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "deliver-workshop-bumps",
          responseMode: "onReceived",
          responseData: "allEntries",
          options: {}
        },
        name: "Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [200, 300],
        webhookId: "deliver-workshop-bumps"
      },
      {
        parameters: {
          operation: "read",
          documentId: {
            __rl: true,
            value: "1flbSez2txzFmW1jj7uMy7THzpJyvJtpvV3ZrASU5poc",
            mode: "id"
          },
          sheetName: {
            __rl: true,
            value: "gid=0",
            mode: "list"
          },
          options: {},
          authentication: "serviceAccount"
        },
        name: "Fetch Attendees from Google Sheet",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.5,
        position: [460, 300],
        credentials: {
          googleApi: {
            id: "SsEE517tRUiLR8pJ",
            name: "Google Sheets account"
          }
        }
      },
      {
        parameters: {
          jsCode: filterAndTemplateCode
        },
        name: "Filter and Prepare Bump Emails",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [720, 300]
      },
      {
        parameters: {
          fromEmail: "Prateek Mayani <workshop@prateekmayani.com>",
          toEmail: "={{ $json.recipientEmail }}",
          subject: "={{ $json.emailSubject }}",
          html: "={{ $json.emailHtml }}",
          options: {
            replyTo: "workshop@prateekmayani.com"
          }
        },
        name: "Send Bump Email via SMTP",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2.1,
        position: [980, 300],
        credentials: {
          smtp: {
            id: "RmJjbVmoKL0wS3Bl",
            name: "SMTP account"
          }
        }
      }
    ],
    connections: {
      "Webhook Trigger": {
        main: [[{ node: "Fetch Attendees from Google Sheet", type: "main", index: 0 }]]
      },
      "Fetch Attendees from Google Sheet": {
        main: [[{ node: "Filter and Prepare Bump Emails", type: "main", index: 0 }]]
      },
      "Filter and Prepare Bump Emails": {
        main: [[{ node: "Send Bump Email via SMTP", type: "main", index: 0 }]]
      }
    },
    settings: {
      executionOrder: "v1",
      saveDataSuccessExecution: "all",
      saveExecutionProgress: true
    }
  };

  let wfId = existing ? existing.id : null;
  if (existing) {
    console.log(`Updating existing workflow ${wfId}...`);
    const updateRes = await fetch(`${N8N_URL}/api/v1/workflows/${wfId}`, {
      method: "PUT",
      headers: {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(workflowPayload)
    });
    const updateData = await updateRes.json();
    console.log("Updated ID:", updateData.id);
  } else {
    console.log("Creating new bump delivery workflow...");
    const createRes = await fetch(`${N8N_URL}/api/v1/workflows`, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(workflowPayload)
    });
    const createData = await createRes.json();
    wfId = createData.id;
    console.log("Created workflow ID:", wfId);
  }

  console.log(`Activating workflow ${wfId}...`);
  const actRes = await fetch(`${N8N_URL}/api/v1/workflows/${wfId}/activate`, {
    method: "POST",
    headers: { "X-N8N-API-KEY": API_KEY }
  });
  const actData = await actRes.json();
  console.log("Workflow Active:", actData.active);

  console.log("\n✅ Production Webhook URL: https://prateek.n8n.preetamsoni.com/webhook/deliver-workshop-bumps");
}

deploy().catch(console.error);
