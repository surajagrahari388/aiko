import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HotInsightsSkeleton } from "@/components/match-details/hot-insights-skeleton";

const TabSkeleton: React.FC = () => {
  return (
    <div className="relative">
      {/* Scroll fade indicators */}
      <div className="absolute left-0 top-0 z-20 h-full w-6 bg-linear-to-r from-background/90 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 z-20 h-full w-6 bg-linear-to-l from-background/90 to-transparent pointer-events-none"></div>

      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b">
        <div className="overflow-x-auto scrollbar-hide scroll-smooth">
          <div className="flex gap-0 bg-transparent rounded-none h-auto p-0 w-max min-w-full">
            {[1, 2, 3, 4, 5].map((tabIndex) => (
              <div
                key={tabIndex}
                className="relative rounded-none border-b-[3px] border-b-transparent pb-2 sm:pb-3 pt-3 sm:pt-2 text-xs sm:text-sm font-semibold transition-all duration-300 text-center whitespace-nowrap shrink-0 w-[35vw] md:w-[24vw] max-w-40 px-2 sm:px-3 flex items-center justify-center"
              >
                <Skeleton className="h-4 w-16 sm:w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TipsContentSkeleton: React.FC = () => {
  return (
    <div className="px-2 sm:px-4 md:px-4 py-4 sm:py-2 m-0">
      <div className="space-y-4">
        {/* Category filters skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide mb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
          ))}
        </div>

        {/* Tips sections skeleton */}
        {[1, 2, 3].map((sectionIndex) => (
          <section key={sectionIndex} className="rounded-xl p-1 pt-0 space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-sm" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-6 rounded-sm" />
            </div>

            {/* Tip card */}
            <div className="relative group">
              <div className="overflow-hidden">
                <div className="bg-muted/30 backdrop-blur-sm rounded-xl px-4 py-3 border transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-2">
                        <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel dots */}
              <div className="flex justify-center items-center gap-1.5 mt-4">
                {[1, 2, 3].map((dotIndex) => (
                  <div
                    key={dotIndex}
                    className={`rounded-full ${
                      dotIndex === 1
                        ? "w-6 h-2 bg-primary/30"
                        : "w-2 h-2 bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

/** Skeleton matching the Design A/B page layout used in match-details-client */
const MatchDetailsSkeleton: React.FC = () => {
  return (
    <div
      className="flex flex-col flex-1 min-h-0 w-full container mx-auto gap-2"
      role="status"
      aria-label="Loading match details"
      aria-busy={true}
    >
      {/* Top card: navbar placeholder + Match Pulse */}
      <div className="shrink-0 bg-background shadow-[0_2px_12px_-3px_rgba(0,0,0,0.12)] sm:ring-1 sm:ring-border/30 overflow-hidden rounded-b-xl sm:rounded-xl">
        {/* Match Pulse skeleton (same wrapper as hotInsightsBlock) */}
        <div className="mx-3 sm:mx-4 mb-1.5 mt-1.5 rounded-lg bg-muted/30 border border-border/20">
          <HotInsightsSkeleton />
        </div>
      </div>

      {/* Main content tabs */}
      <div className="bg-background backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
        <TabSkeleton />
        <TipsContentSkeleton />
      </div>
    </div>
  );
};

export default MatchDetailsSkeleton;
export { TabSkeleton, TipsContentSkeleton };
