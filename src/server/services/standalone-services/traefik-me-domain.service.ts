import { ServiceException } from "../../../shared/model/service.exception.model";
import paramService, { ParamService } from "../param.service";
import traefikMeAdapter from "../../adapter/traefik-me.adapter";
import { V1Secret } from "@kubernetes/client-node";
import secretService from "../secret.service";
import { Constants } from "../../../shared/utils/constants";
import dataAccess from "../../adapter/db.client";
import scheduleService from "./schedule.service";

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

    async updateTraefikMeCertificate() {
        const fullChainCert = await traefikMeAdapter.getFullChainCertificate();
        const privateKey = await traefikMeAdapter.getCurrentPrivateKey();

        const projects = await dataAccess.client.project.findMany();
        const secretName = Constants.TRAEFIK_ME_SECRET_NAME;

        for (const project of projects) {
            const secretManifest: V1Secret = {
                metadata: {
                    name: secretName,
                },
                data: {
                    'tls.crt': Buffer.from(fullChainCert).toString('base64'),
                    'tls.key': Buffer.from(privateKey).toString('base64'),
                },
                type: 'kubernetes.io/tls',
            };
            await secretService.saveSecret(project.id, secretName, secretManifest);
        }
    }

    configureSchedulingForTraefikMeCertificateUpdate() {
        scheduleService.scheduleJob('traefik-me-certificate-update', '0 1 * * *', async () => {
            await this.updateTraefikMeCertificate();
        });
    }
}

const traefikMeDomainService = new TraefikMeDomainService();
export default traefikMeDomainService;