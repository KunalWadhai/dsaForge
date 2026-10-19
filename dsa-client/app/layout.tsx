import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSA Forge — Think deeper. Solve smarter.",
  description: "A grounded AI companion for data structures and algorithms.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
