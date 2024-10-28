'use server'

import { appVolumeEditZodModel } from "@/model/volume-edit.model";
import { SuccessActionResult } from "@/model/server-action-error-return.model";
import appService from "@/server/services/app.service";
import { getAuthUserSession, saveFormAction, simpleAction } from "@/server/utils/action-wrapper.utils";
import { z } from "zod";

const actionAppVolumeEditZodModel = appVolumeEditZodModel.merge(z.object({
    appId: z.string(),
    id: z.string().nullish()
}));

export const saveVolume = async (prevState: any, inputData: z.infer<typeof actionAppVolumeEditZodModel>) =>
    saveFormAction(inputData, actionAppVolumeEditZodModel, async (validatedData) => {
        await getAuthUserSession();
        await appService.saveVolume({
            ...validatedData,
            id: validatedData.id ?? undefined
        });
    });

    export const deleteVolume = async (volumeID: string) =>
        simpleAction(async () => {
            await getAuthUserSession();
            await appService.deleteVolumeById(volumeID);
            return new SuccessActionResult(undefined, 'Successfully deleted volume');
        });
