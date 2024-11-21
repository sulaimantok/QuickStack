'use server'

import { getAuthUserSession } from "@/server/utils/action-wrapper.utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb"
import PageTitle from "@/components/custom/page-title";
import userService from "@/server/services/user.service";
import paramService, { ParamService } from "@/server/services/param.service";
import QuickStackIngressSettings from "./qs-ingress-settings";
import QuickStackLetsEncryptSettings from "./qs-letsencrypt-settings";

export default async function ProjectPage() {

    const session = await getAuthUserSession();
    const serverUrl = await paramService.getString(ParamService.QS_SERVER_HOSTNAME, '');
    const disableNodePortAccess = await paramService.getBoolean(ParamService.DISABLE_NODEPORT_ACCESS, false);
    const letsEncryptMail = await paramService.getString(ParamService.LETS_ENCRYPT_MAIL, session.email);
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageTitle
                title={'Server Settings'}
                subtitle={`View or edit Server Settings`}>
            </PageTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><QuickStackIngressSettings disableNodePortAccess={disableNodePortAccess!} serverUrl={serverUrl!} /></div>
                <div> <QuickStackLetsEncryptSettings letsEncryptMail={letsEncryptMail!} /></div>
            </div>
        </div>
    )
}
