/**
 * Patches n8n workshop reminder workflow with strict filtering for 22nd October attendees
 */
const N8N_URL = "https://prateek.n8n.preetamsoni.com/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo";
const WORKFLOW_ID = "2ta2tJWifJTSDxGQ";

async function run() {
  const res = await fetch(`${N8N_URL}/workflows/${WORKFLOW_ID}`, {
    headers: { "X-N8N-API-KEY": API_KEY }
  });
  const wf = await res.json();
  const node = wf.nodes.find((n: any) => n.name === "Generate Reminder Emails");
  if (!node) {
    throw new Error("Node not found");
  }

  const oldCode: string = node.parameters.jsCode;
  const startMarker = "// Filter: Only include attendees who registered for THIS specific workshop";
  const endMarker = "continue; // Strictly skip other batch attendees!\n    }";

  const startIndex = oldCode.indexOf(startMarker);
  const endIndex = oldCode.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found in code!");
    process.exit(1);
  }

  const replacement = `// Strict Filter: ONLY attendees who explicitly registered for the 22nd October workshop
    function excelDateToJS(serial) {
      const utcDays = Math.floor(serial - 25569);
      return new Date(utcDays * 86400 * 1000).toISOString().split("T")[0];
    }

    const wsDate = String(data['Workshop Date'] || data['workshop_date'] || '').toLowerCase().trim();
    const rawDate = data["Date "] || data.Date || data.date || "";

    let regDateStr = String(rawDate).trim();
    if (!isNaN(Number(rawDate)) && Number(rawDate) > 40000) {
      regDateStr = excelDateToJS(Number(rawDate));
    }

    const isExplicit22nd = wsDate.includes("22nd oct") || wsDate.includes("22 oct") || wsDate.includes("22nd october");
    const isRecent22ndBatch = regDateStr >= "2026-10-17";

    const isThisWorkshop = isExplicit22nd || (isRecent22ndBatch && !wsDate.includes("16 oct") && !wsDate.includes("8 oct"));
    if (!isThisWorkshop) {
      continue; // Strictly skip historical 16th Oct and earlier attendees!
    }`;

  const newCode = oldCode.slice(0, startIndex) + replacement + oldCode.slice(endIndex + endMarker.length);
  node.parameters.jsCode = newCode;

  const putRes = await fetch(`${N8N_URL}/workflows/${WORKFLOW_ID}`, {
    method: "PUT",
    headers: {
      "X-N8N-API-KEY": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: wf.settings
    })
  });

  const updated = await putRes.json();
  console.log("Successfully updated workflow in n8n! Version:", updated.versionCounter);
}

run().catch(console.error);
