"use client";

import { useEffect } from "react";

type AdSenseAdProps = {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle";
  fullWidthResponsive?: boolean;
};

export default function AdSenseAd({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
}: AdSenseAdProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.adsbygoogle ??= [];
    window.adsbygoogle.push({});
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6956841821587371"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={String(fullWidthResponsive)}
    />
  );
}
