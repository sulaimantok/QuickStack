class LonghornApiAdapter {

    async getLonghornVolume(pvcName: String) { //Soll PVC Name und Used Size zurückgeben
        let longhornApiUrl = process.env.NODE_ENV === 'production' ? 'http://longhorn-frontend.longhorn-system.svc.cluster.local/v1/volumes' : 'http://localhost:4000/v1/volumes';
        try {
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

    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        return -1; // Rückgabe mit Fehlerfall
    }
    }
}
const longhornApiAdapter = new LonghornApiAdapter();
export default longhornApiAdapter;