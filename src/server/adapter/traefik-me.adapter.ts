

class TraefikMeAdapter {
    private traefikMeBaseURL = 'https://traefik.me';

    async getCurrentPrivateKey() {
        const result = await fetch(`${this.traefikMeBaseURL}/privkey.pem`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!result.ok) {
            throw new Error('Failed to get private key from traefik.me');
        }
        const privateKeyText = result.text();
        return privateKeyText;
    }

    async getFullChainCertificate() {
        const result = await fetch(`${this.traefikMeBaseURL}/fullchain.pem`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!result.ok) {
            throw new Error('Failed to get full chain from traefik.me');
        }
        const fullChainText = result.text();
        return fullChainText;
    }
}

const traefikMeAdapter = new TraefikMeAdapter();
export default traefikMeAdapter;