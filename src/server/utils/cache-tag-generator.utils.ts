export class Tags {

    static users() {
        return `users`;
    }

    static projects() {
        return `projects`;
    }

    static apps(projectId: string) {
        return `apps-${projectId}`;
    }
}