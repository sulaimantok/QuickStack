'use client'
import { Suspense } from "react";
import FullLoadingSpinner from "@/components/ui/full-loading-spinnter";
import { Button } from "@/components/ui/button";
import { Info, Server, Settings, Settings2, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";


export default function SettingsNav() {

    const pathname = usePathname();

    const selectedCss = `
    inline-flex gap-2 items-center w-full
    whitespace-nowrap rounded-md text-sm font-medium
    ring-offset-background transition-colors focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground
    hover:bg-secondary/80 h-10 px-4 py-2 w-full text-left
    [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`;

    const notSelectedCss = `
    inline-flex items-center gap-2 whitespace-nowrap rounded-md  w-full
    text-sm font-medium ring-offset-background transition-colors
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none
    disabled:opacity-50 hover:text-accent-foreground hover:bg-secondary/80 h-10 px-4 py-2
    [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`

    return (
        <div className="space-y-2 border-r pb-8 pr-8">
            <h3 className="font-semibold text-xl pb-4">Settings</h3>
            <div>
                <Link href="/settings/profile"> <button className={pathname === '/settings/profile' ? selectedCss : notSelectedCss}><User /> Profile</button></Link>
            </div>
            <div>
                <Link href="/settings/server"> <button className={pathname === '/settings/server' ? selectedCss : notSelectedCss}><Settings /> QuickStack Settings</button></Link>
            </div>
            <div>
                <Link href="/settings/cluster-info"> <button className={pathname === '/settings/cluster-info' ? selectedCss : notSelectedCss}><Server /> Cluster Info</button></Link>
            </div>
        </div>
    );
}

