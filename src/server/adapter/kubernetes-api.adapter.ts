import * as k8s from '@kubernetes/client-node';

const getK8sCoreApiClient = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('/workspace/kube-config.config'); // todo update --> use security role
    const k8sCoreClient = kc.makeApiClient(k8s.CoreV1Api);
    return k8sCoreClient;
}

const getK8sAppsApiClient = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('/workspace/kube-config.config'); // todo update --> use security role
    const k8sCoreClient = kc.makeApiClient(k8s.AppsV1Api);
    return k8sCoreClient;
}

declare const globalThis: {
    k8sCoreGlobal: ReturnType<typeof getK8sCoreApiClient>;
    k8sAppsGlobal: ReturnType<typeof getK8sAppsApiClient>;
} & typeof global;

const k8sCoreClient = globalThis.k8sCoreGlobal ?? getK8sCoreApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sCoreGlobal = k8sCoreClient


const k8sAppsClient = globalThis.k8sAppsGlobal ?? getK8sAppsApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sAppsGlobal = k8sAppsClient

class K3sApiAdapter {
    core = k8sCoreClient;
    apps = k8sAppsClient;
}

const k3s = new K3sApiAdapter();
export default k3s;
