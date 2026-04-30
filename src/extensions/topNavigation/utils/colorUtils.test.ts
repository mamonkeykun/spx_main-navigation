import { describe, expect, it } from '@jest/globals';
import { hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from './colorUtils';

describe('colorUtils', () => {
  it('hexToRgb: 白を正しく変換する', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('hexToRgb: 黒を正しく変換する', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('rgbToHex: RGB を hex に変換する', () => {
    expect(rgbToHex(0, 120, 212)).toBe('#0078d4');
  });

  it('HSV と RGB を往復変換できる', () => {
    const original = { r: 128, g: 64, b: 200 };
    const hsv = rgbToHsv(original);
    const back = hsvToRgb(hsv);

    expect(Math.round(back.r)).toBe(128);
    expect(Math.round(back.g)).toBe(64);
    expect(Math.round(back.b)).toBe(200);
  });
});
