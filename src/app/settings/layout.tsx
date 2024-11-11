import { Suspense } from "react";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";
import { Button } from "@/components/ui/button";
import SettingsNav from "./settings-nav";


export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex w-full gap-4">
      <div className="w-46 pt-6">
        <SettingsNav />
      </div>
      <div className="flex-1">
        <Suspense fallback={<FullLoadingSpinner />}>
          {children}
        </Suspense>
      </div>
    </main>
  );
}

