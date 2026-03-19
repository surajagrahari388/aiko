"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@/components/animate-ui/components/headless/accordion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Minus,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { MyTipsCardSkeleton } from "./tips-loading-skeleton";
import { MemoizedReactMarkdown } from "@/components/ui/markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import type {
  FavouriteTipRecord,
  FavouriteTipWithQna,
  SportsMatches,
} from "@/lib/types";
import { useFavouriteTipQna } from "@/hooks/use-favourite-tip-qna";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { UnstarQuestionAction } from "@/server/personalised-tip";

interface MyTipItemProps {
  tip: FavouriteTipWithQna;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onProcessQna?: () => void;
  isProcessing?: boolean;
}

const MyTipItem: React.FC<MyTipItemProps> = memo(
  ({ tip, isExpanded, onToggleExpand, onProcessQna, isProcessing = false }) => {
    const handleToggleExpand = useCallback(() => {
      onToggleExpand();
      if (
        !isExpanded &&
        !tip.qna_processed &&
        !tip.qna_loading &&
        onProcessQna
      ) {
        onProcessQna();
      }
    }, [isExpanded, tip, onProcessQna, onToggleExpand]);

    const renderContent = () => {
      if (isProcessing || tip.qna_loading) {
        return (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Generating your My insight...
              </p>
            </div>
          </div>
        );
      }

      if (tip.qna_error) {
        return (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm text-destructive">{tip.qna_error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onProcessQna}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        );
      }

      if (tip.qna_messages && tip.qna_messages.length > 1) {
        const assistantMessage = tip.qna_messages.find(
          (msg) => msg.role === "assistant"
        );
        if (assistantMessage?.content) {
          return (
            <div>
              <MemoizedReactMarkdown
                className={cn(
                  "prose prose-sm max-w-none wrap-break-word",
                  "dark:prose-invert"
                )}
                remarkPlugins={[remarkGfm, remarkMath]}
                components={{
                  th: ({ children }) => (
                    <th className="px-2 py-1 text-left text-xs font-semibold sm:px-3 sm:py-2 sm:text-sm">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm">
                      {children}
                    </td>
                  ),
                }}
              >
                {assistantMessage.content}
              </MemoizedReactMarkdown>
            </div>
          );
        }
      }

      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Generating your tip...
            </p>
          </div>
        </div>
      );
    };

    return (
      <Accordion className="space-y-3">
        <AccordionItem className="border-0">
          <div className="flex items-start gap-2">
            <h4 className="text-sm font-semibold text-primary">
              {tip.original_question}
            </h4>
            <AccordionButton
              showArrow={false}
              className="flex items-center justify-end text-primary h-6 w-6 rounded-md transition-colors ml-auto p-0"
              onClick={handleToggleExpand}
            >
              {({ open }: { open: boolean }) =>
                open ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )
              }
            </AccordionButton>
          </div>

          <AccordionPanel unmount={true} className="pl-0 pt-3 pb-0">
            <div className="pl-0">{renderContent()}</div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  }
);

MyTipItem.displayName = "MyTipItem";

interface MyTipsSectionProps {
  myTips: FavouriteTipRecord[];
  isLoading?: boolean;
  user_id: string;
  oddsData?: SportsMatches;

  players: {
    player_id: string;
    full_name: string;
    playing_role: string;
    team_name: string;
  }[];
  apim_key: string;
  apim_url: string;
  conversation_id: string;
}

export const MyTipsSection: React.FC<MyTipsSectionProps> = ({
  myTips,
  isLoading,
  user_id,
  oddsData,
  players,
  apim_key,
  apim_url,
  conversation_id,
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [processedTips, setProcessedTips] = useState(
    new Map<string, FavouriteTipWithQna>()
  );
  const MY_TIP_QNA_CACHE_KEY_PREFIX = "myTipQnaCache_v1";
  const myTipCacheKey = useMemo(() => {
    const matchId =
      oddsData?.matches?.[0]?.match_id?.toString() ?? "nomatch";
    const uid = user_id || "nouser";
    return `${MY_TIP_QNA_CACHE_KEY_PREFIX}_${uid}_${matchId}`;
  }, [user_id, oddsData]);
  const [tipTouchStart, setTipTouchStart] = useState<number | null>(null);
  const [tipTouchEnd, setTipTouchEnd] = useState<number | null>(null);
  const [removedTipIds, setRemovedTipIds] = useState<Set<string>>(new Set());

  // intentionally not using language locally in this component

  const availableTips = useMemo(
    () =>
      myTips.filter((tip: FavouriteTipRecord) => !removedTipIds.has(tip.id)),
    [myTips, removedTipIds]
  );

  const clampedTipIndex = useMemo(
    () =>
      availableTips.length > 0 && currentTipIndex >= availableTips.length
        ? Math.max(0, availableTips.length - 1)
        : currentTipIndex,
    [availableTips.length, currentTipIndex]
  );

  const currentTip = useMemo(
    () => availableTips[clampedTipIndex],
    [availableTips, clampedTipIndex]
  );

  const currentProcessedTip = useMemo(
    () => (currentTip ? processedTips.get(currentTip.id) : null),
    [currentTip, processedTips]
  );

  const { execute: executeUnstar, isPending: isUnstarring } = useAction(
    UnstarQuestionAction,
    {
      onSuccess: (response) => {
        const data = response?.data;
        if (data?.success) {
          toast.success("Removed from My Tips!");
          if (currentTip) {
            setRemovedTipIds((prev) => new Set(prev).add(currentTip.id));
            setIsExpanded(false);
          }
        } else {
          toast.error("Failed to unstar tip");
        }
      },
      onError: ({ error }) => {
        console.error("Error unstarring tip:", error);
        toast.error("Failed to unstar tip");
      },
    }
  );

  const handleUnstar = useCallback(() => {
    if (!currentTip || isUnstarring) return;
    const matchId = oddsData?.matches[0]?.match_id?.toString() || "";
    executeUnstar({
      conversation_id: currentTip.conversation_id,
      match_id: matchId,
      message_id: currentTip.message_id,
      user_id,
    });
  }, [currentTip, isUnstarring, executeUnstar, user_id, oddsData]);

  const qnaConfig = useMemo(() => {
    return {
      api_url: apim_url,
      apim_key: apim_key,
      user_id: user_id,
      conversation_id,
      stats: oddsData,
      squads: players,
      caching_enabled: true,
    } as const;
  }, [apim_url, apim_key, user_id, oddsData, players, conversation_id]);

  const { processFavouriteTip: processMyTip, isProcessing } =
    useFavouriteTipQna(qnaConfig);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" && sessionStorage.getItem(myTipCacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, FavouriteTipWithQna>;
        const map = new Map<string, FavouriteTipWithQna>(
          Object.entries(parsed || {})
        );
        setProcessedTips(map);
      }
    } catch (err) {
      console.debug("Failed to restore favourite tip QnA cache:", err);
    }
  }, [myTipCacheKey]);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % availableTips.length);
    setIsExpanded(false);
  };

  const prevTip = () => {
    setCurrentTipIndex(
      (prev) => (prev - 1 + availableTips.length) % availableTips.length
    );
    setIsExpanded(false);
  };

  const handleTipTouchStart = (e: React.TouchEvent) => {
    setTipTouchEnd(null);
    setTipTouchStart(e.targetTouches[0].clientX);
  };

  const handleTipTouchMove = (e: React.TouchEvent) => {
    setTipTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTipTouchEnd = () => {
    if (!tipTouchStart || !tipTouchEnd) return;
    const distance = tipTouchStart - tipTouchEnd;
    const isLeftSwipe = distance > 30;
    const isRightSwipe = distance < -30;
    if (isLeftSwipe) nextTip();
    else if (isRightSwipe) prevTip();
  };

  const handleProcessQna = useCallback(async () => {
    if (!currentTip) return;
    if (processedTips.has(currentTip.id)) return;
    try {
      const processedTip = await processMyTip(currentTip);
      setProcessedTips((prev) => {
        const newMap = new Map(prev).set(currentTip.id, processedTip);
        try {
          const obj: Record<string, FavouriteTipWithQna> = {};
          for (const [k, v] of newMap.entries()) {
            obj[k] = v;
          }
          if (typeof window !== "undefined") {
            sessionStorage.setItem(myTipCacheKey, JSON.stringify(obj));
          }
        } catch (err) {
          console.debug("Failed to persist favourite tip QnA cache:", err);
        }
        return newMap;
      });
    } catch (error) {
      console.error("Failed to process QnA for favorite tip:", error);
      toast.error("Failed to process question. Please try again.");
    }
  }, [currentTip, processMyTip, processedTips, myTipCacheKey]);

  useEffect(() => {
    if (
      currentTip &&
      isExpanded &&
      !currentProcessedTip?.qna_processed &&
      !isProcessing(currentTip.id)
    ) {
      handleProcessQna();
    }
  }, [
    currentTip,
    isExpanded,
    currentProcessedTip,
    isProcessing,
    handleProcessQna,
  ]);

  if (isLoading) {
    return <MyTipsCardSkeleton />;
  }

  if (!myTips || myTips.length === 0 || availableTips.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl p-1 pt-0 space-y-3">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏏</span>
          <h2 className="text-sm font-semibold text-foreground">My Tips</h2>
        </div>
        <div className="flex items-center gap-3">
          {currentTip && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnstar}
                disabled={isUnstarring}
                className="h-6 px-2 flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 rounded-full transition-all duration-200"
                title="Click to unstar this tip"
                aria-label="Unstar this tip"
              >
                {isUnstarring ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="relative group">
        <div className="overflow-hidden">
          <div className="bg-muted/30 backdrop-blur-sm rounded-xl px-1 border border-border transition-all duration-300 relative overflow-hidden hover:shadow-md">
            {availableTips.length > 0 && currentTip ? (
              <>
                <div className="flex items-start">
                  {availableTips.length > 1 && clampedTipIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevTip}
                      className="rounded-full transition-all duration-200 hover:bg-muted/50 border-0 text-primary mt-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <div
                    className="flex-1 overflow-hidden min-h-0 relative"
                    onTouchStart={handleTipTouchStart}
                    onTouchMove={handleTipTouchMove}
                    onTouchEnd={handleTipTouchEnd}
                  >
                    <div
                      className="p-4 touch-pan-y"
                      data-tip-id={currentTip.id}
                    >
                      {currentTip && (
                        <MyTipItem
                          tip={
                            currentProcessedTip ??
                            (currentTip as FavouriteTipWithQna)
                          }
                          isExpanded={isExpanded}
                          onToggleExpand={() => setIsExpanded(!isExpanded)}
                          onProcessQna={handleProcessQna}
                          isProcessing={isProcessing(currentTip.id)}
                        />
                      )}
                    </div>
                  </div>
                  {availableTips.length > 1 &&
                    clampedTipIndex < availableTips.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextTip}
                        className="rounded-full transition-all duration-200 hover:bg-muted/50 border-0 text-primary mt-3"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <Star className="h-8 w-8 text-muted-foreground/50" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      No Favourite Insights Available
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Your starred tips will appear here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyTipsSection;
