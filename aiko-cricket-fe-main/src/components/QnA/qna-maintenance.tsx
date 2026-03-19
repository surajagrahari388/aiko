"use client";

import { Calendar } from "lucide-react";

interface QnAMaintenanceProps {
  isMatchUnavailable?: boolean;
}

export default function QnAMaintenance({
  isMatchUnavailable = false,
}: QnAMaintenanceProps) {
  return (
    <div className="py-8 text-center">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-card text-card-foreground flex flex-col rounded-xl border py-3 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-semibold">
                  {isMatchUnavailable
                    ? "QnA Not Available for This Match"
                    : "Feature Under Maintenance"}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isMatchUnavailable
                    ? "The Ask Questions feature works only in ICC recognised matches and IPL."
                    : "We're upgrading our QnA system to give you a better experience."}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-3">
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-md px-4 py-3 flex items-center gap-2 w-fit mx-auto">
              <Calendar className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
              <span className="font-medium">
                QnA will be back Soon. Stay tuned!
              </span>
            </div>
            {isMatchUnavailable && (
              <p className="text-sm text-muted-foreground font-medium mt-3">
                Open an ICC competition match to use this feature.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
