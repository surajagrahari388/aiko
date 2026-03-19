import React from "react";
import { MatchCardSkeleton } from "@/components/match-card/match-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchesContainerSkeletonProps {
  /**
   * Total number of skeleton cards to show (distributed across groups)
   * @default 9
   */
  cardCount?: number;
  /**
   * Number of competition groups to show
   * @default 3
   */
  groupCount?: number;
}

const MatchFilterSkeleton: React.FC = () => {
  return (
    <div className="bg-background backdrop-blur-md py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {/* Filter buttons skeleton - matching the actual filter design */}
        <Skeleton className="h-8 w-12 rounded-full shrink-0" />
        <Skeleton className="h-8 w-16 rounded-full shrink-0" />
        <Skeleton className="h-8 w-16 rounded-full shrink-0" />
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
      </div>
    </div>
  );
};

const MatchesContainerSkeleton: React.FC<MatchesContainerSkeletonProps> =
  React.memo(({ cardCount = 9, groupCount = 3 }) => {
    const perGroup = Math.max(1, Math.ceil(cardCount / groupCount));

    return (
      <div
        className="min-h-screen bg-linear-to-r from-background via-background to-background/90 relative overflow-hidden"
        id="matches-container"
        role="status"
        aria-label="Loading matches"
      >
        <div className="relative z-10 container mx-auto py-2">
          {/* Match Status Filter Skeleton */}
          <MatchFilterSkeleton />

          {/* Display matches grouped by competition */}
          <div className="space-y-4">
            {Array.from({ length: groupCount }).map((_, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {/* Competition Title Skeleton */}
                <div className="rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-6 sm:h-7 w-48 sm:w-64" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="w-8 h-8 rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Match Cards Grid - matching the responsive grid from actual component */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: perGroup }).map((_, idx) => (
                    <MatchCardSkeleton
                      key={`${gIdx}-${idx}`}
                      showStatusBadge={idx === 0 && gIdx === 0}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  });

MatchesContainerSkeleton.displayName = "MatchesContainerSkeleton";

export default MatchesContainerSkeleton;
