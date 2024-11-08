import k3s from "../adapter/kubernetes-api.adapter";
import { ServiceException } from "@/model/service.exception.model";


class PodService {

    async waitUntilPodIsRunningFailedOrSucceded(projectId: string, podName: string) {
        const timeout = 120000;
        const interval = 1000;
        const maxTries = timeout / interval;
        let tries = 0;

        while (tries < maxTries) {
            const pod = await this.getPodOrUndefined(projectId, podName);
            if (pod && ['Running', 'Failed', 'Succeeded'].includes(pod.status?.phase!)) {
                return;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
            tries++;
        }

        throw new ServiceException(`Pod ${podName} did not become ready in time (${timeout}ms).`);
    }

    async getPodOrUndefined(projectId: string, podName: string) {
        const res = await k3s.core.readNamespacedPod(podName, projectId);
        return res.body;
    }
}

const podService = new PodService();
export default podService;
