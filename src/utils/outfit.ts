import type {
  ClothingItem,
  ClothingThickness,
  ClothingStyle,
  ClothingPattern,
  ClothingColor,
  WeatherData,
  CalendarEvent,
  OutfitSuggestion,
  DressCode,
} from '../types';
import { STYLE_DRESS_CODE_MAP, STYLE_COMPATIBILITY, COLOR_HARMONY, PATTERN_COMPATIBILITY, CATEGORY_PART_MAP } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { isWeekend } from './weather';

const DARK_COLORS: ClothingColor[] = ['黑', '灰'];
const HOT_TEMP_THRESHOLD = 28;

function getThicknessByTemp(temp: number): ClothingThickness[] {
  if (temp >= 28) return ['薄'];
  if (temp >= 22) return ['薄', '适中'];
  if (temp >= 15) return ['适中', '薄'];
  if (temp >= 8) return ['厚', '适中'];
  return ['加厚', '厚'];
}

function getCategoriesByTemp(temp: number): string[] {
  if (temp >= 28) return ['短袖', '短裤', '裙子'];
  if (temp >= 22) return ['短袖', '长袖', '长裤', '短裤', '裙子'];
  if (temp >= 15) return ['长袖', '衬衫', '卫衣', '长裤', '裙子'];
  if (temp >= 8) return ['长袖', '卫衣', '衬衫', '毛衣', '长裤', '外套'];
  return ['长袖', '卫衣', '毛衣', '长裤', '外套'];
}

function needsOuterwear(weather: WeatherData, weekend: boolean): boolean {
  if (weather.temperature < 18) return true;
  if (weekend && weather.tempMin < 12) return true;
  if (weather.isRaining || weather.isSnowing || weather.windSpeed > 20) return true;
  return false;
}

function needsHat(weather: WeatherData): boolean {
  return weather.isRaining || weather.isSnowing || (weather.condition === '晴' && weather.tempMax >= 30);
}

function isHotWeather(temp: number): boolean {
  return temp >= HOT_TEMP_THRESHOLD;
}

function filterByWeatherStrict(clothes: ClothingItem[], weather: WeatherData): ClothingItem[] {
  const weekend = isWeekend();
  const refTemp = weekend ? weather.tempMin : weather.tempMax;
  const suitableThickness = getThicknessByTemp(refTemp);
  const suitableCategories = getCategoriesByTemp(refTemp);
  return clothes.filter((c) => {
    if (c.part === '帽子' || c.part === '鞋子' || c.part === '配饰') return true;
    if (!suitableThickness.includes(c.thickness)) return false;
    if (!suitableCategories.includes(c.category)) return false;
    if (weather.isRaining && c.part === '外套' && c.thickness === '薄') return false;
    return true;
  });
}

function filterByWeatherRelaxed(clothes: ClothingItem[], weather: WeatherData): ClothingItem[] {
  const weekend = isWeekend();
  const refTemp = weekend ? weather.tempMin : weather.tempMax;
  const suitableThickness = getThicknessByTemp(refTemp);
  return clothes.filter((c) => {
    if (c.part === '帽子' || c.part === '鞋子' || c.part === '配饰') return true;
    if (!suitableThickness.includes(c.thickness)) return false;
    if (weather.isRaining && c.part === '外套' && c.thickness === '薄') return false;
    return true;
  });
}

function penalizeDarkColors(clothes: ClothingItem[], temp: number): ClothingItem[] {
  if (!isHotWeather(temp)) return clothes;
  const lightItems = clothes.filter((c) => !DARK_COLORS.includes(c.color));
  if (lightItems.length > 0) return lightItems;
  return clothes;
}

function isColorHarmonious(c1: string, c2: string): boolean {
  if (c1 === c2) return true;
  return COLOR_HARMONY[c1 as keyof typeof COLOR_HARMONY]?.includes(c2 as never) ?? false;
}

function isPatternCompatible(p1: ClothingPattern, p2: ClothingPattern): boolean {
  if (p1 === p2) return true;
  return PATTERN_COMPATIBILITY[p1]?.includes(p2) ?? false;
}

function isStyleCompatible(s1: ClothingStyle, s2: ClothingStyle): boolean {
  if (s1 === s2) return true;
  return STYLE_COMPATIBILITY[s1]?.includes(s2) ?? false;
}

function scoreCompatibility(top: ClothingItem, bottom: ClothingItem, temp: number): number {
  let score = 0;
  if (top.style === bottom.style) score += 10;
  else if (isStyleCompatible(top.style, bottom.style)) score += 5;
  if (isColorHarmonious(top.color, bottom.color)) score += 8;
  if (isPatternCompatible(top.pattern, bottom.pattern)) score += 4;
  if (isHotWeather(temp)) {
    if (!DARK_COLORS.includes(top.color)) score += 3;
    if (!DARK_COLORS.includes(bottom.color)) score += 3;
  }
  return score;
}

function pickBest<T>(arr: T[], scorer: (item: T) => number, count: number): T[] {
  return [...arr]
    .sort((a, b) => scorer(b) - scorer(a))
    .slice(0, count);
}

function pickAccessory(
  pool: ClothingItem[],
  style: ClothingStyle,
  compatibleStyles: ClothingStyle[],
  topColor: ClothingColor,
  usedIds: Set<string>,
): ClothingItem | undefined {
  const avail = pool.filter((c) => !usedIds.has(c.id));
  if (avail.length === 0) return undefined;
  const styleMatch = avail.filter((c) => compatibleStyles.includes(c.style));
  const pool1 = styleMatch.length > 0 ? styleMatch : avail;
  const colorMatch = pool1.filter((c) => isColorHarmonious(topColor, c.color));
  const pool2 = colorMatch.length > 0 ? colorMatch : pool1;
  const chosen = pool2[0];
  usedIds.add(chosen.id);
  return chosen;
}

function buildOutfitStrict(
  tops: ClothingItem[],
  bottoms: ClothingItem[],
  outerwears: ClothingItem[],
  hats: ClothingItem[],
  shoes: ClothingItem[],
  accessories: ClothingItem[],
  style: ClothingStyle,
  reason: string,
  temp: number,
  usedIds: Set<string>,
  eventId?: string,
): OutfitSuggestion | null {
  const availTops = tops.filter((c) => !usedIds.has(c.id));
  const availBottoms = bottoms.filter((c) => !usedIds.has(c.id));
  const availOuterwears = outerwears.filter((c) => !usedIds.has(c.id));

  const styleTops = penalizeDarkColors(availTops.filter((c) => c.style === style), temp);
  const styleBottoms = penalizeDarkColors(availBottoms.filter((c) => c.style === style), temp);
  const styleOuterwears = availOuterwears.filter((c) => c.style === style);

  if (styleTops.length === 0 || styleBottoms.length === 0) return null;

  const top = styleTops[0];
  const harmoniousBottoms = styleBottoms.filter((b) => isColorHarmonious(top.color, b.color) && isPatternCompatible(top.pattern, b.pattern));
  const bottomPool = harmoniousBottoms.length > 0 ? harmoniousBottoms : styleBottoms.filter((b) => isColorHarmonious(top.color, b.color));
  const finalBottoms = bottomPool.length > 0 ? bottomPool : styleBottoms;
  const bottom = finalBottoms[0];

  usedIds.add(top.id);
  usedIds.add(bottom.id);

  let outerwear: ClothingItem | undefined;
  if (styleOuterwears.length > 0) {
    const harmonious = styleOuterwears.filter((o) => isColorHarmonious(top.color, o.color));
    const outerPool = harmonious.length > 0 ? harmonious : styleOuterwears;
    outerwear = outerPool[0];
    usedIds.add(outerwear.id);
  }

  const compatibleStyles = [style, ...STYLE_COMPATIBILITY[style]];
  const hat = pickAccessory(hats, style, compatibleStyles, top.color, usedIds);
  const shoe = pickAccessory(shoes, style, compatibleStyles, top.color, usedIds);
  const accessory = pickAccessory(accessories, style, compatibleStyles, top.color, usedIds);

  return { id: uuidv4(), top, bottom, outerwear, hat, shoes: shoe, accessory, style, reason, eventId, crossStyle: false };
}

function buildOutfitCrossStyle(
  tops: ClothingItem[],
  bottoms: ClothingItem[],
  outerwears: ClothingItem[],
  hats: ClothingItem[],
  shoes: ClothingItem[],
  accessories: ClothingItem[],
  primaryStyle: ClothingStyle,
  reason: string,
  temp: number,
  usedIds: Set<string>,
  eventId?: string,
): OutfitSuggestion | null {
  const availTops = tops.filter((c) => !usedIds.has(c.id));
  const availBottoms = bottoms.filter((c) => !usedIds.has(c.id));
  const availOuterwears = outerwears.filter((c) => !usedIds.has(c.id));

  if (availTops.length === 0 || availBottoms.length === 0) return null;

  const styleTops = penalizeDarkColors(availTops.filter((c) => c.style === primaryStyle), temp);
  const topPool = styleTops.length > 0 ? styleTops : penalizeDarkColors(availTops, temp);
  const top = topPool[0];

  const compatibleStyles = [primaryStyle, ...STYLE_COMPATIBILITY[primaryStyle]];
  const compatibleBottoms = penalizeDarkColors(availBottoms.filter((b) => compatibleStyles.includes(b.style)), temp);
  const bottomPool = compatibleBottoms.length > 0 ? compatibleBottoms : penalizeDarkColors(availBottoms, temp);

  const scored = pickBest(bottomPool, (b) => scoreCompatibility(top, b, temp), bottomPool.length);
  const bottom = scored[0];

  usedIds.add(top.id);
  usedIds.add(bottom.id);

  let outerwear: ClothingItem | undefined;
  const compatibleOuterwears = availOuterwears.filter((o) => compatibleStyles.includes(o.style));
  const outerPool = compatibleOuterwears.length > 0 ? compatibleOuterwears : availOuterwears;
  if (outerPool.length > 0) {
    const outerScored = pickBest(outerPool, (o) => {
      let s = isColorHarmonious(top.color, o.color) ? 8 : 0;
      if (o.style === primaryStyle) s += 5;
      else if (compatibleStyles.includes(o.style)) s += 2;
      return s;
    }, outerPool.length);
    outerwear = outerScored[0];
    usedIds.add(outerwear.id);
  }

  const hat = pickAccessory(hats, primaryStyle, compatibleStyles, top.color, usedIds);
  const shoe = pickAccessory(shoes, primaryStyle, compatibleStyles, top.color, usedIds);
  const accessory = pickAccessory(accessories, primaryStyle, compatibleStyles, top.color, usedIds);

  const isCross = top.style !== bottom.style;
  const crossNote = isCross ? `（${top.style}风上衣 + ${bottom.style}风下装混搭）` : '';

  return {
    id: uuidv4(), top, bottom, outerwear, hat, shoes: shoe, accessory,
    style: primaryStyle, reason: reason + crossNote, eventId, crossStyle: isCross,
  };
}

function tryGenerate(
  clothes: ClothingItem[],
  weather: WeatherData,
  events: CalendarEvent[],
  filterFn: (clothes: ClothingItem[], weather: WeatherData) => ClothingItem[],
  relaxed: boolean,
): OutfitSuggestion[] {
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => e.date === today);
  const weatherFiltered = filterFn(clothes, weather);
  const suggestions: OutfitSuggestion[] = [];
  const usedStyles = new Set<ClothingStyle>();
  const usedIds = new Set<string>();
  const weekend = isWeekend();
  const temp = weekend ? weather.tempMin : weather.tempMax;

  const tops = weatherFiltered.filter((c) => c.part === '上衣');
  const bottoms = weatherFiltered.filter((c) => c.part === '下装');
  const outerwears = weatherFiltered.filter((c) => c.part === '外套');
  const hats = weatherFiltered.filter((c) => c.part === '帽子');
  const shoes = weatherFiltered.filter((c) => c.part === '鞋子');
  const accessories = weatherFiltered.filter((c) => c.part === '配饰');

  if (tops.length === 0 || bottoms.length === 0) return [];

  const dayType = weekend ? '休息日' : '工作日';
  const tempNote = relaxed
    ? `${weather.tempMin}°~${weather.tempMax}°C`
    : weekend
      ? `最低${weather.tempMin}°C（休息日可能外出，注意晚间保暖）`
      : `最高${weather.tempMax}°C（工作日中午较热，穿少一点）`;

  if (todayEvents.length > 0) {
    for (const event of todayEvents) {
      const dressCode = event.dressCode as DressCode;
      const allowedStyles = STYLE_DRESS_CODE_MAP[dressCode] || ['休闲'];
      for (const style of allowedStyles) {
        if (usedStyles.has(style)) continue;
        const outfit = buildOutfitStrict(
          tops, bottoms, outerwears, hats, shoes, accessories,
          style, `为事件「${event.title}」搭配，着装要求：${dressCode}。${tempNote}`,
          temp, usedIds, event.id,
        );
        if (outfit) { suggestions.push(outfit); usedStyles.add(style); break; }
      }
      if (suggestions.filter((s) => s.eventId === event.id).length === 0) {
        for (const style of allowedStyles) {
          if (usedStyles.has(style)) continue;
          const outfit = buildOutfitCrossStyle(
            tops, bottoms, outerwears, hats, shoes, accessories,
            style, `为事件「${event.title}」搭配，着装要求：${dressCode}。${tempNote}`,
            temp, usedIds, event.id,
          );
          if (outfit) { suggestions.push(outfit); usedStyles.add(style); break; }
        }
      }
    }
  }

  const allStyles: ClothingStyle[] = ['休闲', '简约', '韩系', '日系', '运动', '正式', '复古', '甜酷', '学院风'];
  const remainingStyles = allStyles.filter((s) => !usedStyles.has(s));

  for (const style of remainingStyles) {
    if (suggestions.length >= 3) break;
    const outfit = buildOutfitStrict(
      tops, bottoms, outerwears, hats, shoes, accessories,
      style, `今日${dayType}，${weather.condition}，${tempNote}，推荐${style}风格`,
      temp, usedIds,
    );
    if (outfit) { suggestions.push(outfit); usedStyles.add(style); }
  }

  for (const style of remainingStyles.filter((s) => !usedStyles.has(s))) {
    if (suggestions.length >= 3) break;
    const outfit = buildOutfitCrossStyle(
      tops, bottoms, outerwears, hats, shoes, accessories,
      style, `今日${dayType}，${weather.condition}，${tempNote}，推荐${style}风格`,
      temp, usedIds,
    );
    if (outfit) { suggestions.push(outfit); usedStyles.add(style); }
  }

  while (suggestions.length < 2) {
    let added = false;
    for (const style of allStyles) {
      if (usedStyles.has(style)) continue;
      const outfit = buildOutfitCrossStyle(
        tops, bottoms, outerwears, hats, shoes, accessories,
        style, `今日${dayType}，${weather.condition}，${tempNote}，推荐${style}风格`,
        temp, usedIds,
      );
      if (outfit) { suggestions.push(outfit); usedStyles.add(style); added = true; break; }
    }
    if (!added) break;
  }

  suggestions.forEach((s) => {
    if (!s.outerwear && needsOuterwear(weather, weekend)) {
      const availOuterwears = outerwears.filter((o) => !usedIds.has(o.id));
      const compatibleStyles = s.crossStyle ? [s.style, ...STYLE_COMPATIBILITY[s.style]] : [s.style];
      const compatibleOuterwears = availOuterwears.filter((o) => compatibleStyles.includes(o.style));
      const pool = compatibleOuterwears.length > 0 ? compatibleOuterwears : availOuterwears.length > 0 ? availOuterwears : outerwears;
      if (pool.length > 0) {
        const harmonious = pool.filter((o) => isColorHarmonious(s.top!.color, o.color));
        const chosen = harmonious.length > 0 ? harmonious[0] : pool[0];
        s.outerwear = chosen;
        usedIds.add(chosen.id);
        s.reason += '（已添加外套防寒）';
      }
    }
    if (!s.hat && needsHat(weather)) {
      const hat = pickAccessory(hats, s.style, [s.style, ...STYLE_COMPATIBILITY[s.style]], s.top!.color, usedIds);
      if (hat) {
        s.hat = hat;
        const reason = weather.isRaining || weather.isSnowing ? '防雨雪' : '防晒';
        s.reason += `（已添加帽子${reason}）`;
      }
    }
  });

  if (isHotWeather(temp)) {
    suggestions.forEach((s) => {
      const hasDark = (s.top && DARK_COLORS.includes(s.top.color)) || (s.bottom && DARK_COLORS.includes(s.bottom.color));
      if (hasDark) s.reason += '（高温天建议选择浅色衣物更凉爽）';
    });
  }

  return suggestions;
}

export function generateOutfits(
  clothes: ClothingItem[],
  weather: WeatherData,
  events: CalendarEvent[],
): OutfitSuggestion[] {
  let results = tryGenerate(clothes, weather, events, filterByWeatherStrict, false);
  if (results.length >= 2) return results.slice(0, 3);

  results = tryGenerate(clothes, weather, events, filterByWeatherRelaxed, false);
  if (results.length >= 2) return results.slice(0, 3);

  results = tryGenerate(clothes, weather, events, (c) => c, true);
  return results.slice(0, 3);
}

export { CATEGORY_PART_MAP };
