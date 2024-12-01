import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/frontend/utils/utils"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { NavBar } from "./nav-bar";
import { Suspense } from "react";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";
import { ConfirmDialog } from "@/components/custom/confirm-dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./sidebar";
import { cookies } from "next/headers";
import { BreadcrumbsGenerator } from "../components/custom/breadcrumbs-generator";
import { getUserSession } from "@/server/utils/action-wrapper.utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "QuickStack",
  description: "", // todo
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  const session = await getUserSession();
  const userIsLoggedIn = !!session;

  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable
      )}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <main className="flex w-full flex-col items-center">
            <div className="w-full max-w-8xl px-2 lg:px-4">
              <div className="flex-col md:flex p-6">
                {userIsLoggedIn && <BreadcrumbsGenerator />}
                <Suspense fallback={<FullLoadingSpinner />}>
                  {children}
                </Suspense>
              </div>
            </div>
          </main>
        </SidebarProvider>

        <Toaster />
        <ConfirmDialog />
      </body>
    </html>
  );
}

/*
<main className="flex w-full flex-col items-center">
          <div className="w-full max-w-8xl px-4 lg:px-8">
            <div className="p-4 flex-col md:flex">
              <Suspense fallback={<FullLoadingSpinner />}>
                {children}
              </Suspense>
            </div>
          </div>
        </main>
*/
