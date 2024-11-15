import fsPromises from 'fs/promises';
import fs from 'fs';
import { PathUtils } from '../utils/path.utils';
import { FsUtils } from '../utils/fs.utils';

class DeploymentLogService {

    async writeLogs(deploymentId: string, logs: string) {
        try {
            await FsUtils.createDirIfNotExistsAsync(PathUtils.deploymentLogsPath, true);
            const logFilePath = PathUtils.appDeploymentLogFile(deploymentId);
            await fsPromises.appendFile(logFilePath, logs, {
                encoding: 'utf-8'
            });
        } catch (ex) {
            console.error(`Error writing logs for deployment ${deploymentId}: ${ex}`);
        }
    }

    catchErrosAndLog<TReturnType>(appId: string, deploymentId: string, fn: (logFunc: (logData: string) => void) => TReturnType): TReturnType {
        try {
            return fn((logData: string) => {
                this.writeLogs(deploymentId, logData);
            });
        } catch (ex) {
            this.writeLogs(deploymentId, `[Error]: ${(ex as any)?.message}`);
            throw ex;
        }
    }


    async getLogsStream(appId: string, deploymentId: string, streamedData: (data: string) => void) {
        await FsUtils.createDirIfNotExistsAsync(PathUtils.deploymentLogsPath, true);
        const logFilePath = PathUtils.appDeploymentLogFile(deploymentId);

        if (!await FsUtils.fileExists(logFilePath)) {
            return undefined;
        }
        // Create a read stream
        let fileStream = fs.createReadStream(logFilePath, {
            encoding: 'utf8',
            start: 0,
            flags: 'r'
        });

        // Watch for changes in the file and read new lines when the file is updated
        const watcher = fs.watch(logFilePath, (eventType) => {
            if (eventType === 'change') {
                // Create a new read stream starting from the current end of the file
                const newStream = fs.createReadStream(logFilePath, {
                    encoding: 'utf8',
                    start: fileStream.bytesRead,
                    flags: 'r'
                });

                newStream.on('data', (chunk: string) => {
                    streamedData(chunk);
                });

                // Update the read stream pointer
                newStream.on('end', () => {
                    fileStream.bytesRead += newStream.readableLength; // Buffer.byteLength(); // todo check if this works
                    newStream.close();
                });
            }
        });

        return () => {
            watcher.close();
            fileStream.close();
        }
    }

}

const deploymentLogService = new DeploymentLogService();
export default deploymentLogService;


export const dlog = (deploymentId: string, data: string) => {
    deploymentLogService.writeLogs(deploymentId, data);
}
