// End-to-End Automation Test Runner
// Tests all 5 automation workflows in sequence with real payloads

const N8N_BASE = "https://prateek.n8n.preetamsoni.com";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo";

const TEST_PHONE = "9876543210";
const TEST_EMAIL = "prateekmayanii@gmail.com";
const TEST_NAME = "Aryan Sharma";

async function getRecentExecution(workflowId: string) {
  await new Promise(r => setTimeout(r, 1500)); // wait for execution to register
  const res = await fetch(`${N8N_BASE}/api/v1/executions?workflowId=${workflowId}&limit=1`, {
    headers: { "X-N8N-API-KEY": API_KEY }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.[0] || null;
}

async function test1_LeadRegistration() {
  console.log("\n=======================================================");
  console.log("TEST 1: Workshop Lead Registration & Confirmation Email");
  console.log("=======================================================");

  const payload = {
    name: TEST_NAME,
    phone: TEST_PHONE,
    email: TEST_EMAIL,
    amount: 29,
    offers: ["recording"],
    date: new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }),
    workshop_date: "22nd October 2026 (Thursday) 7:00 PM IST",
    utm_source: "meta_ads_test",
    utm_campaign: "aif_broad_cbo",
    fbclid: "fb.1.1728899999.test_click_id"
  };

  const res = await fetch(`${N8N_BASE}/webhook/ai-influencer-leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log(`Webhook Trigger Status: ${res.status} ${res.statusText}`);
  const exec = await getRecentExecution("rS6dy67G88DjeNK3");
  if (exec) {
    console.log(`Execution ID: ${exec.id} | Status: ${exec.status} | Finished: ${exec.finished}`);
  }
}

async function test2_FailedCheckoutRecovery() {
  console.log("\n=======================================================");
  console.log("TEST 2: Abandoned / Failed Checkout Recovery");
  console.log("=======================================================");

  // Scenario 2A: Already Registered buyer (Aryan) tries to pay and fails
  console.log("Scenario 2A: Buyer already registered (Should suppress email)...");
  const payloadA = {
    event: "payment.failed",
    test_mode: true,
    payload: {
      payment: {
        entity: {
          id: `pay_fail_${Date.now()}`,
          amount: 2900,
          contact: TEST_PHONE,
          email: TEST_EMAIL,
          name: TEST_NAME,
          error_description: "Payment cancelled by user"
        }
      }
    }
  };

  const resA = await fetch(`${N8N_BASE}/webhook/failed-checkout-recovery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadA)
  });
  console.log(`Webhook 2A Response: ${resA.status}`);
  const execA = await getRecentExecution("rnuwCTq6aysu0eXd");
  if (execA) {
    console.log(`Execution 2A ID: ${execA.id} | Status: ${execA.status}`);
  }

  // Scenario 2B: New abandoned buyer (Never registered) -> Should send recovery email
  console.log("\nScenario 2B: Unregistered drop-off buyer (Should send recovery email)...");
  const payloadB = {
    event: "payment.failed",
    test_mode: true,
    payload: {
      payment: {
        entity: {
          id: `pay_fail_abandon_${Date.now()}`,
          amount: 2900,
          contact: "919998887777",
          email: TEST_EMAIL,
          name: "Rohit Demo",
          error_description: "Bank server timeout"
        }
      }
    }
  };

  const resB = await fetch(`${N8N_BASE}/webhook/failed-checkout-recovery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadB)
  });
  console.log(`Webhook 2B Response: ${resB.status}`);
  const execB = await getRecentExecution("rnuwCTq6aysu0eXd");
  if (execB) {
    console.log(`Execution 2B ID: ${execB.id} | Status: ${execB.status}`);
  }
}

async function test3_WorkshopReminders() {
  console.log("\n=======================================================");
  console.log("TEST 3: Workshop Reminder Broadcast Sequence");
  console.log("=======================================================");

  const res = await fetch(`${N8N_BASE}/webhook/trigger-workshop-reminder?milestone=test_preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test_mode: true })
  });

  console.log(`Reminder Webhook Status: ${res.status}`);
  const exec = await getRecentExecution("2ta2tJWifJTSDxGQ");
  if (exec) {
    console.log(`Reminder Execution ID: ${exec.id} | Status: ${exec.status}`);
  }
}

async function test4_CourseDelivery() {
  console.log("\n=======================================================");
  console.log("TEST 4: Course Delivery via Razorpay (Full vs Token vs Unknown)");
  console.log("=======================================================");

  // Scenario 4A: Full Course Payment (₹2,499) with phone matching registered lead
  console.log("\nScenario 4A: Full Course Payment (₹2,499) -> Unlock Full Portal Access...");
  const payloadFull = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_full_${Date.now()}`,
          order_id: `order_${Date.now()}`,
          amount: 249900, // ₹2,499
          contact: TEST_PHONE,
          email: "void@razorpay.com", // dummy email on payment link!
          name: TEST_NAME,
          description: "AI Influencer Mastery - Full Course"
        }
      }
    }
  };

  const resFull = await fetch(`${N8N_BASE}/webhook/course-enrollment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadFull)
  });
  console.log(`Full Course Webhook Response: ${resFull.status}`);
  const execFull = await getRecentExecution("TVNUUwtNq9CGsSW6");
  if (execFull) {
    console.log(`Full Course Execution ID: ${execFull.id} | Status: ${execFull.status}`);
  }

  // Scenario 4B: Token Payment (₹999) -> Seat Reserved, Portal LOCKED
  console.log("\nScenario 4B: Token Payment (₹999) -> Seat Reserved, Portal LOCKED...");
  const payloadToken = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_token_${Date.now()}`,
          order_id: `order_tok_${Date.now()}`,
          amount: 99900, // ₹999
          contact: TEST_PHONE,
          email: "void@razorpay.com",
          name: TEST_NAME,
          description: "AI Influencer Mastery - Seat Token"
        }
      }
    }
  };

  const resTok = await fetch(`${N8N_BASE}/webhook/course-enrollment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadToken)
  });
  console.log(`Token Course Webhook Response: ${resTok.status}`);
  const execTok = await getRecentExecution("TVNUUwtNq9CGsSW6");
  if (execTok) {
    console.log(`Token Course Execution ID: ${execTok.id} | Status: ${execTok.status}`);
  }

  // Scenario 4C: Unknown Phone (Not in Sheet1) & No Email
  console.log("\nScenario 4C: Unknown Phone & Dummy Email -> Admin Action Alert Dispatched...");
  const payloadUnknown = {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: `pay_unk_${Date.now()}`,
          order_id: `order_unk_${Date.now()}`,
          amount: 249900,
          contact: "8888899999", // not in sheet!
          email: "void@razorpay.com",
          name: "Unknown Stranger",
          description: "AI Influencer Mastery"
        }
      }
    }
  };

  const resUnk = await fetch(`${N8N_BASE}/webhook/course-enrollment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payloadUnknown)
  });
  console.log(`Unknown Buyer Webhook Response: ${resUnk.status}`);
  const execUnk = await getRecentExecution("TVNUUwtNq9CGsSW6");
  if (execUnk) {
    console.log(`Unknown Buyer Execution ID: ${execUnk.id} | Status: ${execUnk.status}`);
  }
}

async function main() {
  console.log("🚀 Starting End-to-End Automation Tests across all workflows...");
  await test1_LeadRegistration();
  await test2_FailedCheckoutRecovery();
  await test3_WorkshopReminders();
  await test4_CourseDelivery();
  console.log("\n✅ All End-to-End Tests Finished!");
}

main().catch(console.error);
