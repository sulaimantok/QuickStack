'use server'

import { ServiceException } from "@/model/service.exception.model";
import { ProfilePasswordChangeModel, profilePasswordChangeZodModel } from "@/model/update-password.model";
import userService from "@/server/services/user.service";
import { getAuthUserSession, saveFormAction } from "@/server/utils/action-wrapper.utils";

export const changePassword = async (prevState: any, inputData: ProfilePasswordChangeModel) =>
  saveFormAction(inputData, profilePasswordChangeZodModel, async (validatedData) => {
    if (validatedData.newPassword !== validatedData.confirmNewPassword) {
      throw new ServiceException('New password and confirm password do not match.');
    }
    if (validatedData.oldPassword === validatedData.newPassword) {
      throw new ServiceException('New password cannot be the same as the old password.');
    }
    const session = await getAuthUserSession();
    await userService.changePassword(session.email, validatedData.oldPassword, validatedData.newPassword);
  });
