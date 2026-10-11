import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  createOrder,
  verifyPayment,
  WORKSHOP_PRICE_PAISE,
  OFFER_CATALOG,
  type OfferId,
} from "@/lib/checkout.functions";
import razorpayMark from "@/assets/razorpay-mark.svg";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Your Workshop Access, AI Influencer Workshop ₹29" },
      {
        name: "description",
        content:
          "Final step: secure your seat for the live AI Influencer Workshop on 26th September, 7:00 PM. Pay ₹29 securely with Razorpay.",
      },
    ],
  }),
  component: CheckoutPage,
});

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Razorpay. Check your connection."));
    document.body.appendChild(s);
  });
}

const rupee = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

// ---- Offer data (client-safe copy for the three add-ons) ----

const OFFERS: Array<{
  id: OfferId;
  checkbox: string;
  headline: string;
  body: string;
}> = [
  {
    id: "recording",
    checkbox: "Yes! I want the Workshop Recording + Notes @ ₹149/-",
    headline: "83% Of Attendees Choose This To Get 2x Value!",
    body: "Stop worrying about missing steps inside the workshop, get access to the full workshop recording to watch it again anytime you want, plus the complete step-by-step notes PDF.",
  },
  {
    id: "prompts",
    checkbox: "Yes! I want 300+ Ready-To-Use Prompts To Generate Bold Images @ ₹199/-",
    headline: "71% Attendees Choose This To Get 3x Results With Half The Effort",
    body: "Don't waste weeks testing prompts yourself, just copy-paste from our proven library of 300+ prompts to create scroll-stopping bold AI influencer images in different poses, outfits, backgrounds & styles that instantly grab attention.",
  },
  {
    id: "call",
    checkbox: "Yes! I want a 1:1 Call With The Monetization Expert @ ₹499/-",
    headline: "Monetize Your Page 2x Faster After This 1:1 Call",
    body: "After the workshop, solve your doubts personally with our expert, get your setup reviewed and your fastest monetization plan mapped out, so you can start earning in days, not months.",
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

function CheckoutPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<Record<OfferId, boolean>>({
    recording: false,
    prompts: false,
    call: false,
  });
  const [status, setStatus] = useState<"form" | "paying">("form");
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const selectedIds = OFFERS.filter((o) => selected[o.id]).map((o) => o.id);
  const offersTotal = selectedIds.reduce((s, id) => s + OFFER_CATALOG[id].paise, 0);
  const total = WORKSHOP_PRICE_PAISE + offersTotal;

  function toggle(id: OfferId) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
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
  }

  async function onPay(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    setStatus("paying");
    try {
      await loadRazorpayScript();
      const order = await createOrder({
        data: { name: name.trim(), email: email.trim(), phone: cleanPhone, offers: selectedIds },
      });
      const rzp = new window.Razorpay!({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "AI Influencer Workshop",
        description: "Live Workshop, 26th September, 7:00 PM",
        prefill: { name: name.trim(), email: email.trim(), contact: `+91${cleanPhone}` },
        theme: { color: "#e0336e" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPayment({ data: response });
            navigate({ to: "/thank-you-5034", replace: true });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Verification failed.");
            setStatus("form");
          }
        },
        modal: {
          ondismiss: () => {
            setStatus("form");
            setError("Payment cancelled, your seat is not booked yet.");
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("form");
    }
  }

  return (
    <main className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-8">
      <Link to="/" className="text-[13px] font-semibold text-muted-foreground">
        ← Back
      </Link>

      {/* Header, mirrors the reference "Final Step" opening view */}
      <div className="surface mt-4 p-5 text-center">
        <h1 className="font-display text-[24px] font-extrabold leading-tight">
          <span className="text-gold-grad">Final Step:</span> Secure Your Workshop Access
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Faceless AI Influencer blueprint, live on Zoom (Hindi + English).
        </p>
      </div>

      {/* Step indicator */}
      <div className="surface mt-4 overflow-hidden p-0">
        <div className="bg-primary px-4 py-2.5 text-center text-[13px] font-bold text-white">
          Register for the exclusive workshop now!
        </div>
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2.5 border-b-2 px-4 py-3 text-left ${
              step === 1 ? "border-primary bg-primary/10" : "border-transparent"
            }`}
          >
            <span className="font-display text-[22px] font-extrabold text-foreground">1</span>
            <span>
              <span className="block text-[13px] font-bold text-foreground">Contact</span>
              <span className="block text-[11px] text-muted-foreground">Your contact info</span>
            </span>
          </button>
          <div
            className={`flex items-center gap-2.5 border-b-2 px-4 py-3 text-left ${
              step === 2 ? "border-primary bg-primary/10" : "border-transparent opacity-70"
            }`}
          >
            <span className="font-display text-[22px] font-extrabold text-foreground">2</span>
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
        <form onSubmit={onPay} className="mt-4 space-y-4">
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

          {/* The three checkbox offers, dashed border style from the reference */}
          <div className="space-y-4">
            {OFFERS.map((offer) => {
              const on = selected[offer.id];
              return (
                <div
                  key={offer.id}
                  className={`overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                    on ? "border-primary" : "border-destructive/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(offer.id)}
                    className="flex w-full items-center gap-2.5 bg-secondary/60 px-3.5 py-3 text-left"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-5 shrink-0 text-destructive"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M4 11h12.2l-4.6-4.6L13 5l7 7-7 7-1.4-1.4 4.6-4.6H4v-2Z" />
                    </svg>
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded border-2 ${
                        on ? "border-primary bg-primary" : "border-muted-foreground/50"
                      }`}
                    >
                      {on && (
                        <svg viewBox="0 0 24 24" className="size-3.5 text-white" fill="none">
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="text-[14px] font-bold text-foreground">
                      {offer.checkbox}
                    </span>
                  </button>
                  <div className="border-t-2 border-dashed border-destructive/60 p-4">
                    <p className="font-display text-[17px] font-extrabold leading-snug text-destructive">
                      {offer.headline}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {offer.body}
                    </p>
                    <p className="mt-2 text-[12px] font-semibold text-muted-foreground">
                      <span className="text-gold-grad font-extrabold">
                        Add for {rupee(OFFER_CATALOG[offer.id].paise)}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment panel */}
          <div className="surface space-y-4 p-5">
            <div className="rounded-xl bg-secondary/60 p-4">
              <p className="text-[14px] font-semibold text-foreground">
                UPI / Credit Card / Debit Card / NetBanking
              </p>
              <p className="mt-2 flex items-center gap-2 text-[15px] font-bold text-foreground">
                <img src={razorpayMark} alt="Razorpay" width={22} height={22} className="size-6" />
                Pay by Razorpay
              </p>
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
              <span className="text-[14px] font-bold text-foreground">Total</span>
              <span className="font-display text-[22px] font-extrabold text-gold-grad">
                {rupee(total)}
              </span>
            </div>

            {error && (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] font-semibold text-destructive">
                {error}
              </p>
            )}

            <button type="submit" disabled={status === "paying"} className="btn-cta w-full">
              <span className="inline-flex items-center gap-2">
                <LockIcon className="size-4" />
                {status === "paying" ? "Opening Razorpay…" : `Place Order ${rupee(total)}`}
              </span>
            </button>

            <div className="text-center">
              <p className="flex items-center justify-center gap-2 text-[15px] font-extrabold text-foreground">
                <LockIcon className="size-5 text-[var(--money)]" />
                Secure Processing
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Each order is processed through a secure, 256-bit encrypted payment processing
                gateway to ensure your privacy.
              </p>
            </div>
          </div>

          {/* Trust factor, deadline + what they get */}
          <div className="surface space-y-3 p-5 text-center">
            <p className="text-[15px] font-bold text-foreground">Enroll For The Workshop Before</p>
            <p className="rounded-lg bg-[var(--money)]/20 px-3 py-2 font-display text-[18px] font-extrabold text-gold-grad">
              September 26, 2026 · 7:00 PM
            </p>
            <div className="rounded-xl border border-border p-4">
              <p className="font-display text-[16px] font-extrabold leading-snug text-foreground">
                Build A Profitable AI Influencer Page , {" "}
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
