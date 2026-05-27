export type ClothingStyle =
  | '简约'
  | '休闲'
  | '运动'
  | '正式'
  | '复古'
  | '韩系'
  | '日系'
  | '甜酷'
  | '学院风';

export type ClothingCategory =
  | '长袖'
  | '短袖'
  | '长裤'
  | '短裤'
  | '裙子'
  | '外套'
  | '卫衣'
  | '衬衫'
  | '毛衣'
  | '帽子'
  | '鞋子'
  | '配饰';

export type ClothingThickness = '薄' | '适中' | '厚' | '加厚';

export type ClothingColor =
  | '黑'
  | '白'
  | '灰'
  | '红'
  | '蓝'
  | '绿'
  | '黄'
  | '卡其'
  | '粉色';

export type ClothingPattern = '纯色' | '条纹' | '格子' | '印花' | '字母/图案' | '拼接';

export type ClothingScene =
  | '日常'
  | '通勤'
  | '正式会议'
  | '约会'
  | '运动'
  | '居家'
  | '派对';

export type Season = '春' | '夏' | '秋' | '冬';

export type ClothingPart = '上衣' | '下装' | '外套' | '帽子' | '鞋子' | '配饰';

export interface ClothingItem {
  id: string;
  image: string;
  category: ClothingCategory;
  color: ClothingColor;
  thickness: ClothingThickness;
  style: ClothingStyle;
  pattern: ClothingPattern;
  scene: ClothingScene[];
  season: Season[];
  part: ClothingPart;
  createdAt: number;
}

export type DressCode = '正式' | '休闲' | '运动' | '简约';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  dressCode: DressCode;
  description: string;
}

export type WeatherCondition = '晴' | '阴' | '多云' | '雨' | '雪';

export interface WeatherData {
  temperature: number;
  tempMax: number;
  tempMin: number;
  condition: WeatherCondition;
  isRaining: boolean;
  isSnowing: boolean;
  city: string;
  humidity: number;
  windSpeed: number;
}

export interface OutfitSuggestion {
  id: string;
  top?: ClothingItem;
  bottom?: ClothingItem;
  outerwear?: ClothingItem;
  hat?: ClothingItem;
  shoes?: ClothingItem;
  accessory?: ClothingItem;
  style: ClothingStyle;
  reason: string;
  eventId?: string;
  crossStyle?: boolean;
}

export interface AppSettings {
  city: string;
  weatherApiKey: string;
}

export const CLOTHING_CATEGORIES: ClothingCategory[] = [
  '长袖', '短袖', '长裤', '短裤', '裙子', '外套', '卫衣', '衬衫', '毛衣', '帽子', '鞋子', '配饰',
];

export const CLOTHING_COLORS: ClothingColor[] = [
  '黑', '白', '灰', '红', '蓝', '绿', '黄', '卡其', '粉色',
];

export const CLOTHING_THICKNESSES: ClothingThickness[] = [
  '薄', '适中', '厚', '加厚',
];

export const CLOTHING_PATTERNS: ClothingPattern[] = [
  '纯色', '条纹', '格子', '印花', '字母/图案', '拼接',
];

export const CLOTHING_STYLES: ClothingStyle[] = [
  '简约', '休闲', '运动', '正式', '复古', '韩系', '日系', '甜酷', '学院风',
];

export const CLOTHING_SCENES: ClothingScene[] = [
  '日常', '通勤', '正式会议', '约会', '运动', '居家', '派对',
];

export const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

export const DRESS_CODES: DressCode[] = ['正式', '休闲', '运动', '简约'];

export const CATEGORY_PART_MAP: Record<ClothingCategory, ClothingPart> = {
  '长袖': '上衣',
  '短袖': '上衣',
  '卫衣': '上衣',
  '衬衫': '上衣',
  '毛衣': '上衣',
  '长裤': '下装',
  '短裤': '下装',
  '裙子': '下装',
  '外套': '外套',
  '帽子': '帽子',
  '鞋子': '鞋子',
  '配饰': '配饰',
};

export const COLOR_HEX_MAP: Record<ClothingColor, string> = {
  '黑': '#1a1a1a',
  '白': '#f5f5f5',
  '灰': '#9e9e9e',
  '红': '#e53935',
  '蓝': '#1e88e5',
  '绿': '#43a047',
  '黄': '#fdd835',
  '卡其': '#c8b560',
  '粉色': '#f48fb1',
};

export const STYLE_DRESS_CODE_MAP: Record<DressCode, ClothingStyle[]> = {
  '正式': ['正式', '简约'],
  '休闲': ['休闲', '简约', '韩系', '日系'],
  '运动': ['运动', '休闲'],
  '简约': ['简约', '休闲', '韩系'],
};

export const STYLE_COMPATIBILITY: Record<ClothingStyle, ClothingStyle[]> = {
  '正式': ['简约', '韩系'],
  '简约': ['正式', '休闲', '韩系', '日系'],
  '休闲': ['简约', '运动', '韩系', '日系'],
  '运动': ['休闲', '简约'],
  '韩系': ['简约', '休闲', '日系', '甜酷'],
  '日系': ['简约', '休闲', '韩系', '学院风'],
  '复古': ['休闲', '韩系'],
  '甜酷': ['韩系', '休闲', '日系'],
  '学院风': ['日系', '休闲', '简约'],
};

export const COLOR_HARMONY: Record<ClothingColor, ClothingColor[]> = {
  '黑': ['白', '灰', '红', '蓝', '卡其', '粉色'],
  '白': ['黑', '蓝', '红', '卡其', '粉色', '黄'],
  '灰': ['黑', '白', '蓝', '红', '粉色', '卡其'],
  '红': ['黑', '白', '灰', '蓝'],
  '蓝': ['白', '黑', '灰', '卡其'],
  '绿': ['白', '黑', '卡其', '灰'],
  '黄': ['黑', '白', '蓝', '灰'],
  '卡其': ['白', '黑', '蓝', '灰', '绿'],
  '粉色': ['白', '黑', '灰', '蓝'],
};

export const PATTERN_COMPATIBILITY: Record<ClothingPattern, ClothingPattern[]> = {
  '纯色': ['纯色', '条纹', '格子', '印花', '字母/图案', '拼接'],
  '条纹': ['纯色', '条纹'],
  '格子': ['纯色'],
  '印花': ['纯色'],
  '字母/图案': ['纯色', '字母/图案'],
  '拼接': ['纯色'],
};
