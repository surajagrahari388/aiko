"use server";
// Server-side language utilities
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { LANGUAGE_COOKIE, DEFAULT_LANGUAGE } from "@/lib/language";

// Server-side functions
export async function getLanguage(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(LANGUAGE_COOKIE)?.value || DEFAULT_LANGUAGE;
}

export async function setLanguageCookie(
  language: string
): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set(LANGUAGE_COOKIE, language, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return response;
}

export async function getLanguageFromRequest(
  request: NextRequest
): Promise<string> {
  return request.cookies.get(LANGUAGE_COOKIE)?.value || DEFAULT_LANGUAGE;
}
