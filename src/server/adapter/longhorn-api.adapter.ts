import { any, number } from "zod";

class LonghornApiAdapter {

    async getLonghornVolume(pvcName: String) { //Soll PVC Name und Used Size zurückgeben
        let longhornApiUrl = process.env.NODE_ENV === 'production' ? 'http://longhorn-frontend.longhorn-system.svc.cluster.local/v1/volumes' : 'http://localhost:4000/v1/volumes';

        // Request senden
        const response = await fetch(`${longhornApiUrl}/${pvcName}`, {
            cache: 'no-cache',
            method: 'GET', // Standardmäßig GET
            headers: {

                'Accept': 'application/json', // Optional, falls JSON erwartet wird
                'Content-Type': 'application/json' // Optional, falls JSON zurückgegeben wird
            }
        });

        // Überprüfen, ob die Anfrage erfolgreich war
        if (!response.ok) {
            throw new Error(`HTTP-Error: ${response.status}`);
        }

        // Antwort als JSON parsen
        const data = await response.json();

        const usedStorage = data.controllers?.[0]?.actualSize;

        return (usedStorage / (1024 * 1024)); // Rückgabe mit Erfolgsfall
    }


    async getNodeStorageInfo(nodeName: String) { //Soll PVC Name und Used Size zurückgeben
        let longhornApiUrl = process.env.NODE_ENV === 'production' ? 'http://longhorn-frontend.longhorn-system.svc.cluster.local/v1/nodes' : 'http://localhost:4000/v1/nodes';
        // Request senden
        const response = await fetch(`${longhornApiUrl}/${nodeName}`, {
            cache: 'no-cache',
            method: 'GET', // Standardmäßig GET
            headers: {

                'Accept': 'application/json', // Optional, falls JSON erwartet wird
                'Content-Type': 'application/json' // Optional, falls JSON zurückgegeben wird
            }
        });

        // Überprüfen, ob die Anfrage erfolgreich war
        if (!response.ok) {
            throw new Error(`HTTP-Error: ${response.status}`);
        }

        // Antwort als JSON parsen
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

        // Initialize totals
        let totalStorageMaximum = 0;
        let totalStorageAvailable = 0;

        // Iterate over each disk and sum up the values
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