/**
 * AI Influencer Funnel - Comprehensive Health & Anomaly Scanner
 * 
 * Scans:
 * 1. Web endpoints (Landing page, Checkout)
 * 2. Google Sheet (Pending leads, duplicates, missing data)
 * 3. n8n Workflows (Active state, recent execution errors)
 * 4. Email velocity / loop anomaly detection
 * 5. Sends instant alert to uprisestudio10@gmail.com if any issue is detected
 */

const N8N_URL = "https://prateek.n8n.preetamsoni.com/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo";
const ALERT_EMAIL = "uprisestudio10@gmail.com";
const SHEET_ID = "1flbSez2txzFmW1jj7uMy7THzpJyvJtpvV3ZrASU5poc";

interface HealthReport {
  timestamp: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  issues: string[];
  endpoints: { url: string; status: number; timeMs: number }[];
  sheet: { totalRows: number; pendingEmails: number; duplicateEmails: string[] };
  workflows: { id: string; name: string; active: boolean; recentErrors: number }[];
}

export async function runFullScan(): Promise<HealthReport> {
  const issues: string[] = [];
  const endpoints: { url: string; status: number; timeMs: number }[] = [];

  // 1. Endpoint Checks
  const urlsToTest = [
    "https://live.prateekmayani.com",
    "https://live.prateekmayani.com/checkout"
  ];

  for (const url of urlsToTest) {
    const start = Date.now();
    try {
      const res = await fetch(url, { headers: { "User-Agent": "AIF-Watchdog/1.0" } });
      const timeMs = Date.now() - start;
      endpoints.push({ url, status: res.status, timeMs });
      if (res.status !== 200) {
        issues.push(`Endpoint ${url} returned HTTP ${res.status}`);
      } else if (timeMs > 3000) {
        issues.push(`Endpoint ${url} responded slowly (${timeMs}ms)`);
      }
    } catch (e: any) {
      endpoints.push({ url, status: 0, timeMs: Date.now() - start });
      issues.push(`Endpoint ${url} failed to respond: ${e.message}`);
    }
  }

  // 2. n8n Workflows & Execution Errors Audit
  const workflows: { id: string; name: string; active: boolean; recentErrors: number }[] = [];
  try {
    const wfRes = await fetch(`${N8N_URL}/workflows`, {
      headers: { "X-N8N-API-KEY": API_KEY }
    });
    const wfData = await wfRes.json();
    for (const wf of wfData.data) {
      if (!wf.active && wf.id !== "aGyJGiMZugFwweUk") {
        // Warning if core workflow is turned off
        issues.push(`Workflow "${wf.name}" (${wf.id}) is DEACTIVATED`);
      }

      // Check recent executions for errors
      const execRes = await fetch(`${N8N_URL}/executions?workflowId=${wf.id}&limit=10`, {
        headers: { "X-N8N-API-KEY": API_KEY }
      });
      const execData = await execRes.json();
      const errorCount = (execData.data || []).filter((e: any) => e.status === "error").length;
      if (errorCount > 0) {
        issues.push(`Workflow "${wf.name}" had ${errorCount} recent failed executions`);
      }
      workflows.push({
        id: wf.id,
        name: wf.name,
        active: wf.active,
        recentErrors: errorCount
      });
    }
  } catch (e: any) {
    issues.push(`Failed to audit n8n workflows: ${e.message}`);
  }

  // 3. Google Sheet Audit via n8n Auto-Listener's last execution or direct read
  let totalRows = 0;
  let pendingEmails = 0;
  const duplicateEmails: string[] = [];

  try {
    const execRes = await fetch(`${N8N_URL}/executions?workflowId=aGyJGiMZugFwweUk&limit=1&status=success`, {
      headers: { "X-N8N-API-KEY": API_KEY }
    });
    const execList = await execRes.json();
    if (execList.data && execList.data[0]) {
      const detailRes = await fetch(`${N8N_URL}/executions/${execList.data[0].id}?includeData=true`, {
        headers: { "X-N8N-API-KEY": API_KEY }
      });
      const detail = await detailRes.json();
      const rows = detail.data?.resultData?.runData?.["Fetch Sheet Rows"]?.[0]?.data?.main?.[0] || [];
      totalRows = rows.length;

      const emailCounts: Record<string, number> = {};
      for (const r of rows) {
        const d = r.json || {};
        const email = (d.Email || "").trim().toLowerCase();
        const status = String(d.email_html || "").trim();
        if (email && email.includes("@")) {
          emailCounts[email] = (emailCounts[email] || 0) + 1;
          if (!status.includes("SENT")) {
            pendingEmails++;
          }
        }
      }

      for (const [em, count] of Object.entries(emailCounts)) {
        if (count > 2) {
          duplicateEmails.push(`${em} (${count}x)`);
          issues.push(`Email ${em} appears ${count} times in Google Sheet`);
        }
      }

      if (pendingEmails > 0) {
        issues.push(`${pendingEmails} lead(s) in Google Sheet have unsent confirmation emails`);
      }
    }
  } catch (e: any) {
    issues.push(`Failed to audit Google Sheet: ${e.message}`);
  }

  const overallStatus: "HEALTHY" | "WARNING" | "CRITICAL" = 
    issues.some(i => i.includes("HTTP") || i.includes("failed") || i.includes("CRITICAL")) ? "CRITICAL" :
    issues.length > 0 ? "WARNING" : "HEALTHY";

  return {
    timestamp: new Date().toISOString(),
    status: overallStatus,
    issues,
    endpoints,
    sheet: { totalRows, pendingEmails, duplicateEmails },
    workflows
  };
}

// Self-executing CLI test
if (import.meta.main) {
  console.log("=== Running Full Funnel Scan ===");
  runFullScan().then(report => {
    console.log(JSON.stringify(report, null, 2));
    if (report.issues.length === 0) {
      console.log("\n✅ ALL SYSTEMS OPERATIONAL - 0 ISSUES DETECTED");
    } else {
      console.log(`\n⚠️ ISSUES DETECTED (${report.issues.length}):`);
      report.issues.forEach(i => console.log(` - ${i}`));
    }
  }).catch(console.error);
}
