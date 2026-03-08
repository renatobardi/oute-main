import { describe, it, expect } from 'vitest';
import { colors, primary, secondary, neutral } from '../../tokens/colors';

describe('Color Tokens', () => {
  describe('colors object', () => {
    it('should export colors object', () => {
      expect(colors).toBeDefined();
      expect(typeof colors).toBe('object');
    });

    it('should have primary color palette', () => {
      expect(colors.primary).toBeDefined();
      expect(Object.keys(colors.primary).length).toBeGreaterThan(0);
    });

    it('should have secondary color palette', () => {
      expect(colors.secondary).toBeDefined();
      expect(Object.keys(colors.secondary).length).toBeGreaterThan(0);
    });

    it('should have neutral color palette', () => {
      expect(colors.neutral).toBeDefined();
      expect(Object.keys(colors.neutral).length).toBeGreaterThan(0);
    });

    it('should have semantic colors', () => {
      expect(colors.success).toBeDefined();
      expect(colors.warning).toBeDefined();
      expect(colors.error).toBeDefined();
      expect(colors.info).toBeDefined();
    });

    it('should have dark mode colors', () => {
      expect(colors.dark).toBeDefined();
      expect(colors.dark.bg).toBeDefined();
      expect(colors.dark.surface).toBeDefined();
      expect(colors.dark.border).toBeDefined();
    });

    it('should have valid hex color values', () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;
      expect(hexRegex.test(colors.primary[500])).toBe(true);
      expect(hexRegex.test(colors.success)).toBe(true);
      expect(hexRegex.test(colors.dark.bg)).toBe(true);
    });
  });

  describe('color shortcuts', () => {
    it('should export primary shortcut', () => {
      expect(primary).toBeDefined();
      expect(primary).toEqual(colors.primary);
    });

    it('should export secondary shortcut', () => {
      expect(secondary).toBeDefined();
      expect(secondary).toEqual(colors.secondary);
    });

    it('should export neutral shortcut', () => {
      expect(neutral).toBeDefined();
      expect(neutral).toEqual(colors.neutral);
    });
  });

  describe('color values', () => {
    it('should have correct primary 500 value', () => {
      expect(colors.primary[500]).toBe('#15a7e4');
    });

    it('should have correct primary 600 value', () => {
      expect(colors.primary[600]).toBe('#06bcf9');
    });

    it('should have correct success value', () => {
      expect(colors.success).toBe('#10b981');
    });

    it('should have correct error value', () => {
      expect(colors.error).toBe('#ef4444');
    });

    it('should have white in neutral', () => {
      expect(colors.neutral[0]).toBe('#ffffff');
    });

    it('should have black in neutral', () => {
      expect(colors.neutral[900]).toBe('#111827');
    });
  });
});
