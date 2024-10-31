import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { NavBar } from "./nav-bar";
import { Suspense } from "react";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "QuickStack",
  description: "", // todo
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable
      )}>
        <NavBar />
        <main className="flex w-full flex-col items-center">
          <div className="w-full max-w-8xl px-4 lg:px-8">
            <div className="p-4 hidden flex-col md:flex">
              <Suspense fallback={<FullLoadingSpinner />}>
                {children}
              </Suspense>
            </div>
          </div>
        </main>
        <Toaster />
        <ConfirmDialog />
      </body>
    </html>
  );
}

