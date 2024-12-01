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
import { AppleIcon, BookOpen, Boxes, Calendar, ChartNoAxesCombined, ChevronDown, ChevronUp, FolderClosed, Home, Inbox, Info, Plus, Radio, Search, Server, Settings, Settings2, User, User2 } from "lucide-react"
import Link from "next/link"
import { CreateProjectDialog } from "./projects/create-project-dialog"
import projectService from "@/server/services/project.service"
import { getAuthUserSession, getUserSession } from "@/server/utils/action-wrapper.utils"
import { SidebarLogoutButton } from "./sidebar-logout-button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"


const settingsMenu = [
  {
    title: "Profile",
    url: "/settings/profile",
    icon: User,
  },
  {
    title: "QuickStack Settings",
    url: "/settings/server",
    icon: Settings,
  },
  {
    title: "Cluster",
    url: "/settings/cluster",
    icon: Server,
  },
]

export async function AppSidebar() {

  const session = await getUserSession();

  if (!session) {
    return <></>
  }

  const projects = await projectService.getAllProjects();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Boxes className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight my-4">
                    <span className="truncate font-semibold">QuickStack</span>
                    <span className="truncate text-xs">Admin Panel</span>
                  </div>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                <Link href="https://quickstack.dev" target="_blank">
                  <DropdownMenuItem>
                    <Info />
                    <span>QuickStack Website</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="https://docs.quickstack.dev" target="_blank">
                  <DropdownMenuItem>
                    <BookOpen />
                    <span>QuickStack Docs</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <FolderClosed />
                        <span>Projects</span>
                        <CreateProjectDialog>
                          <Plus className="ml-auto" />
                        </CreateProjectDialog>
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {projects.map((item) => (
                        <SidebarMenuSubItem key={item.id}>
                          <SidebarMenuButton asChild>
                            <Link href={`/project?projectId=${item.id}`}>
                              <span>{item.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/monitoring">
                      <ChartNoAxesCombined />
                      <span>Monitoring</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton asChild>
                      <Link href="/settings/profile">
                        <Settings2 />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {settingsMenu.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <Link href={item.url}>

                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{session.email.substring(0, 1) || 'Q'}</AvatarFallback>
                  </Avatar>
                  {session.email}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <Link href="/settings/profile">
                  <DropdownMenuItem>
                    <User />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <SidebarLogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
