import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";

const GoBack = () => {
  const router = useRouter();
  const pathname = usePathname();

  if (
    pathname === "/cricket" ||
    pathname === "/login" ||
    pathname === "/maintenance"
  ) {
    return null;
  }

  // For settings page, go back to the last page
  if (pathname === "/settings") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-accent"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    );
  }

  // For competition pages, go back to the last page
  if (pathname.startsWith("/cricket/competition")) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-accent"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="hover:bg-accent"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
};

export default GoBack;
