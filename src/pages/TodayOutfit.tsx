import { useState, useEffect, useRef } from 'react';
import type { ClothingItem, CalendarEvent, WeatherData, OutfitSuggestion } from '../types';
import { COLOR_HEX_MAP } from '../types';
import { clothingDB, eventDB, settingsDB } from '../store/db';
import { fetchWeather, getDressingIndex, getSeasonFromMonth, isWeekend } from '../utils/weather';
import { generateOutfits } from '../utils/outfit';
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

export default function TodayOutfit() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'success' | 'failed'>('detecting');
  const [editingCity, setEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [manualCity, setManualCity] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<number>(0);
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
        <div className="outfit-section">
          <div className="outfit-tabs">
            {outfits.map((_, i) => (
              <button
                key={i}
                className={`outfit-tab ${selectedOutfit === i ? 'active' : ''}`}
                onClick={() => setSelectedOutfit(i)}
              >
                方案 {i + 1}
              </button>
            ))}
          </div>

          {outfits[selectedOutfit] && (
            <div className="outfit-display">
              <div className="outfit-reason">{outfits[selectedOutfit].reason}</div>
              <div className="outfit-style-badges">
                <span className="outfit-style-badge">{outfits[selectedOutfit].style}风格</span>
                {outfits[selectedOutfit].crossStyle && (
                  <span className="outfit-style-badge cross">混搭</span>
                )}
              </div>
              <div className="outfit-items">
                {renderClothingCard(outfits[selectedOutfit].top, '上衣')}
                {renderClothingCard(outfits[selectedOutfit].bottom, '下装')}
                {outfits[selectedOutfit].outerwear && renderClothingCard(outfits[selectedOutfit].outerwear, '外套')}
                {outfits[selectedOutfit].hat && renderClothingCard(outfits[selectedOutfit].hat, '帽子')}
                {outfits[selectedOutfit].shoes && renderClothingCard(outfits[selectedOutfit].shoes, '鞋子')}
                {outfits[selectedOutfit].accessory && renderClothingCard(outfits[selectedOutfit].accessory, '配饰')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderClothingCard(item: ClothingItem | undefined, label: string) {
  if (!item) return null;
  return (
    <div className="outfit-item">
      <div className="outfit-item-label">{label}</div>
      <div className="outfit-item-image">
        {item.image ? (
          <img src={item.image} alt={item.category} />
        ) : (
          <div className="no-image-placeholder">
            <span>{item.category}</span>
          </div>
        )}
      </div>
      <div className="outfit-item-info">
        <span className="tag tag-category">{item.category}</span>
        <span className="tag" style={{ backgroundColor: COLOR_HEX_MAP[item.color], color: item.color === '白' || item.color === '黄' ? '#333' : '#fff' }}>{item.color}</span>
        <span className="tag tag-thickness">{item.thickness}</span>
        {item.pattern && item.pattern !== '纯色' && (
          <span className="tag tag-pattern">{item.pattern}</span>
        )}
      </div>
    </div>
  );
}
