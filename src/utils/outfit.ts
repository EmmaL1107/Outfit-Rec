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
import { STYLE_DRESS_CODE_MAP, STYLE_COMPATIBILITY, PATTERN_COMPATIBILITY, CATEGORY_PART_MAP } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { isWeekend } from './weather';
import { getBlacklistedIds, getLikedColorSchemes, getLikedStyleCombos, getDislikedColorSchemes } from '../store/preference';
import {
  isForbiddenColorPair,
  isInWhitelist,
  isBasicNeutralPair,
  isMonochromeDepthPair,
  isAdjacentColorPair,
  isSummerCoolPair,
  isWarmAutumnPair,
  isHarmoniousContrast,
  isTooColorful,
  hasHighSaturationClash,
  hasTooManyHighSaturationMainItems,
  isFragmentedCombo,
  isAccentColorAllowed,
  scoreColorPair,
  matchesTemplate,
  scoreTemplateMatch,
  hasStyleExclusion,
  getSeasonalBonus,
  getOccasionBonus,
  scoreSilhouette,
  NEUTRAL_COLORS,
} from './outfitTemplates';

const DARK_COLORS: ClothingColor[] = ['黑', '灰'];
const HOT_TEMP_THRESHOLD = 28;

const FORMAL_INCOMPATIBLE_STYLES: ClothingStyle[] = ['运动'];
const FORMAL_INCOMPATIBLE_CATEGORIES: string[] = ['拖鞋'];
const SPORT_INCOMPATIBLE_CATEGORIES: string[] = ['皮鞋'];
const CASUAL_FORMAL_CONFLICT: Record<ClothingStyle, ClothingStyle[]> = {
  '休闲': ['正式'],
  '运动': ['正式'],
  '正式': ['休闲', '运动'],
  '简约': [],
  '韩系': ['正式'],
  '日系': ['正式'],
  '复古': ['正式'],
  '甜酷': ['正式'],
  '学院风': ['正式'],
};

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

function filterByTemperatureStrict(clothes: ClothingItem[], temp: number): ClothingItem[] {
  return clothes.filter((item) => {
    if (item.part === '帽子' || item.part === '配饰') return true;

    if (temp < 15) {
      if (['短袖', '短裤'].includes(item.category)) return false;
      if (item.part === '外套') return true;
      if (['厚', '加厚'].includes(item.thickness)) return true;
      return item.thickness === '适中';
    } else if (temp <= 25) {
      if (item.thickness === '加厚') return false;
      if (item.category === '短裤') return false;
      return true;
    } else {
      if (['厚', '加厚'].includes(item.thickness)) return false;
      return true;
    }
  });
}

function filterByDressCode(clothes: ClothingItem[], dressCode: DressCode): ClothingItem[] {
  return clothes.filter((item) => {
    if (dressCode === '正式') {
      if (FORMAL_INCOMPATIBLE_STYLES.includes(item.style)) return false;
      if (FORMAL_INCOMPATIBLE_CATEGORIES.includes(item.category)) return false;
      return true;
    }
    if (dressCode === '运动') {
      if (SPORT_INCOMPATIBLE_CATEGORIES.includes(item.category)) return false;
      if (item.style === '正式') return false;
      return true;
    }
    return true;
  });
}

function hasStyleConflict(s1: ClothingStyle, s2: ClothingStyle): boolean {
  return CASUAL_FORMAL_CONFLICT[s1]?.includes(s2) ?? false;
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

function getSeasonFromTemp(temp: number): string {
  if (temp >= 28) return '夏';
  if (temp >= 15) return '春秋';
  return '秋冬';
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

function isPatternCompatible(p1: ClothingPattern, p2: ClothingPattern): boolean {
  if (p1 === p2) return true;
  return PATTERN_COMPATIBILITY[p1]?.includes(p2) ?? false;
}

function isStyleCompatible(s1: ClothingStyle, s2: ClothingStyle): boolean {
  if (s1 === s2) return true;
  return STYLE_COMPATIBILITY[s1]?.includes(s2) ?? false;
}

function scoreOutfitWithTemplates(
  top: ClothingItem,
  bottom: ClothingItem,
  outerwear: ClothingItem | undefined,
  style: ClothingStyle,
  temp: number,
  season?: string,
  scene?: string,
): number {
  let score = 0;

  // 1. 配色评分：同色系 > 邻近色 > 中性色百搭 > 和谐对比
  score += scoreColorPair(top.color, bottom.color);
  if (outerwear) {
    score += scoreColorPair(top.color, outerwear.color);
    score += scoreColorPair(bottom.color, outerwear.color);
  }

  if (!isInWhitelist(top.color, bottom.color)) score -= 30;

  if (isBasicNeutralPair(top.color, bottom.color)) score += 20;
  else if (isMonochromeDepthPair(top.color, bottom.color)) score += 18;
  else if (isAdjacentColorPair(top.color, bottom.color)) score += 16;
  else if (isSummerCoolPair(top.color, bottom.color)) score += 14;
  else if (isWarmAutumnPair(top.color, bottom.color)) score += 14;
  else if (isHarmoniousContrast(top.color, bottom.color)) score += 8;

  // 2. 版型评分：上宽下窄、上窄下宽、同松同紧
  score += scoreSilhouette(top.category, top.style, bottom.category, bottom.style);

  // 3. 场合评分
  score += scoreTemplateMatch(style, top.category, bottom.category, outerwear?.category);

  if (top.style === style && bottom.style === style) score += 20;
  else if (top.style === style || bottom.style === style) score += 10;
  else if (isStyleCompatible(top.style, bottom.style)) score += 5;

  if (hasStyleExclusion(top.style, top.category, bottom.style, bottom.category)) score -= 50;

  if (isPatternCompatible(top.pattern, bottom.pattern)) score += 6;

  const allColors = [top.color, bottom.color];
  if (outerwear) allColors.push(outerwear.color);
  const mainColorCount = new Set(allColors.filter((c) => !NEUTRAL_COLORS.includes(c))).size;
  if (mainColorCount <= 1) score += 10;
  else if (mainColorCount === 2) score += 5;

  if (hasHighSaturationClash(allColors)) score -= 40;

  // 4. 季节评分
  if (season) {
    score += getSeasonalBonus(top.category, bottom.category, outerwear?.category, top.color, bottom.color, season);
  }

  // 5. 场合评分（基于衣物场景标签）
  if (scene) {
    score += getOccasionBonus(scene, top.category, bottom.category, top.color, bottom.color, style);
  }

  score += (top.preferenceScore || 0) * 2;
  score += (bottom.preferenceScore || 0) * 2;
  if (outerwear) score += (outerwear.preferenceScore || 0) * 2;

  const likedSchemes = getLikedColorSchemes();
  const colorKey = [top.color, bottom.color].sort().join('+');
  if (likedSchemes.includes(colorKey)) score += 30;

  const likedCombos = getLikedStyleCombos();
  const styleKey = `${top.category}+${bottom.category}`;
  if (likedCombos.includes(styleKey)) score += 25;

  const dislikedSchemes = getDislikedColorSchemes();
  if (dislikedSchemes.includes(colorKey)) score -= 30;

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
  _style: ClothingStyle,
  compatibleStyles: ClothingStyle[],
  topColor: ClothingColor,
  bottomColor: ClothingColor,
  usedIds: Set<string>,
): ClothingItem | undefined {
  const avail = pool.filter((c) => !usedIds.has(c.id));
  if (avail.length === 0) return undefined;

  const validAvail = avail.filter((c) => isAccentColorAllowed(c.color, topColor, bottomColor));
  const finalAvail = validAvail.length > 0 ? validAvail : avail;

  const scored = finalAvail.map((c) => {
    let s = 0;
    if (compatibleStyles.includes(c.style)) s += 10;
    if (isAccentColorAllowed(c.color, topColor, bottomColor)) s += 15;
    else s -= 20;
    s += scoreColorPair(topColor, c.color);
    s += (c.preferenceScore || 0) * 2;
    return { item: c, score: s };
  });
  scored.sort((a, b) => b.score - a.score);

  const chosen = scored[0]?.item;
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
  season?: string,
  scene?: string,
): OutfitSuggestion | null {
  const availTops = tops.filter((c) => !usedIds.has(c.id));
  const availBottoms = bottoms.filter((c) => !usedIds.has(c.id));
  const availOuterwears = outerwears.filter((c) => !usedIds.has(c.id));

  const styleTops = penalizeDarkColors(availTops.filter((c) => c.style === style), temp);
  const styleBottoms = penalizeDarkColors(availBottoms.filter((c) => c.style === style), temp);
  const styleOuterwears = availOuterwears.filter((c) => c.style === style);

  const topPool = styleTops.length > 0 ? styleTops : penalizeDarkColors(availTops, temp);
  const bottomPool = styleBottoms.length > 0 ? styleBottoms : penalizeDarkColors(availBottoms, temp);

  if (topPool.length === 0 || bottomPool.length === 0) return null;

  const candidates: { top: ClothingItem; bottom: ClothingItem; outerwear?: ClothingItem; score: number }[] = [];

  for (const top of topPool) {
    for (const bottom of bottomPool) {
      if (hasStyleConflict(top.style, bottom.style)) continue;
      if (isForbiddenColorPair(top.color, bottom.color)) continue;
      if (hasStyleExclusion(top.style, top.category, bottom.style, bottom.category)) continue;
      if (hasTooManyHighSaturationMainItems(top.color, bottom.color)) continue;

      const allColors = [top.color, bottom.color];
      if (isTooColorful(allColors) > 2) continue;
      if (hasHighSaturationClash(allColors)) continue;

      if (!matchesTemplate(style, top.category, bottom.category)) continue;

      let outerwear: ClothingItem | undefined;
      const outerPool = styleOuterwears.length > 0 ? styleOuterwears : availOuterwears;
      if (outerPool.length > 0) {
        const outerCandidates = outerPool.filter((o) =>
          !isForbiddenColorPair(top.color, o.color) &&
          !isForbiddenColorPair(bottom.color, o.color) &&
          !isTooColorful([top.color, bottom.color, o.color]) &&
          !hasHighSaturationClash([top.color, bottom.color, o.color])
        );
        if (outerCandidates.length > 0) {
          const outerScored = pickBest(outerCandidates, (o) => {
            let s = scoreColorPair(top.color, o.color);
            if (o.style === style) s += 10;
            return s;
          }, 1);
          outerwear = outerScored[0];
        }
      }

      const score = scoreOutfitWithTemplates(top, bottom, outerwear, style, temp, season, scene);
      candidates.push({ top, bottom, outerwear, score });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  usedIds.add(best.top.id);
  usedIds.add(best.bottom.id);
  if (best.outerwear) usedIds.add(best.outerwear.id);

  const compatibleStyles = [style, ...STYLE_COMPATIBILITY[style]];
  const hat = pickAccessory(hats, style, compatibleStyles, best.top.color, best.bottom.color, usedIds);
  const shoe = pickAccessory(shoes, style, compatibleStyles, best.top.color, best.bottom.color, usedIds);
  const accessory = pickAccessory(accessories, style, compatibleStyles, best.top.color, best.bottom.color, usedIds);

  return { id: uuidv4(), top: best.top, bottom: best.bottom, outerwear: best.outerwear, hat, shoes: shoe, accessory, style, reason, eventId, crossStyle: false };
}

function buildOutfitRelaxed(
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
  season?: string,
  scene?: string,
): OutfitSuggestion | null {
  const availTops = tops.filter((c) => !usedIds.has(c.id));
  const availBottoms = bottoms.filter((c) => !usedIds.has(c.id));
  const availOuterwears = outerwears.filter((c) => !usedIds.has(c.id));

  if (availTops.length === 0 || availBottoms.length === 0) return null;

  const topPool = penalizeDarkColors(availTops, temp);
  const top = topPool[0];

  const compatibleStyles = [primaryStyle, ...STYLE_COMPATIBILITY[primaryStyle]];
  const compatibleBottoms = penalizeDarkColors(availBottoms.filter((b) => compatibleStyles.includes(b.style)), temp);
  const bottomPool = compatibleBottoms.length > 0 ? compatibleBottoms : penalizeDarkColors(availBottoms, temp);

  const candidates: { bottom: ClothingItem; outerwear?: ClothingItem; score: number }[] = [];

  for (const bottom of bottomPool) {
    if (isForbiddenColorPair(top.color, bottom.color)) continue;
    if (hasStyleExclusion(top.style, top.category, bottom.style, bottom.category)) continue;
    if (hasTooManyHighSaturationMainItems(top.color, bottom.color)) continue;

    const allColors = [top.color, bottom.color];
    if (isTooColorful(allColors) > 2) continue;
    if (hasHighSaturationClash(allColors)) continue;

    let outerwear: ClothingItem | undefined;
    const outerPool = availOuterwears.length > 0 ? availOuterwears : [];
    if (outerPool.length > 0) {
      const outerCandidates = outerPool.filter((o) =>
        !isForbiddenColorPair(top.color, o.color) &&
        !isForbiddenColorPair(bottom.color, o.color) &&
        !hasHighSaturationClash([top.color, bottom.color, o.color])
      );
      if (outerCandidates.length > 0) {
        const outerScored = pickBest(outerCandidates, (o) => {
          let s = scoreColorPair(top.color, o.color);
          if (o.style === primaryStyle) s += 5;
          else if (compatibleStyles.includes(o.style)) s += 2;
          return s;
        }, 1);
        outerwear = outerScored[0];
      }
    }

    const score = scoreOutfitWithTemplates(top, bottom, outerwear, primaryStyle, temp, season, scene);
    candidates.push({ bottom, outerwear, score });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  usedIds.add(top.id);
  usedIds.add(best.bottom.id);
  if (best.outerwear) usedIds.add(best.outerwear.id);

  const hat = pickAccessory(hats, primaryStyle, compatibleStyles, top.color, best.bottom.color, usedIds);
  const shoe = pickAccessory(shoes, primaryStyle, compatibleStyles, top.color, best.bottom.color, usedIds);
  const accessory = pickAccessory(accessories, primaryStyle, compatibleStyles, top.color, best.bottom.color, usedIds);

  const isCross = top.style !== best.bottom.style;
  const crossNote = isCross ? `（${top.style}风上衣 + ${best.bottom.style}风下装混搭）` : '';

  return {
    id: uuidv4(), top, bottom: best.bottom, outerwear: best.outerwear, hat, shoes: shoe, accessory,
    style: primaryStyle, reason: reason + crossNote, eventId, crossStyle: isCross,
  };
}

function validateOutfitCompatibility(top: ClothingItem, bottom: ClothingItem, outerwear?: ClothingItem): boolean {
  if (isForbiddenColorPair(top.color, bottom.color)) return false;
  if (hasStyleConflict(top.style, bottom.style)) return false;
  if (hasStyleExclusion(top.style, top.category, bottom.style, bottom.category)) return false;
  if (hasTooManyHighSaturationMainItems(top.color, bottom.color)) return false;
  if (outerwear) {
    if (isForbiddenColorPair(top.color, outerwear.color)) return false;
    if (isForbiddenColorPair(bottom.color, outerwear.color)) return false;
    if (hasStyleConflict(top.style, outerwear.style)) return false;
    if (isFragmentedCombo(top.color, bottom.color, outerwear.color)) return false;
  }
  const allColors = [top.color, bottom.color];
  if (outerwear) allColors.push(outerwear.color);
  if (isTooColorful(allColors) > 2) return false;
  if (hasHighSaturationClash(allColors)) return false;
  return true;
}

function tryGenerate(
  clothes: ClothingItem[],
  weather: WeatherData,
  events: CalendarEvent[],
  filterFn: (clothes: ClothingItem[], weather: WeatherData) => ClothingItem[],
  strict: boolean,
): OutfitSuggestion[] {
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => e.date === today);
  const weekend = isWeekend();
  const temp = weekend ? weather.tempMin : weather.tempMax;
  const blacklistedIds = getBlacklistedIds();
  const season = getSeasonFromTemp(temp);

  let filteredClothes = filterFn(clothes, weather);
  filteredClothes = filterByTemperatureStrict(filteredClothes, temp);
  filteredClothes = filteredClothes.filter((c) => !blacklistedIds.includes(c.id));

  const dressCode = todayEvents.length > 0 ? todayEvents[0].dressCode : undefined;
  if (dressCode) {
    filteredClothes = filterByDressCode(filteredClothes, dressCode);
  }

  const suggestions: OutfitSuggestion[] = [];
  const usedStyles = new Set<ClothingStyle>();
  const usedIds = new Set<string>();

  const tops = filteredClothes.filter((c) => c.part === '上衣');
  const bottoms = filteredClothes.filter((c) => c.part === '下装');
  const outerwears = filteredClothes.filter((c) => c.part === '外套');
  const hats = filteredClothes.filter((c) => c.part === '帽子');
  const shoes = filteredClothes.filter((c) => c.part === '鞋子');
  const accessories = filteredClothes.filter((c) => c.part === '配饰');

  if (tops.length === 0 || bottoms.length === 0) return [];

  const dayType = weekend ? '休息日' : '工作日';
  const tempNote = !strict
    ? `${weather.tempMin}°~${weather.tempMax}°C`
    : weekend
      ? `最低${weather.tempMin}°C（休息日可能外出，注意晚间保暖）`
      : `最高${weather.tempMax}°C（工作日中午较热，穿少一点）`;

  // Determine primary scene for the day
  const primaryScene = weekend ? '日常' : '通勤';

  if (todayEvents.length > 0) {
    for (const event of todayEvents) {
      const eventDressCode = event.dressCode as DressCode;
      const allowedStyles = STYLE_DRESS_CODE_MAP[eventDressCode] || ['休闲'];
      // Derive scene from dress code
      const eventScene = eventDressCode === '正式' ? '正式会议' : eventDressCode === '运动' ? '运动' : '通勤';
      for (const style of allowedStyles) {
        if (usedStyles.has(style)) continue;
        const outfit = buildOutfitStrict(
          tops, bottoms, outerwears, hats, shoes, accessories,
          style, `为事件「${event.title}」搭配，着装要求：${eventDressCode}。${tempNote}`,
          temp, usedIds, event.id, season, eventScene,
        );
        if (outfit && validateOutfitCompatibility(outfit.top!, outfit.bottom!, outfit.outerwear)) {
          suggestions.push(outfit);
          usedStyles.add(style);
          break;
        } else if (outfit) {
          usedIds.delete(outfit.top!.id);
          usedIds.delete(outfit.bottom!.id);
          if (outfit.outerwear) usedIds.delete(outfit.outerwear.id);
        }
      }
      if (suggestions.filter((s) => s.eventId === event.id).length === 0) {
        for (const style of allowedStyles) {
          if (usedStyles.has(style)) continue;
          const outfit = buildOutfitRelaxed(
            tops, bottoms, outerwears, hats, shoes, accessories,
            style, `为事件「${event.title}」搭配，着装要求：${eventDressCode}。${tempNote}`,
            temp, usedIds, event.id, season, eventScene,
          );
          if (outfit && validateOutfitCompatibility(outfit.top!, outfit.bottom!, outfit.outerwear)) {
            suggestions.push(outfit);
            usedStyles.add(style);
            break;
          } else if (outfit) {
            usedIds.delete(outfit.top!.id);
            usedIds.delete(outfit.bottom!.id);
            if (outfit.outerwear) usedIds.delete(outfit.outerwear.id);
          }
        }
      }
    }
  }

  const allStyles: ClothingStyle[] = ['休闲', '简约', '韩系', '日系', '运动', '正式', '复古', '甜酷', '学院风'];
  const remainingStyles = allStyles.filter((s) => !usedStyles.has(s));

  for (const style of remainingStyles) {
    if (suggestions.length >= 5) break;
    const outfit = buildOutfitStrict(
      tops, bottoms, outerwears, hats, shoes, accessories,
      style, `今日${dayType}，${weather.condition}，${tempNote}，推荐${style}风格`,
      temp, usedIds, undefined, season, primaryScene,
    );
    if (outfit && validateOutfitCompatibility(outfit.top!, outfit.bottom!, outfit.outerwear)) {
      suggestions.push(outfit);
      usedStyles.add(style);
    } else if (outfit) {
      usedIds.delete(outfit.top!.id);
      usedIds.delete(outfit.bottom!.id);
      if (outfit.outerwear) usedIds.delete(outfit.outerwear.id);
    }
  }

  for (const style of remainingStyles.filter((s) => !usedStyles.has(s))) {
    if (suggestions.length >= 5) break;
    const outfit = buildOutfitRelaxed(
      tops, bottoms, outerwears, hats, shoes, accessories,
      style, `今日${dayType}，${weather.condition}，${tempNote}，推荐${style}风格`,
      temp, usedIds, undefined, season, primaryScene,
    );
    if (outfit && validateOutfitCompatibility(outfit.top!, outfit.bottom!, outfit.outerwear)) {
      suggestions.push(outfit);
      usedStyles.add(style);
    } else if (outfit) {
      usedIds.delete(outfit.top!.id);
      usedIds.delete(outfit.bottom!.id);
      if (outfit.outerwear) usedIds.delete(outfit.outerwear.id);
    }
  }

  while (suggestions.length < 3) {
    let added = false;
    for (const style of allStyles) {
      if (usedStyles.has(style)) continue;
      const outfit = buildOutfitRelaxed(
        tops, bottoms, outerwears, hats, shoes, accessories,
        style, `今日${dayType}，${weather.condition}，${tempNote}，推荐${style}风格`,
        temp, usedIds, undefined, season, primaryScene,
      );
      if (outfit && validateOutfitCompatibility(outfit.top!, outfit.bottom!, outfit.outerwear)) {
        suggestions.push(outfit);
        usedStyles.add(style);
        added = true;
        break;
      } else if (outfit) {
        usedIds.delete(outfit.top!.id);
        usedIds.delete(outfit.bottom!.id);
        if (outfit.outerwear) usedIds.delete(outfit.outerwear.id);
      }
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
        const validPool = pool.filter((o) =>
          !isForbiddenColorPair(s.top!.color, o.color) &&
          !isTooColorful([s.top!.color, s.bottom!.color, o.color])
        );
        const finalPool = validPool.length > 0 ? validPool : pool;
        const harmonious = finalPool.filter((o) => isInWhitelist(s.top!.color, o.color) || isHarmoniousContrast(s.top!.color, o.color));
        const chosen = harmonious.length > 0 ? harmonious[0] : finalPool[0];
        s.outerwear = chosen;
        usedIds.add(chosen.id);
        s.reason += '（已添加外套防寒）';
      }
    }
    if (!s.hat && needsHat(weather)) {
      const hat = pickAccessory(hats, s.style, [s.style, ...STYLE_COMPATIBILITY[s.style]], s.top!.color, s.bottom!.color, usedIds);
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
  let results = tryGenerate(clothes, weather, events, filterByWeatherStrict, true);
  if (results.length >= 2) return results.slice(0, 5);

  results = tryGenerate(clothes, weather, events, filterByWeatherRelaxed, true);
  if (results.length >= 2) return results.slice(0, 5);

  results = tryGenerate(clothes, weather, events, (c) => c, false);
  return results.slice(0, 5);
}

function scoreReplacementMatch(
  candidate: ClothingItem,
  currentItem: ClothingItem,
  otherItems: ClothingItem[],
  style: ClothingStyle,
): number {
  let score = 0;

  score += (candidate.preferenceScore || 0) * 2;

  score += scoreColorPair(candidate.color, currentItem.color);

  if (candidate.style === style) score += 15;
  else if (isStyleCompatible(candidate.style, style)) score += 8;

  for (const other of otherItems) {
    score += scoreColorPair(candidate.color, other.color);
    if (isStyleCompatible(candidate.style, other.style)) score += 2;
  }

  if (candidate.season.some((s) => currentItem.season.includes(s))) score += 5;
  if (candidate.scene.some((s) => currentItem.scene.includes(s))) score += 5;

  const allColors = otherItems.map((o) => o.color).concat([candidate.color]);
  if (!isTooColorful(allColors)) score += 10;

  return score;
}

export function replaceOutfitItem(
  outfit: OutfitSuggestion,
  part: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'hat' | 'accessory',
  clothes: ClothingItem[],
  _weather: WeatherData,
): OutfitSuggestion | null {
  const currentItem = outfit[part];
  if (!currentItem) return null;

  const blacklistedIds = getBlacklistedIds();

  const samePartClothes = clothes.filter((c) =>
    c.part === currentItem.part &&
    c.id !== currentItem.id &&
    !blacklistedIds.includes(c.id)
  );

  if (samePartClothes.length === 0) return null;

  const otherItems: ClothingItem[] = [];
  const parts: ('top' | 'bottom' | 'outerwear' | 'shoes' | 'hat' | 'accessory')[] =
    ['top', 'bottom', 'outerwear', 'shoes', 'hat', 'accessory'];

  for (const p of parts) {
    if (p !== part && outfit[p]) {
      otherItems.push(outfit[p]!);
    }
  }

  const validCandidates = samePartClothes.filter((c) => {
    const allOther = otherItems.filter((o) => o.part === '上衣' || o.part === '下装' || o.part === '外套');
    for (const other of allOther) {
      if (isForbiddenColorPair(c.color, other.color)) return false;
    }
    const allColors = allOther.map((o) => o.color).concat([c.color]);
    if (isTooColorful(allColors)) return false;
    return true;
  });

  const pool = validCandidates.length > 0 ? validCandidates : samePartClothes;

  const scored = pool.map((c) => ({
    item: c,
    score: scoreReplacementMatch(c, currentItem, otherItems, outfit.style),
  }));

  scored.sort((a, b) => b.score - a.score);

  const bestCandidate = scored[0]?.item;
  if (!bestCandidate) return null;

  const newOutfit: OutfitSuggestion = { ...outfit };
  newOutfit[part] = bestCandidate;
  newOutfit.id = uuidv4();

  return newOutfit;
}

export { CATEGORY_PART_MAP };
