import { NavbarMatchSkeleton } from "@/components/navbar/navbar-match-skeleton";
import MatchDetailsSkeleton from "@/components/match-details/match-details-skeleton";

export default function MatchDetailsLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full container mx-auto gap-2">
      <div className="shrink-0 bg-background shadow-[0_2px_12px_-3px_rgba(0,0,0,0.12)] sm:ring-1 sm:ring-border/30 overflow-hidden rounded-b-xl sm:rounded-xl">
        <NavbarMatchSkeleton />
      </div>
      <MatchDetailsSkeleton />
    </div>
  );
}
