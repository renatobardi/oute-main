import { describe, it, expect } from 'vitest';
import { typography, fontFamily, fontSize, fontWeight } from '../../tokens/typography';

describe('Typography Tokens', () => {
  describe('typography object', () => {
    it('should export typography object', () => {
      expect(typography).toBeDefined();
      expect(typeof typography).toBe('object');
    });

    it('should have font families', () => {
      expect(typography.fontFamily).toBeDefined();
      expect(typography.fontFamily.sans).toBeDefined();
      expect(typography.fontFamily.mono).toBeDefined();
    });

    it('should have font sizes', () => {
      expect(typography.fontSize).toBeDefined();
      expect(Object.keys(typography.fontSize).length).toBeGreaterThan(0);
    });

    it('should have font weights', () => {
      expect(typography.fontWeight).toBeDefined();
      expect(Object.keys(typography.fontWeight).length).toBeGreaterThan(0);
    });

    it('should have line heights', () => {
      expect(typography.lineHeight).toBeDefined();
      expect(Object.keys(typography.lineHeight).length).toBeGreaterThan(0);
    });

    it('should have headings styles', () => {
      expect(typography.headings).toBeDefined();
      expect(typography.headings.h1).toBeDefined();
      expect(typography.headings.h6).toBeDefined();
    });

    it('should have body text styles', () => {
      expect(typography.body).toBeDefined();
      expect(typography.body.lg).toBeDefined();
      expect(typography.body.base).toBeDefined();
      expect(typography.body.sm).toBeDefined();
      expect(typography.body.xs).toBeDefined();
    });
  });

  describe('font families', () => {
    it('should include Inter as primary sans font', () => {
      expect(typography.fontFamily.sans[0]).toBe('Inter');
    });

    it('should have fallback fonts for sans', () => {
      expect(typography.fontFamily.sans.length).toBeGreaterThan(1);
      expect(typography.fontFamily.sans[typography.fontFamily.sans.length - 1]).toBe('sans-serif');
    });

    it('should have code fonts', () => {
      expect(typography.fontFamily.mono.length).toBeGreaterThan(0);
      expect(typography.fontFamily.mono[typography.fontFamily.mono.length - 1]).toBe('monospace');
    });
  });

  describe('font sizes', () => {
    it('should have size with typography info', () => {
      const size = typography.fontSize.base;
      expect(Array.isArray(size) || typeof size === 'object').toBe(true);
      expect(size[0]).toBe('16px');
    });

    it('should have line height and letter spacing in sizes', () => {
      const size = typography.fontSize.base;
      expect(size[1].lineHeight).toBeDefined();
      expect(size[1].letterSpacing).toBeDefined();
    });

    it('should have all size scales', () => {
      expect(typography.fontSize.xs).toBeDefined();
      expect(typography.fontSize.sm).toBeDefined();
      expect(typography.fontSize.base).toBeDefined();
      expect(typography.fontSize.lg).toBeDefined();
      expect(typography.fontSize.xl).toBeDefined();
      expect(typography.fontSize['2xl']).toBeDefined();
      expect(typography.fontSize['3xl']).toBeDefined();
      expect(typography.fontSize['4xl']).toBeDefined();
    });
  });

  describe('font weights', () => {
    it('should have correct weight values', () => {
      expect(typography.fontWeight.light).toBe(300);
      expect(typography.fontWeight.normal).toBe(400);
      expect(typography.fontWeight.medium).toBe(500);
      expect(typography.fontWeight.semibold).toBe(600);
      expect(typography.fontWeight.bold).toBe(700);
      expect(typography.fontWeight.extrabold).toBe(800);
    });
  });

  describe('line heights', () => {
    it('should have numeric line height values', () => {
      expect(typography.lineHeight.none).toBe(1);
      expect(typography.lineHeight.tight).toBe(1.25);
      expect(typography.lineHeight.normal).toBe(1.5);
      expect(typography.lineHeight.relaxed).toBe(1.625);
      expect(typography.lineHeight.loose).toBe(2);
    });
  });

  describe('headings', () => {
    it('should have h1 through h6 styles', () => {
      const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
      headings.forEach((heading) => {
        expect(typography.headings[heading]).toBeDefined();
        expect(typography.headings[heading].fontSize).toBeDefined();
        expect(typography.headings[heading].fontWeight).toBeDefined();
        expect(typography.headings[heading].lineHeight).toBeDefined();
      });
    });

    it('should have correct h1 styling', () => {
      expect(typography.headings.h1.fontSize).toBe('36px');
      expect(typography.headings.h1.fontWeight).toBe(700);
      expect(typography.headings.h1.lineHeight).toBe('44px');
    });
  });

  describe('body text', () => {
    it('should have all body sizes', () => {
      expect(typography.body.lg).toBeDefined();
      expect(typography.body.base).toBeDefined();
      expect(typography.body.sm).toBeDefined();
      expect(typography.body.xs).toBeDefined();
    });

    it('should have correct base body styling', () => {
      expect(typography.body.base.fontSize).toBe('16px');
      expect(typography.body.base.fontWeight).toBe(400);
      expect(typography.body.base.lineHeight).toBe('24px');
    });
  });

  describe('shortcuts', () => {
    it('should export fontFamily shortcut', () => {
      expect(fontFamily).toBeDefined();
      expect(fontFamily).toEqual(typography.fontFamily);
    });

    it('should export fontSize shortcut', () => {
      expect(fontSize).toBeDefined();
      expect(fontSize).toEqual(typography.fontSize);
    });

    it('should export fontWeight shortcut', () => {
      expect(fontWeight).toBeDefined();
      expect(fontWeight).toEqual(typography.fontWeight);
    });
  });
});
