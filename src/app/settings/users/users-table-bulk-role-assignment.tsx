'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserExtended } from "@/shared/model/user-extended.model";
import { UserRole } from "@/shared/model/sim-session.model";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Toast } from "@/frontend/utils/toast.utils";
import { assignRoleToUsers } from "./actions";

interface UsersBulkRoleAssignmentProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedUsers: UserExtended[];
    roles: UserRole[];
}

export default function UsersBulkRoleAssignment({
    isOpen,
    onOpenChange,
    selectedUsers,
    roles
}: UsersBulkRoleAssignmentProps) {
    const [selectedRole, setSelectedRole] = useState<string>("");

    const handleAssignRole = async () => {
        if (!selectedRole) {
            toast.error("Please select a role");
            return;
        }

        await Toast.fromAction(() => assignRoleToUsers(selectedUsers.map(u => u.id), selectedRole),  `Role assigned to ${selectedUsers.length} user(s)`, 'Assigning Role...');
        onOpenChange(false);
        setSelectedRole("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Role</DialogTitle>
                    <DialogDescription>
                        Select a role to assign to {selectedUsers.length} selected user(s).
                    </DialogDescription>
                </DialogHeader>
                <Select onValueChange={setSelectedRole} value={selectedRole}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAssignRole}>Assign</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
