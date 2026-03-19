"use client";

import Navbar from "@/components/navbar/navbar";
import { useMatches } from "@/hooks/use-matches";
import { useMemo } from "react";

interface NavbarWithDataProps {
  showAllLanguages?: boolean;
  AUTH_AUTH0_ID: string;
  AUTH0_ISSUER: string;
  matchTitle?: string;
}

export default function NavbarWithData(props: NavbarWithDataProps) {
  const { data } = useMatches();

  const liveMatchesCount = useMemo(() => {
    if (!data?.matches) return 0;
    return data.matches.filter(
      (match) => match.status_str?.toLowerCase() === "live"
    ).length;
  }, [data]);

  return <Navbar {...props} liveMatchesCount={liveMatchesCount} />;
}
