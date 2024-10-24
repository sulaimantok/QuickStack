import { revalidateTag, unstable_cache } from "next/cache";
import dataAccess from "../adapter/db.client";
import { Tags } from "../utils/cache-tag-generator.utils";
import { Prisma, Project } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

class ProjectService {

    async deleteById(id: string) {
        const existingItem = await this.getById(id);
        if (!existingItem) {
            return;
        }
        await dataAccess.client.project.delete({
            where: {
                id
            }
        });
        revalidateTag(Tags.projects());
    }

    async getAllProjects() {
        return await unstable_cache(async () => await dataAccess.client.project.findMany(),
            [Tags.projects()], {
            tags: [Tags.projects()]
        })();
    }

    async getById(id: string) {
        return dataAccess.client.project.findUnique({
            where: {
                id
            }
        });
    }

    async save(property: Prisma.ProjectUncheckedCreateInput | Prisma.ProjectUncheckedUpdateInput) {
        let savedItem: Prisma.Prisma__ProjectClient<Project, never, DefaultArgs>;
        if (property.id) {
            savedItem = dataAccess.client.project.update({
                where: {
                    id: property.id as string
                },
                data: property
            });
        } else {
            savedItem = dataAccess.client.project.create({
                data: property as Prisma.ProjectUncheckedCreateInput
            });
        }

        revalidateTag(Tags.projects());
        return savedItem;
    }
}

const projectService = new ProjectService();
export default projectService;
