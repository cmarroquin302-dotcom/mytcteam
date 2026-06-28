import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "myTCteam — Real Estate Transaction Coordination",
    template: "%s | myTCteam",
  },
  description:
    "Professional transaction coordination for real estate agents and brokerage teams. We handle paperwork, deadlines, and communication from contract to close.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
