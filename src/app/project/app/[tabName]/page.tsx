import { getAuthUserSession } from "@/server/utils/action-wrapper.utils";
import appService from "@/server/services/app.service";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import PageTitle from "@/components/custom/page-title";
import AppTabs from "./app-tabs";
import AppActionButtons from "./app-action-buttons";
import buildService from "@/server/services/build.service";

export default async function AppPage({
    searchParams,
    params
}: {
    searchParams?: { [key: string]: string | undefined };
    params: { tabName: string };
}) {
    await getAuthUserSession();
    const appId = searchParams?.appId;
    if (!appId) {
        return <p>Could not find app with id {appId}</p>
    }
    const app = await appService.getExtendedById(appId);
    const builds = await buildService.getBuildsForApp(appId);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Projects</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/project?projectId=${app.projectId}`}>{app.project.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>{app.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <PageTitle
                title={app.name}
                subtitle={`App ID: ${app.id}`}>
            </PageTitle>
            <AppActionButtons app={app} />
            <AppTabs app={app} appBuilds={builds} tabName={params.tabName} />
        </div>
    )
}
