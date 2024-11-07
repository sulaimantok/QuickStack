import * as k8s from '@kubernetes/client-node';

const getK8sCoreApiClient = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('/workspace/kube-config.config'); // todo update --> use security role
    const k8sCoreClient = kc.makeApiClient(k8s.CoreV1Api);
    return k8sCoreClient;
}
const k8sCoreClient = globalThis.k8sCoreGlobal ?? getK8sCoreApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sCoreGlobal = k8sCoreClient

const getK8sAppsApiClient = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('/workspace/kube-config.config'); // todo update --> use security role
    const k8sCoreClient = kc.makeApiClient(k8s.AppsV1Api);
    return k8sCoreClient;
}
const k8sAppsClient = globalThis.k8sAppsGlobal ?? getK8sAppsApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sAppsGlobal = k8sAppsClient

const getK8sBatchApiClient = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('/workspace/kube-config.config'); // todo update --> use security role
    const k8sJobClient = kc.makeApiClient(k8s.BatchV1Api);
    return k8sJobClient;
}
const k8sJobClient = globalThis.k8sJobGlobal ?? getK8sBatchApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sJobGlobal = k8sJobClient


const getK8sLogApiClient = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('/workspace/kube-config.config'); // todo update --> use security role
    const logClient = new k8s.Log(kc)
    return logClient;
}
const k8sLogClient = globalThis.k8sLogGlobal ?? getK8sLogApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sLogGlobal = k8sLogClient

const getK8sCustomObjectsApiClient = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('/workspace/kube-config.config'); // todo update --> use security role
    const client = kc.makeApiClient(k8s.CustomObjectsApi);
    return client;
}
const k8sCustomObjectsClient = globalThis.k8sCustomObjectsGlobal ?? getK8sCustomObjectsApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sCustomObjectsGlobal = k8sCustomObjectsClient

const getK8sNetworkApiClient = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile('/workspace/kube-config.config'); // todo update --> use security role
    const networkClient = kc.makeApiClient(k8s.NetworkingV1Api);
    return networkClient;
}
const k8sNetworkClient = globalThis.k8sNetworkGlobal ?? getK8sNetworkApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sNetworkGlobal = k8sNetworkClient

declare const globalThis: {
    k8sCoreGlobal: ReturnType<typeof getK8sCoreApiClient>;
    k8sAppsGlobal: ReturnType<typeof getK8sAppsApiClient>;
    k8sJobGlobal: ReturnType<typeof getK8sBatchApiClient>;
    k8sLogGlobal: ReturnType<typeof getK8sLogApiClient>;
    k8sNetworkGlobal: ReturnType<typeof getK8sNetworkApiClient>;
    k8sCustomObjectsGlobal: ReturnType<typeof getK8sCustomObjectsApiClient>;
} & typeof global;





class K3sApiAdapter {
    core = k8sCoreClient;
    apps = k8sAppsClient;
    batch = k8sJobClient;
    log = k8sLogClient;
    network = k8sNetworkClient;
    customObjects = k8sCustomObjectsClient;
}

const k3s = new K3sApiAdapter();
export default k3s;
