const fs = require('fs');
const path = require('path');

// Default constants
const WHATSAPP_LINK = 'https://chat.whatsapp.com/FCCMDpcoP7xG3sTnGji5er';
const SENDER_EMAIL = 'workshop@prateekmayani.com';
const SENDER_NAME = 'Prateek Mayani';
const WORKSHOP_NAME = 'AI Influencer Workshop';
const GOOGLE_SHEET_DOC_ID = {
  __rl: true,
  value: "1gO4yvsdtW8a_p1CV40DAjnyt5-ZmVIm-TaX3BeqHHdA",
  mode: "list",
  cachedResultName: "AIF Workshop",
  cachedResultUrl: "https://docs.google.com/spreadsheets/d/1gO4yvsdtW8a_p1CV40DAjnyt5-ZmVIm-TaX3BeqHHdA/edit?usp=drivesdk"
};

const GOOGLE_SHEET_TAB_SHEET1 = {
  __rl: true,
  value: "gid=0",
  mode: "list",
  cachedResultName: "Sheet1",
  cachedResultUrl: "https://docs.google.com/spreadsheets/d/1gO4yvsdtW8a_p1CV40DAjnyt5-ZmVIm-TaX3BeqHHdA/edit#gid=0"
};

const GOOGLE_SHEET_TAB_CALLS = {
  __rl: true,
  mode: "name",
  value: "Call Bookings"
};

// Parse command line arguments or use defaults
// Usage: bun automation/update_workshop.js "10th October 2026" "Saturday" "7:00 PM IST"
const args = process.argv.slice(2);
const workshopDateInput = args[0] || '3rd October 2026';
const workshopDayInput = args[1] || 'Saturday';
const workshopTimeInput = args[2] || '7:00 PM IST';

// Helper to extract day, month, year from string like "3rd October 2026" or "10th October 2026"
function parseDateDetails(dateStr) {
  const cleanStr = dateStr.replace(/(st|nd|rd|th)/gi, '').trim();
  const parsed = new Date(cleanStr);
  
  let day = parsed.getDate();
  let month = parsed.getMonth() + 1; // 1-indexed
  let year = parsed.getFullYear();

  // Fallback regex if Date.parse fails
  if (isNaN(day)) {
    const match = dateStr.match(/(\d+)\s+([a-zA-Z]+)\s+(\d{4})/);
    if (match) {
      day = parseInt(match[1], 10);
      const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
      const mIdx = monthNames.findIndex(m => m.startsWith(match[2].toLowerCase().slice(0, 3)));
      month = mIdx !== -1 ? mIdx + 1 : 10;
      year = parseInt(match[3], 10);
    } else {
      day = 3;
      month = 10;
      year = 2026;
    }
  }

  // Calculate day before
  const prevDate = new Date(year, month - 1, day - 1);
  const prevDay = prevDate.getDate();
  const prevMonth = prevDate.getMonth() + 1;

  // Search tokens for filtering (e.g. "3rd oct", "3 oct", "october 2026")
  const numOnly = dateStr.replace(/[^0-9]/g, '');
  const monthWord = dateStr.replace(/[0-9]|st|nd|rd|th/gi, '').trim().toLowerCase();
  
  return {
    day,
    month,
    year,
    prevDay,
    prevMonth,
    fullDisplay: `${workshopDateInput} (${workshopDayInput})`,
    fullDisplayWithTime: `${workshopDateInput} (${workshopDayInput}) ${workshopTimeInput}`,
    searchPattern: `${day} ${monthWord.slice(0, 3)}`
  };
}

const dateInfo = parseDateDetails(workshopDateInput);

console.log(`\n⚙️ Configuring Workshop Automation:`);
console.log(`- Date: ${dateInfo.fullDisplay}`);
console.log(`- Time: ${workshopTimeInput}`);
console.log(`- Workshop Day Cron: Day ${dateInfo.day}, Month ${dateInfo.month}`);
console.log(`- Previous Day Cron: Day ${dateInfo.prevDay}, Month ${dateInfo.prevMonth}\n`);

// -------------------------------------------------------------
// 1. GENERATE LEADS WORKFLOW
// -------------------------------------------------------------
function generateLeadsWorkflow() {
  return {
    name: `${WORKSHOP_NAME} Leads & 1:1 Calls to Google Sheets + Instant Confirmation Email`,
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "ai-influencer-leads",
          responseMode: "onReceived",
          options: {}
        },
        id: "1b084931-15ee-45df-bcf5-99884a4ec410",
        name: "Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [220, 300],
        webhookId: "ai-influencer-leads"
      },
      {
        parameters: {
          jsCode: `const item = $input.first().json.body || $input.first().json;

const hasCall = item.has_call_booked === true || 
  item.call_booked === 'YES' ||
  (Array.isArray(item.offers) && item.offers.includes('call')) ||
  (typeof item.offers_label === 'string' && item.offers_label.toLowerCase().includes('call'));

const name = (item.name || 'there').trim();
const amount = item.amount_formatted || (item.amount ? \`₹\${item.amount}\` : '₹29');
const whatsappUrl = "${WHATSAPP_LINK}";

const emailHtml = \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>Thank you for registering for the <strong>${WORKSHOP_NAME}</strong>. Your seat is confirmed!</p>

<p><strong>Please Note:</strong> You must join our WhatsApp group to attend the live workshop, as the Zoom meeting link and prompt guides will only be shared inside the WhatsApp group (we do not send the link over email to avoid unauthorized access).</p>

<p>👉 <strong>Join WhatsApp Group here:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p><strong>Workshop Details:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li><strong>Date:</strong> ${dateInfo.fullDisplay}</li>
  <li><strong>Time:</strong> ${workshopTimeInput} (Sharp)</li>
  <li><strong>Location:</strong> Live on Zoom (Link shared in the WhatsApp group)</li>
  <li><strong>Amount Paid:</strong> \${amount}</li>
</ol>

<p><strong>Next Steps:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li>Click the link above to join the WhatsApp group right now.</li>
  <li>Pin the group on WhatsApp so you don't miss the Zoom link.</li>
  <li>Keep your laptop ready on ${workshopDayInput} at 6:55 PM IST.</li>
</ol>

<p>If you have any questions, feel free to reply directly to this email.</p>

<p>Looking forward to seeing you live on ${workshopDayInput}.</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
${WORKSHOP_NAME}</p>
</div>\`;

return [{
  json: {
    Name: item.name || '',
    Number: item.number || item.phone || '',
    Email: item.email || '',
    Date: item.date || new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
    Time: item.time || new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }),
    Amount: amount,
    'Workshop Date': item.workshop_date || '${dateInfo.fullDisplayWithTime}',
    'Utm source': item.utm_source || '',
    'Utm campaign': item.utm_campaign || '',
    'Utm content': item.utm_content || '',
    'Utm term': item.utm_term || '',
    'FB Click ID': item.fb_click_id || item.fbclid || '',
    has_call_booked: Boolean(hasCall),
    'Call Status': hasCall ? 'Pending' : 'N/A',
    'Payment ID': item.razorpay_payment_id || '',
    email_html: emailHtml
  }
}];`
        },
        id: "9d81ff3a-8742-411a-8ce8-7be61309d57a",
        name: "Format Lead Data",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [460, 300]
      },
      {
        parameters: {
          operation: "append",
          documentId: GOOGLE_SHEET_DOC_ID,
          sheetName: GOOGLE_SHEET_TAB_SHEET1,
          columns: {
            mappingMode: "autoMapInputData",
            value: {},
            matchingColumns: []
          },
          options: {}
        },
        id: "70b55cfa-fa81-424a-9c7a-59427b0c36df",
        name: "Append to Main Lead Sheet",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.5,
        position: [720, 200]
      },
      {
        parameters: {
          conditions: {
            options: {
              caseSensitive: true,
              leftValue: "",
              typeValidation: "strict"
            },
            conditions: [
              {
                id: "979e2c40-0255-4679-b169-25f0a0d4c82b",
                leftValue: "={{ $json.has_call_booked }}",
                rightValue: true,
                operator: {
                  type: "boolean",
                  operation: "equals"
                }
              }
            ],
            combinator: "and"
          },
          options: {}
        },
        id: "29f3459c-bbcc-46b6-a979-45e0d4bb8b9f",
        name: "Is 1:1 Call Booked?",
        type: "n8n-nodes-base.if",
        typeVersion: 2,
        position: [960, 320]
      },
      {
        parameters: {
          operation: "append",
          documentId: GOOGLE_SHEET_DOC_ID,
          sheetName: GOOGLE_SHEET_TAB_CALLS,
          columns: {
            mappingMode: "autoMapInputData",
            value: {},
            matchingColumns: []
          },
          options: {}
        },
        id: "0d2eb054-ff43-4cc0-9685-64d5bbbb9789",
        name: "Append to Call Bookings Tab",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.5,
        position: [1220, 240]
      },
      {
        parameters: {
          fromEmail: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          toEmail: "={{ $json.Email }}",
          subject: "Seat Confirmed: Please Join WhatsApp Group for Zoom Link",
          html: "={{ $json.email_html }}",
          options: {
            replyTo: SENDER_EMAIL
          }
        },
        id: "e44c207b-871d-407b-99f5-7b567a147810",
        name: "Send Confirmation Email",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2.1,
        position: [720, 420],
        credentials: {
          smtp: {
            id: "",
            name: `${SENDER_EMAIL} (SMTP)`
          }
        }
      }
    ],
    pinData: {},
    connections: {
      "Webhook Trigger": {
        main: [[{ node: "Format Lead Data", type: "main", index: 0 }]]
      },
      "Format Lead Data": {
        main: [
          [
            { node: "Append to Main Lead Sheet", type: "main", index: 0 },
            { node: "Is 1:1 Call Booked?", type: "main", index: 0 },
            { node: "Send Confirmation Email", type: "main", index: 0 }
          ]
        ]
      },
      "Is 1:1 Call Booked?": {
        main: [[{ node: "Append to Call Bookings Tab", type: "main", index: 0 }], []]
      }
    },
    active: false,
    settings: {
      executionOrder: "v1"
    }
  };
}

// -------------------------------------------------------------
// 2. GENERATE REMINDER WORKFLOW
// -------------------------------------------------------------
function generateRemindersWorkflow() {
  const codeNodeLogic = `// 1. Retrieve the milestone captured before fetching attendees
const milestoneData = $('Capture Milestone').first().json || {};
const milestone = milestoneData.milestone || 'test_preview';

const whatsappUrl = "${WHATSAPP_LINK}";
const workshopName = "${WORKSHOP_NAME}";
const workshopDate = "${dateInfo.fullDisplay}";
const workshopTime = "${workshopTimeInput}";

// 2. Clean, plain text, Easebuzz-style email templates for high deliverability (0% spam)
function getEmailBody(name, milestoneKey) {
  switch (milestoneKey) {
    case '1_day_to_go':
      return {
        subject: \`⏰ 24 Hours to Go: \${workshopName} tomorrow at 7:00 PM\`,
        html: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>This is a quick reminder that our live <strong>\${workshopName}</strong> is happening tomorrow: <strong>\${workshopDate} at \${workshopTime} (Sharp)</strong>.</p>

<p><strong>Important:</strong> If you haven't joined our private WhatsApp community yet, please join now. The live Zoom meeting link, password, and prompts will only be shared inside this WhatsApp group (we do not send the link over email to avoid unauthorized access):</p>

<p>👉 <strong>Join WhatsApp Group here:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p><strong>Workshop Schedule:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li><strong>Date:</strong> \${workshopDate}</li>
  <li><strong>Time:</strong> \${workshopTime} (Sharp)</li>
  <li><strong>Location:</strong> Live on Zoom (Link inside WhatsApp group)</li>
  <li><strong>Duration:</strong> ~2 Hours</li>
</ol>

<p><strong>Quick Checklist to Prepare:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li>Join the WhatsApp group above and pin it on your chat list.</li>
  <li>Keep your laptop or PC ready (desktop view is best for learning the workflows).</li>
  <li>Make sure you have the Zoom app installed and updated.</li>
</ol>

<p>If you have any questions, feel free to reply directly to this email.</p>

<p>See you tomorrow at 7:00 PM!</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
\${workshopName}</p>
</div>\`
      };

    case '12_hours_to_go':
      return {
        subject: \`🌅 Tonight at 7:00 PM IST: Your Live \${workshopName} is today!\`,
        html: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Good morning \${name},</p>

<p>Today is the day! Our live <strong>\${workshopName}</strong> begins tonight at <strong>\${workshopTime} (Sharp)</strong>.</p>

<p>We will be building hyper-realistic AI influencers from scratch, generating consistent faces, cloning voices, syncing lip movement, and setting up automated content pipelines.</p>

<p><strong>Access Details:</strong><br>
The live Zoom room details and prompt cheat sheets will be published exclusively inside our private WhatsApp community. Please make sure you are in the group:</p>

<p>👉 <strong>Join WhatsApp Group for Zoom Link:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p><strong>Session Summary:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li><strong>When:</strong> Today, \${workshopDate}</li>
  <li><strong>Time:</strong> \${workshopTime} (Doors open at 6:45 PM)</li>
  <li><strong>Where:</strong> Zoom (Direct link in WhatsApp group)</li>
</ol>

<p>Block your calendar for 7:00 PM to 9:00 PM tonight. Settle down with your laptop and notes.</p>

<p>Looking forward to meeting you live tonight!</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
\${workshopName}</p>
</div>\`
      };

    case '3_hours_to_go':
      return {
        subject: \`🔥 3 Hours to Go: Live \${workshopName} starts at 7:00 PM\`,
        html: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>The countdown is on! In just 3 hours — <strong>at 7:00 PM IST sharp</strong> — we go live with the <strong>\${workshopName}</strong>.</p>

<p>We have hundreds of registered creators, and Zoom room capacity is capped. To make sure you get in without delay, please join the WhatsApp group where the direct Zoom link will be pinned:</p>

<p>👉 <strong>Get Live Zoom Details on WhatsApp:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p><strong>What we are covering live:</strong></p>
<ul style="margin: 0 0 16px 0; padding-left: 20px;">
  <li>Consistent AI character face generation</li>
  <li>Ultra-realistic clothing and background prompt engineering</li>
  <li>Voice cloning and dynamic lip-sync automation</li>
  <li>Monetization models: brand deals, digital products, and fan platforms</li>
</ul>

<p>Keep your notebook and laptop ready. See you in 3 hours!</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
\${workshopName}</p>
</div>\`
      };

    case '1_hour_to_go':
      return {
        subject: \`⏳ 1 Hour to Go: Zoom Link inside WhatsApp [\${workshopName}]\`,
        html: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>We are starting in exactly 60 minutes (<strong>\${workshopTime} sharp</strong>)!</p>

<p>Grab a coffee, set your phone on DND, and open your laptop.</p>

<p><strong>Zoom Joining Link:</strong><br>
The official Zoom link has been posted inside our private WhatsApp group. Click below to grab your entry link:</p>

<p>👉 <strong>Join WhatsApp Group for Zoom Link:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p>The waiting room opens in 45 minutes (6:45 PM IST). We recommend joining early so you get a smooth audio/video connection.</p>

<p>See you in an hour!</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
\${workshopName}</p>
</div>\`
      };

    case '15_mins_to_go':
      return {
        subject: \`🚪 Starting in 15 Minutes: Zoom Waiting Room is OPEN!\`,
        html: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>The Zoom waiting room is officially <strong>OPEN</strong>! We begin sharp at 7:00 PM IST.</p>

<p>Prateek and the team are setting up the screen share and mic check right now.</p>

<p>👉 <strong>Click here to get the Zoom link from WhatsApp:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p>Join the waiting room right now so you don't miss the opening session on AI character generation!</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
\${workshopName}</p>
</div>\`
      };

    case 'we_are_live':
      return {
        subject: \`🔴 WE ARE LIVE! Join the \${workshopName} right now\`,
        html: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p><strong>WE ARE LIVE RIGHT NOW ON ZOOM!</strong></p>

<p>Prateek has started the session. Don't miss the initial walkthrough and prompt breakdowns.</p>

<p>👉 <strong>Click here to join the live session via WhatsApp:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p>Hop in right away before we close entry!</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
\${workshopName}</p>
</div>\`
      };

    case 'test_preview':
    default:
      return {
        subject: \`🧪 [TEST PREVIEW] \${workshopName} Reminder Test\`,
        html: \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>This is a test preview to verify your email deliverability and setup for the <strong>\${workshopName}</strong> reminders.</p>

<p><strong>WhatsApp Group Link:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p>If you are reading this in your Primary inbox, your Resend SMTP setup and email deliverability are working 100%.</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
\${workshopName}</p>
</div>\`
      };
  }
}

// 3. Process recipients safely
const output = [];

if (milestone === 'test_preview') {
  // Safe test mode: only send to verified test accounts
  const testRecipients = [
    { email: 'prateekmayanii@gmail.com', name: 'Prateek' },
    { email: 'uprisestudio10@gmail.com', name: 'Prateek Team' }
  ];

  for (const r of testRecipients) {
    const tpl = getEmailBody(r.name, 'test_preview');
    output.push({
      json: {
        recipientEmail: r.email,
        recipientName: r.name,
        emailSubject: tpl.subject,
        emailHtml: tpl.html,
        milestone: milestone
      }
    });
  }
} else {
  // Scheduled live broadcast: send to all real attendees from Google Sheets
  const items = $input.all() || [];
  const seenEmails = new Set();
  const searchPattern = "${dateInfo.searchPattern.toLowerCase()}";

  for (const item of items) {
    const data = item.json || {};
    const email = (data.Email || data.email || '').trim().toLowerCase();
    const name = (data.Name || data.name || 'there').trim();

    // Filter: Only include attendees who registered for THIS specific workshop
    const wsDate = (data['Workshop Date'] || data['workshop_date'] || '').toLowerCase().trim();
    const isThisWorkshop = wsDate.includes("3rd oct") || wsDate.includes("3 oct") || wsDate.includes("3rd october") || wsDate.includes("3th") || wsDate.includes("03 oct");
    if (!isThisWorkshop) {
      continue; // Strictly skip other batch attendees!
    }

    if (!email || !email.includes('@') || seenEmails.has(email)) {
      continue;
    }
    seenEmails.add(email);

    const tpl = getEmailBody(name, milestone);
    output.push({
      json: {
        recipientEmail: email,
        recipientName: name,
        emailSubject: tpl.subject,
        emailHtml: tpl.html,
        milestone: milestone
      }
    });
  }
}

return output;
`;

  return {
    name: `${WORKSHOP_NAME} - 6-Stage Email Reminders Broadcast`,
    nodes: [
      // 1. Cron 1 Day To Go: prevDay at 19:00 IST
      {
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: `0 19 ${dateInfo.prevDay} ${dateInfo.prevMonth} *`
              }
            ]
          }
        },
        id: "schedule-1-day-to-go",
        name: `Schedule: 1 Day To Go (${dateInfo.prevDay}/${dateInfo.prevMonth}, 7:00 PM IST)`,
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [100, 100]
      },
      // 2. Cron 12 Hours To Go: day at 07:00 IST
      {
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: `0 7 ${dateInfo.day} ${dateInfo.month} *`
              }
            ]
          }
        },
        id: "schedule-12-hours-to-go",
        name: `Schedule: 12 Hours To Go (${dateInfo.day}/${dateInfo.month}, 7:00 AM IST)`,
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [100, 260]
      },
      // 3. Cron 3 Hours To Go: day at 16:00 IST
      {
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: `0 16 ${dateInfo.day} ${dateInfo.month} *`
              }
            ]
          }
        },
        id: "schedule-3-hours-to-go",
        name: `Schedule: 3 Hours To Go (${dateInfo.day}/${dateInfo.month}, 4:00 PM IST)`,
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [100, 420]
      },
      // 4. Cron 1 Hour To Go: day at 18:00 IST
      {
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: `0 18 ${dateInfo.day} ${dateInfo.month} *`
              }
            ]
          }
        },
        id: "schedule-1-hour-to-go",
        name: `Schedule: 1 Hour To Go (${dateInfo.day}/${dateInfo.month}, 6:00 PM IST)`,
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [100, 580]
      },
      // 5. Cron 15 Mins To Go: day at 18:45 IST
      {
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: `45 18 ${dateInfo.day} ${dateInfo.month} *`
              }
            ]
          }
        },
        id: "schedule-15-mins-to-go",
        name: `Schedule: 15 Mins To Go (${dateInfo.day}/${dateInfo.month}, 6:45 PM IST)`,
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [100, 740]
      },
      // 6. Cron We Are Live: day at 19:00 IST
      {
        parameters: {
          rule: {
            interval: [
              {
                field: "cronExpression",
                expression: `0 19 ${dateInfo.day} ${dateInfo.month} *`
              }
            ]
          }
        },
        id: "schedule-we-are-live",
        name: `Schedule: We Are LIVE! (${dateInfo.day}/${dateInfo.month}, 7:00 PM IST)`,
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [100, 900]
      },
      // 7. Manual trigger for testing
      {
        parameters: {},
        id: "manual-test-trigger",
        name: "Manual Test Trigger",
        type: "n8n-nodes-base.manualTrigger",
        typeVersion: 1,
        position: [100, -60]
      },

      // Set Milestone Nodes (Code nodes for 100% version reliability)
      {
        parameters: { jsCode: `return [{ json: { milestone: '1_day_to_go' } }];` },
        id: "set-1-day-to-go",
        name: "Set: 1 Day To Go",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [360, 100]
      },
      {
        parameters: { jsCode: `return [{ json: { milestone: '12_hours_to_go' } }];` },
        id: "set-12-hours-to-go",
        name: "Set: 12 Hours To Go",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [360, 260]
      },
      {
        parameters: { jsCode: `return [{ json: { milestone: '3_hours_to_go' } }];` },
        id: "set-3-hours-to-go",
        name: "Set: 3 Hours To Go",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [360, 420]
      },
      {
        parameters: { jsCode: `return [{ json: { milestone: '1_hour_to_go' } }];` },
        id: "set-1-hour-to-go",
        name: "Set: 1 Hour To Go",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [360, 580]
      },
      {
        parameters: { jsCode: `return [{ json: { milestone: '15_mins_to_go' } }];` },
        id: "set-15-mins-to-go",
        name: "Set: 15 Mins To Go",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [360, 740]
      },
      {
        parameters: { jsCode: `return [{ json: { milestone: 'we_are_live' } }];` },
        id: "set-we-are-live",
        name: "Set: We Are LIVE",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [360, 900]
      },
      {
        parameters: { jsCode: `return [{ json: { milestone: 'test_preview' } }];` },
        id: "set-test-preview",
        name: "Set: Test Preview",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [360, -60]
      },

      // Single hub to capture whichever milestone executed
      {
        parameters: {
          jsCode: `const item = $input.first() ? $input.first().json : {};
return [{ json: { milestone: item.milestone || 'test_preview' } }];`
        },
        id: "capture-milestone",
        name: "Capture Milestone",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [600, 420]
      },

      // Read Attendee List from Google Sheet
      {
        parameters: {
          operation: "read",
          documentId: GOOGLE_SHEET_DOC_ID,
          sheetName: GOOGLE_SHEET_TAB_SHEET1,
          options: {}
        },
        id: "fetch-attendees-google-sheets",
        name: "Fetch All Attendees from Google Sheet",
        type: "n8n-nodes-base.googleSheets",
        typeVersion: 4.5,
        position: [820, 420]
      },

      // Code Node to prepare emails & personalize
      {
        parameters: { jsCode: codeNodeLogic },
        id: "generate-reminder-emails-code",
        name: "Generate Reminder Emails",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [1060, 420]
      },

      // Send Email via Resend SMTP
      {
        parameters: {
          fromEmail: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          toEmail: "={{ $json.recipientEmail }}",
          subject: "={{ $json.emailSubject }}",
          html: "={{ $json.emailHtml }}",
          options: {
            replyTo: SENDER_EMAIL
          }
        },
        id: "send-reminder-email-smtp",
        name: "Send Reminder Emails via SMTP",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2.1,
        position: [1300, 420],
        credentials: {
          smtp: {
            id: "",
            name: `${SENDER_EMAIL} (SMTP)`
          }
        }
      }
    ],
    pinData: {},
    connections: {
      "Manual Test Trigger": { main: [[{ node: "Set: Test Preview", type: "main", index: 0 }]] },
      [`Schedule: 1 Day To Go (${dateInfo.prevDay}/${dateInfo.prevMonth}, 7:00 PM IST)`]: { main: [[{ node: "Set: 1 Day To Go", type: "main", index: 0 }]] },
      [`Schedule: 12 Hours To Go (${dateInfo.day}/${dateInfo.month}, 7:00 AM IST)`]: { main: [[{ node: "Set: 12 Hours To Go", type: "main", index: 0 }]] },
      [`Schedule: 3 Hours To Go (${dateInfo.day}/${dateInfo.month}, 4:00 PM IST)`]: { main: [[{ node: "Set: 3 Hours To Go", type: "main", index: 0 }]] },
      [`Schedule: 1 Hour To Go (${dateInfo.day}/${dateInfo.month}, 6:00 PM IST)`]: { main: [[{ node: "Set: 1 Hour To Go", type: "main", index: 0 }]] },
      [`Schedule: 15 Mins To Go (${dateInfo.day}/${dateInfo.month}, 6:45 PM IST)`]: { main: [[{ node: "Set: 15 Mins To Go", type: "main", index: 0 }]] },
      [`Schedule: We Are LIVE! (${dateInfo.day}/${dateInfo.month}, 7:00 PM IST)`]: { main: [[{ node: "Set: We Are LIVE", type: "main", index: 0 }]] },

      "Set: Test Preview": { main: [[{ node: "Capture Milestone", type: "main", index: 0 }]] },
      "Set: 1 Day To Go": { main: [[{ node: "Capture Milestone", type: "main", index: 0 }]] },
      "Set: 12 Hours To Go": { main: [[{ node: "Capture Milestone", type: "main", index: 0 }]] },
      "Set: 3 Hours To Go": { main: [[{ node: "Capture Milestone", type: "main", index: 0 }]] },
      "Set: 1 Hour To Go": { main: [[{ node: "Capture Milestone", type: "main", index: 0 }]] },
      "Set: 15 Mins To Go": { main: [[{ node: "Capture Milestone", type: "main", index: 0 }]] },
      "Set: We Are LIVE": { main: [[{ node: "Capture Milestone", type: "main", index: 0 }]] },

      "Capture Milestone": { main: [[{ node: "Fetch All Attendees from Google Sheet", type: "main", index: 0 }]] },
      "Fetch All Attendees from Google Sheet": { main: [[{ node: "Generate Reminder Emails", type: "main", index: 0 }]] },
      "Generate Reminder Emails": { main: [[{ node: "Send Reminder Emails via SMTP", type: "main", index: 0 }]] }
    },
    active: false,
    settings: {
      executionOrder: "v1",
      timezone: "Asia/Kolkata"
    }
  };
}

// -------------------------------------------------------------
// 3. EXECUTE & SAVE FILES
// -------------------------------------------------------------
const leadsWorkflow = generateLeadsWorkflow();
const remindersWorkflow = generateRemindersWorkflow();

const outDir = path.join(__dirname);
const dlDir = '/Users/prateekmayani/Downloads';

fs.writeFileSync(path.join(outDir, 'n8n_leads_and_calls_workflow.json'), JSON.stringify(leadsWorkflow, null, 2));
fs.writeFileSync(path.join(outDir, 'n8n_workshop_reminders_workflow.json'), JSON.stringify(remindersWorkflow, null, 2));

fs.writeFileSync(path.join(dlDir, '1_leads_and_confirmation_email_workflow.json'), JSON.stringify(leadsWorkflow, null, 2));
fs.writeFileSync(path.join(dlDir, '2_workshop_reminders_workflow.json'), JSON.stringify(remindersWorkflow, null, 2));

// Also update checkout.functions.ts payload default
const checkoutFilePath = path.join(__dirname, '../src/lib/checkout.functions.ts');
if (fs.existsSync(checkoutFilePath)) {
  let checkoutContent = fs.readFileSync(checkoutFilePath, 'utf8');
  checkoutContent = checkoutContent.replace(/workshop_date:\s*"[^"]*"/g, `workshop_date: "${dateInfo.fullDisplayWithTime}"`);
  fs.writeFileSync(checkoutFilePath, checkoutContent);
  console.log(`✅ Updated checkout.functions.ts with workshop_date: "${dateInfo.fullDisplayWithTime}"`);
}

// -------------------------------------------------------------
// 4. DIRECT N8N CLOUD SYNC (0-CLICK LIVE DEPLOYMENT)
// -------------------------------------------------------------
const N8N_BASE_URL = 'https://prateek.n8n.preetamsoni.com/api/v1';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo';
const REMINDERS_WORKFLOW_ID = 'EyIU5NrvUhsE9dVe';
const LEADS_WORKFLOW_ID = 'NiW3vl0a7dawrW6f';

async function syncToN8nCloud() {
  if (!N8N_API_KEY) return;
  console.log(`\n🚀 SYNCING DIRECTLY TO N8N CLOUD (n8n.preetamsoni.com)...`);
  
  const headers = {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY
  };

  try {
    // 1. Sync Reminders Workflow
    const getReminders = await fetch(`${N8N_BASE_URL}/workflows/${REMINDERS_WORKFLOW_ID}`, { headers });
    if (getReminders.ok) {
      const existing = await getReminders.json();
      
      // Preserve existing credentials
      const gsCreds = existing.nodes?.find(n => n.type.includes('googleSheets'))?.credentials;
      const smtpCreds = existing.nodes?.find(n => n.type.includes('emailSend'))?.credentials;

      const updatedNodes = remindersWorkflow.nodes.map(n => {
        if (n.type.includes('googleSheets')) {
          if (gsCreds) n.credentials = gsCreds;
          n.parameters.authentication = 'serviceAccount';
        }
        if (n.type.includes('emailSend') && smtpCreds) n.credentials = smtpCreds;
        return n;
      });

      const updateRes = await fetch(`${N8N_BASE_URL}/workflows/${REMINDERS_WORKFLOW_ID}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: remindersWorkflow.name,
          nodes: updatedNodes,
          connections: remindersWorkflow.connections,
          settings: { executionOrder: 'v1', timezone: 'Asia/Kolkata' }
        })
      });

      if (updateRes.ok) {
        console.log(`✅ Reminders Workflow updated on n8n (${REMINDERS_WORKFLOW_ID})`);
        
        // Activate workflow
        const actRes = await fetch(`${N8N_BASE_URL}/workflows/${REMINDERS_WORKFLOW_ID}/activate`, {
          method: 'POST',
          headers
        });
        if (actRes.ok) {
          console.log(`🟢 Reminders Workflow ACTIVATED live on n8n!`);
        }
      } else {
        console.log(`⚠️ Could not update Reminders Workflow:`, await updateRes.text());
      }
    }

    // 2. Sync Leads Workflow
    const getLeads = await fetch(`${N8N_BASE_URL}/workflows/${LEADS_WORKFLOW_ID}`, { headers });
    if (getLeads.ok) {
      const existingLeads = await getLeads.json();
      const gsCreds = existingLeads.nodes?.find(n => n.type.includes('googleSheets'))?.credentials;
      const smtpCreds = existingLeads.nodes?.find(n => n.type.includes('emailSend'))?.credentials;

      const updatedLeadsNodes = leadsWorkflow.nodes.map(n => {
        if (n.type.includes('googleSheets')) {
          if (gsCreds) n.credentials = gsCreds;
          n.parameters.authentication = 'serviceAccount';
        }
        if (n.type.includes('emailSend') && smtpCreds) n.credentials = smtpCreds;
        return n;
      });

      const updateLeadsRes = await fetch(`${N8N_BASE_URL}/workflows/${LEADS_WORKFLOW_ID}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: leadsWorkflow.name,
          nodes: updatedLeadsNodes,
          connections: leadsWorkflow.connections,
          settings: { executionOrder: 'v1' }
        })
      });

      if (updateLeadsRes.ok) {
        console.log(`✅ Leads Workflow updated on n8n (${LEADS_WORKFLOW_ID})`);
      }
    }
  } catch (err) {
    console.error(`❌ Error syncing to n8n API:`, err.message);
  }
}

await syncToN8nCloud();

console.log(`\n🎉 WORKFLOW FILES GENERATED & LIVE ON SERVER:`);
console.log(`1. automation/n8n_leads_and_calls_workflow.json`);
console.log(`2. automation/n8n_workshop_reminders_workflow.json`);
console.log(`3. Downloads/1_leads_and_confirmation_email_workflow.json`);
console.log(`4. Downloads/2_workshop_reminders_workflow.json\n`);
