import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  ClothingItem,
  ClothingCategory,
  ClothingColor,
  ClothingThickness,
  ClothingStyle,
  ClothingPattern,
  ClothingScene,
  Season,
} from '../types';
import {
  CLOTHING_CATEGORIES,
  CLOTHING_COLORS,
  CLOTHING_THICKNESSES,
  CLOTHING_PATTERNS,
  CLOTHING_STYLES,
  CLOTHING_SCENES,
  SEASONS,
  CATEGORY_PART_MAP,
  COLOR_HEX_MAP,
} from '../types';
import { clothingDB } from '../store/db';
import { compressImage } from '../utils/image';
import { generateTestClothes } from '../utils/testData';
import { extractColorsFromImage, rgbToClothingColor, rgbToHex, evaluateColorHarmony, findClosestColorName, type RGB } from '../utils/colorAnalysis';
import { parseTaobaoText } from '../utils/taobaoParser';
import { IconPlus, IconClose } from '../components/Icons';

type FilterState = {
  category: ClothingCategory | '';
  color: ClothingColor | '';
  thickness: ClothingThickness | '';
  style: ClothingStyle | '';
  pattern: ClothingPattern | '';
  scene: ClothingScene | '';
  season: Season | '';
};

export default function Wardrobe() {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editItem, setEditItem] = useState<ClothingItem | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    category: '', color: '', thickness: '', style: '', pattern: '', scene: '', season: '',
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [extractedColors, setExtractedColors] = useState<RGB[]>([]);
  const [taobaoText, setTaobaoText] = useState<string>('');
  const [harmonyResult, setHarmonyResult] = useState<ReturnType<typeof evaluateColorHarmony> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scanFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    category: '短袖' as ClothingCategory,
    color: '黑' as ClothingColor,
    thickness: '适中' as ClothingThickness,
    style: '休闲' as ClothingStyle,
    pattern: '纯色' as ClothingPattern,
    scene: ['日常'] as ClothingScene[],
    season: ['春'] as Season[],
  });

  useEffect(() => { loadClothes(); }, []);

  async function loadClothes() {
    setLoading(true);
    const items = await clothingDB.getAll();
    setClothes(items);
    setLoading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file).then(setPreviewImage);
    }
  }

  async function handleRemoveBackground() {
    if (!previewImage) return;
    setRemovingBg(true);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(previewImage);
      const url = URL.createObjectURL(blob);
      setPreviewImage(url);
    } catch (err) {
      console.error('抠图失败:', err);
    }
    setRemovingBg(false);
  }

  function toggleScene(scene: ClothingScene) {
    setForm((prev) => ({
      ...prev,
      scene: prev.scene.includes(scene) ? prev.scene.filter((s) => s !== scene) : [...prev.scene, scene],
    }));
  }

  function toggleSeason(season: Season) {
    setForm((prev) => ({
      ...prev,
      season: prev.season.includes(season) ? prev.season.filter((s) => s !== season) : [...prev.season, season],
    }));
  }

  async function handleSave() {
    if (editItem) {
      const updated: ClothingItem = { ...editItem, ...form, image: previewImage || editItem.image, part: CATEGORY_PART_MAP[form.category] };
      await clothingDB.put(updated);
    } else {
      const item: ClothingItem = { id: uuidv4(), image: previewImage || '', ...form, part: CATEGORY_PART_MAP[form.category], createdAt: Date.now(), preferenceScore: 0 };
      await clothingDB.add(item);
    }
    resetForm();
    await loadClothes();
  }

  async function handleDelete(id: string) {
    if (confirm('确定要删除这件衣物吗？')) {
      await clothingDB.delete(id);
      await loadClothes();
    }
  }

  function startEdit(item: ClothingItem) {
    setEditItem(item);
    setPreviewImage(item.image);
    setForm({
      category: item.category, color: item.color, thickness: item.thickness,
      style: item.style, pattern: item.pattern || '纯色', scene: [...item.scene], season: [...item.season],
    });
    setShowAdd(true);
  }

  function resetForm() {
    setShowAdd(false);
    setEditItem(null);
    setPreviewImage('');
    setExtractedColors([]);
    setTaobaoText('');
    setHarmonyResult(null);
    setForm({ category: '短袖', color: '黑', thickness: '适中', style: '休闲', pattern: '纯色', scene: ['日常'], season: ['春'] });
    if (fileRef.current) fileRef.current.value = '';
    if (scanFileRef.current) scanFileRef.current.value = '';
  }

  async function handleScanFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const compressed = await compressImage(file, 800);
      setPreviewImage(compressed);

      const colors = await extractColorsFromImage(compressed, 5, 'product');
      setExtractedColors(colors);

      if (colors.length > 0) {
        const primaryColor = rgbToClothingColor(colors[0]);
        setForm((f) => ({ ...f, color: primaryColor }));
      }

      if (colors.length >= 2) {
        const harmony = evaluateColorHarmony(colors.slice(0, 3));
        setHarmonyResult(harmony);
      }
    } catch (err) {
      console.error('扫描失败:', err);
    }
    setScanning(false);
  }

  function handleTaobaoTextParse() {
    if (!taobaoText.trim()) return;
    const parsed = parseTaobaoText(taobaoText);
    setForm((f) => ({
      ...f,
      category: parsed.category || f.category,
      color: parsed.color || f.color,
      thickness: parsed.thickness || f.thickness,
      style: parsed.style || f.style,
      pattern: parsed.pattern || f.pattern,
      scene: parsed.scenes.length > 0 ? parsed.scenes : f.scene,
      season: parsed.seasons.length > 0 ? parsed.seasons : f.season,
    }));
  }

  function startScan() {
    setExtractedColors([]);
    setHarmonyResult(null);
    setTimeout(() => scanFileRef.current?.click(), 100);
  }

  async function handleClearAllClothes() {
    setShowClearModal(false);
    setLoading(true);
    const allClothes = await clothingDB.getAll();
    for (const item of allClothes) { await clothingDB.delete(item.id); }
    await loadClothes();
  }

  async function handleGenerateTestClothes(mode: 'replace' | 'append') {
    setShowGenerateModal(false);
    setLoading(true);
    if (mode === 'replace') {
      const allClothes = await clothingDB.getAll();
      for (const item of allClothes) { await clothingDB.delete(item.id); }
    }
    const testClothes = generateTestClothes();
    for (const item of testClothes) { await clothingDB.add(item); }
    await loadClothes();
  }

  const filteredClothes = clothes.filter((c) => {
    if (filter.category && c.category !== filter.category) return false;
    if (filter.color && c.color !== filter.color) return false;
    if (filter.thickness && c.thickness !== filter.thickness) return false;
    if (filter.style && c.style !== filter.style) return false;
    if (filter.pattern && (c.pattern || '纯色') !== filter.pattern) return false;
    if (filter.scene && !c.scene.includes(filter.scene)) return false;
    if (filter.season && !c.season.includes(filter.season)) return false;
    return true;
  });

  const hasActiveFilter = Object.values(filter).some((v) => v !== '');

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* HEADER */}
      <section className="max-w-lg mx-auto px-5 pt-10 pb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-gray-500 mb-1.5">MY</p>
            <h1 className="text-[28px] font-bold text-black tracking-tight">WARDROBE</h1>
          </div>
          <div className="flex items-center gap-1">
            {clothes.length > 0 && (
              <button 
                className="px-2.5 py-1.5 text-[12px] text-gray-500 hover:text-black transition-colors"
                onClick={() => setShowClearModal(true)}
              >
                清空
              </button>
            )}
            <button 
              className="px-2.5 py-1.5 text-[12px] text-gray-500 hover:text-black transition-colors"
              onClick={() => setShowGenerateModal(true)}
            >
              测试
            </button>
            <button 
              className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
              onClick={() => { setShowAdd(true); }}
            >
              <IconPlus size={16} />
            </button>
          </div>
        </div>
        <p className="text-[13px] text-gray-500 mt-1">共 {clothes.length} 件衣物</p>
      </section>

      {/* FILTERS */}
      <section className="max-w-lg mx-auto px-5 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          <select 
            value={filter.category} 
            onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value as ClothingCategory | '' }))}
            className="px-3 py-2 bg-white border border-[var(--color-border)] rounded text-[12px] text-gray-700 focus:outline-none focus:border-black whitespace-nowrap"
          >
            <option value="">款式</option>
            {CLOTHING_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={filter.color} 
            onChange={(e) => setFilter((f) => ({ ...f, color: e.target.value as ClothingColor | '' }))}
            className="px-3 py-2 bg-white border border-[var(--color-border)] rounded text-[12px] text-gray-700 focus:outline-none focus:border-black whitespace-nowrap"
          >
            <option value="">颜色</option>
            {CLOTHING_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={filter.thickness} 
            onChange={(e) => setFilter((f) => ({ ...f, thickness: e.target.value as ClothingThickness | '' }))}
            className="px-3 py-2 bg-white border border-[var(--color-border)] rounded text-[12px] text-gray-700 focus:outline-none focus:border-black whitespace-nowrap"
          >
            <option value="">厚薄</option>
            {CLOTHING_THICKNESSES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            value={filter.style} 
            onChange={(e) => setFilter((f) => ({ ...f, style: e.target.value as ClothingStyle | '' }))}
            className="px-3 py-2 bg-white border border-[var(--color-border)] rounded text-[12px] text-gray-700 focus:outline-none focus:border-black whitespace-nowrap"
          >
            <option value="">风格</option>
            {CLOTHING_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {hasActiveFilter && (
            <button 
              className="px-3 py-2 text-[12px] text-gray-500 hover:text-black whitespace-nowrap"
              onClick={() => setFilter({ category: '', color: '', thickness: '', style: '', pattern: '', scene: '', season: '' })}
            >
              清除
            </button>
          )}
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-lg mx-auto px-5">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-[13px]">加载中...</p>
          </div>
        ) : filteredClothes.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
              <IconPlus size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-600 mb-1 text-[13px]">{hasActiveFilter ? '没有符合条件的衣物' : '衣橱还是空的'}</p>
            <p className="text-[12px] text-gray-400">点击右上角添加第一件衣物</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredClothes.map((item) => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-gray-400 transition-colors">
                <div className="aspect-[3/4] bg-gray-50 relative">
                  {item.image ? (
                    <img src={item.image} alt={item.category} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-[11px]">
                      {item.category}
                    </div>
                  )}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1">
                    <span 
                      className="px-1.5 py-0.5 text-[9px] font-medium rounded"
                      style={{ 
                        backgroundColor: COLOR_HEX_MAP[item.color], 
                        color: item.color === '白' || item.color === '黄' ? '#333' : '#fff' 
                      }}
                    >
                      {item.color}
                    </span>
                    <span className="px-1.5 py-0.5 bg-white/90 text-gray-700 text-[9px] font-medium rounded">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="text-[11px] text-gray-500 mb-1.5">{item.style}</div>
                  <div className="flex gap-1 flex-wrap">
                    {item.scene.slice(0, 2).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[9px] rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-2.5 pt-2.5 border-t border-[var(--color-border)]">
                    <button 
                      className="flex-1 py-1.5 text-[11px] text-gray-500 hover:text-black transition-colors"
                      onClick={() => startEdit(item)}
                    >
                      编辑
                    </button>
                    <div className="w-px bg-[var(--color-border)]"></div>
                    <button 
                      className="flex-1 py-1.5 text-[11px] text-gray-500 hover:text-black transition-colors"
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center pb-20">
          <div className="bg-white w-full max-w-lg rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-[var(--color-border)] px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-black">{editItem ? '编辑衣物' : '添加衣物'}</h2>
              <button className="p-1 text-gray-400 hover:text-black" onClick={resetForm}>
                <IconClose size={18} />
              </button>
            </div>
            <div className="px-5 py-5 space-y-5 pb-6">
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-2">衣物照片（可选）</label>
                <div 
                  className="aspect-[4/3] border border-dashed border-[var(--color-border)] rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
                  onClick={() => fileRef.current?.click()}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="预览" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[13px] text-gray-400">点击上传照片</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {previewImage && (
                  <button
                    className="w-full mt-2 px-4 py-2 bg-gray-50 text-gray-700 text-[12px] rounded-lg hover:bg-gray-100 transition-colors border border-[var(--color-border)]"
                    onClick={handleRemoveBackground}
                    disabled={removingBg}
                  >
                    {removingBg ? '正在抠图中...' : '去除背景'}
                  </button>
                )}
              </div>

              {!editItem && (
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">智能识色</label>
                  <button 
                    className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-[12px] rounded-lg hover:bg-gray-100 transition-colors border border-[var(--color-border)]"
                    onClick={() => startScan()}
                    disabled={scanning}
                  >
                    拍照/截图识色
                  </button>
                  <input ref={scanFileRef} type="file" accept="image/*" onChange={handleScanFile} className="hidden" />
                </div>
              )}

              {scanning && <p className="text-[12px] text-gray-500 text-center py-2">正在识别中...</p>}

              {extractedColors.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-[var(--color-border)]">
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">提取的颜色</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {extractedColors.map((rgb, i) => {
                      const hex = rgbToHex(rgb);
                      const closest = findClosestColorName(rgb);
                      const textColor = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 128 ? '#333' : '#fff';
                      return (
                        <button 
                          key={i} 
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white transition-colors border border-[var(--color-border)]"
                          onClick={() => setForm((f) => ({ ...f, color: closest.name }))}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-[9px]"
                            style={{ backgroundColor: hex, color: textColor }}
                          >
                            {hex}
                          </div>
                          <span className="text-[10px] text-gray-500">{closest.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {harmonyResult && (
                    <div className="pt-3 border-t border-[var(--color-border)]">
                      <div className="text-[12px] font-medium" style={{ color: harmonyResult.score >= 70 ? '#22c55e' : harmonyResult.score >= 50 ? '#eab308' : '#ef4444' }}>
                        搭配和谐度: {harmonyResult.score}分
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">{harmonyResult.description}</div>
                    </div>
                  )}
                </div>
              )}

              {!editItem && (
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">淘宝商品描述（可选）</label>
                  <textarea
                    className="w-full px-3 py-2.5 bg-gray-50 border border-[var(--color-border)] rounded-lg text-[13px] text-black focus:outline-none focus:border-black focus:bg-white resize-none"
                    value={taobaoText}
                    onChange={(e) => setTaobaoText(e.target.value)}
                    placeholder="粘贴淘宝商品标题或描述文字"
                    rows={3}
                  />
                  <button
                    className="w-full mt-2 px-4 py-2 bg-gray-50 text-gray-700 text-[12px] rounded-lg hover:bg-gray-100 transition-colors border border-[var(--color-border)] disabled:opacity-50"
                    onClick={handleTaobaoTextParse}
                    disabled={!taobaoText.trim()}
                  >
                    智能识别标签
                  </button>
                </div>
              )}

              {(['category', 'color', 'thickness', 'style', 'pattern'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">
                    {{ category: '款式', color: '颜色', thickness: '厚薄', style: '风格', pattern: '图案' }[field]}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {field === 'color' ? (
                      CLOTHING_COLORS.map((c) => (
                        <button
                          key={c}
                          className={`px-3 py-1.5 text-[12px] rounded-lg transition-colors ${
                            form.color === c 
                              ? 'bg-black text-white' 
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-[var(--color-border)]'
                          }`}
                          onClick={() => setForm((f) => ({ ...f, color: c }))}
                        >
                          <span className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle" style={{ backgroundColor: COLOR_HEX_MAP[c] }} />
                          {c}
                        </button>
                      ))
                    ) : (
                      (field === 'category' ? CLOTHING_CATEGORIES :
                       field === 'thickness' ? CLOTHING_THICKNESSES :
                       field === 'style' ? CLOTHING_STYLES :
                       CLOTHING_PATTERNS).map((option) => (
                        <button
                          key={option}
                          className={`px-3 py-1.5 text-[12px] rounded-lg transition-colors ${
                            form[field] === option 
                              ? 'bg-black text-white' 
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-[var(--color-border)]'
                          }`}
                          onClick={() => setForm((f) => ({ ...f, [field]: option }))}
                        >
                          {option}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-2">场景（多选）</label>
                <div className="flex flex-wrap gap-2">
                  {CLOTHING_SCENES.map((s) => (
                    <button
                      key={s}
                      className={`px-3 py-1.5 text-[12px] rounded-lg transition-colors ${
                        form.scene.includes(s) 
                          ? 'bg-black text-white' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-[var(--color-border)]'
                      }`}
                      onClick={() => toggleScene(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-2">季节（多选）</label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((s) => (
                    <button
                      key={s}
                      className={`px-3 py-1.5 text-[12px] rounded-lg transition-colors ${
                        form.season.includes(s) 
                          ? 'bg-black text-white' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-[var(--color-border)]'
                      }`}
                      onClick={() => toggleSeason(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-[var(--color-border)] px-5 py-4 flex gap-2">
              <button className="flex-1 px-4 py-2.5 text-gray-600 text-[13px] rounded-lg hover:bg-gray-50 transition-colors border border-[var(--color-border)]" onClick={resetForm}>
                取消
              </button>
              <button className="flex-1 px-4 py-2.5 bg-black text-white text-[13px] rounded-lg hover:bg-gray-800 transition-colors" onClick={handleSave}>
                {editItem ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE MODAL */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 border border-[var(--color-border)]">
            <h3 className="text-base font-semibold text-black mb-2">生成测试衣物</h3>
            <p className="text-[12px] text-gray-500 mb-4">确定要生成测试衣物吗？将生成 30 件不同款式的衣物数据。</p>
            <div className="flex gap-2">
              <button 
                className="flex-1 px-4 py-2.5 text-gray-600 text-[13px] rounded-lg hover:bg-gray-50 transition-colors border border-[var(--color-border)]"
                onClick={() => setShowGenerateModal(false)}
              >
                取消
              </button>
              <button 
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-[13px] rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => handleGenerateTestClothes('append')}
              >
                追加
              </button>
              <button 
                className="flex-1 px-4 py-2.5 bg-black text-white text-[13px] rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => handleGenerateTestClothes('replace')}
              >
                覆盖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 border border-[var(--color-border)]">
            <h3 className="text-base font-semibold text-black mb-2">清空衣橱</h3>
            <p className="text-[12px] text-gray-500 mb-4">确定要删除衣橱中的所有衣物吗？此操作不可撤销。</p>
            <div className="flex gap-2">
              <button 
                className="flex-1 px-4 py-2.5 text-gray-600 text-[13px] rounded-lg hover:bg-gray-50 transition-colors border border-[var(--color-border)]"
                onClick={() => setShowClearModal(false)}
              >
                取消
              </button>
              <button 
                className="flex-1 px-4 py-2.5 bg-black text-white text-[13px] rounded-lg hover:bg-gray-800 transition-colors"
                onClick={handleClearAllClothes}
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
