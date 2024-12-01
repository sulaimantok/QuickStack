'use client';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/frontend/states/zustand.states";
import { useEffect } from "react";

export default function ServerBreadcrumbs() {
    const { setBreadcrumbs } = useBreadcrumbs();
    useEffect(() => setBreadcrumbs([
        { name: "Settings", url: "/settings/profile" },
        { name: "QuickStack Server" },
    ]), []);
    return <></>;
}