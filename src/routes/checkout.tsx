import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { createOrder, verifyPayment } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Your Workshop Access | AI Influencer Workshop ₹29" },
      {
        name: "description",
        content:
          "Final step: secure your seat for the live AI Influencer Workshop on 29th October (Thursday), 7:00 PM IST. Pay securely via Razorpay UPI, GPay, PhonePe & Cards.",
      },
    ],
  }),
  component: CheckoutPage,
});

type OfferId = "combo" | "recording" | "prompts";

const WORKSHOP_BASE_PRICE = 29;

const OFFERS: Array<{
  id: OfferId;
  checkbox: string;
  headline: string;
  body: string;
  addonPrice: number;
  priceLabel: string;
  badge?: string;
}> = [
  {
    id: "combo",
    checkbox: "Yes, I want the VIP Bundle (Recordings + Prompts)",
    headline: "89% Of Attendees Choose This To Get Everything & Save ₹129!",
    body: "Get full lifetime workshop recordings PLUS the complete 300+ master prompts vault together at a massive bundle discount. Best value!",
    addonPrice: 219,
    priceLabel: "+₹219 (Save ₹129)",
    badge: "BEST VALUE",
  },
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
    headline: "71% Of Attendees Choose This To Generate Studio-Quality Portraits Instantly",
    body: "Copy-paste our 300+ tested prompts to generate scroll-stopping, ultra-realistic visual assets in seconds.",
    addonPrice: 199,
    priceLabel: "+₹199",
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
      fbp: "",
      fbc: "",
    };
  }
  const rawSearch =
    window.location.search ||
    sessionStorage.getItem("ad_tracking_params") ||
    localStorage.getItem("ad_tracking_params") ||
    "";
  const params = new URLSearchParams(rawSearch.startsWith("?") ? rawSearch : `?${rawSearch}`);

  let fbp = "";
  let fbc = "";
  try {
    const cookies = document.cookie.split(";");
    for (const c of cookies) {
      const [k, v] = c.trim().split("=");
      if (k === "_fbp") fbp = v;
      if (k === "_fbc") fbc = v;
    }
  } catch {}

  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    fbclid: params.get("fbclid") || "",
    fbp,
    fbc,
  };
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const navigate = useNavigate();

  // 2-Step checkout state: 1 = Registration details, 2 = Bump offers & Payment
  const [step, setStep] = useState<1 | 2>(1);

  // Student details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Pre-select combo bundle for maximum conversion and AOV once on step 2
  const [selected, setSelected] = useState<Record<OfferId, boolean>>({
    combo: true,
    recording: false,
    prompts: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadRazorpayScript();

    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qName = params.get("name") || sessionStorage.getItem("lead_name") || "";
    const qPhone = params.get("phone") || sessionStorage.getItem("lead_phone") || "";
    const qEmail = params.get("email") || sessionStorage.getItem("lead_email") || "";
    const forceStep = params.get("step");

    if (qName) setName(qName);
    if (qPhone) setPhone(qPhone.replace(/\D/g, "").slice(-10));
    if (qEmail) setEmail(qEmail);

    const cleanPhone = qPhone.replace(/\D/g, "").slice(-10);
    if (
      forceStep === "2" ||
      forceStep === "bumps" ||
      (qName.trim().length >= 2 && cleanPhone.length === 10 && qEmail.includes("@"))
    ) {
      setStep(2);
    }
  }, []);

  // Compute active combination & total price
  let total = WORKSHOP_BASE_PRICE;
  let activeOfferLabel = "Workshop Basic Pass";
  const selectedOfferKeys: ("combo" | "recording" | "prompts")[] = [];

  if (selected.combo) {
    total = WORKSHOP_BASE_PRICE + 219; // ₹248
    activeOfferLabel = "Workshop + VIP All-Access Bundle";
    selectedOfferKeys.push("combo");
  } else if (selected.recording && selected.prompts) {
    total = WORKSHOP_BASE_PRICE + 219; // Auto combo ₹248
    activeOfferLabel = "Workshop + VIP All-Access Bundle";
    selectedOfferKeys.push("combo");
  } else if (selected.recording) {
    total = WORKSHOP_BASE_PRICE + 149; // ₹178
    activeOfferLabel = "Workshop + Lifetime Recordings";
    selectedOfferKeys.push("recording");
  } else if (selected.prompts) {
    total = WORKSHOP_BASE_PRICE + 199; // ₹228
    activeOfferLabel = "Workshop + 300+ Prompts Vault";
    selectedOfferKeys.push("prompts");
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

  // Handle Step 1 -> Step 2 submission (User enters details and clicks Register)
  function onContinueToBumps(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit WhatsApp mobile number.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      sessionStorage.setItem("lead_name", cleanName);
      sessionStorage.setItem("lead_phone", cleanPhone);
      sessionStorage.setItem("lead_email", cleanEmail);
    } catch {}

    // Fire Meta Pixel Lead event
    if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
      try {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", {
          content_name: "Workshop Registration Step 1",
          value: 29.0,
          currency: "INR",
        });
      } catch (pixelErr) {
        console.warn("Pixel Lead warning:", pixelErr);
      }
    }

    // Lead capture ping to n8n webhook so abandoned checkouts are captured
    try {
      const tracking = getTrackingParams();
      fetch("https://prateek.n8n.preetamsoni.com/webhook/ai-influencer-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lead_registered_step1",
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          workshop_date: "29th October 2026 (Thursday) 7:00 PM IST",
          timestamp: new Date().toISOString(),
          tracking,
        }),
      }).catch(() => {});
    } catch {}

    setStep(2);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Handle Step 2 Payment via Razorpay
  async function onProceedToPayment(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2 || !cleanPhone || cleanPhone.length !== 10 || !cleanEmail.includes("@")) {
      setError("Please check your registration details in Step 1.");
      setStep(1);
      return;
    }

    setIsProcessing(true);

    try {
      // Fire InitiateCheckout Meta Pixel Event
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
          console.warn("Pixel InitiateCheckout warning:", pixelErr);
        }
      }

      // Ensure Razorpay SDK is loaded
      const hasSdk = await loadRazorpayScript();
      if (!hasSdk && !(window as unknown as { Razorpay?: unknown }).Razorpay) {
        throw new Error("Unable to load secure Razorpay gateway. Please refresh or try again.");
      }

      const tracking = getTrackingParams();

      // 1. Create order on server via Razorpay API
      const orderRes = await createOrder({
        data: {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          offers: selectedOfferKeys,
          tracking,
        },
      });

      if (!orderRes || (!orderRes.orderId && !(orderRes as unknown as { paymentLinkUrl?: string }).paymentLinkUrl)) {
        throw new Error("Could not initialize payment order. Please try again.");
      }

      // If hosted Payment Link is available, redirect directly to avoid domain security block
      const paymentLink = (orderRes as unknown as { paymentLinkUrl?: string }).paymentLinkUrl;
      if (paymentLink) {
        window.location.href = paymentLink;
        return;
      }

      // 2. Fallback to standard native Razorpay Checkout Modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "AI Influencer Workshop",
        description: activeOfferLabel,
        image: "/favicon.ico",
        order_id: orderRes.orderId,
        prefill: {
          name: cleanName,
          email: cleanEmail,
          contact: cleanPhone,
        },
        notes: {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          offers: selectedOfferKeys.join(","),
        },
        theme: {
          color: "#f59e0b",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            await verifyPayment({
              data: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer: {
                  name: cleanName,
                  email: cleanEmail,
                  phone: cleanPhone,
                  offers: selectedOfferKeys,
                  amount: total * 100,
                  tracking: {
                    ...tracking,
                    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
                  },
                },
              },
            });
          } catch (verifyErr) {
            console.warn("verifyPayment warning:", verifyErr);
          }

          try {
            sessionStorage.setItem("last_payment_id", response.razorpay_payment_id);
          } catch {}

          const targetUrl = `/thank-you-5034?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&amount=${total}&name=${encodeURIComponent(cleanName)}&email=${encodeURIComponent(cleanEmail)}&phone=${cleanPhone}`;
          window.location.href = targetUrl;
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay;
      const rzpInstance = new RazorpayConstructor(options);
      rzpInstance.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setError(err instanceof Error ? err.message : "Payment failed to start. Please try again.");
      setIsProcessing(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-8">
      <Link
        to="/"
        className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to Workshop Details
      </Link>

      {/* Header */}
      <div className="surface mt-4 p-5 text-center">
        <h1 className="font-display text-[24px] font-extrabold leading-tight">
          {step === 1 ? (
            <>
              <span className="text-gold-grad">Reserve</span> Your Workshop Seat
            </>
          ) : (
            <>
              <span className="text-gold-grad">Customize</span> Your Access Pass
            </>
          )}
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          October 29, 2026 (Thursday) · 7:00 PM IST · Live on Zoom
        </p>
      </div>

      {/* 2-Step Funnel Progress Indicator */}
      <div className="surface mt-3 p-3 flex items-center justify-between border border-white/10 rounded-2xl">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 text-left cursor-pointer transition-opacity ${
            step === 1 ? "opacity-100 font-extrabold text-amber-300" : "opacity-80 hover:opacity-100"
          }`}
        >
          <span
            className={`size-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
              step === 1
                ? "bg-amber-400 text-black font-extrabold shadow-sm shadow-amber-400/40"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
            }`}
          >
            {step === 2 ? "✓" : "1"}
          </span>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Step 1</p>
            <p className="text-[12px] font-bold">Your Details</p>
          </div>
        </button>

        <div className="h-[1px] flex-1 mx-3 bg-white/10" />

        <div
          className={`flex items-center gap-2 text-left ${
            step === 2 ? "opacity-100 font-extrabold text-amber-300" : "opacity-50"
          }`}
        >
          <span
            className={`size-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
              step === 2
                ? "bg-amber-400 text-black font-extrabold shadow-sm shadow-amber-400/40"
                : "bg-white/10 text-muted-foreground border border-white/10"
            }`}
          >
            2
          </span>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Step 2</p>
            <p className="text-[12px] font-bold">Add-ons &amp; Pay</p>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="surface mt-3 overflow-hidden p-0 border border-white/10 shadow-lg">
        <div className="bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 py-2.5 px-4 text-center">
          <p className="text-[11.5px] font-extrabold uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
            <span>🔒</span>
            <span>Instant 1-Click Razorpay UPI / Cards Checkout</span>
          </p>
        </div>
      </div>

      {/* ================= STEP 1: CONTACT DETAILS ================= */}
      {step === 1 && (
        <form onSubmit={onContinueToBumps} autoComplete="on" className="mt-4 space-y-4">
          <div className="surface space-y-3.5 p-4 sm:p-5 rounded-2xl border border-white/10">
            <p className="text-[13.5px] font-extrabold text-white flex items-center gap-2">
              <span>👤</span>
              <span>Enter Your Details To Register:</span>
            </p>

            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
              >
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                autoCapitalize="words"
                autoCorrect="off"
                spellCheck={false}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[14px] text-white placeholder:text-muted-foreground/60 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="tel"
                className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
              >
                WhatsApp Mobile Number *
              </label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-white/10 bg-white/5 px-3 text-[13px] font-semibold text-muted-foreground">
                  +91
                </span>
                <input
                  id="tel"
                  name="tel"
                  type="tel"
                  required
                  maxLength={10}
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit WhatsApp number"
                  className="w-full rounded-r-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[14px] text-white placeholder:text-muted-foreground/60 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[10.5px] text-muted-foreground">
                Workshop Zoom link &amp; WhatsApp VIP group link will be sent here.
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[14px] text-white placeholder:text-muted-foreground/60 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Workshop Pass Summary */}
          <div className="surface flex items-center justify-between p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-[14px] font-bold text-foreground">Live Workshop Pass</p>
              <p className="text-[11px] text-muted-foreground">
                Live Zoom seat + character generation prompts
              </p>
            </div>
            <p className="font-display text-[18px] font-extrabold text-gold-grad">₹29</p>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] font-semibold text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-cta w-full flex items-center justify-center gap-2 py-3.5 cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <LockIcon className="size-4" />
            <span>Register For ₹29 →</span>
          </button>

          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">
              ⚡ Next step: Review pass &amp; optional student add-ons before paying.
            </p>
          </div>

          {/* What's included */}
          <div className="surface space-y-3 p-5 text-center">
            <p className="text-[15px] font-bold text-foreground">Enroll For The Workshop Before</p>
            <p className="rounded-lg bg-[var(--money)]/20 px-3 py-2 font-display text-[17px] font-extrabold text-gold-grad">
              October 29, 2026 (Thursday) · 7:00 PM IST
            </p>
            <div className="rounded-xl border border-border p-4">
              <p className="font-display text-[16px] font-extrabold leading-snug text-foreground">
                Build A Profitable AI Influencer Page,{" "}
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

      {/* ================= STEP 2: BUMP OFFERS & PAYMENT ================= */}
      {step === 2 && (
        <form onSubmit={onProceedToPayment} autoComplete="on" className="mt-4 space-y-4">
          {/* Confirmed Student Details Bar with Edit Option */}
          <div className="surface p-3.5 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>✓</span>
                <span>Registered Student Details</span>
              </p>
              <p className="mt-0.5 text-[13px] font-extrabold text-white truncate">
                {name || "Student"} · +91 {phone}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="ml-3 shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>

          {/* Base Order Pass */}
          <div className="surface flex items-center justify-between p-4 rounded-xl border border-white/10">
            <div>
              <p className="text-[14px] font-bold text-foreground">Live Workshop Pass</p>
              <p className="text-[11px] text-muted-foreground">
                Live Zoom access + character generation prompts
              </p>
            </div>
            <p className="font-display text-[18px] font-extrabold text-gold-grad">₹29</p>
          </div>

          {/* Bump Offers (Image 1 top badge removed from combo) */}
          <div className="space-y-3.5">
            <p className="text-[13px] font-extrabold text-amber-300 flex items-center gap-1.5">
              <span>🎁</span>
              <span>Exclusive Student Upgrade Options:</span>
            </p>

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
                  {/* Card Content - Clean without top banner */}
                  <div className="p-3.5 sm:p-4">
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
                            <svg
                              viewBox="0 0 24 24"
                              className="size-3.5 stroke-[3.5]"
                              fill="none"
                              stroke="currentColor"
                            >
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

                    {/* Headline & Body */}
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
                Payment Method: Instant Razorpay Gateway
              </p>
              <div className="mt-2 flex items-center justify-between text-[13px] font-bold text-foreground">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  UPI / GPay / PhonePe / Paytm / Cards
                </span>
                <span className="text-[11px] font-medium text-amber-300">
                  ⚡ Instant Verified
                </span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Your personal data will be used to process your order, provide Zoom link &amp; prompt guides,
              and for other purposes described in our{" "}
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
              disabled={isProcessing}
              className="btn-cta w-full flex items-center justify-center gap-2 py-3.5 cursor-pointer disabled:opacity-60 transition-transform hover:scale-[1.01]"
            >
              <LockIcon className="size-4" />
              <span>
                {isProcessing
                  ? "Opening Razorpay Secure Gateway…"
                  : selected.combo
                  ? `Pay ₹${total} (VIP Pass) via UPI / Cards →`
                  : `Pay ₹${total} via UPI / Cards →`}
              </span>
            </button>

            <div className="text-center">
              <p className="flex items-center justify-center gap-2 text-[14px] font-extrabold text-foreground">
                <LockIcon className="size-4 text-[var(--money)]" />
                100% Secure 256-Bit Razorpay Payment
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Supports Google Pay, PhonePe, Paytm, all UPI apps, Debit/Credit Cards &amp; NetBanking.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* Compliance & Policy Links (Merchant Name & Address Removed as requested in Image 2) */}
      <div className="mt-8 border-t border-border/60 pt-6 text-center text-[12px] text-muted-foreground space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link
            to="/privacy-policy"
            target="_blank"
            className="transition hover:text-primary underline"
          >
            Privacy Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            to="/terms-and-conditions"
            target="_blank"
            className="transition hover:text-primary underline"
          >
            Terms &amp; Conditions
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            to="/refund-cancellation-policy"
            target="_blank"
            className="transition hover:text-primary underline"
          >
            Refund Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            to="/shipping-policy"
            target="_blank"
            className="transition hover:text-primary underline"
          >
            Shipping Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            to="/contact-us"
            target="_blank"
            className="transition hover:text-primary underline"
          >
            Contact Us
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link
            to="/grievance-redressal"
            target="_blank"
            className="transition hover:text-primary underline"
          >
            Grievance Redressal
          </Link>
        </div>
      </div>
    </main>
  );
}
