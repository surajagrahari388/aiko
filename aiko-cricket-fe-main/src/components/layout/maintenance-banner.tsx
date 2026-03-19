"use client";

import { useState } from "react";
import { Construction, X } from "lucide-react";

export function MaintenanceBanner({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-amber-300 bg-amber-50 px-3 py-1.5 text-xs sm:text-sm dark:border-amber-700 dark:bg-amber-950"
    >
      <Construction className="size-3.5 shrink-0 text-amber-600 sm:size-4 dark:text-amber-400" />
      <p className="truncate text-amber-900 dark:text-amber-100">
        <span className="font-semibold">Scheduled Maintenance</span>
        <span className="mx-1.5 hidden text-amber-400 sm:inline">|</span>
        <span className="hidden sm:inline">{message}</span>
      </p>
      <span className="text-amber-800 sm:hidden dark:text-amber-200">
        {message}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto shrink-0 rounded p-0.5 text-amber-600 transition-colors hover:bg-amber-200/60 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-800/60 dark:hover:text-amber-100"
        aria-label="Dismiss maintenance banner"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
