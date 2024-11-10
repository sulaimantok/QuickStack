import k3s from "@/server/adapter/kubernetes-api.adapter";
import appService from "@/server/services/app.service";
import deploymentService from "@/server/services/deployment.service";
import { simpleRoute } from "@/server/utils/action-wrapper.utils";
import { Informer, V1Pod } from "@kubernetes/client-node";
import { z } from "zod";
import * as k8s from '@kubernetes/client-node';

// Prevents this route's response from being cached
export const dynamic = "force-dynamic";

const zodInputModel = z.object({
    appId: z.string(),
});

export async function POST(request: Request) {
    return simpleRoute(async () => {
        const input = await request.json();
        const podInfo = zodInputModel.parse(input);
        let { appId } = podInfo;

        const app = await appService.getById(appId);
        const namespace = app.projectId;
        // Source:
        // https://github.com/kubernetes-client/javascript/blob/master/examples/typescript/informer/informer-with-label-selector.ts
        // https://github.com/kubernetes-client/javascript/blob/master/examples/typescript/watch/watch-example.ts

        let informer: Informer<V1Pod>;
        const encoder = new TextEncoder()

        const customReadable = new ReadableStream({
            start(controller) {

                const getDeploymentStatus = async () => {
                    console.log(`Getting Deployment Status for app ${appId}`);
                    const deploymentStatus = await deploymentService.getDeploymentStatus(app.projectId, app.id);
                    controller.enqueue(encoder.encode(deploymentStatus))
                };

                informer = k8s.makeInformer(
                    k3s.getKubeConfig(),
                    `/api/v1/namespaces/${namespace}/pods`,
                    () => k3s.core.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, `app=${app.id}`)
                );

                informer.on('add', () => getDeploymentStatus());
                informer.on('update', () => getDeploymentStatus());
                informer.on('change', () => getDeploymentStatus());
                informer.on('delete', () => getDeploymentStatus());
                informer.on('error', async (err: any) => {
                    console.error(`Error while listening for Deplyoment Changes for app ${appId}: `, err);

                    // Try to restart informer after 5sec
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    informer.start();
                });
                getDeploymentStatus(); // Initial status
            },
            cancel() {
                console.log("Stream closed.")
                informer?.stop();
            }
        });

        return new Response(customReadable, {
            headers: {
                Connection: "keep-alive",
                "Content-Encoding": "none",
                "Cache-Control": "no-cache, no-transform",
                "Content-Type": "text/event-stream; charset=utf-8",
            },
        });
    });
}