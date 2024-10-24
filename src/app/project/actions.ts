'use server'

import { SuccessActionResult } from "@/model/server-action-error-return.model";
import appService from "@/server/services/app.service";
import { getAuthUserSession, saveFormAction, simpleAction } from "@/server/utils/action-wrapper.utils";
import { z } from "zod";

const createAppSchema = z.object({
    appName: z.string().min(1)
});

export const createApp = async (appName: string, projectId: string) =>
    saveFormAction({ appName }, createAppSchema, async (validatedData) => {
        await getAuthUserSession();

        const returnData = await appService.save({
            name: validatedData.appName,
            projectId
        });

        return new SuccessActionResult(returnData, "App created successfully.");
    });

export const deleteApp = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await appService.deleteById(appId);
        return new SuccessActionResult(undefined, "App deleted successfully.");
    });