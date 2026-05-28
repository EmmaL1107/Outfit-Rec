import type { ClothingItem, ClothingCategory, ClothingColor, ClothingThickness, ClothingStyle, ClothingPattern, ClothingScene, Season } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORY_PART_MAP } from '../types';

const COLORS: ClothingColor[] = ['黑', '白', '灰', '红', '蓝', '绿', '黄', '卡其', '粉色'];
const THICKNESSES: ClothingThickness[] = ['薄', '适中', '厚'];
const STYLES: ClothingStyle[] = ['简约', '休闲', '运动', '正式', '复古', '韩系', '日系', '甜酷', '学院风'];
const PATTERNS: ClothingPattern[] = ['纯色', '条纹', '格子', '印花', '字母/图案', '拼接'];
const SCENES: ClothingScene[] = ['日常', '通勤', '正式会议', '约会', '运动', '居家', '派对'];
const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateClothingItem(category: ClothingCategory): ClothingItem {
  const color = randomItem(COLORS);
  const thickness = randomItem(THICKNESSES);
  const style = randomItem(STYLES);
  const pattern = randomItem(PATTERNS);
  const scene = randomItems(SCENES, 1, 3);
  const season = randomItems(SEASONS, 2, 4);

  return {
    id: uuidv4(),
    image: '',
    category,
    color,
    thickness,
    style,
    pattern,
    scene,
    season,
    part: CATEGORY_PART_MAP[category],
    createdAt: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    preferenceScore: 0,
  };
}

export function generateTestClothes(): ClothingItem[] {
  const clothes: ClothingItem[] = [];

  const topCategories: ClothingCategory[] = ['短袖', '长袖', '卫衣', '衬衫', '毛衣'];
  const bottomCategories: ClothingCategory[] = ['长裤', '短裤', '裙子'];
  const otherCategories: ClothingCategory[] = ['外套', '鞋子', '帽子', '配饰'];

  topCategories.forEach((cat) => {
    for (let i = 0; i < 4; i++) {
      clothes.push(generateClothingItem(cat));
    }
  });

  bottomCategories.forEach((cat) => {
    for (let i = 0; i < 4; i++) {
      clothes.push(generateClothingItem(cat));
    }
  });

  otherCategories.forEach((cat) => {
    for (let i = 0; i < 2; i++) {
      clothes.push(generateClothingItem(cat));
    }
  });

  return clothes;
}
