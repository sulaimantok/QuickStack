'use server'

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { getAuthUserSession, getUserSession } from "@/server/utils/action-wrapper.utils";
import projectService from "@/server/services/project.service";
import AppTable from "./apps-table";
import { CreateAppDialog } from "./create-app-dialog";
import appService from "@/server/services/app.service";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import PageTitle from "@/components/custom/page-title";
import ProjectBreadcrumbs from "./project-breadcrumbs";


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
    const project = await projectService.getById(projectId);
    const data = await appService.getAllAppsByProjectID(projectId);
    return (
        <div className="flex-1 space-y-4 pt-6">
            <PageTitle
                title="Apps"
                subtitle={`All Apps for Project "${project.name}"`}>
                <CreateAppDialog projectId={projectId} />
            </PageTitle>
            <AppTable app={data} />
            <ProjectBreadcrumbs project={project} />
        </div>
    )
}
