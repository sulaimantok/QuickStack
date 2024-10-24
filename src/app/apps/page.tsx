'use server'

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { getAuthUserSession, getUserSession } from "@/server/utils/action-wrapper.utils";
import projectService from "@/server/services/project.service";
import ProjectsTable from "./apps-table";
import { CreateProjectDialog } from "./create-app-dialog";

export default async function ProjectPage() {

    await getAuthUserSession();
    const data = await projectService.getAllProjects();
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex gap-4">
                <h2 className="text-3xl font-bold tracking-tight flex-1">Projects</h2>
                <CreateProjectDialog />
            </div>
            <ProjectsTable data={data} />
        </div>
    )
}
