import * as fs from "fs";

const N8N_URL = "https://prateek.n8n.preetamsoni.com/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3OWZjNTFlMi1mMTdlLTQ1MDktYTAzMS01NzFjNTAwMWM2MTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTkzMDgzNTEtNDY5Ny00YWIxLWJmZGItNzI5MDk5MTNlNWFkIiwiaWF0IjoxNzkxNjk1NzUyfQ.z1IZaAAdjaw1bxCtFN5N_xbnyQHCVAPuDGnzuqzXRjo";

async function fetchSheetRows(): Promise<any[]> {
  const execRes = await fetch(`${N8N_URL}/executions?workflowId=aGyJGiMZugFwweUk&limit=1`, {
    headers: { "X-N8N-API-KEY": API_KEY }
  });
  const execList = await execRes.json();
  const detailRes = await fetch(`${N8N_URL}/executions/${execList.data[0].id}?includeData=true`, {
    headers: { "X-N8N-API-KEY": API_KEY }
  });
  const detail = await detailRes.json();
  const runData = detail.data?.resultData?.runData || {};
  return (runData["Fetch Sheet Rows"]?.[0]?.data?.main?.[0] || []).map((r: any) => r.json);
}

function parseCSV(content: string): any[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle quoted fields
    const values: string[] = [];
    let inQuotes = false;
    let current = "";
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] || "";
    });
    rows.push(obj);
  }
  return rows;
}

async function main() {
  console.log("=== Verifying 21st Oct & 22nd Oct Leads in Google Sheet ===");

  // 1. Fetch live Google Sheet rows
  let sheetRows = await fetchSheetRows();
  console.log(`Current Total Rows in Google Sheet: ${sheetRows.length}`);

  // 2. Parse CSV
  const csvContent = fs.readFileSync("automation/user_superprofile_export.csv", "utf8");
  const allOrders = parseCSV(csvContent);

  // Filter 21 Oct and 22 Oct Received payments
  const relevantOrders = allOrders.filter(o => {
    const d = o["Date"] || "";
    const isTargetDate = d.includes("21 Oct") || d.includes("22 Oct");
    const isReceived = (o["Status"] || "").toLowerCase() === "received";
    return isTargetDate && isReceived;
  });

  console.log(`Total Received Payments in CSV for 21st & 22nd Oct: ${relevantOrders.length}\n`);

  // Build sheet index of emails and payment IDs
  const existingEmails = new Set(sheetRows.map(r => (r.Email || r.email || "").trim().toLowerCase()));
  const existingPayments = new Set(sheetRows.map(r => (r["Payment ID"] || r.Payment_ID || "").trim()));

  const missing: any[] = [];
  const verified: any[] = [];

  for (const o of relevantOrders) {
    const email = (o["Email"] || o["Customer Email"] || "").trim().toLowerCase();
    const pid = (o["Payment ID"] || "").trim();
    const name = (o["What's your name?"] || o["Name"] || "").trim();
    const date = o["Date"];
    const amount = o["Paid By Customer"];

    const isPresent = existingEmails.has(email) || (pid && existingPayments.has(pid));
    if (isPresent) {
      verified.push({ name, email, pid, date, amount });
    } else {
      missing.push({
        name,
        email,
        phone: (o["Phone number"] || o["Customer Phone"] || "").replace(/\D/g, "").slice(-10),
        amount: Number(amount) || 29,
        payment_id: pid,
        date: date.includes("22 Oct") ? "22 Oct 2026" : "21 Oct 2026",
        time: date.split(" ")[2] + " " + date.split(" ")[3],
        product: o["Product Title"]
      });
    }
  }

  console.log(`Verified Already in Sheet: ${verified.length}`);
  console.log(`Missing to Ingest: ${missing.length}\n`);

  if (missing.length > 0) {
    console.log("=== Ingesting Missing Leads into Sheet via n8n ===");
    for (const m of missing) {
      console.log(`Ingesting missing lead: ${m.name} (${m.email}) - ₹${m.amount}...`);
      const res = await fetch("https://prateek.n8n.preetamsoni.com/webhook/ai-influencer-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m)
      });
      console.log(`  -> Status: ${res.status}`);
      await new Promise(r => setTimeout(r, 1000));
    }
    console.log("\nWaiting 5 seconds for Google Sheet sync...");
    await new Promise(r => setTimeout(r, 5000));
  }

  // 3. Re-verify Google Sheet
  sheetRows = await fetchSheetRows();
  console.log(`\n=== Final Google Sheet Verification (Total Rows: ${sheetRows.length}) ===`);

  const oct21Leads: any[] = [];
  const oct22Leads: any[] = [];

  for (const r of sheetRows) {
    const dStr = String(r["Date "] || r.Date || "");
    const name = r.Name || r.name;
    const email = r.Email || r.email;
    const amt = r.Amount || r.amount;
    const num = r.Number || r.Phone || "";

    if (dStr.includes("2026-10-21") || dStr.includes("21 Oct")) {
      oct21Leads.push({ name, email, num, amt, date: dStr });
    } else if (dStr.includes("2026-10-22") || dStr.includes("22 Oct")) {
      oct22Leads.push({ name, email, num, amt, date: dStr });
    }
  }

  console.log(`\n📅 21st October Confirmed Leads in Sheet (${oct21Leads.length}):`);
  oct21Leads.forEach((l, idx) => console.log(`  ${idx + 1}. ${l.name} | ${l.email} | ${l.num} | ${l.amt} | ${l.date}`));

  console.log(`\n📅 22nd October Confirmed Leads in Sheet (${oct22Leads.length}):`);
  oct22Leads.forEach((l, idx) => console.log(`  ${idx + 1}. ${l.name} | ${l.email} | ${l.num} | ${l.amt} | ${l.date}`));
}

main().catch(console.error);
