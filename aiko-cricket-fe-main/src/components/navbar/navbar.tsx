"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoBack from "@/components/layout/go-back";
import LanguageToggle from "@/components/language-select/language-toggle";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import MatchStatusFilter from "@/components/match-filters/match-status-filter";
import { useMatchFilter } from "@/contexts/match-filter-context";
import { useLanguage } from "@/contexts/language-context";
import AikoLogo from "../ui/svg/aiko-logo";
import Aikologo2 from "../ui/svg/aiko-logo-2";

interface NavbarProps {
  showAllLanguages?: boolean;
  AUTH_AUTH0_ID: string;
  AUTH0_ISSUER: string;
  matchTitle?: string;
  liveMatchesCount?: number;
}

export default function Navbar({
  showAllLanguages,
  AUTH_AUTH0_ID,
  AUTH0_ISSUER,
  matchTitle,
  liveMatchesCount = 0,
}: NavbarProps) {
  const { data: session, status, update } = useSession();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language } = useLanguage();

  const user = session?.user;
  const userLoading = status === "loading";

  const handleLogout = () => {
    signOut({ redirect: false }).then(() => {
      update();
      window.location.href = `${AUTH0_ISSUER}v2/logout?client_id=${AUTH_AUTH0_ID}&returnTo=${encodeURIComponent(
        window.location.origin
      )}`;
    });
  };

  // Check if we're on a match details page to show the match title
  const isMatchDetailsPage =
    pathname?.startsWith("/cricket/") && pathname !== "/cricket";
  const isCricketPage = pathname === "/cricket";
  const showBackButton =
    pathname !== "/cricket" &&
    pathname !== "/login" &&
    pathname !== "/maintenance";

  // Match filter context - may be undefined if not wrapped in MatchFilterProvider
  const matchFilterContext = useMatchFilter();
  const selectedStatus = matchFilterContext?.selectedStatus || "all";
  const setSelectedStatus = matchFilterContext?.setSelectedStatus || (() => {});

  // Auto-close mobile menu when filters change
  const handleFilterChange = (status: "all" | "live" | "today" | "tomorrow") => {
    setSelectedStatus(status);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when language changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [language]);

  return (
    <>
    <nav className="text-foreground sticky top-0 z-50 bg-navbar-grey backdrop-blur-sm shadow-sm">
      <div className="container mx-auto md:px-2 sm:px-6 lg:px-6 px-3">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back button or AIKO Logo + Match filters (desktop only) */}
          <div className="flex items-center gap-1 sm:gap-3 flex-1">
            {showBackButton ? (
              <>
                <GoBack />
                <Link href="/cricket" className="flex items-center hover:opacity-80 transition-opacity">
                  <Aikologo2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </Link>
              </>
            ) : isCricketPage ? (
              <>
                {/* AIKO Logo */}
                <Link href="/cricket" className="flex items-center mr-2 sm:mr-4 flex-shrink-0 hover:opacity-80 transition-opacity">
                 <AikoLogo />
                </Link>
                {/* Match filters - hidden on mobile, shown on md+ screens */}
                <div className="hidden md:block flex-1">
                  <MatchStatusFilter
                    selectedStatus={selectedStatus}
                    onSelect={setSelectedStatus}
                    liveMatchesCount={liveMatchesCount}
                  />
                </div>
              </>
            ) : null}
          </div>

          {/* Center: Title on match details */}
          <div className="flex-1 flex justify-center items-center">
            {isMatchDetailsPage && matchTitle && (
              <h2 className="text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] text-center md:block hidden">
                {matchTitle}
              </h2>
            )}
          </div>

          {/* Right: Menu, Settings/Language */}
          <div className="flex items-center gap-2">
            {pathname !== "/settings" && (
              <div className="md:hidden flex items-center gap-1">
                {isCricketPage && (
                  <LanguageToggle showAllLanguages={showAllLanguages} compact />
                )}
                <DropdownMenu key={language} open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 ml-4">
                    <div className="flex flex-col gap-1 p-2">
                      {/* Match Filters - only on cricket page and mobile */}
                      {isCricketPage && (
                        <>
                          <div className="px-2 py-1 text-sm font-medium text-muted-foreground border-b border-border mb-2">
                            Match Filters
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                              onClick={() => handleFilterChange("all")}
                              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                selectedStatus === "all"
                                  ? "bg-primary text-white"
                                  : "hover:bg-accent text-foreground"
                              }`}
                            >
                              All
                            </button>
                            {liveMatchesCount > 0 && (
                              <button
                                onClick={() => handleFilterChange("live")}
                                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-1.5 ${
                                  selectedStatus === "live"
                                    ? "bg-primary text-white"
                                    : "hover:bg-accent text-foreground"
                                }`}
                              >
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live
                              </button>
                            )}
                            <button
                              onClick={() => handleFilterChange("today")}
                              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                selectedStatus === "today"
                                  ? "bg-primary text-white"
                                  : "hover:bg-accent text-foreground"
                              }`}
                            >
                              Today
                            </button>
                            <button
                              onClick={() => handleFilterChange("tomorrow")}
                              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                selectedStatus === "tomorrow"
                                  ? "bg-primary text-white"
                                  : "hover:bg-accent text-foreground"
                              }`}
                            >
                              Tomorrow
                            </button>
                          </div>
                        </>
                      )}

                      {/* Language Toggle - inside menu for non-cricket pages */}
                      {!isCricketPage && pathname !== "/login" && pathname !== "/maintenance" && (
                        <div className="flex justify-center border-b pb-1 mb-1">
                          <LanguageToggle showAllLanguages={showAllLanguages} />
                        </div>
                      )}

                      {/* Settings Section */}
                      {pathname !== "/login" && pathname !== "/maintenance" && (
                        <DropdownMenuItem asChild className="p-2">
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 w-full text-sm hover:bg-accent"
                          >
                            <Settings className="h-5 w-5" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Desktop Settings/Language */}
            {pathname !== "/settings" && (
              <div className="hidden md:flex items-center gap-1 lg:gap-2">
                {pathname !== "/login" && pathname !== "/maintenance" && (
                  <>
                    <LanguageToggle showAllLanguages={showAllLanguages} />
                  </>
                )}
                {userLoading ? <></> : user ? <></> : <></>}
                {pathname !== "/login" && pathname !== "/maintenance" && (
                  <Link
                    href="/settings"
                    className="text-sm text-foreground hover:text-foreground/80"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                {userLoading ? null : user ? null : (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground px-3 lg:px-4 py-2 rounded-full hover:bg-primary/90 bg-primary text-sm"
                  >
                    <Link href="/api/auth/signin">Login</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out from Aiko Cricket?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLogoutDialogOpen(false);
                handleLogout();
              }}
              className="flex-1 sm:flex-none"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}