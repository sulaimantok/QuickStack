import { revalidateTag, unstable_cache } from "next/cache";
import dataAccess from "../adapter/db.client";
import { Tags } from "../utils/cache-tag-generator.utils";
import { Prisma, Project } from "@prisma/client";
import { StringUtils } from "../utils/string.utils";
import deploymentService from "./deployment.service";
import k3s from "../adapter/kubernetes-api.adapter";

class LogService {
/*
    async streamLogs(namespace: string, podName: string, containerName: string, logStream: NodeJS.WritableStream) {
        const req = await k3s.log.log(namespace, podName, containerName, logStream, {
            follow: true,
            pretty: false,
            tailLines: 100,
        });

        return req;
    }*/

}

const logService = new LogService();
export default logService;
