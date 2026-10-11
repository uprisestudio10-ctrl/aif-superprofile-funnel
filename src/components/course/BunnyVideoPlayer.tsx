import { useState, useRef, useEffect, useCallback } from "react";
import { CourseWatermark } from "./CourseWatermark";
import type { CourseLesson } from "@/data/course-curriculum";

interface BunnyVideoPlayerProps {
  lesson: CourseLesson;
  studentEmail: string;
  studentPhone?: string;
  defaultLibraryId?: string;
  onLessonEnded?: () => void;
}

export function BunnyVideoPlayer({
  lesson,
  studentEmail,
  studentPhone,
  defaultLibraryId = "765522",
}: BunnyVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const libraryId = lesson.bunnyLibraryId || defaultLibraryId;
  const hasBunnyVideo = Boolean(lesson.bunnyVideoId && lesson.bunnyVideoId.trim().length > 3);
  const hasCustomUrl = Boolean(lesson.videoUrl && lesson.videoUrl.trim().length > 5);

  const embedUrl = hasBunnyVideo
    ? `https://iframe.mediadelivery.net/embed/${libraryId}/${lesson.bunnyVideoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`
    : lesson.videoUrl;

  // Toggle container-level fullscreen so watermark remains persistent
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  }, []);

  // Listen to fullscreen changes across browser standards
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement = document.fullscreenElement || (document as any).webkitFullscreenElement;
      
      // If the iframe itself entered fullscreen directly, redirect fullscreen to the parent container
      if (fsElement && fsElement === iframeRef.current && containerRef.current) {
        try {
          if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
              containerRef.current?.requestFullscreen?.();
            }).catch(() => {});
          }
        } catch {
          // ignore
        }
        return;
      }

      setIsFullscreen(Boolean(fsElement && fsElement === containerRef.current));
    };

    // Hotkey 'f' / 'F' to toggle fullscreen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "f" || e.key === "F") &&
        !["INPUT", "TEXTAREA"].includes((document.activeElement?.tagName || "").toUpperCase())
      ) {
        e.preventDefault();
        void toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`group relative w-full overflow-hidden bg-black transition-all ${
        isFullscreen
          ? "fixed inset-0 z-[99999] flex h-screen w-screen flex-col items-center justify-center rounded-none"
          : "rounded-2xl border border-white/10 shadow-2xl"
      }`}
    >
      {/* 16:9 Aspect Ratio / Fullscreen Sizing */}
      <div
        className={`relative w-full ${
          isFullscreen
            ? "flex h-full w-full max-h-screen items-center justify-center"
            : "aspect-video"
        }`}
      >
        {/* Dynamic Anti-Piracy Watermark: ALWAYS persistent inside the container */}
        <CourseWatermark
          email={studentEmail}
          phone={studentPhone}
          isFullscreen={isFullscreen}
        />

        {/* Video Player Header Controls Overlay (Appears on hover or in fullscreen) */}
        <div className="pointer-events-auto absolute top-3 right-3 z-[60] flex items-center gap-2">
          {/* Dedicated Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            type="button"
            title={isFullscreen ? "Exit Full Screen (Esc)" : "Full Screen (F)"}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/70 px-3 py-1.5 text-[12px] font-bold text-white shadow-xl backdrop-blur-md transition-all hover:border-primary hover:bg-black/90 hover:text-primary active:scale-95"
          >
            {isFullscreen ? (
              <>
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
                    d="M9 9L4 4m0 0v5m0-5h5m6 6l5-5m0 0v5m0-5h-5m-6 6l-5 5m0 0v-5m0 5h5m6-6l5 5m0 0v-5m0 5h-5"
                  />
                </svg>
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
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
                    d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                <span className="hidden sm:inline">Full Screen</span>
                <kbd className="hidden rounded bg-white/20 px-1 py-0.2 text-[9px] font-mono sm:inline">
                  F
                </kbd>
              </>
            )}
          </button>
        </div>

        {hasBunnyVideo || hasCustomUrl ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={lesson.title}
            className={`border-0 ${
              isFullscreen
                ? "h-full w-full max-h-screen object-contain"
                : "h-full w-full"
            }`}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#121316] via-[#0c0d0e] to-black px-6 text-center">
            <div className="relative mb-5 flex size-20 items-center justify-center rounded-full border border-primary/40 bg-gradient-to-tr from-primary/20 to-primary/40 text-primary shadow-[0_0_30px_rgba(223,168,74,0.3)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-1 size-9"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h3 className="font-display text-[20px] font-bold text-white">
              {lesson.title}
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Encrypted Stream • Instructor: Prateek Mayani
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
