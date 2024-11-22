'use client'

import { Button } from "@/components/ui/button";
import ProjectPage from "../../app/projects/project-page";
import paramService, { ParamService } from "@/server/services/param.service";
import { cookies } from "next/headers";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function HostnameCheck({ serverParamHostname }: { serverParamHostname?: string }) {
    useEffect(() => {
        const hostname = window.location.hostname;
        if (serverParamHostname && serverParamHostname !== hostname) {
            toast.warning(`QuickStack is configured to run on a different domain. Please open the application on https://${serverParamHostname}`, {
                duration: 10000,
                action: {
                    label: 'Open',
                    onClick: () => {
                        window.location.href = `https://${serverParamHostname}`;
                    }
                }
            });
        }
    }, [serverParamHostname]);
    return <></>;
}
