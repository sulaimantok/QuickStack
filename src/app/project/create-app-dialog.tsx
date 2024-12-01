'use client'

import { InputDialog } from "@/components/custom/input-dialog"
import { Button } from "@/components/ui/button"
import { Toast } from "@/frontend/utils/toast.utils";
import { createApp } from "./actions";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";


export function CreateAppDialog({
    projectId
}: {
    projectId: string;
}) {

    const router = useRouter();

    const createAppFunc = async (name: string | undefined) => {
        if (!name) {
            return true;
        }
        const result = await Toast.fromAction(() => createApp(name, projectId));
        if (result.status === "success") {
            router.push(`/project/app/${result.data.id}`);
            return true;
        }
        return false;
    };

    return <InputDialog
        title="Create App"
        description="Name your new App."
        fieldName="Name"
        onResult={createAppFunc}>
        <Button><Plus /> Create App</Button>
    </InputDialog>
}