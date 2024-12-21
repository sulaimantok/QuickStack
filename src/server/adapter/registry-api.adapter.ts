interface OCIManifest {
    schemaVersion: number;
    mediaType: string;
    config: {
        mediaType: string;
        size: number;
        digest: string;
    };
    layers: Array<{
        mediaType: string;
        size: number;
        digest: string;
    }>;
    annotations: {
        [key: string]: string;
    };
}

// Source: https://distribution.github.io/distribution/spec/api/

class RegistryApiAdapter {

    private registryBaseUrl = process.env.NODE_ENV === 'production' ?
        'http://registry-svc.registry-and-build.svc.cluster.local' :
        'http://localhost:5000';

    async getAllImages() {

        const response = await fetch(`${this.registryBaseUrl}/v2/_catalog`, {
            cache: 'no-cache',
            method: 'GET',
            headers: {

                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        await this.checkIfResponseIsOk(response);
        const data = await response.json();
        return data?.repositories ?? [] as string[];
    }

    async listTagsForImage(imageName: string) {

        const response = await fetch(`${this.registryBaseUrl}/v2/${imageName}/tags/list`, {
            cache: 'no-cache',
            method: 'GET',
            headers: {

                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        await this.checkIfResponseIsOk(response);
        const data = await response.json();
        return data?.tags ?? [] as string[];
    }

    async getManifest(repository: string, tag: string) {
        const response = await this.manifestRequest(repository, tag);
        const data = await response.json() as OCIManifest;
        return data;
    }

    async getManifestWithDigest(repository: string, tag: string) {

        const response = await this.manifestRequest(repository, tag);
        const digest = response.headers.get("Docker-Content-Digest");
        if (!digest) {
            console.error(response.headers);
            throw new Error("Digest not found in response headers.");
        }
        return [digest, await response.json()] as [string, OCIManifest];
    }

    private async manifestRequest(repository: string, tag: string) {
        const response = await fetch(`${this.registryBaseUrl}/v2/${repository}/manifests/${tag}`, {
            cache: 'no-cache',
            method: 'GET',
            headers: {
                "Accept": "application/vnd.oci.image.manifest.v1+json, application/vnd.oci.image.index.v1+json",
            }
        });

        await this.checkIfResponseIsOk(response);
        return response;
    }


    async deleteImage(repository: string, tag: string) {

        // Step 1: Get the digest of the image
        const [digest, manifest] = await this.getManifestWithDigest(repository, tag);

        console.log(`Digest for ${repository}:${tag} is ${digest}`);

        // Step 2: Delete the image using the digest
        const deleteUrl = `${this.registryBaseUrl}/v2/${repository}/manifests/${digest}`;
        const deleteResponse = await fetch(deleteUrl, {
            method: "DELETE"
        });

        await this.checkIfResponseIsOk(deleteResponse);

        console.log(`Image ${repository}:${tag} (size: ${manifest?.config?.size}) successfully deleted from registry.`);

        // return the size of the image
        const totalSize = manifest?.layers?.reduce((sum, layer) => sum + (layer.size || 0), 0) ?? 0;
        return totalSize;
    }

    private async checkIfResponseIsOk(response: Response) {
        if (!response.ok) {
            console.error(`Error while fetching ${response.url} ${response.status} ${response.statusText}`);
            console.error(response.headers);
            console.error(response);
            try {
                console.error(await response.text());
            } catch (error) {
                // do nothing
            }
            throw new Error(`Error while connecting to container registry.`);
        }
    }
}
const registryApiAdapter = new RegistryApiAdapter();
export default registryApiAdapter;