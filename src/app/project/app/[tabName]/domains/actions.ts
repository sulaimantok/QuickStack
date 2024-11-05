'use server'

import { AppRateLimitsModel } from "@/model/app-rate-limits.model";
import { AppDefaultPortsModel, appdefaultPortZodModel } from "@/model/default-port.model";
import { appDomainEditZodModel } from "@/model/domain-edit.model";
import { SuccessActionResult } from "@/model/server-action-error-return.model";
import appService from "@/server/services/app.service";
import { getAuthUserSession, saveFormAction, simpleAction } from "@/server/utils/action-wrapper.utils";
import { z } from "zod";

const actionAppDomainEditZodModel = appDomainEditZodModel.merge(z.object({
    appId: z.string(),
    id: z.string().nullish()
}));

export const saveDomain = async (prevState: any, inputData: z.infer<typeof actionAppDomainEditZodModel>) =>
    saveFormAction(inputData, actionAppDomainEditZodModel, async (validatedData) => {
        await getAuthUserSession();
        await appService.saveDomain({
            ...validatedData,
            id: validatedData.id ?? undefined
        });
    });

export const deleteDomain = async (domainId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await appService.deleteDomainById(domainId);
        return new SuccessActionResult(undefined, 'Successfully deleted domain');
    });

export const saveDefaultPortConfiguration = async (prevState: any, inputData: AppDefaultPortsModel, appId: string) =>
    saveFormAction(inputData, appdefaultPortZodModel, async (validatedData) => {
        await getAuthUserSession();
        const existingApp = await appService.getById(appId);
        await appService.save({
            ...existingApp,
            ...validatedData,
            id: appId,
        });
    });