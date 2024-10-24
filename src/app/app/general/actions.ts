'use server'

import { AppRateLimitsModel, appRateLimitsZodModel } from "@/model/app-rate-limits.model";
import { appSourceInfoContainerZodModel, appSourceInfoGitZodModel, AppSourceInfoInputModel, appSourceInfoInputZodModel } from "@/model/app-source-info.model";
import { AuthFormInputSchema, authFormInputSchemaZod } from "@/model/auth-form";
import { ErrorActionResult, ServerActionResult } from "@/model/server-action-error-return.model";
import { ServiceException } from "@/model/service.exception.model";
import userService from "@/server/services/user.service";
import { getAuthUserSession, saveFormAction, simpleAction } from "@/server/utils/action-wrapper.utils";


export const saveGeneralAppSourceInfo = async (prevState: any, inputData: AppSourceInfoInputModel, appId: string) => {
    if (inputData.sourceType === 'GIT') {
        return saveFormAction(inputData, appSourceInfoGitZodModel, async (validatedData) => {
            console.log(validatedData)
            await getAuthUserSession();
        });
    } else if (inputData.sourceType === 'CONTAINER') {
        return saveFormAction(inputData, appSourceInfoContainerZodModel, async (validatedData) => {
            console.log(validatedData)
            await getAuthUserSession();
            
        });
    } else {
        return simpleAction(async () => new ServerActionResult('error', undefined, 'Invalid Source Type', undefined));
    }
};

export const saveGeneralAppRateLimits = async (prevState: any, inputData: AppRateLimitsModel, appId: string) =>
    saveFormAction(inputData, appRateLimitsZodModel, async (validatedData) => {
        console.log(validatedData)
        await getAuthUserSession();

    });
