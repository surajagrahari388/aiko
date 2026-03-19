"use client";

import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";

type SSEStatus = "disconnected" | "connecting" | "connected" | "error";

interface SSEStatusIndicatorProps {
  status: SSEStatus;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  onRetry?: () => void;
  maxRetriesReached?: boolean;
}

const getStatusConfig = (status: SSEStatus) => {
  switch (status) {
    case "connected":
      return {
        label: "Connected",
        textColor: "text-green-600 dark:text-green-400",
        dotColor: "bg-green-500",
      };
    case "connecting":
      return {
        icon: Loader2,
        label: "Connecting",
        textColor: "text-yellow-600 dark:text-yellow-400", 
        dotColor: "bg-yellow-500",
      };
    case "error":
      return {
        label: "Failed to Connect",
        textColor: "text-red-600 dark:text-red-400",
        dotColor: "bg-red-500",
      };
    case "disconnected":
    default:
      return {
        label: "Offline",
        textColor: "text-gray-500 dark:text-gray-400",
        dotColor: "bg-gray-400",
      };
  }
};

export function SSEStatusIndicator({ 
  status, 
  className,
  showLabel = true,
  size = "sm",
  onRetry,
  maxRetriesReached = false
}: SSEStatusIndicatorProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  const dotSize = size === "lg" ? "h-2.5 w-2.5" : size === "md" ? "h-2 w-2" : "h-1.5 w-1.5";
  const iconSize = size === "lg" ? "h-4 w-4" : size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";
  const textSize = size === "lg" ? "text-sm" : "text-xs";
  const spacing = size === "lg" ? "gap-2" : "gap-1.5";

  const showRetryButton = maxRetriesReached && onRetry;

  return (
    <div className={cn(
      "flex items-center",
      spacing,
      config.textColor,
      className
    )}>
      {/* Status dot */}
      <div
        className={cn(
          "rounded-full shrink-0",
          dotSize,
          config.dotColor,
          status === "connected" && "animate-pulse",
          status === "connecting" && "animate-pulse"
        )}
      />
      
      {/* Icon for error/connecting states */}
      {Icon && (
        <Icon 
          className={cn(
            iconSize,
            status === "connecting" && "animate-spin"
          )} 
        />
      )}
      
      {/* Label */}
      {showLabel && (
        <span className={textSize}>
          {config.label}
        </span>
      )}

      {/* Retry Button */}
      {showRetryButton && (
        <button
          onClick={onRetry}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
            "bg-muted/50 hover:bg-muted transition-colors",
            "text-muted-foreground hover:text-foreground",
            "border border-border/50 hover:border-border",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          )}
          title="Retry connecting for live insights"
        >
          <RotateCcw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  );
}

// Minimal dot version
export function SSEStatusDot({ 
  status, 
  className 
}: { 
  status: SSEStatus; 
  className?: string;
}) {
  const config = getStatusConfig(status);

  return (
    <div
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        config.dotColor,
        status === "connected" && "animate-pulse",
        status === "connecting" && "animate-pulse",
        className
      )}
      title={`Connection: ${config.label}`}
    />
  );
}