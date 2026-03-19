import { SportsMatches } from "@/lib/types";

/**
 * Types and interfaces for Sports page
 */
export interface SportsPageProps {
  params: Promise<{
    sports: string;
  }>;
}

export interface SportsPageData {
  sportsMatchesData: SportsMatches;
}

/**
 * Types and interfaces for Match Details page
 */
export interface MatchDetailsPageProps {
  params: Promise<{
    sports: string;
    matchId: string;
  }>;
}

export interface MatchPageData {
  userId: string;
  apiUrl: string;
  apimKey: string;
  apimUrl: string;
  tipsBroadcast: string;
  matchIdStr: string;
}

/**
 * Utility functions for Sports page
 */

