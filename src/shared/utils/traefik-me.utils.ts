export class TraefikMeUtils {

    static isValidTraefikMeDomain(domain: string): boolean {
        return this.containesTraefikMeDomain(domain) && domain.split('.').length === 3;
    }

    static containesTraefikMeDomain(domain: string): boolean {
        return domain.includes('.traefik.me');
    }
}