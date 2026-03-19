import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Footer } from "@/components/layout/footer";
import { PreloaderWrapper } from "@/components/layout/preloader-wrapper";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/language-context";

import { getLanguage } from "@/lib/language-server";
import { TenantProvider } from "@/contexts/analytics-context";
import AnalyticsIdentityProvider from "@/components/analytics/analytics-identity-provider";
import { PostHogProvider } from "@/app/posthog-provider";
import { SessionProvider } from "next-auth/react";
import { AudioPlaybackProvider } from "@/contexts/audio-playback-context";
import { DesignVariantProvider } from "@/contexts/design-variant-context";
import DesignLabPanel from "@/components/design-lab/design-lab-panel";
import { MaintenanceBanner } from "@/components/layout/maintenance-banner";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aiko Cricket",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  description:
    "Aiko transforms sports statistics into real-time AI-powered insights that boost engagement, retention, and in-play decision-making across sports platforms.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLanguage = await getLanguage();
  const showDesignLab = ["dev", "test"].includes(
    (process.env.ENVIRONMENT || "").toLowerCase()
  );
  const showMaintenanceBanner = process.env.SHOW_MAINTENANCE_BANNER === "true";
  const maintenanceBannerMessage = process.env.MAINTENANCE_BANNER_MESSAGE;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6956841821587371"
            crossOrigin="anonymous"
          />
        )}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XPE8772MP2"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XPE8772MP2');`}
        </Script>
      </head>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        {showMaintenanceBanner && maintenanceBannerMessage && (
          <MaintenanceBanner message={maintenanceBannerMessage} />
        )}
        <SessionProvider>
          <TenantProvider
            tenantId={process.env.TENANT_ID}
            tenantSlug={process.env.TENANT_SLUG}
            tenantIdMapping={process.env.TENANT_ID_MAPPING}
          >
            <PostHogProvider
              posthogKey={process.env.POSTHOG_KEY!}
              posthogHost={process.env.POSTHOG_HOST}
              tenantId={process.env.TENANT_ID}
              tenantSlug={process.env.TENANT_SLUG}
              clarity_id={process.env.CLARITY_PROJECT_ID!}
            >
              <AnalyticsIdentityProvider>
                <LanguageProvider initialLanguage={initialLanguage}>
                    <ReactQueryProvider>
                      <AudioPlaybackProvider>
                        <DesignVariantProvider enabled={showDesignLab}>
                          <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem
                            disableTransitionOnChange
                          >
                            <PreloaderWrapper>
                              {children}
                              {/* <Footer /> */}
                              <Toaster />
                              <DesignLabPanel />
                            </PreloaderWrapper>
                          </ThemeProvider>
                        </DesignVariantProvider>
                      </AudioPlaybackProvider>
                    </ReactQueryProvider>
                </LanguageProvider>
              </AnalyticsIdentityProvider>
            </PostHogProvider>
          </TenantProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
