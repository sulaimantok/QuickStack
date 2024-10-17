'use client'

import { useFormStatus } from "react-dom";
import LoadingSpinner from "../ui/loading-spinner";
import { Button } from "../ui/button";

export function SubmitButton(props: { children: React.ReactNode }) {
    const { pending, data, method, action } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ?<LoadingSpinner></LoadingSpinner> : props.children}</Button>
}