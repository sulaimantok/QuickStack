'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarTrigger
} from "@/components/ui/sidebar"
import { AppleIcon, Calendar, ChartNoAxesCombined, ChevronDown, ChevronUp, FolderClosed, Home, Inbox, Plus, Search, Server, Settings, Settings2, User, User2 } from "lucide-react"
import Link from "next/link"
import { CreateProjectDialog } from "../../app/projects/create-project-dialog"
import projectService from "@/server/services/project.service"
import { getAuthUserSession } from "@/server/utils/action-wrapper.utils"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/frontend/states/zustand.states"

export function BreadcrumbsGenerator() {

    const { breadcrumbs } = useBreadcrumbs();

    return (
        <div className="-ml-1 flex gap-4 items-center">
            <SidebarTrigger />
            {breadcrumbs && <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((x, index) => (<>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem key={x.name}>
                            <BreadcrumbLink href={x.url ?? undefined}>{x.name}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </>))}
                </BreadcrumbList>
            </Breadcrumb>}
        </div>
    )
}
