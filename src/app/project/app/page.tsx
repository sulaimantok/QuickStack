import userService from "@/server/services/user.service";
import { getAuthUserSession, getUserSession } from "@/server/utils/action-wrapper.utils";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GeneralAppRateLimits from "./general/app-rate-limits";
import GeneralAppSource from "./general/app-source";
import appService from "@/server/services/app.service";



export default async function AppPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | undefined };
}) {
    await getAuthUserSession();
    const appId = searchParams?.appId;
    if (!appId) {
        return <p>Could not find app with id {appId}</p>
    }
    const app = await appService.getById(appId);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold tracking-tight flex-1">App</h2>
            </div>
            <Tabs defaultValue="general" className="space-y-4">
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
                <TabsContent value="environment">environment</TabsContent>
                <TabsContent value="domains">domains</TabsContent>
                <TabsContent value="storage">storage</TabsContent>
                <TabsContent value="logs">logs</TabsContent>
            </Tabs>
        </div>
    )
}
