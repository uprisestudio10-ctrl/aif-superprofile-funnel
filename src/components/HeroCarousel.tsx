import { useEffect, useState, useRef, useCallback } from "react";

export interface HeroSlide {
  src: string;
  alt: string;
  badge?: string;
  caption?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/hero-banner/hero-slide-1.webp",
    alt: "Realistic Indian AI Influencer Character in traditional glitter lehenga",
    badge: "100% Consistent Face",
    caption: "Traditional Ethnic Look",
  },
  {
    src: "/hero-banner/hero-slide-2.webp",
    alt: "Realistic AI Influencer Model in casual pink lounge outfit in front of mirror",
    badge: "Mirror Reflection & Anatomy",
    caption: "Casual Indoor Aesthetic",
  },
  {
    src: "/hero-banner/hero-slide-3.webp",
    alt: "AI Influencer posing in blue outfit with consistent face details",
    badge: "Natural Poses & Lighting",
    caption: "Studio Portrait Pose",
  },
  {
    src: "/hero-banner/hero-slide-4.webp",
    alt: "AI Influencer in festive red bridal outfit",
    badge: "Intricate Fabric Details",
    caption: "Festive Night Aesthetic",
  },
  {
    src: "/hero-banner/hero-slide-5.webp",
    alt: "AI Influencer in outdoor street style brown outfit",
    badge: "Outdoor Natural Daylight",
    caption: "Street Style Casual",
  },
];

const AUTO_SWIPE_INTERVAL_MS = 1500; // 1.5 seconds auto-swipe

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-swipe every 1.5 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_SWIPE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, currentIndex]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 40) {
      nextSlide();
    } else if (diffX < -40) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative mx-auto mt-3 w-full max-w-[295px] select-none sm:max-w-[330px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-tr from-primary/30 via-ai-blue/20 to-money/30 blur-xl opacity-75 transition-opacity duration-700"
        aria-hidden="true"
      />

      {/* Main 4:5 Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-2 border-primary/40 bg-black/60 shadow-2xl backdrop-blur-md">
        {/* Sliding Image Track */}
        <div
          className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className="relative h-full w-full shrink-0 overflow-hidden"
              aria-hidden={currentIndex !== idx}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={800}
                height={1000}
                fetchPriority={idx === 0 ? "high" : "auto"}
                loading={idx === 0 ? "eager" : "lazy"}
                className={`h-full w-full object-cover transition-transform duration-700 ${
                  currentIndex === idx ? "scale-100" : "scale-105 opacity-90"
                }`}
              />

              {/* Bottom gradient scrim for text readability */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </div>
          ))}
        </div>

        {/* Top Story-Style Segmented Progress Bars */}
        <div className="absolute top-2.5 inset-x-3 z-20 flex gap-1.5">
          {HERO_SLIDES.map((_, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;

            return (
              <div
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="h-1 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/30 backdrop-blur-sm"
              >
                <div
                  className={`h-full rounded-full bg-primary transition-all ${
                    isCompleted
                      ? "w-full"
                      : isActive
                        ? isPaused
                          ? "w-1/2"
                          : "w-full duration-[1500ms] ease-linear"
                        : "w-0"
                  }`}
                  style={
                    isActive && !isPaused
                      ? { transitionDuration: `${AUTO_SWIPE_INTERVAL_MS}ms` }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Top Floating Badge */}
        <div className="absolute top-6 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-money opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-money" />
            </span>
            <span>{HERO_SLIDES[currentIndex].badge}</span>
          </div>

          <div className="rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white/90 backdrop-blur-md">
            {currentIndex + 1} / {HERO_SLIDES.length}
          </div>
        </div>

        {/* Bottom Floating Info Pill */}
        <div className="absolute bottom-3 inset-x-3 z-20 flex items-end justify-between pointer-events-none">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              AI Influencer Model
            </p>
            <p className="font-display text-[15px] font-extrabold text-white drop-shadow-md">
              {HERO_SLIDES[currentIndex].caption}
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80 backdrop-blur-md">
            Auto 1.5s
          </span>
        </div>

        {/* Click zones for intuitive left/right navigation */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous image"
          className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
        >
          <span className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm">
            ‹
          </span>
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next image"
          className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
        >
          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm">
            ›
          </span>
        </button>
      </div>
    </div>
  );
}
