import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type TipsErrorCardProps = {
  isFetching: boolean;
  onRetry: () => void;
};

const TipsErrorCard: React.FC<TipsErrorCardProps> = ({
  isFetching,
  onRetry,
}) => {
  return (
    <Card
      className="p-6 bg-card/80 shadow-sm text-center space-y-3"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2 text-primary">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm font-semibold">We couldn&apos;t load the insights</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Something went wrong on our end. Please refresh or try again.
      </p>
      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isFetching}
          className="gap-2"
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isFetching ? "Retrying" : "Try again"}
        </Button>
      </div>
    </Card>
  );
};

export default TipsErrorCard;
