const N8N_URL = "https://prateek.n8n.preetamsoni.com/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo";

async function getWorkflow(id: string) {
  const res = await fetch(`${N8N_URL}/workflows/${id}`, {
    headers: { "X-N8N-API-KEY": API_KEY }
  });
  return await res.json();
}

async function listWebhooks() {
  const ids = [
    "rS6dy67G88DjeNK3", // Leads & Confirmation
    "rnuwCTq6aysu0eXd", // Failed Checkout Recovery
    "TVNUUwtNq9CGsSW6", // Course Enrollment & Delivery
    "2ta2tJWifJTSDxGQ", // Email Reminders
    "P2BZ8Z3KGYOqLitz", // Bump Delivery
  ];

  for (const id of ids) {
    const wf = await getWorkflow(id);
    const whNodes = (wf.nodes || []).filter((n: any) => n.type.includes("webhook"));
    console.log(`[${id}] ${wf.name}`);
    for (const n of whNodes) {
      console.log(`  -> Node: ${n.name} | Path: ${n.parameters?.path} | Method: ${n.parameters?.httpMethod || 'GET/POST'}`);
    }
  }
}

listWebhooks().catch(console.error);
