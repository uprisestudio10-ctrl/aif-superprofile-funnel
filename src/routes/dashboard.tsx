import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getDashboardData } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Sales & Leads Analytics Dashboard | AI Influencer Workshop" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
});

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const inr = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function DashboardPage() {
  const [pin, setPin] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("dash-pin") ?? "" : ""
  );

  // Filter states
  const [filterType, setFilterType] = useState<
    "today" | "yesterday" | "specific" | "range" | "days" | "all"
  >("days");
  const [days, setDays] = useState<number | null>(7);
  const [specificDate, setSpecificDate] = useState("2026-09-29");
  const [startDate, setStartDate] = useState("2026-09-28");
  const [endDate, setEndDate] = useState("2026-09-30");
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Table filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "created">("all");

  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async (
    p: string,
    fType: "today" | "yesterday" | "specific" | "range" | "days" | "all",
    opts?: {
      days?: number | null;
      specificDate?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboardData({
        data: {
          pin: p,
          filterType: fType,
          days: opts?.days !== undefined ? opts.days : days,
          specificDate: opts?.specificDate ?? specificDate,
          startDate: opts?.startDate ?? startDate,
          endDate: opts?.endDate ?? endDate,
        },
      });
      setData(res);
      sessionStorage.setItem("dash-pin", p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Filtered orders list based on search and status tabs
  const filteredOrders = useMemo(() => {
    if (!data) return [];
    return data.orders.filter((o) => {
      // Status filter
      if (statusFilter === "paid" && o.status !== "paid") return false;
      if (statusFilter === "created" && o.status === "paid") return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(q))
      );
    });
  }, [data, searchQuery, statusFilter]);

  // Export to CSV function
  const handleExportCSV = () => {
    if (!filteredOrders.length) return;
    const headers = [
      "Date (IST)",
      "Time (IST)",
      "Name",
      "Phone",
      "Email",
      "Amount (INR)",
      "Status",
      "Add-ons / Offers",
      "Payment ID",
      "Order ID",
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.istDate}"`,
      `"${o.istTime}"`,
      `"${o.name.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.email}"`,
      (o.amountPaise / 100).toFixed(0),
      o.status.toUpperCase(),
      `"${o.offers.join(", ")}"`,
      `"${o.razorpayPaymentId || ""}"`,
      `"${o.razorpayOrderId || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `aif_orders_${(data?.filterLabel || "export").replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------------------------------------------- */
  /* SCREEN 1: PIN AUTH GATE                             */
  /* ---------------------------------------------------- */
  if (!data) {
    return (
      <main className="mx-auto flex min-h-[75vh] w-full max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-[#121316] p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wider text-primary">
            🔒 ADMIN REVENUE INTELLIGENCE
          </div>
          <h1 className="mt-4 font-display text-[24px] font-extrabold text-white">
            <span className="text-gold-grad">Sales & Leads</span> Dashboard
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Enter your 4-digit access code (e.g. 2929) to inspect live leads, revenue, and bump attach rates.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void loadData(pin, filterType);
            }}
          >
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (e.g. 2929)"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center font-mono text-[16px] tracking-widest text-white outline-none transition-colors focus:border-primary"
              autoComplete="off"
            />
            {error && <p className="text-[13px] font-semibold text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full rounded-xl bg-primary px-5 py-3.5 font-display text-[15px] font-extrabold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Authenticating…" : "Unlock Sales Dashboard →"}
            </button>
          </form>
        </div>
        <Link to="/" className="mt-6 block text-center text-[13px] text-muted-foreground hover:text-white">
          ← Back To Main Website
        </Link>
      </main>
    );
  }

  const isSingleDay =
    filterType === "specific" || filterType === "today" || filterType === "yesterday";
  const maxRevenue = Math.max(1, ...data.daily.map((d) => d.revenue));
  const maxHourlyRevenue = Math.max(1, ...(data.hourly?.map((h) => h.revenue) || [1]));

  /* ---------------------------------------------------- */
  /* SCREEN 2: ACTIVE DASHBOARD                           */
  /* ---------------------------------------------------- */
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-[22px] font-extrabold text-white sm:text-[26px]">
              <span className="text-gold-grad">Sales & Leads</span> Analytics
            </h1>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
              Live IST
            </span>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Current Filter: <strong className="text-primary">{data.filterLabel}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => void loadData(pin, filterType)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/10"
          >
            <span>🔄</span>
            <span>{loading ? "Refreshing…" : "Refresh"}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-primary/20 border border-primary/40 px-3.5 py-2 text-[12px] font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <span>📥 Export CSV</span>
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("dash-pin");
              setData(null);
              setPin("");
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-muted-foreground hover:text-white"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Date Filter Quick Bar */}
      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filter: Today */}
          <button
            onClick={() => {
              setFilterType("today");
              setShowCustomPicker(false);
              void loadData(pin, "today");
            }}
            className={`rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all ${
              filterType === "today"
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white"
            }`}
          >
            Today
          </button>

          {/* Quick Filter: Yesterday */}
          <button
            onClick={() => {
              setFilterType("yesterday");
              setShowCustomPicker(false);
              void loadData(pin, "yesterday");
            }}
            className={`rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all ${
              filterType === "yesterday"
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white"
            }`}
          >
            Yesterday
          </button>

          {/* ⭐ Quick Filter: 29 Sep (Requested by user) */}
          <button
            onClick={() => {
              setFilterType("specific");
              setSpecificDate("2026-09-29");
              setShowCustomPicker(false);
              void loadData(pin, "specific", { specificDate: "2026-09-29" });
            }}
            className={`relative rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all ${
              filterType === "specific" && specificDate === "2026-09-29"
                ? "border-amber-400 bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:border-amber-400 hover:bg-amber-400/20"
            }`}
          >
            <span className="mr-1">🎯</span>
            <span>29 Sep (Webinar Day)</span>
          </button>

          {/* Quick Filter: Last 7 Days */}
          <button
            onClick={() => {
              setFilterType("days");
              setDays(7);
              setShowCustomPicker(false);
              void loadData(pin, "days", { days: 7 });
            }}
            className={`rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all ${
              filterType === "days" && days === 7
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white"
            }`}
          >
            Last 7 Days
          </button>

          {/* Quick Filter: Last 30 Days */}
          <button
            onClick={() => {
              setFilterType("days");
              setDays(30);
              setShowCustomPicker(false);
              void loadData(pin, "days", { days: 30 });
            }}
            className={`rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all ${
              filterType === "days" && days === 30
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white"
            }`}
          >
            Last 30 Days
          </button>

          {/* Quick Filter: All Time */}
          <button
            onClick={() => {
              setFilterType("all");
              setDays(null);
              setShowCustomPicker(false);
              void loadData(pin, "all", { days: null });
            }}
            className={`rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all ${
              filterType === "all"
                ? "border-primary bg-primary text-primary-foreground shadow-md"
                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white"
            }`}
          >
            All Time
          </button>

          {/* Custom Date Toggle */}
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`rounded-xl border px-3.5 py-2 text-[12px] font-bold transition-all ${
              showCustomPicker
                ? "border-primary/60 bg-primary/20 text-primary"
                : "border-white/15 bg-white/5 text-white/80 hover:border-white/30"
            }`}
          >
            📅 Pick Date / Range {showCustomPicker ? "▲" : "▼"}
          </button>
        </div>

        {/* Custom Date Pickers Drawer */}
        {showCustomPicker && (
          <div className="rounded-2xl border border-white/10 bg-[#121316] p-4 shadow-xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Option A: Specific Single Day */}
              <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
                <p className="text-[12px] font-bold text-white">Select Any Specific Date (IST):</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="flex-1 rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 text-[13px] text-white outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      setFilterType("specific");
                      void loadData(pin, "specific", { specificDate });
                    }}
                    className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground hover:brightness-110"
                  >
                    View Day
                  </button>
                </div>
              </div>

              {/* Option B: Date Range */}
              <div className="rounded-xl border border-white/5 bg-black/30 p-3.5">
                <p className="text-[12px] font-bold text-white">Select Custom Date Range:</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-1/2 rounded-lg border border-white/15 bg-black/60 px-2.5 py-1.5 text-[12px] text-white outline-none focus:border-primary"
                  />
                  <span className="text-muted-foreground text-[12px]">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-1/2 rounded-lg border border-white/15 bg-black/60 px-2.5 py-1.5 text-[12px] text-white outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      setFilterType("range");
                      void loadData(pin, "range", { startDate, endDate });
                    }}
                    className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground hover:brightness-110"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Card 1: Paid Revenue */}
        <div className="rounded-2xl border border-white/10 bg-[#121316] p-4 shadow-lg">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Revenue (Paid)
          </p>
          <p className="mt-1 font-display text-[24px] font-extrabold text-gold-grad sm:text-[28px]">
            {inr(data.totals.revenuePaise)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Avg Order: <strong className="text-white">{inr(data.totals.avgOrderPaise)}</strong>
          </p>
        </div>

        {/* Card 2: Paid Workshop Seats */}
        <div className="rounded-2xl border border-white/10 bg-[#121316] p-4 shadow-lg">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Paid Workshop Seats
          </p>
          <p className="mt-1 font-display text-[24px] font-extrabold text-emerald-400 sm:text-[28px]">
            {data.totals.orders}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {data.totals.bumpBuyersCount} took add-on bumps (
            {data.totals.orders ? Math.round((data.totals.bumpBuyersCount / data.totals.orders) * 100) : 0}%)
          </p>
        </div>

        {/* Card 3: Total Leads Initiated */}
        <div className="rounded-2xl border border-white/10 bg-[#121316] p-4 shadow-lg">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Leads Initiated
          </p>
          <p className="mt-1 font-display text-[24px] font-extrabold text-white sm:text-[28px]">
            {data.totals.totalLeadsInitiated}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Conversion: <strong className="text-primary">{data.totals.conversionRate}%</strong>
          </p>
        </div>

        {/* Card 4: Abandoned Checkouts */}
        <div className="rounded-2xl border border-white/10 bg-[#121316] p-4 shadow-lg">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Incomplete Checkouts
          </p>
          <p className="mt-1 font-display text-[24px] font-extrabold text-amber-400 sm:text-[28px]">
            {data.totals.abandonedOrders}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Lead filled form, did not pay
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎁 ADD-ON PERFORMANCE (Recording, Prompts, Call Bumps Breakdown)          */}
      {/* ========================================================================= */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#121316] p-5 shadow-xl sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-[18px] font-extrabold text-white">
              Add-On Order Bumps Breakdown
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Performance of recordings, prompt vaults, and 1:1 strategy calls for: {data.filterLabel}
            </p>
          </div>
          <span className="text-[12px] font-mono text-primary font-bold">
            Seat Only (₹29): {data.totals.seatOnlyCount} buyers
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {data.offerStats.map((o) => {
            const isRecording = o.id === "recording";
            const isPrompts = o.id === "prompts";
            const isCall = o.id === "call";

            return (
              <div
                key={o.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-4 transition-all hover:border-primary/40 hover:bg-black/60"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isRecording
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : isPrompts
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {isRecording ? "📹 Recording Bump" : isPrompts ? "⚡ Prompts Vault" : "📞 1:1 Call"}
                    </span>
                    <span className="font-mono text-[12px] font-extrabold text-white">
                      {inr(o.paise)}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-[15px] font-bold text-white">
                    {o.label}
                  </h3>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Bump Units Sold
                      </p>
                      <p className="font-display text-[26px] font-extrabold text-white">
                        {o.count}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Attach Rate
                      </p>
                      <p className="font-display text-[22px] font-extrabold text-primary">
                        {o.attachRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isRecording ? "bg-purple-500" : isPrompts ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${Math.min(100, o.attachRate)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Revenue Generated:</span>
                    <span className="font-mono font-bold text-white">{inr(o.revenuePaise)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 CHART: DAILY / HOURLY REVENUE TIMELINE                                 */}
      {/* ========================================================================= */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#121316] p-5 shadow-xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[18px] font-extrabold text-white">
              {isSingleDay ? "Hourly Lead & Sales Distribution (IST)" : "Daily Revenue Distribution (IST)"}
            </h2>
            <p className="text-[12px] text-muted-foreground">
              {isSingleDay
                ? `Showing order times for ${data.filterLabel} in Indian Standard Time`
                : "Tracking daily sales and bump attach trends across calendar dates"}
            </p>
          </div>
        </div>

        {/* Hourly Chart for Single Day */}
        {isSingleDay ? (
          <div className="mt-6">
            <div className="flex h-36 items-end gap-1 overflow-x-auto pb-2 pt-6">
              {data.hourly?.map((h) => {
                const heightPct = (h.revenue / maxHourlyRevenue) * 100;
                return (
                  <div key={h.hour} className="group relative flex-1 min-w-[28px] flex flex-col items-center">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        h.paidOrders > 0
                          ? "bg-primary hover:bg-primary/80"
                          : h.totalLeads > 0
                          ? "bg-amber-500/40"
                          : "bg-white/5"
                      }`}
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                    />
                    <span className="mt-1 text-[9px] font-mono text-muted-foreground">
                      {h.hour % 3 === 0 ? h.hourLabel.replace(" ", "") : ""}
                    </span>

                    {/* Tooltip */}
                    <div className="pointer-events-none absolute -top-12 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#1b1c20] px-2.5 py-1 text-[11px] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                      <p className="font-bold text-white">{h.hourLabel}</p>
                      <p className="text-primary font-mono">{inr(h.revenue)} · {h.paidOrders} paid ({h.totalLeads} total)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Multi-Day Chart */
          <div className="mt-6">
            {data.daily.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-muted-foreground">No orders in this range.</p>
            ) : (
              <div className="flex h-36 items-end gap-2 overflow-x-auto pb-2 pt-6">
                {data.daily.map((d) => {
                  const heightPct = (d.revenue / maxRevenue) * 100;
                  return (
                    <div key={d.day} className="group relative flex-1 min-w-[40px] flex flex-col items-center">
                      <div
                        className="w-full rounded-t-md bg-primary transition-all hover:bg-primary/80"
                        style={{ height: `${Math.max(8, heightPct)}%` }}
                      />
                      <span className="mt-1 text-[10px] font-mono text-muted-foreground">
                        {d.day.slice(5)}
                      </span>

                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-14 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#1b1c20] px-3 py-1.5 text-[11px] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                        <p className="font-bold text-white">{d.day}</p>
                        <p className="text-gold-grad font-mono">{inr(d.revenue)} · {d.paidOrders} paid</p>
                        <p className="text-[10px] text-muted-foreground">
                          📹 {d.recording} Rec · ⚡ {d.prompts} Prompts
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 📋 ORDERS & LEADS LIST WITH SEARCH & TABS                                 */}
      {/* ========================================================================= */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#121316] p-5 shadow-xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-[18px] font-extrabold text-white">
              Orders & Leads Directory ({filteredOrders.length})
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Inspect buyer details, phone numbers, and purchased add-on bumps.
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              All ({data.orders.length})
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                statusFilter === "paid"
                  ? "bg-emerald-500 text-black font-extrabold"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Paid Only ({data.totals.orders})
            </button>
            <button
              onClick={() => setStatusFilter("created")}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                statusFilter === "created"
                  ? "bg-amber-400 text-black font-extrabold"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Abandoned ({data.totals.abandonedOrders})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search by student name, email, phone number, or payment ID…"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-[13px] text-white placeholder-muted-foreground/60 outline-none transition-colors focus:border-primary"
          />
        </div>

        {/* List of Orders */}
        <div className="mt-4 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
              <p className="text-[14px] font-medium text-muted-foreground">
                No orders matching your search and filter criteria.
              </p>
            </div>
          ) : (
            filteredOrders.map((o) => {
              const isPaid = o.status === "paid";
              const hasRecording = o.offers.includes("recording");
              const hasPrompts = o.offers.includes("prompts");
              const hasCall = o.offers.includes("call");

              return (
                <div
                  key={o.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isPaid
                      ? "border-white/10 bg-black/30 hover:border-primary/40 hover:bg-black/50"
                      : "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[15px] font-extrabold text-white">
                          {o.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            isPaid
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {isPaid ? "PAID" : "INCOMPLETE"}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        📱 <a href={`tel:${o.phone}`} className="hover:text-white font-mono">{o.phone}</a>
                        {" · "}
                        ✉️ <a href={`mailto:${o.email}`} className="hover:text-white">{o.email}</a>
                      </p>
                    </div>

                    <div className="text-right sm:text-right">
                      <p className="font-display text-[17px] font-extrabold text-gold-grad">
                        {inr(o.amountPaise)}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {o.istDate} at {o.istTime}
                      </p>
                    </div>
                  </div>

                  {/* Bumps & Addons Badges */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-muted-foreground">
                        Included:
                      </span>
                      <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80">
                        🎟️ Workshop Seat (₹29)
                      </span>
                      {hasRecording && (
                        <span className="rounded-lg bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                          📹 Recording (+₹149)
                        </span>
                      )}
                      {hasPrompts && (
                        <span className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          ⚡ Prompts Vault (+₹199)
                        </span>
                      )}
                      {hasCall && (
                        <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          📞 1:1 Call (+₹499)
                        </span>
                      )}
                      {!hasRecording && !hasPrompts && !hasCall && (
                        <span className="text-[11px] text-muted-foreground/60 italic">
                          (No add-on bumps)
                        </span>
                      )}
                    </div>

                    {o.razorpayPaymentId && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        ID: {o.razorpayPaymentId}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

