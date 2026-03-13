import { describe, it, expect } from 'vitest';
import {
  colors,
  primary,
  secondary,
  neutral,
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  spacing,
  gaps,
  padding,
  containerSizes,
} from '../../tokens/index';

describe('Design Tokens Index', () => {
  it('should export all color tokens', () => {
    expect(colors).toBeDefined();
    expect(primary).toBeDefined();
    expect(secondary).toBeDefined();
    expect(neutral).toBeDefined();
  });

  it('should export all typography tokens', () => {
    expect(typography).toBeDefined();
    expect(fontFamily).toBeDefined();
    expect(fontSize).toBeDefined();
    expect(fontWeight).toBeDefined();
  });

  it('should export all spacing tokens', () => {
    expect(spacing).toBeDefined();
    expect(gaps).toBeDefined();
    expect(padding).toBeDefined();
    expect(containerSizes).toBeDefined();
  });

  it('should have consistent token structure', () => {
    // Color tokens
    expect(Object.keys(colors).length).toBeGreaterThan(0);
    expect(Object.keys(primary).length).toBeGreaterThan(0);

    // Typography tokens
    expect(Object.keys(typography).length).toBeGreaterThan(0);
    expect(Object.keys(fontFamily).length).toBeGreaterThan(0);

    // Spacing tokens
    expect(Object.keys(spacing).length).toBeGreaterThan(0);
    expect(Object.keys(gaps).length).toBeGreaterThan(0);
  });
});
