"use client";

import { useState, useMemo } from "react";
import { Play, CalendarDays, MessageCircle, Lightbulb, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BottomNavBarProps {
  allTabCategories: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  showPlayerInsights?: boolean;
  getDisplayName: (category: string) => string;
}

const PRIMARY_TAB_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  live: { label: "In-Game", icon: Play },
  all: { label: "Pre-Game", icon: CalendarDays },
  "ask-aiko": { label: "Ask Aiko", icon: MessageCircle },
  "match-tips": { label: "Insights", icon: Lightbulb },
};

const PRIMARY_TAB_ORDER = ["live", "all", "ask-aiko", "match-tips"];

export default function BottomNavBar({
  allTabCategories,
  activeTab,
  onTabChange,
  showPlayerInsights,
  getDisplayName,
}: BottomNavBarProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryTabs = useMemo(
    () => PRIMARY_TAB_ORDER.filter((tab) => allTabCategories.includes(tab)),
    [allTabCategories]
  );

  const overflowTabs = useMemo(
    () => [
      ...allTabCategories.filter((tab) => !PRIMARY_TAB_ORDER.includes(tab)),
      ...(showPlayerInsights ? ["player-insights"] : []),
    ],
    [allTabCategories, showPlayerInsights]
  );

  const hasOverflow = overflowTabs.length > 0;

  const getOverflowLabel = (tabKey: string) => {
    if (tabKey === "my-tips") return "My Insights";
    if (tabKey === "player-insights") return "Player Insights";
    return `${getDisplayName(tabKey)} Insights`;
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="bg-background/95 backdrop-blur-sm border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-1 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {primaryTabs.map((tabKey) => {
            const config = PRIMARY_TAB_CONFIG[tabKey];
            const isActive = activeTab === tabKey;
            const Icon = config.icon;
            return (
              <button
                key={tabKey}
                onClick={() => onTabChange(tabKey)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors min-w-[60px] touch-manipulation",
                  isActive
                    ? "text-[#a6171b]"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className={cn(
                  "text-[10px] leading-tight",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {config.label}
                </span>
              </button>
            );
          })}

          {hasOverflow && (
            <button
              onClick={() => setIsMoreOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors min-w-[60px] touch-manipulation",
                overflowTabs.includes(activeTab)
                  ? "text-[#a6171b]"
                  : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className={cn(
                "text-[10px] leading-tight",
                overflowTabs.includes(activeTab) ? "font-bold" : "font-medium"
              )}>
                More
              </span>
            </button>
          )}
        </div>
      </div>

      {hasOverflow && (
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetContent side="bottom" className="rounded-t-xl px-4 pb-8 pt-2">
            <SheetHeader className="pb-3">
              <SheetTitle className="text-sm">More Categories</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-2">
              {overflowTabs.map((tabKey) => {
                const isActive = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    onClick={() => {
                      onTabChange(tabKey);
                      setIsMoreOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border transition-colors text-left text-sm",
                      isActive
                        ? "border-[#a6171b] bg-[#a6171b]/10 text-[#a6171b] font-semibold"
                        : "border-border bg-muted/30 text-foreground"
                    )}
                  >
                    {getOverflowLabel(tabKey)}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
