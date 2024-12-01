'use client'

import { signOut } from "next-auth/react";
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
    SidebarMenuSubItem
} from "@/components/ui/sidebar"
import { AppleIcon, Calendar, ChartNoAxesCombined, ChevronDown, ChevronUp, FolderClosed, Home, Inbox, LogOut, Plus, Search, Server, Settings, Settings2, User, User2 } from "lucide-react"
import Link from "next/link"
import { CreateProjectDialog } from "./projects/create-project-dialog"
import projectService from "@/server/services/project.service"
import { getAuthUserSession } from "@/server/utils/action-wrapper.utils"
import { useConfirmDialog } from "@/frontend/states/zustand.states";

export function SidebarLogoutButton() {

    const { openDialog } = useConfirmDialog();

    const signOutAsync = async () => {
        if (!await openDialog({
            title: "Sign out",
            description: "Are you sure you want to sign out?",
            yesButton: "Sign out",
        })) {
            return;
        }
        await signOut({
            callbackUrl: undefined,
            redirect: false
        });
        window.open("/auth", "_self");
    }
    return (
        <DropdownMenuItem onClick={() => signOutAsync()}>
            <LogOut />
            <span>Sign out</span>
        </DropdownMenuItem>
    )
}
