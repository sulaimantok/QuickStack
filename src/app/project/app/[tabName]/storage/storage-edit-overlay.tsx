'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormState } from 'react-dom'
import { useEffect, useState } from "react";
import { FormUtils } from "@/lib/form.utilts";
import { SubmitButton } from "@/components/custom/submit-button";
import { AppVolume } from "@prisma/client"
import { AppVolumeEditModel, appVolumeEditZodModel } from "@/model/volume-edit.model"
import { ServerActionResult } from "@/model/server-action-error-return.model"
import { saveVolume } from "./actions"
import { toast } from "sonner"



export default function DialogEditDialog({ children, volume, appId }: { children: React.ReactNode; volume?: AppVolume; appId: string; }) {

    const [isOpen, setIsOpen] = useState<boolean>(false);


    const form = useForm<AppVolumeEditModel>({
        resolver: zodResolver(appVolumeEditZodModel),
        defaultValues: {
            ...volume,
        }
    });

    const [state, formAction] = useFormState((state: ServerActionResult<any, any>, payload: AppVolumeEditModel) =>
        saveVolume(state, {
            ...payload,
            appId,
            id: volume?.id
        }), FormUtils.getInitialFormState<typeof appVolumeEditZodModel>());

    useEffect(() => {
        if (state.status === 'success') {
            form.reset();
            toast.success('Volume saved successfully');
            setIsOpen(false);
        }
        FormUtils.mapValidationErrorsToForm<typeof appVolumeEditZodModel>(state, form);
    }, [state]);


    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                {children}
            </div>
            <Dialog open={!!isOpen} onOpenChange={(isOpened) => setIsOpen(false)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Volume</DialogTitle>
                        <DialogDescription>
                            Configure your custom volume for this container.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form action={(e) => form.handleSubmit((data) => {
                            return formAction(data);
                        })()}>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="containerMountPath"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mount Path Container</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex. /data" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="size"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Size in GB</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="ex. 20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <p className="text-red-500">{state.message}</p>
                                <SubmitButton>Save</SubmitButton>
                            </div>
                        </form>
                    </Form >
                </DialogContent>
            </Dialog>
        </>
    )



}