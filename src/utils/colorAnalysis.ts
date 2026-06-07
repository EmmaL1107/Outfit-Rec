import type { ClothingColor } from '../types';
import { COLOR_HEX_MAP } from '../types';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function colorDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function kMeansClustering(pixels: RGB[], k: number, maxIterations = 20): RGB[] {
  if (pixels.length === 0) return [];
  if (pixels.length <= k) return pixels;

  const step = Math.floor(pixels.length / k);
  let centers = pixels.filter((_, i) => i % step === 0).slice(0, k);

  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: RGB[][] = Array.from({ length: k }, () => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let closest = 0;
      for (let c = 0; c < centers.length; c++) {
        const dist = colorDistance(pixel, centers[c]);
        if (dist < minDist) {
          minDist = dist;
          closest = c;
        }
      }
      clusters[closest].push(pixel);
    }

    const newCenters = clusters.map((cluster) => {
      if (cluster.length === 0) return centers[0];
      const sum = cluster.reduce(
        (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
        { r: 0, g: 0, b: 0 },
      );
      return {
        r: Math.round(sum.r / cluster.length),
        g: Math.round(sum.g / cluster.length),
        b: Math.round(sum.b / cluster.length),
      };
    });

    let converged = true;
    for (let c = 0; c < k; c++) {
      if (colorDistance(newCenters[c], centers[c]) > 4) {
        converged = false;
        break;
      }
    }
    centers = newCenters;
    if (converged) break;
  }

  return centers;
}

function isSkinTone(rgb: RGB): boolean {
  const hsl = rgbToHsl(rgb);
  return (
    hsl.h >= 5 && hsl.h <= 45 &&
    hsl.s >= 15 && hsl.s <= 75 &&
    hsl.l >= 30 && hsl.l <= 85
  );
}

// Common Taobao/ecommerce UI colors to filter out
function isUIColor(rgb: RGB): boolean {
  const hsl = rgbToHsl(rgb);
  // Taobao orange (#FF5000, #FF6600, #FF4400 etc.)
  if (hsl.h >= 10 && hsl.h <= 30 && hsl.s > 70 && hsl.l > 45 && hsl.l < 70) return true;
  // Red sale tags (#FF0000, #E4393C etc.)
  if (hsl.h >= 345 || hsl.h < 10) {
    if (hsl.s > 60 && hsl.l > 35 && hsl.l < 65) return true;
  }
  // Bright yellow/gold buttons
  if (hsl.h >= 40 && hsl.h <= 55 && hsl.s > 70 && hsl.l > 50) return true;
  // Very light gray (UI backgrounds)
  if (hsl.l > 92 && hsl.s < 15) return true;
  // Very dark (black UI bars)
  if (hsl.l < 8) return true;
  return false;
}

export function extractColorsFromImage(imageSrc: string, maxColors = 5, mode: 'product' | 'general' = 'product'): Promise<RGB[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // In product mode: center-crop to focus on the product image area
      // Taobao screenshots: product photo is typically in the top-center 60% area
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (mode === 'product' && img.width > 0 && img.height > 0) {
        // Crop: top 65% of image, center 80% horizontally
        const cropTop = Math.floor(img.height * 0.65);
        const cropLeft = Math.floor(img.width * 0.1);
        const cropWidth = Math.floor(img.width * 0.8);
        sx = cropLeft;
        sy = 0;
        sw = cropWidth;
        sh = cropTop;
      }

      const sampleSize = 120;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleSize, sampleSize);

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const allPixels: RGB[] = [];
      const productPixels: RGB[] = [];

      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        if (a < 128) continue;
        if (r > 240 && g > 240 && b > 240) continue;
        if (r < 15 && g < 15 && b < 15) continue;

        const rgb = { r, g, b };
        allPixels.push(rgb);

        if (mode === 'product') {
          if (!isSkinTone(rgb) && !isUIColor(rgb)) {
            productPixels.push(rgb);
          }
        }
      }

      const pixels = (mode === 'product' && productPixels.length >= 20) ? productPixels : allPixels;

      if (pixels.length === 0) {
        resolve([]);
        return;
      }

      const dominantColors = kMeansClustering(pixels, maxColors + 2);

      // Filter out remaining unwanted colors, then sort by chroma (product relevance)
      const filtered = dominantColors
        .filter((rgb) => {
          if (mode === 'product') {
            if (isSkinTone(rgb)) return false;
            if (isUIColor(rgb)) return false;
            const hsl = rgbToHsl(rgb);
            if (hsl.l > 90 && hsl.s < 10) return false;
            if (hsl.l < 10) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const hslA = rgbToHsl(a);
          const hslB = rgbToHsl(b);
          // Prioritize: higher saturation = more likely product color
          const scoreA = hslA.s * 2 + (50 - Math.abs(hslA.l - 50)) * 0.5;
          const scoreB = hslB.s * 2 + (50 - Math.abs(hslB.l - 50)) * 0.5;
          return scoreB - scoreA;
        });

      resolve(filtered.slice(0, maxColors));
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageSrc;
  });
}

export function rgbToClothingColor(rgb: RGB): ClothingColor {
  const hsl = rgbToHsl(rgb);

  if (hsl.s < 10) {
    if (hsl.l > 85) return '白';
    if (hsl.l > 40) return '灰';
    return '黑';
  }

  if (hsl.s < 20 && hsl.l > 70) return '白';
  if (hsl.s < 20 && hsl.l < 30) return '黑';

  if (hsl.h >= 0 && hsl.h < 15) return '红';
  if (hsl.h >= 15 && hsl.h < 45) return '黄';
  if (hsl.h >= 45 && hsl.h < 70) return '黄';
  if (hsl.h >= 70 && hsl.h < 160) return '绿';
  if (hsl.h >= 160 && hsl.h < 260) return '蓝';
  if (hsl.h >= 260 && hsl.h < 330) return '红';
  if (hsl.h >= 330 && hsl.h < 360) return '红';

  if (hsl.h >= 30 && hsl.h < 50 && hsl.s < 60 && hsl.l > 40 && hsl.l < 75) return '卡其';

  if (hsl.h >= 330 || hsl.h < 15) {
    if (hsl.l > 65 && hsl.s < 70) return '粉色';
    return '红';
  }

  return '灰';
}

export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'monochromatic' | 'neutral';

export interface HarmonyResult {
  score: number;
  type: HarmonyType;
  description: string;
}

function hueDifference(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

export function evaluateColorHarmony(colors: RGB[]): HarmonyResult {
  if (colors.length < 2) {
    return { score: 100, type: 'monochromatic', description: '单色搭配，天然和谐' };
  }

  const hslColors = colors.map(rgbToHsl);
  const sats = hslColors.map((c) => c.s);

  const hasNeutral = hslColors.some((c) => c.s < 12);
  const neutralCount = hslColors.filter((c) => c.s < 12).length;

  if (neutralCount >= colors.length - 1) {
    return { score: 95, type: 'neutral', description: '中性色为主，百搭不出错' };
  }

  const chromaticHsl = hslColors.filter((c) => c.s >= 12);
  if (chromaticHsl.length <= 1) {
    return { score: 90, type: 'neutral', description: '中性色搭配彩色，安全和谐' };
  }

  const chromaticHues = chromaticHsl.map((c) => c.h);

  if (chromaticHues.length === 2) {
    const diff = hueDifference(chromaticHues[0], chromaticHues[1]);

    if (diff < 30) {
      return { score: 90, type: 'analogous', description: '类似色搭配，柔和协调' };
    }
    if (diff > 150 && diff < 210) {
      return { score: 85, type: 'complementary', description: '互补色搭配，对比鲜明' };
    }
    if (diff > 120 && diff < 150) {
      return { score: 80, type: 'split-complementary', description: '分裂互补，丰富有层次' };
    }
    if (hasNeutral) {
      return { score: 75, type: 'neutral', description: '中性色调和，整体和谐' };
    }
    return { score: 55, type: 'analogous', description: '色相差较大，建议用中性色过渡' };
  }

  if (chromaticHues.length === 3) {
    const diffs = [
      hueDifference(chromaticHues[0], chromaticHues[1]),
      hueDifference(chromaticHues[1], chromaticHues[2]),
      hueDifference(chromaticHues[0], chromaticHues[2]),
    ];
    diffs.sort((a, b) => a - b);

    const isTriadic = diffs.every((d) => Math.abs(d - 120) < 25);
    if (isTriadic) {
      return { score: 80, type: 'triadic', description: '三色搭配，活泼有个性' };
    }

    const hasAnalogous = diffs[0] < 40;
    const hasContrast = diffs[2] > 100;
    if (hasAnalogous && hasContrast) {
      return { score: 75, type: 'split-complementary', description: '类似色+对比色，层次丰富' };
    }

    if (hasNeutral) {
      return { score: 70, type: 'neutral', description: '中性色调和，整体可接受' };
    }

    const avgSat = sats.reduce((a, b) => a + b, 0) / sats.length;
    if (avgSat < 30) {
      return { score: 70, type: 'neutral', description: '低饱和度搭配，柔和舒适' };
    }

    return { score: 45, type: 'triadic', description: '三色差异较大，建议减少到两色或加入中性色' };
  }

  return { score: 40, type: 'triadic', description: '颜色过多，建议控制在3个颜色以内' };
}

export function rgbToHex(rgb: RGB): string {
  return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
}

export function findClosestColorName(rgb: RGB): { name: ClothingColor; hex: string; distance: number } {
  let closest: ClothingColor = '灰';
  let minDist = Infinity;

  for (const [name, hex] of Object.entries(COLOR_HEX_MAP)) {
    const targetRgb = hexToRgb(hex);
    const dist = colorDistance(rgb, targetRgb);
    if (dist < minDist) {
      minDist = dist;
      closest = name as ClothingColor;
    }
  }

  return { name: closest, hex: COLOR_HEX_MAP[closest], distance: minDist };
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}
