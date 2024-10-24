import { revalidateTag, unstable_cache } from "next/cache";
import dataAccess from "../adapter/db.client";
import { Tags } from "../utils/cache-tag-generator.utils";
import { App, Prisma, Project } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

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
    }

    async getAllAppsByProjectID(projectId: string) {
        return await unstable_cache(async (projectId:string) => await dataAccess.client.app.findMany({
            where: {
                projectId
            }
        }),
            [Tags.apps(projectId)], {
            tags: [Tags.apps(projectId)]
        })(projectId as string);
    }

    async getById(id: string) {
        return dataAccess.client.app.findFirstOrThrow({
            where: {
                id
            }
        });
    }

    async save(item: Prisma.AppUncheckedCreateInput | Prisma.AppUncheckedUpdateInput) {
        let savedItem: Prisma.Prisma__AppClient<App, never, DefaultArgs>;
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

        revalidateTag(Tags.apps(item.projectId as string));
        return savedItem;
    }
}

const appService = new AppService();
export default appService;
