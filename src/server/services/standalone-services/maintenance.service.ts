import { FsUtils } from "@/server/utils/fs.utils";
import { PathUtils } from "@/server/utils/path.utils";
import path from "path";
import scheduleService from "./schedule.service";
import standalonePodService from "./standalone-pod.service";

class MaintenanceService {

    configureMaintenanceCronJobs() {
        scheduleService.scheduleJob('daily-maintenance', '0 6 * * *', async () => {
            await this.deleteAllTempFiles();
            await standalonePodService.deleteAllFailedAndSuccededPods();
        });
    }

    async deleteAllTempFiles() {
        const tempFilePath = PathUtils.tempDataRoot;
        const allFilesOfDir = await FsUtils.getAllFilesInDir(tempFilePath);
        for (const file of allFilesOfDir) {
            const fullFilePath = path.join(tempFilePath, file);
            const fileStat = await FsUtils.getFileStats(fullFilePath);
            if (fileStat.isFile()) {
                await FsUtils.deleteFileIfExists(fullFilePath);
            } else {
                await FsUtils.deleteDirIfExistsAsync(fullFilePath, true);
            }
        }
    }
}

const maintenanceService = new MaintenanceService();
export default maintenanceService;