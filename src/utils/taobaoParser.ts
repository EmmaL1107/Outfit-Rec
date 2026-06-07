import type {
  ClothingCategory,
  ClothingColor,
  ClothingThickness,
  ClothingStyle,
  ClothingPattern,
  ClothingScene,
  Season,
} from '../types';

const CATEGORY_KEYWORDS: Record<ClothingCategory, string[]> = {
  '短袖': ['短袖', '短t', '短T', '短款上衣', '半袖', '夏装上衣', 'polo', 'Polo', 'POLO'],
  '长袖': ['长袖', '长t', '长T', '秋装上衣', '春装上衣', '打底衫', '内搭'],
  '卫衣': ['卫衣', '连帽衫', '帽衫', '圆领卫衣', '连帽卫衣'],
  '衬衫': ['衬衫', '衬衣', '白衬衫', '格子衬衫', '牛仔衬衫', '法式衬衫'],
  '毛衣': ['毛衣', '针织衫', '针织', '毛衫', '羊毛衫', '开衫', '套头毛衣'],
  '外套': ['外套', '夹克', '风衣', '大衣', '西装外套', '牛仔外套', '皮衣', '棒球服', '棉服', '羽绒服', '冲锋衣', '马甲'],
  '长裤': ['长裤', '裤子', '牛仔裤', '西裤', '休闲裤', '运动裤', '阔腿裤', '直筒裤', '工装裤', '哈伦裤', '烟管裤'],
  '短裤': ['短裤', '短裤', '五分裤', '热裤', '沙滩裤'],
  '裙子': ['裙子', '半身裙', '连衣裙', '长裙', '短裙', '百褶裙', 'a字裙', 'A字裙', '包臀裙', '碎花裙'],
  '帽子': ['帽子', '鸭舌帽', '棒球帽', '渔夫帽', '贝雷帽', '毛线帽', '遮阳帽'],
  '鞋子': ['鞋子', '运动鞋', '板鞋', '帆布鞋', '皮鞋', '高跟鞋', '凉鞋', '靴子', '短靴', '长靴', '老爹鞋', '小白鞋', '马丁靴'],
  '配饰': ['配饰', '围巾', '领带', '腰带', '皮带', '手表', '项链', '耳环', '手链', '墨镜', '包包', '背包', '手提包'],
};

const COLOR_KEYWORDS: Record<ClothingColor, string[]> = {
  '黑': ['黑色', '纯黑', '黑', '暗黑', '墨黑', '炭黑'],
  '白': ['白色', '纯白', '白', '米白', '奶白', '象牙白', '本白'],
  '灰': ['灰色', '灰', '浅灰', '深灰', '烟灰', '高级灰', '雾霾灰'],
  '红': ['红色', '红', '酒红', '暗红', '正红', '大红', '砖红', '玫红', '枣红'],
  '蓝': ['蓝色', '蓝', '深蓝', '浅蓝', '天蓝', '藏蓝', '湖蓝', '宝蓝', '牛仔蓝', '雾霾蓝'],
  '绿': ['绿色', '绿', '墨绿', '浅绿', '军绿', '草绿', '薄荷绿', '牛油果绿', '抹茶绿'],
  '黄': ['黄色', '黄', '鹅黄', '姜黄', '明黄', '柠檬黄', '奶黄'],
  '卡其': ['卡其', '卡其色', '杏色', '驼色', '米色', '奶茶色', '燕麦色', '焦糖', '咖色', '棕色', '咖啡色'],
  '粉色': ['粉色', '粉', '粉红', '浅粉', '樱花粉', '蜜桃粉', '藕粉', '茱萸粉'],
};

const STYLE_KEYWORDS: Record<ClothingStyle, string[]> = {
  '简约': ['简约', '极简', '基础款', '百搭', '基本款', '纯色', '素色', '简约风'],
  '休闲': ['休闲', '日常', '宽松', '舒适', '慵懒', '随性', '休闲风', '日系休闲'],
  '运动': ['运动', '健身', '跑步', '瑜伽', '训练', '速干', '运动风', 'athleisure'],
  '正式': ['正式', '商务', '通勤', '职业', '西装', '正装', 'OL', '职场', '白领'],
  '复古': ['复古', 'vintage', '古着', '怀旧', '港风', '老钱风', '法式复古'],
  '韩系': ['韩版', '韩系', '韩风', '韩式', 'ins风', '韩系穿搭', '韩国'],
  '日系': ['日系', '日风', '日式', '原宿', '盐系', '森系', '日系穿搭', 'cityboy', 'city girl'],
  '甜酷': ['甜酷', '辣妹', 'y2k', '千禧', '甜辣', '暗黑甜', '美式甜酷'],
  '学院风': ['学院', '学院风', 'preppy', '校园', '英伦', '校服', 'jk', 'JK'],
};

const PATTERN_KEYWORDS: Record<ClothingPattern, string[]> = {
  '纯色': ['纯色', '素色', '净色', '纯色系', '单色'],
  '条纹': ['条纹', '横条纹', '竖条纹', '海魂衫', '条纹衫', '条纹控'],
  '格子': ['格子', '格纹', '格仔', '千鸟格', '苏格兰格', '威尔士格', '棋盘格'],
  '印花': ['印花', '碎花', '花卉', '花色', '图案', '涂鸦', '手绘', '植物印花'],
  '字母/图案': ['字母', 'logo', '印花字母', '标语', 'slogan', '卡通', '动漫', 'ip联名', '联名款'],
  '拼接': ['拼接', '拼色', '撞色', '双色', '色块', '不对称'],
};

const THICKNESS_KEYWORDS: Record<ClothingThickness, string[]> = {
  '薄': ['薄款', '轻薄', '透气', '冰丝', '雪纺', '薄', '夏季', '速干', '凉爽'],
  '适中': ['适中', '常规', '中厚', '四季', '春秋', '常规厚度'],
  '厚': ['厚款', '加厚', '保暖', '磨毛', '厚', '秋冬', '加绒', '抓绒', '摇粒绒'],
  '加厚': ['加厚', '极厚', '极寒', '羽绒', '棉服', '加厚保暖', '极地', '防寒'],
};

const SCENE_KEYWORDS: Record<ClothingScene, string[]> = {
  '日常': ['日常', '百搭', '休闲', '出街', '逛街', '上学'],
  '通勤': ['通勤', '上班', '办公', '职场', 'OL', '商务'],
  '正式会议': ['正式', '会议', '面试', '典礼', '宴会', '晚宴', '出席'],
  '约会': ['约会', '聚会', '派对', '出片', '拍照', '写真'],
  '运动': ['运动', '健身', '跑步', '瑜伽', '户外', '徒步', '露营'],
  '居家': ['居家', '睡衣', '家居', '室内', '懒人', '宅家'],
  '派对': ['派对', '蹦迪', 'club', '夜店', '聚会', '年会'],
};

const SEASON_KEYWORDS: Record<Season, string[]> = {
  '春': ['春季', '春天', '春装', '初春', '春款'],
  '夏': ['夏季', '夏天', '夏装', '盛夏', '夏款', '清凉', '冰感'],
  '秋': ['秋季', '秋天', '秋装', '初秋', '秋款', '早秋'],
  '冬': ['冬季', '冬天', '冬装', '寒冬', '冬款', '保暖'],
};

function matchKeywords(text: string, keywordMap: Record<string, string[]>): string | null {
  const lowerText = text.toLowerCase();
  let bestMatch: string | null = null;
  let bestLength = 0;

  for (const [key, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase()) && kw.length > bestLength) {
        bestMatch = key;
        bestLength = kw.length;
      }
    }
  }

  return bestMatch;
}

export interface ParsedTaobaoResult {
  category: ClothingCategory | null;
  color: ClothingColor | null;
  thickness: ClothingThickness | null;
  style: ClothingStyle | null;
  pattern: ClothingPattern | null;
  scenes: ClothingScene[];
  seasons: Season[];
  rawText: string;
}

export function parseTaobaoText(text: string): ParsedTaobaoResult {
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  const category = matchKeywords(cleanedText, CATEGORY_KEYWORDS) as ClothingCategory | null;
  const color = matchKeywords(cleanedText, COLOR_KEYWORDS) as ClothingColor | null;
  const thickness = matchKeywords(cleanedText, THICKNESS_KEYWORDS) as ClothingThickness | null;
  const style = matchKeywords(cleanedText, STYLE_KEYWORDS) as ClothingStyle | null;
  const pattern = matchKeywords(cleanedText, PATTERN_KEYWORDS) as ClothingPattern | null;

  const scenes: ClothingScene[] = [];
  for (const [scene, keywords] of Object.entries(SCENE_KEYWORDS)) {
    if (keywords.some((kw) => cleanedText.toLowerCase().includes(kw.toLowerCase()))) {
      scenes.push(scene as ClothingScene);
    }
  }

  const seasons: Season[] = [];
  for (const [season, keywords] of Object.entries(SEASON_KEYWORDS)) {
    if (keywords.some((kw) => cleanedText.toLowerCase().includes(kw.toLowerCase()))) {
      seasons.push(season as Season);
    }
  }

  return {
    category,
    color,
    thickness,
    style,
    pattern,
    scenes: scenes.length > 0 ? scenes : ['日常'],
    seasons: seasons.length > 0 ? seasons : ['春', '秋'],
    rawText: cleanedText,
  };
}

export async function extractTextFromImage(imageSrc: string): Promise<string> {
  const Tesseract = await import('tesseract.js');
  const result = await Tesseract.recognize(imageSrc, 'chi_sim+eng', {
    logger: () => {},
  });
  return result.data.text;
}
