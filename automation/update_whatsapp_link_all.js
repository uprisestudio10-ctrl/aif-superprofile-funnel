const https = require('https');
const fs = require('fs');
const path = require('path');

const N8N_URL = 'https://prateek.n8n.preetamsoni.com';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo';

const OLD_LINK = 'https://chat.whatsapp.com/FDLe6CBZxa66sEcHvhy1pD?mode=gi_t';
const NEW_LINK = 'https://chat.whatsapp.com/G3asnvdznZY3a4Ystpo0wR?mode=gi_t';

function apiRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, N8N_URL);
    const bodyData = data ? JSON.stringify(data) : null;
    const req = https.request(url, {
      method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        ...(bodyData ? { 'Content-Length': Buffer.byteLength(bodyData) } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function run() {
  console.log('Fetching all n8n workflows...');
  const res = await apiRequest('/api/v1/workflows');
  if (res.status !== 200 || !res.data.data) {
    console.error('Failed to list workflows:', res);
    return;
  }

  const workflows = res.data.data;
  console.log(`Found ${workflows.length} workflows.`);

  for (const wfSummary of workflows) {
    const wfDetails = await apiRequest(`/api/v1/workflows/${wfSummary.id}`);
    if (wfDetails.status !== 200) {
      console.log(`Failed to fetch workflow ${wfSummary.id} (${wfSummary.name})`);
      continue;
    }
    const wf = wfDetails.data;
    const wfStr = JSON.stringify(wf);

    if (wfStr.includes('FDLe6CBZxa66sEcHvhy1pD') || wfStr.includes('FCCMDpcoP7xG3sTnGji5er')) {
      console.log(`\nWorkflow "${wf.name}" (${wf.id}) contains old WhatsApp link! Updating...`);
      
      let updatedStr = wfStr
        .replace(/https:\/\/chat\.whatsapp\.com\/FDLe6CBZxa66sEcHvhy1pD\?mode=gi_t/g, NEW_LINK)
        .replace(/https:\/\/chat\.whatsapp\.com\/FDLe6CBZxa66sEcHvhy1pD/g, NEW_LINK)
        .replace(/https:\/\/chat\.whatsapp\.com\/FCCMDpcoP7xG3sTnGji5er\?mode=gi_t/g, NEW_LINK)
        .replace(/https:\/\/chat\.whatsapp\.com\/FCCMDpcoP7xG3sTnGji5er/g, NEW_LINK);

      const updatedWf = JSON.parse(updatedStr);

      const updatePayload = {
        name: updatedWf.name,
        nodes: updatedWf.nodes,
        connections: updatedWf.connections,
        settings: updatedWf.settings
      };

      const putRes = await apiRequest(`/api/v1/workflows/${wf.id}`, 'PUT', updatePayload);
      if (putRes.status === 200) {
        console.log(`✅ Successfully updated workflow "${wf.name}" (${wf.id}) in n8n!`);
      } else {
        console.error(`❌ Failed to update workflow "${wf.name}":`, putRes);
      }
    } else {
      console.log(`Workflow "${wf.name}" (${wf.id}) - No old link found.`);
    }
  }

  // Update local files
  console.log('\nUpdating local automation files...');
  const filesToUpdate = [
    path.join(__dirname, 'deploy_capi_to_leads_workflow.js'),
    path.join(__dirname, 'update_format_node.js'),
    path.join(__dirname, 'n8n_leads_and_calls_workflow.json'),
    path.join(__dirname, 'n8n_workshop_reminders_workflow.json')
  ];

  for (const f of filesToUpdate) {
    if (fs.existsSync(f)) {
      let content = fs.readFileSync(f, 'utf8');
      if (content.includes('FDLe6CBZxa66sEcHvhy1pD')) {
        content = content
          .replace(/https:\/\/chat\.whatsapp\.com\/FDLe6CBZxa66sEcHvhy1pD\?mode=gi_t/g, NEW_LINK)
          .replace(/https:\/\/chat\.whatsapp\.com\/FDLe6CBZxa66sEcHvhy1pD/g, NEW_LINK);
        fs.writeFileSync(f, content, 'utf8');
        console.log(`✅ Updated local file: ${path.basename(f)}`);
      }
    }
  }

  console.log('\nAll updates finished!');
}

run().catch(console.error);
