// Script to deploy the standalone Failed & Abandoned Checkout Recovery workflow in n8n
const N8N_URL = 'https://prateek.n8n.preetamsoni.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo';

const recoveryLogicCode = `const raw = $('Webhook Trigger').first().json.body || $('Webhook Trigger').first().json.query || $('Webhook Trigger').first().json || {};

// 1. Extract payment entity from Razorpay payload or direct payload
let p = {};
let notes = {};
if (raw.payload && raw.payload.payment) {
  p = raw.payload.payment.entity || {};
  notes = p.notes || {};
} else {
  p = raw;
  notes = raw.notes || {};
}

const isTest = raw.test_mode === true || raw.test_mode === 'true';
const eventType = raw.event || (isTest ? 'payment.failed' : '');

// Safety 1: Only trigger on failed payments (or direct test trigger)
if (eventType !== 'payment.failed' && !isTest) {
  return [];
}

const rawAmount = p.amount ? Math.round(p.amount / 100) : (raw.amount ? parseInt(raw.amount, 10) : 29);

// Safety 2: Pure Amount Guard — Only recover workshop checkouts (< ₹2,000)
if (rawAmount >= 2000) {
  return []; // Skip high-ticket course purchases
}

const email = (notes.email || p.email || raw.email || '').trim().toLowerCase();
const name = (notes.name || notes.buyer_name || p.name || raw.name || 'there').trim();
const rawPhone = notes.phone || notes.contact || p.contact || raw.phone || '';
const cleanPhone = String(rawPhone).replace(/\\D/g, '').slice(-10);

if (!email || !email.includes('@')) {
  return [];
}

// Safety 3: Check if customer ALREADY paid successfully in Google Sheet
const sheetAttendees = $input.all() || [];
const alreadyPaid = sheetAttendees.some(item => {
  const rowEmail = (item.json.Email || item.json.email || '').trim().toLowerCase();
  return rowEmail === email;
});

if (alreadyPaid && !isTest) {
  // Customer already completed their registration on another attempt — do not send!
  return [];
}

// Safety 4: Deduplication cooldown (Don't spam if customer fails multiple times in 24h)
try {
  const staticData = $getWorkflowStaticData('global');
  staticData.sentMap = staticData.sentMap || {};
  const now = Date.now();
  const lastSent = staticData.sentMap[email];
  
  if (lastSent && (now - lastSent < 24 * 60 * 60 * 1000) && !isTest) {
    return []; // Already sent recovery email in the last 24 hours
  }
  
  staticData.sentMap[email] = now;
} catch (e) {
  // safe fallback
}

// Option 1: 1-Click Smart Pre-fill Link
const prefillUrl = \`https://aifworkshop.prateekmayani.com/checkout?name=\${encodeURIComponent(name)}&email=\${encodeURIComponent(email)}&phone=\${encodeURIComponent(cleanPhone)}\`;

const emailSubject = "did your payment go through?";

const emailText = \`Hey \${name},

Saw that your payment didn't go through just now on the checkout.

Wanted to check if you ran into any issue?

In the workshop, we're going to cover the complete AI influencer funnel — generating bold images without restrictions, and scaling to 6 figures using just your mobile phone and completely free tools (no paid software needed).

If you still want to join, here is your direct link to complete your Rs 29 registration:
\${prefillUrl}

(If money already got deducted from your bank, just reply to this email with the screenshot and I'll confirm your seat manually).

Best,
Prateek Mayani\`;

const emailHtml = \`<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #222222;">
<p>Hey \${name},</p>

<p>Saw that your payment didn't go through just now on the checkout.</p>

<p>Wanted to check if you ran into any issue?</p>

<p>In the workshop, we're going to cover the complete AI influencer funnel — generating bold images without restrictions, and scaling to 6 figures using just your mobile phone and completely free tools (no paid software needed).</p>

<p>If you still want to join, here is your direct link to complete your Rs 29 registration:<br>
<a href="\${prefillUrl}" style="color: #0066cc; text-decoration: underline;">\${prefillUrl}</a></p>

<p style="font-size: 13px; color: #555555;">
  <em>(If money already got deducted from your bank, just reply to this email with the screenshot and I'll confirm your seat manually).</em>
</p>

<p>Best,<br>
Prateek Mayani</p>
</div>\`;

return [{
  json: {
    recipientEmail: email,
    recipientName: name,
    emailSubject: emailSubject,
    emailHtml: emailHtml,
    emailText: emailText,
    retryUrl: prefillUrl,
    amount: rawAmount
  }
}];
`;

async function deploy() {
  console.log("Checking if Failed Checkout Recovery workflow exists...");
  const listRes = await fetch(`${N8N_URL}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const list = await listRes.json();
  const existing = list.data ? list.data.find(w => w.name.includes("Failed & Abandoned Checkout Recovery")) : null;

  const workflowPayload = {
    name: "AI Influencer Workshop - Failed & Abandoned Checkout Recovery",
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "failed-checkout-recovery",
          responseMode: "onReceived",
          responseData: "allEntries",
          options: {}
        },
        name: "Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [200, 300],
        webhookId: "failed-checkout-recovery"
      },
      {
        parameters: {
          operation: "read",
          documentId: {
            __rl: true,
            value: "1gO4yvsdtW8a_p1CV40DAjnyt5-ZmVIm-TaX3BeqHHdA",
            mode: "list"
          },
          sheetName: {
            __rl: true,
            value: "gid=0",
            mode: "list"
          },
          options: {},
          authentication: "serviceAccount"
        },
        name: "Fetch Paid Attendees from Sheet1",
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
          jsCode: recoveryLogicCode
        },
        name: "Process Failed Payment & Check Already Paid",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [720, 300]
      },
      {
        parameters: {
          fromEmail: "Prateek Mayani <prateek@prateekmayani.com>",
          toEmail: "={{ $json.recipientEmail }}",
          subject: "={{ $json.emailSubject }}",
          html: "={{ $json.emailHtml }}",
          text: "={{ $json.emailText }}",
          options: {
            replyTo: "workshop@prateekmayani.com",
            appendAttribution: false
          }
        },
        name: "Send Recovery Email via SMTP",
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
        main: [[{ node: "Fetch Paid Attendees from Sheet1", type: "main", index: 0 }]]
      },
      "Fetch Paid Attendees from Sheet1": {
        main: [[{ node: "Process Failed Payment & Check Already Paid", type: "main", index: 0 }]]
      },
      "Process Failed Payment & Check Already Paid": {
        main: [[{ node: "Send Recovery Email via SMTP", type: "main", index: 0 }]]
      }
    },
    settings: {
      executionOrder: "v1"
    }
  };

  let wfId = existing ? existing.id : null;
  if (existing) {
    console.log(`Updating existing recovery workflow ${wfId}...`);
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
    console.log("Creating new recovery workflow...");
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
    console.log("Created recovery workflow ID:", wfId);
  }

  console.log(`Activating workflow ${wfId}...`);
  const actRes = await fetch(`${N8N_URL}/api/v1/workflows/${wfId}/activate`, {
    method: "POST",
    headers: { "X-N8N-API-KEY": API_KEY }
  });
  const actData = await actRes.json();
  console.log("Workflow Active:", actData.active);

  console.log("\n✅ Production Webhook URL: https://prateek.n8n.preetamsoni.com/webhook/failed-checkout-recovery");
}

deploy().catch(console.error);
