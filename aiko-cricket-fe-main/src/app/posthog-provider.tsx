// app/providers.tsx
"use client";

import { useEffect, useRef } from "react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

interface PostHogProviderProps {
  children: React.ReactNode;
  posthogKey: string;
  posthogHost?: string;
  tenantId?: string;
  tenantSlug?: string;
  clarity_id: string;
}

export function PostHogProvider({
  children,
  posthogKey,
  posthogHost,
  tenantId,
  tenantSlug,
  clarity_id,
}: PostHogProviderProps) {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once per session
    if (typeof window !== "undefined" && !isInitialized.current) {
      posthog.init(posthogKey, {
        api_host: posthogHost || "https://eu.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: true, // Manually control pageviews for better performance
        capture_pageleave: true,
        autocapture: false,
        before_send: (event) => {
          // PostHog's types allow `event` to be null (drop) or undefined in some edge cases.
          if (!event) return event;

          // Normalize match_id to always be a string (some callers may pass numbers).
          // Do this even when tenant metadata isn't present.
          if (event.properties?.match_id != null && typeof event.properties.match_id !== "string") {
            event.properties.match_id = String(event.properties.match_id);
          }

          // Only add tenant metadata when available.
          if (!tenantId && !tenantSlug) return event;

          // Ensure properties exists before reading/writing.
          event.properties = event.properties ?? {};

          if (tenantId && event.properties.tenant_id == null) {
            event.properties.tenant_id = tenantId;
          }

          // Custom property for tenant collection routing/segmentation.
          if (tenantSlug && event.properties.tenant_collection_key == null) {
            event.properties.tenant_collection_key = tenantSlug;
          }

          return event;
        },
      });

      // Only group when we actually have a tenantId.
      if (tenantId) {
        posthog.group("tenant", tenantId);
      }
      isInitialized.current = true;
    }
  }, [posthogKey, posthogHost, tenantId, tenantSlug, clarity_id]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
