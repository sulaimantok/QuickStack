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
    params: { appId: string }
}) {
    await getAuthUserSession();
    const appId = params?.appId;
    if (!appId) {
        return <p>Could not find app with id {appId}</p>
    }
    const app = await appService.getExtendedById(appId);

    return (
        <AppTabs app={app} tabName={searchParams?.tabName ?? 'overview'} />
    )
}
