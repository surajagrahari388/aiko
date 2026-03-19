"use client";
import { createContext, ReactNode } from "react";

export const TenantContext = createContext<{ tenantId?: string; tenantIdMapping?: string; tenantSlug?: string } | undefined>(undefined);

export function TenantProvider({ 
  tenantId, 
  tenantIdMapping, 
  tenantSlug,
  children 
}: { 
  tenantId?: string; 
  tenantSlug?: string;
  tenantIdMapping?: string;
  children: ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ tenantId, tenantIdMapping, tenantSlug }}>
      {children}
    </TenantContext.Provider>
  );
}
