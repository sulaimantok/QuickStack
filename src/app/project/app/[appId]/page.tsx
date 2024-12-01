import { getAuthUserSession } from "@/server/utils/action-wrapper.utils";
import appService from "@/server/services/app.service";
import AppTabs from "./app-tabs";
import AppBreadcrumbs from "./app-breadcrumbs";

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

    return (<>
        <AppTabs app={app} tabName={searchParams?.tabName ?? 'overview'} />
        <AppBreadcrumbs app={app} />
    </>
    )
}
