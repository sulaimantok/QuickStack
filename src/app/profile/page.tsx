'use server'

import { getAuthUserSession } from "@/server/utils/action-wrapper.utils";
import projectService from "@/server/services/project.service";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import PageTitle from "@/components/custom/page-title";
import ProfilePasswordChange from "./profile-password-change";

export default async function ProjectPage() {

    await getAuthUserSession();
    const data = await projectService.getAllProjects();
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/profile">Profile</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <PageTitle
                title={'Profile'}
                subtitle={`View or edit your Profile information and configure your authentication.`}>
            </PageTitle>
            <ProfilePasswordChange />
        </div>
    )
}
