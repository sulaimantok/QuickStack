'use server'

import appService from "@/server/services/app.service";
import dbGateService from "@/server/services/dbgate.service";
import { getAuthUserSession, simpleAction } from "@/server/utils/action-wrapper.utils";
import { AppTemplateUtils } from "@/server/utils/app-template.utils";
import { DatabaseTemplateInfoModel } from "@/shared/model/database-template-info.model";
import { ServerActionResult, SuccessActionResult } from "@/shared/model/server-action-error-return.model";

export const getDatabaseCredentials = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        const app = await appService.getExtendedById(appId);
        const credentials = AppTemplateUtils.getDatabaseModelFromApp(app);
        return new SuccessActionResult(credentials);
    }) as Promise<ServerActionResult<unknown, DatabaseTemplateInfoModel>>;

export const getIsDbGateActive = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        const isActive = await dbGateService.isDbGateRunning(appId);
        return new SuccessActionResult(isActive);
    }) as Promise<ServerActionResult<unknown, boolean>>;

export const deployDbGate = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await dbGateService.deployDbGateForDatabase(appId);
        return new SuccessActionResult();
    }) as Promise<ServerActionResult<unknown, void>>;

export const getLoginCredentialsForRunningDbGate = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        const credentials = await dbGateService.getLoginCredentialsForRunningDbGate(appId);
        return new SuccessActionResult(credentials);
    }) as Promise<ServerActionResult<unknown, { url: string; username: string, password: string }>>;

export const deleteDbGatDeploymentForAppIfExists = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await dbGateService.deleteDbGatDeploymentForAppIfExists(appId);
        return new SuccessActionResult();
    }) as Promise<ServerActionResult<unknown, void>>;

export const downloadDbGateFilesForApp = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        const url = await dbGateService.downloadDbGateFilesForApp(appId);
        return new SuccessActionResult(url);
    }) as Promise<ServerActionResult<unknown, string>>;