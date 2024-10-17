import { ServerActionResult } from "@/model/server-action-error-return.model";
import { toast } from "sonner";

export class Toast {
    static async fromAction<A, B>(action: () => Promise<ServerActionResult<A, B>>) {

        return new Promise<ServerActionResult<A, B>>(async (resolve, reject) => {
            toast.promise(async () => {
                return await action();
            }, {
                loading: 'laden...',
                success: (result) => {
                    resolve(result);
                    if (result.status === 'success') {
                        return result.message;
                    }
                },
                error: (error) => {
                    reject(error);
                    if (error.message) {
                        return 'Fehler: ' + error.message;
                    }
                    return 'Ein unbekannter Fehler ist aufgetreten';
                }
            });
        });
        /*
try {



    const result = await action();
    if (result && result.message && result.status === 'error') {
        toast.error('Fehler: ' + result.message);
    }
    if (result && result.status === 'error') {
        toast.error('Ein unbekannter Fehler ist aufgetreten');
    }
    if (result && result.message && result.status === 'success') {
        toast.success(result.message);
    }
    return result;
} catch (ex) {
    toast.error('Ein unbekannter Fehler ist aufgetreten');
}*/
    }
}