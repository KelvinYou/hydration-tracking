"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/api";
import { isGuestMode, hasCompletedGuestOnboarding } from "@/lib/guest-storage";
import { Avatar } from "@/components/ui/avatar";

export function LandingNavbar() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const user = await getUser();
      const guest = isGuestMode();
      return { user, guest };
    },
  });

  const user = data?.user ?? null;
  const guest = data?.guest ?? false;
  const isLoggedIn = user || guest;
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || (guest ? "Guest" : null);
  const avatarUrl = user?.user_metadata?.avatar_url;
  const dashboardHref = isLoggedIn
    ? hasCompletedGuestOnboarding() || user
      ? "/dashboard"
      : "/onboarding"
    : "/login";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-950/70 border-b border-white/20 dark:border-white/5">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-linear-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:shadow-lg group-hover:shadow-sky-500/30 transition-shadow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-foreground">HydrateTrack</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-24 h-9 rounded-lg bg-muted animate-pulse" />
          ) : isLoggedIn ? (
            <Link
              href={dashboardHref}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
            >
              <Avatar
                src={avatarUrl}
                fallback={displayName ?? undefined}
                size="sm"
                className="ring-2 ring-sky-500/20"
              />
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                {displayName}
              </span>
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm shadow-sky-500/20 hover:shadow-md hover:shadow-sky-500/30 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
