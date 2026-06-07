import type { ClothingColor, ClothingStyle, ClothingCategory } from '../types';

export interface ColorPair {
  c1: ClothingColor;
  c2: ClothingColor;
}

// ============================================================
// 配色系统：基于时尚搭配实战经验
// 核心原则：全身不超过3个颜色，中性色百搭，彩色需搭配和谐
// ============================================================

export const NEUTRAL_COLORS: ClothingColor[] = ['黑', '白', '灰', '卡其'];
export const HIGH_SATURATION_COLORS: ClothingColor[] = ['红', '蓝', '黄', '绿'];
export const ACCENT_COLORS: ClothingColor[] = ['红', '蓝', '绿', '黄', '粉色'];

// ============================================================
// 配色分级：从最经典到禁忌
// ============================================================

// S级：时尚界公认的经典配色，永远不会出错
export const S_TIER_PAIRS: ColorPair[] = [
  { c1: '黑', c2: '白' },     // 永恒经典
  { c1: '白', c2: '黑' },
  { c1: '蓝', c2: '白' },     // 蓝白条纹/牛仔+白T
  { c1: '白', c2: '蓝' },
  { c1: '黑', c2: '蓝' },     // 深蓝+黑，高级感
  { c1: '蓝', c2: '黑' },
];

// A级：非常好看的搭配，日常出街/通勤首选
export const A_TIER_PAIRS: ColorPair[] = [
  { c1: '白', c2: '卡其' },   // 干净温暖
  { c1: '卡其', c2: '白' },
  { c1: '黑', c2: '红' },     // 醒目优雅
  { c1: '红', c2: '黑' },
  { c1: '灰', c2: '白' },     // 极简高级
  { c1: '白', c2: '灰' },
  { c1: '灰', c2: '黑' },     // 深灰层次
  { c1: '黑', c2: '灰' },
  { c1: '白', c2: '粉色' },   // 甜美温柔
  { c1: '粉色', c2: '白' },
  { c1: '蓝', c2: '卡其' },   // 英伦风
  { c1: '卡其', c2: '蓝' },
  { c1: '蓝', c2: '粉色' },   // 冷暖对比，意外和谐
  { c1: '粉色', c2: '蓝' },
];

// B级：好看的搭配，有品味但不张扬
export const B_TIER_PAIRS: ColorPair[] = [
  { c1: '卡其', c2: '黑' },   // 大地色系
  { c1: '黑', c2: '卡其' },
  { c1: '灰', c2: '粉色' },   // 柔和高级
  { c1: '粉色', c2: '灰' },
  { c1: '白', c2: '绿' },     // 清新自然
  { c1: '绿', c2: '白' },
  { c1: '卡其', c2: '绿' },   // 大地色系
  { c1: '绿', c2: '卡其' },
  { c1: '白', c2: '黄' },     // 明亮活力
  { c1: '黄', c2: '白' },
  { c1: '黑', c2: '绿' },     // 深沉有质感
  { c1: '绿', c2: '黑' },
  { c1: '灰', c2: '蓝' },     // 冷调高级
  { c1: '蓝', c2: '灰' },
  { c1: '黑', c2: '粉色' },   // 甜酷风
  { c1: '粉色', c2: '黑' },
  { c1: '卡其', c2: '灰' },   // 温和通勤
  { c1: '灰', c2: '卡其' },
];

// C级：可以接受但不出彩，至少有一个中性色托底
export const C_TIER_PAIRS: ColorPair[] = [
  { c1: '黑', c2: '黄' },
  { c1: '黄', c2: '黑' },
  { c1: '灰', c2: '绿' },
  { c1: '绿', c2: '灰' },
  { c1: '灰', c2: '黄' },
  { c1: '黄', c2: '灰' },
  { c1: '灰', c2: '红' },
  { c1: '红', c2: '灰' },
  { c1: '白', c2: '红' },
  { c1: '红', c2: '白' },
  { c1: '卡其', c2: '粉色' },
  { c1: '粉色', c2: '卡其' },
  { c1: '卡其', c2: '黄' },
  { c1: '黄', c2: '卡其' },
  { c1: '蓝', c2: '绿' },     // 冷色系邻近
  { c1: '绿', c2: '蓝' },
  { c1: '蓝', c2: '黄' },     // 对比但可接受
  { c1: '黄', c2: '蓝' },
];

// 同色系搭配（深浅不同）
export const MONOCHROME_PAIRS: ColorPair[] = [
  { c1: '黑', c2: '灰' },
  { c1: '灰', c2: '黑' },
  { c1: '白', c2: '卡其' },
  { c1: '卡其', c2: '白' },
  { c1: '蓝', c2: '蓝' },
  { c1: '灰', c2: '灰' },
  { c1: '黑', c2: '黑' },
  { c1: '白', c2: '白' },
  { c1: '卡其', c2: '卡其' },
  { c1: '粉色', c2: '粉色' },
  { c1: '红', c2: '红' },
  { c1: '绿', c2: '绿' },
  { c1: '蓝', c2: '灰' },     // 深蓝浅灰同色系
  { c1: '灰', c2: '蓝' },
  { c1: '粉色', c2: '红' },   // 粉红同色系
  { c1: '红', c2: '粉色' },
  { c1: '绿', c2: '卡其' },   // 绿卡其大地色系
  { c1: '卡其', c2: '绿' },
];

// 禁忌配色：时尚灾难
export const FORBIDDEN_COLOR_PAIRS: ColorPair[] = [
  { c1: '红', c2: '绿' },       // 圣诞树
  { c1: '红', c2: '粉色' },     // 暖色打架
  { c1: '黄', c2: '绿' },       // 非洲国旗
  { c1: '黄', c2: '粉色' },     // 荧光灾难
  { c1: '红', c2: '黄' },       // 麦当劳
  { c1: '绿', c2: '粉色' },     // 不搭
];

// 夏季清凉配色
export const SUMMER_COOL_PAIRS: ColorPair[] = [
  { c1: '白', c2: '蓝' },
  { c1: '蓝', c2: '白' },
  { c1: '白', c2: '卡其' },
  { c1: '白', c2: '粉色' },
  { c1: '粉色', c2: '白' },
  { c1: '白', c2: '绿' },
  { c1: '白', c2: '灰' },
  { c1: '蓝', c2: '粉色' },
  { c1: '粉色', c2: '蓝' },
];

// 秋冬暖色配色
export const WARM_AUTUMN_PAIRS: ColorPair[] = [
  { c1: '黑', c2: '黑' },
  { c1: '黑', c2: '灰' },
  { c1: '灰', c2: '黑' },
  { c1: '黑', c2: '蓝' },
  { c1: '蓝', c2: '黑' },
  { c1: '黑', c2: '红' },
  { c1: '红', c2: '黑' },
  { c1: '卡其', c2: '黑' },
  { c1: '黑', c2: '卡其' },
  { c1: '卡其', c2: '卡其' },
  { c1: '卡其', c2: '灰' },
  { c1: '灰', c2: '卡其' },
  { c1: '黑', c2: '绿' },
  { c1: '绿', c2: '黑' },
  { c1: '黑', c2: '粉色' },
  { c1: '粉色', c2: '灰' },
];

// 安全白名单
export const SAFE_COLOR_WHITELIST: ColorPair[] = [
  ...S_TIER_PAIRS,
  ...A_TIER_PAIRS,
  ...B_TIER_PAIRS,
  ...C_TIER_PAIRS,
  ...MONOCHROME_PAIRS,
  ...SUMMER_COOL_PAIRS,
  ...WARM_AUTUMN_PAIRS,
];

// 和谐对比色
export const HARMONIOUS_CONTRAST_PAIRS: ColorPair[] = [
  ...S_TIER_PAIRS,
  ...A_TIER_PAIRS,
];

// ============================================================
// 配色评分
// ============================================================

export function isColorPairInList(c1: ClothingColor, c2: ClothingColor, list: ColorPair[]): boolean {
  return list.some((p) => (p.c1 === c1 && p.c2 === c2) || (p.c1 === c2 && p.c2 === c1));
}

export function isInWhitelist(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, SAFE_COLOR_WHITELIST);
}

export function isBasicNeutralPair(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, S_TIER_PAIRS) || isColorPairInList(c1, c2, A_TIER_PAIRS);
}

export function isMonochromeDepthPair(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, MONOCHROME_PAIRS);
}

export function isAdjacentColorPair(c1: ClothingColor, c2: ClothingColor): boolean {
  return isColorPairInList(c1, c2, B_TIER_PAIRS);
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

export function isNeutralColor(color: ClothingColor): boolean {
  return NEUTRAL_COLORS.includes(color) || color === '蓝';
}

export function isHighSaturation(color: ClothingColor): boolean {
  return HIGH_SATURATION_COLORS.includes(color);
}

export function countHighSaturationMainItems(colors: ClothingColor[]): number {
  return colors.filter((c) => HIGH_SATURATION_COLORS.includes(c)).length;
}

export function hasTooManyHighSaturationMainItems(topColor: ClothingColor, bottomColor: ClothingColor): boolean {
  return countHighSaturationMainItems([topColor, bottomColor]) > 1;
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
  if (isNeutralColor(accentColor)) return true;
  if (accentColor === topColor || accentColor === bottomColor) return true;
  if (isHarmoniousContrast(accentColor, topColor) || isHarmoniousContrast(accentColor, bottomColor)) return true;
  if (isInWhitelist(accentColor, topColor) || isInWhitelist(accentColor, bottomColor)) return true;
  return false;
}

// 核心评分函数：按时尚审美分级打分
export function scoreColorPair(c1: ClothingColor, c2: ClothingColor): number {
  // 禁忌配色：直接否决
  if (isForbiddenColorPair(c1, c2)) return -100;

  // 两个高饱和色撞在一起
  if (hasTooManyHighSaturationMainItems(c1, c2)) return -60;

  // S级：经典永恒
  if (isColorPairInList(c1, c2, S_TIER_PAIRS)) return 40;

  // A级：日常首选
  if (isColorPairInList(c1, c2, A_TIER_PAIRS)) return 30;

  // 同色系深浅
  if (isColorPairInList(c1, c2, MONOCHROME_PAIRS)) return 28;

  // B级：有品味
  if (isColorPairInList(c1, c2, B_TIER_PAIRS)) return 20;

  // C级：可以接受
  if (isColorPairInList(c1, c2, C_TIER_PAIRS)) return 10;

  // 至少有一个中性色
  if (NEUTRAL_COLORS.includes(c1) || NEUTRAL_COLORS.includes(c2) || c1 === '蓝' || c2 === '蓝') return 5;

  // 两个彩色撞色且不在任何列表中
  return -20;
}

// ============================================================
// 版型规则：上宽下窄、上窄下宽、同松同紧
// ============================================================

export type Silhouette = '宽松' | '修身' | '常规';

export function getSilhouette(category: ClothingCategory, style: ClothingStyle): Silhouette {
  if (['卫衣'].includes(category)) return '宽松';
  if (['短袖', '长袖'].includes(category) && ['休闲', '运动', '韩系', '甜酷'].includes(style)) return '宽松';
  if (['短袖', '长袖'].includes(category) && ['正式', '简约'].includes(style)) return '修身';
  if (['衬衫'].includes(category) && ['正式', '简约'].includes(style)) return '修身';
  if (['毛衣'].includes(category) && ['正式', '简约'].includes(style)) return '修身';
  if (['长裤'].includes(category) && ['休闲', '运动', '韩系', '日系'].includes(style)) return '宽松';
  if (['裙子'].includes(category) && ['休闲', '韩系', '复古'].includes(style)) return '宽松';
  if (['长裤'].includes(category) && ['正式', '简约'].includes(style)) return '修身';
  if (['裙子'].includes(category) && ['正式', '简约'].includes(style)) return '修身';
  if (['短裤'].includes(category)) return '常规';
  if (['外套'].includes(category) && ['休闲', '运动'].includes(style)) return '宽松';
  if (['外套'].includes(category) && ['正式', '简约'].includes(style)) return '修身';
  return '常规';
}

export function scoreSilhouette(
  topCategory: ClothingCategory,
  topStyle: ClothingStyle,
  bottomCategory: ClothingCategory,
  bottomStyle: ClothingStyle,
): number {
  const topSil = getSilhouette(topCategory, topStyle);
  const bottomSil = getSilhouette(bottomCategory, bottomStyle);
  if (topSil === '宽松' && bottomSil === '修身') return 20;
  if (topSil === '修身' && bottomSil === '宽松') return 18;
  if (topSil === bottomSil) return 15;
  if (topSil === '常规' || bottomSil === '常规') return 10;
  return 5;
}

// ============================================================
// 场合规则
// ============================================================

export interface OccasionTemplate {
  scene: string;
  topCategories: ClothingCategory[];
  bottomCategories: ClothingCategory[];
  preferredStyles: ClothingStyle[];
  preferredColors: ColorPair[];
  description: string;
}

export const OCCASION_TEMPLATES: OccasionTemplate[] = [
  {
    scene: '通勤',
    topCategories: ['衬衫', '毛衣'],
    bottomCategories: ['长裤', '裙子'],
    preferredStyles: ['正式', '简约'],
    preferredColors: [
      { c1: '白', c2: '黑' }, { c1: '白', c2: '蓝' }, { c1: '白', c2: '灰' },
      { c1: '白', c2: '卡其' }, { c1: '蓝', c2: '黑' }, { c1: '灰', c2: '黑' },
    ],
    description: '通勤 = 衬衫 + 西裤/半裙',
  },
  {
    scene: '日常',
    topCategories: ['短袖', '长袖', '卫衣'],
    bottomCategories: ['长裤', '短裤', '裙子'],
    preferredStyles: ['休闲', '简约', '韩系'],
    preferredColors: [
      { c1: '白', c2: '蓝' }, { c1: '白', c2: '黑' }, { c1: '白', c2: '卡其' },
      { c1: '灰', c2: '黑' }, { c1: '蓝', c2: '白' },
    ],
    description: '休闲 = T恤 + 牛仔裤',
  },
  {
    scene: '约会',
    topCategories: ['衬衫', '长袖', '短袖'],
    bottomCategories: ['裙子', '长裤'],
    preferredStyles: ['韩系', '甜酷', '简约'],
    preferredColors: [
      { c1: '白', c2: '粉色' }, { c1: '粉色', c2: '白' }, { c1: '白', c2: '蓝' },
      { c1: '白', c2: '卡其' }, { c1: '粉色', c2: '蓝' }, { c1: '白', c2: '黑' },
    ],
    description: '约会 = 连衣裙 / 温柔风',
  },
  {
    scene: '正式会议',
    topCategories: ['衬衫', '毛衣'],
    bottomCategories: ['长裤', '裙子'],
    preferredStyles: ['正式', '简约'],
    preferredColors: [
      { c1: '白', c2: '黑' }, { c1: '白', c2: '灰' }, { c1: '蓝', c2: '黑' },
      { c1: '灰', c2: '黑' },
    ],
    description: '正式 = 衬衫 + 西裤',
  },
  {
    scene: '运动',
    topCategories: ['短袖', '卫衣'],
    bottomCategories: ['长裤', '短裤'],
    preferredStyles: ['运动', '休闲'],
    preferredColors: [
      { c1: '黑', c2: '白' }, { c1: '黑', c2: '灰' }, { c1: '灰', c2: '白' },
      { c1: '黑', c2: '蓝' },
    ],
    description: '运动 = 运动上衣 + 运动裤',
  },
  {
    scene: '居家',
    topCategories: ['短袖', '长袖', '卫衣'],
    bottomCategories: ['长裤', '短裤'],
    preferredStyles: ['休闲', '简约'],
    preferredColors: [
      { c1: '白', c2: '灰' }, { c1: '灰', c2: '黑' }, { c1: '白', c2: '卡其' },
    ],
    description: '居家 = 舒适宽松',
  },
  {
    scene: '派对',
    topCategories: ['短袖', '长袖', '衬衫'],
    bottomCategories: ['裙子', '长裤', '短裤'],
    preferredStyles: ['甜酷', '韩系', '复古'],
    preferredColors: [
      { c1: '黑', c2: '红' }, { c1: '黑', c2: '白' }, { c1: '黑', c2: '粉色' },
      { c1: '白', c2: '红' }, { c1: '蓝', c2: '黑' },
    ],
    description: '派对 = 个性时尚',
  },
];

export function getOccasionBonus(
  scene: string,
  topCategory: ClothingCategory,
  bottomCategory: ClothingCategory,
  topColor: ClothingColor,
  bottomColor: ClothingColor,
  style: ClothingStyle,
): number {
  let bonus = 0;
  for (const tmpl of OCCASION_TEMPLATES) {
    if (tmpl.scene !== scene) continue;
    if (tmpl.topCategories.includes(topCategory)) bonus += 8;
    if (tmpl.bottomCategories.includes(bottomCategory)) bonus += 8;
    if (tmpl.preferredStyles.includes(style)) bonus += 6;
    const colorMatch = tmpl.preferredColors.some(
      (p) => (p.c1 === topColor && p.c2 === bottomColor) || (p.c1 === bottomColor && p.c2 === topColor)
    );
    if (colorMatch) bonus += 10;
  }
  return bonus;
}

// ============================================================
// 季节规则：夏=浅色系/透气；冬=深色系/厚材质
// ============================================================

export const LIGHT_COLORS: ClothingColor[] = ['白', '卡其', '粉色', '黄'];
export const DARK_COLORS_FOR_SEASON: ClothingColor[] = ['黑', '灰', '蓝'];

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
    preferredColors: [{ c1: '白', c2: '蓝' }, { c1: '白', c2: '卡其' }, { c1: '蓝', c2: '白' }, { c1: '白', c2: '粉色' }],
    style: '休闲',
  },
  {
    season: '夏',
    topCategory: '短袖',
    bottomCategory: '裙子',
    preferredColors: [{ c1: '白', c2: '蓝' }, { c1: '粉色', c2: '白' }, { c1: '白', c2: '卡其' }, { c1: '粉色', c2: '蓝' }],
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
    preferredColors: [{ c1: '黑', c2: '黑' }, { c1: '灰', c2: '黑' }, { c1: '卡其', c2: '黑' }, { c1: '蓝', c2: '黑' }],
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
  if (season === '夏') {
    if (LIGHT_COLORS.includes(topColor)) bonus += 5;
    if (LIGHT_COLORS.includes(bottomColor)) bonus += 5;
  } else if (season === '秋冬') {
    if (DARK_COLORS_FOR_SEASON.includes(topColor)) bonus += 5;
    if (DARK_COLORS_FOR_SEASON.includes(bottomColor)) bonus += 5;
  }
  return bonus;
}

// ============================================================
// Style exclusion rules
// ============================================================

export interface StyleExclusionRule {
  topStyle: ClothingStyle;
  topCategory: ClothingCategory;
  forbiddenBottomStyles: ClothingStyle[];
  forbiddenBottomCategories: ClothingCategory[];
}

export const STYLE_EXCLUSION_RULES: StyleExclusionRule[] = [
  { topStyle: '正式', topCategory: '衬衫', forbiddenBottomStyles: ['运动'], forbiddenBottomCategories: ['短裤'] },
  { topStyle: '正式', topCategory: '毛衣', forbiddenBottomStyles: ['运动'], forbiddenBottomCategories: ['短裤'] },
  { topStyle: '运动', topCategory: '短袖', forbiddenBottomStyles: ['正式'], forbiddenBottomCategories: ['裙子'] },
  { topStyle: '运动', topCategory: '卫衣', forbiddenBottomStyles: ['正式'], forbiddenBottomCategories: ['裙子'] },
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
      (rule.forbiddenBottomStyles.includes(bottomStyle) || rule.forbiddenBottomCategories.includes(bottomCategory))
  );
}

// ============================================================
// Outfit templates by style
// ============================================================

export interface OutfitTemplate {
  style: ClothingStyle;
  topCategories: ClothingCategory[];
  bottomCategories: ClothingCategory[];
  outerwearCategories: ClothingCategory[];
  shoeCategories: ClothingCategory[];
  description: string;
}

export const OUTFIT_TEMPLATES: OutfitTemplate[] = [
  { style: '休闲', topCategories: ['短袖', '长袖', '卫衣'], bottomCategories: ['长裤', '短裤'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '休闲日常风' },
  { style: '简约', topCategories: ['衬衫', '长袖', '毛衣'], bottomCategories: ['长裤', '裙子'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '简约通勤风' },
  { style: '运动', topCategories: ['短袖', '卫衣'], bottomCategories: ['长裤', '短裤'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '轻户外运动风' },
  { style: '正式', topCategories: ['衬衫', '毛衣'], bottomCategories: ['长裤', '裙子'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '正式通勤风' },
  { style: '韩系', topCategories: ['短袖', '长袖', '衬衫', '卫衣'], bottomCategories: ['长裤', '裙子', '短裤'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '韩系潮流风' },
  { style: '日系', topCategories: ['衬衫', '长袖', '短袖'], bottomCategories: ['长裤', '裙子'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '日系简约风' },
  { style: '复古', topCategories: ['衬衫', '长袖', '毛衣'], bottomCategories: ['长裤', '裙子'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '复古文艺风' },
  { style: '甜酷', topCategories: ['短袖', '卫衣', '长袖'], bottomCategories: ['长裤', '短裤', '裙子'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '甜酷个性风' },
  { style: '学院风', topCategories: ['衬衫', '毛衣', '卫衣'], bottomCategories: ['长裤', '裙子'], outerwearCategories: ['外套'], shoeCategories: ['鞋子'], description: '学院青春风' },
];

export function getTemplateForStyle(style: ClothingStyle): OutfitTemplate | undefined {
  return OUTFIT_TEMPLATES.find((t) => t.style === style);
}

export function matchesTemplate(style: ClothingStyle, topCategory: ClothingCategory, bottomCategory: ClothingCategory): boolean {
  const template = getTemplateForStyle(style);
  if (!template) return true;
  return template.topCategories.includes(topCategory) && template.bottomCategories.includes(bottomCategory);
}

export function scoreTemplateMatch(style: ClothingStyle, topCategory: ClothingCategory, bottomCategory: ClothingCategory, outerwearCategory?: ClothingCategory): number {
  const template = getTemplateForStyle(style);
  if (!template) return 0;
  let score = 0;
  if (template.topCategories.includes(topCategory)) score += 15;
  if (template.bottomCategories.includes(bottomCategory)) score += 15;
  if (outerwearCategory && template.outerwearCategories.includes(outerwearCategory)) score += 5;
  return score;
}
