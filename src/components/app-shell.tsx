"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

interface AppShellProps {
  children: React.ReactNode;
  activeTab?: string;
}

export function AppShell({ children, activeTab }: AppShellProps) {
  const pathname = usePathname();
  const current = activeTab || pathname;

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 border-r border-border bg-card/60">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
            </svg>
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">
            HydrateTrack
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = current === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className={isActive ? "text-sky-500" : "text-muted-foreground"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HydrateTrack
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 md:ml-60 min-h-screen">
        {children}
      </div>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border safe-area-pb z-20"
        style={{ boxShadow: "0 -1px 0 0 var(--border)" }}
      >
        <div className="max-w-lg mx-auto flex">
          {NAV_ITEMS.map((item) => {
            const isActive = current === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors duration-150 ${
                  isActive
                    ? "text-sky-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="w-6 h-6 [&>svg]:w-6 [&>svg]:h-6">{item.icon}</span>
                <span className={`text-[10px] font-semibold ${isActive ? "text-sky-500" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
