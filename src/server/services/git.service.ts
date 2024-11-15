import { ServiceException } from "@/model/service.exception.model";
import { AppExtendedModel } from "@/model/app-extended.model";
import simpleGit from "simple-git";
import { PathUtils } from "../utils/path.utils";
import { FsUtils } from "../utils/fs.utils";

class GitService {

    async getLatestRemoteCommitHash(app: AppExtendedModel) {
        try {
            const git = await this.pullLatestChangesFromRepo(app);

            // Get the latest commit hash on the default branch (e.g., 'origin/main')
            const log = await git.log(['origin/' + app.gitBranch]); // Replace 'main' with your branch name if needed

            if (log.latest) {
                return log.latest.hash;
            } else {
                throw new ServiceException("The git repository is empty.");
            }
        } catch (error) {
            console.error('Error while connecting to the git repository:', error);
            throw new ServiceException("Error while connecting to the git repository.");
        } finally {
            await this.cleanupLocalGitDataForApp(app);
        }
    }

    async cleanupLocalGitDataForApp(app: AppExtendedModel) {
        const gitPath = PathUtils.gitRootPathForApp(app.id);
        await FsUtils.deleteDirIfExistsAsync(gitPath, true);
    }

    async pullLatestChangesFromRepo(app: AppExtendedModel) {
        console.log(`Pulling latest source for app ${app.id}...`);
        const gitPath = PathUtils.gitRootPathForApp(app.id);

        await FsUtils.deleteDirIfExistsAsync(gitPath, true);
        await FsUtils.createDirIfNotExistsAsync(gitPath, true);

        const git = simpleGit(gitPath);
        const gitUrl = this.getGitUrl(app);

        // initial clone
        console.log(await git.clone(gitUrl, gitPath));
        console.log(await git.checkout(app.gitBranch ?? 'main'));
        console.log(`Source for app ${app.id} has been cloned successfully.`);

        return git;
    }


    async checkIfLocalRepoIsUpToDate(app: AppExtendedModel) {
        const gitPath = PathUtils.gitRootPathForApp(app.id);
        if (!FsUtils.directoryExists(gitPath)) {
            return false;
        }

        if (await FsUtils.isFolderEmpty(gitPath)) {
            return false;
        }

        const git = simpleGit(gitPath);
        await git.fetch();

        const status = await git.status();
        if (status.behind > 0) {
            console.log(`The local repository is behind by ${status.behind} commits and needs to be updated.`);
            return false;
        } else if (status.ahead > 0) {
            throw new Error(`The local repository is ahead by ${status.ahead} commits. This should not happen.`);
        }

        // The local repository is up to date
        return true
    }


    private getGitUrl(app: AppExtendedModel) {
        if (app.gitUsername && app.gitToken) {
            return app.gitUrl!.replace('https://', `https://${app.gitUsername}:${app.gitToken}@`);
        }
        return app.gitUrl!;
    }
}

const gitService = new GitService();
export default gitService;
