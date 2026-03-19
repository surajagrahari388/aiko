import { TipData } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to prettify category names
export function prettifyCategoryName(name: string) {
  // Replace underscores with spaces, then insert spaces before capital letters, then capitalize each word
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

export const formatDate = (dateStr: string) => {
  const date = parseIsoAsUtc(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "live":
    case "started":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "upcoming":
    case "scheduled":
      return "bg-[var(--odds-blue)]/10 text-[var(--odds-blue-foreground)] border-[var(--odds-blue)]/20";
    case "completed":
    case "finished":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default:
      return "bg-primary/10 text-primary border-primary/20";
  }
};

export const getDateLabel = (dateStr: string) => {
  const matchDate = parseIsoAsUtc(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Reset time to midnight for accurate date comparison
  const matchDateOnly = new Date(
    matchDate.getFullYear(),
    matchDate.getMonth(),
    matchDate.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const tomorrowOnly = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate()
  );

  if (matchDateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  } else if (matchDateOnly.getTime() === tomorrowOnly.getTime()) {
    return "Tomorrow";
  } else {
    // Return the day of the week for other dates
    return matchDate.toLocaleDateString("en-US", { weekday: "short" });
  }
};

/**
 * Get the browser's timezone offset in minutes
 */
export const getBrowserTimezone = (): {
  offset: number;
  name: string;
  abbreviation: string;
} => {
  const date = new Date();
  const offset = -date.getTimezoneOffset(); // Convert to minutes offset

  // Try to get timezone name from Intl API
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "long",
  }).formatToParts(date);
  
  const timeZoneName = parts.find((part: Intl.DateTimeFormatPart) => part.type === "timeZoneName")?.value || "UTC";

  const shortParts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  }).formatToParts(date);
  
  const abbreviation = shortParts.find((part: Intl.DateTimeFormatPart) => part.type === "timeZoneName")?.value || "UTC";

  return {
    offset,
    name: timeZoneName,
    abbreviation,
  };
};

/**
 * Return GMT label for browser timezone like GMT+05:30
 */
export const getBrowserGmtOffsetLabel = (date?: Date) => {
  const d = date ?? new Date();
  const offsetMinutes = -d.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `GMT${sign}${hh}:${mm}`;
};

/**
 * Convert UTC date to browser's local timezone
 */
export const convertUtcToLocalTime = (
  utcDateStr: string
): { date: Date; timezone: string } => {
  const date = parseIsoAsUtc(utcDateStr);
  const { abbreviation } = getBrowserTimezone();
  return { date, timezone: abbreviation };
};

/**
 * Convert IST (UTC+5:30) date to browser's local timezone
 */
export const convertIstToLocalTime = (
  istDateStr: string
): { date: Date; timezone: string } => {
  // If the date string already includes a timezone (Z or +/-HH:MM), treat it as an ISO with timezone
  const { abbreviation } = getBrowserTimezone();
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(istDateStr)) {
    return { date: new Date(istDateStr), timezone: abbreviation };
  }

  // Otherwise assume naive string is in IST (UTC+5:30) and convert to UTC first
  const date = new Date(istDateStr);
  const istOffset = 5.5 * 60 * 60 * 1000; // 5:30 hours in milliseconds
  const utcDate = new Date(date.getTime() - istOffset);
  return { date: utcDate, timezone: abbreviation };
};

/**
 * Format date with timezone awareness
 * @param dateStr - ISO date string (in UTC or IST)
 * @param baseTimezone - 'utc' or 'ist' - which timezone the input date is in
 * @param options - Intl.DateTimeFormat options
 */
export const formatDateWithTimezone = (
  dateStr: string,
  baseTimezone: "utc" | "ist" = "utc",
  options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }
): string => {
  let date: Date;

  if (baseTimezone === "ist") {
    ({ date } = convertIstToLocalTime(dateStr));
  } else {
    ({ date } = convertUtcToLocalTime(dateStr));
  }

  // Format using browser locale and options — Date object contains correct UTC instant and Intl will show local time
  return new Intl.DateTimeFormat(undefined, options).format(date);
};

/**
 * Parse an ISO string and assume UTC if timezone is missing.
 * This prevents browser inconsistencies where naive ISO strings are parsed as local time.
 */
export const parseIsoAsUtc = (iso?: string | null): Date => {
  if (!iso) return new Date("Invalid Date");
  // If already has timezone (Z or +HH:MM), return directly
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(iso)) return new Date(iso);
  // If the string looks like YYYY-MM-DDTHH:mm:ss(.sss) without timezone, append Z to treat as UTC
  const trimmed = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(trimmed)) {
    return new Date(trimmed + "Z");
  }
  // Fallback to Date constructor
  return new Date(iso);
};

/**
 * Convenience alias: treat date string as UTC and format in local timezone
 */
export const formatUtcToLocal = (
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
) => formatDateWithTimezone(dateStr, "utc", options);

/**
 * Get full date and time with timezone info
 * @param dateStr - ISO date string
 * @param baseTimezone - 'utc' or 'ist'
 */
export const getDateTimeWithTimezone = (dateStr: string): string => {
  const date = parseIsoAsUtc(dateStr);
  const formatted = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  const { abbreviation } = getBrowserTimezone();
  return `${formatted} ${abbreviation}`;
};

const normalizeKeyPart = (value?: string | null) =>
  value?.trim().toLowerCase() || "";

const getTipScenarioKey = (tip: TipData) => {
  const scenario = normalizeKeyPart(tip.original_scenario ?? tip.scenario);
  const betType = normalizeKeyPart(tip.original_bet_type ?? tip.bet_type);

  if (scenario && betType) {
    return `${betType}::${scenario}`;
  }

  if (tip.tip_id) {
    return String(tip.tip_id);
  }

  const summaryKey = normalizeKeyPart(tip.summary);
  if (summaryKey && betType) {
    return `${betType}::${summaryKey}`;
  }

  return betType || scenario || summaryKey || `${Date.now()}-${Math.random()}`;
};

const reconcileBooleans = (
  prev?: Pick<TipData, "is_live" | "original_bet_type_live">,
  incoming?: Pick<TipData, "is_live" | "original_bet_type_live">
) => {
  return {
    is_live:
      incoming?.is_live !== undefined ? incoming.is_live : prev?.is_live,
    original_bet_type_live:
      incoming?.original_bet_type_live !== undefined
        ? incoming.original_bet_type_live
        : prev?.original_bet_type_live,
  };
};

const mergeTip = (existingTip: TipData, incomingTip: TipData, wasActuallyUpdated: boolean = true) => {
  const booleanStates = reconcileBooleans(existingTip, incomingTip);

  return {
    ...existingTip,
    ...incomingTip,
    // Only update timestamp if this tip was actually in the current SSE batch
    updated_at: wasActuallyUpdated ? incomingTip.updated_at : existingTip.updated_at,
    is_live: booleanStates.is_live,
    original_bet_type_live: booleanStates.original_bet_type_live,
    filter_category:
      incomingTip.filter_category ?? existingTip.filter_category ?? [],
  };
};

export function mergeTipsByScenario(
  existing: TipData[],
  incoming: TipData[]
): TipData[] {
  const map = new Map<string, TipData>();
  
  // Track which tip_ids are actually in the incoming batch
  const incomingTipIds = new Set(incoming.map(tip => tip.tip_id));

  for (const tip of existing) {
    map.set(getTipScenarioKey(tip), tip);
  }

  for (const tip of incoming) {
    const key = getTipScenarioKey(tip);
    const existingTip = map.get(key);
    if (existingTip) {
      // Only update timestamp if this specific tip_id was in the current batch
      const wasActuallyUpdated = incomingTipIds.has(tip.tip_id);
      map.set(key, mergeTip(existingTip, tip, wasActuallyUpdated));
    } else {
      map.set(key, tip);
    }
  }

  return Array.from(map.values());
}
