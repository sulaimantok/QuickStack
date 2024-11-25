'use server'

import { getAuthUserSession, saveFormAction, simpleAction } from "@/server/utils/action-wrapper.utils";
import paramService, { ParamService } from "@/server/services/param.service";
import { QsIngressSettingsModel, qsIngressSettingsZodModel } from "@/model/qs-settings.model";
import { QsLetsEncryptSettingsModel, qsLetsEncryptSettingsZodModel } from "@/model/qs-letsencrypt-settings.model";
import quickStackService from "@/server/services/qs.service";
import { ServerActionResult, SuccessActionResult } from "@/model/server-action-error-return.model";

export const updateIngressSettings = async (prevState: any, inputData: QsIngressSettingsModel) =>
  saveFormAction(inputData, qsIngressSettingsZodModel, async (validatedData) => {
    await getAuthUserSession();

    const url = new URL(validatedData.serverUrl.includes('://') ? validatedData.serverUrl : `https://${validatedData.serverUrl}`);

    await paramService.save({
      name: ParamService.QS_SERVER_HOSTNAME,
      value: url.hostname
    });

    await paramService.save({
      name: ParamService.DISABLE_NODEPORT_ACCESS,
      value: validatedData.disableNodePortAccess + ''
    });

    await quickStackService.createOrUpdateService(!validatedData.disableNodePortAccess);
    await quickStackService.createOrUpdateIngress(validatedData.serverUrl);
    await quickStackService.createOrUpdateDeployment(url.hostname);

  });

export const updateLetsEncryptSettings = async (prevState: any, inputData: QsLetsEncryptSettingsModel) =>
  saveFormAction(inputData, qsLetsEncryptSettingsZodModel, async (validatedData) => {
    await getAuthUserSession();

    await paramService.save({
      name: ParamService.LETS_ENCRYPT_MAIL,
      value: validatedData.letsEncryptMail
    });

    await quickStackService.createOrUpdateCertIssuer(validatedData.letsEncryptMail);
  });

export const getConfiguredHostname: () => Promise<ServerActionResult<unknown, string | undefined>> = async () =>
  simpleAction(async () => {
    await getAuthUserSession();

    return await paramService.getString(ParamService.QS_SERVER_HOSTNAME);
  });

export const updateQuickstack = async () =>
  simpleAction(async () => {
    await getAuthUserSession();
    await quickStackService.updateQuickStack();
    return new SuccessActionResult(undefined, 'QuickStack will be updated, refresh the page in a few seconds.');
  });
