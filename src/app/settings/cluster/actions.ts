'use server'

import { ServiceException } from "@/model/service.exception.model";
import { ProfilePasswordChangeModel, profilePasswordChangeZodModel } from "@/model/update-password.model";
import userService from "@/server/services/user.service";
import { getAuthUserSession, saveFormAction, simpleAction } from "@/server/utils/action-wrapper.utils";
import { TotpModel, totpZodModel } from "@/model/update-password.model copy";
import { SuccessActionResult } from "@/model/server-action-error-return.model";
import clusterService from "@/server/services/node.service";

export const setNodeStatus = async (nodeName: string, schedulable: boolean) =>
  simpleAction(async () => {
    await getAuthUserSession();
    await clusterService.setNodeStatus(nodeName, schedulable);
    return new SuccessActionResult(undefined, 'Successfully updated node status.');
  });
