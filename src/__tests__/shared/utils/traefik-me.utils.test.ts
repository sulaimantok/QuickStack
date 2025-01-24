import { TraefikMeUtils } from '../../../shared/utils/traefik-me.utils';

describe('TraefikMeUtils', () => {
    describe('isValidTraefikMeDomain', () => {
        it('should return true for valid traefik.me domain', () => {
            expect(TraefikMeUtils.isValidTraefikMeDomain('example.traefik.me')).toBe(true);
        });

        it('should return false for domain not ending with .traefik.me', () => {
            expect(TraefikMeUtils.isValidTraefikMeDomain('example.com')).toBe(false);
        });

        it('should return false for domain with more than three parts', () => {
            expect(TraefikMeUtils.isValidTraefikMeDomain('sub.example.traefik.me')).toBe(false);
        });

        it('should return false for domain with less than three parts', () => {
            expect(TraefikMeUtils.isValidTraefikMeDomain('traefik.me')).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(TraefikMeUtils.isValidTraefikMeDomain('')).toBe(false);
        });
    });
});