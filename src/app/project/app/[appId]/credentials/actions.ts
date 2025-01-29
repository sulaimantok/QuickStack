'use server'

import appService from "@/server/services/app.service";
import dbGateService from "@/server/services/db-tool-services/dbgate.service";
import phpMyAdminService from "@/server/services/db-tool-services/phpmyadmin.service";
import { getAuthUserSession, simpleAction } from "@/server/utils/action-wrapper.utils";
import { AppTemplateUtils } from "@/server/utils/app-template.utils";
import { DatabaseTemplateInfoModel } from "@/shared/model/database-template-info.model";
import { ServerActionResult, SuccessActionResult } from "@/shared/model/server-action-error-return.model";
import { ServiceException } from "@/shared/model/service.exception.model";

export const getDatabaseCredentials = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        const app = await appService.getExtendedById(appId);
        const credentials = AppTemplateUtils.getDatabaseModelFromApp(app);
        return new SuccessActionResult(credentials);
    }) as Promise<ServerActionResult<unknown, DatabaseTemplateInfoModel>>;

export const getIsDbToolActive = async (appId: string, dbTool: 'dbgate' | 'phpmyadmin') =>
    simpleAction(async () => {
        await getAuthUserSession();
        if (dbTool === 'dbgate') {
            const isActive = await dbGateService.isDbToolRunning(appId);
            return new SuccessActionResult(isActive);
        } else if (dbTool === 'phpmyadmin') {
            const isActive = await phpMyAdminService.isDbToolRunning(appId);
            return new SuccessActionResult(isActive);
        } else {
            throw new ServiceException('Unknown db tool');
        }
    }) as Promise<ServerActionResult<unknown, boolean>>;

export const deployDbTool = async (appId: string, dbTool: 'dbgate' | 'phpmyadmin') =>
    simpleAction(async () => {
        await getAuthUserSession();
        if (dbTool === 'dbgate') {
            await dbGateService.deploy(appId);
            return new SuccessActionResult();
        } else if (dbTool === 'phpmyadmin') {
            await phpMyAdminService.deploy(appId);
            return new SuccessActionResult();
        } else {
            throw new ServiceException('Unknown db tool');
        }
    }) as Promise<ServerActionResult<unknown, void>>;

export const getLoginCredentialsForRunningDbTool = async (appId: string, dbTool: 'dbgate' | 'phpmyadmin') =>
    simpleAction(async () => {
        await getAuthUserSession();
        if (dbTool === 'dbgate') {
            return new SuccessActionResult(await dbGateService.getLoginCredentialsForRunningDbGate(appId));
        } else if (dbTool === 'phpmyadmin') {
            return new SuccessActionResult(await phpMyAdminService.getLoginCredentialsForRunningDbGate(appId));
        } else {
            throw new ServiceException('Unknown db tool');
        }
    }) as Promise<ServerActionResult<unknown, { url: string; username: string, password: string }>>;

export const deleteDbToolDeploymentForAppIfExists = async (appId: string, dbTool: 'dbgate' | 'phpmyadmin') =>
    simpleAction(async () => {
        await getAuthUserSession();
        if (dbTool === 'dbgate') {
            await dbGateService.deleteToolForAppIfExists(appId);
            return new SuccessActionResult();
        } else if (dbTool === 'phpmyadmin') {
            await phpMyAdminService.deleteToolForAppIfExists(appId);
            return new SuccessActionResult();
        } else {
            throw new ServiceException('Unknown db tool');
        }
    }) as Promise<ServerActionResult<unknown, void>>;

export const downloadDbGateFilesForApp = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        const url = await dbGateService.downloadDbGateFilesForApp(appId);
        return new SuccessActionResult(url);
    }) as Promise<ServerActionResult<unknown, string>>;