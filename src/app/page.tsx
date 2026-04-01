import Link from "next/link";
import { LandingNavbar } from "@/components/landing-navbar";
import { siteConfig } from "@/lib/site-config";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  applicationCategory: "HealthApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "One-tap water logging",
    "Personalized Hydration Score (0-100)",
    "Daily streak tracking",
    "Smart hydration reminders",
    "Offline support",
    "Privacy-first design",
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center pt-16">
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.55 0.12 230 / 0.10) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 15% 50%, oklch(0.65 0.15 210 / 0.07), transparent), radial-gradient(ellipse 60% 60% at 85% 20%, oklch(0.60 0.14 240 / 0.06), transparent)",
          }}
        />

        <div className="relative max-w-6xl mx-auto w-full px-6 py-20 lg:py-0 grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
          {/* ── Left: Text content ── */}
          <div className="space-y-8 max-w-xl">
            {/* Badge */}
            <div
              className="landing-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/40 text-sm font-medium text-sky-700 dark:text-sky-300"
              style={{ animationDelay: "0ms" }}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
              </span>
              Free forever · No credit card required
            </div>

            {/* Headline */}
            <div
              className="landing-fade-up space-y-1"
              style={{ animationDelay: "80ms" }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] font-black tracking-tight text-foreground leading-[1.04] text-balance">
                Drink smarter,
                <br />
                <span className="bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  feel your best
                </span>
              </h1>
            </div>

            <p
              className="landing-fade-up text-lg sm:text-xl text-muted-foreground leading-relaxed"
              style={{ animationDelay: "160ms" }}
            >
              HydrateTrack turns water drinking into a lasting habit — with
              one-tap logging, a real-time Hydration Score, and streaks that
              keep you accountable.
            </p>

            {/* CTAs */}
            <div
              className="landing-fade-up flex flex-col sm:flex-row gap-3 pt-1"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 h-14 px-8 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 transition-all duration-200"
              >
                Start Tracking Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl text-base border border-border/50 transition-all duration-200"
              >
                Try as Guest
              </Link>
            </div>

            {/* Trust row */}
            <div
              className="landing-fade-up flex flex-wrap gap-5 text-sm text-muted-foreground"
              style={{ animationDelay: "320ms" }}
            >
              {[
                {
                  d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                  label: "Works offline",
                },
                {
                  d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                  label: "Privacy-first",
                },
                {
                  d: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
                  label: "No setup needed",
                },
              ].map(({ d, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
                  </svg>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Floating app preview card ── */}
          <div className="hidden lg:block">
            <div className="landing-float relative">
              {/* Soft glow behind card */}
              <div className="absolute -inset-8 bg-sky-400/12 dark:bg-sky-500/8 rounded-[3rem] blur-3xl" />
              {/* Card */}
              <div className="relative w-70 bg-card/90 backdrop-blur-xl border border-border/60 rounded-[1.75rem] p-6 shadow-2xl shadow-sky-900/10 dark:shadow-black/30">
                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Today</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">Hydration Score</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/30">
                    <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
                    </svg>
                  </div>
                </div>

                {/* Score ring */}
                <div className="flex justify-center my-3">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="7" stroke="currentColor" className="text-muted/20" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        strokeWidth="7"
                        stroke="url(#heroRingGrad)"
                        strokeLinecap="round"
                        strokeDasharray="263.9"
                        strokeDashoffset="34"
                        className="landing-ring-fill"
                      />
                      <defs>
                        <linearGradient id="heroRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-foreground tabular-nums">87</span>
                      <span className="text-[10px] font-semibold text-muted-foreground tracking-wide">/ 100</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">Daily Progress</span>
                    <span className="font-semibold text-sky-600 dark:text-sky-400">1.5L / 2L</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-sky-400 to-blue-500"
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>

                <div className="border-t border-border/50 my-4" />

                {/* Log entries */}
                <div className="space-y-2">
                  {[
                    { time: "8:30 am", amount: "+250 ml", emoji: "☕" },
                    { time: "12:15 pm", amount: "+500 ml", emoji: "🥤" },
                    { time: "3:45 pm", amount: "+750 ml", emoji: "💧" },
                  ].map((log) => (
                    <div key={log.time} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{log.emoji}</span>
                        <span className="text-xs text-muted-foreground">{log.time}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{log.amount}</span>
                    </div>
                  ))}
                </div>

                {/* Streak badge */}
                <div className="mt-4 flex items-center justify-between p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/30">
                  <div className="flex items-center gap-2">
                    <span className="text-base" aria-hidden="true">🔥</span>
                    <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">12-day streak!</span>
                  </div>
                  <span className="text-[10px] text-orange-600/70 dark:text-orange-400/70">Keep it up</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-background to-transparent pointer-events-none" aria-hidden="true" />
      </section>

      {/* ── TRUST BAR ── */}
      <div className="border-y border-border/50 bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 text-sm font-medium text-muted-foreground">
            {[
              "✓  Free forever",
              "✓  No account required to start",
              "✓  Works offline",
              "✓  Your data stays yours",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES BENTO ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-3 mb-14">
            <p className="text-xs font-black tracking-[0.25em] uppercase text-sky-600 dark:text-sky-400">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground text-balance">
              Built for how you actually drink water
            </h2>
          </div>

          {/* Bento grid: 3 cols on lg */}
          {/* Row 1: [Score tall] [One-Tap] [Streak] */}
          {/* Row 2: [Score tall] [Reminders wide 2-cols] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* 1. Hydration Score — tall, spans 2 rows */}
            <div className="lg:row-span-2 relative overflow-hidden rounded-2xl bg-linear-to-br from-sky-500 to-blue-700 p-7 text-white flex flex-col">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" aria-hidden="true" />
              <div className="absolute -bottom-16 -left-6 w-36 h-36 bg-white/5 rounded-full" aria-hidden="true" />

              <div className="relative flex-1 flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold mb-2.5">Hydration Score</h3>
                <p className="text-sm text-white/75 leading-relaxed">
                  A real-time 0–100 score that measures not just how much you drink, but how well you spread it throughout the day.
                </p>

                {/* Mini score ring */}
                <div className="mt-auto pt-6 flex justify-center">
                  <div className="relative w-24 h-24" aria-hidden="true">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" stroke="white" strokeOpacity="0.2" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        strokeWidth="8"
                        stroke="white"
                        strokeLinecap="round"
                        strokeDasharray="263.9"
                        strokeDashoffset="34"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">87</span>
                      <span className="text-[10px] text-white/60 font-medium">/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. One-Tap Logging */}
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg hover:shadow-sky-500/5 transition-shadow duration-300">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5">One-Tap Logging</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log water in under a second. Quick-add buttons for your usual amounts, right on the dashboard.
              </p>
              {/* Preview buttons */}
              <div className="flex gap-2 mt-5" aria-hidden="true">
                {["250ml", "500ml", "750ml"].map((ml) => (
                  <div
                    key={ml}
                    className="flex-1 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 text-center"
                  >
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{ml}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Streak Tracking */}
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg hover:shadow-sky-500/5 transition-shadow duration-300">
              <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5">Streak Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build momentum with daily streaks. One missed day resets the clock — you won&apos;t want to stop.
              </p>
              <div className="flex items-center gap-3 mt-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/40 dark:border-rose-800/30" aria-hidden="true">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-lg font-black text-rose-600 dark:text-rose-300 leading-none">12 days</p>
                  <p className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-0.5">current streak</p>
                </div>
              </div>
            </div>

            {/* 4. Smart Reminders — wide, spans 2 cols on lg */}
            <div className="sm:col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl bg-card border border-border/60 p-6 hover:shadow-lg hover:shadow-sky-500/5 transition-shadow duration-300">
              <div className="sm:flex items-start gap-8">
                <div className="flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1.5">Smart Reminders</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Stay ahead of your goal. Get nudged during your active hours when intake is falling behind schedule.
                  </p>
                </div>
                {/* Notification preview */}
                <div className="mt-5 sm:mt-0 shrink-0 w-full sm:w-60" aria-hidden="true">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">HydrateTrack</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Time to drink! You&apos;re 300ml behind schedule 💧
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-muted/20 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <p className="text-xs font-black tracking-[0.25em] uppercase text-sky-600 dark:text-sky-400">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground text-balance">
              Up and running in 30 seconds
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div
              className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-linear-to-r from-transparent via-border to-transparent"
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {[
                {
                  step: "01",
                  title: "Set your goal",
                  desc: "Enter your weight and we calculate your ideal daily water intake — automatically.",
                },
                {
                  step: "02",
                  title: "Log as you go",
                  desc: "Tap a quick-add button every time you drink. It takes less than a second.",
                },
                {
                  step: "03",
                  title: "Watch your score",
                  desc: "Your Hydration Score updates live as you build better drinking habits day by day.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center gap-4">
                  <div className="relative z-10 w-16 h-16 rounded-full border-2 border-border bg-background flex items-center justify-center shadow-sm">
                    <span className="text-xl font-black text-sky-500">{step}</span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, oklch(0.55 0.12 230 / 0.07) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[520px] h-[280px] bg-sky-400/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground text-balance leading-[1.08]">
            Ready to feel
            <br />
            <span className="bg-linear-to-r from-sky-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              the difference?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Join HydrateTrack and start building healthier hydration habits today. Completely free, forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-14 px-10 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-lg shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 transition-all duration-200"
            >
              Get Started for Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-8 text-muted-foreground hover:text-foreground font-semibold rounded-xl text-base transition-colors duration-200"
            >
              Or try as guest →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-linear-to-br from-sky-400 to-blue-600 rounded flex items-center justify-center shadow-sm">
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
