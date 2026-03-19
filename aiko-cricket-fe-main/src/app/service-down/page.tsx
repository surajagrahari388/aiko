import type { Metadata } from "next";
import ServiceDownClient from "./client";

export const metadata: Metadata = {
  title: "Service Unavailable | Aiko Cricket",
  description: "Aiko Cricket is temporarily unavailable. Please try again later.",
};

export default function ServiceDownPage() {
  return <ServiceDownClient />;
}
