import path from 'path';

export class PathUtils {

    static internalDataRoot = process.env.NODE_ENV === 'production' ? '/app/storage' : '/workspace/internal';
    static tempDataRoot = process.env.NODE_ENV === 'production' ? '/app/tmp-storage' : '/workspace/internal';

    static get gitRootPath() {
        return path.join(this.tempDataRoot, 'git');
    }

    static gitRootPathForApp(appId: string): string {
        return path.join(PathUtils.gitRootPath, this.convertIdToFolderFriendlyName(appId));
    }

    static get deploymentLogsPath() {
        return path.join(this.internalDataRoot, 'deployment-logs');
    }

    static appDeploymentLogFile(deploymentId: string): string {
        return path.join(this.deploymentLogsPath, `${deploymentId}.log`);
    }

    private static convertIdToFolderFriendlyName(id: string): string {
        // remove all special characters
        return id.replace(/[^a-zA-Z0-9]/g, '_');
    }
}
