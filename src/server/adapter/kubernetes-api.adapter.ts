import k8s from '@kubernetes/client-node';

const k3sClientSingleton = () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault(); // todo update --> use security role
    const k8sApiClient = kc.makeApiClient(k8s.CoreV1Api);
    return k8sApiClient;
}

declare const globalThis: {
    k8sGlobal: ReturnType<typeof k3sClientSingleton>;
} & typeof global;

const k8sClient = globalThis.k8sGlobal ?? k3sClientSingleton()
if (process.env.NODE_ENV !== 'production') globalThis.k8sGlobal = k8sClient

class K3sApiAdapter {

    client = k8sClient;

}

const k3s = new K3sApiAdapter();
export default k3s;
