import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Search Assistant for Marwen Slimen",
  description:
    "Curated on-site marketing job opportunities in Europe that match Marwen Slimen's profile and visa sponsorship goals."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
