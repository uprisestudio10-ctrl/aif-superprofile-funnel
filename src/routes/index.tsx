import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Footer } from "@/components/Footer";
import heroBanner from "@/assets/hero-banner.webp";
import page10 from "@/assets/instagram-proof/page-10.png";
import page11 from "@/assets/instagram-proof/page-11.png";
import page12 from "@/assets/instagram-proof/page-12.png";
import page13 from "@/assets/instagram-proof/page-13.png";
import page14 from "@/assets/instagram-proof/page-14.png";
import page15 from "@/assets/instagram-proof/page-15.png";
import page16 from "@/assets/instagram-proof/page-16.png";
import page17 from "@/assets/instagram-proof/page-17.png";
import page18 from "@/assets/instagram-proof/page-18.png";
import page19 from "@/assets/instagram-proof/page-19.png";
import page4 from "@/assets/instagram-proof/page-4.png";
import page5 from "@/assets/instagram-proof/page-5.png";
import page7 from "@/assets/instagram-proof/page-7.png";
import page9 from "@/assets/instagram-proof/page-9.png";

import gallery1 from "@/assets/gallery/gallery-1.webp";
import gallery2 from "@/assets/gallery/gallery-2.webp";
import gallery3 from "@/assets/gallery/gallery-3.webp";
import gallery4 from "@/assets/gallery/gallery-4.webp";
import gallery5 from "@/assets/gallery/gallery-5.webp";
import gallery6 from "@/assets/gallery/gallery-6.webp";
import gallery7 from "@/assets/gallery/gallery-7.webp";
import gallery8 from "@/assets/gallery/gallery-8.webp";
import gallery9 from "@/assets/gallery/gallery-9.webp";
import gallery10 from "@/assets/gallery/gallery-10.webp";
import gallery11 from "@/assets/gallery/gallery-11.webp";
import gallery12 from "@/assets/gallery/gallery-12.webp";
import gallery13 from "@/assets/gallery/gallery-13.webp";
import gallery14 from "@/assets/gallery/gallery-14.webp";
import gallery15 from "@/assets/gallery/gallery-15.webp";
import gallery16 from "@/assets/gallery/gallery-16.webp";
import gallery17 from "@/assets/gallery/gallery-17.webp";
import gallery18 from "@/assets/gallery/gallery-18.webp";
import gallery19 from "@/assets/gallery/gallery-19.webp";
import gallery20 from "@/assets/gallery/gallery-20.webp";
import gallery21 from "@/assets/gallery/gallery-21.webp";
import gallery22 from "@/assets/gallery/gallery-22.webp";
import gallery23 from "@/assets/gallery/gallery-23.webp";
import gallery24 from "@/assets/gallery/gallery-24.webp";
import gallery25 from "@/assets/gallery/gallery-25.webp";
import gallery26 from "@/assets/gallery/gallery-26.webp";
import gallery27 from "@/assets/gallery/gallery-27.webp";
import gallery28 from "@/assets/gallery/gallery-28.webp";
import gallery29 from "@/assets/gallery/gallery-29.webp";
import gallery30 from "@/assets/gallery/gallery-30.webp";
import mentor from "@/assets/mentor.jpg";
import razorpayMark from "@/assets/razorpay-mark.svg";

const TITLE = "AI Influencer Reels Workshop, Earn From Instagram (₹29)";
const DESCRIPTION =
  "Live Hindi workshop: create AI influencer images & reels on your mobile, grow an Instagram page without showing your face, and monetise it. Join for ₹29.";

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

const INSTAGRAM_PAGES = [
  { image: page19, username: "aaniasharmaa", subscribers: 1054, price: 390 },
  { image: page17, username: "zaraso_phia", subscribers: 177, price: 290 },
  { image: page11, username: "myselfalinaa", subscribers: 79, price: 390 },
  { image: page10, username: "itsalassy", subscribers: 71, price: 390 },
  { image: page15, username: "anushkadaniofficial", subscribers: 70, price: 390 },
  { image: page7, username: "arohirawatz", subscribers: 83, price: 290 },
  { image: page4, username: "snowy_nitu", subscribers: 56, price: 390 },
  { image: page9, username: "sassy.maaya", subscribers: 47, price: 390 },
  { image: page5, username: "hey._pearl", subscribers: 60, price: 290 },
  { image: page12, username: "aira_rawat_", subscribers: 40, price: 390 },
  { image: page18, username: "relentlessdeepika", subscribers: 39, price: 390 },
  { image: page16, username: "ayahhshruti", subscribers: 49, price: 290 },
  { image: page13, username: "avnii_19_", subscribers: 23, price: 390 },
  { image: page14, username: "adhirashreee", subscribers: 37, price: 180 },
];

const SORTED_INSTAGRAM_PAGES = [...INSTAGRAM_PAGES].sort(
  (a, b) => b.subscribers * b.price - a.subscribers * a.price
);

const GALLERY = [
  gallery1,
  gallery2,
  gallery3,
  gallery4,
  gallery5,
  gallery6,
  gallery7,
  gallery8,
  gallery9,
  gallery10,
  gallery11,
  gallery12,
  gallery13,
  gallery14,
  gallery15,
  gallery16,
  gallery17,
  gallery18,
  gallery19,
  gallery20,
  gallery21,
  gallery22,
  gallery23,
  gallery24,
  gallery25,
  gallery26,
  gallery27,
  gallery28,
  gallery29,
  gallery30,
];

const PAIN_ICONS: Record<string, React.ReactNode> = {
  block: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M5.8 5.8l12.4 12.4" />
    </svg>
  ),
  face: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11.5A8 8 0 1 1 12.5 4" />
      <path d="M17 3.5l3.5.5-.5 3.5" />
    </svg>
  ),
  robot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="8" width="14" height="11" rx="2.5" />
      <path d="M12 8V4.5M9.5 4.5h5" />
      <circle cx="9.5" cy="13" r="0.9" fill="currentColor" />
      <circle cx="14.5" cy="13" r="0.9" fill="currentColor" />
      <path d="M9.5 16h5" />
    </svg>
  ),
  money: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5v19" />
      <path d="M16.5 6.5c0-2-2-3-4.5-3s-4.5 1-4.5 3 1.6 2.8 4.5 3.4 4.5 1.6 4.5 3.6-2 3-4.5 3-4.5-1-4.5-3" />
    </svg>
  ),
};

const PAIN_POINTS = [
  {
    icon: "block",
    title: "Regular AI Tools Block Realistic Generations",
    body: "You know the kind of realistic content you want to create, but mainstream tools keep restricting your prompts and results.",
  },
  {
    icon: "face",
    title: "Her Face Changes With Every Generation",
    body: "One image looks perfect. The next one looks like a completely different person, making it almost impossible to build a consistent AI influencer.",
  },
  {
    icon: "robot",
    title: "Your Images Still Look “AI-Generated”",
    body: "Plastic skin, unnatural faces and weird details. Instead of looking like a real influencer, the content instantly looks artificial.",
  },
  {
    icon: "money",
    title: "Expensive Tools Are Too Expensive To Keep Using",
    body: "Multiple subscriptions just to generate content can quickly become expensive, especially when you're just starting out.",
  },
];

const VS_STATS = [
  {
    label: "Realism",
    bad: "Doll face / blocked",
    badPct: 15,
    good: "Real skin, pores, undetectable",
    goodPct: 95,
  },
  {
    label: "Face Consistency",
    bad: "Changes every time",
    badPct: 10,
    good: "Same face every time",
    goodPct: 98,
  },
  {
    label: "Speed",
    bad: "Weeks with no result",
    badPct: 20,
    good: "Ready in 60 seconds",
    goodPct: 100,
  },
  {
    label: "Variety",
    bad: "Same pose, fans cancel",
    badPct: 12,
    good: "Unlimited scenes & poses",
    goodPct: 100,
  },
];

const FAQ = [
  {
    q: "What is the date of the workshop?",
    a: "The date and time are shown at the top of this page, scroll up and check the workshop card.",
  },
  {
    q: "How do I register for the workshop?",
    a: "Click on “Register For The Live Workshop” and complete your payment. You’ll get a WhatsApp confirmation, join the WhatsApp group and you’ll receive the Zoom link there to join the webinar.",
  },
  {
    q: "Only have a mobile phone?",
    a: "Yes, 100% possible. Everything shown in the class runs on a normal Android or iPhone.",
  },
  {
    q: "Do I need paid AI tools?",
    a: "90% of the work gets done with free tools. If you want to grow faster, we’ll also show you the paid options, but they are not necessary.",
  },
  {
    q: "I’m a complete beginner, can I still do this?",
    a: "Yes. Everything is shown step-by-step on your mobile screen. If you can use Instagram, you can do this.",
  },
  {
    q: "Will my face be revealed anywhere?",
    a: "No. Your AI influencer does all the work, you stay 100% anonymous while your page grows.",
  },
  {
    q: "Is this a scam?",
    a: "No. It is a live class. You can see me and ask me questions directly.",
  },
  {
    q: "Will I get the recording?",
    a: "The recording is not included in ₹29. You can add it on the checkout page while paying.",
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
    } catch {
      // Storage unavailable or disabled
    }
  } else {
    try {
      search =
        sessionStorage.getItem("ad_tracking_params") ||
        localStorage.getItem("ad_tracking_params") ||
        "";
    } catch {
      // Storage unavailable
    }
  }

  if (!search) return "/checkout";
  return `/checkout${search.startsWith("?") ? search : `?${search}`}`;
}

function Cta({ label = "Register For Live Workshop 👉" }: { label?: string }) {
  const [url, setUrl] = useState("/checkout");

  useEffect(() => {
    setUrl(getCheckoutUrl());
  }, []);

  const handleClick = () => {
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
  };

  return (
    <a
      href={url}
      onClick={handleClick}
      onMouseDown={() => setUrl(getCheckoutUrl())}
      onTouchStart={() => setUrl(getCheckoutUrl())}
      className="btn-cta text-center text-[15px] sm:text-[17px]"
    >
      <span className="block w-full text-center leading-tight">{label}</span>
    </a>
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
  const hasVerticalPadding = className.includes("py-") || (className.includes("pt-") && className.includes("pb-"));
  return (
    <section id={id} className={`px-4 ${hasVerticalPadding ? "" : "py-9"} ${className}`}>
      <div className="mx-auto w-full max-w-[430px]">{children}</div>
    </section>
  );
}

function GalleryGrid({ images, onOpen }: { images: string[]; onOpen: (src: string) => void }) {
  return (
    <div className="gallery-grid">
      {images.map((src, index) => (
        <button
          key={src}
          type="button"
          className="gallery-grid-item"
          aria-label={`Open AI image ${index + 1} full screen`}
          onClick={() => onOpen(src)}
        >
          <img
            src={src}
            alt="Realistic AI influencer image created using the workshop method"
            loading="lazy"
            width={720}
            height={1280}
          />
        </button>
      ))}
    </div>
  );
}

function FullscreenImage({ src, onClose }: { src: string | null; onClose: () => void }) {
  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI image shown full screen"
      className="instagram-proof-modal"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close full-screen image"
        className="instagram-proof-modal-close"
        onClick={onClose}
      >
        ×
      </button>
      <img
        src={src}
        alt="AI influencer image shown full screen"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

function InstagramPageCard({
  page,
  onOpen,
}: {
  page: (typeof INSTAGRAM_PAGES)[number];
  onOpen: () => void;
}) {
  const monthlyIncome = page.subscribers * page.price;

  return (
    <button
      type="button"
      className="instagram-proof-card text-left"
      aria-label={`Open full-screen proof for ${page.username}`}
      onClick={onOpen}
    >
      <img
        src={page.image}
        alt={`${page.username} Instagram subscription page showing ${page.subscribers} subscribers at ₹${page.price} monthly`}
        width={720}
        height={1600}
        loading="lazy"
      />
      <div className="instagram-proof-copy">
        <p className="instagram-proof-handle">@{page.username}</p>
        <p>{page.subscribers.toLocaleString("en-IN")} subscribers × ₹{page.price}</p>
        <p className="instagram-proof-income">
          ≈ ₹{monthlyIncome.toLocaleString("en-IN")} / month
        </p>
      </div>
    </button>
  );
}

function InstagramProofRow({
  pages,
  onOpen,
  reverse = false,
}: {
  pages: typeof INSTAGRAM_PAGES;
  onOpen: (page: (typeof INSTAGRAM_PAGES)[number]) => void;
  reverse?: boolean;
}) {
  const repeatedPages = [...pages, ...pages];

  return (
    <div className="instagram-proof-row">
      <div className={`instagram-proof-track${reverse ? " instagram-proof-track-reverse" : ""}`}>
        {repeatedPages.map((page, index) => (
          <InstagramPageCard
            key={`${page.username}-${index}`}
            page={page}
            onOpen={() => onOpen(page)}
          />
        ))}
      </div>
    </div>
  );
}

function InstagramProofModal({
  page,
  onClose,
}: {
  page: (typeof INSTAGRAM_PAGES)[number] | null;
  onClose: () => void;
}) {
  if (!page) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Instagram proof for ${page.username}`}
      className="instagram-proof-modal"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close full-screen image"
        className="instagram-proof-modal-close"
        onClick={onClose}
      >
        ×
      </button>
      <img
        src={page.image}
        alt={`${page.username} Instagram subscription proof shown full screen`}
        width={720}
        height={1600}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}


function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="font-display text-[15px] font-bold">{q}</span>
        <span className="text-primary">{open ? "−" : "+"}</span>
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
  const [openGalleryImage, setOpenGalleryImage] = useState<string | null>(null);

  const [openInstagramProof, setOpenInstagramProof] = useState<
    (typeof INSTAGRAM_PAGES)[number] | null
  >(null);
  const joinRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (
        host.startsWith("members.") ||
        host.startsWith("learn.") ||
        host.startsWith("course.") ||
        host.startsWith("portal.")
      ) {
        window.location.replace("/portal" + window.location.search);
      }
    }
  }, []);

  return (
    <main className="min-h-screen pb-28">
      {/* HERO */}
      <Section className="hero-glow overflow-hidden pt-4 pb-2">
        <p className="hero-kicker text-[11px] py-1 px-3">
          The Secret To Creating <span className="text-ai-blue">Bold AI Influencer Photos</span> Revealed
        </p>

        <h1 className="mt-3 text-center text-[28px] leading-[1.18] font-extrabold sm:text-[37px]">
          Create Your Own <span className="text-neon">AI Influencer</span> &amp; Earn{" "}
          <span className="text-gold-grad">₹50,000–₹1,00,000/Month</span> By Uploading Her{" "}
          <span className="text-ai-blue">Bold Images</span>
        </h1>

        <p className="mt-3 text-center text-[13px] leading-relaxed text-muted-foreground sm:text-[14.5px] font-medium max-w-[420px] mx-auto">
          There’s a <strong className="text-foreground font-semibold">secret AI tool</strong> that can create the kind of <span className="text-primary font-bold">bold AI influencer images</span> you’re unable to generate with tools like <span className="text-muted-foreground/85 underline decoration-destructive/40">Higgsfield, Seedance, Google Nano Banana &amp; more</span>.
        </p>

        {/* 3 Key Highlights requested by user */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
          <div className="rounded-xl border border-money/30 bg-card/80 px-1.5 py-2.5 shadow-sm transition-all hover:border-money/50">
            <span className="text-sm">⚡</span>
            <p className="mt-0.5 text-[10.5px] font-bold leading-tight text-foreground sm:text-xs">
              Generate Images<br /><span className="mt-0.5 inline-block rounded-md bg-money/15 px-1.5 py-0.5 text-money font-black">100% Free</span>
            </p>
          </div>
          <div className="rounded-xl border border-primary/30 bg-card/80 px-1.5 py-2.5 shadow-sm transition-all hover:border-primary/50">
            <span className="text-sm">📱</span>
            <p className="mt-0.5 text-[10.5px] font-bold leading-tight text-foreground sm:text-xs">
              No Laptop<br /><span className="mt-0.5 inline-block rounded-md bg-primary/15 px-1.5 py-0.5 text-primary font-black">Needed (Mobile)</span>
            </p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-card/80 px-1.5 py-2.5 shadow-sm transition-all hover:border-gold/50">
            <span className="text-sm">⏱️</span>
            <p className="mt-0.5 text-[10.5px] font-bold leading-tight text-foreground sm:text-xs">
              Work Only<br /><span className="mt-0.5 inline-block rounded-md bg-gold/15 px-1.5 py-0.5 text-gold font-black">1 Hour / Day</span>
            </p>
          </div>
        </div>

        {/* HERO BANNER (Optimized WebP replacing slideshow) */}
        <div className="mt-4.5 overflow-hidden rounded-2xl border border-primary/30 bg-card/60 shadow-xl shadow-primary/10">
          <img
            src={heroBanner}
            alt="The Secret To Creating Bold AI Influencer Photos Revealed"
            width={1024}
            height={576}
            className="w-full h-auto object-cover block"
            loading="eager"
            fetchPriority="high"
          />
        </div>

        {/* HERO PROOF & GALLERY TEASER (Curiosity hook to scroll the full page) */}
        <a
          href="#results"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="group mt-3.5 block overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-card/95 via-[#180d2c]/90 to-card/95 p-3 sm:p-3.5 shadow-lg shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            {/* Pulsing indicator badge */}
            <div className="relative flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-ai-blue/15 border border-primary/30 shadow-inner">
              <span className="text-base sm:text-lg">🔥</span>
              <span className="absolute -top-1 -right-1 flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
            </div>

            {/* Hook text */}
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  Live Proof &amp; Image Gallery
                </span>
                <span className="text-[9.5px] font-semibold text-muted-foreground/80">• Scroll to explore</span>
              </div>
              <p className="mt-0.5 text-[12px] sm:text-[13px] font-bold text-foreground leading-snug">
                Scroll Down To See AI Pages Making <span className="text-gold font-extrabold">₹50K–₹1L+/Mo</span> &amp; The <span className="text-ai-blue font-extrabold">Bold Images</span> You Can Create
              </p>
            </div>

            {/* Bouncing down arrow CTA chip */}
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/25 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 animate-bounce"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </a>
      </Section>

      {/* JOIN CARD */}
      <Section id="join" className="pt-2 pb-7">
        <div ref={joinRef} className="surface p-4 sm:p-5">
          {/* Urgency message requested: Early Mover Advantage */}
          <div className="mb-3.5 rounded-xl border border-gold/50 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 p-2.5 text-center shadow-md shadow-gold/5">
            <p className="text-[12px] font-extrabold tracking-wide text-gold flex items-center justify-center gap-1.5">
              <span className="animate-pulse">⚡</span>
              <span>EARLY MOVER ADVANTAGE</span>
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium text-foreground/90">
              Nobody knows how to do this yet. Grab <span className="text-gold font-bold underline decoration-gold/60">₹29 access</span> before it blows up!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-white/5 bg-secondary/80 p-2.5 text-center sm:p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                📅 Date
              </p>
              <p className="mt-0.5 font-display text-[14px] font-extrabold sm:text-[15px] text-foreground">22nd October (Thursday)</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-secondary/80 p-2.5 text-center sm:p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                ⏰ Time
              </p>
              <p className="mt-0.5 font-display text-[14px] font-extrabold sm:text-[15px] text-gold">7:00 PM</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-secondary/80 p-2.5 text-center sm:p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                💻 Platform
              </p>
              <p className="mt-0.5 font-display text-[14px] font-extrabold sm:text-[15px] text-foreground">Zoom (Live)</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-secondary/80 p-2.5 text-center sm:p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                🗣️ Language
              </p>
              <p className="mt-0.5 font-display text-[14px] font-extrabold sm:text-[15px] text-foreground">Hindi + English</p>
            </div>
          </div>

          <div className="mt-4 text-center flex items-center justify-center gap-2.5">
            <span className="price-before text-sm font-bold text-muted-foreground/80">₹499</span>{" "}
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-gold-grad tracking-tight">₹29</span>{" "}
            <span className="text-sm font-semibold text-muted-foreground">Only</span>
            <span className="ml-1 rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[10px] font-extrabold text-primary uppercase tracking-wide">94% OFF • EARLY BIRD</span>
          </div>
          <div className="mt-3.5">
            <Cta />
          </div>
          <div className="mt-3 flex flex-col items-center justify-center text-center text-[11px] font-medium text-muted-foreground">
            <div className="inline-flex items-center justify-center gap-1.5 text-center text-emerald-400 font-semibold">
              <img src={razorpayMark} alt="Razorpay" width={15} height={15} className="size-3.5 shrink-0" />
              <span>100% Secure Checkout</span>
            </div>
            <p className="mt-0.5 text-[10.5px] leading-normal text-muted-foreground text-center">
              UPI (GPay, PhonePe, Paytm), Cards &amp; NetBanking
            </p>
          </div>
        </div>
      </Section>

        {/* RESULTS */}
        <Section id="results" className="glow-bg overflow-hidden scroll-mt-4">
          <Eyebrow>✅ Real Instagram Pages</Eyebrow>
          <h2 className="text-center text-[24px] font-extrabold">
            <span className="text-gold-grad">100+ Indian Instagram Pages</span> Monetized
          </h2>
          <p className="mt-2 text-center text-[13px] text-muted-foreground">
            Real subscription pages and their estimated monthly income
          </p>
          <div className="instagram-proof-marquee mt-5">
            <InstagramProofRow
              pages={SORTED_INSTAGRAM_PAGES.slice(0, 7)}
              onOpen={setOpenInstagramProof}
            />
            <InstagramProofRow
              pages={SORTED_INSTAGRAM_PAGES.slice(7, 14)}
              onOpen={setOpenInstagramProof}
              reverse
            />
          </div>
          <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
            Estimated income = visible subscribers × monthly subscription price. Actual earnings may
            vary.
          </p>
        <div className="method-tease">
          <p className="method-tease-title">
            How Thousands Of Indian Creators <span className="text-gold-grad">Earn Like This</span>
          </p>
          <div className="method-flow">
            <div className="method-step">
              <span className="method-step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="7.5" r="3.5" />
                  <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
                </svg>
              </span>
              <span className="method-step-label">
                Create
                <br />
                AI Influencer
              </span>
            </div>
            <span className="method-flow-arrow" aria-hidden="true">
              →
            </span>
            <div className="method-step">
              <span className="method-step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                  <path d="M10.5 10.5l4 2.5-4 2.5z" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span className="method-step-label">
                Upload
                <br />
                On Instagram
              </span>
            </div>
            <span className="method-flow-arrow" aria-hidden="true">
              →
            </span>
            <div className="method-step">
              <span className="method-step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M9.5 8h5M9.5 11h5M12 8v8M9.5 14.5c.6 1.2 4.4 1.2 5 0" />
                </svg>
              </span>
              <span className="method-step-label">
                Earn From
                <br />
                Subscriptions
              </span>
            </div>
          </div>
          <p className="method-tease-note">
            Exact process revealed in our <strong className="text-neon">Live Workshop</strong> , 
            plus <strong className="text-gold-grad">5 more income streams</strong> 👇
          </p>
          <div className="method-platforms">
            <span>TeraBox</span>
            <span>Telegram</span>
            <span>Facebook</span>
            <span className="method-platforms-more">+ More</span>
          </div>
        </div>
        <div className="mt-4">
          <Cta label="Register For Live Workshop 👉" />
        </div>
      </Section>

      {/* SHOWCASE */}
      <Section className="glow-bg overflow-hidden">
        <Eyebrow>🖼️ 100% AI Generated</Eyebrow>
        <h2 className="text-center text-[24px] font-extrabold">
          These Are The Images You’ll Be Able To Generate{" "}
          <span className="text-neon">After The Workshop</span>
        </h2>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          Take a look yourself, <strong className="text-foreground font-bold">100% realistic images</strong>, with{" "}
          <span className="text-primary font-bold">no plastic skin</span> and{" "}
          <span className="text-ai-blue font-bold">no visible traces of AI</span>.
        </p>
        <div className="mt-5">
          <GalleryGrid images={GALLERY} onOpen={setOpenGalleryImage} />
        </div>
        <p className="mt-3 text-center text-[11px] font-bold text-ai-blue">
          👆 Tap any image to view full screen
        </p>

        <p className="mt-5 text-center text-[14px] font-bold">
          Want to create images like these? 👇
        </p>
        <div className="mt-3">
          <Cta label="Join Live Workshop For ₹29 👉" />
        </div>
      </Section>

      {/* PAIN POINTS */}
      <Section className="glow-bg">
        <h2 className="text-center text-[24px] font-extrabold">
          Trying To Create Viral AI Influencer Content But{" "}
          <span className="text-neon">Keep Hitting These Problems?</span>
        </h2>
        <div className="pain-grid mt-5">
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className="pain-card">
              <span className="pain-icon" aria-hidden="true">
                {PAIN_ICONS[p.icon]}
              </span>
              <div>
                <h3 className="text-[15px] font-bold leading-snug">{p.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="pain-close mt-6">
          <p className="text-center font-display text-[19px] font-extrabold leading-snug">
            The Problem Isn’t Your Idea.{" "}
            <span className="text-gold-grad">It’s The Tools &amp; Prompts You’re Using.</span>
          </p>
          <p className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
            With the right tool + ready-made prompts + the right process, you can
            create consistent, ultra-realistic AI influencer images directly from
            your mobile, without expensive AI subscriptions.
          </p>
        </div>
        <div className="mt-4">
          <Cta label="Join The Live Workshop 👉" />
        </div>
      </Section>

      {/* GENERIC VS PROVEN PROMPTS */}
      <Section className="glow-bg overflow-hidden">
        <Eyebrow>⚡ The Difference</Eyebrow>
        <h2 className="text-center text-[24px] font-extrabold leading-tight">
          Generic Prompts vs <span className="text-lime-grad">Proven Master Prompts</span>
        </h2>
        <div className="vs-grid mt-6">
          <div className="vs-fail">
            <span className="vs-fail-icon" aria-hidden="true">
              !
            </span>
            <h3 className="mt-3 font-display text-[16px] font-extrabold">Failed</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              “This generation may violate our policies. Please try a different prompt.”
            </p>
          </div>
          <div className="vs-img-wrap">
            <img
              src={gallery1}
              alt="Realistic AI influencer image generated with proven prompts"
              width={720}
              height={1279}
              className="vs-img"
              loading="lazy"
            />
            <span className="vs-img-badge">Generated ✅</span>
          </div>
        </div>
        <div className="vs-cols mt-5">
          <div>
            <h3 className="text-center font-display text-[15px] font-extrabold text-danger">
              Generic Prompt
            </h3>
            <p className="mt-0.5 text-center text-[11px] font-semibold text-muted-foreground">
              Regular AI + copied prompt
            </p>
          </div>
          <div>
            <h3 className="text-center font-display text-[15px] font-extrabold text-lime-grad">
              Proven Prompts Pack
            </h3>
            <p className="mt-0.5 text-center text-[11px] font-semibold text-muted-foreground">
              Secret AI tool + proven prompts
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3.5">
          {VS_STATS.map((s) => (
            <div key={s.label} className="vs-row">
              <div>
                <p className="text-[12px] font-bold">{s.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.bad}</p>
                <div className="vs-bar">
                  <span className="vs-bar-bad" style={{ width: `${s.badPct}%` }} />
                </div>
              </div>
              <div>
                <p className="text-right text-[12px] font-bold">
                  {s.label} <span className="text-lime">{s.goodPct}%</span>
                </p>
                <p className="mt-0.5 text-right text-[11px] text-muted-foreground">{s.good}</p>
                <div className="vs-bar">
                  <span className="vs-bar-good" style={{ width: `${s.goodPct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[13.5px] leading-relaxed text-muted-foreground">
          In the live workshop you get the{" "}
          <strong className="text-foreground">same proven prompts + the secret tool</strong>, so
          your generations stop failing and start looking{" "}
          <strong className="text-lime-grad font-bold">this real</strong>.
        </p>
        <div className="mt-4">
          <Cta label="Get The Proven Prompts & Join Workshop 👉" />
        </div>
      </Section>
      <Section className="glow-bg">
        <Eyebrow>👨‍🏫 Your Mentor</Eyebrow>
        <h2 className="mt-2 text-center font-display text-[15px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Meet Your Mentor
        </h2>
        <p className="mt-1 text-center font-display text-[30px] font-extrabold leading-tight text-gold-grad">
          Prateek Mayani
        </p>
        <p className="mt-2 text-center text-[14px] font-bold leading-snug">
          The Man Behind India’s Most <span className="text-neon">Realistic AI Influencers</span>
        </p>
        <div className="surface mt-5 overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-[var(--ai-blue)] to-[var(--money)] p-[3px]">
            <img
              src={mentor}
              alt="Prateek Mayani, AI influencer workshop mentor"
              loading="lazy"
              width={912}
              height={1104}
              className="h-auto w-full rounded-lg object-contain"
            />
          </div>
          <div className="space-y-3 p-4 text-[13.5px] leading-relaxed text-muted-foreground">
            <p>
              I am not here to say big things. I am not a big hero or a movie star , {" "}
              <strong className="text-foreground">I am a simple man like you.</strong>
            </p>
            <p>
              I have been in this digital space for more than five years now, and I want to show
              you the <strong className="text-foreground">actual, real way</strong> all of these AI
              influencer images are generated, the viral influencer images that modern AI tools
              block. In this workshop, I’ll reveal the exact method so you can generate them
              yourself,{" "}
              <strong className="text-foreground">completely free, without paying even ₹1</strong>{" "}
              for any AI tool.
            </p>
          </div>
        </div>
        <div className="surface mt-4 p-4">
          <h3 className="text-center font-display text-[16px] font-extrabold">
            Your Only Job: <span className="text-gold-grad">Join The Workshop.</span>
          </h3>
          <p className="mt-1 text-center text-[12.5px] font-semibold text-muted-foreground">
            Everything else, we hand you ready-made 👇
          </p>
          <ul className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-foreground/90">
            <li className="flex items-start gap-2">
              <span className="text-money font-bold shrink-0">✅</span>
              <div>
                <strong className="text-foreground">Ready-made prompts</strong>, your AI
                influencer’s character is generated for you, just copy-paste
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-money font-bold shrink-0">✅</span>
              <div>
                <strong className="text-foreground">Full setup done with you</strong>, her look,
                her name, her page, step by step in the class
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-money font-bold shrink-0">✅</span>
              <div>
                <strong className="text-foreground">Unlimited images from day one</strong> , 
                generate her content yourself, everything in your control
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-money font-bold shrink-0">✅</span>
              <div>
                <strong className="text-foreground">Monetization handled</strong>, 5+ income
                methods explained and mapped out, so you never figure it out alone
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-money font-bold shrink-0">✅</span>
              <div>
                Pay just <strong className="text-gold-grad font-black text-sm">₹29</strong> , {" "}
                <strong className="text-foreground">we take care of the rest</strong>
              </div>
            </li>
          </ul>
        </div>
        <div className="mt-4">
          <Cta label="Register For Live Workshop 👉" />
        </div>
      </Section>

      {/* FAQ */}
      <Section className="glow-bg">
        <h2 className="text-center text-[24px] font-extrabold">Simple Questions ❓</h2>
        <div className="mt-5 space-y-3">
          {FAQ.map((f) => (
            <Faq key={f.q} {...f} />
          ))}
        </div>
      </Section>

      {/* DISCLAIMER */}
      <Section>
        <div className="surface p-4 text-[11px] leading-relaxed text-muted-foreground">
          <h3 className="text-[13px] font-bold text-foreground">
            ⚠️ Disclaimer &amp; Non-Refundable Policy
          </h3>
          <p className="mt-2">
            This workshop is for <strong className="text-foreground">educational purposes only</strong>.
            Results mentioned are not typical and may vary from person to person depending on
            individual effort, skills and market conditions. We do not guarantee any specific income
            or earnings. This site is not affiliated with or endorsed by Instagram / Meta Platforms
            Inc.
          </p>
          <hr className="my-3 border-border" />
          <p>
            🚫 The registration fee of <strong className="text-foreground">₹29</strong> is strictly
            non-refundable once payment is made. Since this is a live digital workshop with instant
            access, no refunds will be issued. By completing payment you agree to this policy.
          </p>
        </div>
      </Section>

      {/* FOOTER - COMPLIANCE LINKS (Clean minimal footer with Privacy Policy and Terms) */}
      <Footer minimal={true} />

      {/* STICKY CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="mx-auto w-full max-w-[430px]">
          <p className="mb-1 text-center text-[11px] font-bold text-gold flex items-center justify-center gap-1">
            <span>⚡ Early Mover Advantage: ₹29 Only (Nobody Knows This Yet)</span>
          </p>
          <Cta label="Register For Live Workshop at ₹29 👉" />
        </div>
      </div>

      <FullscreenImage
        src={openGalleryImage}
        onClose={() => setOpenGalleryImage(null)}
      />
      <InstagramProofModal
        page={openInstagramProof}
        onClose={() => setOpenInstagramProof(null)}
      />
    </main>
  );
}
