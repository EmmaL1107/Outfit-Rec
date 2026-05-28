import { useState, useEffect, useRef } from 'react';
import type { ClothingItem, CalendarEvent, WeatherData, OutfitSuggestion } from '../types';
import { COLOR_HEX_MAP } from '../types';
import { clothingDB, eventDB, settingsDB } from '../store/db';
import { fetchWeather, getDressingIndex, getSeasonFromMonth, isWeekend } from '../utils/weather';
import { generateOutfits, replaceOutfitItem } from '../utils/outfit';
import { addToBlacklist, addOutfitCombination, addLikedColorScheme, addLikedStyleCombo, addDislikedColorScheme, addDislikedStyleCombo } from '../store/preference';
import {
  IconSun,
  IconCloudSun,
  IconCloud,
  IconRain,
  IconSnow,
  IconDroplet,
  IconWind,
  IconLocation,
  IconLeaf,
  IconCoat,
  IconRefresh,
  IconEvent,
  IconBriefcase,
  IconRunning,
  IconSparkle,
  IconShirt,
  IconLocate,
  IconCheck,
  IconClose,
  IconThumbsUp,
  IconThumbsDown,
  IconRefreshCw,
} from '../components/Icons';


function WeatherIcon({ condition }: { condition: string }) {
  const props = { size: 42, color: '#fff' };
  switch (condition) {
    case '晴': return <IconSun {...props} />;
    case '多云': return <IconCloudSun {...props} />;
    case '阴': return <IconCloud {...props} />;
    case '雨': return <IconRain {...props} />;
    case '雪': return <IconSnow {...props} />;
    default: return <IconCloudSun {...props} />;
  }
}

function DressCodeIcon({ code }: { code: string }) {
  const props = { size: 16, color: 'currentColor' };
  switch (code) {
    case '正式': return <IconBriefcase {...props} />;
    case '运动': return <IconRunning {...props} />;
    case '简约': return <IconSparkle {...props} />;
    default: return <IconShirt {...props} />;
  }
}

interface OutfitCardProps {
  outfit: OutfitSuggestion;
  index: number;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onReplace: (part: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'hat' | 'accessory') => void;
  liked: boolean;
  disliked: boolean;
  replacingPart: string | null;
}

function OutfitCard({ outfit, index, onLike, onDislike, onReplace, liked, disliked, replacingPart }: OutfitCardProps) {
  const items: { item: ClothingItem; label: string; part: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'hat' | 'accessory' }[] = [];
  if (outfit.top) items.push({ item: outfit.top, label: '上衣', part: 'top' });
  if (outfit.bottom) items.push({ item: outfit.bottom, label: '下装', part: 'bottom' });
  if (outfit.outerwear) items.push({ item: outfit.outerwear, label: '外套', part: 'outerwear' });
  if (outfit.hat) items.push({ item: outfit.hat, label: '帽子', part: 'hat' });
  if (outfit.shoes) items.push({ item: outfit.shoes, label: '鞋子', part: 'shoes' });
  if (outfit.accessory) items.push({ item: outfit.accessory, label: '配饰', part: 'accessory' });

  return (
    <div className="outfit-card">
      <div className="outfit-card-header">
        <span className="outfit-number">方案 {index + 1}</span>
        <span className="outfit-style-badge">{outfit.style}风格</span>
        {outfit.crossStyle && (
          <span className="outfit-style-badge cross">混搭</span>
        )}
      </div>
      
      <div className="outfit-reason">{outfit.reason}</div>
      
      <div className="outfit-items-grid">
        {items.map(({ item, label, part }) => (
          <div key={item.id} className="outfit-item-card">
            <button 
              className={`replace-btn ${replacingPart === part ? 'loading' : ''}`}
              onClick={() => onReplace(part)}
              disabled={replacingPart !== null}
            >
              <IconRefreshCw size={12} />
            </button>
            <div className="outfit-item-label">{label}</div>
            <div className="outfit-item-image-wrapper">
              {item.image && <img src={item.image} alt={item.category} className="outfit-item-image" />}
            </div>
            <div className="outfit-item-info">
              <span className="tag tag-category">{item.category}</span>
              <span 
                className="tag" 
                style={{ 
                  backgroundColor: COLOR_HEX_MAP[item.color], 
                  color: item.color === '白' || item.color === '黄' ? '#333' : '#fff' 
                }}
              >
                {item.color}
              </span>
              <span className="tag tag-thickness">{item.thickness}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="outfit-card-actions">
        <button 
          className={`btn-action btn-like ${liked ? 'active' : ''}`}
          onClick={() => onLike(outfit.id)}
        >
          <IconThumbsUp size={18} color={liked ? '#c0616b' : 'var(--text-secondary)'} />
          <span>喜欢</span>
        </button>
        <button 
          className={`btn-action btn-dislike ${disliked ? 'active' : ''}`}
          onClick={() => onDislike(outfit.id)}
        >
          <IconThumbsDown size={18} color={disliked ? '#7a7189' : 'var(--text-secondary)'} />
          <span>不喜欢</span>
        </button>
      </div>
    </div>
  );
}

export default function TodayOutfit() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'success' | 'failed'>('detecting');
  const [editingCity, setEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [manualCity, setManualCity] = useState<string | null>(null);
  const [likedOutfits, setLikedOutfits] = useState<Set<string>>(new Set());
  const [dislikedOutfits, setDislikedOutfits] = useState<Set<string>>(new Set());
  const [replacingOutfitIndex, setReplacingOutfitIndex] = useState<number | null>(null);
  const [replacingPart, setReplacingPart] = useState<string | null>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingCity && cityInputRef.current) {
      cityInputRef.current.focus();
    }
  }, [editingCity]);

  async function loadData() {
    setLoading(true);
    setLocationStatus('detecting');

    const cityToUse = manualCity || undefined;
    const weatherData = await fetchWeather(cityToUse);

    setLocationStatus('failed');
    if (weatherData.city && weatherData.city !== '未知' && weatherData.city !== '上海') {
      setLocationStatus('success');
    }
    if (weatherData.temperature !== 22) {
      setLocationStatus('success');
    }

    setWeather(weatherData);

    const allClothes = await clothingDB.getAll();
    const allEvents = await eventDB.getAll();
    setEvents(allEvents);

    const suggestions = generateOutfits(allClothes, weatherData, allEvents);
    setOutfits(suggestions);
    setLoading(false);
  }

  async function handleCitySubmit() {
    if (!cityInput.trim()) {
      setEditingCity(false);
      return;
    }
    setManualCity(cityInput.trim());
    setEditingCity(false);
    await settingsDB.set('city', cityInput.trim());
    setLoading(true);
    setLocationStatus('detecting');

    const weatherData = await fetchWeather(cityInput.trim());
    setWeather(weatherData);
    setLocationStatus('success');

    const allClothes = await clothingDB.getAll();
    const allEvents = await eventDB.getAll();
    setEvents(allEvents);

    const suggestions = generateOutfits(allClothes, weatherData, allEvents);
    setOutfits(suggestions);
    setLoading(false);
  }

  async function handleResetToAuto() {
    setManualCity(null);
    setEditingCity(false);
    await settingsDB.set('city', 'auto');
    await loadData();
  }

  async function handleLike(id: string) {
    const outfit = outfits.find((o) => o.id === id);
    if (outfit) {
      const itemsToUpdate: ClothingItem[] = [];
      if (outfit.top) itemsToUpdate.push(outfit.top);
      if (outfit.bottom) itemsToUpdate.push(outfit.bottom);
      if (outfit.outerwear) itemsToUpdate.push(outfit.outerwear);
      if (outfit.hat) itemsToUpdate.push(outfit.hat);
      if (outfit.shoes) itemsToUpdate.push(outfit.shoes);
      if (outfit.accessory) itemsToUpdate.push(outfit.accessory);

      for (const item of itemsToUpdate) {
        item.preferenceScore = (item.preferenceScore || 0) + 1;
        await clothingDB.put(item);
      }

      const combinationKey = itemsToUpdate.map((i) => i.id).sort().join('-');
      addOutfitCombination(combinationKey);

      if (outfit.top && outfit.bottom) {
        const colorKey = [outfit.top.color, outfit.bottom.color].sort().join('+');
        addLikedColorScheme(colorKey);
        const styleKey = `${outfit.top.category}+${outfit.bottom.category}`;
        addLikedStyleCombo(styleKey);
      }
    }

    setLikedOutfits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setDislikedOutfits((d) => {
          const dNext = new Set(d);
          dNext.delete(id);
          return dNext;
        });
      }
      return next;
    });
  }

  async function handleDislike(id: string) {
    const outfit = outfits.find((o) => o.id === id);
    if (outfit) {
      const itemsToUpdate: ClothingItem[] = [];
      if (outfit.top) itemsToUpdate.push(outfit.top);
      if (outfit.bottom) itemsToUpdate.push(outfit.bottom);
      if (outfit.outerwear) itemsToUpdate.push(outfit.outerwear);
      if (outfit.hat) itemsToUpdate.push(outfit.hat);
      if (outfit.shoes) itemsToUpdate.push(outfit.shoes);
      if (outfit.accessory) itemsToUpdate.push(outfit.accessory);

      for (const item of itemsToUpdate) {
        item.preferenceScore = (item.preferenceScore || 0) - 1;
        await clothingDB.put(item);
        addToBlacklist(item.id, 7);
      }

      if (outfit.top && outfit.bottom) {
        const colorKey = [outfit.top.color, outfit.bottom.color].sort().join('+');
        addDislikedColorScheme(colorKey);
        const styleKey = `${outfit.top.category}+${outfit.bottom.category}`;
        addDislikedStyleCombo(styleKey);
      }
    }

    setDislikedOutfits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setLikedOutfits((l) => {
          const lNext = new Set(l);
          lNext.delete(id);
          return lNext;
        });
      }
      return next;
    });
  }

  async function handleReplace(index: number, part: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'hat' | 'accessory') {
    if (!weather) return;

    setReplacingOutfitIndex(index);
    setReplacingPart(part);

    const outfit = outfits[index];
    const allClothes = await clothingDB.getAll();
    
    const newOutfit = replaceOutfitItem(outfit, part, allClothes, weather);
    
    if (newOutfit) {
      setOutfits((prev) => {
        const next = [...prev];
        next[index] = newOutfit;
        return next;
      });
    }

    setReplacingOutfitIndex(null);
    setReplacingPart(null);
  }

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => e.date === today);
  const currentSeason = getSeasonFromMonth();

  if (loading) {
    return (
      <div className="page today-page">
        <div className="empty-state">
          <div className="loading-indicator">
            <IconLocate size={24} color="var(--primary)" className="pulse-icon" />
          </div>
          <p>正在定位并获取天气...</p>
          <p className="hint">首次使用时，浏览器会请求位置权限</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page today-page">
      <div className="page-header">
        <h1>今日穿搭</h1>
        <button className="btn btn-ghost" onClick={loadData}>
          <IconRefresh size={16} /> 刷新
        </button>
      </div>

      {weather && (
        <div className="weather-card">
          <div className="weather-main">
            <span className="weather-icon">
              <WeatherIcon condition={weather.condition} />
            </span>
            <span className="weather-temp">{weather.temperature}°C</span>
            <span className="weather-condition">{weather.condition}</span>
            <span className="weather-temp-range">{weather.tempMin}°~{weather.tempMax}°</span>
          </div>
          <div className="weather-details">
            <span className="weather-detail-item">
              <IconDroplet size={14} color="rgba(255,255,255,0.85)" /> 湿度 {weather.humidity}%
            </span>
            <span className="weather-detail-item">
              <IconWind size={14} color="rgba(255,255,255,0.85)" /> 风速 {weather.windSpeed}km/h
            </span>
            <span
              className="weather-detail-item city-display"
              onClick={() => {
                setCityInput(weather.city);
                setEditingCity(true);
              }}
            >
              <IconLocation size={14} color="rgba(255,255,255,0.85)" /> {weather.city}
              <span className="city-edit-hint">点击修改</span>
            </span>
            <span className="weather-detail-item">
              <IconLeaf size={14} color="rgba(255,255,255,0.85)" /> {currentSeason}季
            </span>
            <span className="weather-detail-item day-type-badge">
              {isWeekend() ? '休息日' : '工作日'}
            </span>
          </div>
          <div className="dressing-index">
            <IconCoat size={16} color="rgba(255,255,255,0.9)" /> {getDressingIndex(weather)}
          </div>

          {editingCity && (
            <div className="city-edit-bar">
              <input
                ref={cityInputRef}
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCitySubmit();
                  if (e.key === 'Escape') setEditingCity(false);
                }}
                placeholder="输入城市名（英文/拼音，如 Shanghai, Guangzhou）"
                className="city-input"
              />
              <button className="btn btn-sm city-confirm" onClick={handleCitySubmit}>
                <IconCheck size={14} color="#fff" />
              </button>
              <button className="btn btn-sm city-cancel" onClick={() => setEditingCity(false)}>
                <IconClose size={14} />
              </button>
            </div>
          )}

          {locationStatus === 'failed' && !editingCity && (
            <div className="location-warning" onClick={() => {
              setCityInput('');
              setEditingCity(true);
            }}>
              <IconLocate size={14} color="rgba(255,255,255,0.9)" />
              定位可能不准确，点击此处手动输入城市名
            </div>
          )}

          {manualCity && !editingCity && (
            <div className="location-warning auto-reset" onClick={handleResetToAuto}>
              <IconLocate size={14} color="rgba(255,255,255,0.9)" />
              当前使用手动城市「{manualCity}」，点击恢复自动定位
            </div>
          )}
        </div>
      )}

      {todayEvents.length > 0 && (
        <div className="today-events">
          <h3><IconEvent size={18} color="var(--primary)" /> 今日事件</h3>
          {todayEvents.map((event) => (
            <div key={event.id} className="event-badge">
              <span className="event-title">{event.title}</span>
              <span className="event-dress-code">
                <DressCodeIcon code={event.dressCode} /> {event.dressCode}
              </span>
            </div>
          ))}
        </div>
      )}

      {outfits.length === 0 ? (
        <div className="empty-state">
          <p>暂无穿搭方案</p>
          <p className="hint">请先在「我的衣橱」中添加衣物，确保有上衣和下装</p>
        </div>
      ) : (
        <div className="outfit-cards-container">
          <div className="outfit-section-header">
            <h2>今日推荐穿搭</h2>
            <span className="outfit-count">共 {outfits.length} 套方案</span>
          </div>
          <div className="outfit-cards-grid">
            {outfits.map((outfit, index) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                index={index}
                onLike={handleLike}
                onDislike={handleDislike}
                onReplace={(part) => handleReplace(index, part)}
                liked={likedOutfits.has(outfit.id)}
                disliked={dislikedOutfits.has(outfit.id)}
                replacingPart={replacingOutfitIndex === index ? replacingPart : null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}