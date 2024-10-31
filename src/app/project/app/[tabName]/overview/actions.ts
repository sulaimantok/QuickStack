'use server'

import { AppRateLimitsModel, appRateLimitsZodModel } from "@/model/app-rate-limits.model";
import { appSourceInfoContainerZodModel, appSourceInfoGitZodModel, AppSourceInfoInputModel, appSourceInfoInputZodModel } from "@/model/app-source-info.model";
import { AuthFormInputSchema, authFormInputSchemaZod } from "@/model/auth-form";
import { BuildJobModel } from "@/model/build-job";
import { ErrorActionResult, ServerActionResult, SuccessActionResult } from "@/model/server-action-error-return.model";
import { ServiceException } from "@/model/service.exception.model";
import appService from "@/server/services/app.service";
import buildService from "@/server/services/build.service";
import userService from "@/server/services/user.service";
import { getAuthUserSession, simpleAction } from "@/server/utils/action-wrapper.utils";


export const getBuildsForApp = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        return await buildService.getBuildsForApp(appId);
    }) as Promise<ServerActionResult<unknown, BuildJobModel[]>>;

export const deleteBuild = async (buildName: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await buildService.deleteBuild(buildName);
        return new SuccessActionResult(undefined, 'Successfully stopped and deleted build.');
    }) as Promise<ServerActionResult<unknown, void>>;