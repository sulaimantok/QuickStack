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
import { cn } from "@/lib/utils"
import { redirect } from "next/navigation"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"

export default function UserLoginForm() {
    const form = useForm<AuthFormInputSchema>({
        resolver: zodResolver(authFormInputSchemaZod)
    });

    const [errorMessages, setErrorMessages] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const login = async () => {
        setLoading(true);
        setErrorMessages(undefined);
        try {
            await signIn("credentials", {
                username: form.getValues().email,
                password: form.getValues().password,
                redirect: false,
            });
            redirect('/');
        } catch (e) {
            console.log(e);
            setErrorMessages((e as any).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={() => login()} className="space-y-8">

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
                <Button type="submit" disabled={loading}>{loading ? <LoadingSpinner></LoadingSpinner> : 'Login'}</Button>
                <p className="text-red-500">{errorMessages}</p>

            </form>
        </Form>
    )
}
