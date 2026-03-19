"use client";

import { useCallback, useMemo, FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/language-context";
import { languageAdapter } from "@/lib/language-adapter";
import { SupportedLanguage } from "@/lib/language";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

const SettingsPage: FC<{
  SHOW_ALL_LANGUAGES: boolean | undefined;
}> = ({ SHOW_ALL_LANGUAGES }) => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const availableLanguages = useMemo(() => {
    return languageAdapter.getLanguagesForEnvironment(SHOW_ALL_LANGUAGES);
  }, [SHOW_ALL_LANGUAGES]);

  const displayName = user?.nickname || user?.name || "User";
  const email = user?.email || "No email provided";
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleLanguageChange = useCallback(
    (newLanguage: string) => {
      setLanguage(newLanguage as SupportedLanguage);
    },
    [setLanguage]
  );

  const handleThemeChange = useCallback(
    (newTheme: string) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-3 sm:px-4 md:px-2 lg:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            Welcome, {displayName}
          </h1>
        </div>

        <Tabs defaultValue="settings" className="">
          <TabsList className="h-auto p-0 bg-transparent rounded-none justify-start mb-6 sm:mb-8">
            <TabsTrigger
              value="account"
              className="pb-3 sm:pb-4 pt-0 px-0 mr-6 sm:mr-8 bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors rounded-none font-medium whitespace-nowrap data-[state=active]:shadow-none text-sm sm:text-base"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="pb-3 sm:pb-4 pt-0 px-0 mr-6 sm:mr-8 bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors rounded-none font-medium whitespace-nowrap data-[state=active]:shadow-none text-sm sm:text-base"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 max-w-2xl">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 shrink-0">
                <AvatarImage
                  src={user?.image || ""}
                  alt={user?.name || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl sm:text-2xl md:text-3xl bg-muted text-muted-foreground font-semibold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4 sm:space-y-5 text-center sm:text-left w-full">
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
                    {displayName}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground break-all">
                    {email}
                  </p>
                </div>

                <Button
                  onClick={handleSignOut}
                  className="w-full sm:w-auto h-10 sm:h-11 px-6 sm:px-8 bg-linear-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg border-0"
                >
                  Logout
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-2 sm:mt-3">
            <section className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-5 md:mb-6 text-foreground">
                Language
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {availableLanguages.map((lang) => {
                  const isSelected = mounted && language === lang.value;
                  return (
                    <button
                      key={lang.value}
                      onClick={() => handleLanguageChange(lang.value)}
                      className={`relative p-3 sm:p-4 rounded-lg border transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-muted-foreground hover:bg-accent/50"
                      }`}
                    >
                      <span className="block text-sm sm:text-base font-medium text-foreground">
                        {lang.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-5 md:mb-6 text-foreground">
                Display mode
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md">
                {THEME_OPTIONS.map((themeOption) => {
                  const isSelected = mounted && theme === themeOption.value;
                  return (
                    <button
                      key={themeOption.value}
                      onClick={() => handleThemeChange(themeOption.value)}
                      className={`relative p-3 sm:p-4 rounded-lg border transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-muted-foreground hover:bg-accent/50"
                      }`}
                    >
                      <span className="block text-sm sm:text-base font-medium text-foreground">
                        {themeOption.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default SettingsPage;
