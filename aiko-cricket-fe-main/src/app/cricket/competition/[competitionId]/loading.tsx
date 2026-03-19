import { Skeleton } from "@/components/ui/skeleton";
import MatchesContainerSkeleton from "@/components/match-card/matches-container-skeleton";

export default function CompetitionLoading() {
  return (
    <>
      {/* Navbar skeleton */}
      <nav className="text-foreground shrink-0">
        <div className="container mx-auto md:px-2 sm:px-6 lg:px-6 px-3">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Skeleton className="h-7 w-28 sm:w-36" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </nav>
      {/* Competition matches skeleton */}
      <div className="min-h-screen bg-background container mx-auto md:px-2 sm:px-4 lg:px-6 px-3">
        <MatchesContainerSkeleton cardCount={6} groupCount={2} />
      </div>
    </>
  );
}
