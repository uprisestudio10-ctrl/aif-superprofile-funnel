const N8N_URL = 'https://prateek.n8n.preetamsoni.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo';

const smartCode = `const raw = $input.first().json.body || $input.first().json;

let item = raw;

// Handle direct Razorpay Webhook format if sent from Razorpay Dashboard
if ((raw.event === 'payment.captured' || raw.event === 'order.paid') && raw.payload) {
  const p = raw.payload.payment ? raw.payload.payment.entity : (raw.payload.order ? raw.payload.order.entity : {});
  const notes = p.notes || {};
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
    fb_click_id: notes.fbclid || ''
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
    'FB Click ID': item.fb_click_id || item.fbclid || '',
    has_call_booked: Boolean(hasCall),
    'Call Status': hasCall ? 'Pending' : 'N/A',
    'Recording Purchased': hasRecording ? 'YES' : 'NO',
    'Prompts Purchased': hasPrompts ? 'YES' : 'NO',
    'Payment ID': item.razorpay_payment_id || '',
    email_html: emailHtml
  }
}];`;

async function update() {
  const res = await fetch(`${N8N_URL}/api/v1/workflows/NiW3vl0a7dawrW6f`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const data = await res.json();
  const formatNode = data.nodes.find(n => n.name === 'Format Lead Data');
  formatNode.parameters.jsCode = smartCode;

  const updateRes = await fetch(`${N8N_URL}/api/v1/workflows/NiW3vl0a7dawrW6f`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': API_KEY
    },
    body: JSON.stringify({
      name: data.name,
      nodes: data.nodes,
      connections: data.connections,
      settings: { executionOrder: 'v1' }
    })
  });
  console.log('Update status:', updateRes.status);
}

update();
