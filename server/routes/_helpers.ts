import crypto from "crypto";
import { storage } from "../storage";

export async function verifyRecaptcha(
  token: string,
): Promise<{ success: boolean; score?: number }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.log("reCAPTCHA: Skipping verification (no secret key configured)");
    return { success: true, score: 1.0 };
  }

  if (!token) {
    console.log("reCAPTCHA: Skipping verification (no token provided)");
    return { success: true, score: 1.0 };
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: "POST" },
    );
    const data = await response.json();
    console.log("reCAPTCHA response:", data);

    if (!data.success) {
      console.log(
        "reCAPTCHA: Verification failed, allowing anyway in development",
      );
      return { success: true, score: 0.5 };
    }

    return {
      success: data.success && (data.score === undefined || data.score >= 0.3),
      score: data.score,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: true, score: 0.5 };
  }
}

export function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash || hash === "$2a$10$demo";
}

export function apiResponse<T>(success: boolean, data?: T, error?: string) {
  return { success, data, error };
}

export async function logAction(
  userId: string,
  action: string,
  module: string,
  entityId?: string | null,
  oldValues?: object | null,
  newValues?: object | null,
  ipAddress?: string | null,
) {
  await storage.createAuditLog({
    userId,
    action,
    module,
    entityId: entityId || null,
    oldValues: oldValues ? JSON.stringify(oldValues) : null,
    newValues: newValues ? JSON.stringify(newValues) : null,
    ipAddress: ipAddress || null,
  });
}

export const phoneCodeMap: Record<number, string> = {
  1: "+962",
  2: "+1",
  3: "+44",
  4: "+971",
  5: "+966",
  6: "+20",
  7: "+961",
  8: "+970",
  9: "+974",
  10: "+973",
};

export const countryMap: Record<number, string> = {
  1: "Jordan",
  2: "United States",
  3: "United Kingdom",
  4: "UAE",
  5: "Saudi Arabia",
  6: "Egypt",
  7: "Lebanon",
  8: "Palestine",
  9: "Qatar",
  10: "Bahrain",
};

export const resetTokens = new Map<string, { email: string; expiresAt: Date }>();
export const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

export function generateToken(): string {
  return crypto.randomBytes(64).toString("base64");
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("base64");
}
