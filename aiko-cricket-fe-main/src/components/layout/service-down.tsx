"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ServiceDownProps {
  onRefresh?: () => void;
  title?: string;
  description?: string;
  showRefreshButton?: boolean;
  supportEmail?: string;
  sendNotification?: boolean;
}

export default function ServiceDown({
  onRefresh,
  title = "Service Temporarily Unavailable",
  description = "We're experiencing some technical difficulties right now. Our team is working hard to get everything back online as quickly as possible.",
  showRefreshButton = true,
  supportEmail = "support@xansrmedia.com",
  sendNotification = false,
}: ServiceDownProps) {
  // Send client-side notification if needed (fallback)
  useEffect(() => {
    if (sendNotification) {
      const sendClientNotification = async () => {
        try {
          await fetch("/api/teams-notification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: "Client-side Service Down Alert",
              text: "User reached service down page (client-side)",
              timestamp: new Date().toISOString(),
              errorType: "CLIENT_SERVICE_DOWN",
            }),
          });
        } catch (error) {
          console.error("Failed to send client notification:", error);
        }
      };

      sendClientNotification();
    }
  }, [sendNotification]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-tr from-background via-background to-background/95 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 bg-gradient-to-r from-yellow-100/12 to-orange-100/8 rounded-full blur-xl sm:blur-2xl animate-pulse delay-200" />
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-52 lg:h-52 bg-gradient-to-l from-amber-50/10 to-yellow-50/6 rounded-full blur-xl sm:blur-2xl animate-pulse delay-600" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-tr from-orange-50/8 to-amber-50/8 rounded-full blur-lg sm:blur-xl animate-pulse delay-1000" />

        {/* Floating dots */}
        <div className="absolute top-1/5 left-1/3 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-200/50 rounded-full animate-bounce delay-400" />
        <div className="absolute bottom-1/5 right-1/3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-200/40 rounded-full animate-bounce delay-800" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-amber-300/60 rounded-full animate-ping delay-600" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-6 sm:space-y-8 md:space-y-10 max-w-2xl mx-auto">
            {/* Error Message */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                {title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground/80 leading-relaxed px-4 sm:px-0">
                {description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
              {showRefreshButton && (
                <Button onClick={handleRefresh} size="lg" className="group">
                  <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Try Again
                </Button>
              )}
            </div>

            {/* Help Section */}
            {supportEmail && (
              <div className="pt-6 sm:pt-8">
                <p className="text-xs sm:text-sm text-muted-foreground/60">
                  If this issue persists, please contact at{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="hover:underline"
                  >
                    {supportEmail}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corner decorative elements */}
      <div className="absolute top-8 right-8 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-200 to-orange-300 rounded-full opacity-50 animate-pulse" />
      <div className="absolute bottom-8 left-8 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full opacity-40 animate-pulse delay-300" />
    </div>
  );
}
