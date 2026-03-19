import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton for the score header (Design B layout) */
export const ScoreHeaderSkeleton = () => (
  <>
    {/* Top bar: GoBack + center badge */}
    <div className="container mx-auto md:px-2 sm:px-6 lg:px-6 px-3">
      <div className="flex items-center justify-between h-12 sm:h-14 gap-3">
        <div className="flex items-center gap-1 min-w-0">
          <Skeleton className="h-6 w-6 rounded-sm" />
        </div>
        <div className="flex-1 flex justify-center">
          <Skeleton className="h-8 w-16 sm:h-9 sm:w-20 rounded-full" />
        </div>
        <div className="w-8" />
      </div>
    </div>

    {/* Score section: Team A | divider | Team B */}
    <div className="w-full pb-1.5 sm:pb-2 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-center">
          {/* Team A (left) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end pr-2 sm:pr-4">
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl shrink-0" />
            <div className="flex flex-col items-start gap-1 min-w-0">
              <Skeleton className="h-3 w-10 sm:h-3.5 sm:w-20" />
              <Skeleton className="h-5 w-14 sm:h-7 sm:w-20 md:h-8" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-12 sm:h-14 md:h-16 bg-foreground/20 shrink-0" />

          {/* Team B (right) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 pl-2 sm:pl-4">
            <div className="flex flex-col items-start gap-1 min-w-0">
              <Skeleton className="h-3 w-10 sm:h-3.5 sm:w-20" />
              <Skeleton className="h-5 w-14 sm:h-7 sm:w-20 md:h-8" />
            </div>
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl shrink-0" />
          </div>
        </div>

        {/* CRR · RRR row */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <Skeleton className="h-2.5 w-16 sm:w-20" />
          <Skeleton className="h-2.5 w-16 sm:w-20" />
        </div>
      </div>
    </div>
  </>
);

/** Skeleton for the status note strip (Design B) */
export const StatusNoteSkeleton = () => (
  <div className="mx-3 sm:mx-4 mt-1.5 rounded-lg bg-muted/30 border border-border/20">
    <div className="flex justify-center py-1 px-3">
      <Skeleton className="h-3 w-48 sm:w-64" />
    </div>
  </div>
);

/** Skeleton for ball-by-ball overs strip */
export const BallByBallSkeleton = () => (
  <div className="mx-3 sm:mx-4 mt-1.5 mb-1.5 rounded-lg bg-muted/30">
    <div className="px-2 sm:px-3">
      <div className="py-1 sm:py-1.5">
        <div className="flex items-center gap-2 justify-end">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 shrink-0 rounded-lg px-2 py-1.5 bg-background/60 border border-foreground/15"
            >
              {/* Over label */}
              <div className="flex items-center gap-1 pr-2 border-r border-border/30">
                <Skeleton className="h-3 w-5" />
                <Skeleton className="h-3.5 w-4" />
              </div>
              {/* Balls */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton key={j} className="w-6 h-6 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/** Combined skeleton for the full navbar match section (Design B) */
export const NavbarMatchSkeleton = () => (
  <nav
    className="text-foreground shrink-0"
    role="status"
    aria-label="Loading match header"
    aria-busy={true}
  >
    <ScoreHeaderSkeleton />
    <StatusNoteSkeleton />
    <BallByBallSkeleton />
  </nav>
);
