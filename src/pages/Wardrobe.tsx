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
import { IconPlus, IconClose, IconRefreshCw } from '../components/Icons';

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
    <div className="page wardrobe-page">
      <div className="page-header">
        <h1>我的衣橱</h1>
        <div className="header-actions">
          {clothes.length > 0 && (
            <button className="btn btn-danger" onClick={() => setShowClearModal(true)}>
              <IconClose size={14} /> 清空衣橱
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setShowGenerateModal(true)}>
            <IconRefreshCw size={16} /> 生成测试衣物
          </button>
          <button className="btn btn-primary" onClick={() => { setShowAdd(true); }}>
            <IconPlus size={16} color="#fff" /> 添加衣物
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <select value={filter.category} onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value as ClothingCategory | '' }))}>
          <option value="">款式</option>
          {CLOTHING_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filter.color} onChange={(e) => setFilter((f) => ({ ...f, color: e.target.value as ClothingColor | '' }))}>
          <option value="">颜色</option>
          {CLOTHING_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filter.thickness} onChange={(e) => setFilter((f) => ({ ...f, thickness: e.target.value as ClothingThickness | '' }))}>
          <option value="">厚薄</option>
          {CLOTHING_THICKNESSES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filter.style} onChange={(e) => setFilter((f) => ({ ...f, style: e.target.value as ClothingStyle | '' }))}>
          <option value="">风格</option>
          {CLOTHING_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.pattern} onChange={(e) => setFilter((f) => ({ ...f, pattern: e.target.value as ClothingPattern | '' }))}>
          <option value="">图案</option>
          {CLOTHING_PATTERNS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filter.scene} onChange={(e) => setFilter((f) => ({ ...f, scene: e.target.value as ClothingScene | '' }))}>
          <option value="">场景</option>
          {CLOTHING_SCENES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filter.season} onChange={(e) => setFilter((f) => ({ ...f, season: e.target.value as Season | '' }))}>
          <option value="">季节</option>
          {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasActiveFilter && (
          <button className="btn btn-ghost" onClick={() => setFilter({ category: '', color: '', thickness: '', style: '', pattern: '', scene: '', season: '' })}>清除</button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">加载中...</div>
      ) : filteredClothes.length === 0 ? (
        <div className="empty-state">{hasActiveFilter ? '没有符合条件的衣物' : '衣橱还是空的，快添加第一件衣物吧！'}</div>
      ) : (
        <div className="clothes-grid">
          {filteredClothes.map((item) => (
            <div key={item.id} className="clothing-card">
              <div className="clothing-image">{item.image && <img src={item.image} alt={item.category} />}</div>
              <div className="clothing-info">
                <div className="clothing-tags">
                  <span className="tag tag-category">{item.category}</span>
                  <span className="tag" style={{ backgroundColor: COLOR_HEX_MAP[item.color], color: item.color === '白' || item.color === '黄' ? '#333' : '#fff' }}>{item.color}</span>
                  <span className="tag tag-thickness">{item.thickness}</span>
                  <span className="tag tag-style">{item.style}</span>
                  {(item.pattern && item.pattern !== '纯色') && <span className="tag tag-pattern">{item.pattern}</span>}
                </div>
                <div className="clothing-tags secondary">
                  {item.scene.map((s) => <span key={s} className="tag tag-scene">{s}</span>)}
                  {item.season.map((s) => <span key={s} className="tag tag-season">{s}</span>)}
                </div>
                <div className="clothing-actions">
                  <button className="btn btn-sm" onClick={() => startEdit(item)}>编辑</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? '编辑衣物' : '添加衣物'}</h2>
              <button className="btn-close" onClick={resetForm}><IconClose size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>衣物照片（可选）</label>
                <div className="upload-area" onClick={() => fileRef.current?.click()}>
                  {previewImage ? (
                    <img src={previewImage} alt="预览" className="preview-image" />
                  ) : (
                    <div className="upload-placeholder">点击上传照片（可选）</div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {previewImage && (
                  <button
                    className="btn btn-secondary"
                    onClick={handleRemoveBackground}
                    disabled={removingBg}
                    style={{ marginTop: 8, width: '100%' }}
                  >
                    {removingBg ? '正在抠图中...' : '✂️ 自动抠图（去除背景）'}
                  </button>
                )}
              </div>

              {!editItem && (
                <div className="scan-section">
                  <label>智能识色</label>
                  <div className="scan-buttons">
                    <button className="btn btn-secondary scan-btn" onClick={() => startScan()} disabled={scanning}>
                      📷 拍照/截图识色
                    </button>
                  </div>
                  <p className="form-hint">上传衣服照片或商品截图，自动提取颜色</p>
                  <input ref={scanFileRef} type="file" accept="image/*" onChange={handleScanFile} style={{ display: 'none' }} />
                </div>
              )}

              {scanning && <div className="scan-loading">正在识别中...</div>}

              {extractedColors.length > 0 && (
                <div className="color-extraction-result">
                  <label>提取的颜色</label>
                  <div className="extracted-colors">
                    {extractedColors.map((rgb, i) => {
                      const hex = rgbToHex(rgb);
                      const closest = findClosestColorName(rgb);
                      const textColor = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 128 ? '#333' : '#fff';
                      return (
                        <div key={i} className="extracted-color-item" onClick={() => setForm((f) => ({ ...f, color: closest.name }))}>
                          <div className="color-swatch" style={{ backgroundColor: hex }}>
                            <span style={{ color: textColor, fontSize: 10 }}>{hex}</span>
                          </div>
                          <span className="color-label">{closest.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  {harmonyResult && (
                    <div className="harmony-result">
                      <div className="harmony-score" style={{ color: harmonyResult.score >= 70 ? 'var(--success)' : harmonyResult.score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                        搭配和谐度: {harmonyResult.score}分
                      </div>
                      <div className="harmony-desc">{harmonyResult.description}</div>
                    </div>
                  )}
                </div>
              )}

              {!editItem && (
                <div className="taobao-text-section">
                  <label>淘宝商品描述（可选）</label>
                  <textarea
                    className="taobao-text-input"
                    value={taobaoText}
                    onChange={(e) => setTaobaoText(e.target.value)}
                    placeholder="粘贴淘宝商品标题或描述文字，如：&#10;2024新款法式复古碎花连衣裙女夏&#10;自动识别款式、颜色、风格等标签"
                    rows={3}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={handleTaobaoTextParse}
                    disabled={!taobaoText.trim()}
                    style={{ marginTop: 6, width: '100%' }}
                  >
                    智能识别标签
                  </button>
                  <p className="form-hint">从淘宝 App 复制商品标题，粘贴到这里自动匹配标签</p>
                </div>
              )}

              <div className="form-group">
                <label>款式</label>
                <div className="tag-selector">
                  {CLOTHING_CATEGORIES.map((c) => (
                    <button key={c} className={`tag-btn ${form.category === c ? 'active' : ''}`} onClick={() => setForm((f) => ({ ...f, category: c }))}>{c}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>颜色</label>
                <div className="tag-selector colors">
                  {CLOTHING_COLORS.map((c) => (
                    <button key={c} className={`tag-btn color-btn ${form.color === c ? 'active' : ''}`} style={{ '--btn-color': COLOR_HEX_MAP[c] } as React.CSSProperties} onClick={() => setForm((f) => ({ ...f, color: c }))}>
                      <span className="color-dot" style={{ backgroundColor: COLOR_HEX_MAP[c] }} />{c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>厚薄</label>
                <div className="tag-selector">
                  {CLOTHING_THICKNESSES.map((t) => (
                    <button key={t} className={`tag-btn ${form.thickness === t ? 'active' : ''}`} onClick={() => setForm((f) => ({ ...f, thickness: t }))}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>风格</label>
                <div className="tag-selector">
                  {CLOTHING_STYLES.map((s) => (
                    <button key={s} className={`tag-btn ${form.style === s ? 'active' : ''}`} onClick={() => setForm((f) => ({ ...f, style: s }))}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>图案</label>
                <div className="tag-selector">
                  {CLOTHING_PATTERNS.map((p) => (
                    <button key={p} className={`tag-btn ${form.pattern === p ? 'active' : ''}`} onClick={() => setForm((f) => ({ ...f, pattern: p }))}>{p}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>场景（多选）</label>
                <div className="tag-selector">
                  {CLOTHING_SCENES.map((s) => (
                    <button key={s} className={`tag-btn ${form.scene.includes(s) ? 'active' : ''}`} onClick={() => toggleScene(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>季节（多选）</label>
                <div className="tag-selector">
                  {SEASONS.map((s) => (
                    <button key={s} className={`tag-btn ${form.season.includes(s) ? 'active' : ''}`} onClick={() => toggleSeason(s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={resetForm}>取消</button>
              <button className="btn btn-primary" onClick={handleSave}>{editItem ? '保存修改' : '添加'}</button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>生成测试衣物</h2>
              <button className="modal-close" onClick={() => setShowGenerateModal(false)}><IconClose size={20} /></button>
            </div>
            <div className="modal-body">
              <p>确定要生成测试衣物吗？</p>
              <p className="hint">将生成 30 件不同款式的衣物数据。</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowGenerateModal(false)}>取消</button>
              <button className="btn btn-secondary" onClick={() => handleGenerateTestClothes('append')}>追加到现有</button>
              <button className="btn btn-primary" onClick={() => handleGenerateTestClothes('replace')}>覆盖现有数据</button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>清空衣橱</h2>
              <button className="modal-close" onClick={() => setShowClearModal(false)}><IconClose size={20} /></button>
            </div>
            <div className="modal-body">
              <p>确定要删除衣橱中的所有衣物吗？</p>
              <p className="hint">此操作不可撤销，所有衣物数据将被永久删除。</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowClearModal(false)}>取消</button>
              <button className="btn btn-danger" onClick={handleClearAllClothes}>确认清空</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
