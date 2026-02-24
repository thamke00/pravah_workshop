import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pravah Homes | Navi Mumbai Property Price Predictor",
  description:
    "AI-powered house price prediction for Navi Mumbai. Get instant, accurate property valuations using our Gradient Boosting ML model trained on 2,500+ real estate listings.",
  keywords: "navi mumbai property price, house price prediction, kharghar, nerul, real estate AI",
  openGraph: {
    title: "Pravah Homes — Navi Mumbai Price Predictor",
    description: "AI-powered property valuation for Navi Mumbai.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="gradient-bg min-h-screen font-sans antialiased" suppressHydrationWarning>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
