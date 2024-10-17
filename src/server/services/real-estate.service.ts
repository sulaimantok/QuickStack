/*

import { Prisma, RealEstate } from "@prisma/client";
import dataAccess from "../data-access/data-access.client";
import { revalidateTag, unstable_cache } from "next/cache";
import { Tags } from "../utils/cache-tag-generator.utils";
import { DefaultArgs } from "@prisma/client/runtime/library";


export class RealEstateService {

    async deleteRealEstate(id: string) {
        const existingItem = await this.getRealEstateById(id);
        if (!existingItem) {
            return;
        }
        await dataAccess.client.realEstate.delete({
            where: {
                id
            }
        });
        revalidateTag(Tags.realEstates(existingItem.landlordId));
    }

    async getRealEstatesForLandlord(landlordId: string) {
        return await unstable_cache(async (landlordId: string) => await dataAccess.client.realEstate.findMany({
            where: {
                landlordId
            }
        }),
            [Tags.realEstates(landlordId)], {
            tags: [Tags.realEstates(landlordId)]
        })(landlordId);
    }

    async getRealEstateById(id: string) {
        return dataAccess.client.realEstate.findUnique({
            where: {
                id
            }
        });
    }

    async getCurrentLandlordIdFromRealEstate(realEstateId: string) {
        const property = await dataAccess.client.realEstate.findUnique({
            select: {
                landlordId: true
            },
            where: {
                id: realEstateId
            }
        });
        return property?.landlordId;
    }

    async saveRealEstate(property: Prisma.RealEstateUncheckedCreateInput | Prisma.RealEstateUncheckedUpdateInput) {

        let savedProperty: Prisma.Prisma__RealEstateClient<RealEstate, never, DefaultArgs>;
        if (property.id) {
            savedProperty = dataAccess.client.realEstate.update({
                where: {
                    id: property.id as string
                },
                data: property
            });
        } else {
            savedProperty = dataAccess.client.realEstate.create({
                data: property as Prisma.RealEstateUncheckedCreateInput
            });
        }

        revalidateTag(Tags.realEstates(property.landlordId as string));
        return savedProperty;
    }

}

const realEstateService = new RealEstateService();
export default realEstateService;*/