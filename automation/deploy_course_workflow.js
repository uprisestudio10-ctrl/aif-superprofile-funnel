// Script to build and deploy the enhanced Course Enrollment Automation workflow in n8n
// Features:
// 1. Matches buyer mobile number against Workshop Sheet1 to automatically extract original email
// 2. If email is void@razorpay.com or not found in sheet, dispatches an instant Action-Required alert to Admin (prateekmayanii@gmail.com)
// 3. Delivers course portal link + bonuses to verified student email
// 4. Appends to 'Course Buyers' tab with full audit trail & device lock authorization

const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo";
const baseUrl = "https://prateek.n8n.preetamsoni.com/api/v1";

const SHEET_ID = "1flbSez2txzFmW1jj7uMy7THzpJyvJtpvV3ZrASU5poc";

// 1. Filter and Parse Node Code
const parsePaymentCode = `const raw = $input.first().json.body || $input.first().json;

let item = raw;

// Event safety check: Only process successful captured payments
if (raw.event && raw.event !== 'payment.captured' && raw.event !== 'order.paid') {
  return [];
}

// Handle direct Razorpay Webhook format if sent from Razorpay Dashboard
if ((raw.event === 'payment.captured' || raw.event === 'order.paid') && raw.payload) {
  const p = raw.payload.payment ? raw.payload.payment.entity : (raw.payload.order ? raw.payload.order.entity : {});
  const notes = p.notes || {};
  const cleanPhone = (notes.phone || notes.contact || p.contact || '').replace(/\\D/g, '').slice(-10);
  const amtNum = p.amount ? Math.round(p.amount / 100) : 2999;
  const cleanEmail = (raw.email || raw.incoming_email || notes.email || p.email || '').trim().toLowerCase();
  const payerName = raw.name || notes.name || notes.buyer_name || notes.Name || notes['Full Name'] || notes.payer_name || notes.customer_name || p.name || '';
  const commentName = (notes.comment && typeof notes.comment === 'string' && notes.comment.length > 2 && !notes.comment.includes('@') && isNaN(Number(notes.comment))) ? notes.comment.trim() : '';
  const finalName = payerName || commentName || 'Student';

  item = {
    name: finalName,
    phone: cleanPhone,
    incoming_email: cleanEmail,
    amount: amtNum,
    description: p.description || '',
    razorpay_payment_id: p.id || '',
    razorpay_order_id: p.order_id || '',
    force_deliver: Boolean(raw.force_deliver || raw.force)
  };
}

// Pure Amount Filter: Course Purchases only (>= ₹900)
// Filter out workshop leads (< ₹900)
const parsedAmount = typeof item.amount === 'number' 
  ? item.amount 
  : parseInt(String(item.amount || '').replace(/\\D/g, ''), 10) || 0;

if (parsedAmount < 900) {
  return [];
}

const isToken = parsedAmount < 2499;
const remainingBalance = Math.max(0, 2499 - parsedAmount);
const phone = (item.phone || item.number || '').replace(/\\D/g, '').slice(-10);
const name = (item.name || 'Student').trim();
const incomingEmail = (item.incoming_email || item.email || '').trim().toLowerCase();
const paymentId = item.razorpay_payment_id || '';
const orderId = item.razorpay_order_id || '';
const amountFormatted = isToken 
  ? \`₹\${parsedAmount.toLocaleString('en-IN')} (Token - Balance ₹\${remainingBalance.toLocaleString('en-IN')} Pending)\` 
  : (parsedAmount > 0 ? ('₹' + parsedAmount.toLocaleString('en-IN')) : '₹2,499');

// Deduplication safeguard
try {
  const staticData = $getWorkflowStaticData('global');
  staticData.processedIds = staticData.processedIds || [];
  if (raw.force_deliver || item.force_deliver) {
    staticData.processedIds = staticData.processedIds.filter(id => id !== paymentId);
  } else if (paymentId && staticData.processedIds.includes(paymentId)) {
    return [];
  }
  if (paymentId && !staticData.processedIds.includes(paymentId)) {
    staticData.processedIds.push(paymentId);
    if (staticData.processedIds.length > 200) {
      staticData.processedIds.shift();
    }
  }
} catch (e) {
  // safe
}

const now = new Date();
const regDate = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
const regTime = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });

return [{
  json: {
    name,
    phone,
    incoming_email: incomingEmail,
    amount: parsedAmount,
    amount_formatted: amountFormatted,
    is_token: isToken,
    payment_id: paymentId,
    order_id: orderId,
    date: regDate,
    time: regTime,
    force_deliver: Boolean(raw.force_deliver || item.force_deliver)
  }
}];`;

// 2. Match Phone & Resolve Email Code
const matchAndResolveCode = `const payment = $('Filter & Parse Course Payment').first().json;
const attendees = $input.all().map(i => i.json);

const phoneToFind = payment.phone; // 10 digits
let matchedAttendee = null;

if (phoneToFind && phoneToFind.length === 10) {
  matchedAttendee = attendees.find(r => {
    const rPhone = String(r.Number || r.Phone || '').replace(/\\D/g, '').slice(-10);
    return rPhone === phoneToFind;
  });
}

// Fallback: If not matched by phone, check if incoming email matches Sheet1
const incomingEmailClean = String(payment.incoming_email || '').trim().toLowerCase();
if (!matchedAttendee && incomingEmailClean && incomingEmailClean.includes('@') && !incomingEmailClean.endsWith('@razorpay.com') && !incomingEmailClean.includes('void')) {
  matchedAttendee = attendees.find(r => String(r.Email || '').trim().toLowerCase() === incomingEmailClean);
}

let resolvedEmail = '';
let emailSource = '';

// Step 1: Check workshop registration Sheet1 for original email
if (matchedAttendee && matchedAttendee.Email) {
  const em = String(matchedAttendee.Email).trim().toLowerCase();
  if (em.includes('@') && !em.endsWith('@razorpay.com') && !em.includes('void')) {
    resolvedEmail = em;
    emailSource = 'WORKSHOP_SHEET';
  }
}

// Step 2: Fallback to incoming email from payment if not void@razorpay.com
if (!resolvedEmail && payment.incoming_email) {
  const em = String(payment.incoming_email).trim().toLowerCase();
  if (em.includes('@') && !em.endsWith('@razorpay.com') && !em.includes('void')) {
    resolvedEmail = em;
    emailSource = payment.force_deliver ? 'ADMIN_VERIFIED' : 'PAYMENT_PAYLOAD';
  }
}

// Verification Flags
const phoneProvided = Boolean(phoneToFind && phoneToFind.length === 10);
const phoneFoundInSheet = Boolean(phoneToFind && phoneToFind.length === 10 && attendees.some(r => String(r.Number || r.Phone || '').replace(/\\D/g, '').slice(-10) === phoneToFind));
const sheetMatched = Boolean(matchedAttendee);
const emailFound = Boolean(resolvedEmail);

// User rule: Verified if matched in sheet (phone or email) OR admin force_deliver AND email resolved
let verifiedInSheet = (sheetMatched || payment.force_deliver) && emailFound;

const studentName = matchedAttendee?.Name || payment.name || (resolvedEmail ? resolvedEmail.split('@')[0].toUpperCase() : 'Student');
const phone = payment.phone || '';
const parsedAmount = payment.amount;
const isToken = payment.is_token; // true if < 2499
const paymentId = payment.payment_id;
const regDate = payment.date;
const regTime = payment.time;
const remainingBalance = Math.max(0, 2499 - parsedAmount);

let amountFormatted = payment.amount_formatted;
if (isToken) {
  amountFormatted = \`₹\${parsedAmount.toLocaleString('en-IN')} (Token - Balance ₹\${remainingBalance.toLocaleString('en-IN')} Pending)\`;
} else {
  amountFormatted = \`₹\${parsedAmount.toLocaleString('en-IN')}\`;
}

let portalUrl = '';
let accessKey = '';
let accessStatus = '';
let studentEmailSubject = '';
let studentEmailHtml = '';

let adminEmailSubject = '';
let adminEmailHtml = '';

const revokedList = ['6262692120', '9202278929', 'golurawt455@gmail.com', '9870673209', 'teetunimash9870@gmail.com'];
const isRevoked = revokedList.includes(phone) || (resolvedEmail && revokedList.includes(resolvedEmail.toLowerCase()));

if (isRevoked) {
  // EXPLICITLY REVOKED / REFUNDED
  verifiedInSheet = false;
  accessStatus = 'REVOKED - Refund Processed';
  portalUrl = 'ACCESS_REVOKED (Refund Processed)';
  accessKey = 'REVOKED';
  adminEmailSubject = \`⚠️ NOTICE: Refunded Student Course Access Revoked - \${studentName} (+91 \${phone})\`;
  adminEmailHtml = \`<p>Course access for student <strong>\${studentName}</strong> (+91 \${phone}) is strictly revoked due to processed refund.</p>\`;
} else if (verifiedInSheet) {
  // Verified in Sheet1!
  if (isToken) {
    // ₹999 Token: Seat reserved, ACCESS LOCKED
    accessStatus = \`LOCKED - Token Paid (Balance ₹\${remainingBalance.toLocaleString('en-IN')} Pending)\`;
    accessKey = 'LOCKED_PENDING_FULL_PAYMENT';
    portalUrl = \`LOCKED (Complete remaining ₹\${remainingBalance.toLocaleString('en-IN')} to unlock)\`;

    studentEmailSubject = '🔒 Your Course Seat is Reserved (Token Received) - AI Influencer Mastery';
    studentEmailHtml = \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${studentName},</p>

<p>Your seat reservation token of <strong>₹\${parsedAmount.toLocaleString('en-IN')}</strong> for the <strong>AI Influencer Mastery Program</strong> has been successfully received! 🔒</p>

<p>Your special webinar discount price of <strong>₹2,499</strong> (Save ₹7,500) is now officially locked in your name.</p>

<div style="background-color: #fff9e6; border: 1px solid #ffe082; border-radius: 8px; padding: 14px; margin: 18px 0; font-size: 13px; color: #333333;">
  <p style="margin: 0 0 6px 0; font-weight: bold; color: #b78103; font-size: 14px;">⚠️ Important Notice Regarding Course Access:</p>
  <p style="margin: 0; line-height: 1.5;">Please note that full access to the video modules, secret prompt vaults, and student portal will be unlocked immediately once your remaining balance of <strong>₹\${remainingBalance.toLocaleString('en-IN')}</strong> is completed.</p>
</div>

<p><strong>Your Token Payment Summary:</strong></p>
<ul style="margin: 0 0 16px 0; padding-left: 20px;">
  <li><strong>Registered Student:</strong> \${studentName}</li>
  <li><strong>Mobile Number:</strong> +91 \${phone}</li>
  <li><strong>Registered Email:</strong> \${resolvedEmail}</li>
  <li><strong>Token Amount Paid:</strong> ₹\${parsedAmount.toLocaleString('en-IN')}</li>
  <li><strong>Remaining Balance:</strong> ₹\${remainingBalance.toLocaleString('en-IN')}</li>
  <li><strong>Access Status:</strong> <span style="color: #b78103; font-weight: bold;">Locked (Pending Full Payment)</span></li>
</ul>

<p><strong>Next Step to Unlock Instant Course Access:</strong><br>
To complete your remaining payment of ₹\${remainingBalance.toLocaleString('en-IN')} and unlock your course portal immediately, simply reply directly to this email or message us on WhatsApp.</p>

<p>We look forward to welcoming you inside the masterclass!</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
AI Influencer Mastery</p>
</div>\`;
  } else {
    // Full Payment (>= ₹2,499): UNLOCK ACCESS
    try {
      const staticData = $getWorkflowStaticData('global');
      staticData.authorizedBuyers = staticData.authorizedBuyers || [];
      if (phone && !staticData.authorizedBuyers.includes(phone)) {
        staticData.authorizedBuyers.push(phone);
      }
      if (resolvedEmail && !staticData.authorizedBuyers.includes(resolvedEmail)) {
        staticData.authorizedBuyers.push(resolvedEmail);
      }
    } catch (e) {}

    accessStatus = 'Active (Full Access)';
    const secretKey = 'rzp_live_ThPkZr13H5M66E_aif_mastery_secret_2026';
    try {
      const crypto = require('crypto');
      accessKey = crypto.createHmac('sha256', secretKey).update(resolvedEmail || phone).digest('hex').slice(0, 16);
    } catch (e) {
      let h = 0;
      const s = (resolvedEmail || phone) + ':' + secretKey;
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h) + s.charCodeAt(i);
        h |= 0;
      }
      accessKey = Math.abs(h).toString(16).padEnd(12, '0') + 'aif';
    }
    portalUrl = \`https://live.prateekmayani.com/portal?phone=\${phone}&email=\${encodeURIComponent(resolvedEmail)}&key=\${accessKey}\`;

    studentEmailSubject = '🎉 Your Course Access is Ready: Welcome to AI Influencer Mastery!';
    studentEmailHtml = \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${studentName},</p>

<p>Congratulations and welcome to the <strong>AI Influencer Mastery Program</strong>! 🚀</p>

<p>Your course enrollment has been successfully confirmed. You now have lifetime access to the complete video curriculum, instant workflows, prompt libraries, and monetization resources.</p>

<p style="margin: 18px 0 6px 0;"><strong>Your 1-Click Secured Access Link:</strong><br>
Click below to instantly unlock your private student portal (authorized strictly for your personal device):</p>

<p style="margin: 0 0 18px 0;">
  👉 <a href="\${portalUrl}" style="color: #0066cc; font-size: 15px; font-weight: bold; text-decoration: underline;">\${portalUrl}</a>
</p>

<p><strong>What is Unlocked Inside Your Portal:</strong></p>
<ul style="margin: 0 0 16px 0; padding-left: 20px;">
  <li><strong>10 Recorded Video Lessons:</strong> Complete step-by-step course curriculum streamed in high definition.</li>
  <li><strong>🎁 Bonus 1: Kruti Sharma - 300 Hot + Bold Photorealistic AI Image Prompts (PDF):</strong> 300 categorized prompt recipes for photorealistic AI influencers.</li>
  <li><strong>🎁 Bonus 2: AI Influencer Page References (PDF):</strong> Curated reference creator pages for research, positioning, and monetization.</li>
  <li><strong>🎁 Bonus 3: 8 Full Character Consistency Prompts (PDF):</strong> Multi-angle master consistency formulas across 8 poses.</li>
</ul>

<p><strong>Enrollment &amp; Security Summary:</strong></p>
<ul style="margin: 0 0 16px 0; padding-left: 20px;">
  <li><strong>Registered Student:</strong> \${studentName}</li>
  <li><strong>Mobile Number:</strong> +91 \${phone}</li>
  <li><strong>Registered Email:</strong> \${resolvedEmail}</li>
  <li><strong>Access Key:</strong> <code style="font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px;">\${accessKey}</code></li>
  <li><strong>Email Source:</strong> \${emailSource === 'WORKSHOP_SHEET' ? 'Verified from Workshop Registration' : 'Payment Information'}</li>
</ul>

<p><em>Security Notice: Your course access is cryptographically bound to your mobile number and locked to your personal device. To protect against link piracy, access on unauthorized devices is blocked.</em></p>

<p>If you encounter any questions while building your AI creator, simply reply directly to this email.</p>

<p>Excited to see what you create!</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
AI Influencer Mastery</p>
</div>\`;
  }
} else {
  // MISSING PHONE OR EMAIL IN SHEET: Alert Admin
  let reasonText = '';
  if (!phoneProvided) {
    reasonText = 'Payment checkout mein mobile number provide nahi kiya gaya tha.';
  } else if (!phoneFoundInSheet && !emailFound) {
    reasonText = \`Mobile number (+91 \${phone}) workshop lead sheet (Sheet1) mein nahi mila aur payment mein bhi email capture nahi hua.\`;
  } else if (!phoneFoundInSheet) {
    reasonText = \`Mobile number (+91 \${phone}) workshop lead sheet (Sheet1) mein nahi mila.\`;
  } else {
    reasonText = 'Mobile number sheet mein mila, lekin email address blank / missing hai.';
  }

  accessStatus = 'LOCKED - Verification Required';
  portalUrl = 'LOCKED (Admin action required)';
  accessKey = 'PENDING';

  adminEmailSubject = \`🚨 ACTION REQUIRED: Course Buyer Detail Missing - \${studentName} (+91 \${phone || 'No Phone'})\`;
  adminEmailHtml = \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
  <h2 style="color: #d9381e; margin-top: 0;">⚠️ Action Required: Course Buyer Detail Missing</h2>
  <p>Ek naya course enrollment payment receive hua hai, lekin student ka detail workshop lead sheet mein verify nahi ho paya.</p>
  
  <div style="background: #fdf2f2; border: 1.5px solid #f8b4b4; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 6px 0; font-weight: bold; width: 160px; color: #555;">Student Name:</td><td><strong style="font-size: 15px; color: #111;">\${studentName}</strong></td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Mobile Number:</td><td><strong style="font-size: 16px; color: #111;">+91 \${phone || 'Not Provided'}</strong></td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Amount Paid:</td><td><strong style="color: #0f8b44; font-size: 16px;">\${amountFormatted}</strong></td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Razorpay Payment ID:</td><td><code>\${paymentId}</code></td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Date &amp; Time:</td><td>\${regDate} at \${regTime}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Lookup Issue:</td><td><span style="color: #d9381e; font-weight: bold;">\${reasonText}</span></td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Course Access:</td><td><strong style="color: #d9381e;">LOCKED (Access not given)</strong></td></tr>
    </table>
  </div>

  <h3 style="color: #111; margin: 18px 0 8px 0;">👉 Admin Side Se Kya Required Hai:</h3>
  <ol style="margin: 0 0 18px 0; padding-left: 20px; line-height: 1.8;">
    <li><strong>Student se Email / Details confirm karein:</strong> Niche diye gaye WhatsApp button pe click karke direct student se baat karein aur unka registered email address maangein.</li>
    <li><strong>Workshop Sheet verify karein:</strong> Check karein kya student ne kisi doosre number ya email se workshop register kiya tha.</li>
    <li><strong>Access grant karein:</strong> Email milte hi Google Sheet ke <strong>Course Buyers</strong> tab mein unka email aur status update kar dein. (Agar ₹999 token hai to remaining ₹1,500 collect karne ke baad hi full access dein).</li>
  </ol>

  \${phone ? \`<p style="text-align: center; margin: 24px 0;">
    <a href="https://wa.me/91\${phone}?text=Hi%20\${encodeURIComponent(studentName)},%20thank%20you%20for%20enrolling%20in%20AI%20Influencer%20Mastery!%20Please%20reply%20with%20your%20registered%20email%20address%20so%20we%20can%20grant%20your%20course%20portal%20access." 
       style="background: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 15px;">
      👉 WhatsApp Student (+91 \${phone})
    </a>
  </p>\` : ''}

  <p style="font-size: 12px; color: #666;">Once email is collected and entered in 'Course Buyers' tab, their portal access will be active.</p>
</div>\`;
}

return [{
  json: {
    verified_in_sheet: verifiedInSheet,
    email_found: emailFound,
    phone_found_in_sheet: phoneFoundInSheet,
    student_name: studentName,
    student_phone: phone,
    student_email: resolvedEmail || 'PENDING_COLLECTION',
    student_email_subject: studentEmailSubject,
    student_email_html: studentEmailHtml,
    admin_email: 'uprisestudio10@gmail.com, prateekmayanii@gmail.com',
    admin_email_subject: adminEmailSubject,
    admin_email_html: adminEmailHtml,
    Date: regDate,
    Time: regTime,
    Name: studentName,
    Number: phone,
    Email: resolvedEmail || 'PENDING_COLLECTION',
    Amount: amountFormatted,
    'Payment ID': paymentId,
    'Access Status': accessStatus,
    'Login URL': portalUrl
  }
}];`;

// 3. Clean Columns code for Sheet
const cleanSheetColumnsCode = `const item = $input.first().json;
return [{
  json: {
    Date: item.Date,
    Time: item.Time,
    Name: item.Name,
    Number: item.Number,
    Email: item.Email,
    Amount: item.Amount,
    'Payment ID': item['Payment ID'],
    'Access Status': item['Access Status'],
    'Login URL': item['Login URL']
  }
}];`;

const workflowPayload = {
  name: "AI Influencer Mastery - Course Enrollment & Instant Access Delivery",
  nodes: [
    // -------------------------------------------------------------
    // PIPELINE A: PAYMENT ENROLLMENT & SMART EMAIL RESOLUTION
    // -------------------------------------------------------------
    {
      parameters: {
        httpMethod: "POST",
        path: "course-enrollment",
        options: {}
      },
      id: "course-webhook",
      name: "Course Webhook Trigger",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [100, 300],
      webhookId: "course-enrollment"
    },
    {
      parameters: {
        jsCode: parsePaymentCode
      },
      id: "course-parse",
      name: "Filter & Parse Course Payment",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [320, 300]
    },
    {
      parameters: {
        authentication: "serviceAccount",
        operation: "read",
        documentId: {
          __rl: true,
          value: SHEET_ID,
          mode: "id"
        },
        sheetName: {
          __rl: true,
          value: "gid=0",
          mode: "list"
        },
        options: {}
      },
      id: "fetch-workshop-attendees",
      name: "Fetch Workshop Attendees from Sheet1",
      type: "n8n-nodes-base.googleSheets",
      typeVersion: 4.5,
      position: [540, 300],
      credentials: {
        googleApi: {
          id: "u1KbRiPRv3k5LrOJ",
          name: "Google Sheets account"
        }
      }
    },
    {
      parameters: {
        jsCode: matchAndResolveCode
      },
      id: "match-resolve-node",
      name: "Match Phone & Resolve Email",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [760, 300]
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
              id: "condition-verified-check",
              leftValue: "={{ $json.verified_in_sheet }}",
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
      id: "check-email-found",
      name: "Is Verified in Sheet?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [980, 300]
    },
    // Branch 1: Email Found (True) -> Send Access to Student
    {
      parameters: {
        fromEmail: "Prateek Mayani <workshop@prateekmayani.com>",
        toEmail: "={{ $json.student_email }}",
        subject: "={{ $json.student_email_subject }}",
        html: "={{ $json.student_email_html }}",
        options: {}
      },
      id: "send-student-access",
      name: "Send Course Access Email to Student",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 2.1,
      position: [1220, 200],
      credentials: {
        smtp: {
          id: "lTsd4ouJn2s2HPNT",
          name: "SMTP account"
        }
      },
      continueOnFail: true
    },
    // Branch 2: Email Missing (False) -> Send Alert to Admin
    {
      parameters: {
        fromEmail: "Prateek Mayani <workshop@prateekmayani.com>",
        toEmail: "uprisestudio10@gmail.com, prateekmayanii@gmail.com",
        subject: "={{ $json.admin_email_subject }}",
        html: "={{ $json.admin_email_html }}",
        options: {}
      },
      id: "send-admin-alert",
      name: "Send Admin Pending Email Alert",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 2.1,
      position: [1220, 420],
      credentials: {
        smtp: {
          id: "lTsd4ouJn2s2HPNT",
          name: "SMTP account"
        }
      },
      continueOnFail: true
    },
    // Clean Columns Node
    {
      parameters: {
        jsCode: cleanSheetColumnsCode
      },
      id: "clean-sheet-columns",
      name: "Prepare Clean Sheet Columns",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1460, 300]
    },
    // Append to Course Buyers Sheet
    {
      parameters: {
        authentication: "serviceAccount",
        operation: "append",
        documentId: {
          __rl: true,
          value: SHEET_ID,
          mode: "id"
        },
        sheetName: {
          __rl: true,
          value: "Course Buyers",
          mode: "name"
        },
        columns: {
          mappingMode: "autoMapInputData",
          value: {}
        },
        options: {}
      },
      id: "append-course-buyers",
      name: "Append to Course Buyers Sheet",
      type: "n8n-nodes-base.googleSheets",
      typeVersion: 4.5,
      position: [1680, 300],
      credentials: {
        googleApi: {
          id: "u1KbRiPRv3k5LrOJ",
          name: "Google Sheets account"
        }
      },
      continueOnFail: true
    },

    // -------------------------------------------------------------
    // PIPELINE B: DEVICE LOCK VERIFICATION (MAX 2 DEVICES PER BUYER)
    // -------------------------------------------------------------
    {
      parameters: {
        httpMethod: "POST",
        path: "course-device-auth",
        responseMode: "responseNode",
        options: {}
      },
      id: "course-device-webhook",
      name: "Device Auth Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [100, 600],
      webhookId: "course-device-auth"
    },
    {
      parameters: {
        jsCode: `const body = $input.first().json.body || $input.first().json;
const rawId = (body.email || body.phone || body.identifier || '').trim().toLowerCase();
const cleanPhone = rawId.replace(/\\D/g, '').slice(-10);
const deviceId = (body.deviceId || '').trim();

const staticData = $getWorkflowStaticData('global');
staticData.authorizedBuyers = staticData.authorizedBuyers || [];
staticData.devicesByStudent = staticData.devicesByStudent || {};

// Allow device lock reset
if (body.action === 'reset_device') {
  const target = (body.targetEmail || body.targetPhone || body.email || '').trim().toLowerCase();
  const cleanTarget = target.replace(/\\D/g, '').slice(-10);
  delete staticData.devicesByStudent[target];
  if (cleanTarget.length === 10) delete staticData.devicesByStudent[cleanTarget];
  return [{ json: { allowed: true, reset: true, message: \`Device lock successfully cleared for \${target}\` } }];
}

// Allow buyer authorization
if (body.action === 'authorize_buyer') {
  const target = (body.targetEmail || body.targetPhone || body.email || '').trim().toLowerCase();
  const cleanTarget = target.replace(/\\D/g, '').slice(-10);
  if (target && !staticData.authorizedBuyers.includes(target)) staticData.authorizedBuyers.push(target);
  if (cleanTarget.length === 10 && !staticData.authorizedBuyers.includes(cleanTarget)) staticData.authorizedBuyers.push(cleanTarget);
  return [{ json: { allowed: true, authorized: true, message: \`Buyer successfully authorized: \${target}\` } }];
}

// Allow buyer revocation / refund
if (body.action === 'revoke_buyer') {
  const target = (body.targetEmail || body.targetPhone || body.email || '').trim().toLowerCase();
  const cleanTarget = target.replace(/\\D/g, '').slice(-10);
  staticData.revokedBuyers = staticData.revokedBuyers || [];
  if (target && !staticData.revokedBuyers.includes(target)) staticData.revokedBuyers.push(target);
  if (cleanTarget.length === 10 && !staticData.revokedBuyers.includes(cleanTarget)) staticData.revokedBuyers.push(cleanTarget);
  staticData.authorizedBuyers = (staticData.authorizedBuyers || []).filter(b => b !== target && b !== cleanTarget);
  delete staticData.devicesByStudent[target];
  if (cleanTarget.length === 10) delete staticData.devicesByStudent[cleanTarget];
  return [{ json: { allowed: false, revoked: true, message: \`Buyer access revoked: \${target}\` } }];
}

// Pre-whitelist verified buyers
const defaultAuthorized = [
  'gchhangani69@gmail.com',
  '8696242991',
  'go.abhi25@gmail.com',
  '9686607788',
  '9288202588',
  'mshivam79@gmail.com',
  '8448824505',
  '9573399944',
  'naveegaadi@gmail.com',
  '9343163399',
  'amalik0924@gmail.com'
];
for (const da of defaultAuthorized) {
  if (!staticData.authorizedBuyers.includes(da)) staticData.authorizedBuyers.push(da);
}

// Permanent revoked / refunded buyers list
const hardcodedRevoked = [
  '6262692120',
  '9202278929',
  'golurawt455@gmail.com',
  '9870673209',
  'teetunimash9870@gmail.com'
];
staticData.revokedBuyers = staticData.revokedBuyers || [];
for (const hr of hardcodedRevoked) {
  if (!staticData.revokedBuyers.includes(hr)) staticData.revokedBuyers.push(hr);
}

// Filter out any revoked buyers from authorized list
staticData.authorizedBuyers = (staticData.authorizedBuyers || []).filter(b => !staticData.revokedBuyers.includes(b));

if (staticData.revokedBuyers.includes(rawId) || (cleanPhone.length === 10 && staticData.revokedBuyers.includes(cleanPhone))) {
  return [{ 
    json: { 
      allowed: false, 
      revoked: true,
      message: 'Access Denied: Course access for this account has been revoked due to a processed refund.' 
    } 
  }];
}

if (!rawId || !deviceId) {
  return [{ json: { allowed: false, message: 'Missing login credentials or device identifier.' } }];
}

// Master admins exempt from limits
if (rawId === 'prateekmayanii@gmail.com' || cleanPhone === '9999900000' || rawId.includes('prateek')) {
  return [{ json: { allowed: true, message: 'Admin access authorized.' } }];
}

// Check authorization
const isAuthorized = staticData.authorizedBuyers.includes(rawId) || 
  (cleanPhone.length === 10 && staticData.authorizedBuyers.includes(cleanPhone)) ||
  defaultAuthorized.includes(rawId) ||
  (cleanPhone.length === 10 && defaultAuthorized.includes(cleanPhone));

if (!isAuthorized) {
  return [{ 
    json: { 
      allowed: false, 
      message: 'No active course enrollment found for this email or phone. Please verify your purchase or contact support.' 
    } 
  }];
}

// Device count check (Max 2 devices)
const studentKey = (cleanPhone.length === 10) ? cleanPhone : rawId;
staticData.devicesByStudent[studentKey] = staticData.devicesByStudent[studentKey] || [];
const registeredDevices = staticData.devicesByStudent[studentKey];

if (registeredDevices.includes(deviceId)) {
  return [{ json: { allowed: true, message: 'Known device authenticated.' } }];
}

if (registeredDevices.length < 2) {
  registeredDevices.push(deviceId);
  return [{ json: { allowed: true, message: \`New device successfully registered (Device \${registeredDevices.length} of 2).\` } }];
}

return [{ 
  json: { 
    allowed: false, 
    message: 'Device limit reached (Maximum 2 devices allowed). To use a new device, please contact support to reset your session.' 
  } 
}];`
      },
      id: "course-device-check",
      name: "Check and Register Device",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [340, 600]
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: "={{ JSON.stringify($json) }}",
        options: {
          responseHeaders: {
            entries: [
              {
                name: "Content-Type",
                value: "application/json"
              },
              {
                name: "Access-Control-Allow-Origin",
                value: "*"
              }
            ]
          }
        }
      },
      id: "course-device-respond",
      name: "Respond to Device Auth",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [580, 600]
    }
  ],
  connections: {
    "Course Webhook Trigger": {
      main: [[{ node: "Filter & Parse Course Payment", type: "main", index: 0 }]]
    },
    "Filter & Parse Course Payment": {
      main: [[{ node: "Fetch Workshop Attendees from Sheet1", type: "main", index: 0 }]]
    },
    "Fetch Workshop Attendees from Sheet1": {
      main: [[{ node: "Match Phone & Resolve Email", type: "main", index: 0 }]]
    },
    "Match Phone & Resolve Email": {
      main: [[{ node: "Is Verified in Sheet?", type: "main", index: 0 }]]
    },
    "Is Verified in Sheet?": {
      main: [
        // True branch: Verified in Sheet1 (Phone + Email found)
        [
          { node: "Send Course Access Email to Student", type: "main", index: 0 },
          { node: "Prepare Clean Sheet Columns", type: "main", index: 0 }
        ],
        // False branch: Missing Phone or Email in Sheet1
        [
          { node: "Send Admin Pending Email Alert", type: "main", index: 0 },
          { node: "Prepare Clean Sheet Columns", type: "main", index: 0 }
        ]
      ]
    },
    "Prepare Clean Sheet Columns": {
      main: [[{ node: "Append to Course Buyers Sheet", type: "main", index: 0 }]]
    },
    "Device Auth Webhook": {
      main: [[{ node: "Check and Register Device", type: "main", index: 0 }]]
    },
    "Check and Register Device": {
      main: [[{ node: "Respond to Device Auth", type: "main", index: 0 }]]
    }
  },
  settings: {
    executionOrder: "v1"
  }
};

async function deployWorkflow() {
  console.log("Checking existing workflows in n8n...");
  const getRes = await fetch(`${baseUrl}/workflows`, {
    headers: { "X-N8N-API-KEY": apiKey }
  });
  const data = await getRes.json();
  const existingWf = data.data.find(w => w.name === workflowPayload.name || w.id === "TVNUUwtNq9CGsSW6");

  let workflowId;

  if (existingWf) {
    workflowId = existingWf.id;
    console.log(`Found existing Course Workflow ID: ${workflowId}. Upgrading in-place...`);
    const updateRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
      method: "PUT",
      headers: {
        "X-N8N-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(workflowPayload)
    });
    console.log(`Update status: ${updateRes.status}`);
    if (updateRes.status !== 200) {
      const err = await updateRes.text();
      console.error("Update failed:", err);
      process.exit(1);
    }
  } else {
    console.log("Creating new Course Workflow...");
    const createRes = await fetch(`${baseUrl}/workflows`, {
      method: "POST",
      headers: {
        "X-N8N-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(workflowPayload)
    });
    const created = await createRes.json();
    workflowId = created.id;
    console.log(`Created new workflow ID: ${workflowId}`);
  }

  // Activate the workflow
  console.log(`Activating workflow ${workflowId}...`);
  const actRes = await fetch(`${baseUrl}/workflows/${workflowId}/activate`, {
    method: "POST",
    headers: { "X-N8N-API-KEY": apiKey }
  });
  console.log(`Activation status: ${actRes.status}`);

  console.log("\n✅ AI Influencer Mastery - Course Enrollment workflow successfully deployed and activated!");
  console.log(`🔗 Webhook Endpoint: https://prateek.n8n.preetamsoni.com/webhook/course-enrollment`);
  console.log(`🔒 Device Auth Endpoint: https://prateek.n8n.preetamsoni.com/webhook/course-device-auth`);
}

deployWorkflow().catch(console.error);
