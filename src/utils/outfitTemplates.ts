import type { ClothingColor, ClothingStyle, ClothingCategory } from '../types';

export interface ColorPair {
  c1: ClothingColor;
  c2: ClothingColor;
}

export const NEUTRAL_COLORS: ClothingColor[] = ['黑', '白', '灰', '卡其'];

export const HIGH_SATURATION_COLORS: ClothingColor[] = ['红', '蓝', '黄', '绿'];

export const ACCENT_COLORS: ClothingColor[] = ['红', '蓝', '绿', '黄', '粉色'];

export const BASIC_NEUTRAL_PAIRS: ColorPair[] = [
  { c1: '白', c2: '黑' },
  { c1: '黑', c2: '白' },
  { c1: '白', c2: '灰' },
  { c1: '灰', c2: '黑' },
  { c1: '白', c2: '卡其' },
  { c1: '卡其', c2: '黑' },
  { c1: '黑', c2: '蓝' },
  { c1: '白', c2: '蓝' },
];

export const MONOCHROME_DEPTH_PAIRS: ColorPair[] = [
  { c1: '蓝', c2: '蓝' },
  { c1: '灰', c2: '灰' },
  { c1: '白', c2: '卡其' },
  { c1: '卡其', c2: '卡其' },
  { c1: '蓝', c2: '灰' },
  { c1: '粉色', c2: '粉色' },
  { c1: '绿', c2: '绿' },
];

export const SUMMER_COOL_PAIRS: ColorPair[] = [
  { c1: '白', c2: '蓝' },
  { c1: '蓝', c2: '白' },
  { c1: '灰', c2: '黑' },
  { c1: '白', c2: '卡其' },
  { c1: '绿', c2: '白' },
  { c1: '黄', c2: '白' },
];

export const WARM_AUTUMN_PAIRS: ColorPair[] = [
  { c1: '卡其', c2: '卡其' },
  { c1: '卡其', c2: '白' },
  { c1: '白', c2: '灰' },
  { c1: '粉色', c2: '灰' },
  { c1: '卡其', c2: '黑' },
];

export const SAFE_COLOR_WHITELIST: ColorPair[] = [
  ...BASIC_NEUTRAL_PAIRS,
  ...MONOCHROME_DEPTH_PAIRS,
  ...SUMMER_COOL_PAIRS,
  ...WARM_AUTUMN_PAIRS,
];

export const HARMONIOUS_CONTRAST_PAIRS: ColorPair[] = [
  { c1: '蓝', c2: '白' },
  { c1: '蓝', c2: '黑' },
  { c1: '蓝', c2: '卡其' },
  { c1: '卡其', c2: '白' },
  { c1: '黑', c2: '红' },
  { c1: '白', c2: '蓝' },
  { c1: '黑', c2: '白' },
  { c1: '灰', c2: '蓝' },
];

export const FORBIDDEN_COLOR_PAIRS: ColorPair[] = [
  { c1: '红', c2: '绿' },
  { c1: '黄', c2: '蓝' },
  { c1: '红', c2: '蓝' },
  { c1: '红', c2: '卡其' },
  { c1: '绿', c2: '黄' },
  { c1: '红', c2: '粉色' },
  { c1: '绿', c2: '蓝' },
  { c1: '黄', c2: '绿' },
];

export function isColorPairInList(c1: ClothingColor, c2: ClothingColor, list: ColorPair[]): boolean {
  return list.some((p) => (p.c1 === c1 && p.c2 === c2) || (p.c1 === c2 && p.c2 === c1));
}

export function isInWhitelist(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, SAFE_COLOR_WHITELIST);
}

export function isBasicNeutralPair(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, BASIC_NEUTRAL_PAIRS);
}

export function isMonochromeDepthPair(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, MONOCHROME_DEPTH_PAIRS);
}

export function isSummerCoolPair(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, SUMMER_COOL_PAIRS);
}

export function isWarmAutumnPair(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, WARM_AUTUMN_PAIRS);
}

export function isHarmoniousContrast(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, HARMONIOUS_CONTRAST_PAIRS);
}

export function isForbiddenColorPair(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, FORBIDDEN_COLOR_PAIRS);
}

export function isHighSaturation(color: ClothingColor): boolean {
  return HIGH_SATURATION_COLORS.includes(color);
}

export function countHighSaturationMainItems(colors: ClothingColor[]): number {
  return colors.filter((c) => HIGH_SATURATION_COLORS.includes(c)).length;
}

export function hasTooManyHighSaturationMainItems(topColor: ClothingColor, bottomColor: ClothingColor): boolean {
  const count = countHighSaturationMainItems([topColor, bottomColor]);
  return count > 1;
}

export function hasHighSaturationClash(colors: ClothingColor[]): boolean {
  const highSatSet = new Set(colors.filter((c) => HIGH_SATURATION_COLORS.includes(c)));
  return highSatSet.size >= 3;
}

export function isTooColorful(colors: ClothingColor[]): number {
  return new Set(colors.filter((c) => !NEUTRAL_COLORS.includes(c))).size;
}

export function isFragmentedCombo(
  topColor: ClothingColor,
  bottomColor: ClothingColor,
  accentColor: ClothingColor | undefined,
): boolean {
  if (!accentColor) return false;
  if (isHighSaturation(accentColor) && !isHighSaturation(topColor) && !isHighSaturation(bottomColor)) {
    if (topColor !== accentColor && bottomColor !== accentColor) {
      if (!NEUTRAL_COLORS.includes(accentColor)) {
        return true;
      }
    }
  }
  return false;
}

export function isAccentColorAllowed(
  accentColor: ClothingColor,
  topColor: ClothingColor,
  bottomColor: ClothingColor,
): boolean {
  if (NEUTRAL_COLORS.includes(accentColor)) return true;
  if (accentColor === topColor || accentColor === bottomColor) return true;
  if (isHarmoniousContrast(accentColor, topColor) || isHarmoniousContrast(accentColor, bottomColor)) return true;
  return false;
}

export function scoreColorPair(c1: ClothingColor, c2: ClothingColor): number {
  if (isForbiddenColorPair(c1, c2)) return -100;
  if (hasTooManyHighSaturationMainItems(c1, c2)) return -80;
  if (isBasicNeutralPair(c1, c2)) return 30;
  if (isMonochromeDepthPair(c1, c2)) return 28;
  if (isSummerCoolPair(c1, c2)) return 26;
  if (isWarmAutumnPair(c1, c2)) return 26;
  if (isInWhitelist(c1, c2)) return 25;
  if (isHarmoniousContrast(c1, c2)) return 15;
  if (NEUTRAL_COLORS.includes(c1) || NEUTRAL_COLORS.includes(c2)) return 8;
  return -5;
}

export interface StyleExclusionRule {
  topStyle: ClothingStyle;
  topCategory: ClothingCategory;
  forbiddenBottomStyles: ClothingStyle[];
  forbiddenBottomCategories: ClothingCategory[];
}

export const STYLE_EXCLUSION_RULES: StyleExclusionRule[] = [
  {
    topStyle: '正式',
    topCategory: '衬衫',
    forbiddenBottomStyles: ['运动'],
    forbiddenBottomCategories: ['短裤'],
  },
  {
    topStyle: '正式',
    topCategory: '毛衣',
    forbiddenBottomStyles: ['运动'],
    forbiddenBottomCategories: ['短裤'],
  },
  {
    topStyle: '运动',
    topCategory: '短袖',
    forbiddenBottomStyles: ['正式'],
    forbiddenBottomCategories: ['裙子'],
  },
  {
    topStyle: '运动',
    topCategory: '卫衣',
    forbiddenBottomStyles: ['正式'],
    forbiddenBottomCategories: ['裙子'],
  },
];

export function hasStyleExclusion(
  topStyle: ClothingStyle,
  topCategory: ClothingCategory,
  bottomStyle: ClothingStyle,
  bottomCategory: ClothingCategory,
): boolean {
  return STYLE_EXCLUSION_RULES.some(
    (rule) =>
      rule.topStyle === topStyle &&
      rule.topCategory === topCategory &&
      (rule.forbiddenBottomStyles.includes(bottomStyle) ||
        rule.forbiddenBottomCategories.includes(bottomCategory))
  );
}

export interface SeasonalOutfitTemplate {
  season: string;
  topCategory: ClothingCategory;
  bottomCategory: ClothingCategory;
  outerwearCategory?: ClothingCategory;
  preferredColors: ColorPair[];
  style: ClothingStyle;
}

export const SEASONAL_TEMPLATES: SeasonalOutfitTemplate[] = [
  {
    season: '夏',
    topCategory: '短袖',
    bottomCategory: '长裤',
    preferredColors: [{ c1: '白', c2: '蓝' }, { c1: '白', c2: '卡其' }, { c1: '白', c2: '黑' }, { c1: '蓝', c2: '白' }],
    style: '休闲',
  },
  {
    season: '夏',
    topCategory: '短袖',
    bottomCategory: '短裤',
    preferredColors: [{ c1: '白', c2: '蓝' }, { c1: '白', c2: '卡其' }, { c1: '蓝', c2: '白' }, { c1: '灰', c2: '黑' }],
    style: '休闲',
  },
  {
    season: '夏',
    topCategory: '短袖',
    bottomCategory: '裙子',
    preferredColors: [{ c1: '白', c2: '蓝' }, { c1: '粉色', c2: '白' }, { c1: '白', c2: '卡其' }],
    style: '休闲',
  },
  {
    season: '春秋',
    topCategory: '衬衫',
    bottomCategory: '长裤',
    preferredColors: [{ c1: '白', c2: '蓝' }, { c1: '白', c2: '卡其' }, { c1: '蓝', c2: '黑' }, { c1: '白', c2: '黑' }],
    style: '简约',
  },
  {
    season: '春秋',
    topCategory: '长袖',
    bottomCategory: '长裤',
    preferredColors: [{ c1: '灰', c2: '黑' }, { c1: '白', c2: '蓝' }, { c1: '蓝', c2: '灰' }],
    style: '休闲',
  },
  {
    season: '春秋',
    topCategory: '短袖',
    bottomCategory: '长裤',
    outerwearCategory: '外套',
    preferredColors: [{ c1: '白', c2: '蓝' }, { c1: '灰', c2: '黑' }, { c1: '白', c2: '卡其' }],
    style: '休闲',
  },
  {
    season: '春秋',
    topCategory: '毛衣',
    bottomCategory: '裙子',
    preferredColors: [{ c1: '粉色', c2: '白' }, { c1: '卡其', c2: '白' }, { c1: '卡其', c2: '卡其' }],
    style: '韩系',
  },
  {
    season: '秋冬',
    topCategory: '卫衣',
    bottomCategory: '长裤',
    preferredColors: [{ c1: '灰', c2: '黑' }, { c1: '黑', c2: '黑' }, { c1: '蓝', c2: '黑' }],
    style: '休闲',
  },
  {
    season: '秋冬',
    topCategory: '毛衣',
    bottomCategory: '长裤',
    outerwearCategory: '外套',
    preferredColors: [{ c1: '黑', c2: '黑' }, { c1: '灰', c2: '黑' }, { c1: '卡其', c2: '黑' }],
    style: '简约',
  },
  {
    season: '秋冬',
    topCategory: '衬衫',
    bottomCategory: '长裤',
    outerwearCategory: '外套',
    preferredColors: [{ c1: '白', c2: '蓝' }, { c1: '白', c2: '黑' }, { c1: '灰', c2: '黑' }],
    style: '正式',
  },
];

export function getSeasonalBonus(
  topCategory: ClothingCategory,
  bottomCategory: ClothingCategory,
  outerwearCategory: ClothingCategory | undefined,
  topColor: ClothingColor,
  bottomColor: ClothingColor,
  season: string,
): number {
  let bonus = 0;
  for (const tmpl of SEASONAL_TEMPLATES) {
    if (tmpl.season !== season) continue;
    if (tmpl.topCategory !== topCategory || tmpl.bottomCategory !== bottomCategory) continue;
    if (tmpl.outerwearCategory && tmpl.outerwearCategory !== outerwearCategory) continue;

    bonus += 8;

    const colorMatch = tmpl.preferredColors.some(
      (p) => (p.c1 === topColor && p.c2 === bottomColor) || (p.c1 === bottomColor && p.c2 === topColor)
    );
    if (colorMatch) bonus += 15;
  }
  return bonus;
}

export interface OutfitTemplate {
  style: ClothingStyle;
  topCategories: ClothingCategory[];
  bottomCategories: ClothingCategory[];
  outerwearCategories: ClothingCategory[];
  shoeCategories: ClothingCategory[];
  description: string;
}

export const OUTFIT_TEMPLATES: OutfitTemplate[] = [
  {
    style: '休闲',
    topCategories: ['短袖', '长袖', '卫衣'],
    bottomCategories: ['长裤', '短裤'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '休闲日常风',
  },
  {
    style: '简约',
    topCategories: ['衬衫', '长袖', '毛衣'],
    bottomCategories: ['长裤', '裙子'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '简约通勤风',
  },
  {
    style: '运动',
    topCategories: ['短袖', '卫衣'],
    bottomCategories: ['长裤', '短裤'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '轻户外运动风',
  },
  {
    style: '正式',
    topCategories: ['衬衫', '毛衣'],
    bottomCategories: ['长裤', '裙子'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '正式通勤风',
  },
  {
    style: '韩系',
    topCategories: ['短袖', '长袖', '衬衫', '卫衣'],
    bottomCategories: ['长裤', '裙子', '短裤'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '韩系潮流风',
  },
  {
    style: '日系',
    topCategories: ['衬衫', '长袖', '短袖'],
    bottomCategories: ['长裤', '裙子'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '日系简约风',
  },
  {
    style: '复古',
    topCategories: ['衬衫', '长袖', '毛衣'],
    bottomCategories: ['长裤', '裙子'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '复古文艺风',
  },
  {
    style: '甜酷',
    topCategories: ['短袖', '卫衣', '长袖'],
    bottomCategories: ['长裤', '短裤', '裙子'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '甜酷个性风',
  },
  {
    style: '学院风',
    topCategories: ['衬衫', '毛衣', '卫衣'],
    bottomCategories: ['长裤', '裙子'],
    outerwearCategories: ['外套'],
    shoeCategories: ['鞋子'],
    description: '学院青春风',
  },
];

export function getTemplateForStyle(style: ClothingStyle): OutfitTemplate | undefined {
  return OUTFIT_TEMPLATES.find((t) => t.style === style);
}

export function matchesTemplate(
  style: ClothingStyle,
  topCategory: ClothingCategory,
  bottomCategory: ClothingCategory,
): boolean {
  const template = getTemplateForStyle(style);
  if (!template) return true;
  return template.topCategories.includes(topCategory) && template.bottomCategories.includes(bottomCategory);
}

export function scoreTemplateMatch(
  style: ClothingStyle,
  topCategory: ClothingCategory,
  bottomCategory: ClothingCategory,
  outerwearCategory?: ClothingCategory,
): number {
  const template = getTemplateForStyle(style);
  if (!template) return 0;
  let score = 0;
  if (template.topCategories.includes(topCategory)) score += 15;
  if (template.bottomCategories.includes(bottomCategory)) score += 15;
  if (outerwearCategory && template.outerwearCategories.includes(outerwearCategory)) score += 5;
  return score;
}
