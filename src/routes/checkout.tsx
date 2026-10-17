import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Your Workshop Access, AI Influencer Workshop ₹29" },
      {
        name: "description",
        content:
          "Final step: secure your seat for the live AI Influencer Workshop on 22nd October (Thursday), 7:00 PM. Pay securely via Superprofile.",
      },
    ],
  }),
  component: CheckoutPage,
});

type OfferId = "recording" | "prompts" | "combo";

const SUPERPROFILE_LINKS = {
  basic: "https://superprofile.bio/e/ILjNLKwO", // ₹29
  recording: "https://superprofile.bio/e/9x5zPMBF", // ₹178
  prompts: "https://superprofile.bio/e/wjvoptAf", // ₹228
  combo: "https://superprofile.bio/e/rmJxqGcP", // ₹248
} as const;

const WORKSHOP_BASE_PRICE = 29;

const OFFERS: Array<{
  id: OfferId;
  checkbox: string;
  headline: string;
  body: string;
  addonPrice: number;
  priceLabel: string;
  badge?: string;
  highlightBadge?: string;
}> = [
  {
    id: "recording",
    checkbox: "Yes, I want to add Workshop Recording + Notes",
    headline: "83% Of Attendees Add This To Watch At Their Own Pace",
    body: "Not sure you'll be free on the workshop date to attend live? Add workshop recording and notes to get lifetime access, rewatch anytime, and learn at your own pace.",
    addonPrice: 149,
    priceLabel: "+₹149",
  },
  {
    id: "prompts",
    checkbox: "Yes, I want 300+ Done-For-You Prompt Vault",
    headline: "71% Of Attendees Choose This To Generate Bold Images Instantly",
    body: "Copy-paste our 300+ tested prompts to generate scroll-stopping, bold, ultra-realistic photos in seconds.",
    addonPrice: 199,
    priceLabel: "+₹199",
  },
  {
    id: "combo",
    checkbox: "Yes, I want the VIP Bundle (Recordings + Prompts)",
    headline: "89% Of Attendees Choose This To Get Everything & Save ₹129!",
    body: "Get full lifetime workshop recordings PLUS the complete 300+ bold prompts vault together at a massive bundle discount. Best value!",
    addonPrice: 219,
    priceLabel: "+₹219 (Save ₹129)",
    badge: "BEST VALUE",
    highlightBadge: "BEST VALUE • SAVE ₹129",
  },
];

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
    </svg>
  );
}

function getTrackingParams() {
  if (typeof window === "undefined") {
    return {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
      fbclid: "",
    };
  }
  const rawSearch =
    window.location.search ||
    sessionStorage.getItem("ad_tracking_params") ||
    localStorage.getItem("ad_tracking_params") ||
    "";
  const params = new URLSearchParams(rawSearch.startsWith("?") ? rawSearch : `?${rawSearch}`);

  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    fbclid: params.get("fbclid") || "",
  };
}

function CheckoutPage() {
  const [selected, setSelected] = useState<Record<OfferId, boolean>>({
    recording: false,
    prompts: false,
    combo: false,
  });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute active combination & total price
  let total = WORKSHOP_BASE_PRICE;
  let targetSuperprofileBaseUrl = SUPERPROFILE_LINKS.basic;
  let activeOfferLabel = "Workshop Basic Pass";

  if (selected.combo) {
    total = WORKSHOP_BASE_PRICE + 219; // ₹248
    targetSuperprofileBaseUrl = SUPERPROFILE_LINKS.combo;
    activeOfferLabel = "Workshop + VIP All-Access Bundle";
  } else if (selected.recording) {
    total = WORKSHOP_BASE_PRICE + 149; // ₹178
    targetSuperprofileBaseUrl = SUPERPROFILE_LINKS.recording;
    activeOfferLabel = "Workshop + Lifetime Recordings";
  } else if (selected.prompts) {
    total = WORKSHOP_BASE_PRICE + 199; // ₹228
    targetSuperprofileBaseUrl = SUPERPROFILE_LINKS.prompts;
    activeOfferLabel = "Workshop + 300+ Prompts Vault";
  }

  function toggle(id: OfferId) {
    setSelected((prev) => {
      if (id === "combo") {
        const nextCombo = !prev.combo;
        return {
          recording: false,
          prompts: false,
          combo: nextCombo,
        };
      }
      const next = {
        ...prev,
        combo: false,
        [id]: !prev[id],
      };
      // If user checks both recordings and prompts, auto bundle into combo!
      if (next.recording && next.prompts) {
        return {
          recording: false,
          prompts: false,
          combo: true,
        };
      }
      return next;
    });
  }

  function onProceedToPayment(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsRedirecting(true);

    try {
      if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
        try {
          (window as unknown as { fbq: (...args: unknown[]) => void }).fbq(
            "track",
            "InitiateCheckout",
            {
              value: Number(total),
              currency: "INR",
              content_name: activeOfferLabel,
            }
          );
        } catch (pixelErr) {
          console.error("Meta pixel track error:", pixelErr);
        }
      }

      // Build target redirect URL with all tracking parameters
      const targetUrl = new URL(targetSuperprofileBaseUrl);
      targetUrl.searchParams.set("checkout", "true");
      const tracking = getTrackingParams();
      if (tracking.utm_source) targetUrl.searchParams.set("utm_source", tracking.utm_source);
      if (tracking.utm_medium) targetUrl.searchParams.set("utm_medium", tracking.utm_medium);
      if (tracking.utm_campaign) targetUrl.searchParams.set("utm_campaign", tracking.utm_campaign);
      if (tracking.utm_content) targetUrl.searchParams.set("utm_content", tracking.utm_content);
      if (tracking.utm_term) targetUrl.searchParams.set("utm_term", tracking.utm_term);
      if (tracking.fbclid) targetUrl.searchParams.set("fbclid", tracking.fbclid);

      // Redirect directly to Superprofile Checkout
      window.location.href = targetUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Redirect failed. Please try again.");
      setIsRedirecting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-8">
      <Link to="/" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
        ← Back to Workshop Details
      </Link>

      {/* Header */}
      <div className="surface mt-4 p-5 text-center">
        <h1 className="font-display text-[24px] font-extrabold leading-tight">
          <span className="text-gold-grad">Customize</span> Your Access Pass
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          October 22, 2026 (Thursday) · 7:00 PM IST · Live on Zoom
        </p>
      </div>

      {/* Trust Banner */}
      <div className="surface mt-3 overflow-hidden p-0 border border-white/10 shadow-lg">
        <div className="bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 py-2.5 px-4 text-center">
          <p className="text-[11.5px] font-extrabold uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
            <span>🔒</span>
            <span>1-Step Direct Checkout via Superprofile</span>
          </p>
        </div>
      </div>

      <form onSubmit={onProceedToPayment} className="mt-4 space-y-4">
        {/* Order summary */}
        <div className="surface flex items-center justify-between p-4">
          <div>
            <p className="text-[14px] font-bold text-foreground">Live Workshop Pass</p>
            <p className="text-[11px] text-muted-foreground">
              Live Zoom access + character generation prompts
            </p>
          </div>
          <p className="font-display text-[18px] font-extrabold text-gold-grad">₹29</p>
        </div>

        {/* The three checkbox offers */}
        <div className="space-y-3.5">
          {OFFERS.map((offer) => {
            const on = selected[offer.id];
            const isCombo = offer.id === "combo";
            return (
              <div
                key={offer.id}
                onClick={() => toggle(offer.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 ${
                  on
                    ? isCombo
                      ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/15"
                      : "border-primary bg-primary/10 shadow-lg shadow-primary/15"
                    : isCombo
                    ? "border-amber-500/40 bg-gradient-to-b from-amber-500/[0.08] to-card/90 hover:border-amber-400/70"
                    : "border-white/10 bg-card/80 hover:border-white/20 hover:bg-card"
                }`}
              >
                {/* VIP Highlight Header */}
                {offer.highlightBadge && (
                  <div className="bg-gradient-to-r from-amber-500/30 via-amber-400/25 to-amber-500/30 border-b border-amber-400/30 px-3.5 py-1 text-center">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1.5">
                      <span>👑</span>
                      <span>{offer.highlightBadge}</span>
                    </p>
                  </div>
                )}

                {/* Card Main Content */}
                <div className="p-3.5 sm:p-4">
                  {/* Header Row: Checkbox, Title & Price Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Custom Checkbox */}
                      <div
                        className={`mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-all ${
                          on
                            ? isCombo
                              ? "border-amber-400 bg-amber-400 text-black shadow-md shadow-amber-400/30"
                              : "border-primary bg-primary text-white shadow-md shadow-primary/30"
                            : isCombo
                            ? "border-amber-400/60 bg-black/40 group-hover:border-amber-400"
                            : "border-white/30 bg-black/40 group-hover:border-white/50"
                        }`}
                      >
                        {on && (
                          <svg viewBox="0 0 24 24" className="size-3.5 stroke-[3.5]" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      {/* Checkbox Title */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13px] sm:text-[13.5px] font-bold leading-tight select-none transition-colors ${
                            on
                              ? isCombo
                                ? "text-amber-300"
                                : "text-white"
                              : isCombo
                              ? "text-amber-200/90 group-hover:text-amber-100"
                              : "text-foreground group-hover:text-white"
                          }`}
                        >
                          {offer.checkbox}
                        </p>
                      </div>
                    </div>

                    {/* Price Pill */}
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11.5px] font-black tracking-tight ${
                          on
                            ? isCombo
                              ? "bg-amber-400 text-black font-extrabold"
                              : "bg-primary text-white"
                            : isCombo
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "bg-white/10 text-white/90 border border-white/10"
                        }`}
                      >
                        {offer.priceLabel}
                      </span>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="mt-2.5 pl-8 sm:pl-8 text-left">
                    <p
                      className={`text-[12px] sm:text-[12.5px] font-bold leading-snug ${
                        isCombo ? "text-amber-300" : "text-primary"
                      }`}
                    >
                      {offer.headline}
                    </p>
                    <p className="mt-1 text-[11.5px] sm:text-[12px] leading-relaxed text-muted-foreground">
                      {offer.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment panel */}
        <div className="surface space-y-4 p-5">
          <div className="rounded-xl bg-secondary/60 p-4">
            <p className="text-[13px] font-semibold text-foreground">
              Payment Method: Instant Checkout
            </p>
            <div className="mt-2 flex items-center justify-between text-[13px] font-bold text-foreground">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                UPI / GPay / PhonePe / Paytm / Cards
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                via Superprofile
              </span>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Your personal data will be used to process your order, support your experience
            throughout this website, and for other purposes described in our{" "}
            <Link to="/privacy-policy" target="_blank" className="text-primary underline">
              privacy policy
            </Link>
            .
          </p>

          <div className="flex items-center justify-between border-t border-border pt-3.5">
            <span className="text-[14px] font-bold text-foreground">Total Payable</span>
            <span className="font-display text-[24px] font-extrabold text-gold-grad">
              ₹{total}
            </span>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] font-semibold text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isRedirecting}
            className="btn-cta w-full flex items-center justify-center gap-2 py-3.5"
          >
            <LockIcon className="size-4" />
            <span>
              {isRedirecting
                ? "Redirecting to Secure Checkout…"
                : `Proceed to Pay ₹${total} →`}
            </span>
          </button>

          <div className="text-center">
            <p className="flex items-center justify-center gap-2 text-[14px] font-extrabold text-foreground">
              <LockIcon className="size-4 text-[var(--money)]" />
              100% Secure 256-Bit Encrypted Payment
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Details are entered only once directly on Superprofile's encrypted gateway with instant WhatsApp community access.
            </p>
          </div>
        </div>

        {/* Trust factor, deadline + what they get */}
        <div className="surface space-y-3 p-5 text-center">
          <p className="text-[15px] font-bold text-foreground">Enroll For The Workshop Before</p>
          <p className="rounded-lg bg-[var(--money)]/20 px-3 py-2 font-display text-[17px] font-extrabold text-gold-grad">
            October 22, 2026 (Thursday) · 7:00 PM
          </p>
          <div className="rounded-xl border border-border p-4">
            <p className="font-display text-[16px] font-extrabold leading-snug text-foreground">
              Build A Profitable AI Influencer Page ,{" "}
              <span className="text-gold-grad">Without Showing Your Face</span>
            </p>
            <p className="mt-1 text-[12px] font-semibold text-muted-foreground">
              (Included Free With Your Seat)
            </p>
          </div>
          <div className="space-y-2 border-t border-dashed border-border pt-3 text-left">
            <p className="text-center font-display text-[15px] font-extrabold text-foreground">
              Get All This Along With This Workshop
            </p>
            {[
              "Secret AI tool that creates ultra-realistic influencer images",
              "Done-for-you prompts to generate your own consistent character",
              "Posting strategy for Instagram, Telegram & more",
              "5+ monetization methods explained step by step",
              "100% free tools, no laptop, no paid apps needed",
            ].map((line) => (
              <p key={line} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 size-4 shrink-0 text-[var(--money)]"
                  fill="none"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {line}
              </p>
            ))}
          </div>
        </div>
      </form>

      {/* Compliance & Policy Links */}
      <div className="mt-8 border-t border-border/60 pt-6 text-center text-[12px] text-muted-foreground space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link to="/privacy-policy" target="_blank" className="transition hover:text-primary underline">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/terms-and-conditions" target="_blank" className="transition hover:text-primary underline">
            Terms &amp; Conditions
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/refund-cancellation-policy" target="_blank" className="transition hover:text-primary underline">
            Refund Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/shipping-policy" target="_blank" className="transition hover:text-primary underline">
            Shipping Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/contact-us" target="_blank" className="transition hover:text-primary underline">
            Contact Us
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/grievance-redressal" target="_blank" className="transition hover:text-primary underline">
            Grievance Redressal
          </Link>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-[11px] text-muted-foreground/80 space-y-1">
          <p>
            <strong>Merchant:</strong> Prateek Mayani | Mowa, Daldal Seoni, Raipur (CG), India
          </p>
          <p>
            <strong>Support:</strong> prateekmayani@gmail.com | +91 8770500986
          </p>
          <p>© {new Date().getFullYear()} Prateek Mayani. All Rights Reserved.</p>
        </div>
      </div>
    </main>
  );
}
