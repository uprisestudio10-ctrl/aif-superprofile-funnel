import { createServerFn } from "@tanstack/react-start";
import { Buffer } from "node:buffer";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const WORKSHOP_PRICE_PAISE = 2900;

// Meta Conversions API Configuration
const META_PIXEL_ID = process.env["META_PIXEL_ID"] || "1462195472776524";
const META_CAPI_TOKEN =
  process.env["META_CAPI_TOKEN"] ||
  "EAAPdKUgkm4kBSgzKwkk4rV6DJRRnd43XZC43C3te57GKcymIPyauf08aC9IWLB8MPY1sx856PcUfjoinZCuSJJSEdCquY8HXxQmwqou93euJhVfELhSIr0ZA1ZAA6ZCTmpKm35X2LG4cx6e8NkajwTAudBDqQSBIWPanQv02ULIpQAZBFZAfZCkItqpdojrlRQZDZD";

// Add-on offer catalog — prices live here on the server so the client
// can never send a tampered amount.
export const OFFER_CATALOG = {
  combo: { label: "VIP All-Access Bundle (Recordings + Prompts)", paise: 21900 },
  recording: { label: "Workshop Recording + Notes PDF", paise: 14900 },
  prompts: { label: "300+ Done-For-You Prompts", paise: 19900 },
  call: { label: "1-On-1 Strategy Consultation Call", paise: 49900 },
} as const;

export type OfferId = keyof typeof OFFER_CATALOG;

const offerIdSchema = z.enum(["combo", "recording", "prompts", "call"]);

const NOT_CONFIGURED = "Payment gateway is not configured yet. Please try again shortly.";

const ACTIVE_LIVE_KEY_ID = "rzp_live_TreMzXPg39hEiU";
const ACTIVE_LIVE_KEY_SECRET = "MFYrqAT6gbenfRN9PH0421rR";

function getAuthHeader(kId: string, kSec: string): string {
  try {
    return `Basic ${Buffer.from(`${kId}:${kSec}`).toString("base64")}`;
  } catch {
    return `Basic ${btoa(`${kId}:${kSec}`)}`;
  }
}

const createOrderInput = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(120),
  phone: z.string().regex(/^[0-9]{10,13}$/),
  offers: z.array(offerIdSchema).max(3),
  tracking: z
    .object({
      utm_source: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
      utm_term: z.string().optional(),
      fbclid: z.string().optional(),
      fbp: z.string().optional(),
      fbc: z.string().optional(),
    })
    .optional(),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => createOrderInput.parse(data))
  .handler(async ({ data }) => {
    const envKeyId = (process.env["RAZORPAY_KEY_ID"] || "").trim().replace(/["']/g, "");
    const envKeySecret = (process.env["RAZORPAY_KEY_SECRET"] || "").trim().replace(/["']/g, "");

    const keyId = envKeyId && !envKeyId.includes("ThPkZr") ? envKeyId : ACTIVE_LIVE_KEY_ID;
    const keySecret = envKeySecret && !envKeySecret.includes("NEOqVW") ? envKeySecret : ACTIVE_LIVE_KEY_SECRET;

    const uniqueOffers = Array.from(new Set(data.offers));
    const amount =
      WORKSHOP_PRICE_PAISE +
      uniqueOffers.reduce((sum, id) => sum + OFFER_CATALOG[id].paise, 0);

    const safeNotes: Record<string, string> = {
      name: (data.name || "").slice(0, 80),
      email: (data.email || "").slice(0, 80),
      phone: (data.phone || "").slice(0, 15),
      offers: uniqueOffers.length ? uniqueOffers.join(",") : "none",
    };

    if (data.tracking?.utm_source) safeNotes.utm_source = data.tracking.utm_source.slice(0, 100);
    if (data.tracking?.utm_campaign) safeNotes.utm_campaign = data.tracking.utm_campaign.slice(0, 100);
    if (data.tracking?.fbclid) safeNotes.fbclid = data.tracking.fbclid.slice(0, 200);
    if (data.tracking?.fbp) safeNotes.fbp = data.tracking.fbp.slice(0, 100);
    if (data.tracking?.fbc) safeNotes.fbc = data.tracking.fbc.slice(0, 100);

    const payload = {
      amount,
      currency: "INR",
      receipt: `ws-${Date.now()}`,
      notes: safeNotes,
    };

    let res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(keyId, keySecret),
      },
      body: JSON.stringify(payload),
    });

    // Fallback 1: If env credentials failed, immediately retry with verified active credentials
    if (!res.ok && (keyId !== ACTIVE_LIVE_KEY_ID || keySecret !== ACTIVE_LIVE_KEY_SECRET)) {
      res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(ACTIVE_LIVE_KEY_ID, ACTIVE_LIVE_KEY_SECRET),
        },
        body: JSON.stringify(payload),
      });
    }

    // Fallback 2: If notes validation error caused failure, retry with minimal notes
    if (!res.ok) {
      res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(ACTIVE_LIVE_KEY_ID, ACTIVE_LIVE_KEY_SECRET),
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `ws-${Date.now()}`,
          notes: {
            name: (data.name || "").slice(0, 50),
            email: (data.email || "").slice(0, 50),
            phone: (data.phone || "").slice(0, 15),
          },
        }),
      });
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Razorpay order creation failed:", res.status, errText);
      let errMsg = "Could not start your payment with Razorpay. Please try again.";
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.description) {
          errMsg = parsed.error.description;
        }
      } catch {}
      throw new Error(errMsg);
    }

    const order = (await res.json()) as { id: string; amount: number; currency: string };

    // Save the order for the admin dashboard (best-effort — never block payment).
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("orders").insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        amount_paise: amount,
        offers: uniqueOffers,
        razorpay_order_id: order.id,
        status: "created",
      });
    } catch (e) {
      console.error("order insert failed", e);
    }

    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId: ACTIVE_LIVE_KEY_ID };
  });

const verifyInput = z.object({
  razorpay_order_id: z.string().min(5),
  razorpay_payment_id: z.string().min(5),
  razorpay_signature: z.string().min(5),
  customer: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      offers: z.array(offerIdSchema).optional(),
      amount: z.number().optional(),
      tracking: z
        .object({
          utm_source: z.string().optional(),
          utm_campaign: z.string().optional(),
          utm_content: z.string().optional(),
          utm_term: z.string().optional(),
          fbclid: z.string().optional(),
          fbp: z.string().optional(),
          fbc: z.string().optional(),
          user_agent: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Send server-side purchase event to Meta Conversions API (CAPI)
async function sendMetaCapiPurchase(params: {
  eventId: string;
  email: string;
  phone: string;
  name: string;
  amount: number;
  fbp?: string;
  fbc?: string;
  userAgent?: string;
}) {
  if (!META_CAPI_TOKEN || !META_PIXEL_ID) return;

  try {
    const cleanPhone = params.phone.replace(/\D/g, "").slice(-10);
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const firstName = params.name.trim().split(" ")[0] || "";

    const userData: Record<string, unknown> = {
      em: [createHash("sha256").update(params.email.trim().toLowerCase()).digest("hex")],
      ph: [createHash("sha256").update(formattedPhone).digest("hex")],
      country: [createHash("sha256").update("in").digest("hex")],
    };

    if (firstName) {
      userData.fn = [createHash("sha256").update(firstName.toLowerCase()).digest("hex")];
    }
    if (params.eventId) {
      userData.external_id = [createHash("sha256").update(params.eventId).digest("hex")];
    }
    if (params.fbp) userData.fbp = params.fbp;
    if (params.fbc) userData.fbc = params.fbc;
    if (params.userAgent) userData.client_user_agent = params.userAgent;

    const capiPayload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: params.eventId,
          event_source_url: "https://live.prateekmayani.com/thank-you-5034",
          action_source: "website",
          user_data: userData,
          custom_data: {
            currency: "INR",
            value: params.amount,
            content_name: "AI Influencer Workshop",
          },
        },
      ],
    };

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(capiPayload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Meta CAPI] Dispatch error:", errText);
    } else {
      console.log(`[Meta CAPI] Purchase event sent for ${params.eventId} (₹${params.amount})`);
    }
  } catch (err) {
    console.error("[Meta CAPI] Dispatch exception:", err);
  }
}

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((data) => verifyInput.parse(data))
  .handler(async ({ data }) => {
    const envSecret = (process.env["RAZORPAY_KEY_SECRET"] || "").trim().replace(/["']/g, "");
    const secretsToTry = [
      ACTIVE_LIVE_KEY_SECRET,
      envSecret,
      "NEOqVW7r0kXy0pU3r5PmnaCg",
    ].filter(Boolean);

    let verified = false;
    for (const secret of secretsToTry) {
      try {
        const expected = createHmac("sha256", secret)
          .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
          .digest("hex");
        const a = Buffer.from(expected);
        const b = Buffer.from(data.razorpay_signature);
        if (a.length === b.length && timingSafeEqual(a, b)) {
          verified = true;
          break;
        }
      } catch {}
    }

    if (!verified)
      throw new Error(
        "Payment verification failed. If the amount was deducted it will auto-refund — please contact support.",
      );

    let orderName = data.customer?.name || "";
    let orderEmail = data.customer?.email || "";
    let orderPhone = data.customer?.phone || "";
    let orderOffers: OfferId[] = (data.customer?.offers as OfferId[]) || [];
    let amountPaise = data.customer?.amount || 0;

    // Mark the order as paid in Supabase & fetch details if missing
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: dbOrder } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("razorpay_order_id", data.razorpay_order_id)
        .maybeSingle();

      if (dbOrder) {
        if (!orderName) orderName = dbOrder.name;
        if (!orderEmail) orderEmail = dbOrder.email;
        if (!orderPhone) orderPhone = dbOrder.phone;
        if (!orderOffers.length && Array.isArray(dbOrder.offers)) {
          orderOffers = dbOrder.offers as OfferId[];
        }
        if (!amountPaise) amountPaise = dbOrder.amount_paise;
      }

      await supabaseAdmin
        .from("orders")
        .update({ status: "paid", razorpay_payment_id: data.razorpay_payment_id })
        .eq("razorpay_order_id", data.razorpay_order_id);
    } catch (e) {
      console.error("order update failed", e);
    }

    const tracking = data.customer?.tracking || {};
    const finalAmountRupees = Math.round(amountPaise / 100);

    // 1. Send Meta Conversions API (Server-Side) Purchase Event
    await sendMetaCapiPurchase({
      eventId: data.razorpay_payment_id,
      email: orderEmail,
      phone: orderPhone,
      name: orderName,
      amount: finalAmountRupees,
      fbp: tracking.fbp,
      fbc: tracking.fbc,
      userAgent: tracking.user_agent,
    });

    // 2. Trigger n8n Webhook for Google Sheet Automation
    const n8nWebhookUrl =
      process.env["N8N_WEBHOOK_URL"] ||
      "https://prateek.n8n.preetamsoni.com/webhook/ai-influencer-leads";
    if (n8nWebhookUrl) {
      try {
        const hasCall = orderOffers.includes("call");
        const isCombo = orderOffers.includes("combo");
        const hasRecording = isCombo || orderOffers.includes("recording");
        const hasPrompts = isCombo || orderOffers.includes("prompts");
        const cleanPhone = orderPhone.replace(/\D/g, "").slice(-10);
        const formattedPhone = cleanPhone.length === 10 ? cleanPhone : orderPhone;

        const now = new Date();
        const dateStr = now.toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const timeStr = now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const payload = {
          event: "payment_success",
          name: orderName,
          number: formattedPhone,
          email: orderEmail,
          date: dateStr,
          time: timeStr,
          amount: finalAmountRupees,
          amount_formatted: `₹${finalAmountRupees}`,
          workshop_date: "29th October 2026 (Thursday) 7:00 PM IST",
          utm_source: tracking.utm_source || "",
          utm_campaign: tracking.utm_campaign || "",
          utm_content: tracking.utm_content || "",
          utm_term: tracking.utm_term || "",
          fb_click_id: tracking.fbclid || "",
          fbp: tracking.fbp || "",
          fbc: tracking.fbc || "",
          has_call_booked: hasCall,
          call_booked: hasCall ? "YES" : "NO",
          call_status: hasCall ? "Pending" : "N/A",
          recording_purchased: hasRecording ? "YES" : "NO",
          prompts_purchased: hasPrompts ? "YES" : "NO",
          offers_label:
            orderOffers.map((id) => OFFER_CATALOG[id]?.label || id).join(", ") || "Workshop Only",
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          status: "PAID",
        };

        await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (webhookErr) {
        console.error("n8n webhook dispatch error:", webhookErr);
      }
    }

    return { ok: true };
  });
