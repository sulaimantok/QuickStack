import dataAccess from "@/server/adapter/db.client";
import { create } from "zustand"

interface ZustandDialogProps {
    isDialogOpen: boolean;
    data: DialogProps | null;
    resolvePromise: ((result: boolean) => void) | null;
    openDialog: (data: DialogProps) => Promise<boolean>;
    closeDialog: (result: boolean) => void;
}

export interface DialogProps {
    title: string;
    description: string;
    yesButton?: string;
    noButton?: string;
}

export interface InternDialogProps extends DialogProps {
    returnFunc: (dialogResult: boolean) => boolean;
}

export const useConfirmDialog = create<ZustandDialogProps>((set) => ({
    isDialogOpen: false,
    data: null,
    resolvePromise: null,
    openDialog: (data) => {
        return new Promise((resolve) => {
            set({
                isDialogOpen: true,
                data: data,
                resolvePromise: resolve,
            });
        });
    },
    closeDialog: (result) => set((state) => {
        if (state.resolvePromise) {
            state.resolvePromise(result); // Erfülle das Promise mit true oder false
        }
        return { isDialogOpen: false, userInfo: null, resolvePromise: null };
    }),
}));

interface ZustandBreadcrumbsProps {
    breadcrumbs: Breadcrumb[] | null;
    setBreadcrumbs: ((result: Breadcrumb[]) => void);
}

export interface Breadcrumb {
    name: string;
    url?: string;
}

export const useBreadcrumbs = create<ZustandBreadcrumbsProps>((set) => ({
    breadcrumbs: null,
    setBreadcrumbs: (data) => {
        set({
            breadcrumbs: data,
        });
    },
}));