'use client'

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
import { z } from "zod";
import { useFormState } from 'react-dom'
import { useEffect, useState } from "react";
import { FormUtils } from "@/lib/form.utilts";
import { SubmitButton } from "@/components/custom/submit-button";
import SelectFormField from "@/components/custom/select-form-field";
import BottomBarMenu from "@/components/custom/bottom-bar-menu";
import { AuthFormInputSchema, authFormInputSchemaZod } from "@/model/auth-form"
import { registerUser } from "./actions"
import { signIn } from "next-auth/react";

export default function UserRegistrationForm() {
    const form = useForm<AuthFormInputSchema>({
        resolver: zodResolver(authFormInputSchemaZod)
    });

    const [state, formAction] = useFormState(registerUser, FormUtils.getInitialFormState<typeof authFormInputSchemaZod>());

    useEffect(() => {
        if (state.status === 'success') {
            const formValues = form.getValues();
            signIn("credentials", {
                username: formValues.email,
                password: formValues.password,
                redirect: false,
            });
        }
    }, [state]);

    return (
        <Form {...form}>
            <form action={formAction} className="space-y-8">

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>E-Mail</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value as string | number | readonly string[] | undefined} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value as string | number | readonly string[] | undefined} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <SubmitButton>Register</SubmitButton>
                <p className="text-red-500">{state?.message}</p>

            </form>
        </Form>
    )
}
