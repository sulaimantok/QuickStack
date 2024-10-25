import * as crypto from 'crypto';

export class StringUtils {

    static toSnakeCase(str: string): string {
        if (!str) {
            return str;
        }
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')   // Insert underscore between camel case boundaries
            .replace(/\s+/g, '_')                   // Replace spaces with underscores
            .replace(/[^\w_]+/g, '')                // Remove any non-alphanumeric characters except underscores
            .toLowerCase();                         // Convert to lowercase
    }

    static toObjectId(str: string): string {
        let snakeCase = StringUtils.toSnakeCase(str);
        const randomString = crypto.randomBytes(4).toString('hex');
        snakeCase = `${snakeCase}-${randomString}`;
        return snakeCase
            .replace(/_/g, '-')                     // Replace underscores with hyphens
            .replace(/[^a-zA-Z0-9-]+/g, '')         // Remove any non-alphanumeric characters except hyphens
            .toLowerCase();                         // Convert to lowercase
    }

    static toProjectId(str: string): string {
        return `proj-${StringUtils.toObjectId(str)}`;
    }

    static toAppId(str: string): string {
        return `app-${StringUtils.toObjectId(str)}`;
    }
}