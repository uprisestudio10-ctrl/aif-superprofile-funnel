const https = require('https');
const fs = require('fs');

const N8N_URL = 'https://prateek.n8n.preetamsoni.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo';

const WORKFLOW_ID = 'aGyJGiMZugFwweUk';
const SHEET_ID = '1flbSez2txzFmW1jj7uMy7THzpJyvJtpvV3ZrASU5poc';
const META_PIXEL_ID = '1462195472776524';
const META_CAPI_TOKEN = 'EAAPdKUgkm4kBSgzKwkk4rV6DJRRnd43XZC43C3te57GKcymIPyauf08aC9IWLB8MPY1sx856PcUfjoinZCuSJJSEdCquY8HXxQmwqou93euJhVfELhSIr0ZA1ZAA6ZCTmpKm35X2LG4cx6e8NkajwTAudBDqQSBIWPanQv02ULIpQAZBFZAfZCkItqpdojrlRQZDZD';
const WHATSAPP_URL = 'https://chat.whatsapp.com/G3asnvdznZY3a4Ystpo0wR?mode=gi_t';

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
  console.log(`Updating Sheet Auto-Listener workflow (${WORKFLOW_ID}) in n8n...`);

  const workflowDefinition = {
    name: 'AI Influencer - Google Sheet Auto-Listener (Superprofile to WhatsApp & CAPI)',
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
                expression: "* * * * *"
              }
            ]
          }
        },
        id: "schedule-poll-sheet",
        name: "Every 1 Minute",
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
        id: "fetch-rows-from-sheet",
        name: "Fetch Sheet Rows",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.5,
        position: [320, 300],
        credentials: {
          googleApi: {
            id: "SsEE517tRUiLR8pJ",
            name: "Google Sheets account"
          }
        }
      },
      {
        parameters: {
          jsCode: `function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value>>>amount) | (value<<(32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = "length";
  var i, j;
  var result = "";
  var words = [];
  var asciiBitLength = ascii[lengthProperty]*8;
  var hash = [];
  var k = [];
  var primeCounter = 0;

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
      k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
    }
  }

  ascii += "\\x80";
  while (ascii[lengthProperty]%64 - 56) ascii += "\\x00";
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j>>8) return;
    words[i>>2] |= j << ((3 - i)%4)*8;
  }
  words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
  words[words[lengthProperty]] = (asciiBitLength);

  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      var i2 = i + j;
      var w15 = w[i - 15], w2 = w[i - 2];
      var a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10))
          )|0
        );
      var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2)|0].concat(hash);
      hash[4] = (hash[4] + temp1)|0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i])|0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      var b = (hash[i]>>(j*8))&255;
      result += ((b < 16) ? 0 : "") + b.toString(16);
    }
  }
  return result;
}

const items = $input.all() || [];
const output = [];

const whatsappUrl = "${WHATSAPP_URL}";
const workshopName = "AI Influencer Workshop";
const workshopDate = "22nd October 2026 (Thursday)";
const workshopTime = "7:00 PM IST";

for (const item of items) {
  const d = item.json || {};
  const email = (d.Email || d.email || "").trim().toLowerCase();
  const name = (d.Name || d.name || "there").trim();
  const phone = String(d.Number || d.phone || d.number || "").replace(/\\D/g, "").slice(-10);
  const amount = d.Amount || d.amount || 29;
  const emailStatus = String(d.email_html || d.Email_Sent || "").trim();

  // If email is already sent, or row is completely empty, skip!
  if (!email || !email.includes("@") || email.includes("example.com") || emailStatus.includes("SENT")) {
    continue;
  }

  // Guardrail: Skip historical leads from previous workshops (16th Oct or earlier)
  const regDate = String(d["Date "] || d.Date || d["Workshop Date"] || "").toLowerCase();
  if (regDate.includes("2026-10-16") || regDate.includes("16 oct") || regDate.includes("15 oct") || regDate.includes("14 oct") || regDate.includes("13 oct")) {
    continue;
  }

  const amtNum = typeof amount === "number" ? amount : (parseInt(String(amount).replace(/\\D/g, "")) || 29);

  const emailHtml = \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>Thank you for registering for the <strong>\${workshopName}</strong>. Your seat is confirmed!</p>

<p><strong>Please Note:</strong> You must join our WhatsApp group to attend the live workshop, as the Zoom meeting link and prompt guides will only be shared inside the WhatsApp group (we do not send the link over email to avoid unauthorized access).</p>

<p>👉 <strong>Join WhatsApp Group here:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p><strong>Workshop Details:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li><strong>Date:</strong> \${workshopDate}</li>
  <li><strong>Time:</strong> \${workshopTime} (Sharp)</li>
  <li><strong>Location:</strong> Live on Zoom (Link shared in the WhatsApp group)</li>
  <li><strong>Amount Paid:</strong> ₹\${amtNum}</li>
</ol>

<p><strong>Next Steps:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li>Click the link above to join the WhatsApp group right now.</li>
  <li>Pin the group on WhatsApp so you don't miss the Zoom link.</li>
  <li>Keep your laptop ready on Thursday at 6:55 PM IST.</li>
</ol>

<div style="background-color: #fff9e6; border: 1px solid #ffe082; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 13px; color: #333333;">
  <p style="margin: 0 0 8px 0; font-weight: bold; color: #b78103; font-size: 14px;">⚠️ Important Delivery &amp; Support Guidelines:</p>
  <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
    <li><strong>Recording &amp; 300+ Prompts:</strong> If you purchased the Workshop Recording or Prompts Vault, they will be automatically delivered to this registered email within <strong>12 hours after the live workshop ends</strong>. Delivery is 100% automated, so please do not worry or panic.</li>
    <li><strong>Check Spam / Promotions:</strong> If you do not see our delivery email in your Primary Inbox, kindly check your <strong>Spam folder</strong> or <strong>Promotions tab</strong>.</li>
    <li><strong>1:1 Strategy Call:</strong> All 1-on-1 calls are conducted <strong>after the live workshop</strong>. Once the workshop ends, you can directly message the WhatsApp Group Admin to schedule your preferred 1:1 call slot.</li>
  </ul>
</div>

<p>If you have any questions, feel free to reply directly to this email.</p>

<p>Looking forward to seeing you live on Thursday.</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
\${workshopName}</p>
</div>\`;

  output.push({
    json: {
      Email: email,
      email_html: "CONFIRMATION_EMAIL_SENT",
      row_number: d.row_number,
      recipientName: name,
      recipientEmail: email,
      recipientPhone: phone,
      amount: amtNum,
      emailSubject: "Seat Confirmed: AI Influencer Workshop (22nd Oct, 7:00 PM)",
      emailHtml: emailHtml
    }
  });
}

return output;`
        },
        id: "filter-unprocessed-leads",
        name: "Filter Unprocessed Leads",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [540, 300]
      },
      {
        parameters: {
          fromEmail: "Prateek Mayani <workshop@prateekmayani.com>",
          toEmail: "={{ $('Filter Unprocessed Leads').item.json.recipientEmail }}",
          subject: "={{ $('Filter Unprocessed Leads').item.json.emailSubject }}",
          html: "={{ $('Filter Unprocessed Leads').item.json.emailHtml }}",
          options: {
            replyTo: "workshop@prateekmayani.com"
          }
        },
        id: "send-confirmation-smtp",
        name: "Send Confirmation Email",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2.1,
        position: [760, 200],
        credentials: {
          smtp: {
            id: "RmJjbVmoKL0wS3Bl",
            name: "SMTP account"
          }
        }
      },
      {
        parameters: {
          operation: "update",
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
          columns: {
            mappingMode: "defineBelow",
            matchingColumns: [
              "Email"
            ],
            value: {
              Email: "={{ $('Filter Unprocessed Leads').item.json.recipientEmail }}",
              email_html: "CONFIRMATION_EMAIL_SENT"
            }
          },
          options: {},
          authentication: "serviceAccount"
        },
        continueOnFail: true,
        id: "mark-email-sent-in-sheet",
        name: "Mark Email Sent in Sheet",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.5,
        position: [980, 200],
        credentials: {
          googleApi: {
            id: "SsEE517tRUiLR8pJ",
            name: "Google Sheets account"
          }
        }
      }
    ],
    connections: {
      "Every 1 Minute": {
        main: [[{ node: "Fetch Sheet Rows", type: "main", index: 0 }]]
      },
      "Fetch Sheet Rows": {
        main: [[{ node: "Filter Unprocessed Leads", type: "main", index: 0 }]]
      },
      "Filter Unprocessed Leads": {
        main: [[{ node: "Send Confirmation Email", type: "main", index: 0 }]]
      },
      "Send Confirmation Email": {
        main: [[{ node: "Mark Email Sent in Sheet", type: "main", index: 0 }]]
      }
    }
  };

  const updateRes = await api(`/api/v1/workflows/${WORKFLOW_ID}`, 'PUT', workflowDefinition);
  if (!updateRes.id) {
    console.error('Failed to update workflow:', updateRes);
    return;
  }

  console.log(`Updated workflow "${updateRes.name}" with ID: ${updateRes.id}`);

  // Re-activate workflow to ensure it's running
  await api(`/api/v1/workflows/${WORKFLOW_ID}/deactivate`, 'POST').catch(() => {});
  const activateRes = await api(`/api/v1/workflows/${WORKFLOW_ID}/activate`, 'POST');
  console.log(`Workflow reactivated:`, activateRes);
}

deploy().catch(console.error);
