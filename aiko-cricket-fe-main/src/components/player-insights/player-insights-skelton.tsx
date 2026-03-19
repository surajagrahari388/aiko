import { Skeleton } from "@/components/ui/skeleton";

const TeamToggleSkeleton = () => (
  <div className="w-full px-3 sm:px-4 md:px-6 mb-4 md:mb-6 pb-4 md:pb-6">
    <div className="flex h-9 sm:h-10 md:h-12 items-center rounded-lg bg-muted/30 backdrop-blur-sm p-1 sm:p-1.5 gap-0.5 sm:gap-1 border border-border/30">
      {[0, 1].map((index) => (
        <Skeleton 
          key={index} 
          className="flex-1 h-full rounded-md bg-muted/60" 
        />
      ))}
    </div>
  </div>
);

const StadiumFieldSkeleton = () => (
  <div className="flex-1 w-full lg:max-w-[50%]">
    <div 
      className="relative w-full mx-auto bg-linear-to-b from-green-500/10 to-green-600/20 rounded-full border-2 border-green-500/30 overflow-hidden" 
      style={{ aspectRatio: "1" }}
    >
      {/* Stadium background with subtle pattern */}
      <div className="absolute inset-0 bg-green-50/5 dark:bg-green-900/10">
        <div className="absolute inset-4 rounded-full border border-green-400/20 bg-green-100/5 dark:bg-green-800/10">
          <div className="absolute inset-4 rounded-full border border-green-400/15">
            {/* Center pitch */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-green-400/20 rounded-full border border-green-400/30"></div>
          </div>
        </div>
      </div>

      {/* Player position skeletons */}
      {Array.from({ length: 11 }).map((_, index) => {
        const positions = [
          { top: "15%", left: "50%" }, // Wicket keeper
          { top: "25%", left: "30%" }, // Slip 1
          { top: "25%", left: "70%" }, // Slip 2
          { top: "35%", left: "50%" }, // Point
          { top: "45%", left: "20%" }, // Third man
          { top: "45%", left: "80%" }, // Fine leg
          { top: "60%", left: "40%" }, // Mid wicket
          { top: "60%", left: "60%" }, // Cover
          { top: "75%", left: "25%" }, // Square leg
          { top: "75%", left: "75%" }, // Gully
          { top: "85%", left: "50%" }, // Long off
        ];
        
        const position = positions[index] || { top: "50%", left: "50%" };
        
        return (
          <div
            key={index}
            className="absolute w-6 h-6 sm:w-8 sm:h-8 -translate-x-1/2 -translate-y-1/2"
            style={{ top: position.top, left: position.left }}
          >
            <Skeleton className="w-full h-full rounded-full bg-primary/30" />
          </div>
        );
      })}
    </div>
  </div>
);

const PlayerDetailPanelSkeleton = () => (
  <div className="flex-1 w-full lg:max-w-[50%]">
    <div className="bg-background/90 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border border-border/30 p-4 sm:p-5 md:p-6 h-full flex flex-col">
      {/* Player header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 sm:space-y-2.5">
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          <Skeleton className="h-4 w-24 sm:w-28" />
          <Skeleton className="h-4 w-20 sm:w-24" />
        </div>
      </div>

      {/* Player stats cards */}
      <div className="flex-1 space-y-3 sm:space-y-4">
        {[0, 1, 2].map((index) => (
          <div 
            key={index} 
            className="bg-muted/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-border/20"
          >
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20 sm:w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 sm:h-7 w-16 sm:w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-full max-w-[60%]" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Player action buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  </div>
);

export const PlayerInsightsLoading = () => (
  <div 
    className="flex flex-col w-full" 
    role="status" 
    aria-label="Loading player insights"
    aria-busy={true}
  >
    {/* Team Toggle */}
    <TeamToggleSkeleton />

    {/* Main content */}
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8 px-3 sm:px-4 md:px-6 mb-6 sm:mb-8 md:mb-10">
      {/* Stadium Field */}
      <StadiumFieldSkeleton />

      {/* Player Detail Panel */}
      <PlayerDetailPanelSkeleton />
    </div>
  </div>
);
