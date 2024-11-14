import LONGHORN_API_URL from "../adapter/longhorn-api.adapter";

class PvcStatusService {
    async getPvcUsageByName(pvcName: string, pvcNamespace: string) {
        try {
            // Anfrage an Longhorn API, mit deaktiviertem Cache
            const response = await fetch(`${LONGHORN_API_URL}/v1/volumes/${pvcName}`, { cache: 'no-cache' });

            // Überprüfen, ob die Antwort erfolgreich ist
            if (!response.ok) {
                throw new Error(`Failed to fetch data for PVC ${pvcName}: ${response.statusText} (Status Code: ${response.status})`);
            }

            // Antwortdaten in JSON umwandeln
            const volumeData = await response.json();
            const actualSize = volumeData.actualSize;

            return actualSize;

        } catch (error) {
            // Fehler protokollieren
            console.error(`Error fetching PVC usage for ${pvcName} in namespace ${pvcNamespace}:`, error);
            throw error;  // Fehler erneut auslösen, falls weitere Behandlung erforderlich ist
        }
    }
}

const pvcStatusService = new PvcStatusService();
export default pvcStatusService;
