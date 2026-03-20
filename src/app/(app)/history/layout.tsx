import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
  description:
    "Review your hydration history, daily trends, and long-term progress over time.",
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
