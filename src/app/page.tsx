import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md mx-auto space-y-8">
          {/* Logo / Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              HydrateTrack
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Track your daily water intake with a single tap. Build better hydration habits with your personal Hydration Score.
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-4 text-left">
            {[
              { icon: "⚡", title: "One-Tap Logging", desc: "Log water in under a second" },
              { icon: "📊", title: "Hydration Score", desc: "See how well you hydrate each day" },
              { icon: "🔥", title: "Streak Tracking", desc: "Build consistency with daily streaks" },
              { icon: "🔔", title: "Smart Reminders", desc: "Get nudged when you fall behind" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{feature.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-4">
            <Link
              href="/login"
              className="block w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-center text-lg transition-colors"
            >
              Get Started
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Free forever. No credit card required.
            </p>
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
