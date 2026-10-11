# 🚀 AI Influencer Workshop - n8n Lead Sheet Automation

This automation connects the website's Razorpay checkout directly to your **Google Sheet** via **n8n**:
1. **Main Lead Sheet Tab**: Appends every registration with full UTM tracking and Meta Ad parameters.
2. **`Call Bookings` Tab (Same Spreadsheet)**: If the attendee selected the **1:1 Strategy Consultation Call** add-on, it automatically appends a duplicate row to this tab with `Call Status: Pending` so your sales/calling team can call them right away.

---

## 📊 Google Sheet Columns

### Tab 1: Main Lead Sheet
Make sure the main tab (e.g. `Sheet1` or your current sheet tab name) has these exact headers in **Row 1**:
```text
Name | Number | Email | Date | Time | Amount | Workshop Date | Utm source | Utm campaign | Utm content | Utm term | FB Click ID
```

### Tab 2: `Call Bookings`
In the **same Google Sheet**, add a new tab titled **`Call Bookings`** with these headers in **Row 1**:
```text
Name | Number | Email | Date | Time | Amount | Workshop Date | Call Status | Utm source | FB Click ID
```

---

## 🛠️ n8n Setup (1-Click Import)

1. Open your **n8n** dashboard.
2. Click **Add Workflow** -> three dots menu (top right) -> **Import from File / JSON**.
3. Select or paste the contents of [`automation/n8n_leads_and_calls_workflow.json`](./n8n_leads_and_calls_workflow.json).
4. Click on **Append to Main Lead Sheet** node:
   - Select your Google account credential.
   - Enter your Google Sheet URL / ID.
   - Select your main lead sheet tab.
5. Click on **Append to Call Bookings Tab** node:
   - Select the same Google Sheet.
   - Select sheet tab: `Call Bookings`.
6. Click **Save** and toggle the workflow to **Active**.
7. Copy the **Production Webhook URL** from the Webhook Trigger node.

---

## 🔗 Connect Webhook to Website

Add the Webhook URL into `.env` (or in Lovable project environment variables):

```env
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/ai-influencer-leads"
```
