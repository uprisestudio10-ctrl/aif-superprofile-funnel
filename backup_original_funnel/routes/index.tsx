import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Footer } from "@/components/Footer";

import heroBanner from "@/assets/hero-banner.webp.asset.json";
import page10 from "@/assets/instagram-proof/page-10.png.asset.json";
import page11 from "@/assets/instagram-proof/page-11.png.asset.json";
import page12 from "@/assets/instagram-proof/page-12.png.asset.json";
import page13 from "@/assets/instagram-proof/page-13.png.asset.json";
import page14 from "@/assets/instagram-proof/page-14.png.asset.json";
import page15 from "@/assets/instagram-proof/page-15.png.asset.json";
import page16 from "@/assets/instagram-proof/page-16.png.asset.json";
import page17 from "@/assets/instagram-proof/page-17.png.asset.json";
import page18 from "@/assets/instagram-proof/page-18.png.asset.json";
import page19 from "@/assets/instagram-proof/page-19.png.asset.json";
import page4 from "@/assets/instagram-proof/page-4.png.asset.json";
import page5 from "@/assets/instagram-proof/page-5.png.asset.json";
import page6 from "@/assets/instagram-proof/page-6.png.asset.json";
import page7 from "@/assets/instagram-proof/page-7.png.asset.json";
import page8 from "@/assets/instagram-proof/page-8.png.asset.json";
import page9 from "@/assets/instagram-proof/page-9.png.asset.json";

import gallery1 from "@/assets/gallery/gallery-1.webp.asset.json";
import gallery2 from "@/assets/gallery/gallery-2.webp.asset.json";
import gallery3 from "@/assets/gallery/gallery-3.webp.asset.json";
import gallery4 from "@/assets/gallery/gallery-4.webp.asset.json";
import gallery5 from "@/assets/gallery/gallery-5.webp.asset.json";
import gallery6 from "@/assets/gallery/gallery-6.webp.asset.json";
import gallery7 from "@/assets/gallery/gallery-7.webp.asset.json";
import gallery8 from "@/assets/gallery/gallery-8.webp.asset.json";
import gallery9 from "@/assets/gallery/gallery-9.webp.asset.json";
import gallery10 from "@/assets/gallery/gallery-10.webp.asset.json";
import gallery11 from "@/assets/gallery/gallery-11.webp.asset.json";
import gallery12 from "@/assets/gallery/gallery-12.webp.asset.json";
import gallery13 from "@/assets/gallery/gallery-13.webp.asset.json";
import gallery14 from "@/assets/gallery/gallery-14.webp.asset.json";
import gallery15 from "@/assets/gallery/gallery-15.webp.asset.json";
import gallery16 from "@/assets/gallery/gallery-16.webp.asset.json";
import gallery17 from "@/assets/gallery/gallery-17.webp.asset.json";
import mentor from "@/assets/mentor.jpg";
import razorpayMark from "@/assets/razorpay-mark.svg";
import sens1 from "@/assets/sensitive/sens-1.webp.asset.json";
import sens2 from "@/assets/sensitive/sens-2.webp.asset.json";
import sens3 from "@/assets/sensitive/sens-3.webp.asset.json";
import sens4 from "@/assets/sensitive/sens-4.webp.asset.json";
import sens5 from "@/assets/sensitive/sens-5.webp.asset.json";
import sens6 from "@/assets/sensitive/sens-6.webp.asset.json";
import sens7 from "@/assets/sensitive/sens-7.webp.asset.json";
import sens8 from "@/assets/sensitive/sens-8.webp.asset.json";
import vsResult from "@/assets/vs-result.webp.asset.json";

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
  { image: page6.url, username: "okay.adiiti", subscribers: 3259, price: 390 },
  { image: page19.url, username: "aaniasharmaa", subscribers: 1054, price: 390 },
  { image: page8.url, username: "sassy_poooo", subscribers: 173, price: 390 },
  { image: page17.url, username: "zaraso_phia", subscribers: 177, price: 290 },
  { image: page11.url, username: "myselfalinaa", subscribers: 79, price: 390 },
  { image: page10.url, username: "itsalassy", subscribers: 71, price: 390 },
  { image: page15.url, username: "anushkadaniofficial", subscribers: 70, price: 390 },
  { image: page7.url, username: "arohirawatz", subscribers: 83, price: 290 },
  { image: page4.url, username: "snowy_nitu", subscribers: 56, price: 390 },
  { image: page9.url, username: "sassy.maaya", subscribers: 47, price: 390 },
  { image: page5.url, username: "hey._pearl", subscribers: 60, price: 290 },
  { image: page12.url, username: "aira_rawat_", subscribers: 40, price: 390 },
  { image: page18.url, username: "relentlessdeepika", subscribers: 39, price: 390 },
  { image: page16.url, username: "ayahhshruti", subscribers: 49, price: 290 },
  { image: page13.url, username: "avnii_19_", subscribers: 23, price: 390 },
  { image: page14.url, username: "adhirashreee", subscribers: 37, price: 180 },
];

const GALLERY = [
  gallery1.url,
  gallery2.url,
  gallery3.url,
  gallery4.url,
  gallery5.url,
  gallery6.url,
  gallery7.url,
  gallery8.url,
  gallery9.url,
  gallery10.url,
  gallery11.url,
  gallery12.url,
  gallery13.url,
  gallery14.url,
  gallery15.url,
  gallery16.url,
  gallery17.url,
];

const SENSITIVE_GALLERY = [
  sens1.url,
  sens2.url,
  sens3.url,
  sens4.url,
  sens5.url,
  sens6.url,
  sens7.url,
  sens8.url,
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
    title: "Regular AI Tools Block Bold Generations",
    body: "You know the kind of bold content you want to create, but mainstream tools keep restricting your prompts and results.",
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

function Cta({ label = "Register For Live Workshop 👉" }: { label?: string }) {
  return (
    <a href="/checkout" className="btn-cta">
      {label}
    </a>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-auto mb-3 block w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
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
  return (
    <section id={id} className={`px-4 py-9 ${className}`}>
      <div className="mx-auto w-full max-w-[430px]">{children}</div>
    </section>
  );
}

function SensitiveImage({
  src,
  alt,
  width,
  height,
  className = "",
  onOpen,
  badge,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onOpen?: (src: string) => void;
  badge?: React.ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <button
      type="button"
      className={`sens-item ${revealed ? "sens-revealed" : ""} ${className}`}
      aria-label={revealed ? "Open image full screen" : "Sensitive content, tap to reveal"}
      onClick={() => (revealed ? onOpen?.(src) : setRevealed(true))}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={width}
        height={height}
        className="sens-img"
      />
      {badge}
      {!revealed && (
        <span className="sens-overlay" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="sens-overlay-title">Sensitive Content</span>
          <span className="sens-overlay-sub">Tap to view</span>
        </span>
      )}
    </button>
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
  const [bannerRevealed, setBannerRevealed] = useState(false);
  const [openGalleryImage, setOpenGalleryImage] = useState<string | null>(null);

  const [openInstagramProof, setOpenInstagramProof] = useState<
    (typeof INSTAGRAM_PAGES)[number] | null
  >(null);
  const joinRef = useRef<HTMLDivElement | null>(null);


  return (
    <main className="min-h-screen pb-28">
      {/* HERO */}
      <Section className="hero-glow overflow-hidden pt-6 pb-8">
        <p className="hero-kicker">
          The Secret To Creating <span className="text-ai-blue">Bold AI Influencer Photos</span>{" "}
          Revealed
        </p>

        <h1 className="mt-4 text-center text-[28px] leading-[1.16] font-extrabold sm:text-[32px]">
          Create Your Own <span className="text-neon">AI Influencer</span> &amp; Earn{" "}
          <span className="text-gold-grad">₹50,000–₹1,00,000/Month</span> By Uploading Her Bold
          Images
        </h1>

        <p className="hero-lead mt-6">
          There’s a <strong className="text-neon">secret AI tool</strong> that can create the kind of
          bold AI influencer images you’re unable to generate with tools like{" "}
          <strong className="text-foreground">Higgsfield, Seedance, Google Nano Banana</strong>{" "}
          &amp; more.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <span className="hero-chip">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-alert/20 text-[10px] font-bold text-alert">✕</span>
            No Paid Tools
          </span>
          <span className="hero-chip">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-money/20 text-[10px] font-bold text-money">✓</span>
            100% Face Consistency
          </span>
          <span className="hero-chip">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-alert/20 text-[10px] font-bold text-alert">✕</span>
            No AI Skin &amp; Traces
          </span>
          <span className="hero-chip">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-money/20 text-[10px] font-bold text-money">✓</span>
            Not Even ₹1 Needed
          </span>
        </div>

        <div className="scroll-banner mt-6">
          <p className="font-display text-[16px] font-extrabold leading-snug">
            Scroll Down To See The <span className="text-neon">AI Influencer Pages</span> Making{" "}
            <span className="text-gold-grad">₹50K–₹1L+ Every Month</span>
          </p>
          <p className="mt-1.5 text-[12px] font-bold text-ai-blue">
           , And See The Bold Images You’ll Be Able To Generate
          </p>
          <span className="scroll-arrow" aria-hidden="true">
            ↓
          </span>
        </div>

        <button
          type="button"
          className={`hero-banner mt-6 text-left ${bannerRevealed ? "sens-revealed" : ""}`}
          onClick={() => setBannerRevealed((v) => !v)}
          aria-label={bannerRevealed ? "Cover banner" : "Sensitive content, tap to view"}
        >
          <img
            src={heroBanner.url}
            alt="Collection of realistic AI influencer models created in the workshop"
            width={1920}
            height={1080}
            className="hero-banner-img w-full object-cover"
          />
          {!bannerRevealed && (
            <span className="sens-overlay hero-banner-sens" aria-hidden="true">
              <span className="sens-overlay-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="m4 4 16 16" />
                </svg>
              </span>
              <span className="sens-overlay-title">Sensitive Content</span>
              <span className="sens-overlay-sub">Tap to view</span>
            </span>
          )}
        </button>



        <p className="hero-lead mt-6">
          Create her content directly from your mobile, grow your Instagram page and monetize it
          through <strong className="text-gold-grad">subscriptions + 5+ income streams</strong>{" "}
          across <strong className="text-foreground">Instagram, Telegram, TeraBox, Facebook</strong>{" "}
          &amp; more.
        </p>
      </Section>

      {/* JOIN CARD */}
      <Section id="join">
        <div ref={joinRef} className="surface p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary/60 p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                📅 Date
              </p>
                <p className="mt-1 font-display text-[15px] font-bold">26th September</p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                ⏰ Time
              </p>
              <p className="mt-1 font-display text-[15px] font-bold">7:00 PM</p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                💻 Platform
              </p>
              <p className="mt-1 font-display text-[15px] font-bold">Zoom</p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                🗣️ Language
              </p>
              <p className="mt-1 font-display text-[15px] font-bold">Hindi + English</p>
            </div>
          </div>
          <p className="mt-4 text-center">
            <span className="price-before">₹499</span>{" "}
            <span className="font-display text-3xl font-extrabold text-gold-grad">₹29</span>{" "}
            <span className="text-sm font-semibold text-muted-foreground">Only</span>
          </p>
          <div className="mt-4">
            <Cta />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-muted-foreground">
            <img src={razorpayMark} alt="Razorpay" width={18} height={18} className="size-[18px]" />
            <span>Pay securely with Razorpay</span>
          </div>
        </div>
      </Section>

      {/* RESULTS */}
      <Section className="glow-bg overflow-hidden">
        <Eyebrow>✅ Real Instagram Pages</Eyebrow>
        <h2 className="text-center text-[24px] font-extrabold">
          <span className="text-gold-grad">100+ Indian Instagram Pages</span> Monetized
        </h2>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          Real subscription pages and their estimated monthly income
        </p>
        {/* TEMP (ads shoot): big static 3-per-row view — revert to marquee after */}
        <div className="instagram-proof-marquee instagram-proof-ads mt-5">
          <InstagramProofRow
            pages={INSTAGRAM_PAGES.slice(0, 3)}
            onOpen={setOpenInstagramProof}
          />
          <InstagramProofRow
            pages={INSTAGRAM_PAGES.slice(8, 11)}
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
          Take a look yourself, 100% realistic images, with no plastic skin
          and no visible traces of AI.
        </p>
        <div className="mt-5">
          <GalleryGrid images={GALLERY} onOpen={setOpenGalleryImage} />
        </div>
        <p className="mt-3 text-center text-[11px] font-bold text-ai-blue">
          👆 Tap any image to view full screen
        </p>

        {/* SENSITIVE IMAGES, generic tools can’t create these */}
        <div className="sens-block mt-8">
          <h3 className="text-center text-[21px] font-extrabold leading-tight">
            Generic AI Tools Can’t Create These Images , {" "}
            <span className="text-neon">
              We’ll Show You The Specialized Tools That Can
            </span>
          </h3>
          <p className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
            The popular AI apps can’t generate images like these, but specialized
            tools can. In the live workshop, we show you the exact tool + prompts
            that create them, on your phone.
          </p>
          <div className="gallery-grid mt-4">
            {SENSITIVE_GALLERY.map((src) => (
              <SensitiveImage
                key={src}
                src={src}
                alt="Bold AI influencer image generated with the workshop method"
                width={720}
                height={1280}
                className="gallery-grid-item"
                onOpen={setOpenGalleryImage}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] font-bold text-ai-blue">
            👆 Tap an image to reveal it
          </p>
        </div>
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
          Trying To Create Hot AI Influencer Content But{" "}
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
            create consistent, realistic bold AI influencer images directly from
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
          Generic Prompts vs <span className="text-lime-grad">Proven Bold Prompts</span>
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
            <SensitiveImage
              src={vsResult.url}
              alt="Realistic bold AI influencer image generated with proven prompts"
              width={720}
              height={1279}
              className="vs-sens"
              onOpen={setOpenGalleryImage}
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
          <Cta label="Get The Proven Prompts, Join Workshop 👉" />
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
              influencer images are generated, the bold influencer images that modern AI tools
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
            <li>
              ✅ <strong className="text-foreground">Ready-made prompts</strong>, your AI
              influencer’s character is generated for you, just copy-paste
            </li>
            <li>
              ✅ <strong className="text-foreground">Full setup done with you</strong>, her look,
              her name, her page, step by step in the class
            </li>
            <li>
              ✅ <strong className="text-foreground">Unlimited images from day one</strong> , 
              generate her content yourself, everything in your control
            </li>
            <li>
              ✅ <strong className="text-foreground">Monetization handled</strong>, 5+ income
              methods explained and mapped out, so you never figure it out alone
            </li>
            <li>
              ✅ Pay just <strong className="text-gold-grad">₹29</strong> , {" "}
              <strong className="text-foreground">we take care of the rest</strong>
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

      {/* FOOTER - ONLY PRIVACY POLICY & TERMS */}
      <Footer minimal />

      {/* STICKY CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur">
        <div className="mx-auto w-full max-w-[430px]">
          <p className="mb-1.5 text-center text-[11px] font-bold text-gold">
            🔥 Price increases to ₹499 soon!
          </p>
          <Cta label="Register For Live Workshop, ₹29" />
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
