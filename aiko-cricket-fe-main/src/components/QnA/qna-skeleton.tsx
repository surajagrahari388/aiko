import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/** Skeleton for a single question card in the queue */
export const QuestionCardSkeleton = () => (
  <Card className="transition-all duration-200">
    <div className="p-4">
      {/* Header: Q number + status badge + action buttons */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded-sm" />
        </div>
      </div>
      {/* Question text */}
      <div className="mb-3 space-y-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
      {/* Action button */}
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  </Card>
);

/** Skeleton for the FAQ + Question Input card */
export const QuestionInputSkeleton = () => (
  <Card className="w-full">
    {/* FAQ chips */}
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24 sm:w-32 rounded-full" />
        ))}
      </div>
      {/* Separator */}
      <Skeleton className="h-px w-4/5 mx-auto" />
      {/* Input bar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md shrink-0" />
        <Skeleton className="h-10 w-10 rounded-md shrink-0" />
      </div>
    </div>
  </Card>
);

/** Skeleton for conversation history section */
export const ConversationHistorySkeleton = () => (
  <section className="relative flex flex-col justify-center gap-4 overflow-hidden border-y bg-background px-3 py-3 md:py-6">
    <div className="absolute left-0 top-3.5 h-6 w-1 rounded-full bg-primary/30 md:top-7" />
    {/* Header */}
    <div className="flex items-center space-x-4">
      <Skeleton className="h-6 w-52 sm:h-7 sm:w-64" />
      <div className="ml-auto">
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
    {/* Question cards grid */}
    <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="mb-3 space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  </section>
);

/** Full QnA tab skeleton combining input + queue + history */
export const AskQuestionSkeleton = () => (
  <div
    className="space-y-4 px-3 py-3 md:py-6"
    role="status"
    aria-label="Loading Q&A section"
    aria-busy={true}
  >
    {/* Section header */}
    <div>
      <Skeleton className="h-6 w-52 sm:h-7 sm:w-64 mb-1" />
      <Skeleton className="h-3.5 w-72 sm:w-80" />
    </div>

    {/* FAQ + Input */}
    <QuestionInputSkeleton />

    {/* Question queue placeholder */}
    <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <QuestionCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
