'use client'

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GeneralAppRateLimits from "./general/app-rate-limits";
import GeneralAppSource from "./general/app-source";
import EnvEdit from "./environment/env-edit";
import { App } from "@prisma/client";
import DomainsList from "./domains/domains";
import { AppExtendedModel } from "@/model/app-extended.model";

export default function AppTabs({
    app,
    tabName
}: {
    app: AppExtendedModel;
    tabName: string;
}) {
    const router = useRouter();

    const openTab = (tabName: string) => {
        router.push(`/project/app/${tabName}?appId=${app.id}`);
    }

    return (
        <Tabs defaultValue="general" value={tabName} onValueChange={(newTab) => openTab(newTab)} className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="environment">Environment</TabsTrigger>
                <TabsTrigger value="domains">Domains</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">Domains, Logs, etc.</TabsContent>
            <TabsContent value="general" className="space-y-4">
                <GeneralAppSource app={app} />
                <GeneralAppRateLimits app={app} />
            </TabsContent>
            <TabsContent value="environment" className="space-y-4">
                <EnvEdit app={app} />
            </TabsContent>
            <TabsContent value="domains" className="space-y-4">
                <DomainsList app={app} />
            </TabsContent>
            <TabsContent value="storage">storage</TabsContent>
            <TabsContent value="logs">logs</TabsContent>
        </Tabs>
    )
}
