"use client";

import React from "react";

type MatchStatusFilterProps = {
  selectedStatus: "all" | "live" | "today" | "tomorrow";
  onSelect: (status: "all" | "live" | "today" | "tomorrow") => void;
  liveMatchesCount: number;
};

const MatchStatusFilter: React.FC<MatchStatusFilterProps> = ({
  selectedStatus,
  onSelect,
  liveMatchesCount,
}) => {
  const baseButtonClasses =
    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap";
  const activeClasses = "bg-primary text-white";
  const inactiveClasses =
    "bg-card/40 text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <div className="backdrop-blur-md flex-1 overflow-hidden">
      <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onSelect("all")}
          className={`${baseButtonClasses} ${
            selectedStatus === "all" ? activeClasses : inactiveClasses
          }`}
        >
          All
        </button>

        {liveMatchesCount > 0 && (
          <button
            onClick={() => onSelect("live")}
            className={`${baseButtonClasses} flex items-center gap-1.5 ${
              selectedStatus === "live" ? activeClasses : inactiveClasses
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </button>
        )}

        <button
          onClick={() => onSelect("today")}
          className={`${baseButtonClasses} ${
            selectedStatus === "today" ? activeClasses : inactiveClasses
          }`}
        >
          Today
        </button>

        <button
          onClick={() => onSelect("tomorrow")}
          className={`${baseButtonClasses} ${
            selectedStatus === "tomorrow" ? activeClasses : inactiveClasses
          }`}
        >
          Tomorrow
        </button>
      </div>
    </div>
  );
};

export default MatchStatusFilter;