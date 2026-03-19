import type { SingleMatchResponse } from "@/lib/types";
import type React from "react";

interface MatchHeaderProps {
  matchData: SingleMatchResponse;
}

const MatchHeader: React.FC<MatchHeaderProps> = () => {
  return (
    <div className="w-full relative">
      <div className="absolute top-0 left-0 w-full h-3 sm:h-4 bg-gradient-to-b from-background/50 to-transparent z-0"></div>

      <div className="relative container mx-auto px-3 sm:px-4 md:px-2 lg:px-6 py-1 sm:py-2"></div>
    </div>
  );
};

export default MatchHeader;
