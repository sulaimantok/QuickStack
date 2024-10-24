'use server'

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { getAuthUserSession, getUserSession } from "@/server/utils/action-wrapper.utils";
import projectService from "@/server/services/project.service";
import AppTable from "./apps-table";
import { CreateAppDialog } from "./create-app-dialog";
import appService from "@/server/services/app.service";

export default async function AppsPage({
    searchParams,
}: {
    searchParams?: { [key: string]: string | undefined };
}) {
    await getAuthUserSession();

    const projectId = searchParams?.projectId;
    if (!projectId) {
        return <p>Could not find project with id {projectId}</p>
    }
    const data = await appService.getAllAppsByProjectID(projectId);
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold tracking-tight flex-1">Apps</h2>
                <CreateAppDialog projectId={projectId} />
            </div>
            <AppTable data={data} />
        </div>
    )
}
