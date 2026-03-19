"use client";

import { useState, useMemo } from "react";
import TermsCardPage1 from "./terms-card-page-1";
import TermsCardPage2 from "./terms-card-page-2";
import TermsCardPage3 from "./terms-card-page-3";
import TermsCardPage4 from "./terms-card-page-4";
import TermsCardPage5 from "./terms-card-page-5";

interface TermsCard {
  title: string;
  content: React.ReactNode;
}

export default function TermsNavigationWrapper() {
  const cards: TermsCard[] = useMemo(
    () => [
      {
        title: "These Terms of Use Are a Contract Between You and Us",
        content: <TermsCardPage1 />,
      },
      { 
        title: "Page 2", 
        content: <TermsCardPage2 />
      },
      { 
        title: "Page 3", 
        content: <TermsCardPage3 />
      },
      { 
        title: "Page 4", 
        content: <TermsCardPage4 />
       },
      { 
        title: "Page 5", 
        content: <TermsCardPage5 />
      },
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const current = cards[currentIndex];

  return (
    <div className="rounded-2xl border bg-card/60 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-8 py-6 sm:py-7 border-b bg-linear-to-b from-muted/40 to-transparent">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Terms of Service</h1>
      </div>

      <div className="px-4 sm:px-8 py-5 sm:py-6">{current.content}</div>

      <div className="px-4 sm:px-8 pb-6 sm:pb-7">
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center items-center gap-2">
            {cards.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={[
                  "text-xs rounded-full border px-3 py-1 transition-colors min-w-9",
                  currentIndex === index ? "bg-foreground text-background" : "hover:bg-muted/60",
                ].join(" ")}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}