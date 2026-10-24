import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/Footer";
import razorpayMark from "@/assets/razorpay-mark.svg";

const TITLE = "AI Virtual Influencer & Creator Masterclass | Live Workshop ₹29";
const DESCRIPTION =
  "Join the live masterclass on building realistic AI virtual models, consistent character design, and social media content using mobile AI tools. Live Zoom training on 29th October (Thursday).";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

/* ---------------------------------- data --------------------------------- */

const CURRICULUM_MODULES = [
  {
    number: "01",
    title: "Virtual Character Architecture",
    description:
      "Learn how to conceptualize and craft a unique virtual persona, select high-demand niches (fashion, lifestyle, tech), and establish a distinctive visual brand identity.",
    points: [
      "Character concept design & persona building",
      "Niche selection & market research",
      "Structuring prompt baselines for character traits",
    ],
  },
  {
    number: "02",
    title: "100% Face & Anatomy Consistency",
    description:
      "The exact prompt engineering framework to lock facial features, eye shape, and skin tone across hundreds of different scenes, outfits, and lighting conditions.",
    points: [
      "Eliminating the plastic 'AI look' with natural skin textures",
      "Consistent facial geometry across diverse backgrounds",
      "Seed locking & multi-angle model stability",
    ],
  },
  {
    number: "03",
    title: "Studio Lighting, Framing & Cinematic Realism",
    description:
      "Master composition techniques including aperture, bokeh, natural outdoor daylight, and studio portrait lighting to make your generations look shot on a DSLR.",
    points: [
      "Camera angle, focal length & depth-of-field control",
      "Golden hour, studio softbox & candid street lighting",
      "4K upscaling for ultra-crisp social media assets",
    ],
  },
  {
    number: "04",
    title: "Dynamic Video, Motion & Social Media Growth",
    description:
      "Transform static images into dynamic talking avatars, short-form reels, and cinematic video clips tailored for Instagram, YouTube Shorts, and LinkedIn reach.",
    points: [
      "Turning portraits into realistic motion video",
      "Hook design & viral short-form editing principles",
      "Content calendar automation for daily posting",
    ],
  },
  {
    number: "05",
    title: "Digital Monetization & Brand Partnerships",
    description:
      "Explore 5 legitimate business models used by virtual creators, including brand sponsorships, digital product promotion, creator communities, and client work.",
    points: [
      "How virtual creators partner with fashion & tech brands",
      "Setting up affiliate & subscriber communities",
      "Offering AI content creation services to businesses",
    ],
  },
];

const AUDIENCE_SEGMENTS = [
  {
    icon: "🎨",
    title: "Digital Creators & Influencers",
    desc: "Scale your creative brand and output without camera anxiety or expensive photography equipment.",
  },
  {
    icon: "💼",
    title: "Marketers & Agency Owners",
    desc: "Create bespoke virtual models and creative visual campaigns for your clients at a fraction of standard production costs.",
  },
  {
    icon: "💻",
    title: "Freelancers & Designers",
    desc: "Add high-demand generative AI skills and virtual character design to your freelance service offerings.",
  },
  {
    icon: "🚀",
    title: "Beginners & Tech Enthusiasts",
    desc: "Start with zero coding or design background using 100% free mobile-friendly tools taught from ground zero.",
  },
];

const FAQ = [
  {
    q: "Is this workshop live or pre-recorded?",
    a: "This is a 100% live and interactive workshop on Zoom. You will be able to see the live demonstrations and ask questions in real-time.",
  },
  {
    q: "Do I need a high-end laptop or paid AI subscriptions?",
    a: "No laptop is required. All workflows and tools demonstrated in this masterclass can be operated directly on your smartphone using free AI platforms.",
  },
  {
    q: "Will I receive the prompts and resources used in the class?",
    a: "Yes. All attendees receive starter prompt templates and step-by-step documentation to practice during and after the session.",
  },
  {
    q: "In what language is the workshop conducted?",
    a: "The session is delivered in an easy-to-understand mix of Hindi and English to ensure full conceptual clarity.",
  },
  {
    q: "What if I miss the live session?",
    a: "An optional lifetime recording and notes bundle is available as an add-on during registration so you can learn at your own pace anytime.",
  },
];

/* -------------------------------- components ------------------------------ */

export function getCheckoutUrl(): string {
  if (typeof window === "undefined") return "/checkout";
  let search = window.location.search;
  if (search && search.length > 1) {
    try {
      sessionStorage.setItem("ad_tracking_params", search);
      localStorage.setItem("ad_tracking_params", search);
    } catch {}
  } else {
    try {
      search =
        sessionStorage.getItem("ad_tracking_params") ||
        localStorage.getItem("ad_tracking_params") ||
        "";
    } catch {}
  }

  if (!search) return "/checkout";
  return `/checkout${search.startsWith("?") ? search : `?${search}`}`;
}

function Cta({ label = "Register For Live Workshop 👉" }: { label?: string }) {
  const [url, setUrl] = useState("/checkout");

  useEffect(() => {
    setUrl(getCheckoutUrl());
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-register-modal"));
    }
  };

  return (
    <a
      href={url}
      onClick={handleClick}
      onMouseDown={() => setUrl(getCheckoutUrl())}
      onTouchStart={() => setUrl(getCheckoutUrl())}
      className="btn-cta text-center text-[15px] sm:text-[17px] cursor-pointer"
    >
      <span className="block w-full text-center leading-tight">{label}</span>
    </a>
  );
}

function RegistrationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      const qName = sessionStorage.getItem("lead_name") || "";
      const qPhone = sessionStorage.getItem("lead_phone") || "";
      const qEmail = sessionStorage.getItem("lead_email") || "";
      if (qName) setName(qName);
      if (qPhone) setPhone(qPhone);
      if (qEmail) setEmail(qEmail);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
      setError("Please enter a valid 10-digit WhatsApp number.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      sessionStorage.setItem("lead_name", cleanName);
      sessionStorage.setItem("lead_phone", cleanPhone);
      sessionStorage.setItem("lead_email", cleanEmail);
    } catch {}

    if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
      try {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead", {
          content_name: "Workshop Registration Modal",
          value: 29.0,
          currency: "INR",
        });
      } catch (err) {
        console.warn("Pixel Lead warning:", err);
      }
    }

    try {
      fetch("https://prateek.n8n.preetamsoni.com/webhook/ai-influencer-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lead_registered_modal",
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          workshop_date: "29th October 2026 (Thursday) 7:00 PM IST",
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {}

    const baseUrl = getCheckoutUrl();
    const joinChar = baseUrl.includes("?") ? "&" : "?";
    const targetUrl = `${baseUrl}${joinChar}step=2&name=${encodeURIComponent(cleanName)}&phone=${cleanPhone}&email=${encodeURIComponent(cleanEmail)}`;
    window.location.href = targetUrl;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-2xl border border-white/15 bg-card p-5 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close registration modal"
          className="absolute right-3.5 top-3.5 size-7 rounded-full bg-white/10 text-center text-lg leading-none text-muted-foreground hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
        >
          ×
        </button>

        <div className="text-center pr-6">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
            <span>⚡</span>
            <span>Live Interactive Masterclass</span>
          </p>
          <h2 className="mt-1 font-display text-[21px] font-extrabold leading-tight text-white">
            Register For Just <span className="text-gold-grad">₹29</span>
          </h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            29th October 2026 (Thursday) · 7:00 PM IST · Zoom
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="on" className="mt-4 space-y-3.5">
          <div>
            <label htmlFor="reg-name" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Full Name *
            </label>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-muted-foreground/60 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-tel" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              WhatsApp Mobile Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-white/10 bg-white/5 px-3 text-[13px] font-semibold text-muted-foreground">
                +91
              </span>
              <input
                id="reg-tel"
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
                className="w-full rounded-r-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-muted-foreground/60 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Zoom link and VIP group invite will be sent here.
            </p>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Email Address *
            </label>
            <input
              id="reg-email"
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
              className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-[14px] text-white placeholder:text-muted-foreground/60 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-[12px] font-semibold text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-cta w-full flex items-center justify-center gap-2 py-3 cursor-pointer disabled:opacity-60 transition-transform hover:scale-[1.01]"
          >
            <span>{isSubmitting ? "Opening Pass Options…" : "Register For ₹29 👉"}</span>
          </button>

          <p className="text-center text-[10.5px] text-muted-foreground">
            🔒 100% Secure Razorpay Checkout • Instant Delivery via Email &amp; WhatsApp
          </p>
        </form>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-auto mb-3 flex w-fit items-center gap-1.5 rounded-full border border-primary/35 bg-gradient-to-r from-primary/15 to-primary/5 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-primary shadow-sm shadow-primary/10 backdrop-blur-sm">
      {children}
    </span>
  );
}

function Section({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const hasVerticalPadding =
    className.includes("py-") || (className.includes("pt-") && className.includes("pb-"));
  return (
    <section id={id} className={`px-4 ${hasVerticalPadding ? "" : "py-9"} ${className}`}>
      <div className="mx-auto w-full max-w-[430px]">{children}</div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="surface overflow-hidden rounded-xl border border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="font-display text-[14.5px] font-bold text-foreground">{q}</span>
        <span className="text-primary font-bold text-lg">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <p className="border-t border-border px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
          {a}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------------------------- page --------------------------------- */

function Landing() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const joinRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOpen = () => setIsRegisterModalOpen(true);
    window.addEventListener("open-register-modal", handleOpen);
    return () => window.removeEventListener("open-register-modal", handleOpen);
  }, []);

  return (
    <main className="min-h-screen pb-28">
      {/* HERO SECTION */}
      <Section className="hero-glow overflow-hidden pt-6 pb-4">
        <p className="hero-kicker text-[11px] py-1 px-3.5 mx-auto">
          🎓 LIVE INTERACTIVE MASTERCLASS · 29TH OCTOBER 2026
        </p>

        <h1 className="mt-4 text-center text-[27px] leading-[1.22] font-extrabold sm:text-[36px]">
          Create &amp; Scale Your Own{" "}
          <span className="text-neon">AI Virtual Influencer</span>{" "}
          &amp; Digital Content Brand
        </h1>

        <p className="mt-3 text-center text-[13px] leading-relaxed text-muted-foreground sm:text-[14.5px] font-medium max-w-[420px] mx-auto">
          Learn how digital creators and agencies design photorealistic virtual avatars, achieve 100% face consistency, and build engaged social media audiences using free mobile AI tools.
        </p>

        {/* 3 Core Pillars */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-primary/30 bg-card/80 p-3 shadow-sm transition-all">
            <span className="text-base">📱</span>
            <p className="mt-1 text-[11px] font-bold leading-tight text-foreground">
              Mobile AI<br />
              <span className="text-primary font-black">100% Free Tools</span>
            </p>
          </div>
          <div className="rounded-xl border border-money/30 bg-card/80 p-3 shadow-sm transition-all">
            <span className="text-base">🎭</span>
            <p className="mt-1 text-[11px] font-bold leading-tight text-foreground">
              Face Consistency<br />
              <span className="text-money font-black">Exact Identity</span>
            </p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-card/80 p-3 shadow-sm transition-all">
            <span className="text-base">📈</span>
            <p className="mt-1 text-[11px] font-bold leading-tight text-foreground">
              Audience Growth<br />
              <span className="text-gold font-black">Monetization</span>
            </p>
          </div>
        </div>
      </Section>

      {/* WORKSHOP DETAILS & REGISTRATION CARD */}
      <Section id="join" className="pt-2 pb-6">
        <div ref={joinRef} className="surface p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl">
          <div className="mb-3.5 rounded-xl border border-gold/50 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 p-2.5 text-center shadow-md shadow-gold/5">
            <p className="text-[12px] font-extrabold tracking-wide text-gold flex items-center justify-center gap-1.5">
              <span className="animate-pulse">⚡</span>
              <span>SPECIAL EARLY BIRD PASS</span>
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium text-foreground/90">
              Limited to first 100 registrations. Claim your <span className="text-gold font-bold underline decoration-gold/60">₹29 seat</span> today!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-white/5 bg-secondary/80 p-2.5 text-center sm:p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                📅 Date
              </p>
              <p className="mt-0.5 font-display text-[14px] font-extrabold sm:text-[15px] text-foreground">
                29th October (Thursday)
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-secondary/80 p-2.5 text-center sm:p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                ⏰ Time
              </p>
              <p className="mt-0.5 font-display text-[14px] font-extrabold sm:text-[15px] text-gold">
                7:00 PM IST
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-secondary/80 p-2.5 text-center sm:p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                💻 Platform
              </p>
              <p className="mt-0.5 font-display text-[14px] font-extrabold sm:text-[15px] text-foreground">
                Zoom (Live Interactive)
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-secondary/80 p-2.5 text-center sm:p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                🗣️ Language
              </p>
              <p className="mt-0.5 font-display text-[14px] font-extrabold sm:text-[15px] text-foreground">
                Hindi + English
              </p>
            </div>
          </div>

          <div className="mt-4 text-center flex items-center justify-center gap-2.5">
            <span className="price-before text-sm font-bold text-muted-foreground/80">₹499</span>{" "}
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-gold-grad tracking-tight">
              ₹29
            </span>{" "}
            <span className="text-sm font-semibold text-muted-foreground">Only</span>
            <span className="ml-1 rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[10px] font-extrabold text-primary uppercase tracking-wide">
              94% OFF • EARLY BIRD
            </span>
          </div>

          <div className="mt-3.5">
            <Cta label="Register For Live Workshop at ₹29 👉" />
          </div>

          <div className="mt-3 flex flex-col items-center justify-center text-center text-[11px] font-medium text-muted-foreground">
            <div className="inline-flex items-center justify-center gap-1.5 text-center text-emerald-400 font-semibold">
              <img src={razorpayMark} alt="Razorpay" width={15} height={15} className="size-3.5 shrink-0" />
              <span>100% Secure Checkout Powered by Razorpay</span>
            </div>
            <p className="mt-0.5 text-[10.5px] leading-normal text-muted-foreground text-center">
              UPI (Google Pay, PhonePe, Paytm), Cards &amp; NetBanking
            </p>
          </div>
        </div>
      </Section>

      {/* CURRICULUM SECTION */}
      <Section className="glow-bg">
        <Eyebrow>📚 Comprehensive Syllabus</Eyebrow>
        <h2 className="text-center text-[24px] font-extrabold leading-tight">
          What You Will Learn In This <span className="text-neon">3-Hour Masterclass</span>
        </h2>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          Step-by-step masterclass covering end-to-end digital model generation, character consistency, and monetization.
        </p>

        <div className="mt-6 space-y-4">
          {CURRICULUM_MODULES.map((mod) => (
            <div
              key={mod.number}
              className="surface p-4 sm:p-5 rounded-2xl border border-white/10 transition-all hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary font-display font-extrabold text-sm">
                  {mod.number}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-[15.5px] font-extrabold text-foreground leading-snug">
                    {mod.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] text-muted-foreground leading-relaxed">
                    {mod.description}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {mod.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2 text-[12px] text-foreground/85">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Cta label="Join Live Masterclass For ₹29 👉" />
        </div>
      </Section>

      {/* WHO THIS IS FOR */}
      <Section className="glow-bg">
        <Eyebrow>🎯 Who Should Attend</Eyebrow>
        <h2 className="text-center text-[24px] font-extrabold leading-tight">
          Designed For <span className="text-gold-grad">Modern Digital Creators</span>
        </h2>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          Whether you are launching your first project or scaling an existing agency, this framework saves months of trial and error.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AUDIENCE_SEGMENTS.map((seg) => (
            <div
              key={seg.title}
              className="surface p-4 rounded-xl border border-white/10 flex items-start gap-3"
            >
              <span className="text-2xl shrink-0 mt-0.5">{seg.icon}</span>
              <div>
                <h3 className="text-[14px] font-bold text-foreground leading-snug">{seg.title}</h3>
                <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">{seg.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* MEET YOUR INSTRUCTOR */}
      <Section className="glow-bg">
        <Eyebrow>👨‍🏫 Meet Your Instructor</Eyebrow>
        <div className="surface p-5 sm:p-6 rounded-2xl border border-white/10 text-center">
          <div className="mx-auto size-20 rounded-full bg-gradient-to-tr from-primary to-ai-blue p-[2px]">
            <div className="size-full rounded-full bg-black flex items-center justify-center font-display font-black text-2xl text-gold-grad">
              PM
            </div>
          </div>

          <h3 className="mt-3 font-display text-[20px] font-extrabold text-foreground">
            Prateek Mayani
          </h3>
          <p className="text-[12px] font-bold text-primary uppercase tracking-wider">
            AI Content Strategist &amp; Digital Educator
          </p>

          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground max-w-md mx-auto">
            With over 5 years of digital media and generative AI experience, Prateek specializes in workflow optimization, virtual brand development, and audience monetization. Having trained thousands of creators across India, his mission is to equip aspiring creators with practical, actionable AI skills without technical complexity.
          </p>

          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-display text-lg font-black text-gold">5+ Years</p>
              <p className="text-[10.5px] text-muted-foreground uppercase">Experience</p>
            </div>
            <div>
              <p className="font-display text-lg font-black text-primary">5,000+</p>
              <p className="text-[10.5px] text-muted-foreground uppercase">Trained</p>
            </div>
            <div>
              <p className="font-display text-lg font-black text-emerald-400">4.9 ★</p>
              <p className="text-[10.5px] text-muted-foreground uppercase">Rating</p>
            </div>
          </div>
        </div>
      </Section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <Section className="glow-bg">
        <Eyebrow>❓ Student Queries</Eyebrow>
        <h2 className="text-center text-[24px] font-extrabold">Frequently Asked Questions</h2>
        <div className="mt-5 space-y-3">
          {FAQ.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
      </Section>

      {/* EDUCATIONAL DISCLAIMER & POLICY */}
      <Section>
        <div className="surface p-4 text-[11px] leading-relaxed text-muted-foreground rounded-xl border border-white/10">
          <h3 className="text-[13px] font-bold text-foreground">
            ⚠️ Educational Masterclass &amp; Registration Notice
          </h3>
          <p className="mt-2">
            This live workshop is structured for educational and skill-building purposes. Individual outcomes depend on individual effort, implementation, and market factors. We do not guarantee specific income results. All digital materials and Zoom links are delivered directly upon confirmed registration.
          </p>
          <hr className="my-3 border-border" />
          <p>
            🚫 The workshop pass fee of <strong className="text-foreground">₹29</strong> is strictly non-refundable once registered as live seats and resources are allocated immediately.
          </p>
        </div>
      </Section>

      {/* COMPLIANCE FOOTER (Full legal navigation for Razorpay review) */}
      <Footer minimal={false} />

      {/* STICKY CTA BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="mx-auto w-full max-w-[430px]">
          <p className="mb-1 text-center text-[11px] font-bold text-gold flex items-center justify-center gap-1">
            <span>⚡ Early Bird Access: ₹29 Only · Live On Zoom</span>
          </p>
          <Cta label="Register For Live Workshop at ₹29 👉" />
        </div>
      </div>

      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </main>
  );
}
