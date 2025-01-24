import traefikMeAdapter from "../../adapter/traefik-me.adapter";
import { V1Secret } from "@kubernetes/client-node";
import secretService from "../secret.service";
import { Constants } from "../../../shared/utils/constants";
import dataAccess from "../../adapter/db.client";
import scheduleService from "./schedule.service";

class TraefikMeDomainStandaloneService {

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

const traefikMeDomainStandaloneService = new TraefikMeDomainStandaloneService();
export default traefikMeDomainStandaloneService;