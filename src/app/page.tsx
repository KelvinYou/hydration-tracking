import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LandingNavbar } from "@/components/landing-navbar";

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "One-Tap Logging",
    desc: "Log water in under a second with quick-add buttons. No friction, no hassle.",
    gradient: "from-amber-400 to-orange-500",
    bgGlow: "bg-amber-500/10 dark:bg-amber-500/5",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Hydration Score",
    desc: "Get a personalized 0-100 score based on volume and intake distribution.",
    gradient: "from-sky-400 to-blue-600",
    bgGlow: "bg-sky-500/10 dark:bg-sky-500/5",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    title: "Streak Tracking",
    desc: "Build consistency with daily streaks. Watch your commitment grow.",
    gradient: "from-rose-400 to-pink-600",
    bgGlow: "bg-rose-500/10 dark:bg-rose-500/5",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Smart Reminders",
    desc: "Get nudged when you fall behind your hydration schedule.",
    gradient: "from-emerald-400 to-teal-600",
    bgGlow: "bg-emerald-500/10 dark:bg-emerald-500/5",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Set your goal",
    desc: "Tell us your weight and we'll calculate your ideal daily intake.",
  },
  {
    step: "02",
    title: "Log as you go",
    desc: "Tap to log every glass. It takes less than a second.",
  },
  {
    step: "03",
    title: "Track your score",
    desc: "Watch your Hydration Score improve as you build better habits.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-linear-to-b from-sky-400/20 via-sky-400/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-sky-300/15 dark:bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-64 h-64 bg-blue-300/15 dark:bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/40 text-sm font-medium text-sky-700 dark:text-sky-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            Free forever. No credit card required.
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground text-balance leading-[1.1]">
            Stay hydrated,{" "}
            <span className="bg-linear-to-r from-sky-500 via-blue-500 to-sky-600 bg-clip-text text-transparent">
              feel amazing
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            HydrateTrack helps you build better hydration habits with one-tap logging, a personalized Hydration Score, and streak tracking that keeps you motivated.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-lg shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-200"
            >
              Start Tracking
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl text-lg transition-colors duration-200"
            >
              Try as Guest
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Works offline
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy-first
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              No setup needed
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-sky-600 dark:text-sky-400">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Everything you need to stay on track
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="group relative ring-0 border-0 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/5 py-0"
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{feature.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-20 md:py-28 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-sky-600 dark:text-sky-400">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Three steps to better hydration
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.step} className="relative text-center md:text-left space-y-3">
                <span className="text-6xl font-black text-sky-500/15 dark:text-sky-400/10 select-none">
                  {step.step}
                </span>
                <h3 className="text-xl font-bold text-foreground -mt-6 relative">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-linear-to-t from-sky-400/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance leading-tight">
            Ready to feel the{" "}
            <span className="bg-linear-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              difference
            </span>
            ?
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Join HydrateTrack and start building healthier hydration habits today. It&apos;s completely free.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 h-14 px-10 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-lg shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-200"
          >
            Get Started for Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-linear-to-br from-sky-400 to-blue-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
              </svg>
            </div>
            <span>HydrateTrack &copy; {new Date().getFullYear()}</span>
          </div>
          <p>Built with care for your health.</p>
        </div>
      </footer>
    </div>
  );
}
