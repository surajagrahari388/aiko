"use client";

import React, { useRef } from "react";

type TipsCategoryFilterProps = {
  categories: string[];
  hasLiveTips: boolean;
  selectedCategory: string;
  onSelect: (category: string) => void;
  getCategoryDisplayName: (categoryName: string) => string;
  isQnaUnavailable?: boolean;
  mytipsCount?: number;
  showMatchTips?: boolean;
};

const TipsCategoryFilter: React.FC<TipsCategoryFilterProps> = ({
  categories,
  hasLiveTips,
  selectedCategory,
  onSelect,
  getCategoryDisplayName,
  isQnaUnavailable,
  mytipsCount,
  showMatchTips = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCategorySelect = (category: string, event: React.MouseEvent<HTMLButtonElement>) => {
    onSelect(category);
    
    // Scroll the clicked button into view with smooth animation
    const button = event.currentTarget;
    if (containerRef.current && button) {
      const container = containerRef.current;
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate the position to center the button in the container
      const buttonCenter = buttonRect.left + buttonRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;
      const scrollOffset = buttonCenter - containerCenter;
      
      container.scrollTo({
        left: container.scrollLeft + scrollOffset,
        behavior: 'smooth'
      });
    }
  };
  if (categories.length === 0 && !hasLiveTips) return null;

  const baseButtonClasses =
    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap";
  const activeClasses = "bg-[#a6171b] text-white";
  const inactiveClasses =
    "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <div className="sticky top-[57px] z-20 bg-background/95 backdrop-blur-md -mx-2 sm:-mx-4 px-2 sm:px-4 pt-0">
      <div ref={containerRef} className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
        <button
          onClick={(e) => handleCategorySelect("all", e)}
          className={`${baseButtonClasses} ${
            selectedCategory === "all" ? activeClasses : inactiveClasses
          }`}
        >
          Pre Game Insights
        </button>

        <button
          onClick={(e) => handleCategorySelect("ask-aiko", e)}
          className={`${baseButtonClasses} ${
            selectedCategory === "ask-aiko" ? activeClasses : inactiveClasses
          }`}
        >
          Ask Aiko
        </button>

        {!isQnaUnavailable && (mytipsCount ?? 0) > 0 && (
          <button
            onClick={(e) => handleCategorySelect("my-tips", e)}
            className={`${baseButtonClasses} ${
              selectedCategory === "my-tips" ? activeClasses : inactiveClasses
            }`}
          >
            My Insights
          </button>
        )}

        {hasLiveTips && (
          <button
            onClick={(e) => handleCategorySelect("live", e)}
            className={`${baseButtonClasses} flex items-center gap-1.5 ${
              selectedCategory === "live" ? activeClasses : inactiveClasses
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            In Game Insights
          </button>
        )}

        {showMatchTips && (
          <button
            onClick={(e) => handleCategorySelect("match-tips", e)}
            className={`${baseButtonClasses} ${
              selectedCategory === "match-tips" ? activeClasses : inactiveClasses
            }`}
          >
            Match Insights
          </button>
        )}

        {categories.map((category) => (
          <button
            key={category}
            onClick={(e) => handleCategorySelect(category, e)}
            className={`${baseButtonClasses} ${
              selectedCategory === category ? activeClasses : inactiveClasses
            }`}
          >
            {getCategoryDisplayName(category)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TipsCategoryFilter;
