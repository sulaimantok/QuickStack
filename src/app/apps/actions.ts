'use server'

import { AppModel } from "@/model/generated-zod";
import { SuccessActionResult } from "@/model/server-action-error-return.model";
import appService from "@/server/services/app.service";
import { getAuthUserSession, saveFormAction, simpleAction } from "@/server/utils/action-wrapper.utils";
import { z } from "zod";

const createAppSchema = z.object({
    projectName: z.string().min(1)
});

export const createApp = async (projectName: string) =>
    saveFormAction({ projectName }, createAppSchema, async (validatedData) => {
        await getAuthUserSession();

        await appService.save({
            name: validatedData.projectName
        });

        return new SuccessActionResult(undefined, "Project created successfully.");
    });

export const deleteProject = async (projectId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await appService.deleteById(projectId);
        return new SuccessActionResult(undefined, "Project deleted successfully.");
    });