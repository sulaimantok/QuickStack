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
import { AppleIcon, Calendar, ChartNoAxesCombined, ChevronDown, ChevronUp, FolderClosed, Home, Inbox, Plus, Search, Server, Settings, Settings2, User, User2 } from "lucide-react"
import Link from "next/link"
import { CreateProjectDialog } from "./projects/create-project-dialog"
import projectService from "@/server/services/project.service"
import { getAuthUserSession, getUserSession } from "@/server/utils/action-wrapper.utils"
import { SidebarLogoutButton } from "./sidebar-logout-button"

const monitoringMenu = [
  {
    title: "Overall Cluster",
    url: "/Montioring",
    icon: Home,
  },
]

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
      <SidebarHeader />
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
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton asChild>
                      <Link href="/monitoring">
                        <ChartNoAxesCombined />
                        <span>Monitoring</span>
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {monitoringMenu.map((item) => (
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
                <SidebarMenuButton>
                  <User2 /> {session.email}
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
