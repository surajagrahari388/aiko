"use client";

import { useSSEStatus } from "@/contexts/sse-status-context";

const STATUS_COLORS: Record<string, string> = {
  connected: "text-green-500",
  connecting: "text-yellow-500",
  error: "text-red-500",
  disconnected: "text-red-500",
};

export default function SSEBroadcastIcon() {
  const { sseStatus } = useSSEStatus();
  const colorClass = STATUS_COLORS[sseStatus] || STATUS_COLORS.disconnected;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${colorClass} shrink-0`}
      aria-label={`Live connection: ${sseStatus}`}
    >
      {/* Center dot */}
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      {/* Inner arc */}
      <path d="M8.46 15.54a5 5 0 0 1 0-7.07" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      {/* Outer arc */}
      <path d="M5.64 18.36a9 9 0 0 1 0-12.73" />
      <path d="M18.36 5.64a9 9 0 0 1 0 12.73" />
    </svg>
  );
}
