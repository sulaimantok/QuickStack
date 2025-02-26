'use client';

import { Button } from "@/components/ui/button";
import { EditIcon, Plus, TrashIcon } from "lucide-react";
import { Toast } from "@/frontend/utils/toast.utils";
import { useConfirmDialog } from "@/frontend/states/zustand.states";
import React from "react";
import { SimpleDataTable } from "@/components/custom/simple-data-table";
import { formatDateTime } from "@/frontend/utils/format.utils";
import { deleteRole } from "./actions";
import { RoleExtended } from "@/shared/model/role-extended.model.ts";
import RoleEditOverlay from "./role-edit-overlay";

export default function RolesTable({ roles }: {
    roles: RoleExtended[];
}) {

    const { openConfirmDialog: openDialog } = useConfirmDialog();

    const asyncDeleteItem = async (id: string) => {
        const confirm = await openDialog({
            title: "Delete Role",
            description: "Do you really want to delete this role? Users with this role will be assigned to no role afterwards. They will not be able to use QuickStack until you reassign a new role to them.",
            okButton: "Delete",
        });
        if (confirm) {
            await Toast.fromAction(() => deleteRole(id), 'Deleting Role...', 'Role deleted successfully');
        }
    };

    return <>
        <SimpleDataTable columns={[
            ['id', 'ID', false],
            ['name', 'Name', true],
            ['roleReadPermissions', 'Read Permissions', true],
            ['roleWritePermissions', 'Write Permissions', true],
            ["createdAt", "Created At", true, (item) => formatDateTime(item.createdAt)],
            ["updatedAt", "Updated At", false, (item) => formatDateTime(item.updatedAt)],
        ]}
            data={roles}
            actionCol={(item) =>
                <>
                    <div className="flex">
                        <div className="flex-1"></div>
                        <RoleEditOverlay role={item} >
                            <Button variant="ghost"><EditIcon /></Button>
                        </RoleEditOverlay>
                        <Button variant="ghost" onClick={() => asyncDeleteItem(item.id)}>
                            <TrashIcon />
                        </Button>
                    </div>
                </>}
        />
        <RoleEditOverlay >
            <Button variant="secondary"><Plus /> Create Role</Button>
        </RoleEditOverlay>
    </>;
}