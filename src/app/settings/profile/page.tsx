'use server'

import { getAuthUserSession } from "@/server/utils/action-wrapper.utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import PageTitle from "@/components/custom/page-title";
import ProfilePasswordChange from "./profile-password-change";
import ToTpSettings from "./totp-settings";
import userService from "@/server/services/user.service";
import BreadcrumbsSettings from "./profile-breadcrumbs";

export default async function ProjectPage() {

    const session = await getAuthUserSession();
    const data = await userService.getUserByEmail(session.email);
    return (
        <div className="flex-1 space-y-4 pt-6">
            <PageTitle
                title={'Profile'}
                subtitle={`View or edit your Profile information and configure your authentication.`}>
            </PageTitle>
            <BreadcrumbsSettings />
            <ProfilePasswordChange />
            <ToTpSettings totpEnabled={data.twoFaEnabled} />
        </div>
    )
}
