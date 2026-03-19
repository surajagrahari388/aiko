import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const TipsCategoryFilterSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide mb-4">
      {/* Category filter buttons */}
      <Skeleton className="h-8 w-12 rounded-full shrink-0" />
      <Skeleton className="h-8 w-16 rounded-full shrink-0" />
      <Skeleton className="h-8 w-20 rounded-full shrink-0" />
      <Skeleton className="h-8 w-18 rounded-full shrink-0" />
      <Skeleton className="h-8 w-14 rounded-full shrink-0" />
    </div>
  );
};

const MyTipsCardSkeleton: React.FC = () => {
  return (
    <section className="rounded-xl p-1 pt-0 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-sm" /> {/* Emoji placeholder */}
          <Skeleton className="h-4 w-20" /> {/* "My Insights" text */}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Star button skeleton */}
          <Skeleton className="h-6 w-6 rounded-sm" />
        </div>
      </div>

      {/* My Insights Card */}
      <div className="relative group">
        <div className="overflow-hidden">
          <div className="bg-muted/30 backdrop-blur-sm rounded-xl px-1 border border-border transition-all duration-300 relative overflow-hidden">
            <div className="flex items-start">
              {/* Left chevron */}
              <Skeleton className="h-8 w-8 rounded-full mt-3 ml-1" />
              
              <div className="flex-1 p-4">
                {/* Question title */}
                <div className="flex items-start gap-2 mb-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-6 rounded-md ml-auto" /> {/* Expand/collapse button */}
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-5/6" />
                  <Skeleton className="h-3.5 w-4/5" />
                </div>
              </div>
              
              {/* Right chevron */}
              <Skeleton className="h-8 w-8 rounded-full mt-3 mr-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MatchTipsCardSkeleton: React.FC = () => {
  return (
    <section className="rounded-xl p-1 pt-0 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-sm" /> {/* Emoji placeholder */}
          <Skeleton className="h-4 w-24" /> {/* "Match Insights" text */}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Listen button skeleton (first) */}
          <Skeleton className="h-6 w-16 rounded-full" />
          {/* Ask button skeleton (second) */}
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>

      {/* Match Insights Card */}
      <div className="relative group">
        <div className="overflow-hidden">
          <div className="bg-muted/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-border transition-all duration-300 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    {/* Navigation buttons */}
                    <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
                    
                    {/* Category type */}
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                    </div>
                    
                    <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
                  </div>
                  
                  {/* Tip content */}
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BetTypeCarouselSkeleton: React.FC = () => {
  return (
    <section className="bg-muted/30 backdrop-blur-sm rounded-xl border border-border/20 p-3 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary/30 rounded-full"></div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-8 rounded-sm" />
        </div>
      </div>

      {/* Tip Card */}
      <div className="relative group">
        <div className="overflow-hidden">
          <div className="bg-card/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50 transition-all duration-300 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start gap-2 mb-3">
                {/* Star button skeleton */}
                <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
                
                {/* Tip title */}
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-5 w-full max-w-md mb-2" />
                </div>
                
                {/* Audio button skeleton */}
                <Skeleton className="h-6 w-6 rounded-sm shrink-0" />
              </div>
              
              {/* Tip content */}
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
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
  );
};

const TipsLoadingSkeleton: React.FC = () => {
  return (
    <div 
      className="space-y-4" 
      role="status" 
      aria-label="Loading insights"
      aria-busy={true}
    >
      {/* Friendly message */}
      <Alert className="mb-4">
        <Loader2 className="animate-spin" />
        <AlertTitle>Insights are generating</AlertTitle>
        <AlertDescription>
          It might take a few minutes to generate. Check back soon!
        </AlertDescription>
      </Alert>

      {/* Insights Category Filter */}
      <TipsCategoryFilterSkeleton />
      
      {/* Tips Content */}
      <div className="space-y-3 mt-3">
        {[1, 2, 3].map((sectionIndex) => (
          <BetTypeCarouselSkeleton key={sectionIndex} />
        ))}
      </div>
    </div>
  );
};

export default TipsLoadingSkeleton;
export { MatchTipsCardSkeleton, MyTipsCardSkeleton };
