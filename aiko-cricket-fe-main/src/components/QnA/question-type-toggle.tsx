"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestionTypeToggleProps {
  onTypeChange: (type: "match" | "general") => void;
  defaultType?: "match" | "general";
}

export default function QuestionTypeToggle({
  onTypeChange,
  defaultType = "match",
}: QuestionTypeToggleProps) {
  const [activeType, setActiveType] = React.useState<"match" | "general">(
    defaultType
  );

  const handleTypeChange = (type: "match" | "general") => {
    setActiveType(type);
    onTypeChange(type);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-2">
        <Button
          variant={activeType === "match" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeChange("match")}
          className={cn(
            "transition-all duration-200",
            activeType === "match"
              ? "bg-primary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Questions From This Match
        </Button>
        <Button
          variant={activeType === "general" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeChange("general")}
          className={cn(
            "transition-all duration-200",
            activeType === "general"
              ? "bg-primary text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          General Questions
        </Button>
      </div>
    </div>
  );
}
