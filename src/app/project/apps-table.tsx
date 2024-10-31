'use client'

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { SimpleDataTable } from "@/components/custom/simple-data-table";
import { formatDateTime } from "@/lib/format.utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Toast } from "@/lib/toast.utils";
import { App } from "@prisma/client";
import { deleteApp } from "./actions";
import { useConfirmDialog } from "@/lib/zustand.states";



export default function AppTable({ data }: { data: App[] }) {

    const { openDialog } = useConfirmDialog();

    return <>
        <SimpleDataTable columns={[
            ['id', 'ID', false],
            ['name', 'Name', true],
            ['sourceType', 'Source Type', false, (item) => item.sourceType === 'GIT' ? 'Git' : 'Container'],
            ['replicas', 'Replica Count', false],
            ['memoryLimit', 'Memory Limit', false],
            ['memoryReservation', 'Memory Reservation', false],
            ['cpuLimit', 'CPU Limit', false],
            ['cpuReservation', 'CPU Reservation', false],
            ["createdAt", "Created At", true, (item) => formatDateTime(item.createdAt)],
            ["updatedAt", "Updated At", false, (item) => formatDateTime(item.updatedAt)],
        ]}
            data={data}
            onItemClickLink={(item) => `/project/app?appId=${item.id}`}
            actionCol={(item) =>
                <>
                    <div className="flex">
                        <div className="flex-1"></div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <Link href={`/project/app?appId=${item.id}`}>
                                    <DropdownMenuItem>
                                        <span>Show App Details</span>
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openDialog({
                                    title: "Delete App",
                                    description: "Are you sure you want to delete this app?",
                                }).then((result) => result ? Toast.fromAction(() => deleteApp(item.id)) : undefined)}>
                                    <span className="text-red-500">Delete App</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>}
        />
    </>
}