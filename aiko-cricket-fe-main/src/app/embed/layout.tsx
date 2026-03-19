import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Pulse | Aiko Cricket",
  description: "Real-time AI-powered match insights",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-transparent">{children}</div>;
}
