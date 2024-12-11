import { MemoryCalcUtils } from '../../../server/utils/memory-caluclation.utils';

describe('MemoryCalcUtils', () => {
    describe('formatSize', () => {
        it('should format size in Gi when megabytes is a multiple of 1024', () => {
            expect(MemoryCalcUtils.formatSize(2048)).toBe('2Gi');
            expect(MemoryCalcUtils.formatSize(1024)).toBe('1Gi');
        });

        it('should format size in Mi when megabytes is not a multiple of 1024', () => {
            expect(MemoryCalcUtils.formatSize(1500)).toBe('1500Mi');
            expect(MemoryCalcUtils.formatSize(512)).toBe('512Mi');
        });

        it('should handle edge cases', () => {
            expect(MemoryCalcUtils.formatSize(0)).toBe('0Gi');
            expect(MemoryCalcUtils.formatSize(1)).toBe('1Mi');
        });
    });
});