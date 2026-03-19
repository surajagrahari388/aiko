import Navbar from "@/components/navbar/navbar";
import CompetitionClient from "@/components/competition-client";
import { MatchFilterProvider } from "@/contexts/match-filter-context";
import { Metadata } from "next";
import { SportsMatches } from "@/lib/types";

export const metadata: Metadata = {
  title: "Matches | Aiko Cricket",
};

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface CompetitionPageProps {
  params: Promise<{
    competitionId: string;
  }>;
}

async function getCompetitionMatches(competitionId: string): Promise<SportsMatches> {
  const apiUrl = `${process.env.APIM_URL}${process.env.FANTASY}/cricket/competition/${competitionId}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.APIM_SUBSCRIPTION_KEY!,
    },
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch competition matches");
  }

  return response.json();
}

export default async function CompetitionPage({
  params,
}: CompetitionPageProps) {
  const { competitionId } = await params;
  const showAllLanguages = process.env.SHOW_ALL_LANGUAGES === "true";
  const authAuth0Id = process.env.AUTH_AUTH0_ID || "";
  const auth0Issuer = process.env.AUTH0_ISSUER || "";

  try {
    const initialData = await getCompetitionMatches(competitionId);

    return (
      <MatchFilterProvider>
        <Navbar
          showAllLanguages={showAllLanguages}
          AUTH_AUTH0_ID={authAuth0Id}
          AUTH0_ISSUER={auth0Issuer}
        />
        <div className="min-h-screen bg-background container mx-auto md:px-2 sm:px-4 lg:px-6 px-3">
          <CompetitionClient competitionId={competitionId} initialData={initialData} />
        </div>
      </MatchFilterProvider>
    );
  } catch (error) {
    console.error("Error fetching competition matches:", error);
    return (
      <MatchFilterProvider>
        <Navbar
          showAllLanguages={showAllLanguages}
          AUTH_AUTH0_ID={authAuth0Id}
          AUTH0_ISSUER={auth0Issuer}
        />
        <div className="min-h-screen bg-background container mx-auto md:px-2 sm:px-4 lg:px-6 px-3">
          <CompetitionClient competitionId={competitionId} />
        </div>
      </MatchFilterProvider>
    );
  }
}
