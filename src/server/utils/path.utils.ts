import path from 'path';

export class PathUtils {

    static internalDataRoot = process.env.NODE_ENV === 'production' ? '/mnt/internal' : '/workspace/internal';

    static get gitRootPath() {
        return path.join(this.internalDataRoot, 'git');
    }

    static get deploymentLogsPath() {
        return path.join(this.internalDataRoot, 'deployment-logs');
    }

    static appDeploymentLogFile(deploymentId: string): string {
        return path.join(this.deploymentLogsPath, `${deploymentId}.log`);
    }

    static gitRootPathForApp(appId: string): string {
        return path.join(PathUtils.gitRootPath, this.convertIdToFolderFreindlyName(appId));
    }

    private static convertIdToFolderFreindlyName(id: string): string {
        return id.replace(/-/g, '_');
    }
}
