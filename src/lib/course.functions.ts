import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";

const coerceParam = z
  .unknown()
  .transform((val) => (val !== undefined && val !== null ? String(val).trim() : ""))
  .optional();

const verifyAccessInput = z.object({
  email: z
    .unknown()
    .transform((val) => (val !== undefined && val !== null ? String(val).trim() : "")),
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

// Deterministic cryptographic signature matching n8n code node
export function computeStudentAccessKey(identifier: string): string {
  const clean = identifier.trim().toLowerCase();
  return crypto.createHmac("sha256", SECRET_KEY).update(clean).digest("hex").slice(0, 16);
}

// Generate simple tamper-resistant session token
function generateStudentToken(identifier: string, role: string): string {
  const secret = process.env["RAZORPAY_KEY_SECRET"] || "aif-mastery-secret-salt-2026";
  const raw = `${identifier}:${role}:${new Date().toISOString().slice(0, 10)}:${secret}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `std_${Math.abs(hash).toString(36)}_${Buffer.from(identifier).toString("base64url").slice(0, 16)}`;
}

export const verifyCourseAccess = createServerFn({ method: "POST" })
  .inputValidator((data) => verifyAccessInput.parse(data))
  .handler(async ({ data }): Promise<StudentSession> => {
    const rawInput = (data.email || "").trim();
    const accessKey = (data.accessKey || "").trim();
    const deviceId = (data.deviceId || "").trim();

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
      accessKey.toLowerCase() === computeStudentAccessKey(identifier).toLowerCase();

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

    // Whitelist for verified course buyers (instant lifetime access)
    const manualEnrolledEmails = [
      "mshivam79@gmail.com",
      "gchhangani69@gmail.com",
      "go.abhi25@gmail.com",
    ];
    const manualEnrolledPhones = ["8448824505", "8696242991", "9686607788", "9288202588"];
    const isManualStudent =
      (cleanEmail && manualEnrolledEmails.includes(cleanEmail)) ||
      (cleanPhone && manualEnrolledPhones.includes(cleanPhone));

    const isSignedKeyValid = Boolean(
      accessKey &&
      accessKey.toLowerCase() === computeStudentAccessKey(identifier).toLowerCase()
    );
    const isMasterPass =
      accessKey.toUpperCase() === "MASTERY2026" ||
      accessKey.toUpperCase() === "AIINFLUENCER100";

    let enrollmentVerified = false;
    let deviceNumber = 1;

    // Device check for regular students (Manual VIP students like Shivam bypass device lock)
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
          if (devData && devData.allowed === false) {
            if (!isManualStudent) {
              throw new Error(
                devData.message ||
                  "Access Denied: Course purchase not found or device limit exceeded. Contact workshop@prateekmayani.com"
              );
            }
          }
          if (devData && devData.allowed === true) {
            enrollmentVerified = true;
            deviceNumber = devData?.deviceNumber || 1;
          }
        }
      } catch (devErr: any) {
        if (
          !isManualStudent &&
          (devErr?.message?.includes("Access Denied") ||
            devErr?.message?.includes("Device Limit Exceeded"))
        ) {
          throw devErr;
        }
        console.warn("Device lock notice:", devErr?.message);
      }
    }

    // If neither n8n enrollment, nor signed key, nor master pass, nor manual student -> STRICTLY BLOCK!
    if (!enrollmentVerified && !isSignedKeyValid && !isMasterPass && !isManualStudent) {
      throw new Error(
        `Access Denied: Course purchase not found for ${cleanPhone ? `mobile number +91 ${cleanPhone}` : cleanEmail}. This course is strictly locked to verified students who completed enrollment. If you recently paid, please ensure you use the same mobile number, or contact workshop@prateekmayani.com.`
      );
    }

    const displayName =
      cleanEmail === "mshivam79@gmail.com" || cleanPhone === "8448824505"
        ? "SHIVAM MALHOTRA"
        : cleanEmail
          ? cleanEmail.split("@")[0].toUpperCase()
          : `STUDENT (+91 ${cleanPhone})`;

    return {
      email: cleanEmail || "mshivam79@gmail.com",
      phone: cleanPhone ? `+91 ${cleanPhone}` : "+91 8448824505",
      name: displayName,
      authorized: true,
      enrolledAt: new Date().toISOString(),
      accessType: "full_course",
      token: generateStudentToken(identifier, "full_course"),
      deviceId,
      deviceNumber,
    };
  });
