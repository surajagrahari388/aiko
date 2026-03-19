import MatchesClient from "@/components/match-card/match-card-client";
import NavbarWithData from "@/components/navbar/navbar-with-data";
import { MatchFilterProvider } from "@/contexts/match-filter-context";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches | Aiko Cricket",
};

// Server-side data fetching
async function getMatches() {
  try {
    const isTenantEnabled = process.env.ENABLE_TENANT === "true";

    const apiUrl = isTenantEnabled
      ? `${process.env.APIM_URL}${process.env.FANTASY_TENANT}/tenants/${process.env.TENANT_ID_MAPPING}/cricket/matches`
      : `${process.env.APIM_URL}${process.env.FANTASY}/cricket/matches`;
    const response = await fetch(apiUrl, {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.APIM_SUBSCRIPTION_KEY!,
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching matches:", error);
    return null;
  }
}

export default async function SportsPage() {
  const showAllLanguages = process.env.SHOW_ALL_LANGUAGES === "true";
  const authAuth0Id = process.env.AUTH_AUTH0_ID || "";
  const auth0Issuer = process.env.AUTH0_ISSUER || "";
  const matchesLimit = Number(process.env.MATCHES_LIMIT) || 3;
  
  const initialMatches = await getMatches();

  return (
    <MatchFilterProvider>
      <NavbarWithData
        showAllLanguages={showAllLanguages}
        AUTH_AUTH0_ID={authAuth0Id}
        AUTH0_ISSUER={auth0Issuer}
      />
      <div className="min-h-screen bg-background container mx-auto md:px-2 sm:px-4 lg:px-6 px-3">
        <MatchesClient initialData={initialMatches} matchesLimit={matchesLimit} />
      </div>
    </MatchFilterProvider>
  );
}
