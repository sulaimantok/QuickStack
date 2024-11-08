import { revalidateTag, unstable_cache } from "next/cache";
import dataAccess from "../adapter/db.client";
import { Tags } from "../utils/cache-tag-generator.utils";
import { Prisma, Project } from "@prisma/client";
import { StringUtils } from "../utils/string.utils";
import deploymentService from "./deployment.service";
import namespaceService from "./namespace.service";

class ProjectService {

    async deleteById(id: string) {
        const existingItem = await this.getById(id);
        if (!existingItem) {
            return;
        }
        try {
            await namespaceService.deleteNamespace(existingItem.id);
            await dataAccess.client.project.delete({
                where: {
                    id
                }
            });
        } finally {
            revalidateTag(Tags.projects());
        }
    }

    async getAllProjects() {
        return await unstable_cache(async () => await dataAccess.client.project.findMany(),
            [Tags.projects()], {
            tags: [Tags.projects()]
        })();
    }

    async getById(id: string) {
        return dataAccess.client.project.findFirstOrThrow({
            where: {
                id
            }
        });
    }

    async save(item: Prisma.ProjectUncheckedCreateInput | Prisma.ProjectUncheckedUpdateInput) {
        let savedItem: Project;
        try {
            if (item.id) {
                savedItem = await dataAccess.client.project.update({
                    where: {
                        id: item.id as string
                    },
                    data: item
                });
            } else {
                item.id = StringUtils.toProjectId(item.name as string);
                savedItem = await dataAccess.client.project.create({
                    data: item as Prisma.ProjectUncheckedCreateInput
                });
            }
            await namespaceService.createNamespaceIfNotExists(savedItem.id);
        } finally {
            revalidateTag(Tags.projects());
        }
        return savedItem;
    }
}

const projectService = new ProjectService();
export default projectService;
