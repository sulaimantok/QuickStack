'use client'

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { SimpleDataTable } from "@/components/custom/simple-data-table";
import { formatDateTime } from "@/lib/format.utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Toast } from "@/lib/toast.utils";
import { Project } from "@prisma/client";
import { deleteApp } from "./actions";



export default function AppTable({ data }: { data: Project[] }) {

    return <>
        <SimpleDataTable columns={[
            ['id', 'ID', false],
            ['name', 'Name', true],
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
                                <DropdownMenuItem onClick={() => Toast.fromAction(() => deleteApp(item.id))}>
                                    <span className="text-red-500">Delete App</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>}
        />
    </>
}