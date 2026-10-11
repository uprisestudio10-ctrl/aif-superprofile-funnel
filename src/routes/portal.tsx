import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {
  COURSE_MODULES,
  TOTAL_LESSONS_COUNT,
  OFFICIAL_COURSE_BONUSES,
  type CourseLesson,
} from "@/data/course-curriculum";
import { BunnyVideoPlayer } from "@/components/course/BunnyVideoPlayer";
import { verifyCourseAccess, type StudentSession } from "@/lib/course.functions";

const coerceSafeString = z
  .unknown()
  .transform((val) => (val !== undefined && val !== null ? String(val).trim() : undefined))
  .optional();

const portalSearchSchema = z.object({
  email: coerceSafeString,
  phone: coerceSafeString,
  identifier: coerceSafeString,
  key: coerceSafeString,
  v: coerceSafeString,
});

export const Route = createFileRoute("/portal")({
  validateSearch: (search: Record<string, unknown>) => {
    try {
      return portalSearchSchema.parse(search ?? {});
    } catch {
      return {
        email: search?.email != null ? String(search.email).trim() : undefined,
        phone: search?.phone != null ? String(search.phone).trim() : undefined,
        identifier: search?.identifier != null ? String(search.identifier).trim() : undefined,
        key: search?.key != null ? String(search.key).trim() : undefined,
        v: search?.v != null ? String(search.v).trim() : undefined,
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Student Portal | AI Influencer Mastery" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090a0c] px-4 text-center text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121316] p-8 shadow-2xl backdrop-blur-xl">
        <span className="inline-block rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-[11px] font-bold tracking-widest text-destructive">
          PORTAL ACCESS NOTICE
        </span>
        <h2 className="mt-4 font-display text-[22px] font-extrabold text-white">
          Course Portal
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {error?.message || "There was a temporary issue loading the portal. Click below to refresh or login."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-primary px-5 py-2.5 text-[14px] font-extrabold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Try Again
          </button>
          <a
            href="/portal"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Open Portal Login
          </a>
        </div>
      </div>
    </div>
  ),
  component: CoursePortalPage,
});

const STORAGE_SESSION_KEY = "aif_student_session";
const STORAGE_COMPLETED_KEY = "aif_completed_lessons";

function CoursePortalPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  // Active student session
  const [session, setSession] = useState<StudentSession | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login form states (supports email OR phone number)
  const initialUser = (search.email || search.phone || search.identifier || "").trim();
  const [emailInput, setEmailInput] = useState(initialUser);
  const [keyInput, setKeyInput] = useState(search.key || "");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // All lessons flat array
  const allLessons = useMemo(() => {
    return COURSE_MODULES.flatMap((m) => m.lessons);
  }, []);

  // LMS active lesson state
  const [activeLesson, setActiveLesson] = useState<CourseLesson>(() => {
    if (search.v) {
      const found = allLessons.find((l) => l.id === search.v);
      if (found) return found;
    }
    return allLessons[0];
  });

  // Completed lessons set
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_COMPLETED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync inputs with search params
  useEffect(() => {
    const rawParam = (search.email || search.phone || search.identifier || "").trim();
    if (rawParam) setEmailInput(rawParam);
    if (search.key) setKeyInput(search.key);
  }, [search.email, search.phone, search.identifier, search.key]);

  // Auto-authenticate if search params contain email or phone
  useEffect(() => {
    const rawParam = (search.email || search.phone || search.identifier || "").trim();
    if (rawParam) {
      const currentEmail = session?.email?.toLowerCase();
      const currentPhone = session?.phone?.replace(/\D/g, "");
      const isCurrent =
        currentEmail === rawParam.toLowerCase() ||
        (currentPhone && currentPhone === rawParam.replace(/\D/g, ""));

      if (!session || !isCurrent) {
        void handleLogin(rawParam, search.key || "");
      }
    }
  }, [search.email, search.phone, search.identifier, search.key]);

  const getOrCreateDeviceId = (): string => {
    if (typeof window === "undefined") return "dev_ssr";
    const key = "aif_device_fingerprint";
    try {
      let stored = localStorage.getItem(key);
      if (!stored) {
        const rand = Math.random().toString(36).slice(2, 10);
        stored = `dev_${window.innerWidth}x${window.innerHeight}_${rand}`;
        localStorage.setItem(key, stored);
      }
      return stored;
    } catch {
      return "dev_fallback";
    }
  };

  const handleLogin = async (rawUserInput: string, key: string) => {
    if (!rawUserInput.trim()) {
      setAuthError("Please enter your registered email address or WhatsApp mobile number.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const devId = getOrCreateDeviceId();
      const res = await verifyCourseAccess({
        data: {
          email: rawUserInput.trim(),
          accessKey: key.trim(),
          deviceId: devId,
        },
      });

      if (res && res.authorized) {
        setSession(res);
        try {
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(res));
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || "An error occurred while verifying access. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {
      // ignore
    }
    setSession(null);
    void navigate({ to: "/portal" });
  };

  const toggleLessonCompletion = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const updated = prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      try {
        localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Find next lesson
  const currentLessonIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
    ? allLessons[currentLessonIndex + 1]
    : null;

  const progressPercentage = Math.round(
    (completedLessons.length / Math.max(TOTAL_LESSONS_COUNT, 1)) * 100
  );

  /* ---------------------------------------------------- */
  /* SCREEN 1: LOGIN GATE (If not authenticated)          */
  /* ---------------------------------------------------- */
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#090a0c] px-4 py-12 text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121316] p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-widest text-primary">
              STUDENT MEMBER ACCESS
            </span>
            <h1 className="mt-4 font-display text-[26px] font-extrabold text-white">
              AI INFLUENCER <span className="text-gold-grad">MASTERY</span>
            </h1>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Enter your registered email address or WhatsApp mobile number to access your curriculum and bonus vault.
            </p>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleLogin(emailInput, keyInput);
            }}
          >
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                Registered Email or WhatsApp Number
              </label>
              <input
                type="text"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com or 10-digit mobile number"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[14px] text-white placeholder-muted-foreground/60 outline-none transition-colors focus:border-primary focus:bg-black/60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                  Personal Access Key <span className="text-[11px] font-normal lowercase text-muted-foreground/70">(from your welcome email)</span>
                </label>
              </div>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="e.g. 8f2a7b8e3c1d4a5b"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[14px] font-mono text-white placeholder-muted-foreground/60 outline-none transition-colors focus:border-primary focus:bg-black/60"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                💡 Clicking the direct 1-click link from your enrollment email fills this automatically.
              </p>
            </div>

            {authError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center text-[13px] font-medium text-destructive">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || !emailInput}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-display text-[15px] font-extrabold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Unlocking Portal…
                </>
              ) : (
                "Access Course Portal →"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/5 pt-4 text-center">
            <p className="text-[11px] text-muted-foreground">
              🔒 <strong className="text-white/80">Security Notice:</strong> Your course access is locked to up to 2 of your personal devices (e.g. laptop & mobile) to prevent link forwarding.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------- */
  /* SCREEN 2: AUTHENTICATED LMS MEMBER AREA             */
  /* ---------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#090a0c] text-foreground">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#0c0d10]/95 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-[16px] font-extrabold tracking-tight text-white sm:text-[18px]">
              AI INFLUENCER <span className="text-gold-grad">MASTERY</span>
            </span>
          </Link>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/70 sm:inline-block">
            Student Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Indicator */}
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Progress</p>
              <p className="text-[12px] font-extrabold text-white">
                {completedLessons.length} of {TOTAL_LESSONS_COUNT} ({progressPercentage}%)
              </p>
            </div>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Student Email, Device Status & Logout */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="hidden text-right md:block">
              <p className="text-[12px] font-semibold text-white truncate max-w-[200px]">{session.email}</p>
              {session.accessType === "admin" ? (
                <p className="text-[10px] text-amber-400 font-mono font-bold flex items-center justify-end gap-1">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>⭐ Master Admin Access</span>
                </p>
              ) : (
                <p className="text-[10px] text-emerald-400 font-mono flex items-center justify-end gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Device {session.deviceNumber || 1}/2 Active</span>
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN COURSE LAYOUT */}
      <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT 8 COLS: VIDEO PLAYER & BONUS DOWNLOADS */}
          <section className="lg:col-span-8 space-y-6">
            {/* The Video Player */}
            <BunnyVideoPlayer
              lesson={activeLesson}
              studentEmail={session.email}
              studentPhone={session.phone}
              defaultLibraryId="765522"
            />

            {/* Lesson Title & Controls Bar */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#121316] p-5 sm:flex-row sm:items-center">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                  Currently Watching
                </span>
                <h2 className="mt-1 font-display text-[20px] font-extrabold text-white sm:text-[24px]">
                  {activeLesson.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Complete Toggle */}
                <button
                  onClick={() => toggleLessonCompletion(activeLesson.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all ${
                    completedLessons.includes(activeLesson.id)
                      ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border border-white/15 bg-white/5 text-white/80 hover:border-primary hover:text-primary"
                  }`}
                >
                  <span className="text-[15px]">
                    {completedLessons.includes(activeLesson.id) ? "✓" : "○"}
                  </span>
                  <span>
                    {completedLessons.includes(activeLesson.id) ? "Completed" : "Mark as Completed"}
                  </span>
                </button>

                {/* Next Lesson Button */}
                {nextLesson && (
                  <button
                    onClick={() => {
                      setActiveLesson(nextLesson);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-extrabold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Next Video</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            </div>

            {/* ================================================================= */}
            {/* 🎁 CLEAN BONUS DOWNLOADS VAULT (No clutter, direct download cards) */}
            {/* ================================================================= */}
            <div className="mt-10 rounded-3xl border border-white/10 bg-[#121316] p-6 sm:p-8">
              <div className="border-b border-white/10 pb-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold tracking-wider text-primary">
                  🎁 INCLUDED COURSE BONUSES
                </div>
                <h3 className="mt-3 font-display text-[22px] font-extrabold text-white">
                  Bonus Resources & Download Vault
                </h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Direct downloadable PDF files included with your course access. Click below to download directly to your device.
                </p>
              </div>

              {/* 3 Downloadable Cards */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {OFFICIAL_COURSE_BONUSES.map((bonus) => (
                  <div
                    key={bonus.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 transition-all hover:border-primary/40 hover:bg-black/60"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {bonus.badge}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {bonus.fileSize}
                        </span>
                      </div>

                      <h4 className="mt-3 font-display text-[15px] font-bold text-white leading-snug">
                        {bonus.title}
                      </h4>

                      <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">
                        {bonus.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5">
                      <a
                        href={bonus.downloadUrl}
                        download={bonus.filename}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-center text-[12px] font-bold text-white transition-all hover:bg-primary hover:text-primary-foreground"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span>Download PDF</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT 4 COLS: COURSE LESSON PLAYLIST */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-white/10 bg-[#121316] p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-[16px] font-extrabold text-white">
                    Course Lessons
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    10 Recorded Videos
                  </p>
                </div>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {completedLessons.length} / {TOTAL_LESSONS_COUNT}
                </span>
              </div>

              {/* Lesson List */}
              <div className="mt-4 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {allLessons.map((lesson, idx) => {
                  const isActive = activeLesson.id === lesson.id;
                  const isDone = completedLessons.includes(lesson.id);
                  const numStr = String(idx + 1).padStart(2, "0");

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(lesson);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`group flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 shadow-md shadow-primary/5"
                          : "border-white/5 bg-black/30 hover:border-white/15 hover:bg-black/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-8 items-center justify-center rounded-lg font-mono text-[12px] font-bold transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : isDone
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/5 text-muted-foreground group-hover:text-white"
                          }`}
                        >
                          {isDone ? "✓" : numStr}
                        </span>

                        <div>
                          <p
                            className={`font-display text-[14px] font-bold transition-colors ${
                              isActive ? "text-primary" : "text-white group-hover:text-primary"
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {isActive ? "Now Playing" : "Ready to Stream"}
                          </p>
                        </div>
                      </div>

                      {/* Complete Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLessonCompletion(lesson.id);
                        }}
                        title={isDone ? "Mark as Incomplete" : "Mark as Completed"}
                        className={`size-6 rounded-md border flex items-center justify-center text-[12px] transition-colors ${
                          isDone
                            ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                            : "border-white/20 bg-black/40 text-transparent hover:border-primary hover:text-white/40"
                        }`}
                      >
                        ✓
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
