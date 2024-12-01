'use client';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { deactivate2fa } from "./actions";
import { Toast } from "@/frontend/utils/toast.utils";
import TotpCreateDialog from "./totp-create-dialog";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/frontend/states/zustand.states";
import { useEffect } from "react";

export default function BreadcrumbsSettings() {
    const { setBreadcrumbs } = useBreadcrumbs();
    useEffect(() => setBreadcrumbs([
        { name: "Settings", url: "/settings/profile" },
        { name: "Profile" },
    ]), []);
    return <></>;
}