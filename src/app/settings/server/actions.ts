'use server'

import { getAuthUserSession, saveFormAction } from "@/server/utils/action-wrapper.utils";
import paramService, { ParamService } from "@/server/services/param.service";
import { QsIngressSettingsModel, qsIngressSettingsZodModel } from "@/model/qs-settings.model";
import { QsLetsEncryptSettingsModel, qsLetsEncryptSettingsZodModel } from "@/model/qs-letsencrypt-settings.model";
import quickStackService from "@/server/services/qs.service";

export const updateIngressSettings = async (prevState: any, inputData: QsIngressSettingsModel) =>
  saveFormAction(inputData, qsIngressSettingsZodModel, async (validatedData) => {
    await getAuthUserSession();

    await paramService.save({
      name: ParamService.QS_SERVER_HOSTNAME,
      value: validatedData.serverUrl
    });

    await paramService.save({
      name: ParamService.DISABLE_NODEPORT_ACCESS,
      value: validatedData.disableNodePortAccess + ''
    });

    await quickStackService.createOrUpdateService(!validatedData.disableNodePortAccess);
    await quickStackService.createOrUpdateIngress(validatedData.serverUrl);
  });

export const updateLetsEncryptSettings = async (prevState: any, inputData: QsLetsEncryptSettingsModel) =>
  saveFormAction(inputData, qsLetsEncryptSettingsZodModel, async (validatedData) => {
    await getAuthUserSession();

    await paramService.save({
      name: ParamService.LETS_ENCRYPT_MAIL,
      value: validatedData.letsEncryptMail
    });

    await quickStackService.createOrUpdateCertIssuer(validatedData.letsEncryptMail);
    // todo update or deploy the cert issuer

  });
