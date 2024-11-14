import { revalidateTag, unstable_cache } from "next/cache";
import dataAccess from "../adapter/db.client";
import { Tags } from "../utils/cache-tag-generator.utils";
import { App, AppDomain, AppVolume, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { AppExtendedModel } from "@/model/app-extended.model";
import { ServiceException } from "@/model/service.exception.model";
import { StringUtils } from "../utils/string.utils";
import deploymentService from "./deployment.service";
import buildService, { BUILD_NAMESPACE } from "./build.service";
import namespaceService from "./namespace.service";
import ingressService from "./ingress.service";
import pvcService from "./pvc.service";
import svcService from "./svc.service";

class AppService {

    async buildAndDeploy(appId: string) {
        const app = await this.getExtendedById(appId);
        if (app.sourceType === 'GIT') {
            // first make build
            await namespaceService.createNamespaceIfNotExists(BUILD_NAMESPACE);
            const [buildJobName, buildPromise] = await buildService.buildApp(app);
            buildPromise.then(async () => {
                console.warn('Build job finished, deploying...');
                await deploymentService.createDeployment(app, buildJobName);
            });
        } else {
            // only deploy
            await deploymentService.createDeployment(app);
        }
    }

    async deleteById(id: string) {
        const existingApp = await this.getById(id);
        if (!existingApp) {
            return;
        }
        try {
            await svcService.deleteService(existingApp.projectId, existingApp.id);
            await deploymentService.deleteDeployment(existingApp.projectId, existingApp.id);
            await ingressService.deleteAllIngressForApp(existingApp.projectId, existingApp.id);
            await pvcService.deleteAllPvcOfApp(existingApp.projectId, existingApp.id);
            await buildService.deleteAllBuildsOfApp(existingApp.id);
            await dataAccess.client.app.delete({
                where: {
                    id
                }
            });
        } finally {
            revalidateTag(Tags.apps(existingApp.projectId));
            revalidateTag(Tags.app(existingApp.id));
        }
    }

    async getAllAppsByProjectID(projectId: string) {
        return await unstable_cache(async (projectId: string) => await dataAccess.client.app.findMany({
            where: {
                projectId
            }
        }),
            [Tags.apps(projectId)], {
            tags: [Tags.apps(projectId)]
        })(projectId as string);
    }

    async getExtendedById(appId: string): Promise<AppExtendedModel> {
        return await unstable_cache(async (id: string) => await dataAccess.client.app.findFirstOrThrow({
            where: {
                id
            }, include: {
                project: true,
                appDomains: true,
                appVolumes: true,
            }
        }),
            [Tags.app(appId)], {
            tags: [Tags.app(appId)]
        })(appId);
    }

    async getById(appId: string) {
        return await unstable_cache(async (id: string) => await dataAccess.client.app.findFirstOrThrow({
            where: {
                id
            }
        }),
            [Tags.app(appId)], {
            tags: [Tags.app(appId)]
        })(appId);
    }

    async save(item: Prisma.AppUncheckedCreateInput | Prisma.AppUncheckedUpdateInput) {
        let savedItem: Prisma.Prisma__AppClient<App, never, DefaultArgs>;
        try {
            if (item.id) {
                savedItem = dataAccess.client.app.update({
                    where: {
                        id: item.id as string
                    },
                    data: item
                });
            } else {
                item.id = StringUtils.toAppId(item.name as string);
                savedItem = dataAccess.client.app.create({
                    data: item as Prisma.AppUncheckedCreateInput
                });
            }
        } finally {
            revalidateTag(Tags.apps(item.projectId as string));
            revalidateTag(Tags.app(item.id as string));
        }
        return savedItem;
    }

    async saveDomain(domainToBeSaved: Prisma.AppDomainUncheckedCreateInput | Prisma.AppDomainUncheckedUpdateInput) {
        let savedItem: AppDomain;
        const existingApp = await this.getExtendedById(domainToBeSaved.appId as string);
        const existingDomainWithSameHostname = await dataAccess.client.appDomain.findFirst({
            where: {
                hostname: domainToBeSaved.hostname as string,
            }
        });
        if (domainToBeSaved.id && domainToBeSaved.id !== existingDomainWithSameHostname?.id) {
            throw new ServiceException("Hostname is already in use by this or another app.");
        }
        try {
            if (domainToBeSaved.id) {
                savedItem = await dataAccess.client.appDomain.update({
                    where: {
                        id: domainToBeSaved.id as string
                    },
                    data: domainToBeSaved
                });
            } else {
                savedItem = await dataAccess.client.appDomain.create({
                    data: domainToBeSaved as Prisma.AppDomainUncheckedCreateInput
                });
            }

        } finally {
            revalidateTag(Tags.apps(existingApp.projectId as string));
            revalidateTag(Tags.app(existingApp.id as string));
        }
        return savedItem;
    }

    async deleteDomainById(id: string) {
        const existingDomain = await dataAccess.client.appDomain.findFirst({
            where: {
                id
            }, include: {
                app: true
            }
        });
        if (!existingDomain) {
            return;
        }
        try {
            await dataAccess.client.appDomain.delete({
                where: {
                    id
                }
            });
        } finally {
            revalidateTag(Tags.app(existingDomain.appId));
            revalidateTag(Tags.apps(existingDomain.app.projectId));
        }
    }

    async getVolumeById(id: string) {
        return await dataAccess.client.appVolume.findFirst({
            where: {
                id
            }
        });
    }

    async saveVolume(volumeToBeSaved: Prisma.AppVolumeUncheckedCreateInput | Prisma.AppVolumeUncheckedUpdateInput) {
        let savedItem: AppVolume;
        const existingApp = await this.getExtendedById(volumeToBeSaved.appId as string);
        const existingAppWithSameVolumeMountPath = await dataAccess.client.appVolume.findFirst({
            where: {
                appId: volumeToBeSaved.appId as string,
                containerMountPath: volumeToBeSaved.containerMountPath as string,
            }
        });
        if (volumeToBeSaved.appId == existingAppWithSameVolumeMountPath?.appId && volumeToBeSaved.id !== existingAppWithSameVolumeMountPath?.id) {
            throw new ServiceException("Volume mount path is already in use from another volume within the same app.");
        }
        try {
            if (volumeToBeSaved.id) {
                savedItem = await dataAccess.client.appVolume.update({
                    where: {
                        id: volumeToBeSaved.id as string
                    },
                    data: volumeToBeSaved
                });
            } else {
                savedItem = await dataAccess.client.appVolume.create({
                    data: volumeToBeSaved as Prisma.AppVolumeUncheckedCreateInput
                });
            }

        } finally {
            revalidateTag(Tags.apps(existingApp.projectId as string));
            revalidateTag(Tags.app(existingApp.id as string));
        }
        return savedItem;
    }

    async deleteVolumeById(id: string) {
        const existingVolume = await dataAccess.client.appVolume.findFirst({
            where: {
                id
            }, include: {
                app: true
            }
        });
        if (!existingVolume) {
            return;
        }
        try {
            await dataAccess.client.appVolume.delete({
                where: {
                    id
                }
            });
        } finally {
            revalidateTag(Tags.app(existingVolume.appId));
            revalidateTag(Tags.apps(existingVolume.app.projectId));
        }
    }
}

const appService = new AppService();
export default appService;
