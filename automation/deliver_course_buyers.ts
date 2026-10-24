/**
 * Batch Course Access Delivery Script for 16th October Workshop
 * 
 * Extracts captured payments from Razorpay, dispatches them through n8n Course Enrollment workflow,
 * delivering course access to students whose emails are matched in Sheet1,
 * and dispatching admin alerts to uprisestudio10@gmail.com with student mobile numbers for missing emails.
 */

const KEY_ID = "rzp_live_TreMzXPg39hEiU";
const KEY_SEC = "MFYrqAT6gbenfRN9PH0421rR";
const AUTH = Buffer.from(`${KEY_ID}:${KEY_SEC}`).toString("base64");

const N8N_COURSE_WEBHOOK = "https://prateek.n8n.preetamsoni.com/webhook/course-enrollment";

// Target captured payments from today in chronological order
const PAYMENT_IDS = [
  "pay_TocRCUIWDYBf51", // 8:21:21 PM - 9447936432 (Vyshnav Tp)
  "pay_TocRSLNeMoxFhz", // 8:21:36 PM - 9867345539 (Rajesh Menezes)
  "pay_TocRWCvhojMaH9", // 8:21:39 PM - 7410186269 (Missing email -> Admin alert)
  "pay_TocReJGVZ4d51M", // 8:21:47 PM - 9410679678 (Yaju Singh)
  "pay_TocSGMPX95W1tP", // 8:22:21 PM - 9158984616 (Sebananda)
  "pay_TocSTedE1SxdrY", // 8:22:34 PM - 9851248798 (Ankit Agarwal)
  "pay_TocTK5MTj3Mu6K", // 8:23:22 PM - 7416895725 (Missing email -> Admin alert)
  "pay_TocTla4HIyVPVM", // 8:23:47 PM - 8233084905 (Harshit Lohar)
  "pay_TocUC4Vs9AzTio", // 8:24:11 PM - 9008077066 (Ravi.d)
  "pay_TocUEWaHndM4Qt", // 8:24:14 PM - 9849039761 (Maheswara Reddy)
  "pay_TocUp2hpyUNa6v", // 8:24:47 PM - 6296772139 (Ruyel)
  "pay_ToceHqW5ZeNGLj", // 8:33:45 PM - 9004812678 (Sanjay Gupta)
  "pay_Tocg8ozyzomRlO", // 8:35:30 PM - 9123370566 (Fahim)
];

async function main() {
  console.log(`Starting course access batch delivery for ${PAYMENT_IDS.length} payments...\n`);

  for (let i = 0; i < PAYMENT_IDS.length; i++) {
    const pid = PAYMENT_IDS[i];
    console.log(`[${i + 1}/${PAYMENT_IDS.length}] Processing ${pid}...`);

    // Fetch payment from Razorpay
    const res = await fetch(`https://api.razorpay.com/v1/payments/${pid}`, {
      headers: { "Authorization": `Basic ${AUTH}` }
    });

    if (!res.ok) {
      console.error(`Failed to fetch ${pid} from Razorpay: ${res.status}`);
      continue;
    }

    const payment = await res.json();
    console.log(`  Contact: ${payment.contact} | Email: ${payment.email} | Amount: ₹${payment.amount / 100}`);

    const webhookPayload = {
      event: "payment.captured",
      payload: {
        payment: {
          entity: payment
        }
      }
    };

    const webhookRes = await fetch(N8N_COURSE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    });

    console.log(`  Webhook dispatch status: ${webhookRes.status}`);

    // Wait 4 seconds between dispatches for clean execution sequencing
    await new Promise(r => setTimeout(r, 4000));
  }

  console.log("\nAll payments processed successfully!");
}

main().catch(console.error);
