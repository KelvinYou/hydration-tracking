import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "One-Tap Logging",
    desc: "Log water in under a second",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Hydration Score",
    desc: "See how well you hydrate each day",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    title: "Streak Tracking",
    desc: "Build consistency with daily streaks",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Smart Reminders",
    desc: "Get nudged when you fall behind",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-sky-50 via-white to-white dark:from-sky-950 dark:via-gray-950 dark:to-gray-950">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center md:text-left">
        <div className="max-w-md md:max-w-5xl mx-auto md:flex md:items-center md:gap-16 md:py-16 space-y-8 md:space-y-0">
          {/* Left side: text + CTA */}
          <div className="flex-1 space-y-8">
            {/* Logo / Icon */}
            <div className="flex justify-center md:justify-start">
              <div className="w-20 h-20 bg-linear-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white text-balance">
                HydrateTrack
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 text-balance max-w-lg">
                Track your daily water intake with a single tap. Build better hydration habits with your personal Hydration Score.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-3 md:max-w-xs">
              <Link
                href="/login"
                className="flex items-center justify-center w-full h-14 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-lg shadow-lg shadow-sky-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/30"
              >
                Get Started
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Free forever. No credit card required.
              </p>
            </div>
          </div>

          {/* Right side: Features grid */}
          <div className="flex-1 grid gap-4 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="ring-0 bg-white/80 dark:bg-gray-900/80 py-0 hover:-translate-y-0.5 transition-transform duration-200">
                <CardContent className="flex items-start gap-3 p-3 md:p-4">
                  <span className="text-sky-500 mt-0.5 shrink-0">{feature.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{feature.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>HydrateTrack &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
