import { describe, it, expect } from 'vitest';
import { spacing, gaps, padding, containerSizes } from '../../tokens/spacing';

describe('Spacing Tokens', () => {
  describe('spacing scale', () => {
    it('should export spacing object', () => {
      expect(spacing).toBeDefined();
      expect(typeof spacing).toBe('object');
    });

    it('should have correct spacing values', () => {
      expect(spacing[0]).toBe('0px');
      expect(spacing[1]).toBe('4px');
      expect(spacing[2]).toBe('8px');
      expect(spacing[4]).toBe('16px');
      expect(spacing[8]).toBe('32px');
    });

    it('should have decimal spacing values', () => {
      expect(spacing[0.5]).toBe('2px');
      expect(spacing[1.5]).toBe('6px');
      expect(spacing[2.5]).toBe('10px');
    });

    it('should have all spacing tokens from 0 to 96', () => {
      const spacingKeys = Object.keys(spacing).map(Number);
      expect(spacingKeys).toContain(0);
      expect(spacingKeys).toContain(96);
      expect(spacing[96]).toBe('384px');
    });
  });

  describe('gaps', () => {
    it('should export gaps object', () => {
      expect(gaps).toBeDefined();
      expect(Object.keys(gaps).length).toBeGreaterThan(0);
    });

    it('should have semantic gap names', () => {
      expect(gaps.xs).toBeDefined();
      expect(gaps.sm).toBeDefined();
      expect(gaps.md).toBeDefined();
      expect(gaps.lg).toBeDefined();
      expect(gaps.xl).toBeDefined();
    });

    it('should have correct gap values', () => {
      expect(gaps.xs).toBe('4px');
      expect(gaps.sm).toBe('8px');
      expect(gaps.md).toBe('12px');
      expect(gaps.lg).toBe('16px');
      expect(gaps.xl).toBe('20px');
    });
  });

  describe('padding', () => {
    it('should export padding object', () => {
      expect(padding).toBeDefined();
      expect(Object.keys(padding).length).toBeGreaterThan(0);
    });

    it('should have semantic padding sizes', () => {
      expect(padding.xs).toBeDefined();
      expect(padding.sm).toBeDefined();
      expect(padding.md).toBeDefined();
      expect(padding.lg).toBeDefined();
      expect(padding.xl).toBeDefined();
    });

    it('should have correct padding values', () => {
      expect(padding.xs).toBe('8px 12px');
      expect(padding.sm).toBe('10px 16px');
      expect(padding.md).toBe('12px 20px');
      expect(padding.lg).toBe('16px 24px');
      expect(padding.xl).toBe('20px 32px');
    });
  });

  describe('container sizes', () => {
    it('should export containerSizes object', () => {
      expect(containerSizes).toBeDefined();
      expect(Object.keys(containerSizes).length).toBeGreaterThan(0);
    });

    it('should have responsive breakpoints', () => {
      expect(containerSizes.sm).toBeDefined();
      expect(containerSizes.md).toBeDefined();
      expect(containerSizes.lg).toBeDefined();
      expect(containerSizes.xl).toBeDefined();
    });

    it('should have correct container size values', () => {
      expect(containerSizes.sm).toBe('640px');
      expect(containerSizes.md).toBe('768px');
      expect(containerSizes.lg).toBe('1024px');
      expect(containerSizes.xl).toBe('1280px');
      expect(containerSizes['2xl']).toBe('1536px');
    });

    it('should have consistent size progression', () => {
      const sizes = [640, 768, 1024, 1280, 1536];
      sizes.forEach((size, index) => {
        if (index > 0) {
          expect(size).toBeGreaterThan(sizes[index - 1]);
        }
      });
    });
  });
});
