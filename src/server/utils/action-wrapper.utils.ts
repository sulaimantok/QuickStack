import { ServiceException } from "@/model/service.exception.model";
import { UserSession } from "@/model/sim-session.model";
import { getServerSession } from "next-auth";
import { ZodRawShape, ZodObject, objectUtil, baseObjectOutputType, z, ZodType } from "zod";
import { redirect } from "next/navigation";
import { ServerActionResult, SuccessActionResult } from "@/model/server-action-error-return.model";
import { FormValidationException } from "@/model/form-validation-exception.model";
import { authOptions } from "@/lib/auth-options";

export async function getUserSession(): Promise<UserSession | null> {
    const session = await getServerSession(authOptions) as UserSession | null;
    return session;
}
/*
export async function checkIfCurrentUserHasAccessToContract(contractId: string | null | undefined) {
    const session = await getLandlordSession();
    if (!contractId) {
        return { ...session };
    }
    const currentLandlordIdIfExists = await rentalContractService.getCurrentLandlordIdForContract(contractId);
    if (!currentLandlordIdIfExists) {
        throw new ServiceException('Objekt nicht gefunden.');
    }
    if (currentLandlordIdIfExists !== session.landlordId) {
        throw new ServiceException('Sie haben keine Berechtigung, dieses Objekt zu bearbeiten.');
    }
    return { ...session };
}
*/
export async function saveFormAction<ReturnType, ZodType extends ZodRawShape>(formData: FormData,
    validationModel: ZodObject<ZodType>,
    func: (validateData: { [k in keyof objectUtil.addQuestionMarks<baseObjectOutputType<ZodType>, any>]: objectUtil.addQuestionMarks<baseObjectOutputType<ZodType>, any>[k]; }) => Promise<ReturnType>,
    redirectOnSuccessPath?: string,
    ignoredFields: (keyof ZodType)[] = []) {
    return simpleAction<ReturnType, z.infer<typeof validationModel>>(async () => {
        const inputData = convertFormDataToJson(formData);

        // Omit ignored fields from validation model
        const omitBody = {};
        const allIgnoreFiels = ['createdAt', 'updatedAt', ...ignoredFields];
        allIgnoreFiels.forEach(field => (omitBody as any)[field] = true);
        const schemaWithoutIgnoredFields = validationModel.omit(omitBody);

        const validatedFields = schemaWithoutIgnoredFields.safeParse(inputData);
        if (!validatedFields.success) {
            console.error('Validation failed for input:', inputData, 'with errors:', validatedFields.error.flatten().fieldErrors);
            throw new FormValidationException('Bitte überprüfen Sie Ihre eingaben.', validatedFields.error.flatten().fieldErrors);
        }

        if (!validatedFields.data) {
            console.error('No data available after validation of input:', validatedFields.data);
            throw new ServiceException('Ein unbekannter Fehler ist aufgetreten.');
        }
        return await func(validatedFields.data);
    }, redirectOnSuccessPath);
}

function convertFormDataToJson(formData: FormData) {
    const jsonObject: { [key: string]: any } = {};
    formData.forEach((value, key) => {
        if (key.startsWith('$ACTION')) {
            return;
        }
        if (value === '') {
            jsonObject[key] = null;
        } else {
            jsonObject[key] = value;
        }
    });
    return jsonObject;
}

export async function simpleAction<ReturnType, ValidationCallbackType>(
    func: () => Promise<ReturnType>,
    redirectOnSuccessPath?: string) {
    let funcResult: ReturnType;
    try {
        funcResult = await func();
    } catch (ex) {
        if (ex instanceof FormValidationException) {
            return {
                status: 'error',
                message: ex.message,
                errors: ex.errors ?? undefined
            } as ServerActionResult<ValidationCallbackType, ReturnType>;
        } else if (ex instanceof ServiceException) {
            return {
                status: 'error',
                message: ex.message
            } as ServerActionResult<ValidationCallbackType, ReturnType>;
        } else {
            console.error(ex)
            return {
                status: 'error',
                message: 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
            } as ServerActionResult<ValidationCallbackType, ReturnType>;
        }
    }
    if (redirectOnSuccessPath) redirect(redirectOnSuccessPath);

    if (funcResult instanceof ServerActionResult) {
        return {
            status: funcResult.status,
            message: funcResult.message,
            errors: funcResult.errors,
            data: funcResult.data
        } as ServerActionResult<ValidationCallbackType, typeof funcResult.data>;
    }
    return {
        status: 'success',
        data: funcResult ?? undefined
    } as ServerActionResult<ValidationCallbackType, ReturnType>;
}