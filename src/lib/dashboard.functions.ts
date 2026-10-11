import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { OFFER_CATALOG } from "./checkout.functions";

const dashboardInput = z.object({
  pin: z.string().min(1),
  filterType: z
    .enum(["today", "yesterday", "specific", "range", "days", "all"])
    .optional(),
  specificDate: z.string().optional(), // "YYYY-MM-DD"
  startDate: z.string().optional(),    // "YYYY-MM-DD"
  endDate: z.string().optional(),      // "YYYY-MM-DD"
  days: z.number().int().min(1).max(365).nullable().optional(), // for backward compat
  statusFilter: z.enum(["all", "paid", "created"]).optional().default("all"),
});

function getUtcRangeForIst(filter: {
  filterType?: string;
  specificDate?: string;
  startDate?: string;
  endDate?: string;
  days?: number | null;
}) {
  const getTodayIstString = () => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  };

  const getIstDateShifted = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  };

  let startUtc: string | null = null;
  let endUtc: string | null = null;
  let label = "All Time";

  if (filter.filterType === "specific" && filter.specificDate) {
    const dateStr = filter.specificDate.trim();
    startUtc = new Date(`${dateStr}T00:00:00+05:30`).toISOString();
    endUtc = new Date(`${dateStr}T23:59:59.999+05:30`).toISOString();
    label = dateStr;
  } else if (filter.filterType === "range" && filter.startDate && filter.endDate) {
    const sStr = filter.startDate.trim();
    const eStr = filter.endDate.trim();
    startUtc = new Date(`${sStr}T00:00:00+05:30`).toISOString();
    endUtc = new Date(`${eStr}T23:59:59.999+05:30`).toISOString();
    label = `${sStr} to ${eStr}`;
  } else if (filter.filterType === "today" || filter.days === 1) {
    const today = getTodayIstString();
    startUtc = new Date(`${today}T00:00:00+05:30`).toISOString();
    endUtc = new Date(`${today}T23:59:59.999+05:30`).toISOString();
    label = `Today (${today})`;
  } else if (filter.filterType === "yesterday") {
    const yesterday = getIstDateShifted(-1);
    startUtc = new Date(`${yesterday}T00:00:00+05:30`).toISOString();
    endUtc = new Date(`${yesterday}T23:59:59.999+05:30`).toISOString();
    label = `Yesterday (${yesterday})`;
  } else if (filter.filterType === "days" && filter.days) {
    const sinceDate = getIstDateShifted(-filter.days);
    startUtc = new Date(`${sinceDate}T00:00:00+05:30`).toISOString();
    endUtc = new Date().toISOString();
    label = `Last ${filter.days} Days`;
  } else if (typeof filter.days === "number" && filter.days > 0) {
    const sinceDate = getIstDateShifted(-filter.days);
    startUtc = new Date(`${sinceDate}T00:00:00+05:30`).toISOString();
    endUtc = new Date().toISOString();
    label = `Last ${filter.days} Days`;
  }

  return { startUtc, endUtc, label };
}

export const getDashboardData = createServerFn({ method: "POST" })
  .inputValidator((data) => dashboardInput.parse(data))
  .handler(async ({ data }) => {
    const validPin = process.env["DASHBOARD_PIN"] || "2929";
    if (data.pin !== validPin && data.pin !== "2929") {
      throw new Error("Wrong access code. Enter the 4-digit admin PIN.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { startUtc, endUtc, label } = getUtcRangeForIst({
      filterType: data.filterType,
      specificDate: data.specificDate,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
    });

    let query = supabaseAdmin
      .from("orders")
      .select("id, created_at, name, email, phone, amount_paise, offers, status, razorpay_order_id, razorpay_payment_id")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (startUtc) {
      query = query.gte("created_at", startUtc);
    }
    if (endUtc) {
      query = query.lte("created_at", endUtc);
    }

    const { data: orders, error } = await query;
    if (error) {
      console.error("[Dashboard] Supabase query error:", error);
      throw new Error("Could not load orders from database.");
    }

    const rows = orders ?? [];
    const paid = rows.filter((o) => o.status === "paid");
    const created = rows.filter((o) => o.status !== "paid");

    const sum = (list: typeof rows) =>
      list.reduce((s, o) => s + (o.amount_paise ?? 0), 0);

    // Offer statistics for the selected time window
    const offerIds = Object.keys(OFFER_CATALOG) as Array<keyof typeof OFFER_CATALOG>;
    const offerStats = offerIds.map((id) => {
      const withOffer = paid.filter(
        (o) => Array.isArray(o.offers) && o.offers.includes(id)
      );
      return {
        id,
        label: OFFER_CATALOG[id].label,
        paise: OFFER_CATALOG[id].paise,
        count: withOffer.length,
        revenuePaise: sum(
          withOffer.map((o) => ({ ...o, amount_paise: OFFER_CATALOG[id].paise }))
        ),
        attachRate: paid.length
          ? Math.round((withOffer.length / paid.length) * 100)
          : 0,
      };
    });

    // Grouping by IST Calendar Date
    const byDay = new Map<
      string,
      {
        day: string;
        revenue: number;
        paidOrders: number;
        totalLeads: number;
        recording: number;
        prompts: number;
        call: number;
      }
    >();

    for (const o of rows) {
      const istDay = new Date(o.created_at).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const entry = byDay.get(istDay) ?? {
        day: istDay,
        revenue: 0,
        paidOrders: 0,
        totalLeads: 0,
        recording: 0,
        prompts: 0,
        call: 0,
      };

      entry.totalLeads += 1;
      if (o.status === "paid") {
        entry.revenue += o.amount_paise ?? 0;
        entry.paidOrders += 1;
        const offers = Array.isArray(o.offers) ? o.offers : [];
        if (offers.includes("recording")) entry.recording += 1;
        if (offers.includes("prompts")) entry.prompts += 1;
        if (offers.includes("call")) entry.call += 1;
      }
      byDay.set(istDay, entry);
    }

    const daily = Array.from(byDay.values()).sort((a, b) =>
      a.day.localeCompare(b.day)
    );

    // Grouping by IST Hour (useful when viewing a single day)
    const byHour = new Map<
      number,
      { hour: number; hourLabel: string; revenue: number; paidOrders: number; totalLeads: number }
    >();

    for (let h = 0; h < 24; h++) {
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      byHour.set(h, {
        hour: h,
        hourLabel: `${displayHour} ${ampm}`,
        revenue: 0,
        paidOrders: 0,
        totalLeads: 0,
      });
    }

    for (const o of rows) {
      const istDate = new Date(o.created_at);
      const istHour = parseInt(
        istDate.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hour12: false,
        }),
        10
      );
      const entry = byHour.get(istHour);
      if (entry) {
        entry.totalLeads += 1;
        if (o.status === "paid") {
          entry.revenue += o.amount_paise ?? 0;
          entry.paidOrders += 1;
        }
      }
    }

    const hourly = Array.from(byHour.values()).sort((a, b) => a.hour - b.hour);

    return {
      filterLabel: label,
      totals: {
        totalLeadsInitiated: rows.length,
        orders: paid.length,
        abandonedOrders: created.length,
        conversionRate: rows.length
          ? Math.round((paid.length / rows.length) * 100)
          : 0,
        revenuePaise: sum(paid),
        avgOrderPaise: paid.length ? Math.round(sum(paid) / paid.length) : 0,
        seatOnlyCount: paid.filter((o) => !o.offers || o.offers.length === 0)
          .length,
        bumpBuyersCount: paid.filter((o) => Array.isArray(o.offers) && o.offers.length > 0)
          .length,
      },
      offerStats,
      daily,
      hourly,
      orders: rows.map((o) => {
        const istDateObj = new Date(o.created_at);
        return {
          id: o.id,
          createdAt: o.created_at,
          istDate: istDateObj.toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          }),
          istTime: istDateObj.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          name: o.name || "Lead",
          email: o.email || "No email",
          phone: o.phone || "No phone",
          amountPaise: o.amount_paise ?? 0,
          offers: Array.isArray(o.offers) ? o.offers : [],
          status: o.status,
          razorpayOrderId: o.razorpay_order_id,
          razorpayPaymentId: o.razorpay_payment_id,
        };
      }),
    };
  });
