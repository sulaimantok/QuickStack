'use server'

import appService from "@/server/services/app.service";
import { getAuthUserSession, simpleAction } from "@/server/utils/action-wrapper.utils";


export const deploy = async (appId: string) =>
    simpleAction(async () => {
        await getAuthUserSession();
        await appService.buildAndDeploy(appId);
    });
