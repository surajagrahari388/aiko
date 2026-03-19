import { Skeleton } from "@/components/ui/skeleton";

export const HotInsightsSkeleton = () => (
  <div className="bg-muted/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-border">
    {/* Header row: flame icon + title + audio + chevron */}
    <div className="flex items-center gap-2 mb-1">
      <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shrink-0" />
      <Skeleton className="h-4 w-24 flex-1" />
      <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
      <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
    </div>
    {/* Content */}
    <div className="space-y-1.5">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
    </div>
  </div>
);
