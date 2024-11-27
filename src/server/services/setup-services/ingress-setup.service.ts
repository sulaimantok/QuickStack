import k3s from "../../adapter/kubernetes-api.adapter";

const traefikNamespace = 'kube-system';

class IngressSetupService {

    async checkIfTraefikRedirectMiddlewareExists() {
        const res = await k3s.customObjects.listNamespacedCustomObject(
            'traefik.io',            // group
            'v1alpha1',              // version
            traefikNamespace,        // namespace
            'middlewares'            // plural name of the custom resource
        );
        return (res.body as any) && (res.body as any)?.items && (res.body as any)?.items?.length > 0;
    }

    async createTraefikRedirectMiddlewareIfNotExist() {
        if (await this.checkIfTraefikRedirectMiddlewareExists()) {
            return;
        }

        const middlewareManifest = {
            apiVersion: 'traefik.io/v1alpha1',
            kind: 'Middleware',
            metadata: {
                name: 'redirect-to-https',
                namespace: traefikNamespace,
            },
            spec: {
                redirectScheme: {
                    scheme: 'https',
                    permanent: true,
                }
            },
        };

        await k3s.customObjects.createNamespacedCustomObject(
            'traefik.io',           // group
            'v1alpha1',             // version
            traefikNamespace,       // namespace
            'middlewares',          // plural name of the custom resource
            middlewareManifest      // object manifest
        );
    }
}

const ingressSetupService = new IngressSetupService();
export default ingressSetupService;
