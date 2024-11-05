'use client';

import { SubmitButton } from "@/components/custom/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormUtils } from "@/lib/form.utilts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { saveDefaultPortConfiguration } from "./actions";
import { useFormState } from "react-dom";
import { ServerActionResult } from "@/model/server-action-error-return.model";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppExtendedModel } from "@/model/app-extended.model";
import { AppDefaultPortsModel, appdefaultPortZodModel } from "@/model/default-port.model";
import { StringUtils } from "@/server/utils/string.utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Code } from "@/components/custom/code";
import { ListUtils } from "@/server/utils/list.utils";


export default function InternalHostnames({ app }: {
    app: AppExtendedModel
}) {

    const internalUrl = StringUtils.toServiceName(app.id);

    const form = useForm<AppDefaultPortsModel>({
        resolver: zodResolver(appdefaultPortZodModel),
        defaultValues: app
    });

    const [state, formAction] = useFormState((state: ServerActionResult<any, any>, payload: AppDefaultPortsModel) =>
        saveDefaultPortConfiguration(state, payload, app.id), FormUtils.getInitialFormState<typeof appdefaultPortZodModel>());

    useEffect(() => {
        if (state.status === 'success') {
            toast.success('Data Saved');
        }
        FormUtils.mapValidationErrorsToForm<typeof appdefaultPortZodModel>(state, form);
    }, [state]);

    return <>
        <Card>
            <CardHeader>
                <CardTitle>Default Port</CardTitle>
                <CardDescription>Provide a default port for the application to connect to the app from other apps in same project.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form action={(e) => form.handleSubmit((data) => {
                    return formAction(data);
                })()}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="defaultPort"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Port</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="gap-4">
                        <SubmitButton>Save</SubmitButton>
                        <p className="text-red-500">{state?.message}</p>
                    </CardFooter>
                </form>
            </Form >
        </Card >

        <Card>
            <CardHeader>
                <CardTitle>Internal Hostnames</CardTitle>
                <CardDescription>Internal hostnames can be used to connect to this app from other apps in the same project. </CardDescription>
            </CardHeader>
            <CardContent>
                {ListUtils.removeDuplicates([
                    app.defaultPort,
                    ...app.appDomains.map(d => d.port)
                ]).map(port => (
                    <div key={port} className="flex gap-1 pb-2">
                        <div><Code>{internalUrl + ':' + port}</Code></div>
                        <div className="self-center">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><QuestionMarkCircledIcon /></TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-[350px]">
                                            Other apps can connect to this app using this hostname. This hostname is valid for all internal connections within the same project.<br /><br />
                                            <span className="font-bold">Hostname:</span> {internalUrl}<br />
                                            <span className="font-bold">Port:</span> {port}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card >
    </>;
}