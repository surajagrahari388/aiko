import { NextRequest, NextResponse } from "next/server";

const isTenantEnabled = () => process.env.ENABLE_TENANT === "true";

/**
 * Builds an APIM URL, routing through the tenant path when ENABLE_TENANT is set.
 */
export function buildApimUrl(path: string): string {
  if (isTenantEnabled()) {
    return `${process.env.APIM_URL}${process.env.FANTASY_TENANT}/tenants/${process.env.TENANT_ID_MAPPING}${path}`;
  }
  return `${process.env.APIM_URL}${process.env.FANTASY}${path}`;
}

/**
 * Fetches from APIM with the subscription key header.
 * Returns the parsed JSON on success, or a NextResponse error on failure.
 */
export async function fetchFromApim(
  path: string,
  routeLabel: string,
): Promise<{ data: Record<string, unknown> } | NextResponse> {
  const apiUrl = buildApimUrl(path);

  const response = await fetch(apiUrl, {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.APIM_SUBSCRIPTION_KEY!,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`[API] ${routeLabel} upstream error: ${response.status}`);
    return NextResponse.json(
      { error: "Upstream API error", status: response.status },
      { status: 502 },
    );
  }

  const data = await response.json();
  return { data };
}

/**
 * Injects tenantId into the response data when tenant mode is enabled.
 */
/**
 * Reads the customer-provided APIM subscription key from the incoming request header.
 * Falls back to the server's own env var when no header is present (main app).
 */
export function resolveSubscriptionKey(request: NextRequest): string {
  return (
    request.headers.get("ocp-apim-subscription-key") ||
    process.env.APIM_SUBSCRIPTION_KEY!
  );
}

export function injectTenantId<T extends Record<string, unknown>>(data: T): T {
  if (!data) return data;
  if (isTenantEnabled() && !data["tenantId"]) {
    (data as Record<string, unknown>)["tenantId"] = process.env.TENANT_ID_MAPPING;
  }
  return data;
}
