'use server'

import { AuthFormInputSchema, authFormInputSchemaZod, RegisterFormInputSchema, registgerFormInputSchemaZod } from "@/model/auth-form";
import { SuccessActionResult } from "@/model/server-action-error-return.model";
import { ServiceException } from "@/model/service.exception.model";
import paramService, { ParamService } from "@/server/services/param.service";
import quickStackService from "@/server/services/qs.service";
import userService from "@/server/services/user.service";
import { saveFormAction } from "@/server/utils/action-wrapper.utils";


export const registerUser = async (prevState: any, inputData: RegisterFormInputSchema) =>
    saveFormAction(inputData, registgerFormInputSchemaZod, async (validatedData) => {
        const allUsers = await userService.getAllUsers();
        if (allUsers.length !== 0) {
            throw new ServiceException("User registration is currently not possible");
        }
        await userService.registerUser(validatedData.email, validatedData.password);
        await quickStackService.createOrUpdateCertIssuer(validatedData.email);
        if (validatedData.qsHostname) {
            const url = new URL(validatedData.qsHostname.includes('://') ? validatedData.qsHostname : `https://${validatedData.qsHostname}`);
            await paramService.save({
                name: ParamService.QS_SERVER_HOSTNAME,
                value: url.hostname
            });
            await quickStackService.createOrUpdateIngress(url.hostname);
            return new SuccessActionResult(undefined, 'QuickStack is now available at: ' + url.href);
        }
        return new SuccessActionResult(undefined, 'Successfully registered user');
    });


export const authUser = async (inputData: AuthFormInputSchema) =>
    saveFormAction(inputData, authFormInputSchemaZod, async (validatedData) => {
        const authResult = await userService.authorize({
            username: validatedData.email,
            password: validatedData.password
        });
        if (!authResult) {
            throw new ServiceException('Username or password is incorrect');
        }
        return authResult;
    });