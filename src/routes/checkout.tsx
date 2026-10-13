import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Your Workshop Access | AI Influencer Workshop ₹29" },
      {
        name: "description",
        content:
          "Final step: secure your seat for the live AI Influencer Workshop on 16th October (Friday), 7:00 PM. Pay securely via Superprofile.",
      },
    ],
  }),
  component: CheckoutPage,
});

type OfferId = "recording" | "prompts" | "combo";

const SUPERPROFILE_LINKS = {
  basic: "https://superprofile.bio/e/SoK1AxJQ", // ₹29
  recording: "https://superprofile.bio/e/qlonB0yj", // ₹178
  prompts: "https://superprofile.bio/e/LirmFFgB", // ₹228
  combo: "https://superprofile.bio/e/6LfPN8jn", // ₹248
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
    checkbox: "Yes, I want to add 300+ Bold AI Prompts Vault",
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

function Field(props: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode?: "text" | "email" | "tel";
  maxLength?: number;
  helpText?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-foreground">
        {props.label} <span className="text-destructive">*</span>
      </span>
      <input
        type={props.type}
        value={props.value}
        inputMode={props.inputMode}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-secondary/60 px-4 py-3 text-[15px] font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-primary"
      />
      {props.helpText && <div className="mt-1.5">{props.helpText}</div>}
    </label>
  );
}

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
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "";
    return (new URLSearchParams(window.location.search).get("name") || "").replace(/["']/g, "").trim();
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return (new URLSearchParams(window.location.search).get("email") || "").replace(/["']/g, "").trim();
  });
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    const p = new URLSearchParams(window.location.search).get("phone") || "";
    return p.replace(/\D/g, "").slice(-10);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const n = (params.get("name") || "").replace(/["']/g, "").trim();
    const e = (params.get("email") || "").replace(/["']/g, "").trim();
    const p = (params.get("phone") || "").replace(/\D/g, "").slice(-10);
    if (n && !name) setName(n);
    if (e && !email) setEmail(e);
    if (p && !phone) setPhone(p);
  }, []);

  const [step, setStep] = useState<1 | 2>(1);
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

  function validate(): string | null {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (name.trim().length < 3) return "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email address.";
    if (cleanPhone.length !== 10) return "Please enter a valid 10-digit WhatsApp number.";
    return null;
  }

  function onContinue(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
      try {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq(
          "track",
          "InitiateCheckout",
          {
            value: 29.0,
            currency: "INR",
            content_name: "AI Influencer Reels Workshop",
          }
        );
      } catch (err) {
        console.error("Meta pixel track error:", err);
      }
    }
  }

  function onProceedToPayment(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

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

      // Build target redirect URL with contact info & all tracking parameters
      const targetUrl = new URL(targetSuperprofileBaseUrl);
      if (name.trim()) targetUrl.searchParams.set("name", name.trim());
      if (email.trim()) targetUrl.searchParams.set("email", email.trim());
      if (cleanPhone) targetUrl.searchParams.set("phone", cleanPhone);

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
      <Link to="/" className="text-[13px] font-semibold text-muted-foreground">
        ← Back
      </Link>

      {/* Header */}
      <div className="surface mt-4 p-5 text-center">
        <h1 className="font-display text-[24px] font-extrabold leading-tight">
          <span className="text-gold-grad">Final Step:</span> Secure Your Workshop Access
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Faceless AI Influencer blueprint, live on Zoom (Hindi + English).
        </p>
      </div>

      {/* Step indicator */}
      <div className="surface mt-4 overflow-hidden p-0 border border-white/10 shadow-lg">
        <div className="bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 border-b border-primary/20 py-2 px-4 text-center">
          <p className="text-[11.5px] font-extrabold uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
            <span>🔒</span>
            <span>Secure 2-Step Registration</span>
          </p>
        </div>
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2.5 border-b-2 px-4 py-3 text-left transition-colors ${
              step === 1 ? "border-primary bg-primary/10" : "border-transparent hover:bg-white/5"
            }`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-black bg-primary/20 text-primary border border-primary/30">
              1
            </span>
            <span>
              <span className="block text-[13px] font-bold text-foreground">Contact</span>
              <span className="block text-[11px] text-muted-foreground">Your contact info</span>
            </span>
          </button>
          <div
            className={`flex items-center gap-2.5 border-b-2 px-4 py-3 text-left transition-colors ${
              step === 2 ? "border-primary bg-primary/10" : "border-transparent opacity-60"
            }`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-black ${
                step === 2
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "bg-white/10 text-muted-foreground"
              }`}
            >
              2
            </span>
            <span>
              <span className="block text-[13px] font-bold text-foreground">Payment</span>
              <span className="block text-[11px] text-muted-foreground">Of your ticket</span>
            </span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={onContinue} className="surface mt-4 space-y-4 p-5">
          <Field
            label="Full name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Your name"
            maxLength={80}
          />
          <Field
            label="Email address"
            type="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            maxLength={120}
            helpText={
              <p className="text-[11.5px] text-muted-foreground">
                Enter your correct email so your resources can be delivered here.
              </p>
            }
          />
          <Field
            label="Phone (WhatsApp)"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={setPhone}
            placeholder="10-digit mobile number"
            maxLength={13}
          />

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] font-semibold text-destructive">
              {error}
            </p>
          )}

          <button type="submit" className="btn-cta w-full">
            Register For The Workshop Now →
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={onProceedToPayment} className="mt-4 space-y-4">
          {/* Order summary */}
          <div className="surface flex items-center justify-between p-4">
            <div>
              <p className="text-[14px] font-bold text-foreground">Workshop Seat</p>
              <p className="text-[11px] text-muted-foreground">
                Live access + all workshop material
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
                              : "border-white/25 bg-card/60 group-hover:border-white/50 group-hover:bg-card/90"
                          }`}
                        >
                          {on && (
                            <svg
                              viewBox="0 0 24 24"
                              className="size-3.5 stroke-[3.5]"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                d="M5 13l4 4L19 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-display text-[13.5px] sm:text-[14.5px] font-bold text-foreground leading-snug">
                            {offer.checkbox}
                          </h3>
                        </div>
                      </div>

                      {/* Price Pill */}
                      <div className="shrink-0">
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-[11.5px] font-black tracking-tight ${
                            on
                              ? isCombo
                                ? "bg-amber-400 text-black font-extrabold shadow-sm"
                                : "bg-primary text-white font-extrabold shadow-sm"
                              : isCombo
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                              : "bg-secondary/90 text-foreground border border-white/10 font-bold"
                          }`}
                        >
                          {offer.priceLabel}
                        </span>
                      </div>
                    </div>

                    {/* Psychological Headline & Minimal Body */}
                    <div className="mt-2 pl-8">
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
                  UPI / GPay / PhonePe / Cards / NetBanking
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
                Your payment is processed through a high-security encrypted gateway to ensure complete privacy and instant pass confirmation.
              </p>
            </div>
          </div>

          {/* Trust factor, deadline + what they get */}
          <div className="surface space-y-3 p-5 text-center">
            <p className="text-[15px] font-bold text-foreground">Enroll For The Workshop Before</p>
            <p className="rounded-lg bg-[var(--money)]/20 px-3 py-2 font-display text-[17px] font-extrabold text-gold-grad">
              October 16, 2026 (Friday) · 7:00 PM
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
      )}

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

