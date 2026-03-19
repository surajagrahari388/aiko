"use client";

import { useRouter } from "next/navigation";
import ServiceDown from "@/components/layout/service-down";

export default function ServiceDownClient() {
  const router = useRouter();

  const handleRefresh = () => {
    router.replace("/cricket");
  };

  return <ServiceDown onRefresh={handleRefresh} />;
}
