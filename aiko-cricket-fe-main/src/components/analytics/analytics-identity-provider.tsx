"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useSession } from "next-auth/react";

interface AnalyticsIdentityProviderProps {
  children: React.ReactNode;
}

const AnalyticsIdentityProvider: React.FC<AnalyticsIdentityProviderProps> = ({
  children,
}) => {
  const { data: session, status } = useSession();

  // User and loading flags for rendering profile section
  const user = session?.user;
  const userLoading = status === "loading";
  const lastIdentifiedUser = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      // console.log("[CleverTapProvider] Not running in browser, skipping.");
      return;
    }
    if (userLoading) {
      // console.log("[CleverTapProvider] Auth0 user is loading...");
      return;
    }
    if (!user) {
      // console.log("[CleverTapProvider] No Auth0 user found.");
      return;
    }
    if (!user.sub) {
      // console.log("[CleverTapProvider] Auth0 user.sub is missing.");
      return;
    }

    if (lastIdentifiedUser.current !== user.sub) {
      posthog.identify(user.sub, {
        email: user.email,
        name: user.name,
      });
      lastIdentifiedUser.current = user.sub;
    }
  }, [user, userLoading]);

  return <>{children}</>;
};

export default AnalyticsIdentityProvider;
