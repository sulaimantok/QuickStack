import fs from "fs"
import fsPromises from "fs/promises"

export class FsUtils {

    static async fileExists(pathName: string) {
        try {
            await fsPromises.access(pathName, fs.constants.F_OK);
            return true;
        } catch (ex) {
            return false;
        }
    }

    static directoryExists(pathName: string) {
        try {
            return fs.existsSync(pathName);
        } catch (ex) {
            return false;
        }
    }

    static async isFolderEmpty(pathName: string) {
        try {
            const files = await fsPromises.readdir(pathName);
            return files.length === 0;
        } catch (ex) {
            return true;
        }
    }

    static createDirIfNotExists(pathName: string, recursive = false) {
        if (!this.directoryExists(pathName)) {
            fs.mkdirSync(pathName, {
                recursive
            });
        }
    }

    static async createDirIfNotExistsAsync(pathName: string, recursive = false) {
        let exists = false;
        try {
            exists = fs.existsSync(pathName);
        } catch (ex) {

        }
        if (!exists) {
            await fsPromises.mkdir(pathName, {
                recursive
            });
        }
    }
    static async deleteDirIfExistsAsync(pathName: string, recursive = false) {
        let exists = false;
        try {
            exists = fs.existsSync(pathName);
        } catch (ex) {

        }
        if (!exists) {
            return;
        }
        await fsPromises.rm(pathName, {
            recursive
        });
    }
}
