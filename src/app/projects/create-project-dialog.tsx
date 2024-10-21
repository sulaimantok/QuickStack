'use client'

import { InputDialog } from "@/components/custom/input-dialog"
import { Button } from "@/components/ui/button"
import { Toast } from "@/lib/toast.utils";
import { createProject } from "./actions";


export function CreateProjectDialog() {

    const createProj = async (name: string | undefined) => {
        if (!name) {
            return true;
        }
        const result = await Toast.fromAction(() => createProject(name));
        return result.status === "success";
    };

    return <InputDialog
        title="Create Project"
        description="Name your new project."
        fieldName="Name"
        onResult={createProj}>
        <Button>Create Project</Button>
    </InputDialog>
}