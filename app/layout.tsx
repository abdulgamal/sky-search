import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkySearch | Modern Flight Search Engine",
  description:
    "Find and book flights with real-time price tracking and smart filters",
  keywords: ["flights", "travel", "airfare", "flight search", "booking"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-linear-to-b from-background to-muted/20`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container-custom py-6 md:py-8">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
