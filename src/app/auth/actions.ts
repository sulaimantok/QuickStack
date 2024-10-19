'use server'

import { AuthFormInputSchema, authFormInputSchemaZod } from "@/model/auth-form";
import { ServiceException } from "@/model/service.exception.model";
import userService from "@/server/services/user.service";
import { saveFormAction } from "@/server/utils/action-wrapper.utils";


export const registerUser = async (prevState: any, inputData: AuthFormInputSchema) =>
    saveFormAction(inputData, authFormInputSchemaZod, async (validatedData) => {
        const allUsers = await userService.getAllUsers();
        if (allUsers.length !== 0) {
            throw new ServiceException("User registration is currently not possible");
        }
        return await userService.registerUser(validatedData.email, validatedData.password);
    });
