class LonghornApiAdapter {

    async getLonghornVolume(pvcName: String) {
        let longhornApiUrl = process.env.NODE_ENV === 'production' ? 'http://longhorn-frontend.longhorn-system.svc.cluster.local/v1/volumes' : 'http://localhost:4000/v1/volumes';

        const response = await fetch(`${longhornApiUrl}/${pvcName}`, {
            cache: 'no-cache',
            method: 'GET',
            headers: {

                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP-Error: ${response.status}`);
        }

        const data = await response.json();

        const usedStorage = data.controllers?.[0]?.actualSize;

        return (usedStorage / (1024 * 1024));
    }


    async getNodeStorageInfo(nodeName: String) {
        let longhornApiUrl = process.env.NODE_ENV === 'production' ? 'http://longhorn-frontend.longhorn-system.svc.cluster.local/v1/nodes' : 'http://localhost:4000/v1/nodes';

        const response = await fetch(`${longhornApiUrl}/${nodeName}`, {
            cache: 'no-cache',
            method: 'GET',
            headers: {

                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP-Error: ${response.status}`);
        }

        const data = await response.json() as {
            disks: {
                [key: string]: {
                    storageMaximum: number,
                    storageAvailable: number
                }
            }
        };

        if (!data.disks || typeof data.disks !== "object") {
            throw new Error("Invalid node data: 'disks' property is missing or not an object.");
        }

        let totalStorageMaximum = 0;
        let totalStorageAvailable = 0;

        Object.values(data.disks).forEach(disk => {

            totalStorageMaximum += disk.storageMaximum;
            totalStorageAvailable += disk.storageAvailable;
        });

        return {
            totalStorageMaximum,
            totalStorageAvailable
        };

    }
}
const longhornApiAdapter = new LonghornApiAdapter();
export default longhornApiAdapter;