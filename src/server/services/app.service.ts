import { revalidateTag, unstable_cache } from "next/cache";
import dataAccess from "../adapter/db.client";
import { Tags } from "../utils/cache-tag-generator.utils";
import { App, AppDomain, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { AppExtendedModel } from "@/model/app-extended.model";
import { ServiceException } from "@/model/service.exception.model";

class AppService {

    async deleteById(id: string) {
        const existingItem = await this.getById(id);
        if (!existingItem) {
            return;
        }
        await dataAccess.client.app.delete({
            where: {
                id
            }
        });
        revalidateTag(Tags.apps(existingItem.projectId));
        revalidateTag(Tags.app(existingItem.id));
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
}

const appService = new AppService();
export default appService;
