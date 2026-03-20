import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Customize your daily water goal, preferred units, active hours, and reminder preferences.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
