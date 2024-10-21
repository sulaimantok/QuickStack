'use server'

import { ProjectModel } from "@/model/generated-zod";
import { SuccessActionResult } from "@/model/server-action-error-return.model";
import projectService from "@/server/services/project.service";
import { getAuthUserSession, saveFormAction, simpleAction } from "@/server/utils/action-wrapper.utils";
import { z } from "zod";

const createProjectSchema = z.object({
    projectName: z.string().min(1)
});

export const createProject = async (projectName: string) =>
    saveFormAction({ projectName }, createProjectSchema, async (validatedData) => {
        await getAuthUserSession();

        await projectService.save({
            name: validatedData.projectName
        });

        return new SuccessActionResult(undefined, "Project created successfully.");
    });

export const deleteProject = async (projectId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await projectService.deleteById(projectId);
        return new SuccessActionResult(undefined, "Project deleted successfully.");
    });