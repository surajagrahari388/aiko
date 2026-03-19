import type React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TeamRowSkeleton: React.FC<{ showScore?: boolean }> = ({ showScore = false }) => {
  return (
    <div className="flex items-center gap-3 px-2">
      <Skeleton className="w-5 h-5 rounded-full shrink-0" />
      <div className="min-w-0 flex-1 flex items-center justify-between">
        <Skeleton className="h-3 w-16 sm:w-20" />
        {showScore && <Skeleton className="h-3 w-10" />}
      </div>
    </div>
  );
};

const StatusBadgeSkeleton: React.FC = () => {
  return (
    <div className="flex justify-end">
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
};

interface MatchCardSkeletonProps {
  showStatusBadge?: boolean;
}

export const MatchCardSkeleton: React.FC<MatchCardSkeletonProps> = ({
  showStatusBadge = false,
}) => {
  return (
    <Card
      className="relative bg-card/60 backdrop-blur-sm border-border/50 transition-all duration-300 h-full cursor-pointer shadow-md hover:-translate-y-1 hover:scale-[1.02]"
      role="status"
      aria-label="Loading match card"
    >
      <div className="p-1">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Left - Teams stacked vertically */}
          <div className="flex-1 flex flex-col gap-1">
            <TeamRowSkeleton showScore={showStatusBadge} />
            <TeamRowSkeleton showScore={showStatusBadge} />
          </div>

          {/* Divider */}
          <div className="w-px h-12 sm:h-16 bg-border" />

          {/* Right - Status Badge, Date and Time */}
          <div className="shrink-0 pr-1 sm:pr-2 pl-2 sm:pl-4 text-right flex flex-col items-end justify-center min-w-[100px]">
            {/* Status Badge - Show for some skeleton cards to simulate live matches */}
            {showStatusBadge ? (
              <StatusBadgeSkeleton />
            ) : (
              <>
                {/* Date */}
                <Skeleton className="h-2.5 w-20 mb-1 mt-1" />
                {/* Time */}
                <Skeleton className="h-4 sm:h-5 w-12 mt-0.5" />
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
