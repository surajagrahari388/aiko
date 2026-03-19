"use client";

import React from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LogIn } from "lucide-react";
import Aikologo2 from "@/components/ui/svg/aiko-logo-2";
import AdSenseAd from "@/components/google-adsense/adsense";

const LoginComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/cricket");
    }
    // Only run when status changes, not on every session update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSignIn = () => {
    setIsLoading(true);
    signIn("auth0", { callbackUrl: "/cricket" });
  };

  const handleSignInWithPhone = () => {
    setIsLoading(true);
    signIn(
      "auth0",
      { callbackUrl: "/cricket" },
      {
        connection: "sms",
      },
    );
  };

  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0 : undefined;

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/5 w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-52 lg:h-52 from-primary/15 to-primary/8 rounded-full blur-xl sm:blur-2xl animate-pulse delay-300" />
          <div className="absolute bottom-1/3 right-1/5 w-24 h-24 sm:w-36 sm:h-36 md:w-52 md:h-52 lg:w-72 lg:h-72 from-primary/12 to-primary/6 rounded-full blur-xl sm:blur-2xl animate-pulse delay-700" />
          <div className="absolute top-1/2 right-1/3 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 from-primary/10 to-primary/8 rounded-full blur-lg sm:blur-xl animate-pulse delay-1200" />

          {/* Floating dots */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-primary/60 rounded-full animate-bounce delay-500" />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary/50 rounded-full animate-bounce delay-1000" />
          <div className="absolute top-2/3 left-1/4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary/70 rounded-full animate-ping delay-800" />
        </div>

        <div className="flex flex-col max-w-3xl w-full gap-6 relative z-10">
          {/* Right Panel - Login */}
          <div className="flex-1 p-8 sm:p-10 flex items-center justify-center h-full">
            <m.div
              initial={reducedMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur ?? 0.6 }}
              className="space-y-8 w-full max-w-sm text-center"
            >
              {/* Aiko Logo */}
              <m.div
                initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: dur ?? 0.8, delay: reducedMotion ? 0 : 0.2 }}
                className="flex justify-center"
              >
                <Aikologo2 />
              </m.div>

              {/* Buttons */}
              <div className="space-y-4">
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] transition-[background-color,box-shadow,transform] duration-200 ease-out will-change-transform origin-center"
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <m.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <LogIn className="w-5 h-5" />
                  )}
                  {isLoading ? "Signing in..." : "Continue with Email"}
                </Button>
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] transition-[background-color,box-shadow,transform] duration-200 ease-out will-change-transform origin-center"
                  onClick={handleSignInWithPhone}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <m.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <LogIn className="w-5 h-5" />
                  )}
                  {isLoading ? "Signing in..." : "Continue with Phone Number"}
                </Button>
              </div>

              {/* Google AdSense Ad */}
              <AdSenseAd adSlot="2478642763" adFormat="auto" />
            </m.div>
          </div>
        </div>

        {/* Corner decorative elements */}
        <div className="absolute top-8 left-8 w-3 h-3 sm:w-4 sm:h-4 from-primary/60 to-primary/80 rounded-full opacity-60 animate-pulse" />
        <div className="absolute bottom-8 right-8 w-2 h-2 sm:w-3 sm:h-3 from-primary/50 to-primary/70 rounded-full opacity-50 animate-pulse delay-500" />
      </div>
    </LazyMotion>
  );
};

export default LoginComponent;
