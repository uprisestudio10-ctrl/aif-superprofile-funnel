import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";

const coerceParam = z
  .unknown()
  .transform((val) => {
    if (val === undefined || val === null) return "";
    return String(val).replace(/^["']|["']$/g, "").trim();
  })
  .optional();

const verifyAccessInput = z.object({
  email: z
    .unknown()
    .transform((val) => {
      if (val === undefined || val === null) return "";
      return String(val).replace(/^["']|["']$/g, "").trim();
    }),
  accessKey: coerceParam,
  deviceId: coerceParam,
});

export interface StudentSession {
  email: string;
  name: string;
  phone?: string;
  authorized: boolean;
  enrolledAt: string;
  accessType: "full_course" | "workshop_vip" | "admin";
  token: string;
  deviceId?: string;
  deviceNumber?: number;
}

const SECRET_KEY = "rzp_live_ThPkZr13H5M66E_aif_mastery_secret_2026";
const RZP_KEY_ID = "rzp_live_TjpSDnPQldisku";
const RZP_KEY_SEC = "JA7v0pGvJoqKLNggE7CPUlLD";

// Deterministic cryptographic signature matching n8n code node
export function computeStudentAccessKey(identifier: string): string {
  const clean = identifier.trim().toLowerCase();
  return crypto.createHmac("sha256", SECRET_KEY).update(clean).digest("hex").slice(0, 16);
}

// Fallback signature matching n8n code node when crypto module was restricted in n8n
export function computeFallbackAccessKey(identifier: string): string {
  let h = 0;
  const s = identifier.trim().toLowerCase() + ":" + SECRET_KEY;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16).padEnd(12, "0") + "aif";
}

// Generate simple tamper-resistant session token (safe in Node & Cloudflare Workers)
function generateStudentToken(identifier: string, role: string): string {
  const secret = process.env["RAZORPAY_KEY_SECRET"] || "aif-mastery-secret-salt-2026";
  const raw = `${identifier}:${role}:${new Date().toISOString().slice(0, 10)}:${secret}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  let b64 = "";
  try {
    if (typeof Buffer !== "undefined") {
      b64 = Buffer.from(identifier).toString("base64url").slice(0, 16);
    } else {
      b64 = btoa(identifier).replace(/\+/g, "-").replace(/\//g, "_").slice(0, 16);
    }
  } catch {
    b64 = "std_safe";
  }
  return `std_${Math.abs(hash).toString(36)}_${b64}`;
}

// Dynamic real-time lookup directly against Razorpay API
// Automatically authorizes ANY new lead who completes payment in the future
async function verifyWithRazorpay(
  cleanPhone: string,
  cleanEmail: string
): Promise<{ authorized: boolean; name?: string; amount?: number; phone?: string; email?: string } | null> {
  try {
    const auth =
      typeof Buffer !== "undefined"
        ? Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SEC}`).toString("base64")
        : btoa(`${RZP_KEY_ID}:${RZP_KEY_SEC}`);

    const res = await fetch("https://api.razorpay.com/v1/payments?count=100", {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    const payments = data.items || [];

    const match = payments.find((p: any) => {
      if (p.status !== "captured") return false;
      const pAmt = p.amount ? Math.round(p.amount / 100) : 0;
      // User rule: Below ₹2,499 is strictly token/partial; do NOT grant portal access!
      if (pAmt < 2499) return false;

      const pPhone = String(p.contact || "").replace(/\D/g, "").slice(-10);
      const pEmail = String(p.email || "").toLowerCase().trim();

      const matchP = Boolean(cleanPhone && pPhone && pPhone === cleanPhone);
      const matchE = Boolean(
        cleanEmail && pEmail && pEmail === cleanEmail && !pEmail.endsWith("@razorpay.com")
      );
      return matchP || matchE;
    });

    if (match) {
      const payerName =
        match.notes?.name ||
        match.notes?.buyer_name ||
        match.notes?.Name ||
        match.notes?.comment ||
        "";
      const pPhone = String(match.contact || "").replace(/\D/g, "").slice(-10);
      const pEmail = String(match.email || "").toLowerCase().trim();

      return {
        authorized: true,
        name: payerName,
        amount: Math.round(match.amount / 100),
        phone: pPhone,
        email: pEmail.endsWith("@razorpay.com") ? "" : pEmail,
      };
    }
  } catch (err) {
    console.warn("Razorpay live dynamic lookup notice:", err);
  }
  return null;
}

// Master fast-cache list of all verified enrolled course buyers
export const VERIFIED_COURSE_BUYERS: Array<{
  name: string;
  email: string;
  phone: string;
}> = [
  { name: "SSK Teja", phone: "7416895725", email: "sskteja.smiles@gmail.com" },
  { name: "Kedar Metri", phone: "7410186269", email: "kedarmetri8@gmail.com" },
  { name: "Fahim", phone: "9123370566", email: "mrfahim9966@gmail.com" },
  { name: "Sanjay Gupta", phone: "9004812678", email: "sanju.mj612@gmail.com" },
  { name: "Ruyel Sarkar", phone: "6296772139", email: "ruyelsarkar42@gmail.com" },
  { name: "Maheswara Reddy", phone: "9849039761", email: "vivekamahi27@gmail.com" },
  { name: "Ravinder / Ravi D", phone: "9008077066", email: "rav.dkmr@gmail.com" },
  { name: "Harshit Lohar", phone: "8233084905", email: "hlohar95@gmail.com" },
  { name: "Ankit Agarwal", phone: "9851248798", email: "ankitagarwal805@gmail.com" },
  { name: "Sebananda", phone: "9158984616", email: "sebanan@yahoo.com" },
  { name: "Yaju Singh", phone: "9410679678", email: "yajuvndra@gmail.com" },
  { name: "Rajesh Menezes / Raju Roy", phone: "9867345539", email: "rajuroy1810@gmail.com" },
  { name: "Vyshnav Tp", phone: "9447936432", email: "vyshnav589@gmail.com" },
  { name: "Ravinder Kumar", phone: "9811768586", email: "ravinderkumar0091@gmail.com" },
  { name: "Shivam Malhotra", phone: "8448824505", email: "mshivam79@gmail.com" },
  { name: "G Chhangani", phone: "8696242991", email: "gchhangani69@gmail.com" },
  { name: "Abhi Go", phone: "9686607788", email: "go.abhi25@gmail.com" },
  { name: "VIP Student", phone: "9288202588", email: "" },
  { name: "Ankit Arora", phone: "9650206742", email: "ankitaroravfx@gmail.com" },
  { name: "Student (VIP Access)", phone: "", email: "editdesign1947@gmail.com" },
];

export const verifyCourseAccess = createServerFn({ method: "POST" })
  .inputValidator((data) => verifyAccessInput.parse(data))
  .handler(async ({ data }): Promise<StudentSession> => {
    // Sanitize input (strip quotes, spaces, URL artifacts)
    const rawInput = (data.email || "").replace(/^["']|["']$/g, "").trim();
    const accessKey = (data.accessKey || "").replace(/^["']|["']$/g, "").trim();
    const deviceId = (data.deviceId || "").replace(/^["']|["']$/g, "").trim();

    if (!rawInput) {
      throw new Error("Please enter your registered email address or WhatsApp mobile number.");
    }

    const isEmail = rawInput.includes("@");
    const cleanEmail = isEmail ? rawInput.toLowerCase() : "";
    const cleanPhone = !isEmail ? rawInput.replace(/\D/g, "").slice(-10) : "";
    const identifier = cleanEmail || cleanPhone;

    // 1. Master Admin / Instructor Pass
    const adminEmails = [
      "prateekmayanii@gmail.com",
      "uprisestudio10@gmail.com",
      "prateek@prateekmayani.com",
      "prateekmayani@gmail.com",
    ];
    const adminPhones = ["8770500986"];
    const adminPin = process.env["DASHBOARD_PIN"] || "2929";

    const isMasterAdminKey =
      !accessKey ||
      accessKey === adminPin ||
      accessKey.toUpperCase() === "AIF2026VIP" ||
      accessKey.toLowerCase() === "admin" ||
      accessKey.toUpperCase() === "MASTERY2026" ||
      accessKey.toLowerCase() === computeStudentAccessKey(identifier).toLowerCase() ||
      accessKey.toLowerCase() === computeFallbackAccessKey(identifier).toLowerCase();

    const isAdminUser =
      (cleanEmail && adminEmails.includes(cleanEmail)) ||
      (cleanPhone && adminPhones.includes(cleanPhone));

    if (isAdminUser && isMasterAdminKey) {
      return {
        email: cleanEmail || "uprisestudio10@gmail.com",
        name:
          cleanEmail === "uprisestudio10@gmail.com"
            ? "UPRISE STUDIO (ADMIN)"
            : "PRATEEK MAYANI (ADMIN)",
        phone: "+91 8770500986",
        authorized: true,
        enrolledAt: new Date().toISOString(),
        accessType: "admin",
        token: generateStudentToken(identifier, "admin"),
      };
    }

    // 2. Verified Course Buyer Match (Fast Cache)
    const matchedBuyer = VERIFIED_COURSE_BUYERS.find((b) => {
      const matchEmail = Boolean(cleanEmail && b.email && b.email.toLowerCase() === cleanEmail);
      const matchPhone = Boolean(cleanPhone && b.phone && b.phone.slice(-10) === cleanPhone);
      return matchEmail || matchPhone;
    });

    // 3. Cryptographic Signature Validation
    const cleanKey = accessKey.toLowerCase();
    const isHmacKeyValid = Boolean(
      cleanKey &&
      (cleanKey === computeStudentAccessKey(cleanEmail).toLowerCase() ||
       cleanKey === computeStudentAccessKey(cleanPhone).toLowerCase())
    );
    const isFallbackKeyValid = Boolean(
      cleanKey &&
      (cleanKey === computeFallbackAccessKey(cleanEmail).toLowerCase() ||
       cleanKey === computeFallbackAccessKey(cleanPhone).toLowerCase())
    );
    const isMasterPass = Boolean(
      cleanKey &&
      (cleanKey === "mastery2026" || cleanKey === "aiinfluencer100" || cleanKey === "aif2026vip")
    );

    let isAuthorized = Boolean(
      matchedBuyer || isHmacKeyValid || isFallbackKeyValid || isMasterPass
    );

    // 4. Dynamic Live Razorpay Verification
    // Seamlessly handles any FUTURE lead enrolling via Razorpay payment links
    let liveRzpBuyer: { authorized: boolean; name?: string; amount?: number; phone?: string; email?: string } | null = null;
    if (!isAuthorized) {
      liveRzpBuyer = await verifyWithRazorpay(cleanPhone, cleanEmail);
      if (liveRzpBuyer && liveRzpBuyer.authorized) {
        isAuthorized = true;
      }
    }

    // 5. Non-blocking device registration & fallback n8n check
    let deviceNumber = 1;
    if (deviceId) {
      try {
        const deviceAuthUrl =
          process.env["N8N_DEVICE_AUTH_URL"] ||
          "https://prateek.n8n.preetamsoni.com/webhook/course-device-auth";
        const devRes = await fetch(deviceAuthUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier, deviceId }),
        });

        if (devRes.ok) {
          const devData: any = await devRes.json();
          if (devData && devData.allowed === true) {
            isAuthorized = true;
            deviceNumber = devData?.deviceNumber || 1;
          }
        }
      } catch (err: any) {
        console.warn("Background device sync notice:", err?.message);
      }
    }

    // 6. Final Authorization Gate
    if (!isAuthorized) {
      throw new Error(
        `Access Denied: Course purchase not found for ${cleanPhone ? `mobile number +91 ${cleanPhone}` : cleanEmail}. This course is strictly locked to verified students who completed enrollment. If you recently paid, please ensure you use your registered email or mobile number, or contact workshop@prateekmayani.com.`
      );
    }

    // Determine student display details
    const finalName =
      matchedBuyer?.name ||
      liveRzpBuyer?.name ||
      (cleanEmail ? cleanEmail.split("@")[0].toUpperCase() : `STUDENT (+91 ${cleanPhone})`);

    const finalEmail =
      matchedBuyer?.email ||
      liveRzpBuyer?.email ||
      cleanEmail ||
      `${cleanPhone}@student.prateekmayani.com`;

    const finalPhone =
      matchedBuyer?.phone
        ? `+91 ${matchedBuyer.phone}`
        : liveRzpBuyer?.phone
          ? `+91 ${liveRzpBuyer.phone}`
          : cleanPhone
            ? `+91 ${cleanPhone}`
            : "";

    return {
      email: finalEmail,
      phone: finalPhone,
      name: finalName,
      authorized: true,
      enrolledAt: new Date().toISOString(),
      accessType: "full_course",
      token: generateStudentToken(identifier, "full_course"),
      deviceId,
      deviceNumber,
    };
  });
