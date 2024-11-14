export class MemoryCalcUtils {

    /**
     * Formats the given size in megabytes to a Kubernetes readable format.
     */
    static formatSize(megabytes: number): string {
        if (megabytes % 1024 === 0) {
            return `${Math.round(megabytes / 1024)}Gi`;
        } else {
            return `${Math.round(megabytes)}Mi`;
        }
    }
}