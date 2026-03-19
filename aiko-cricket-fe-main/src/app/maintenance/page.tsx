import type { Metadata } from "next";
import Maintenance from "@/components/layout/maintenance";

export const metadata: Metadata = {
  title: "Under Maintenance | Aiko Cricket",
  description: "Aiko Cricket is currently under maintenance. We will be back shortly.",
};

export default function MaintenancePage() {
  return <Maintenance />;
}