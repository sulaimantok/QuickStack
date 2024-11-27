import { PodsInfoModel } from "@/shared/model/pods-info.model";
import k3s from "../adapter/kubernetes-api.adapter";
import { ServiceException } from "@/shared/model/service.exception.model";
import setupPodService from "./setup-services/setup-pod.service";


class PodService {

    async waitUntilPodIsRunningFailedOrSucceded(projectId: string, podName: string) {
        const isPodRunnning = await setupPodService.waitUntilPodIsRunningFailedOrSucceded(projectId, podName);
        if (!isPodRunnning) {
            throw new ServiceException(`Pod ${podName} did not become ready in time (timeout).`);
        }
    }

    async getPodInfoByName(projectId: string, podName: string) {
        const res = await k3s.core.readNamespacedPod(podName, projectId);
        return {
            podName: res.body.metadata?.name!,
            containerName: res.body.spec?.containers?.[0].name!
        } as PodsInfoModel;
    }

    async getPodsForApp(projectId: string, appId: string): Promise<PodsInfoModel[]> {
        return setupPodService.getPodsForApp(projectId, appId);
    }
}

const podService = new PodService();
export default podService;
