import { revalidateTag, unstable_cache } from "next/cache";
import dataAccess from "../adapter/db.client";
import { Tags } from "../utils/cache-tag-generator.utils";
import { Parameter, Prisma } from "@prisma/client";

export class ParamService {

    static readonly QS_SERVER_HOSTNAME = 'qsServerHostname';
    static readonly DISABLE_NODEPORT_ACCESS = 'disableNodePortAccess';
    static readonly LETS_ENCRYPT_MAIL = 'letsEncryptMail';

    async get(name: string) {
        return await unstable_cache(async (name: string) => await dataAccess.client.parameter.findFirstOrThrow({
            where: {
                name
            }
        }),
            [Tags.parameter()], {
            tags: [Tags.parameter()]
        })(name);
    }

    async getOrUndefined(name: string) {
        return await unstable_cache(async (name: string) => await dataAccess.client.parameter.findUnique({
            where: {
                name
            }
        }),
            [Tags.parameter()], {
            tags: [Tags.parameter()]
        })(name);
    }

    async getBoolean(name: string, defaultValue?: boolean) {
        const param = await this.getOrUndefined(name);
        if (param) {
            return param.value === 'true';
        }
        if (defaultValue) {
            await this.save({
                name,
                value: defaultValue.toString()
            });
            return defaultValue;
        }
        return undefined;
    }

    async getString(name: string, defaultValue?: string) {
        const param = await this.getOrUndefined(name);
        if (param) {
            return param.value;
        }
        if (defaultValue) {
            await this.save({
                name,
                value: defaultValue
            });
            return defaultValue;
        }
        return undefined;
    }

    async getNumber(name: string, defaultValue?: number) {
        const param = await this.getOrUndefined(name);
        if (param) {
            return Number(param.value);
        }
        if (defaultValue) {
            await this.save({
                name,
                value: defaultValue.toString()
            });
            return defaultValue;
        }
        return undefined;
    }

    async deleteByName(name: string) {
        const existingParam = await this.get(name);
        if (!existingParam) {
            return;
        }
        try {
            await dataAccess.client.parameter.delete({
                where: {
                    name
                }
            });
        } finally {
            revalidateTag(Tags.parameter());
        }
    }

    async getAllParams() {
        return await unstable_cache(async () => await dataAccess.client.parameter.findMany(),
            [Tags.parameter()], {
            tags: [Tags.parameter()]
        })();
    }


    async save(item: Prisma.ParameterUncheckedCreateInput | Prisma.ParameterUncheckedUpdateInput) {
        let savedItem: Parameter;
        try {
            const existingParam = await this.getOrUndefined(item.name as string);
            if (existingParam) {
                savedItem = await dataAccess.client.parameter.update({
                    where: {
                        name: item.name as string
                    },
                    data: {

                    }
                });
            } else {
                savedItem = await dataAccess.client.parameter.create({
                    data: item as Prisma.ParameterUncheckedCreateInput
                });
            }
        } finally {
            revalidateTag(Tags.parameter());
        }
        return savedItem;
    }

}

const paramService = new ParamService();
export default paramService;
