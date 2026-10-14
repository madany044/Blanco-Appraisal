import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const EMPLOYEE_COOKIE = "appraisal_employee";
const MAX_AGE = 60 * 60 * 2;
function secret() {
  const value = process.env.APPRAISAL_EMPLOYEE_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Employee session secret must be configured before enabling corrections.");
  return value;
}
export function createEmployeeSession(code: string, year: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ code, year, expires: now + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}
export function verifyEmployeeSession(token: string, now = Date.now()): { code: string; year: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expected = createHmac("sha256", secret()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof session.code !== "string" || typeof session.year !== "string" || typeof session.expires !== "number" || session.expires <= now) return null;
    return { code: session.code, year: session.year };
  } catch { return null; }
}
export function employeeSession(request: NextRequest) {
  return verifyEmployeeSession(request.cookies.get(EMPLOYEE_COOKIE)?.value ?? "");
}
export const employeeCookieOptions = {
  httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE,
};
