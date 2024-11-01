'use server'

import appService from "@/server/services/app.service";
import deploymentService from "@/server/services/deployment.service";
import { getAuthUserSession, simpleAction } from "@/server/utils/action-wrapper.utils";


export const deploy = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await appService.buildAndDeploy(appId);
    });

export const test = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        const app = await appService.getExtendedById(appId);
        await deploymentService.getDeploymentHistory(app.projectId, app.id);
    });