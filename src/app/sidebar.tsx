import projectService from "@/server/services/project.service"
import { getUserSession } from "@/server/utils/action-wrapper.utils"
import { SidebarCient } from "./sidebar-client"
import { UserGroupUtils } from "@/shared/utils/role.utils";

export async function AppSidebar() {

  const session = await getUserSession();

  if (!session) {
    return <></>
  }

  const projects = await projectService.getAllProjects();

  const relevantProjectsForUser = projects.filter((project) =>
    UserGroupUtils.sessionHasReadAccessToProject(session, project.id));
  for (const project of relevantProjectsForUser) {
    project.apps = project.apps.filter((app) => UserGroupUtils.sessionHasReadAccessForApp(session, app.id));
  }

  return <SidebarCient projects={relevantProjectsForUser} session={session} />
}
