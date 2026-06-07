import { useState, useEffect, useRef } from 'react';
import type { ClothingItem, CalendarEvent, WeatherData, OutfitSuggestion } from '../types';
import { COLOR_HEX_MAP } from '../types';
import { clothingDB, eventDB, settingsDB } from '../store/db';
import { fetchWeather, getSeasonFromMonth } from '../utils/weather';
import { generateOutfits, replaceOutfitItem } from '../utils/outfit';
import { 
  addToBlacklist, 
  addOutfitCombination, 
  addLikedColorScheme, 
  addLikedStyleCombo, 
  addDislikedColorScheme, 
  addDislikedStyleCombo 
} from '../store/preference';
import {
  IconSun,
  IconCloudSun,
  IconCloud,
  IconRain,
  IconSnow,
  IconLocation,
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
  const props = { size: 24, color: '#111111' };
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
  const props = { size: 14, color: '#666666' };
  switch (code) {
    case '正式': return <IconBriefcase {...props} />;
    case '运动': return <IconRunning {...props} />;
    case '简约': return <IconSparkle {...props} />;
    default: return <IconShirt {...props} />;
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'GOOD NIGHT';
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
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
    <div className="bg-white border border-[var(--color-border)] rounded-lg">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <span className="text-[11px] tracking-[0.2em] text-gray-500 font-medium">
          LOOK {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-medium rounded-full">
            {outfit.style}
          </span>
          {outfit.crossStyle && (
            <span className="px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-full">
              混搭
            </span>
          )}
        </div>
      </div>
      
      <p className="px-5 text-[13px] text-gray-500 mb-5 leading-relaxed">{outfit.reason}</p>
      
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {items.map(({ item, label, part }) => (
            <div key={item.id} className="text-center relative group">
              <button 
                className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                onClick={() => onReplace(part)}
                disabled={replacingPart !== null}
              >
                <IconRefreshCw size={10} className="text-gray-500" />
              </button>
              <div className="text-[10px] text-gray-400 mb-1.5 tracking-wide">{label}</div>
              <div className="aspect-[3/4] bg-gray-50 rounded overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.category} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                    {item.category}
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-1 mt-2 flex-wrap">
                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-600 text-[9px] font-medium rounded">
                  {item.category}
                </span>
                <span 
                  className="px-1.5 py-0.5 text-[9px] font-medium rounded"
                  style={{ 
                    backgroundColor: COLOR_HEX_MAP[item.color], 
                    color: item.color === '白' || item.color === '黄' ? '#333' : '#fff' 
                  }}
                >
                  {item.color}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-8 pt-4 pb-5 border-t border-[var(--color-border)]">
        <button 
          className={`flex items-center gap-2 text-[13px] font-medium transition-all duration-200 ${
            liked 
              ? 'text-black' 
              : 'text-gray-500 hover:text-black'
          }`}
          onClick={() => onLike(outfit.id)}
        >
          <IconThumbsUp size={15} />
          <span>喜欢</span>
        </button>
        <button 
          className={`flex items-center gap-2 text-[13px] font-medium transition-all duration-200 ${
            disliked 
              ? 'text-black' 
              : 'text-gray-500 hover:text-black'
          }`}
          onClick={() => onDislike(outfit.id)}
        >
          <IconThumbsDown size={15} />
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

    const cityToUse = manualCity || undefined;
    const weatherData = await fetchWeather(cityToUse);

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

    const weatherData = await fetchWeather(cityInput.trim());
    setWeather(weatherData);

    const allClothes = await clothingDB.getAll();
    const allEvents = await eventDB.getAll();
    setEvents(allEvents);

    const suggestions = generateOutfits(allClothes, weatherData, allEvents);
    setOutfits(suggestions);
    setLoading(false);
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
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <IconLocate size={32} className="mx-auto mb-3 text-gray-400 animate-pulse" />
          <p className="text-gray-500 text-sm">正在获取天气和穿搭建议...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* HERO SECTION */}
      <section className="max-w-lg mx-auto px-5 pt-10 pb-8">
        {/* Greeting */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-gray-500 mb-2">{getGreeting()}</p>
            <button 
              className="flex items-center gap-1 text-black hover:text-gray-600 transition-colors"
              onClick={loadData}
            >
              <IconRefresh size={14} />
            </button>
          </div>
        </div>

        {weather && (
          <div className="grid grid-cols-5 gap-5 mb-6">
            {/* LEFT: Large temperature */}
            <div className="col-span-2">
              <div className="text-[80px] leading-none font-light text-black tracking-tight mb-4">
                {weather.temperature}°
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                  <IconLocation size={13} />
                  <span>{weather.city}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                  <WeatherIcon condition={weather.condition} />
                  <span>{weather.condition}</span>
                </div>
                <div className="text-[13px] text-black mt-3 pt-3 border-t border-[var(--color-border)]">
                  炎热，建议穿薄款短袖短裤
                </div>
              </div>
            </div>

            {/* RIGHT: Weather details card */}
            <div className="col-span-3 border border-[var(--color-border)] rounded-lg p-5">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">湿度</span>
                  <span className="text-[13px] text-black font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">风速</span>
                  <span className="text-[13px] text-black font-medium">{weather.windSpeed}km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">季节</span>
                  <span className="text-[13px] text-black font-medium">{currentSeason}季</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">类型</span>
                  <span className="text-[13px] text-black font-medium">休息日</span>
                </div>
                <div className="col-span-2 flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
                  <span className="text-[11px] text-gray-400">最低 {weather.tempMin}°</span>
                  <span className="text-[11px] text-gray-400">最高 {weather.tempMax}°</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingCity && (
          <div className="flex items-center gap-2 mb-6">
            <input
              ref={cityInputRef}
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCitySubmit();
                if (e.key === 'Escape') setEditingCity(false);
              }}
              placeholder="输入城市名"
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-[var(--color-border)] rounded text-[13px] text-black focus:outline-none focus:border-black focus:bg-white transition-all"
            />
            <button 
              className="px-3 py-2.5 bg-black text-white text-[13px] rounded hover:bg-gray-800 transition-colors"
              onClick={handleCitySubmit}
            >
              <IconCheck size={14} />
            </button>
            <button 
              className="px-3 py-2.5 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setEditingCity(false)}
            >
              <IconClose size={14} />
            </button>
          </div>
        )}

        {/* Weather tip from clicking on city */}
        {weather && !editingCity && (
          <div className="text-[13px] text-gray-500">
            <span 
              className="cursor-pointer hover:text-black transition-colors"
              onClick={() => {
                setCityInput(weather.city);
                setEditingCity(true);
              }}
            >
              点击切换城市
            </span>
          </div>
        )}
      </section>

      {/* TODAY'S PICKS */}
      <section className="max-w-lg mx-auto px-5 pb-8">
        {todayEvents.length > 0 && (
          <div className="mb-8">
            <p className="text-[11px] tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
              <IconEvent size={12} />
              今日事件
            </p>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between px-5 py-3.5 border border-[var(--color-border)] rounded-lg">
                  <span className="text-[13px] text-black font-medium">{event.title}</span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] rounded-full">
                    <DressCodeIcon code={event.dressCode} />
                    <span>{event.dressCode}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {outfits.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-[var(--color-border)]">
              <IconShirt size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2 text-[13px]">暂无穿搭方案</p>
            <p className="text-[12px] text-gray-400">请先在「衣橱」中添加衣物，确保有上衣和下装</p>
          </div>
        ) : (
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[11px] tracking-[0.25em] text-gray-500 mb-1.5">TODAY'S</p>
                <h2 className="text-[28px] font-bold text-black tracking-tight">PICKS</h2>
              </div>
              <span className="text-[11px] text-gray-400">共 {outfits.length} 套</span>
            </div>
            <div className="space-y-4">
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
      </section>
    </div>
  );
}
