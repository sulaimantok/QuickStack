import { ServiceException } from "@/shared/model/service.exception.model";
import paramService, { ParamService } from "./param.service";


class TraefikMeDomainService {

    async getDomainForApp(appId: string, prefix?: string) {
        const publicIpv4 = await paramService.getString(ParamService.PUBLIC_IPV4_ADDRESS);
        if (!publicIpv4) {
            throw new ServiceException('Please set the main public IPv4 address in the QuickStack settings first.');
        }
        const traefikFriendlyIpv4 = publicIpv4.split('.').join('-');
        if (prefix) {
            return `${prefix}-${appId}-${traefikFriendlyIpv4}.traefik.me`;
        }
        return `${appId}-${traefikFriendlyIpv4}.traefik.me`;
    }
}

const traefikMeDomainService = new TraefikMeDomainService();
export default traefikMeDomainService;