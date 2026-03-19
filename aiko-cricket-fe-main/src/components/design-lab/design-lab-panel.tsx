"use client";

import React, { useState } from "react";
import { FlaskConical, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDesignVariants } from "@/contexts/design-variant-context";
import { DESIGN_VARIANT_REGISTRY } from "@/lib/design-variants";

export default function DesignLabPanel() {
  const { enabled, variants, setVariant, resetAll } = useDesignVariants();
  const [expanded, setExpanded] = useState(false);

  if (!enabled) return null;

  // Bottom-right: above bottom nav, pushed higher for Design C (score bar + ball-by-ball)
  const isDesignC = variants["match-navbar"] === "C";
  const positionClass = isDesignC
    ? "bottom-56 right-4"
    : "bottom-20 right-4";

  // Collapsed: small icon-only circle
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={`fixed ${positionClass} z-50 flex items-center justify-center w-8 h-8 bg-background/95 backdrop-blur-sm border border-border rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer`}
      >
        <FlaskConical className="h-4 w-4 text-primary" />
      </button>
    );
  }

  // Expanded panel
  return (
    <div className={`fixed ${positionClass} z-50 w-72 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <FlaskConical className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Design Lab</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={resetAll}
            title="Reset all to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setExpanded(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Component areas */}
      <div className="px-3 py-2 space-y-3">
        {DESIGN_VARIANT_REGISTRY.map((config) => (
          <div key={config.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {config.label}
              </span>
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {variants[config.id] ?? config.defaultVariant}
              </span>
            </div>
            <ToggleGroup
              type="single"
              value={variants[config.id] ?? config.defaultVariant}
              onValueChange={(val) => {
                if (val) {
                  setVariant(config.id, val);
                  setExpanded(false);
                }
              }}
              className="justify-start"
            >
              {config.variants.map((v) => (
                <ToggleGroupItem
                  key={v}
                  value={v}
                  size="sm"
                  className="h-7 px-3 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {v}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        ))}
      </div>
    </div>
  );
}
