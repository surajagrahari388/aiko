import { useState, useCallback, useEffect } from "react";

interface UseTipNavigationOptions {
  totalTips: number;
  minSwipeDistance?: number;
}

interface UseTipNavigationReturn {
  currentTipIndex: number;
  navigateToTip: (index: number) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function useTipNavigation({
  totalTips,
  minSwipeDistance = 50,
}: UseTipNavigationOptions): UseTipNavigationReturn {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (totalTips > 0) {
      setCurrentTipIndex(prev => (prev >= totalTips ? totalTips - 1 : prev));
    }
  }, [totalTips]);

  const navigateToTip = useCallback((nextIndex: number) => {
    setCurrentTipIndex(nextIndex);
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentTipIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "ArrowRight") {
        setCurrentTipIndex(prev => (prev < totalTips - 1 ? prev + 1 : 0));
      }
    },
    [totalTips],
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentTipIndex(prev => (prev < totalTips - 1 ? prev + 1 : prev));
    }
    if (isRightSwipe) {
      setCurrentTipIndex(prev => (prev > 0 ? prev - 1 : prev));
    }
  }, [touchStart, touchEnd, minSwipeDistance, totalTips]);

  return {
    currentTipIndex,
    navigateToTip,
    onKeyDown,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
