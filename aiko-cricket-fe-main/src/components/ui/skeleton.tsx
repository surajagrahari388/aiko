import React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      role="status"
      aria-busy={true}
      aria-label="Loading content"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/40 dark:bg-muted/20",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-linear-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-[shimmer_1.5s_ease-in-out_infinite]",
        "transition-all duration-200",
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { Skeleton };
