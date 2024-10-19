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
import { useFormState } from 'react-dom'
import { useEffect } from "react";
import { FormUtils } from "@/lib/form.utilts";
import { SubmitButton } from "@/components/custom/submit-button";
import { AuthFormInputSchema, authFormInputSchemaZod } from "@/model/auth-form"
import { registerUser } from "./actions"
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

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
            redirect('/');
        }
    }, [state]);

    return (
        <Card className="w-[350px] mx-auto">
            <CardHeader>
                <CardTitle>Registration</CardTitle>
                <CardDescription>Enter your credentials to register for the service.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form action={(e) => form.handleSubmit((data) => formAction(data))()}
                    className="space-y-8">
                    <CardContent className="space-y-4">
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
                                        <Input type="password"  {...field} value={field.value as string | number | readonly string[] | undefined} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <p className="text-red-500">{state?.message}</p>
                    </CardContent>
                    <CardFooter>

                        <SubmitButton className="w-full">Register</SubmitButton>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}
