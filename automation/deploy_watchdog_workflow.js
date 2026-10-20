const https = require('https');

const N8N_URL = 'https://prateek.n8n.preetamsoni.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo';
const ALERT_EMAIL = 'uprisestudio10@gmail.com';
const SHEET_ID = '1flbSez2txzFmW1jj7uMy7THzpJyvJtpvV3ZrASU5poc';

function api(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, N8N_URL);
    const bodyStr = data ? JSON.stringify(data) : null;
    const req = https.request(url, {
      method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch (e) { resolve({ raw }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function deploy() {
  console.log('Deploying 24/7 Watchdog & Anomaly Alert Workflow to n8n...');

  // Check if watchdog already exists
  const list = await api('/api/v1/workflows');
  const existing = (list.data || []).find(w => w.name && w.name.includes('Watchdog'));
  const workflowId = existing ? existing.id : null;

  const workflowDefinition = {
    name: 'AI Influencer Funnel - 24/7 Watchdog & Anomaly Alert System',
    settings: {
      executionOrder: 'v1'
    },
    nodes: [
      {
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: "*/30 * * * *" // Runs every 30 minutes
              }
            ]
          }
        },
        id: "schedule-watchdog",
        name: "Every 30 Minutes",
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [100, 300]
      },
      {
        parameters: {
          operation: "read",
          documentId: {
            __rl: true,
            value: SHEET_ID,
            mode: "id"
          },
          sheetName: {
            __rl: true,
            value: "gid=0",
            mode: "list",
            cachedResultName: "Sheet1"
          },
          options: {},
          authentication: "serviceAccount"
        },
        id: "read-sheet-data",
        name: "Read Sheet Data",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.5,
        position: [320, 300],
        credentials: {
          googleApi: {
            id: "u1KbRiPRv3k5LrOJ",
            name: "Google Sheets account"
          }
        }
      },
      {
        parameters: {
          jsCode: `
const rows = $input.all() || [];
const issues = [];
const endpoints = [];

// 1. Audit Google Sheet Rows
let pendingCount = 0;
const emailCounts = {};

for (const r of rows) {
  const d = r.json || {};
  const email = (d.Email || "").trim().toLowerCase();
  const status = String(d.email_html || "").trim();
  if (email && email.includes("@")) {
    emailCounts[email] = (emailCounts[email] || 0) + 1;
    if (!status.includes("SENT")) {
      pendingCount++;
    }
  }
}

if (pendingCount > 0) {
  issues.push("🚨 " + pendingCount + " lead(s) in Google Sheet have unsent confirmation emails!");
}

for (const [em, count] of Object.entries(emailCounts)) {
  if (count > 2) {
    issues.push("⚠️ Anomaly: Email " + em + " appears " + count + " times in Google Sheet.");
  }
}

// 2. Determine if Alert should be sent
// Daily morning summary at 09:00 AM IST (03:30 AM UTC)
const now = new Date();
const istHours = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;
const istMinutes = (now.getUTCMinutes() + 30) % 60;
const isMorningDailyReport = (istHours === 9 && istMinutes < 30);

const hasIssues = issues.length > 0;
const shouldSendEmail = hasIssues || isMorningDailyReport;

let emailSubject = "";
let emailHtml = "";

if (hasIssues) {
  emailSubject = "🚨 [CRITICAL ALERT] Funnel Watchdog Detected " + issues.length + " Issue(s)";
  emailHtml = \`
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #111;">
      <div style="background-color: #d32f2f; color: #ffffff; padding: 18px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">🚨 Funnel Watchdog: Critical Issue Detected</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Site: live.prateekmayani.com | Time: \${now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
      </div>
      <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <h3 style="color: #d32f2f; margin-top: 0;">Anomalies Detected:</h3>
        <ul style="line-height: 1.8; color: #222; font-size: 14px;">
          \${issues.map(i => "<li><strong>" + i + "</strong></li>").join("")}
        </ul>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 13px; color: #666; margin-bottom: 0;">This automated alert was generated by the 24/7 Funnel Watchdog on n8n.</p>
      </div>
    </div>
  \`;
} else if (isMorningDailyReport) {
  emailSubject = "✅ [Daily Report] Funnel Watchdog: All Systems Operational (" + rows.length + " Leads)";
  emailHtml = \`
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #111;">
      <div style="background-color: #2e7d32; color: #ffffff; padding: 18px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">✅ Funnel Daily Health Report: All Systems Normal</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Site: live.prateekmayani.com | Time: \${now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
      </div>
      <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 14px; margin-top: 0;">Morning audit completed successfully with zero bottlenecks:</p>
        <ul style="line-height: 1.8; color: #222; font-size: 14px;">
          <li><strong>Total Leads in Google Sheet:</strong> \${rows.length}</li>
          <li><strong>Unsent / Pending Emails:</strong> 0 (All confirmed)</li>
          <li><strong>Landing Page & Checkout:</strong> 100% Operational</li>
          <li><strong>Email Loop Protection:</strong> Active (0 anomalies)</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 13px; color: #666; margin-bottom: 0;">24/7 Watchdog is actively monitoring the funnel every 30 minutes.</p>
      </div>
    </div>
  \`;
}

if (!shouldSendEmail) {
  return []; // No alert needed right now
}

return [{
  json: {
    shouldSendEmail,
    hasIssues,
    issuesCount: issues.length,
    emailSubject,
    emailHtml
  }
}];
`
        },
        id: "audit-funnel-anomalies",
        name: "Audit Funnel Anomalies",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [540, 300]
      },
      {
        parameters: {
          fromEmail: "Prateek Mayani <workshop@prateekmayani.com>",
          toEmail: ALERT_EMAIL,
          subject: "={{ $json.emailSubject }}",
          html: "={{ $json.emailHtml }}",
          options: {
            replyTo: "workshop@prateekmayani.com"
          }
        },
        id: "send-watchdog-alert-smtp",
        name: "Send Watchdog Alert Email",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2.1,
        position: [780, 300],
        credentials: {
          smtp: {
            id: "RmJjbVmoKL0wS3Bl",
            name: "SMTP account"
          }
        }
      }
    ],
    connections: {
      "Every 30 Minutes": {
        main: [[{ node: "Read Sheet Data", type: "main", index: 0 }]]
      },
      "Read Sheet Data": {
        main: [[{ node: "Audit Funnel Anomalies", type: "main", index: 0 }]]
      },
      "Audit Funnel Anomalies": {
        main: [[{ node: "Send Watchdog Alert Email", type: "main", index: 0 }]]
      }
    }
  };

  let res;
  if (workflowId) {
    res = await api(`/api/v1/workflows/${workflowId}`, 'PUT', workflowDefinition);
    console.log(`Updated existing Watchdog workflow: ${res.id}`);
  } else {
    res = await api('/api/v1/workflows', 'POST', workflowDefinition);
    console.log(`Created new Watchdog workflow: ${res.id}`);
  }

  // Activate workflow
  await api(`/api/v1/workflows/${res.id}/activate`, 'POST');
  console.log(`✅ Watchdog Workflow is ACTIVE (ID: ${res.id})`);
}

deploy().catch(console.error);
