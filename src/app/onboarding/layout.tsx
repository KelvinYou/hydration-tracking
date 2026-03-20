import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
  description:
    "Set your weight, daily water goal, and preferences to get a personalized hydration plan.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
