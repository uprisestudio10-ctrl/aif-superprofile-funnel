// Script to update all n8n workflows to the new Google Sheet ID:
// 1flbSez2txzFmW1jj7uMy7THzpJyvJtpvV3ZrASU5poc
// And update reminder schedules for the 16th October Workshop
// And update course threshold to ₹2,499 (Tokens < 2400 do not get portal access)

const N8N_URL = "https://prateek.n8n.preetamsoni.com/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo";

const NEW_SHEET_ID = "1flbSez2txzFmW1jj7uMy7THzpJyvJtpvV3ZrASU5poc";

async function getWorkflow(id: string) {
  const res = await fetch(`${N8N_URL}/workflows/${id}`, {
    headers: { "X-N8N-API-KEY": API_KEY }
  });
  if (!res.ok) throw new Error(`Failed to fetch workflow ${id}: ${res.status} ${await res.text()}`);
  return await res.json();
}

async function updateWorkflow(id: string, payload: any) {
  const body = {
    name: payload.name,
    nodes: payload.nodes,
    connections: payload.connections,
    settings: payload.settings || {},
  };
  const res = await fetch(`${N8N_URL}/workflows/${id}`, {
    method: "PUT",
    headers: {
      "X-N8N-API-KEY": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Failed to update workflow ${id}: ${res.status} ${await res.text()}`);
  console.log(`Successfully updated workflow ${id}: ${payload.name}`);
  return await res.json();
}

async function main() {
  console.log("=== Updating n8n workflows with New Sheet ID ===");
  console.log(`New Sheet ID: ${NEW_SHEET_ID}\n`);

  // 1. Workflow rS6dy67G88DjeNK3: Leads & Instant Confirmation Email
  console.log("1. Updating Leads & Confirmation Workflow (rS6dy67G88DjeNK3)...");
  const wfLeads = await getWorkflow("rS6dy67G88DjeNK3");
  for (const node of wfLeads.nodes) {
    if (node.type.includes("googleSheets")) {
      if (node.parameters?.documentId) {
        node.parameters.documentId = {
          __rl: true,
          value: NEW_SHEET_ID,
          mode: "id"
        };
      }
    }
  }
  await updateWorkflow("rS6dy67G88DjeNK3", wfLeads);

  // 2. Workflow 2ta2tJWifJTSDxGQ: 6-Stage Email Reminders Broadcast
  console.log("\n2. Updating Email Reminders Workflow (2ta2tJWifJTSDxGQ)...");
  const wfReminders = await getWorkflow("2ta2tJWifJTSDxGQ");
  for (const node of wfReminders.nodes) {
    if (node.type.includes("googleSheets")) {
      if (node.parameters?.documentId) {
        node.parameters.documentId = {
          __rl: true,
          value: NEW_SHEET_ID,
          mode: "id"
        };
      }
    }
    // Update Cron Schedules for 16th October Workshop WITHOUT changing node names
    if (node.type === "n8n-nodes-base.scheduleTrigger") {
      if (node.name.includes("1 Day To Go") && node.parameters?.rule?.interval?.[0]) {
        node.parameters.rule.interval[0].expression = "0 19 15 10 *"; // 15 Oct, 7:00 PM
      } else if (node.name.includes("12 Hours To Go") && node.parameters?.rule?.interval?.[0]) {
        node.parameters.rule.interval[0].expression = "0 7 16 10 *";  // 16 Oct, 7:00 AM
      } else if (node.name.includes("3 Hours To Go") && node.parameters?.rule?.interval?.[0]) {
        node.parameters.rule.interval[0].expression = "0 16 16 10 *"; // 16 Oct, 4:00 PM
      } else if (node.name.includes("1 Hour To Go") && node.parameters?.rule?.interval?.[0]) {
        node.parameters.rule.interval[0].expression = "0 18 16 10 *"; // 16 Oct, 6:00 PM
      } else if (node.name.includes("15 Mins To Go") && node.parameters?.rule?.interval?.[0]) {
        node.parameters.rule.interval[0].expression = "45 18 16 10 *"; // 16 Oct, 6:45 PM
      } else if (node.name.includes("We Are LIVE") && node.parameters?.rule?.interval?.[0]) {
        node.parameters.rule.interval[0].expression = "0 19 16 10 *"; // 16 Oct, 7:00 PM
      }
    }
  }
  await updateWorkflow("2ta2tJWifJTSDxGQ", wfReminders);

  // 3. Workflow TVNUUwtNq9CGsSW6: Course Enrollment & Delivery
  console.log("\n3. Updating Course Enrollment Workflow (TVNUUwtNq9CGsSW6)...");
  const wfCourse = await getWorkflow("TVNUUwtNq9CGsSW6");
  for (const node of wfCourse.nodes) {
    if (node.type.includes("googleSheets")) {
      if (node.parameters?.documentId) {
        node.parameters.documentId = {
          __rl: true,
          value: NEW_SHEET_ID,
          mode: "id"
        };
      }
    }
    // Update code nodes to enforce ₹2,499 threshold for course access
    if (node.name === "Filter & Parse Course Payment") {
      let code = node.parameters.jsCode;
      code = code.replace(/const isToken = parsedAmount < \d+;/, "const isToken = parsedAmount < 2400;");
      node.parameters.jsCode = code;
    }
    if (node.name === "Match Phone & Resolve Email") {
      let code = node.parameters.jsCode;
      code = code.replace(/Balance ₹2,000 Pending/g, "Balance ₹1,500 Pending");
      code = code.replace(/remaining ₹2,000/g, "remaining ₹1,500");
      code = code.replace(/remaining balance of <strong>₹2,000<\/strong>/g, "remaining balance of <strong>₹1,500</strong>");
      code = code.replace(/discount price of <strong>₹2,999<\/strong>/g, "discount price of <strong>₹2,499</strong>");
      node.parameters.jsCode = code;
    }
  }
  await updateWorkflow("TVNUUwtNq9CGsSW6", wfCourse);

  // 4. Workflow P2BZ8Z3KGYOqLitz: Bump Delivery
  console.log("\n4. Updating Bump Delivery Workflow (P2BZ8Z3KGYOqLitz)...");
  const wfBump = await getWorkflow("P2BZ8Z3KGYOqLitz");
  for (const node of wfBump.nodes) {
    if (node.type.includes("googleSheets")) {
      if (node.parameters?.documentId) {
        node.parameters.documentId = {
          __rl: true,
          value: NEW_SHEET_ID,
          mode: "id"
        };
      }
    }
  }
  await updateWorkflow("P2BZ8Z3KGYOqLitz", wfBump);

  console.log("\n=== All Workflows Updated Successfully! ===");
}

main().catch(err => {
  console.error("Error updating workflows:", err);
  process.exit(1);
});
