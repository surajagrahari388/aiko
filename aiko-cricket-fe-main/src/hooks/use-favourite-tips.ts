"use client";

import { useAction } from "next-safe-action/hooks";
import { GetFavouriteTipsAction } from "@/server/personalised-tip";
import { useEffect } from "react";

export const useFavouriteTips = (user_id: string | undefined) => {
  const {
    execute: executeGetFavouriteTips,
    result,
    isExecuting: isLoading,
    hasSucceeded,
    hasErrored,
  } = useAction(GetFavouriteTipsAction, {
    onError: (error) => {
      console.error("Failed to fetch favourite tips:", error);
    },
  });

  // Auto-fetch favourite tips when user_id is available
  useEffect(() => {
    if (user_id) {
      executeGetFavouriteTips({ user_id });
    }
  }, [user_id, executeGetFavouriteTips]);

  return {
    favouriteTips: result?.data,
    isLoading,
    hasSucceeded,
    hasErrored,
    refetchFavouriteTips: () => {
      if (user_id) {
        executeGetFavouriteTips({ user_id });
      }
    },
  };
};