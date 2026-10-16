// Script to safely add Meta CAPI server-to-server dispatch to NiW3vl0a7dawrW6f workflow in n8n
// Ensures ZERO disruption to Google Sheets, 1:1 Call Bookings, and Confirmation Emails.

const N8N_URL = 'https://prateek.n8n.preetamsoni.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo';
const WORKFLOW_ID = 'NiW3vl0a7dawrW6f';

const META_PIXEL_ID = '1462195472776524';
const META_CAPI_TOKEN = 'EAAPdKUgkm4kBSgzKwkk4rV6DJRRnd43XZC43C3te57GKcymIPyauf08aC9IWLB8MPY1sx856PcUfjoinZCuSJJSEdCquY8HXxQmwqou93euJhVfELhSIr0ZA1ZAA6ZCTmpKm35X2LG4cx6e8NkajwTAudBDqQSBIWPanQv02ULIpQAZBFZAfZCkItqpdojrlRQZDZD';

// Updated jsCode for Format Lead Data to preserve fbp, fbc, fb_click_id, raw_amount
const updatedFormatLeadJsCode = `const raw = $input.first().json.body || $input.first().json;

let item = raw;
let notes = {};

// Handle direct Razorpay Webhook format if sent from Razorpay Dashboard
if ((raw.event === 'payment.captured' || raw.event === 'order.paid') && raw.payload) {
  const p = raw.payload.payment ? raw.payload.payment.entity : (raw.payload.order ? raw.payload.order.entity : {});
  notes = p.notes || {};
  const cleanPhone = (notes.phone || notes.contact || p.contact || '').replace(/\\D/g, '').slice(-10);
  const amtNum = p.amount ? Math.round(p.amount / 100) : 29;
  
  item = {
    name: notes.name || notes.buyer_name || p.name || 'there',
    number: cleanPhone,
    email: notes.email || p.email || '',
    amount: amtNum,
    amount_formatted: '₹' + amtNum,
    workshop_date: '22nd October 2026 (Thursday) 7:00 PM IST',
    has_call_booked: Boolean(notes.offers && notes.offers.includes('call')),
    call_booked: (notes.offers && notes.offers.includes('call')) ? 'YES' : 'NO',
    call_status: (notes.offers && notes.offers.includes('call')) ? 'Pending' : 'N/A',
    recording_purchased: (notes.offers && notes.offers.includes('recording')) ? 'YES' : 'NO',
    prompts_purchased: (notes.offers && notes.offers.includes('prompts')) ? 'YES' : 'NO',
    razorpay_payment_id: p.id || '',
    razorpay_order_id: p.order_id || '',
    utm_source: notes.utm_source || '',
    utm_campaign: notes.utm_campaign || '',
    utm_content: notes.utm_content || '',
    utm_term: notes.utm_term || '',
    fb_click_id: notes.fbclid || '',
    fbp: notes.fbp || '',
    fbc: notes.fbc || ''
  };
}

// Deduplication safeguard: Prevent duplicate rows/emails if both website & Razorpay send webhooks
const paymentId = item.razorpay_payment_id || '';
try {
  const staticData = $getWorkflowStaticData('global');
  staticData.processedIds = staticData.processedIds || [];
  if (paymentId && staticData.processedIds.includes(paymentId)) {
    // Duplicate detected — gracefully stop execution
    return [];
  }
  if (paymentId) {
    staticData.processedIds.push(paymentId);
    if (staticData.processedIds.length > 200) {
      staticData.processedIds.shift();
    }
  }
} catch (e) {
  // If staticData is unavailable in test mode, proceed safely
}

const amtVal = parseInt(String(item.amount || '').replace(/\\D/g, '')) || 29;

const hasCall = item.has_call_booked === true || 
  item.call_booked === 'YES' ||
  (Array.isArray(item.offers) && item.offers.includes('call')) ||
  (typeof item.offers_label === 'string' && item.offers_label.toLowerCase().includes('call')) ||
  amtVal === 528 || amtVal === 677 || amtVal === 727 || amtVal === 876;

const hasRecording = item.recording_purchased === 'YES' ||
  (Array.isArray(item.offers) && item.offers.includes('recording')) ||
  (typeof item.offers_label === 'string' && item.offers_label.toLowerCase().includes('recording')) ||
  amtVal === 178 || amtVal === 377 || amtVal === 677 || amtVal === 876;

const hasPrompts = item.prompts_purchased === 'YES' ||
  (Array.isArray(item.offers) && item.offers.includes('prompts')) ||
  (typeof item.offers_label === 'string' && item.offers_label.toLowerCase().includes('prompts')) ||
  amtVal === 228 || amtVal === 377 || amtVal === 727 || amtVal === 876;

const name = (item.name || 'there').trim();
const amount = item.amount_formatted || (item.amount ? '₹' + item.amount : '₹29');
const whatsappUrl = 'https://chat.whatsapp.com/G3asnvdznZY3a4Ystpo0wR?mode=gi_t';

const emailHtml = \`<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111; max-width: 600px;">
<p>Hi \${name},</p>

<p>Thank you for registering for the <strong>AI Influencer Workshop</strong>. Your seat is confirmed!</p>

<p><strong>Please Note:</strong> You must join our WhatsApp group to attend the live workshop, as the Zoom meeting link and prompt guides will only be shared inside the WhatsApp group (we do not send the link over email to avoid unauthorized access).</p>

<p>👉 <strong>Join WhatsApp Group here:</strong><br>
<a href="\${whatsappUrl}" style="color: #0066cc; text-decoration: underline; font-weight: bold;">\${whatsappUrl}</a></p>

<p><strong>Workshop Details:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li><strong>Date:</strong> 22nd October 2026 (Thursday)</li>
  <li><strong>Time:</strong> 7:00 PM IST (Sharp)</li>
  <li><strong>Location:</strong> Live on Zoom (Link shared in the WhatsApp group)</li>
  <li><strong>Amount Paid:</strong> \${amount}</li>
</ol>

<p><strong>Next Steps:</strong></p>
<ol style="margin: 0 0 16px 0; padding-left: 20px;">
  <li>Click the link above to join the WhatsApp group right now.</li>
  <li>Pin the group on WhatsApp so you don't miss the Zoom link.</li>
  <li>Keep your laptop ready on Thursday at 6:55 PM IST.</li>
</ol>

<p>If you have any questions, feel free to reply directly to this email.</p>

<p>Looking forward to seeing you live on Thursday.</p>

<p>Best Regards,<br>
<strong>Prateek Mayani</strong><br>
AI Influencer Workshop</p>
</div>\`;

return [{
  json: {
    Name: item.name || '',
    Number: item.number || item.phone || '',
    Email: item.email || '',
    Date: item.date || new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
    Time: item.time || new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }),
    Amount: amount,
    'Workshop Date': item.workshop_date || '22nd October 2026 (Thursday) 7:00 PM IST',
    'Utm source': item.utm_source || '',
    'Utm campaign': item.utm_campaign || '',
    'Utm content': item.utm_content || '',
    'Utm term': item.utm_term || '',
    'FB Click ID': item.fb_click_id || item.fbclid || (notes && notes.fbclid) || '',
    has_call_booked: Boolean(hasCall),
    'Call Status': hasCall ? 'Pending' : 'N/A',
    'Recording Purchased': hasRecording ? 'YES' : 'NO',
    'Prompts Purchased': hasPrompts ? 'YES' : 'NO',
    'Payment ID': item.razorpay_payment_id || '',
    raw_amount: amtVal,
    fbp: item.fbp || (notes && notes.fbp) || '',
    fbc: item.fbc || (notes && notes.fbc) || '',
    email_html: emailHtml
  }
}];
`;

const prepareCapiJsCode = `function sha256(ascii) {
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

const item = $input.first().json;
const email = (item.Email || '').trim().toLowerCase();
const rawPhone = String(item.Number || '').replace(/\\D/g, '').slice(-10);
const phone = rawPhone.length === 10 ? '91' + rawPhone : rawPhone;
const fullName = (item.Name || '').trim();
const firstName = fullName.split(' ')[0].toLowerCase();
const paymentId = item['Payment ID'] || ('pay_' + Date.now());
const rawAmount = item.raw_amount || parseInt(String(item.Amount || '').replace(/\\D/g, '')) || 29;

const fbp = item.fbp || '';
let fbc = item.fbc || '';
if (!fbc && item['FB Click ID']) {
  fbc = 'fb.1.' + Date.now() + '.' + item['FB Click ID'];
}

const userData = {};
if (email && email.includes('@')) {
  userData.em = [sha256(email)];
}
if (phone) {
  userData.ph = [sha256(phone)];
}
if (firstName) {
  userData.fn = [sha256(firstName)];
}
userData.country = [sha256('in')];
if (paymentId) {
  userData.external_id = [sha256(paymentId)];
}
if (fbp) userData.fbp = fbp;
if (fbc) userData.fbc = fbc;

const capiPayload = {
  data: [
    {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: paymentId,
      event_source_url: 'https://aifworkshop.prateekmayani.com/thank-you-5034',
      action_source: 'website',
      user_data: userData,
      custom_data: {
        currency: 'INR',
        value: rawAmount,
        content_name: 'AI Influencer Workshop'
      }
    }
  ]
};

return [{
  json: {
    capiPayload: capiPayload
  }
}];
`;

async function updateWorkflow() {
  console.log("Fetching live workflow NiW3vl0a7dawrW6f...");
  const getRes = await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const liveWf = await getRes.json();

  // 1. Update Format Lead Data code
  const formatNode = liveWf.nodes.find(n => n.name === 'Format Lead Data');
  if (formatNode) {
    formatNode.parameters.jsCode = updatedFormatLeadJsCode;
  }

  // 2. Check if Meta CAPI nodes already exist, otherwise add them
  let prepareCapiNode = liveWf.nodes.find(n => n.name === 'Prepare Meta CAPI Payload');
  if (!prepareCapiNode) {
    prepareCapiNode = {
      parameters: {
        jsCode: prepareCapiJsCode
      },
      name: "Prepare Meta CAPI Payload",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [720, 540]
    };
    liveWf.nodes.push(prepareCapiNode);
  } else {
    prepareCapiNode.parameters.jsCode = prepareCapiJsCode;
  }

  let sendCapiNode = liveWf.nodes.find(n => n.name === 'Send Meta CAPI Purchase');
  if (!sendCapiNode) {
    sendCapiNode = {
      parameters: {
        method: "POST",
        url: `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ $json.capiPayload }}",
        options: {}
      },
      name: "Send Meta CAPI Purchase",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [980, 540],
      continueOnFail: true
    };
    liveWf.nodes.push(sendCapiNode);
  }

  // 3. Ensure connections:
  // Format Lead Data must connect to:
  // - Append to Main Lead Sheet
  // - Is 1:1 Call Booked?
  // - Send Confirmation Email
  // - Prepare Meta CAPI Payload
  const formatOutputs = liveWf.connections["Format Lead Data"]?.main?.[0] || [];
  const hasCapiPrep = formatOutputs.some(c => c.node === "Prepare Meta CAPI Payload");
  if (!hasCapiPrep) {
    formatOutputs.push({
      node: "Prepare Meta CAPI Payload",
      type: "main",
      index: 0
    });
  }

  // Prepare Meta CAPI Payload connects to Send Meta CAPI Purchase
  liveWf.connections["Prepare Meta CAPI Payload"] = {
    main: [
      [
        {
          node: "Send Meta CAPI Purchase",
          type: "main",
          index: 0
        }
      ]
    ]
  };

  // 4. Construct clean payload for PUT
  const cleanPayload = {
    name: liveWf.name,
    nodes: liveWf.nodes,
    connections: liveWf.connections,
    settings: { executionOrder: "v1" }
  };

  console.log("Updating workflow NiW3vl0a7dawrW6f...");
  const updateRes = await fetch(`${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: "PUT",
    headers: {
      "X-N8N-API-KEY": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cleanPayload)
  });

  const updatedData = await updateRes.json();
  if (updateRes.ok) {
    console.log("✅ Successfully updated workflow NiW3vl0a7dawrW6f!");
    console.log("Active status:", updatedData.active);

    // Save locally
    await Bun.write("automation/n8n_leads_and_calls_workflow.json", JSON.stringify(updatedData, null, 2));
    console.log("✅ Synced automation/n8n_leads_and_calls_workflow.json");
  } else {
    console.error("❌ Failed to update workflow:", updatedData);
  }
}

updateWorkflow().catch(console.error);
