/**
 * 🚀 Post-Workshop Bump Delivery Trigger Script
 *
 * Usage:
 *   bun automation/send_bumps.js --test     (Send 3 preview samples to prateekmayanii@gmail.com first)
 *   bun automation/send_bumps.js            (LIVE BROADCAST TO ALL ATTENDEES)
 *
 * Options:
 *   --date="8th October 2026"       (Target workshop date)
 *   --recording="<URL>"             (Direct link to workshop video replay)
 *   --prompts="<URL>"               (Direct link to 300+ Prompts PDF/Drive)
 *   --test                          (Send preview samples to prateekmayanii@gmail.com first)
 */

const WEBHOOK_URL = "https://prateek.n8n.preetamsoni.com/webhook/deliver-workshop-bumps";

const args = process.argv.slice(2);
function getArg(key, def = "") {
  const prefix = `--${key}=`;
  const found = args.find((a) => a.startsWith(prefix));
  if (found) return found.slice(prefix.length).replace(/^['"]|['"]$/g, "");
  return def;
}

const isTest = args.includes("--test") || args.includes("-t");
const workshopDate = getArg("date", "8th October 2026");
const recordingUrl = getArg("recording", "https://youtu.be/3VVlAY5aoJY");
const promptsUrl = getArg("prompts", "https://aifworkshop.prateekmayani.com/downloads/Kruti_Sharma_300_Prompts_Library.pdf");

console.log("\n=======================================================");
console.log("🎯 AI Influencer Workshop - Bump Delivery Trigger");
console.log("=======================================================");
console.log(`📅 Target Workshop Batch : ${workshopDate}`);
console.log(`🎥 Workshop Recording URL: ${recordingUrl}`);
console.log(`⚡ Prompts Vault PDF URL : ${promptsUrl}`);
console.log(`🧪 Mode                  : ${isTest ? "TEST PREVIEW (Sends to prateekmayanii@gmail.com)" : "LIVE BROADCAST TO ALL BUMP BUYERS"}`);
console.log("=======================================================\n");

async function run() {
  console.log("Triggering n8n Bump Delivery Workflow...");
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workshop_date: workshopDate,
      recording_url: recordingUrl,
      prompts_url: promptsUrl,
      test_mode: isTest,
      test_email: "prateekmayanii@gmail.com",
    }),
  });

  console.log(`Response Status: ${res.status}`);
  const text = await res.text();
  console.log(`Response Body: ${text}`);

  if (res.status === 200) {
    console.log("\n✅ Success! The Bump Delivery Workflow has started processing in n8n.");
    console.log("Bump buyers are segregated and receiving their respective emails via SMTP.");
  } else {
    console.error("\n❌ Failed to trigger webhook. Please check your n8n server.");
  }
}

run().catch(console.error);
