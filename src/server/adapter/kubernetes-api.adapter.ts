import * as k8s from '@kubernetes/client-node';
/*
const getKubeConfig = () => {
    const kc = new k8s.KubeConfig();
    if (process.env.NODE_ENV === 'production') {
        kc.loadFromCluster();
    } else {
        kc.loadFromFile('/workspace/kube-config.config');
    }
    return kc;
}

const getK8sCoreApiClient = () => {
    const kc = getKubeConfig()
    const k8sCoreClient = kc.makeApiClient(k8s.CoreV1Api);
    return k8sCoreClient;
}
const k8sCoreClient = globalThis.k8sCoreGlobal ?? getK8sCoreApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sCoreGlobal = k8sCoreClient

const getK8sAppsApiClient = () => {
    const kc = getKubeConfig()
    const k8sCoreClient = kc.makeApiClient(k8s.AppsV1Api);
    return k8sCoreClient;
}
const k8sAppsClient = globalThis.k8sAppsGlobal ?? getK8sAppsApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sAppsGlobal = k8sAppsClient

const getK8sBatchApiClient = () => {
    const kc = getKubeConfig()
    const k8sJobClient = kc.makeApiClient(k8s.BatchV1Api);
    return k8sJobClient;
}
const k8sJobClient = globalThis.k8sJobGlobal ?? getK8sBatchApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sJobGlobal = k8sJobClient


const getK8sLogApiClient = () => {
    const kc = getKubeConfig()
    const logClient = new k8s.Log(kc)
    return logClient;
}
const k8sLogClient = globalThis.k8sLogGlobal ?? getK8sLogApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sLogGlobal = k8sLogClient

const getK8sCustomObjectsApiClient = () => {
    const kc = getKubeConfig()
    const client = kc.makeApiClient(k8s.CustomObjectsApi);
    return client;
}
const k8sCustomObjectsClient = globalThis.k8sCustomObjectsGlobal ?? getK8sCustomObjectsApiClient()
if (process.env.NODE_ENV !== 'production') globalThis.k8sCustomObjectsGlobal = k8sCustomObjectsClient

const getK8sNetworkApiClient = () => {
    const kc = getKubeConfig()
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

*/

class K3sApiAdapter {

    core: k8s.CoreV1Api;
    apps: k8s.AppsV1Api;
    batch: k8s.BatchV1Api;
    log: k8s.Log;
    network: k8s.NetworkingV1Api;
    customObjects: k8s.CustomObjectsApi;

    constructor() {
        this.core = this.getK8sCoreApiClient();
        this.apps = this.getK8sAppsApiClient();
        this.batch = this.getK8sBatchApiClient();
        this.log = this.getK8sLogApiClient();
        this.network = this.getK8sNetworkApiClient();
        this.customObjects = this.getK8sCustomObjectsApiClient();
    }

    getKubeConfig = () => {
        const kc = new k8s.KubeConfig();
        if (process.env.NODE_ENV === 'production') {
            kc.loadFromCluster();
        } else {
            kc.loadFromFile('/workspace/kube-config.config');
        }
        return kc;
    }

    getK8sCoreApiClient = () => {
        const kc = this.getKubeConfig()
        const k8sCoreClient = kc.makeApiClient(k8s.CoreV1Api);
        return k8sCoreClient;
    }

    getK8sAppsApiClient = () => {
        const kc = this.getKubeConfig()
        const k8sCoreClient = kc.makeApiClient(k8s.AppsV1Api);
        return k8sCoreClient;
    }

    getK8sBatchApiClient = () => {
        const kc = this.getKubeConfig()
        const k8sJobClient = kc.makeApiClient(k8s.BatchV1Api);
        return k8sJobClient;
    }

    getK8sLogApiClient = () => {
        const kc = this.getKubeConfig()
        const logClient = new k8s.Log(kc)
        return logClient;
    }

    getK8sCustomObjectsApiClient = () => {
        const kc = this.getKubeConfig()
        const client = kc.makeApiClient(k8s.CustomObjectsApi);
        return client;
    }

    getK8sNetworkApiClient = () => {
        const kc = this.getKubeConfig()
        const networkClient = kc.makeApiClient(k8s.NetworkingV1Api);
        return networkClient;
    }
}

const k3s = new K3sApiAdapter();
export default k3s;
