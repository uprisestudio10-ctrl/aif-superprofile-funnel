import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { verifyPayment } from "@/lib/checkout.functions";

export const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/IHwK76ChghnDyirB7VkTRp?mode=gi_t";

export const Route = createFileRoute("/thank-you-5034")({
  head: () => ({
    meta: [
      { title: "Thank You, Join The WhatsApp Group | AI Visual & Reels Masterclass" },
      {
        name: "description",
        content:
          "Your seat is booked for the live AI Visual & Reels Masterclass on 16th October (Friday), 7:00 PM. Join the WhatsApp group to receive your Zoom link.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYouPage,
});

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.4-.5c.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.5 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-[var(--money)]" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThankYouPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Strict deduplication guard: Ensure pixel events fire ONLY ONCE per buyer session
    // Prevents duplicate tracking when users return from WhatsApp, refresh, or tab switch
    if (sessionStorage.getItem("ty_pixel_already_fired")) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const payment_id =
      params.get("payment_id") ||
      sessionStorage.getItem("last_payment_id") ||
      "";
    const rawAmount =
      params.get("amount") ||
      sessionStorage.getItem("last_payment_amount") ||
      "29";
    const amountValue = parseFloat(rawAmount) || 29.0;

    let eventId = sessionStorage.getItem("ty_event_id");
    if (!eventId) {
      eventId = payment_id || ("ty-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8));
      sessionStorage.setItem("ty_event_id", eventId);
    }

    const firePixelEvents = () => {
      if ((window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
        if (sessionStorage.getItem("ty_pixel_already_fired")) {
          return true;
        }
        sessionStorage.setItem("ty_pixel_already_fired", "true");

        const fbq = (window as unknown as { fbq: (...args: unknown[]) => void }).fbq;
        const eventOptions = { eventID: eventId };

        fbq(
          "track",
          "Purchase",
          {
            value: amountValue,
            currency: "INR",
            content_name: "AI Influencer Workshop",
          },
          eventOptions
        );

        fbq(
          "track",
          "Lead",
          {
            value: amountValue,
            currency: "INR",
            content_name: "AI Influencer Workshop",
          },
          eventOptions
        );
        return true;
      }
      return false;
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!firePixelEvents()) {
      timer = setTimeout(firePixelEvents, 600);
    }

    const payment_request_id = params.get("payment_request_id");
    if (payment_id && payment_request_id) {
      verifyPayment({
        data: {
          payment_id,
          payment_request_id: payment_request_id || undefined,
        },
      }).catch((e) => console.error("Verification error:", e));
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-8">
      {/* Hero */}
      <div className="surface p-6 text-center rounded-2xl border border-border/80">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--money)]/15">
          <svg viewBox="0 0 24 24" className="size-9 text-[var(--money)]" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-4 font-display text-[24px] font-extrabold leading-tight">
          <span className="text-gold-grad">Registration Confirmed!</span> Join The WhatsApp Group For
          Zoom Access
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
          Your seat is secured for the live masterclass. The <strong className="text-foreground">live Zoom meeting link</strong> and workshop materials are shared exclusively inside our private WhatsApp group.
        </p>

        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            const w = window.open(WHATSAPP_GROUP_URL, "_blank", "noopener,noreferrer");
            if (!w) {
              try {
                window.top!.location.href = WHATSAPP_GROUP_URL;
              } catch {
                window.location.href = WHATSAPP_GROUP_URL;
              }
            }
          }}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 py-4 font-display text-[16px] font-extrabold text-black shadow-lg transition-transform active:scale-[0.98]"
          style={{ boxShadow: "0 10px 30px -10px color-mix(in oklab, #25D366 50%, transparent)" }}
        >
          <WhatsAppIcon className="size-6" />
          Join The WhatsApp Group
        </a>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Button not opening? Use direct link:{" "}
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-semibold text-[#25D366] underline"
          >
            {WHATSAPP_GROUP_URL}
          </a>
        </p>
      </div>

      {/* Workshop details */}
      <div className="surface mt-4 p-5 rounded-2xl border border-border/80">
        <p className="text-center font-display text-[16px] font-extrabold text-gold-grad">
          Masterclass Schedule
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-left">
          {[
            ["Date", "16th October 2026 (Friday)"],
            ["Time", "7:00 PM IST"],
            ["Platform", "Zoom Live"],
            ["Language", "Hindi + English"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-secondary/60 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {k}
              </p>
              <p className="mt-1 text-[13.5px] font-bold text-foreground">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What happens next */}
      <div className="surface mt-4 p-5 rounded-2xl border border-border/80">
        <p className="font-display text-[16px] font-extrabold text-foreground">What Happens Next</p>
        <ol className="mt-3 space-y-3">
          {[
            "Join the private WhatsApp community using the green button above.",
            "Receive the masterclass preparatory guide and guidelines.",
            "Access the live Zoom room link 15 minutes before the session starts.",
            "Participate live on 16th October (Friday) at 7:00 PM IST sharp.",
          ].map((line, i) => (
            <li key={line} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-extrabold text-primary">
                {i + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>
      </div>

      {/* Resource Delivery & 1:1 Call Guidelines */}
      <div className="surface mt-4 p-5 rounded-2xl border border-amber-500/40 bg-amber-500/5 text-left space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">📢</span>
          <h3 className="font-display text-[15.5px] font-extrabold text-amber-300">
            Important: Resource Delivery &amp; Next Steps
          </h3>
        </div>

        <div className="space-y-3 text-[12.5px] leading-relaxed text-foreground/90">
          <div className="rounded-xl border border-border/80 bg-background/60 p-3.5">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <span>🎬</span> Workshop Recording &amp; 300+ Prompts Delivery
            </p>
            <p className="mt-1 text-muted-foreground text-[12px] leading-relaxed">
              If you purchased the <strong className="text-foreground">Workshop Recording</strong> or <strong className="text-foreground">300+ Prompts Vault</strong>, they will be delivered directly to your <strong className="text-foreground">registered email within 12 hours after the live workshop ends</strong>.
            </p>
            <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-200 text-[11.5px] leading-relaxed">
              ⚡ <strong>Please do not panic:</strong> Delivery is 100% automated. If you don't find it in your Primary inbox, please check your <strong className="underline">Spam / Junk folder</strong> or <strong className="underline">Promotions tab</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-background/60 p-3.5">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <span>📞</span> 1-on-1 Consultation Call Attendees
            </p>
            <p className="mt-1 text-muted-foreground text-[12px] leading-relaxed">
              All 1:1 strategy calls are conducted <strong className="text-foreground">after the live workshop concludes</strong>. Once the workshop ends, you can directly message the <strong className="text-foreground">WhatsApp Group Admin</strong> to discuss and lock in your convenient 1:1 slot.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-background/60 p-3.5">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <span>✉️</span> Registered Email Check
            </p>
            <p className="mt-1 text-muted-foreground text-[12px] leading-relaxed">
              All links and bonus vault access will be sent to the exact email address you entered during checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Summary */}
      <div className="surface mt-4 space-y-2 p-5 rounded-2xl border border-border/80">
        <p className="text-center font-display text-[15px] font-extrabold text-foreground">
          What You Will Master In This Live Session
        </p>
        {[
          "Photorealistic character generation and facial symmetry",
          "Locking face consistency across multiple scenes & lighting",
          "Mobile video animation for high-retention Instagram Reels",
          "Audience growth and legitimate creator monetization models",
        ].map((line) => (
          <p key={line} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
            <CheckIcon />
            {line}
          </p>
        ))}
      </div>

      <Link to="/" className="mt-4 block text-center text-[13px] font-semibold text-muted-foreground">
        ← Back To Home
      </Link>
    </main>
  );
}
