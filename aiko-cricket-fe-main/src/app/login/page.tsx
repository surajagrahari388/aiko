import type { Metadata } from "next";
import LoginComponent from "@/components/layout/login";

export const metadata: Metadata = {
  title: "Sign In | Aiko Cricket",
  description: "Sign in to Aiko Cricket for AI-powered cricket insights and real-time tips.",
};

export default function LoginPage() {
  return <LoginComponent />;
}
