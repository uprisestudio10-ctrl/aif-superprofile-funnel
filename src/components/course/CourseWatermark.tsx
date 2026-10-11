import { useEffect, useState } from "react";

interface CourseWatermarkProps {
  email: string;
  phone?: string;
  isFullscreen?: boolean;
}

export function CourseWatermark({ email, phone }: CourseWatermarkProps) {
  // Preset discreet corner/edge positions so it never blocks the center of the video
  const cornerPositions = [
    { top: "12%", left: "8%" },
    { top: "12%", left: "68%" },
    { top: "78%", left: "10%" },
    { top: "78%", left: "65%" },
    { top: "20%", left: "45%" },
  ];

  const [posIndex, setPosIndex] = useState(0);

  useEffect(() => {
    // Reposition gently every 16 seconds between unobtrusive positions
    const interval = setInterval(() => {
      setPosIndex((prev) => (prev + 1) % cornerPositions.length);
    }, 16000);
    return () => clearInterval(interval);
  }, []);

  const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
  const identifier = cleanPhone ? `${email} • +91 ${cleanPhone}` : email;
  const currentPos = cornerPositions[posIndex];

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden select-none">
      {/* Sleek, unobtrusive, translucent anti-piracy tag */}
      <div
        className="pointer-events-none absolute transition-all duration-1000 ease-in-out"
        style={{ top: currentPos.top, left: currentPos.left }}
      >
        <div className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 shadow-sm backdrop-blur-[2px] transition-opacity">
          <span className="font-mono text-[10px] tracking-wide text-white/40 select-none">
            {identifier}
          </span>
        </div>
      </div>
    </div>
  );
}
